'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditor } from '../EditorContext';
import { Modal, PrimaryButton, GhostButton, Field, TextInput, NumberInput, SelectInput, ColorInput } from './ui';
import { Icons } from './icons';
import { PAGE_SIZES } from '../lib/slotOps';
import { makeWatermarkOverlay, makePageNumberOverlay, makeSignatureOverlay } from '../lib/factories';
import { downloadBlob } from '../lib/utils';
import { formatBytes } from '../lib/textUtils';
import type { CompressionLevel, ImageExportOptions, ImagePdfPageSize, Overlay } from '../types';

export default function Modals() {
  const { state, dispatch } = useEditor();
  const modal = state.modal;
  if (!modal) return null;
  return (
    <ModalHost key={modal} modal={modal} onClose={() => dispatch({ type: 'SET_MODAL', payload: null })} />
  );
}

function ModalHost({ modal, onClose }: { modal: NonNullable<ReturnType<typeof useEditor>['state']['modal']>; onClose: () => void }) {
  switch (modal) {
    case 'signature':
      return <SignatureModal onClose={onClose} />;
    case 'watermark':
      return <WatermarkModal onClose={onClose} />;
    case 'page-numbers':
      return <PageNumbersModal onClose={onClose} />;
    case 'header-footer':
      return <HeaderFooterModal onClose={onClose} />;
    case 'add-page':
      return <AddPageModal onClose={onClose} />;
    case 'insert-pdf':
      return <InsertPdfModal onClose={onClose} />;
    case 'extract':
      return <ExtractModal onClose={onClose} />;
    case 'replace-page':
      return <ReplacePageModal onClose={onClose} />;
    case 'metadata':
      return <MetadataModal onClose={onClose} />;
    case 'export':
      return <ExportModal onClose={onClose} />;
    case 'from-images':
      return <FromImagesModal onClose={onClose} />;
    default:
      return null;
  }
}

function ScopePicker({ value, onChange }: { value: 'all' | 'current'; onChange: (v: 'all' | 'current') => void }) {
  return (
    <Field label="Apply to">
      <SelectInput value={value} onChange={(e) => onChange(e.target.value as 'all' | 'current')}>
        <option value="all">All pages</option>
        <option value="current">Current page only</option>
      </SelectInput>
    </Field>
  );
}

function applyPageOverlays(
  overlaysForPage: (pageIndex: number, pageWidth: number, pageHeight: number) => Overlay | Overlay[],
  scope: 'all' | 'current',
  currentPage: number,
  slots: { width: number; height: number }[]
): Overlay[] {
  const result: Overlay[] = [];
  const target = scope === 'all' ? slots.map((_, i) => i) : [currentPage];
  for (const i of target) {
    const made = overlaysForPage(i, slots[i].width, slots[i].height);
    if (Array.isArray(made)) result.push(...made);
    else result.push(made);
  }
  return result;
}

function WatermarkModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch, addOverlays } = useEditor();
  const [text, setText] = useState('CONFIDENTIAL');
  const [size, setSize] = useState(48);
  const [color, setColor] = useState('#94a3b8');
  const [opacity, setOpacity] = useState(0.25);
  const [rotation, setRotation] = useState(-35);
  const [scope, setScope] = useState<'all' | 'current'>('all');

  const apply = () => {
    if (!text.trim()) return;
    const overlays = applyPageOverlays(
      (page, w) => {
        const fw = Math.max(60, w * 0.8);
        return makeWatermarkOverlay(page, (w - fw) / 2, 0, fw, 100, text, Math.min(size, w / 10), color, opacity, rotation);
      },
      scope,
      state.currentPage,
      state.slots
    );
    addOverlays(overlays);
    dispatch({ type: 'SHOW_TOAST', payload: { message: `Watermark added to ${overlays.length} page${overlays.length === 1 ? '' : 's'}.`, kind: 'info' } });
    onClose();
  };

  return (
    <Modal
      title="Watermark"
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={apply}>Add watermark</PrimaryButton>
        </>
      }
    >
      <Field label="Text">
        <TextInput value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. CONFIDENTIAL" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Font size">
          <NumberInput value={size} min={8} max={400} onChange={(e) => setSize(Number(e.target.value) || 12)} />
        </Field>
        <Field label="Rotation">
          <NumberInput value={rotation} min={-90} max={90} onChange={(e) => setRotation(Number(e.target.value) || 0)} />
        </Field>
      </div>
      <Field label="Color">
        <ColorInput value={color} onChange={setColor} label="Watermark color" />
      </Field>
      <Field label="Opacity">
        <input type="range" min={0} max={100} value={Math.round(opacity * 100)} onChange={(e) => setOpacity(Number(e.target.value) / 100)} aria-label="Watermark opacity" className="w-full accent-blue-600" />
        <span className="text-xs tabular-nums text-gray-500">{Math.round(opacity * 100)}%</span>
      </Field>
      <ScopePicker value={scope} onChange={setScope} />
    </Modal>
  );
}

function PageNumbersModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch, addOverlays } = useEditor();
  const [position, setPosition] = useState<'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'>('bottom-right');
  const [format, setFormat] = useState<'plain' | 'page-of'>('plain');
  const [start, setStart] = useState(1);
  const [size, setSize] = useState(12);
  const [color, setColor] = useState('#000000');
  const [scope, setScope] = useState<'all' | 'current'>('all');

  const apply = () => {
    const overlays = applyPageOverlays(
      (page, w, h) => {
        const label = format === 'plain' ? String(start + page) : `${start + page} / ${start + state.slots.length - 1}`;
        const pad = 24;
        const x = position.includes('center') ? w / 2 - size * label.length * 0.32 : position.includes('right') ? w - pad - size * label.length * 0.64 : pad;
        const y = position.startsWith('top') ? pad : h - pad - size * 1.4;
        return makePageNumberOverlay(page, x, y, size * label.length * 0.64, label, size, color);
      },
      scope,
      state.currentPage,
      state.slots
    );
    addOverlays(overlays);
    dispatch({ type: 'SHOW_TOAST', payload: { message: `Page numbers added to ${overlays.length} page${overlays.length === 1 ? '' : 's'}.`, kind: 'info' } });
    onClose();
  };

  const posLabel: Record<string, string> = {
    'top-left': 'Top left',
    'top-center': 'Top center',
    'top-right': 'Top right',
    'bottom-left': 'Bottom left',
    'bottom-center': 'Bottom center',
    'bottom-right': 'Bottom right',
  };

  return (
    <Modal
      title="Page numbers"
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={apply}>Add page numbers</PrimaryButton>
        </>
      }
    >
      <Field label="Position">
        <SelectInput value={position} onChange={(e) => setPosition(e.target.value as typeof position)}>
          {Object.entries(posLabel).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field label="Format">
        <SelectInput value={format} onChange={(e) => setFormat(e.target.value as typeof format)}>
          <option value="plain">1, 2, 3…</option>
          <option value="page-of">Page 1 of 20</option>
        </SelectInput>
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Start at">
          <NumberInput value={start} min={1} max={9999} onChange={(e) => setStart(Number(e.target.value) || 1)} />
        </Field>
        <Field label="Font size">
          <NumberInput value={size} min={6} max={72} onChange={(e) => setSize(Number(e.target.value) || 12)} />
        </Field>
        <Field label="Color">
          <ColorInput value={color} onChange={setColor} label="Page number color" />
        </Field>
      </div>
      <ScopePicker value={scope} onChange={setScope} />
    </Modal>
  );
}

function HeaderFooterModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch, addOverlays } = useEditor();
  const [header, setHeader] = useState('');
  const [footer, setFooter] = useState('');
  const [size, setSize] = useState(10);
  const [color, setColor] = useState('#374151');
  const [scope, setScope] = useState<'all' | 'current'>('all');

  const apply = () => {
    if (!header && !footer) return;
    const pad = 28;
    const overlays = applyPageOverlays(
      (page, w, h) => {
        const made: Overlay[] = [];
        if (header.trim()) {
          made.push(makePageNumberOverlay(page, pad, pad, w - pad * 2, header, size, color));
        }
        if (footer.trim()) {
          made.push(makePageNumberOverlay(page, pad, h - pad - size * 1.4, w - pad * 2, footer, size, color));
        }
        return made;
      },
      scope,
      state.currentPage,
      state.slots
    );
    addOverlays(overlays);
    dispatch({ type: 'SHOW_TOAST', payload: { message: `Header/footer added to ${overlays.length} page${overlays.length === 1 ? '' : 's'}.`, kind: 'info' } });
    onClose();
  };

  return (
    <Modal
      title="Header & footer"
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={apply}>Add header/footer</PrimaryButton>
        </>
      }
    >
      <Field label="Header text">
        <TextInput value={header} onChange={(e) => setHeader(e.target.value)} placeholder="Company name, document title…" />
      </Field>
      <Field label="Footer text">
        <TextInput value={footer} onChange={(e) => setFooter(e.target.value)} placeholder="Page footer, copyright…" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Font size">
          <NumberInput value={size} min={6} max={72} onChange={(e) => setSize(Number(e.target.value) || 10)} />
        </Field>
        <Field label="Color">
          <ColorInput value={color} onChange={setColor} label="Text color" />
        </Field>
      </div>
      <ScopePicker value={scope} onChange={setScope} />
    </Modal>
  );
}

function AddPageModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch, addBlankPage } = useEditor();
  const [preset, setPreset] = useState<keyof typeof PAGE_SIZES | 'custom'>('A4');
  const [width, setWidth] = useState<number>(PAGE_SIZES.A4.width);
  const [height, setHeight] = useState<number>(PAGE_SIZES.A4.height);
  const [position, setPosition] = useState<'after' | 'before'>('after');

  const pickPreset = (p: keyof typeof PAGE_SIZES | 'custom') => {
    setPreset(p);
    if (p !== 'custom') {
      setWidth(PAGE_SIZES[p].width);
      setHeight(PAGE_SIZES[p].height);
    }
  };

  const apply = async () => {
    const atIndex = state.currentPage + (position === 'after' ? 1 : 0);
    await addBlankPage(width, height, atIndex);
    dispatch({ type: 'SET_CURRENT_PAGE', payload: atIndex });
    dispatch({ type: 'SHOW_TOAST', payload: { message: 'Blank page added.', kind: 'info' } });
    onClose();
  };

  return (
    <Modal
      title="Add page"
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={apply}>Add page</PrimaryButton>
        </>
      }
    >
      <Field label="Page size">
        <SelectInput value={preset} onChange={(e) => pickPreset(e.target.value as keyof typeof PAGE_SIZES | 'custom')}>
          {Object.entries(PAGE_SIZES).map(([name, dims]) => (
            <option key={name} value={name}>
              {name} — {Math.round(dims.width)} × {Math.round(dims.height)} pt
            </option>
          ))}
          <option value="custom">Custom size</option>
        </SelectInput>
      </Field>
      {preset === 'custom' && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Width (pt)">
            <NumberInput value={width} min={50} max={5000} onChange={(e) => setWidth(Number(e.target.value) || 100)} />
          </Field>
          <Field label="Height (pt)">
            <NumberInput value={height} min={50} max={5000} onChange={(e) => setHeight(Number(e.target.value) || 100)} />
          </Field>
        </div>
      )}
      <Field label="Position">
        <SelectInput value={position} onChange={(e) => setPosition(e.target.value as 'after' | 'before')}>
          <option value="after">After current page (page {state.currentPage + 1})</option>
          <option value="before">Before current page</option>
        </SelectInput>
      </Field>
    </Modal>
  );
}

