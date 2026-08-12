'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import type { ReactNode } from 'react';
import type {
  DocMetadata,
  DocRecord,
  DocSlot,
  EditorState,
  ExportPdfOptions,
  FitMode,
  ImageExportOptions,
  ImagePdfPageSize,
  ModalId,
  Overlay,
  ToolId,
  ViewMode,
} from './types';
import { MAX_HISTORY } from './types';
import { openPdfFile, PdfOpenError, friendlyOpenError } from './lib/pdfLoader';
import { exportDocument, ExportError } from './lib/exportDocument';
import { downloadBlob, makeId } from './lib/utils';
import { clamp } from './lib/geometry';
import { createBlankPdfBytes } from './lib/slotOps';

type Action =
  | { type: 'OPEN'; payload: { docs: Record<string, DocRecord>; slots: DocSlot[]; overlays: Overlay[]; fileName: string; fileSize: number; mainDocId: string; metadata: DocMetadata } }
  | { type: 'OPEN_ERROR'; payload: { title: string; message: string } }
  | { type: 'RESET' }
  | { type: 'SET_TOOL'; payload: ToolId }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_FIT_MODE'; payload: FitMode }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'SET_SELECTION'; payload: string[] }
  | { type: 'SET_FULLSCREEN'; payload: boolean }
  | { type: 'SET_MODAL'; payload: ModalId }
  | { type: 'SET_BUSY'; payload: { label: string | null; progress: number | null } }
  | { type: 'SET_SEARCH'; payload: Partial<EditorState['search']> }
  | { type: 'SHOW_TOAST'; payload: { message: string; kind: 'info' | 'warn' | 'error' } }
  | { type: 'HIDE_TOAST' }
  | { type: 'ADD_OVERLAYS'; payload: Overlay[] }
  | { type: 'UPDATE_OVERLAY'; payload: { id: string; patch: Partial<Overlay> } }
  | { type: 'UPDATE_OVERLAY_LIVE'; payload: { id: string; patch: Partial<Overlay> } }
  | { type: 'REMOVE_OVERLAYS'; payload: string[] }
  | { type: 'SET_OVERLAYS'; payload: Overlay[] }
  | { type: 'PUSH_HISTORY' }
  | { type: 'ADD_DOC'; payload: DocRecord }
  | { type: 'REORDER_SLOTS'; payload: { from: number; to: number } }
  | { type: 'DELETE_SLOTS'; payload: number[] }
  | { type: 'DUPLICATE_SLOT'; payload: number }
  | { type: 'ROTATE_SLOTS'; payload: { indices: number[]; delta: number } }
  | { type: 'ADD_SLOTS'; payload: { slots: DocSlot[]; atIndex: number } }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_METADATA'; payload: Partial<DocMetadata> };

const initialState: EditorState = {
  status: 'empty',
  error: null,
  docs: {},
  slots: [],
  overlays: [],
  fileName: '',
  fileSize: 0,
  mainDocId: 'main',
  metadata: { title: '', author: '', subject: '', keywords: '' },
  currentPage: 0,
  selection: [],
  tool: 'select',
  zoom: 1,
  fitMode: 'width',
  viewMode: 'continuous',
  isFullscreen: false,
  history: [],
  redoStack: [],
  isBusy: false,
  busyLabel: null,
  busyProgress: null,
  modal: null,
  search: { query: '', open: false, index: -1, total: 0, perPage: [], searching: false, rectsByPage: [] },
  toast: null,
  lastDocBytes: null,
};

type Snapshot = { slots: DocSlot[]; overlays: Overlay[] };

function snapshot(state: EditorState): Snapshot {
  return { slots: state.slots, overlays: state.overlays };
}

function pushHistory(state: EditorState): EditorState {
  const history = [...state.history, snapshot(state)];
  if (history.length > MAX_HISTORY) history.shift();
  return { ...state, history, redoStack: [] };
}

