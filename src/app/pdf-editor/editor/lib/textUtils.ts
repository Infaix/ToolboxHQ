import { StandardFonts } from 'pdf-lib';

export interface FontOption {
  id: string;
  label: string;
  css: string;
  exportFont: StandardFonts;
}

export const FONT_OPTIONS: FontOption[] = [
  { id: 'helvetica', label: 'Helvetica', css: "Helvetica, Arial, sans-serif", exportFont: StandardFonts.Helvetica },
  { id: 'arial', label: 'Arial', css: "Arial, Helvetica, sans-serif", exportFont: StandardFonts.Helvetica },
  { id: 'times', label: 'Times New Roman', css: "'Times New Roman', Times, serif", exportFont: StandardFonts.TimesRoman },
  { id: 'georgia', label: 'Georgia', css: "Georgia, 'Times New Roman', serif", exportFont: StandardFonts.TimesRoman },
  { id: 'courier', label: 'Courier New', css: "'Courier New', Courier, monospace", exportFont: StandardFonts.Courier },
  { id: 'verdana', label: 'Verdana', css: "Verdana, Geneva, sans-serif", exportFont: StandardFonts.Helvetica },
];

export function getFontOption(id: string): FontOption {
  return FONT_OPTIONS.find((f) => f.id === id) ?? FONT_OPTIONS[0];
}

export function exportFontFor(id: string, bold: boolean, italic: boolean): { font: StandardFonts; name: string } {
  const opt = getFontOption(id);
  const base = opt.exportFont;
  let font = base;
  let name: string = base;
  if (base === StandardFonts.Helvetica) {
    if (bold && italic) {
      font = StandardFonts.HelveticaBoldOblique;
      name = 'Helvetica-BoldOblique';
    } else if (bold) {
      font = StandardFonts.HelveticaBold;
      name = 'Helvetica-Bold';
    } else if (italic) {
      font = StandardFonts.HelveticaOblique;
      name = 'Helvetica-Oblique';
    }
  } else if (base === StandardFonts.TimesRoman) {
    if (bold && italic) {
      font = StandardFonts.TimesRomanBoldItalic;
      name = 'Times-Roman-BoldItalic';
    } else if (bold) {
      font = StandardFonts.TimesRomanBold;
      name = 'Times-Roman-Bold';
    } else if (italic) {
      font = StandardFonts.TimesRomanItalic;
      name = 'Times-Roman-Italic';
    }
  } else if (base === StandardFonts.Courier) {
    if (bold && italic) {
      font = StandardFonts.CourierBoldOblique;
      name = 'Courier-BoldOblique';
    } else if (bold) {
      font = StandardFonts.CourierBold;
      name = 'Courier-Bold';
    } else if (italic) {
      font = StandardFonts.CourierOblique;
      name = 'Courier-Oblique';
    }
  }
  return { font, name };
}

/** Split text into lines honouring explicit newlines and soft-wrapping. */
export function wrapText(text: string, maxWidth: number, measure: (chunk: string) => number): string[] {
  const hardLines = text.split('\n');
  const lines: string[] = [];
  for (const hardLine of hardLines) {
    if (hardLine.length === 0) {
      lines.push('');
      continue;
    }
    const words = hardLine.split(' ');
    let current = '';
    for (const word of words) {
      // A single word wider than the box must be broken character by character
      // so it can never overflow invisibly (mirrors the editor's break-word).
      if (measure(word) > maxWidth) {
        if (current) {
          lines.push(current);
          current = '';
        }
        let piece = '';
        for (const ch of word) {
          if (piece && measure(piece + ch) > maxWidth) {
            lines.push(piece);
            piece = ch;
          } else {
            piece += ch;
          }
        }
        current = piece;
        continue;
      }
      const candidate = current === '' ? word : current + ' ' + word;
      if (measure(candidate) <= maxWidth || current === '') {
        current = candidate;
      } else {
        lines.push(current);
        current = word;
      }
    }
    lines.push(current);
  }
  return lines;
}

export const COLORS = [
  '#000000',
  '#ffffff',
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
];

export function hexToRgba(hex: string, alpha: number): string {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