function InsertPdfModal({ onClose }: { onClose: () => void }) {
  const { state, insertDocIntoSlots, showToast } = useEditor();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [range, setRange] = useState<'all' | 'range'>('all');
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(1);
  const [position, setPosition] = useState<'after' | 'before'>('after');

  const apply = async () => {
    if (!file) return;
    try {
      const bytes = await file.arrayBuffer();
      const atIndex = state.currentPage + (position === 'after' ? 1 : 0);
      const fromIdx = range === 'all' ? 0 : from - 1;
      const toIdx = range === 'all' ? Infinity : to - 1;
      await insertDocIntoSlots(bytes, file.name, atIndex, fromIdx, toIdx);
      showToast(`Inserted pages from ${file.name}.`);
      onClose();
    } catch {
      showToast('The selected file could not be read.', 'error');
    }
  };

  return (
    <Modal
      title="Insert PDF"
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={apply} disabled={!file}>
            Insert pages
          </PrimaryButton>
        </>
      }
    >
      <Field label="PDF file">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full rounded-md border-2 border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500 hover:border-blue-500 hover:text-blue-600 dark:border-gray-600 dark:text-gray-400"
        >
          {file ? (
            <span className="font-medium text-gray-900 dark:text-white">
              {file.name} · {formatBytes(file.size)}
            </span>
          ) : (
            'Click to choose a PDF to insert'
          )}
        </button>
        <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </Field>
      <Field label="Pages to insert">
        <SelectInput value={range} onChange={(e) => setRange(e.target.value as 'all' | 'range')}>
          <option value="all">All pages</option>
          <option value="range">Specific range</option>
        </SelectInput>
      </Field>
      {range === 'range' && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="From page">
            <NumberInput value={from} min={1} onChange={(e) => setFrom(Number(e.target.value) || 1)} />
          </Field>
          <Field label="To page">
            <NumberInput value={to} min={1} onChange={(e) => setTo(Number(e.target.value) || 1)} />
          </Field>
        </div>
      )}
      <Field label="Position">
        <SelectInput value={position} onChange={(e) => setPosition(e.target.value as 'after' | 'before')}>
          <option value="after">After current page (page {state.currentPage + 1})</option>
          <option value="before">Before current page</option>
        </SelectInput>
      </Field>
    </Modal>
  );
}

function ExtractModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useEditor();
  const [range, setRange] = useState<'current' | 'range' | 'all'>('current');
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(1);

  const apply = async () => {
    const total = state.slots.length;
    const fromIdx = range === 'current' ? state.currentPage : range === 'range' ? from - 1 : 0;
    const toIdx = range === 'current' ? state.currentPage : range === 'range' ? to - 1 : total - 1;
    if (fromIdx < 0 || toIdx >= total || fromIdx > toIdx) {
      dispatch({ type: 'SHOW_TOAST', payload: { message: 'Please choose a valid page range.', kind: 'warn' } });
      return;
    }

    const slots = state.slots.slice(fromIdx, toIdx + 1);
    const sourceIndexMap = new Map<number, number>();
    for (let i = 0; i < slots.length; i++) sourceIndexMap.set(fromIdx + i, i);
    const overlays = state.overlays
      .filter((o) => sourceIndexMap.has(o.page))
      .map((o) => ({ ...o, page: sourceIndexMap.get(o.page)! }));

    dispatch({ type: 'SET_MODAL', payload: null });
    dispatch({ type: 'SET_BUSY', payload: { label: 'Extracting pages…', progress: null } });
    try {
      const { exportDocument } = await import('../lib/exportDocument');
      const blob = await exportDocument({
        docs: state.docs,
        slots,
        overlays,
        metadata: state.metadata,
        fileName: state.fileName,
      });
      const base = (state.fileName.replace(/\.pdf$/i, '') || 'document') + '-extract';
      downloadBlob(blob, `${base}.pdf`);
      dispatch({ type: 'SHOW_TOAST', payload: { message: 'Extracted pages downloaded.', kind: 'info' } });
    } catch {
      dispatch({ type: 'SHOW_TOAST', payload: { message: 'Extraction failed. Please try again.', kind: 'error' } });
    } finally {
      dispatch({ type: 'SET_BUSY', payload: { label: null, progress: null } });
    }
    onClose();
  };

  return (
    <Modal
      title="Extract pages"
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={apply}>Extract to new PDF</PrimaryButton>
        </>
      }
    >
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Extracts the chosen pages into a separate PDF file and downloads it. This document is left unchanged.
      </p>
      <Field label="Pages">
        <SelectInput value={range} onChange={(e) => setRange(e.target.value as 'current' | 'range' | 'all')}>
          <option value="current">Current page only</option>
          <option value="range">Range of pages</option>
          <option value="all">All pages</option>
        </SelectInput>
      </Field>
      {range === 'range' && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="From page">
            <NumberInput value={from} min={1} max={state.slots.length} onChange={(e) => setFrom(Number(e.target.value) || 1)} />
          </Field>
          <Field label="To page">
            <NumberInput value={to} min={1} max={state.slots.length} onChange={(e) => setTo(Number(e.target.value) || 1)} />
          </Field>
        </div>
      )}
    </Modal>
  );
}

function ReplacePageModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch, insertDocIntoSlots } = useEditor();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const apply = async () => {
    if (!file) return;
    try {
      const bytes = await file.arrayBuffer();
      const atIndex = state.currentPage;
      await insertDocIntoSlots(bytes, file.name, atIndex, 0, Infinity);
      dispatch({ type: 'DELETE_SLOTS', payload: [atIndex] });
      dispatch({ type: 'SHOW_TOAST', payload: { message: 'Page replaced.', kind: 'info' } });
      onClose();
    } catch {
      dispatch({ type: 'SHOW_TOAST', payload: { message: 'The selected file could not be read.', kind: 'error' } });
    }
  };

  return (
    <Modal
      title="Replace page"
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={apply} disabled={!file}>
            Replace page {state.currentPage + 1}
          </PrimaryButton>
        </>
      }
    >
      <p className="text-sm text-gray-600 dark:text-gray-300">Replaces the current page with the first page of the selected PDF.</p>
      <Field label="PDF file">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full rounded-md border-2 border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500 hover:border-blue-500 hover:text-blue-600 dark:border-gray-600 dark:text-gray-400"
        >
          {file ? file.name : 'Click to choose a PDF'}
        </button>
        <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </Field>
    </Modal>
  );
}

function MetadataModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useEditor();
  const [title, setTitle] = useState(state.metadata.title);
  const [author, setAuthor] = useState(state.metadata.author);
  const [subject, setSubject] = useState(state.metadata.subject);
  const [keywords, setKeywords] = useState(state.metadata.keywords);

  const apply = () => {
    dispatch({ type: 'SET_METADATA', payload: { title, author, subject, keywords } });
    dispatch({ type: 'SHOW_TOAST', payload: { message: 'Document information updated.', kind: 'info' } });
    onClose();
  };

  return (
    <Modal
      title="Document information"
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={apply}>Save</PrimaryButton>
        </>
      }
    >
      <Field label="Title">
        <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="Author">
        <TextInput value={author} onChange={(e) => setAuthor(e.target.value)} />
      </Field>
      <Field label="Subject">
        <TextInput value={subject} onChange={(e) => setSubject(e.target.value)} />
      </Field>
      <Field label="Keywords">
        <TextInput value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="comma, separated" />
      </Field>
    </Modal>
  );
}

type ExportTab = 'pdf' | 'images' | 'text';

function PageScopePicker({ value, onChange }: { value: 'current' | 'all'; onChange: (v: 'current' | 'all') => void }) {
  const { state } = useEditor();
  return (
    <Field label="Pages">
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
        <button
          type="button"
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            value === 'current' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => onChange('current')}
        >
          Current page ({state.currentPage + 1} of {state.slots.length})
        </button>
        <button
          type="button"
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            value === 'all' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => onChange('all')}
        >
          All pages ({state.slots.length})
        </button>
      </div>
    </Field>
  );
}

const COMPRESSION_LABELS: Record<CompressionLevel, string> = {
  none: 'None — keep original quality',
  low: 'Light — slightly smaller',
  medium: 'Medium — good balance',
  high: 'Maximum — smallest file',
};

