'use client';

import { useEditor } from '../EditorContext';
import type { Overlay } from '../types';
import { formatBytes } from '../lib/textUtils';
import { getFontOption } from '../lib/textUtils';
import { FONT_OPTIONS } from '../lib/textUtils';
import { PanelSection, Field, TextInput, NumberInput, SelectInput, ColorInput, SwatchRow, SliderInput, IconButton } from './ui';
import { Icons } from './icons';

export interface InspectorPanelProps {
  panel: 'properties' | 'layers';
  onPanelChange: (panel: 'properties' | 'layers') => void;
}

const TABS: { id: 'properties' | 'layers'; label: string }[] = [
  { id: 'properties', label: 'Properties' },
  { id: 'layers', label: 'Layers' },
];

export default function InspectorPanel({ panel, onPanelChange }: InspectorPanelProps) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-l border-gray-200 bg-white md:flex dark:border-gray-800 dark:bg-gray-900">
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onPanelChange(tab.id)}
            className={`flex-1 px-2 py-2 text-xs font-semibold uppercase tracking-wide ${
              panel === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        {panel === 'properties' ? <PropertiesTab /> : <LayersTab />}
      </div>
    </aside>
  );
}

function PropertiesTab() {
  const { state } = useEditor();
  const selected = state.overlays.filter((o) => state.selection.includes(o.id));

  if (selected.length === 0) {
    return (
      <>
        <PanelSection title="Document">
          <DocumentInfo />
        </PanelSection>
        <PanelSection title="Page">
          <PageInfo />
        </PanelSection>
      </>
    );
  }

  if (selected.length === 1) {
    const overlay = selected[0];
    return (
      <>
        <PanelSection title={overlayTypeLabel(overlay.type)}>
          <PositionControls overlay={overlay} />
        </PanelSection>
        <TypeSpecific overlay={overlay} />
      </>
    );
  }

  return (
    <PanelSection title={`${selected.length} selected`}>
      <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        <p>Apply changes below to all selected items.</p>
        <MultiControls overlays={selected} />
      </div>
    </PanelSection>
  );
}

function DocumentInfo() {
  const { state } = useEditor();
  const slot = state.slots[state.currentPage];
  return (
    <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-800">
      <Row label="File" value={state.fileName || 'Untitled'} />
      <Row label="Size" value={formatBytes(state.fileSize)} />
      <Row label="Pages" value={String(state.slots.length)} />
      <Row label="Current" value={slot ? `${slot.width.toFixed(0)} × ${slot.height.toFixed(0)} pt` : '—'} />
      <p className="pt-1 text-xs text-gray-500 dark:text-gray-400">Select an item on the page to edit its properties.</p>
    </div>
  );
}

function PageInfo() {
  const { state } = useEditor();
  const count = state.overlays.filter((o) => o.page === state.currentPage).length;
  return (
    <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-800">
      <Row label="Number" value={`Page ${state.currentPage + 1} of ${state.slots.length}`} />
      <Row label="Items" value={String(count)} />
      <Row label="Search" value={state.search.total > 0 ? `${state.search.total} matches` : 'No matches'} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="truncate font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

function PositionControls({ overlay }: { overlay: Overlay }) {
  const { updateOverlay } = useEditor();
  const set = (patch: Partial<Overlay>) => updateOverlay(overlay.id, patch);
  return (
    <div className="grid grid-cols-2 gap-2">
      <Field label="X">
        <NumberInput value={Math.round(overlay.x)} onChange={(e) => set({ x: Number(e.target.value) || 0 })} />
      </Field>
      <Field label="Y">
        <NumberInput value={Math.round(overlay.y)} onChange={(e) => set({ y: Number(e.target.value) || 0 })} />
      </Field>
      <Field label="Width">
        <NumberInput value={Math.round(overlay.width)} onChange={(e) => set({ width: Number(e.target.value) || 0 })} />
      </Field>
      <Field label="Height">
        <NumberInput value={Math.round(overlay.height)} onChange={(e) => set({ height: Number(e.target.value) || 0 })} />
      </Field>
      <Field label="Rotation">
        <NumberInput value={Math.round(overlay.rotation)} onChange={(e) => set({ rotation: Number(e.target.value) || 0 })} />
      </Field>
      <div className="flex items-end">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Opacity</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(overlay.opacity * 100)}
            onChange={(e) => set({ opacity: Number(e.target.value) / 100 })}
            aria-label="Opacity"
            className="w-full accent-blue-600"
          />
        </label>
        <span className="ml-2 w-9 shrink-0 text-right text-xs tabular-nums text-gray-600 dark:text-gray-400">{Math.round(overlay.opacity * 100)}%</span>
      </div>
    </div>
  );
}

function MultiControls({ overlays }: { overlays: Overlay[] }) {
  const { updateOverlay } = useEditor();
  return (
    <div className="grid grid-cols-2 gap-2">
      <Field label="X">
        <NumberInput
          defaultValue={overlays[0].x}
          onBlur={(e) => {
            const v = Number(e.target.value);
            if (!Number.isNaN(v)) overlays.forEach((o) => updateOverlay(o.id, { x: v }));
          }}
        />
      </Field>
      <Field label="Y">
        <NumberInput
          defaultValue={overlays[0].y}
          onBlur={(e) => {
            const v = Number(e.target.value);
            if (!Number.isNaN(v)) overlays.forEach((o) => updateOverlay(o.id, { y: v }));
          }}
        />
      </Field>
    </div>
  );
}

function TypeSpecific({ overlay }: { overlay: Overlay }) {
  switch (overlay.type) {
    case 'text':
      return <TextControls overlay={overlay} />;
    case 'note':
      return <NoteControls overlay={overlay} />;
    case 'image':
    case 'signature':
      return <ImageControls overlay={overlay} />;
    case 'highlight':
    case 'underline':
    case 'strikethrough':
      return <MarkControls overlay={overlay} />;
    case 'rect':
    case 'ellipse':
      return <ShapeControls overlay={overlay} />;
    case 'line':
    case 'arrow':
      return <LineControls overlay={overlay} />;
    case 'form-text':
    case 'form-dropdown':
    case 'form-date':
      return <FormFieldControls overlay={overlay} />;
    case 'form-checkbox':
    case 'form-radio':
      return <ChoiceControls overlay={overlay} />;
    case 'redaction':
      return <RedactionControls overlay={overlay} />;
    case 'ink':
      return (
        <PanelSection title="Ink">
          <p className="text-xs text-gray-500 dark:text-gray-400">Drawing strokes cannot be edited after creation.</p>
        </PanelSection>
      );
    default:
      return null;
  }
}

function TextControls({ overlay }: { overlay: Extract<Overlay, { type: 'text' }> }) {
  const { updateOverlay } = useEditor();
  const set = (patch: Partial<Overlay>) => updateOverlay(overlay.id, patch);
  const font = getFontOption(overlay.fontFamily);
  return (
    <>
      <PanelSection title="Text">
        <Field label="Content">
          <textarea
            value={overlay.text}
            onChange={(e) => set({ text: e.target.value })}
            rows={4}
            className="w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Font">
            <SelectInput value={overlay.fontFamily} onChange={(e) => set({ fontFamily: e.target.value })}>
              {FONT_OPTIONS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Size">
            <NumberInput value={overlay.fontSize} min={6} max={200} onChange={(e) => set({ fontSize: Number(e.target.value) || 12 })} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-1">
          <IconButton title="Bold" active={overlay.bold} onClick={() => set({ bold: !overlay.bold })}>
            <Icons.bold size={16} />
          </IconButton>
          <IconButton title="Italic" active={overlay.italic} onClick={() => set({ italic: !overlay.italic })}>
            <Icons.italic size={16} />
          </IconButton>
          <IconButton title="Underline" active={overlay.underline} onClick={() => set({ underline: !overlay.underline })}>
            <Icons.underline size={16} />
          </IconButton>
          <span className="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-600" />
          <IconButton title="Align left" active={overlay.align === 'left'} onClick={() => set({ align: 'left' })}>
            <Icons.textAlignLeft size={16} />
          </IconButton>
          <IconButton title="Align center" active={overlay.align === 'center'} onClick={() => set({ align: 'center' })}>
            <Icons.textAlignCenter size={16} />
          </IconButton>
          <IconButton title="Align right" active={overlay.align === 'right'} onClick={() => set({ align: 'right' })}>
            <Icons.textAlignRight size={16} />
          </IconButton>
        </div>
      </PanelSection>
      <PanelSection title="Style">
        <Field label="Color">
          <ColorInput value={overlay.color} onChange={(v) => set({ color: v })} label="Text color" />
        </Field>
        <SwatchRow value={overlay.color} onChange={(v) => set({ color: v })} label="Text color" />
        <Field label="Background">
          <div className="flex items-center gap-2">
            <ColorInput value={overlay.background ?? '#ffffff'} onChange={(v) => set({ background: v })} label="Background color" />
            <button
              type="button"
              onClick={() => set({ background: null })}
              className="rounded-md border border-gray-300 px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              None
            </button>
          </div>
        </Field>
      </PanelSection>
      <PanelSection title="Layout">
        <SliderInput label="Line height" value={Math.round(overlay.lineHeight * 100)} min={80} max={300} onChange={(v) => set({ lineHeight: v / 100 })} />
        <SliderInput label="Letter spacing" value={overlay.letterSpacing} min={-5} max={20} onChange={(v) => set({ letterSpacing: v })} />
        <span className="text-xs text-gray-400">Font: {font.css}</span>
      </PanelSection>
    </>
  );
}

function NoteControls({ overlay }: { overlay: Extract<Overlay, { type: 'note' }> }) {
  const { updateOverlay } = useEditor();
  const set = (patch: Partial<Overlay>) => updateOverlay(overlay.id, patch);
  return (
    <PanelSection title="Sticky note">
      <Field label="Text">
        <textarea value={overlay.text} onChange={(e) => set({ text: e.target.value })} rows={4} className="w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
      </Field>
      <Field label="Color">
        <SwatchRow value={overlay.color} onChange={(v) => set({ color: v })} label="Note color" />
      </Field>
      <Field label="Font size">
        <NumberInput value={overlay.fontSize} min={8} max={48} onChange={(e) => set({ fontSize: Number(e.target.value) || 12 })} />
      </Field>
    </PanelSection>
  );
}

function ImageControls({ overlay }: { overlay: Extract<Overlay, { type: 'image' | 'signature' }> }) {
  const { updateOverlay } = useEditor();
  return (
    <PanelSection title={overlay.type === 'signature' ? 'Signature' : 'Image'}>
      <Row label="Dimensions" value={`${overlay.naturalWidth} × ${overlay.naturalHeight}px`} />
      <div className="mt-2">
        <SliderInput label="Opacity" value={Math.round(overlay.opacity * 100)} onChange={(v) => updateOverlay(overlay.id, { opacity: v / 100 })} />
      </div>
    </PanelSection>
  );
}

function MarkControls({ overlay }: { overlay: Extract<Overlay, { type: 'highlight' | 'underline' | 'strikethrough' }> }) {
  const { updateOverlay } = useEditor();
  return (
    <PanelSection title="Style">
      <Field label="Color">
        <ColorInput value={overlay.color} onChange={(v) => updateOverlay(overlay.id, { color: v })} label="Mark color" />
      </Field>
      <SwatchRow value={overlay.color} onChange={(v) => updateOverlay(overlay.id, { color: v })} label="Mark color" />
    </PanelSection>
  );
}

function ShapeControls({ overlay }: { overlay: Extract<Overlay, { type: 'rect' | 'ellipse' }> }) {
  const { updateOverlay } = useEditor();
  const set = (patch: Partial<Overlay>) => updateOverlay(overlay.id, patch);
  return (
    <PanelSection title="Style">
      <Field label="Fill">
        <div className="flex items-center gap-2">
          <ColorInput value={overlay.fill ?? '#ffffff'} onChange={(v) => set({ fill: v })} label="Fill color" />
          <button type="button" onClick={() => set({ fill: null })} className="rounded-md border border-gray-300 px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
            None
          </button>
        </div>
      </Field>
      <Field label="Stroke">
        <ColorInput value={overlay.stroke} onChange={(v) => set({ stroke: v })} label="Stroke color" />
      </Field>
      <SwatchRow value={overlay.stroke} onChange={(v) => set({ stroke: v })} label="Stroke color" />
      <Field label="Stroke width">
        <NumberInput value={overlay.strokeWidth} min={0.5} max={40} step={0.5} onChange={(e) => set({ strokeWidth: Number(e.target.value) || 1 })} />
      </Field>
    </PanelSection>
  );
}

function LineControls({ overlay }: { overlay: Extract<Overlay, { type: 'line' | 'arrow' }> }) {
  const { updateOverlay } = useEditor();
  const set = (patch: Partial<Overlay>) => updateOverlay(overlay.id, patch);
  return (
    <PanelSection title="Style">
      <Field label="Color">
        <ColorInput value={overlay.stroke} onChange={(v) => set({ stroke: v })} label="Line color" />
      </Field>
      <SwatchRow value={overlay.stroke} onChange={(v) => set({ stroke: v })} label="Line color" />
      <Field label="Stroke width">
        <NumberInput value={overlay.strokeWidth} min={0.5} max={40} step={0.5} onChange={(e) => set({ strokeWidth: Number(e.target.value) || 1 })} />
      </Field>
    </PanelSection>
  );
}

function FormFieldControls({ overlay }: { overlay: Extract<Overlay, { type: 'form-text' | 'form-dropdown' | 'form-date' }> }) {
  const { updateOverlay } = useEditor();
  const set = (patch: Partial<Overlay>) => updateOverlay(overlay.id, patch);
  return (
    <PanelSection title="Field">
      <Field label="Value">
        <TextInput value={overlay.value} onChange={(e) => set({ value: e.target.value })} placeholder={overlay.placeholder} />
      </Field>
      <Field label="Placeholder">
        <TextInput value={overlay.placeholder} onChange={(e) => set({ placeholder: e.target.value })} />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Font size">
          <NumberInput value={overlay.fontSize} min={6} max={72} onChange={(e) => set({ fontSize: Number(e.target.value) || 12 })} />
        </Field>
        <Field label="Font">
          <SelectInput value={overlay.fontFamily} onChange={(e) => set({ fontFamily: e.target.value })}>
            {FONT_OPTIONS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </SelectInput>
        </Field>
      </div>
      <Field label="Text color">
        <ColorInput value={overlay.color} onChange={(v) => set({ color: v })} label="Text color" />
      </Field>
      <Field label="Border">
        <ColorInput value={overlay.borderColor} onChange={(v) => set({ borderColor: v })} label="Border color" />
      </Field>
      <Field label="Background">
        <ColorInput value={overlay.backgroundColor} onChange={(v) => set({ backgroundColor: v })} label="Background color" />
      </Field>
    </PanelSection>
  );
}

function ChoiceControls({ overlay }: { overlay: Extract<Overlay, { type: 'form-checkbox' | 'form-radio' }> }) {
  const { updateOverlay } = useEditor();
  const set = (patch: Partial<Overlay>) => updateOverlay(overlay.id, patch);
  return (
    <PanelSection title="Field">
      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input type="checkbox" checked={overlay.checked} onChange={(e) => set({ checked: e.target.checked })} className="accent-blue-600" />
        Checked
      </label>
      <Field label="Border">
        <ColorInput value={overlay.borderColor} onChange={(v) => set({ borderColor: v })} label="Border color" />
      </Field>
      <Field label="Check">
        <ColorInput value={overlay.checkColor} onChange={(v) => set({ checkColor: v })} label="Check color" />
      </Field>
    </PanelSection>
  );
}

function RedactionControls({ overlay }: { overlay: Extract<Overlay, { type: 'redaction' }> }) {
  const { updateOverlay } = useEditor();
  return (
    <PanelSection title="Redaction">
      <Field label="Label">
        <TextInput value={overlay.label} onChange={(e) => updateOverlay(overlay.id, { label: e.target.value })} />
      </Field>
      <p className="text-xs text-gray-500 dark:text-gray-400">Redactions are baked into the exported PDF and cannot be removed.</p>
    </PanelSection>
  );
}

function LayersTab() {
  const { state, dispatch, removeOverlays, updateOverlay } = useEditor();
  const pageOverlays = state.overlays.filter((o) => o.page === state.currentPage);
  return (
    <div className="space-y-1">
      {pageOverlays.length === 0 && (
        <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">No items on this page yet.</p>
      )}
      {pageOverlays.map((overlay) => {
        const selected = state.selection.includes(overlay.id);
        return (
          <div
            key={overlay.id}
            className={`flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-sm ${
              selected ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40' : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            onClick={() => dispatch({ type: 'SET_SELECTION', payload: [overlay.id] })}
          >
            <span className="flex-1 truncate text-gray-700 dark:text-gray-300">{overlayTypeLabel(overlay.type)}</span>
            <button
              type="button"
              title={overlay.locked ? 'Unlock' : 'Lock'}
              aria-label={overlay.locked ? 'Unlock' : 'Lock'}
              onClick={(e) => {
                e.stopPropagation();
                updateOverlay(overlay.id, { locked: !overlay.locked });
              }}
              className={`rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700 ${overlay.locked ? 'text-amber-500' : 'text-gray-400'}`}
            >
              <Icons.lock size={14} />
            </button>
            <button
              type="button"
              title="Delete"
              aria-label="Delete"
              onClick={(e) => {
                e.stopPropagation();
                removeOverlays([overlay.id]);
              }}
              className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40"
            >
              <Icons.trash size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function overlayTypeLabel(type: Overlay['type']): string {
  const labels: Record<string, string> = {
    text: 'Text',
    image: 'Image',
    signature: 'Signature',
    note: 'Sticky note',
    ink: 'Drawing',
    highlight: 'Highlight',
    underline: 'Underline',
    strikethrough: 'Strikethrough',
    rect: 'Rectangle',
    ellipse: 'Ellipse',
    line: 'Line',
    arrow: 'Arrow',
    'form-text': 'Text field',
    'form-dropdown': 'Dropdown',
    'form-date': 'Date field',
    'form-checkbox': 'Checkbox',
    'form-radio': 'Radio button',
    redaction: 'Redaction',
  };
  return labels[type] ?? type;
}