function shiftOverlayPages(overlays: Overlay[], fromIndex: number, delta: number): Overlay[] {
  return overlays.map((o) => (o.page >= fromIndex ? { ...o, page: o.page + delta } : o));
}

function reducer(state: EditorState, action: Action): EditorState {
  switch (action.type) {
    case 'OPEN': {
      const { docs, slots, overlays, fileName, fileSize, mainDocId, metadata } = action.payload;
      return {
        ...initialState,
        status: 'ready',
        docs,
        slots,
        overlays,
        fileName,
        fileSize,
        mainDocId,
        metadata,
        currentPage: 0,
        fitMode: 'width',
      };
    }
    case 'OPEN_ERROR':
      return { ...state, status: 'error', error: action.payload, docs: {}, slots: [], overlays: [] };
    case 'RESET':
      return { ...initialState };
    case 'SET_TOOL':
      return { ...state, tool: action.payload };
    case 'SET_ZOOM':
      return { ...state, zoom: Math.max(0.1, Math.min(8, action.payload)), fitMode: 'custom' };
    case 'SET_FIT_MODE':
      return { ...state, fitMode: action.payload };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: clamp(action.payload, 0, Math.max(0, state.slots.length - 1)) };
    case 'SET_SELECTION':
      return { ...state, selection: action.payload };
    case 'SET_FULLSCREEN':
      return { ...state, isFullscreen: action.payload };
    case 'SET_MODAL':
      return { ...state, modal: action.payload };
    case 'SET_BUSY':
      return { ...state, isBusy: action.payload.label !== null, busyLabel: action.payload.label, busyProgress: action.payload.progress };
    case 'SET_SEARCH':
      return { ...state, search: { ...state.search, ...action.payload } };
    case 'SHOW_TOAST':
      return { ...state, toast: { id: Date.now(), message: action.payload.message, kind: action.payload.kind } };
    case 'HIDE_TOAST':
      return { ...state, toast: null };
    case 'ADD_OVERLAYS':
      return pushHistory({ ...state, overlays: [...state.overlays, ...action.payload] });
    case 'UPDATE_OVERLAY':
      return pushHistory({
        ...state,
        overlays: state.overlays.map((o) => (o.id === action.payload.id ? { ...o, ...action.payload.patch } as Overlay : o)),
      });
    case 'UPDATE_OVERLAY_LIVE':
      return {
        ...state,
        overlays: state.overlays.map((o) => (o.id === action.payload.id ? { ...o, ...action.payload.patch } as Overlay : o)),
      };
    case 'REMOVE_OVERLAYS': {
      const ids = new Set(action.payload);
      return pushHistory({
        ...state,
        overlays: state.overlays.filter((o) => !ids.has(o.id)),
        selection: state.selection.filter((id) => !ids.has(id)),
      });
    }
    case 'SET_OVERLAYS':
      return pushHistory({ ...state, overlays: action.payload });
    case 'PUSH_HISTORY':
      return pushHistory(state);
    case 'ADD_DOC':
      return { ...state, docs: { ...state.docs, [action.payload.id]: action.payload } };
    case 'REORDER_SLOTS': {
      const { from, to } = action.payload;
      if (from === to || from < 0 || to < 0 || from >= state.slots.length || to >= state.slots.length) return state;
      const slots = [...state.slots];
      const [moved] = slots.splice(from, 1);
      slots.splice(to, 0, moved);
      const overlays = state.overlays.map((o) => {
        let page = o.page;
        if (page === from) page = to;
        else if (from < to && page > from && page <= to) page -= 1;
        else if (from > to && page < from && page >= to) page += 1;
        return page === o.page ? o : { ...o, page };
      });
      return pushHistory({ ...state, slots, overlays, currentPage: clamp(state.currentPage, 0, slots.length - 1) });
    }
    case 'DELETE_SLOTS': {
      const indices = new Set(action.payload);
      const slots = state.slots.filter((_, i) => !indices.has(i));
      if (slots.length === 0) return { ...state, status: 'empty', slots: [], overlays: [], docs: {}, selection: [], currentPage: 0 };
      const indexList = [...indices].sort((a, b) => a - b);
      const overlays = state.overlays.filter((o) => !indices.has(o.page)).map((o) => {
        let page = o.page;
        let shift = 0;
        for (const idx of indexList) {
          if (o.page > idx) shift -= 1;
        }
        page = o.page + shift;
        return page === o.page ? o : { ...o, page };
      });
      return pushHistory({
        ...state,
        slots,
        overlays,
        selection: state.selection.filter((id) => {
          const overlay = state.overlays.find((o) => o.id === id);
          return !overlay || !indices.has(overlay.page);
        }),
        currentPage: clamp(state.currentPage, 0, slots.length - 1),
      });
    }
    case 'DUPLICATE_SLOT': {
      const { payload: index } = action;
      const slot = state.slots[index];
      if (!slot) return state;
      const slots = [
        ...state.slots.slice(0, index + 1),
        { ...slot },
        ...state.slots.slice(index + 1),
      ];
      const overlays = state.overlays.map((o) => (o.page > index ? { ...o, page: o.page + 1 } : o));
      const pageOverlays = state.overlays.filter((o) => o.page === index).map((o) => ({
        ...o,
        id: makeId('ovl'),
        page: index + 1,
        x: o.x + 24,
        y: o.y + 24,
      }));
      return pushHistory({ ...state, slots, overlays: [...overlays, ...pageOverlays], selection: [] });
    }
    case 'ROTATE_SLOTS': {
      const indexSet = new Set(action.payload.indices);
      const delta = action.payload.delta;
      const slots = state.slots.map((slot, i) => {
        if (!indexSet.has(i)) return slot;
        const rotated = (slot.rotation + delta) % 360;
        return { ...slot, rotation: rotated, width: slot.height, height: slot.width };
      });
      return pushHistory({ ...state, slots });
    }
    case 'ADD_SLOTS': {
      const { slots, atIndex } = action.payload;
      const newSlots = [...state.slots.slice(0, atIndex), ...slots, ...state.slots.slice(atIndex)];
      const overlays = shiftOverlayPages(state.overlays, atIndex, slots.length);
      return pushHistory({
        ...state,
        status: newSlots.length > 0 ? 'ready' : state.status,
        slots: newSlots,
        overlays,
        mainDocId: state.mainDocId || slots[0]?.docId || 'main',
        currentPage: clamp(state.currentPage, 0, newSlots.length - 1),
      });
    }
    case 'UNDO': {
      if (state.history.length === 0) return state;
      const prev = state.history[state.history.length - 1];
      const history = state.history.slice(0, -1);
      const redoStack = [...state.redoStack, snapshot(state)];
      return {
        ...state,
        slots: prev.slots,
        overlays: prev.overlays,
        history,
        redoStack,
        selection: [],
        currentPage: clamp(state.currentPage, 0, prev.slots.length - 1),
      };
    }
    case 'REDO': {
      if (state.redoStack.length === 0) return state;
      const next = state.redoStack[state.redoStack.length - 1];
      const redoStack = state.redoStack.slice(0, -1);
      const history = [...state.history, snapshot(state)];
      return {
        ...state,
        slots: next.slots,
        overlays: next.overlays,
        history,
        redoStack,
        selection: [],
        currentPage: clamp(state.currentPage, 0, next.slots.length - 1),
      };
    }
    case 'SET_METADATA':
      return { ...state, metadata: { ...state.metadata, ...action.payload } };
    default:
      return state;
  }
}