function ExportModal({ onClose }: { onClose: () => void }) {
  const { dispatch, exportPdf, exportPagesAsImages, extractText, printDocument } = useEditor();
  const [tab, setTab] = useState<ExportTab>('pdf');
  const [compression, setCompression] = useState<CompressionLevel>('none');
  const [removeMetadata, setRemoveMetadata] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [imgFormat, setImgFormat] = useState<'png' | 'jpeg'>('png');
  const [imgScale, setImgScale] = useState(2);
  const [imgQuality, setImgQuality] = useState(0.9);
  const [imgRange, setImgRange] = useState<'current' | 'all'>('current');
  const [busy, setBusy] = useState<null | 'download' | 'print' | 'images' | 'text'>(null);

  const runWithBusy = async (kind: Exclude<typeof busy, null>, fn: () => Promise<void>) => {
    if (busy) return;
    setBusy(kind);
    try {
      await fn();
      onClose();
    } finally {
      setBusy(null);
    }
  };

  const downloadPdf = () => {
    if (password && password !== passwordConfirm) {
      dispatch({ type: 'SHOW_TOAST', payload: { message: 'The passwords do not match.', kind: 'warn' } });
      return;
    }
    void runWithBusy('download', () =>
      exportPdf({ password: password || undefined, compression, removeMetadata })
    );
  };

  const runPrint = () => {
    void runWithBusy('print', printDocument);
  };

  const runImages = () => {
    const options: ImageExportOptions = { format: imgFormat, scale: imgScale as 1 | 2 | 3, quality: imgQuality, range: imgRange };
    void runWithBusy('images', () => exportPagesAsImages(options));
  };

  const runExtractText = () => {
    void runWithBusy('text', extractText);
  };

  const tabClass = (active: boolean) =>
    `flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
      active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
    }`;

  return (
    <Modal
      title="Export"
      onClose={onClose}
      footer={
        <GhostButton onClick={onClose}>Close</GhostButton>
      }
    >
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
        <button type="button" className={tabClass(tab === 'pdf')} onClick={() => setTab('pdf')}>
          PDF
        </button>
        <button type="button" className={tabClass(tab === 'images')} onClick={() => setTab('images')}>
          Images
        </button>
        <button type="button" className={tabClass(tab === 'text')} onClick={() => setTab('text')}>
          Text
        </button>
      </div>

      {tab === 'pdf' && (
        <div className="space-y-4">
          <Field label="Optimize file size">
            <SelectInput value={compression} onChange={(e) => setCompression(e.target.value as CompressionLevel)}>
              {(Object.keys(COMPRESSION_LABELS) as CompressionLevel[]).map((level) => (
                <option key={level} value={level}>
                  {COMPRESSION_LABELS[level]}
                </option>
              ))}
            </SelectInput>
          </Field>
          {compression !== 'none' && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Pages are converted to compressed images to shrink the file. Text will no longer be selectable.
            </p>
          )}

          <label className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={removeMetadata}
              onChange={(e) => setRemoveMetadata(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-blue-600"
            />
            Remove document information (title, author, dates)
          </label>

          <div className="space-y-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200">
              <Icons.lock size={15} />
              Password protection
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Password">
                <TextInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Optional" autoComplete="new-password" />
              </Field>
              <Field label="Confirm password">
                <TextInput type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="Repeat" autoComplete="new-password" />
              </Field>
            </div>
            {password && password !== passwordConfirm && (
              <p className="text-xs text-amber-600 dark:text-amber-400">Passwords do not match.</p>
            )}
            {password && <p className="text-xs text-gray-500 dark:text-gray-400">The PDF will require this password to open. It cannot be opened again in this editor.</p>}
          </div>

          <div className="flex gap-2 pt-1">
            <PrimaryButton onClick={downloadPdf} disabled={busy !== null}>
              {busy === 'download' ? <Icons.spinner size={16} className="animate-spin" /> : <Icons.download size={16} />}
              Download PDF
            </PrimaryButton>
            <GhostButton onClick={runPrint} disabled={busy !== null}>
              {busy === 'print' ? <Icons.spinner size={16} className="animate-spin" /> : <Icons.print size={16} />}
              Print
            </GhostButton>
          </div>
        </div>
      )}

      {tab === 'images' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Export each page as an image file (PNG or JPEG). Annotations and additions are included.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Format">
              <SelectInput value={imgFormat} onChange={(e) => setImgFormat(e.target.value as 'png' | 'jpeg')}>
                <option value="png">PNG (lossless)</option>
                <option value="jpeg">JPEG (smaller)</option>
              </SelectInput>
            </Field>
            <Field label="Scale">
              <SelectInput value={imgScale} onChange={(e) => setImgScale(Number(e.target.value))}>
                <option value={1}>1× — screen size</option>
                <option value={2}>2× — crisp</option>
                <option value={3}>3× — high resolution</option>
              </SelectInput>
            </Field>
          </div>
          {imgFormat === 'jpeg' && (
            <Field label={`Quality — ${Math.round(imgQuality * 100)}%`}>
              <input type="range" min={40} max={100} value={Math.round(imgQuality * 100)} onChange={(e) => setImgQuality(Number(e.target.value) / 100)} aria-label="JPEG quality" className="w-full accent-blue-600" />
            </Field>
          )}
          <PageScopePicker value={imgRange} onChange={setImgRange} />
          <PrimaryButton onClick={runImages} disabled={busy !== null}>
            {busy === 'images' ? <Icons.spinner size={16} className="animate-spin" /> : <Icons.image size={16} />}
            Export images
          </PrimaryButton>
        </div>
      )}

      {tab === 'text' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Extract the text from every page into a plain-text file (.txt). Text added with the editor is included.
          </p>
          <PrimaryButton onClick={runExtractText} disabled={busy !== null}>
            {busy === 'text' ? <Icons.spinner size={16} className="animate-spin" /> : <Icons.text size={16} />}
            Extract text
          </PrimaryButton>
        </div>
      )}
    </Modal>
  );
}

