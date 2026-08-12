import type { Overlay } from '../types';
import { makeId } from './utils';

export function makeTextOverlay(page: number, x: number, y: number): Extract<Overlay, { type: 'text' }> {
  return {
    id: makeId('txt'),
    page,
    type: 'text',
    x,
    y,
    width: 160,
    height: 42,
    rotation: 0,
    opacity: 1,
    text: '',
    fontFamily: 'helvetica',
    fontSize: 16,
    bold: false,
    italic: false,
    underline: false,
    align: 'left',
    color: '#111827',
    background: null,
    lineHeight: 1.3,
    letterSpacing: 0,
  };
}

export function makeMarkOverlay(
  page: number,
  x: number,
  y: number,
  width: number,
  height: number,
  type: 'highlight' | 'underline' | 'strikethrough'
): Overlay {
  return {
    id: makeId('mark'),
    page,
    type,
    x,
    y,
    width: Math.max(1, width),
    height: Math.max(type === 'highlight' ? 12 : 2, height),
    rotation: 0,
    opacity: type === 'highlight' ? 0.5 : 1,
    color: '#ffeb3b',
  };
}

export function makeShapeOverlay(page: number, x: number, y: number, type: 'rect' | 'ellipse'): Overlay {
  return {
    id: makeId('shape'),
    page,
    type,
    x,
    y,
    width: 0,
    height: 0,
    rotation: 0,
    opacity: 1,
    fill: null,
    stroke: '#3b82f6',
    strokeWidth: 2,
  };
}

export function makeLineOverlay(page: number, x: number, y: number, type: 'line' | 'arrow'): Overlay {
  return {
    id: makeId('line'),
    page,
    type,
    x,
    y,
    width: 0,
    height: 0,
    rotation: 0,
    opacity: 1,
    stroke: '#3b82f6',
    strokeWidth: 2,
  };
}

export function makeInkOverlay(page: number, x: number, y: number, stroke: string, strokeWidth: number): Overlay {
  return {
    id: makeId('ink'),
    page,
    type: 'ink',
    x,
    y,
    width: 0,
    height: 0,
    rotation: 0,
    opacity: 1,
    points: [{ x, y }],
    stroke,
    strokeWidth,
    smooth: true,
  };
}

export function makeNoteOverlay(page: number, x: number, y: number, color: string): Overlay {
  return {
    id: makeId('note'),
    page,
    type: 'note',
    x,
    y,
    width: 150,
    height: 110,
    rotation: 0,
    opacity: 1,
    text: 'Note',
    color,
    fontSize: 12,
  };
}

export function makeImageOverlay(
  page: number,
  x: number,
  y: number,
  src: string,
  naturalWidth: number,
  naturalHeight: number,
  targetWidth: number,
  targetHeight: number
): Overlay {
  return {
    id: makeId('img'),
    page,
    type: 'image',
    x,
    y,
    width: targetWidth,
    height: targetHeight,
    rotation: 0,
    opacity: 1,
    src,
    naturalWidth,
    naturalHeight,
  };
}

export function makeSignatureOverlay(page: number, x: number, y: number, src: string, naturalWidth: number, naturalHeight: number): Overlay {
  const maxW = Math.min(220, naturalWidth);
  const ratio = naturalHeight / Math.max(1, naturalWidth);
  return {
    id: makeId('sig'),
    page,
    type: 'signature',
    x,
    y,
    width: maxW,
    height: maxW * ratio,
    rotation: 0,
    opacity: 1,
    src,
    naturalWidth,
    naturalHeight,
  };
}

export function makeFormFieldOverlay(page: number, x: number, y: number, type: 'form-text' | 'form-dropdown' | 'form-date'): Overlay {
  return {
    id: makeId('frm'),
    page,
    type,
    x,
    y,
    width: type === 'form-text' ? 180 : 140,
    height: 26,
    rotation: 0,
    opacity: 1,
    value: '',
    placeholder: type === 'form-text' ? 'Enter text' : type === 'form-date' ? 'DD/MM/YYYY' : 'Select…',
    fontSize: 13,
    fontFamily: 'helvetica',
    color: '#111827',
    borderColor: '#64748b',
    backgroundColor: '#ffffff',
  };
}

export function makeChoiceOverlay(page: number, x: number, y: number, type: 'form-checkbox' | 'form-radio'): Overlay {
  return {
    id: makeId('choice'),
    page,
    type,
    x,
    y,
    width: 16,
    height: 16,
    rotation: 0,
    opacity: 1,
    checked: false,
    borderColor: '#64748b',
    checkColor: '#2563eb',
  };
}

export function makeRedactionOverlay(page: number, x: number, y: number, width: number, height: number): Overlay {
  return {
    id: makeId('redact'),
    page,
    type: 'redaction',
    x,
    y,
    width: Math.max(4, width),
    height: Math.max(4, height),
    rotation: 0,
    opacity: 1,
    label: 'Redacted',
  };
}

export function makeWatermarkOverlay(
  page: number,
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  fontSize: number,
  color: string,
  opacity: number,
  rotation: number
): Overlay {
  return {
    id: makeId('wm'),
    page,
    type: 'text',
    x,
    y,
    width,
    height,
    rotation,
    opacity,
    text,
    fontFamily: 'helvetica',
    fontSize,
    bold: false,
    italic: false,
    underline: false,
    align: 'center',
    color,
    background: null,
    lineHeight: 1.2,
    letterSpacing: 1,
  };
}

export function makePageNumberOverlay(
  page: number,
  x: number,
  y: number,
  width: number,
  text: string,
  fontSize: number,
  color: string
): Overlay {
  return {
    id: makeId('pgno'),
    page,
    type: 'text',
    x,
    y,
    width,
    height: fontSize * 1.4,
    rotation: 0,
    opacity: 1,
    text,
    fontFamily: 'helvetica',
    fontSize,
    bold: false,
    italic: false,
    underline: false,
    align: 'center',
    color,
    background: null,
    lineHeight: 1.2,
    letterSpacing: 0,
  };
}