let copyBuffer: Overlay[] = [];

interface EditorContextValue {
  state: EditorState;
  dispatch: (action: Action) => void;
  openFile: (file: File) => Promise<void>;
  openBytes: (bytes: ArrayBuffer, name: string) => Promise<void>;
  resetDocument: () => void;
  setTool: (tool: ToolId) => void;
  undo: () => void;
  redo: () => void;
  addOverlays: (overlays: Overlay[]) => void;
  updateOverlay: (id: string, patch: Partial<Overlay>) => void;
  updateOverlayLive: (id: string, patch: Partial<Overlay>) => void;
  removeOverlays: (ids: string[]) => void;
  setOverlays: (overlays: Overlay[]) => void;
  pushHistory: () => void;
  copySelection: () => void;
  pasteBuffer: () => void;
  duplicateSelection: () => void;
  deleteSelection: () => void;
  exportAndDownload: () => Promise<void>;
  saveCopy: () => Promise<void>;
  exportPdf: (options?: ExportPdfOptions) => Promise<void>;
  exportPagesAsImages: (options: ImageExportOptions) => Promise<void>;
  extractText: () => Promise<void>;
  printDocument: () => Promise<void>;
  createPdfFromImages: (files: File[], pageSize: ImagePdfPageSize) => Promise<void>;
  showToast: (message: string, kind?: 'info' | 'warn' | 'error') => void;
  insertDocIntoSlots: (bytes: ArrayBuffer, name: string, atIndex: number, from: number, to: number) => Promise<void>;
  addBlankPage: (width: number, height: number, atIndex: number) => Promise<void>;
  getPageDimensions: (index: number) => { width: number; height: number };
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const openFile = useCallback(async (file: File) => {
    dispatch({ type: 'SET_BUSY', payload: { label: 'Opening PDF…', progress: null } });
    try {
      const loaded = await openPdfFile(file);
      const existing = stateRef.current.docs;
      for (const key of Object.keys(existing)) {
        try {
          existing[key].pdf.loadingTask.destroy();
        } catch {
          // ignore
        }
      }
      const docs: Record<string, DocRecord> = { [loaded.doc.id]: loaded.doc };
      let metadata: DocMetadata = { title: '', author: '', subject: '', keywords: '' };
      try {
        const info = await loaded.doc.pdf.getMetadata();
        const meta = info.info as Record<string, unknown>;
        metadata = {
          title: typeof meta.Title === 'string' ? meta.Title : '',
          author: typeof meta.Author === 'string' ? meta.Author : '',
          subject: typeof meta.Subject === 'string' ? meta.Subject : '',
          keywords: typeof meta.Keywords === 'string' ? meta.Keywords : '',
        };
      } catch {
        // metadata unavailable
      }
      dispatch({
        type: 'OPEN',
        payload: {
          docs,
          slots: loaded.slots,
          overlays: [],
          fileName: loaded.fileName,
          fileSize: loaded.fileSize,
          mainDocId: loaded.doc.id,
          metadata,
        },
      });
    } catch (err) {
      const friendly = err instanceof PdfOpenError ? friendlyOpenError(err) : friendlyOpenError(undefined);
      dispatch({ type: 'OPEN_ERROR', payload: friendly });
    } finally {
      dispatch({ type: 'SET_BUSY', payload: { label: null, progress: null } });
    }
  }, []);

