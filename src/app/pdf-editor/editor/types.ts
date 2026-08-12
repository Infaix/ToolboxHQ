import type { PDFDocumentProxy } from 'pdfjs-dist';

export type ToolId =
  | 'select'
  | 'edit'
  | 'hand'
  | 'text'
  | 'highlight'
  | 'underline'
  | 'strikethrough'
  | 'draw'
  | 'eraser'
  | 'rect'
  | 'ellipse'
  | 'line'
  | 'arrow'
  | 'image'
  | 'signature'
  | 'note'
  | 'redact'
  | 'form-text'
  | 'form-checkbox'
  | 'form-radio'
  | 'form-dropdown'
  | 'form-date'
  | 'pages';

export type OverlayType =
  | 'text'
  | 'image'
  | 'signature'
  | 'note'
  | 'ink'
  | 'highlight'
  | 'underline'
  | 'strikethrough'
  | 'rect'
  | 'ellipse'
  | 'line'
  | 'arrow'
  | 'form-text'
  | 'form-dropdown'
  | 'form-date'
  | 'form-checkbox'
  | 'form-radio'
  | 'redaction';

export interface BaseOverlay {
  id: string;
  page: number;
  type: OverlayType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked?: boolean;
}

export interface TextOverlay extends BaseOverlay {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: 'left' | 'center' | 'right';
  color: string;
  background: string | null;
  lineHeight: number;
  letterSpacing: number;
}

export interface ImageOverlay extends BaseOverlay {
  type: 'image' | 'signature';
  src: string;
  naturalWidth: number;
  naturalHeight: number;
}

export interface NoteOverlay extends BaseOverlay {
  type: 'note';
  text: string;
  color: string;
  fontSize: number;
}

export interface InkOverlay extends BaseOverlay {
  type: 'ink';
  points: { x: number; y: number }[];
  stroke: string;
  strokeWidth: number;
  smooth: boolean;
}

export interface MarkOverlay extends BaseOverlay {
  type: 'highlight' | 'underline' | 'strikethrough';
  color: string;
}

export interface RectOverlay extends BaseOverlay {
  type: 'rect' | 'ellipse';
  fill: string | null;
  stroke: string;
  strokeWidth: number;
}

export interface LineOverlay extends BaseOverlay {
  type: 'line' | 'arrow';
  stroke: string;
  strokeWidth: number;
}

export interface FormTextOverlay extends BaseOverlay {
  type: 'form-text' | 'form-dropdown' | 'form-date';
  value: string;
  placeholder: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  borderColor: string;
  backgroundColor: string;
}

export interface FormChoiceOverlay extends BaseOverlay {
  type: 'form-checkbox' | 'form-radio';
  checked: boolean;
  borderColor: string;
  checkColor: string;
}

export interface RedactionOverlay extends BaseOverlay {
  type: 'redaction';
  label: string;
}

export type Overlay =
  | TextOverlay
  | ImageOverlay
  | NoteOverlay
  | InkOverlay
  | MarkOverlay
  | RectOverlay
  | LineOverlay
  | FormTextOverlay
  | FormChoiceOverlay
  | RedactionOverlay;

export interface DocSlot {
  docId: string;
  origIndex: number;
  /** Clockwise degrees as rendered (includes the page's intrinsic rotation). */
  rotation: number;
  /** The page's intrinsic /Rotate from the source document. */
  intrinsicRotation: number;
  width: number;
  height: number;
}

export interface DocRecord {
  id: string;
  name: string;
  pdf: PDFDocumentProxy;
  bytes: ArrayBuffer;
  fileSize: number;
}

export interface DocMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
}

export type ViewMode = 'continuous' | 'single';
export type FitMode = 'custom' | 'width' | 'page' | 'actual';

export interface EditorError {
  title: string;
  message: string;
}

export interface DecorationScope {
  all: boolean;
  selected: boolean;
  current: boolean;
}

export interface EditorState {
  status: 'empty' | 'loading' | 'ready' | 'error';
  error: EditorError | null;
  docs: Record<string, DocRecord>;
  slots: DocSlot[];
  overlays: Overlay[];
  fileName: string;
  fileSize: number;
  mainDocId: string;
  metadata: DocMetadata;
  currentPage: number;
  selection: string[];
  tool: ToolId;
  zoom: number;
  fitMode: FitMode;
  viewMode: ViewMode;
  isFullscreen: boolean;
  history: { slots: DocSlot[]; overlays: Overlay[] }[];
  redoStack: { slots: DocSlot[]; overlays: Overlay[] }[];
  isBusy: boolean;
  busyLabel: string | null;
  busyProgress: number | null;
  modal: ModalId | null;
  search: {
    query: string;
    open: boolean;
    index: number;
    total: number;
    perPage: number[];
    searching: boolean;
    rectsByPage: { x: number; y: number; width: number; height: number }[][];
  };
  toast: { id: number; message: string; kind: 'info' | 'warn' | 'error' } | null;
  lastDocBytes: ArrayBuffer | null;
}

export type ModalId =
  | 'signature'
  | 'watermark'
  | 'page-numbers'
  | 'header-footer'
  | 'add-page'
  | 'insert-pdf'
  | 'extract'
  | 'metadata'
  | 'replace-page'
  | 'export'
  | 'from-images'
  | null;

export const MAX_HISTORY = 100;

export type CompressionLevel = 'none' | 'low' | 'medium' | 'high';

export interface ExportPdfOptions {
  /** Password required to open the exported PDF. Empty/undefined means no protection. */
  password?: string;
  /** Rasterize pages to JPEG to shrink the file size. */
  compression?: CompressionLevel;
  /** Skip writing the document information (title, author, producer, dates). */
  removeMetadata?: boolean;
}

export type ImageExportFormat = 'png' | 'jpeg';
export type ImageExportScale = 1 | 2 | 3;

export interface ImageExportOptions {
  format: ImageExportFormat;
  scale: ImageExportScale;
  quality: number;
  range: 'current' | 'all';
}

export type ImagePdfPageSize = 'fit' | 'a4' | 'letter';