function FromImagesModal({ onClose }: { onClose: () => void }) {
  const { createPdfFromImages, showToast } = useEditor();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState<ImagePdfPageSize>('fit');
  const [busy, setBusy] = useState(false);

  const apply = async () => {
    if (files.length === 0 || busy) return;
    setBusy(true);
    try {
      await createPdfFromImages(files, pageSize);
      onClose();
    } catch {
      showToast('The images could not be converted.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Create PDF from images"
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={apply} disabled={files.length === 0 || busy}>
            {busy ? 'Creating…' : 'Create PDF'}
          </PrimaryButton>
        </>
      }
    >
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Combine images into a single PDF. Each image becomes its own page. Files are processed in your browser and never leave your device.
      </p>
      <Field label="Images">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full rounded-md border-2 border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500 hover:border-blue-500 hover:text-blue-600 dark:border-gray-600 dark:text-gray-400"
        >
          {files.length > 0 ? (
            <span className="font-medium text-gray-900 dark:text-white">{files.length} image{files.length === 1 ? '' : 's'} selected</span>
          ) : (
            'Click to choose images (PNG, JPG, WebP, GIF…)'
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        />
      </Field>
      <Field label="Page size">
        <SelectInput value={pageSize} onChange={(e) => setPageSize(e.target.value as ImagePdfPageSize)}>
          <option value="fit">Fit to each image</option>
          <option value="a4">A4 portrait</option>
          <option value="letter">Letter</option>
        </SelectInput>
      </Field>
    </Modal>
  );
}

function SignatureModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch, addOverlays } = useEditor();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
  };

  const apply = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const img = new Image();
    img.onload = () => {
      const slot = state.slots[state.currentPage];
      if (!slot) return;
      const overlay = makeSignatureOverlay(state.currentPage, 0, 0, dataUrl, img.width, img.height);
      overlay.x = (slot.width - overlay.width) / 2;
      overlay.y = slot.height - overlay.height - 60;
      addOverlays([overlay]);
      dispatch({ type: 'SET_SELECTION', payload: [overlay.id] });
      onClose();
    };
    img.src = dataUrl;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#111827';
    const onMove = (e: PointerEvent) => {
      if (!drawing.current) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
      ctx.lineTo(x, y);
      ctx.stroke();
      setHasInk(true);
    };
    canvas.addEventListener('pointerdown', (e) => {
      drawing.current = true;
      canvas.setPointerCapture(e.pointerId);
      const rect = canvas.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(((e.clientX - rect.left) / rect.width) * canvas.width, ((e.clientY - rect.top) / rect.height) * canvas.height);
    });
    canvas.addEventListener('pointermove', onMove);
    const end = () => {
      drawing.current = false;
      ctx.beginPath();
    };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    return () => {
      canvas.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <Modal
      title="Add your signature"
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={clear}>Clear</GhostButton>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={apply} disabled={!hasInk}>
            Place on page
          </PrimaryButton>
        </>
      }
    >
      <p className="text-sm text-gray-600 dark:text-gray-300">Draw your signature in the box below. It will be placed at the bottom of the current page.</p>
      <canvas
        ref={canvasRef}
        width={640}
        height={240}
        className="w-full cursor-crosshair touch-none rounded-lg border-2 border-dashed border-gray-300 bg-white dark:border-gray-600"
        style={{ height: 180 }}
      />
    </Modal>
  );
}