  const openBytes = useCallback(async (bytes: ArrayBuffer, name: string) => {
    dispatch({ type: 'SET_BUSY', payload: { label: 'Opening PDF…', progress: null } });
    try {
      const { openPdfBytes } = await import('./lib/pdfLoader');
      const loaded = await openPdfBytes(bytes, name, bytes.byteLength);
      const existing = stateRef.current.docs;
      for (const key of Object.keys(existing)) {
        try {
          existing[key].pdf.loadingTask.destroy();
        } catch {
          // ignore
        }
      }
      dispatch({
        type: 'OPEN',
        payload: {
          docs: { [loaded.doc.id]: loaded.doc },
          slots: loaded.slots,
          overlays: [],
          fileName: loaded.fileName,
          fileSize: loaded.fileSize,
          mainDocId: loaded.doc.id,
          metadata: { title: '', author: '', subject: '', keywords: '' },
        },
      });
    } catch (err) {
      const friendly = err instanceof PdfOpenError ? friendlyOpenError(err) : friendlyOpenError(undefined);
      dispatch({ type: 'OPEN_ERROR', payload: friendly });
    } finally {
      dispatch({ type: 'SET_BUSY', payload: { label: null, progress: null } });
    }
  }, []);

  const resetDocument = useCallback(() => {
    const existing = stateRef.current.docs;
    for (const key of Object.keys(existing)) {
      try {
        existing[key].pdf.loadingTask.destroy();
      } catch {
        // ignore
      }
    }
    dispatch({ type: 'RESET' });
  }, []);

  const setTool = useCallback((tool: ToolId) => dispatch({ type: 'SET_TOOL', payload: tool }), []);
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);
  const addOverlays = useCallback((overlays: Overlay[]) => {
    if (overlays.length === 0) return;
    dispatch({ type: 'ADD_OVERLAYS', payload: overlays });
  }, []);
  const updateOverlay = useCallback((id: string, patch: Partial<Overlay>) => dispatch({ type: 'UPDATE_OVERLAY', payload: { id, patch } }), []);
  const updateOverlayLive = useCallback((id: string, patch: Partial<Overlay>) => dispatch({ type: 'UPDATE_OVERLAY_LIVE', payload: { id, patch } }), []);
  const removeOverlays = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    dispatch({ type: 'REMOVE_OVERLAYS', payload: ids });
  }, []);
  const setOverlays = useCallback((overlays: Overlay[]) => dispatch({ type: 'SET_OVERLAYS', payload: overlays }), []);
  const pushHistory = useCallback(() => dispatch({ type: 'PUSH_HISTORY' }), []);

  const copySelection = useCallback(() => {
    const sel = stateRef.current.selection;
    copyBuffer = stateRef.current.overlays.filter((o) => sel.includes(o.id)).map((o) => ({ ...o }));
  }, []);

  const pasteBuffer = useCallback(() => {
    if (copyBuffer.length === 0) return;
    const offset = 24;
    const pasted = copyBuffer.map((o) => ({
      ...o,
      id: makeId('ovl'),
      x: o.x + offset,
      y: o.y + offset,
    }));
    dispatch({ type: 'ADD_OVERLAYS', payload: pasted });
    dispatch({ type: 'SET_SELECTION', payload: pasted.map((o) => o.id) });
  }, []);

  const duplicateSelection = useCallback(() => {
    const sel = stateRef.current.selection;
    if (sel.length === 0) return;
    const originals = stateRef.current.overlays.filter((o) => sel.includes(o.id));
    const duplicated = originals.map((o) => ({ ...o, id: makeId('ovl'), x: o.x + 24, y: o.y + 24 }));
    dispatch({ type: 'ADD_OVERLAYS', payload: duplicated });
    dispatch({ type: 'SET_SELECTION', payload: duplicated.map((o) => o.id) });
  }, []);

  const deleteSelection = useCallback(() => {
    const sel = stateRef.current.selection;
    if (sel.length === 0) return;
    dispatch({ type: 'REMOVE_OVERLAYS', payload: sel });
  }, []);

  const showToast = useCallback((message: string, kind: 'info' | 'warn' | 'error' = 'info') => {
    dispatch({ type: 'SHOW_TOAST', payload: { message, kind } });
  }, []);

  const buildExportBlob = useCallback(async (options?: ExportPdfOptions): Promise<Blob> => {
    const s = stateRef.current;
    return exportDocument({
      docs: s.docs,
      slots: s.slots,
      overlays: s.overlays,
      metadata: s.metadata,
      fileName: s.fileName,
      password: options?.password,
      compression: options?.compression,
      removeMetadata: options?.removeMetadata,
      onProgress: (progress) => {
        const pct = Math.round(progress * 100);
        dispatch({ type: 'SET_BUSY', payload: { label: `Exporting PDF… ${pct}%`, progress } });
      },
    });
  }, []);

  const performExport = useCallback(
    async (options?: ExportPdfOptions) => {
      const s = stateRef.current;
      if (s.slots.length === 0) return;
      dispatch({ type: 'SET_BUSY', payload: { label: 'Preparing PDF…', progress: 0 } });
      try {
        const blob = await buildExportBlob(options);
        const base = s.fileName.replace(/\.pdf$/i, '') || 'document';
        downloadBlob(blob, `${base}-edited.pdf`);
        dispatch({ type: 'SHOW_TOAST', payload: { message: 'PDF downloaded', kind: 'info' } });
      } catch (err) {
        const e = err as ExportError;
        let message = 'The PDF could not be exported. Please try again.';
        if (e && e.kind === 'memory') message = 'Your browser ran out of memory while exporting. Try closing other tabs or exporting fewer pages.';
        if (e && e.kind === 'unsupported') message = 'Part of this document could not be exported because it uses unsupported features.';
        dispatch({ type: 'SHOW_TOAST', payload: { message, kind: 'error' } });
      } finally {
        dispatch({ type: 'SET_BUSY', payload: { label: null, progress: null } });
      }
    },
    [buildExportBlob]
  );

  const exportPdf = useCallback((options?: ExportPdfOptions) => performExport(options), [performExport]);
  const exportAndDownload = useCallback(() => performExport(), [performExport]);
  const saveCopy = useCallback(() => performExport(), [performExport]);

  const printDocument = useCallback(async () => {
    const s = stateRef.current;
    if (s.slots.length === 0) return;
    dispatch({ type: 'SET_BUSY', payload: { label: 'Preparing print…', progress: null } });
    try {
      const blob = await buildExportBlob();
      const { printBlob } = await import('./lib/printPdf');
      printBlob(blob);
    } catch {
      dispatch({ type: 'SHOW_TOAST', payload: { message: 'The document could not be printed.', kind: 'error' } });
    } finally {
      dispatch({ type: 'SET_BUSY', payload: { label: null, progress: null } });
    }
  }, [buildExportBlob]);

  const exportPagesAsImages = useCallback(async (options: ImageExportOptions) => {
    const s = stateRef.current;
    if (s.slots.length === 0) return;
    dispatch({ type: 'SET_BUSY', payload: { label: 'Exporting images…', progress: null } });
    try {
      const { exportPagesAsImages: runExport } = await import('./lib/exportImages');
      const base = s.fileName.replace(/\.pdf$/i, '') || 'document';
      await runExport({
        docs: s.docs,
        slots: s.slots,
        overlays: s.overlays,
        baseName: base,
        format: options.format,
        scale: options.scale,
        quality: options.quality,
        range: options.range,
        currentPage: s.currentPage,
      });
      dispatch({ type: 'SHOW_TOAST', payload: { message: 'Images downloaded', kind: 'info' } });
    } catch {
      dispatch({ type: 'SHOW_TOAST', payload: { message: 'The images could not be exported.', kind: 'error' } });
    } finally {
      dispatch({ type: 'SET_BUSY', payload: { label: null, progress: null } });
    }
  }, []);

  const extractText = useCallback(async () => {
    const s = stateRef.current;
    if (s.slots.length === 0) return;
    dispatch({ type: 'SET_BUSY', payload: { label: 'Extracting text…', progress: null } });
    try {
      const { extractDocumentText } = await import('./lib/extractText');
      const text = await extractDocumentText(s.docs, s.slots, s.overlays);
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const base = s.fileName.replace(/\.pdf$/i, '') || 'document';
      downloadBlob(blob, `${base}.txt`);
      dispatch({ type: 'SHOW_TOAST', payload: { message: 'Text extracted', kind: 'info' } });
    } catch {
      dispatch({ type: 'SHOW_TOAST', payload: { message: 'Text could not be extracted.', kind: 'error' } });
    } finally {
      dispatch({ type: 'SET_BUSY', payload: { label: null, progress: null } });
    }
  }, []);

  const createPdfFromImages = useCallback(
    async (files: File[], pageSize: ImagePdfPageSize) => {
      dispatch({ type: 'SET_BUSY', payload: { label: 'Creating PDF…', progress: null } });
      try {
        const { createPdfFromImages: build } = await import('./lib/createPdfFromImages');
        const { bytes, name } = await build(files, pageSize);
        const buffer = bytes.slice().buffer as ArrayBuffer;
        await openBytes(buffer, name);
        dispatch({ type: 'SHOW_TOAST', payload: { message: 'PDF created from images', kind: 'info' } });
      } catch {
        dispatch({ type: 'SHOW_TOAST', payload: { message: 'The images could not be converted to a PDF.', kind: 'error' } });
      } finally {
        dispatch({ type: 'SET_BUSY', payload: { label: null, progress: null } });
      }
    },
    [openBytes]
  );

  const insertDocIntoSlots = useCallback(
    async (bytes: ArrayBuffer, name: string, atIndex: number, from: number, to: number) => {
      const { openPdfBytes } = await import('./lib/pdfLoader');
      const loaded = await openPdfBytes(bytes, name, bytes.byteLength);
      const docId = makeId('doc');
      const docRecord: DocRecord = { id: docId, name, pdf: loaded.doc.pdf, bytes, fileSize: bytes.byteLength };
      const start = Math.max(0, Math.min(from, to));
      const end = Math.max(from, to);
      const slots = loaded.slots
        .filter((_, i) => i >= start && i <= end)
        .map((slot) => ({ ...slot, docId }));
      dispatch({ type: 'ADD_DOC', payload: docRecord });
      dispatch({ type: 'ADD_SLOTS', payload: { slots, atIndex } });
    },
    []
  );

  const addBlankPage = useCallback(async (width: number, height: number, atIndex: number) => {
    const bytes = await createBlankPdfBytes(width, height);
    const { openPdfBytes } = await import('./lib/pdfLoader');
    const loaded = await openPdfBytes(bytes, 'Blank page', bytes.byteLength);
    const docId = makeId('doc');
    const docRecord: DocRecord = { id: docId, name: 'Blank page', pdf: loaded.doc.pdf, bytes, fileSize: bytes.byteLength };
    dispatch({ type: 'ADD_DOC', payload: docRecord });
    dispatch({ type: 'ADD_SLOTS', payload: { slots: [{ ...loaded.slots[0], docId, width, height }], atIndex } });
  }, []);

  const getPageDimensions = useCallback((index: number) => {
    const slot = stateRef.current.slots[index];
    return slot ? { width: slot.width, height: slot.height } : { width: 612, height: 792 };
  }, []);

  const value = useMemo<EditorContextValue>(
    () => ({
      state,
      dispatch,
      openFile,
      openBytes,
      resetDocument,
      setTool,
      undo,
      redo,
      addOverlays,
      updateOverlay,
      updateOverlayLive,
      removeOverlays,
      setOverlays,
      pushHistory,
      copySelection,
      pasteBuffer,
      duplicateSelection,
      deleteSelection,
      exportAndDownload,
      saveCopy,
      exportPdf,
      exportPagesAsImages,
      extractText,
      printDocument,
      createPdfFromImages,
      showToast,
      insertDocIntoSlots,
      addBlankPage,
      getPageDimensions,
    }),
    [state, openFile, openBytes, resetDocument, setTool, undo, redo, addOverlays, updateOverlay, updateOverlayLive, removeOverlays, setOverlays, pushHistory, copySelection, pasteBuffer, duplicateSelection, deleteSelection, exportAndDownload, saveCopy, exportPdf, exportPagesAsImages, extractText, printDocument, createPdfFromImages, showToast, insertDocIntoSlots, addBlankPage, getPageDimensions]
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor(): EditorContextValue {
  const context = useContext(EditorContext);
  if (!context) throw new Error('useEditor must be used within EditorProvider');
  return context;
}
