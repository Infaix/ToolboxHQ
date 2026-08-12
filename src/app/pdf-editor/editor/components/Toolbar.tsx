'use client';

import { useRef, useState } from 'react';
import { useEditor } from '../EditorContext';
import type { ToolId } from '../types';
import { Icons } from './icons';
import { ToolButton } from './ui';

interface ToolDef {
  id: ToolId;
  label: string;
  icon: (p: { size?: number }) => React.ReactElement;
}

const MAIN_TOOLS: ToolDef[] = [
  { id: 'select', label: 'Select', icon: Icons.select },
  { id: 'edit', label: 'Edit content', icon: Icons.edit },
  { id: 'hand', label: 'Hand', icon: Icons.hand },
  { id: 'text', label: 'Text', icon: Icons.text },
  { id: 'highlight', label: 'Highlight', icon: Icons.highlight },
  { id: 'underline', label: 'Underline', icon: Icons.underline },
  { id: 'strikethrough', label: 'Strike', icon: Icons.strikethrough },
  { id: 'draw', label: 'Draw', icon: Icons.draw },
  { id: 'eraser', label: 'Eraser', icon: Icons.eraser },
];

const SHAPE_TOOLS: ToolDef[] = [
  { id: 'rect', label: 'Rectangle', icon: Icons.shapes },
  { id: 'ellipse', label: 'Ellipse', icon: Icons.shapes },
  { id: 'line', label: 'Line', icon: Icons.line },
  { id: 'arrow', label: 'Arrow', icon: Icons.arrow },
];

const FORM_TOOLS: ToolDef[] = [
  { id: 'form-text', label: 'Text field', icon: Icons.textField },
  { id: 'form-checkbox', label: 'Checkbox', icon: Icons.checkbox },
  { id: 'form-radio', label: 'Radio', icon: Icons.radio },
  { id: 'form-dropdown', label: 'Dropdown', icon: Icons.dropdown },
  { id: 'form-date', label: 'Date', icon: Icons.calendar },
];

const MORE_ACTIONS = [
  { id: 'watermark', label: 'Watermark', icon: Icons.watermark },
  { id: 'page-numbers', label: 'Page numbers', icon: Icons.pageNumber },
  { id: 'header-footer', label: 'Header & footer', icon: Icons.headerFooter },
  { id: 'metadata', label: 'Document info', icon: Icons.file },
  { id: 'extract', label: 'Extract pages', icon: Icons.pages },
  { id: 'from-images', label: 'PDF from images', icon: Icons.image },
] as const;

export default function Toolbar() {
  const { state, dispatch, setTool, addOverlays } = useEditor();
  const [openPopover, setOpenPopover] = useState<null | 'shapes' | 'form' | 'more'>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isShapeTool = ['rect', 'ellipse', 'line', 'arrow'].includes(state.tool);
  const isFormTool = state.tool.startsWith('form-');

  const pickTool = (tool: ToolId) => {
    setTool(tool);
    setOpenPopover(null);
  };

  const handleImagePick = async (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) {
      dispatch({ type: 'SHOW_TOAST', payload: { message: 'Please choose an image file.', kind: 'warn' } });
      return;
    }
    const src = await readAsDataUrl(file);
    const img = new Image();
    img.onload = () => {
      const slot = state.slots[state.currentPage];
      if (!slot) return;
      const targetW = Math.min(240, slot.width * 0.5);
      const ratio = img.naturalHeight / Math.max(1, img.naturalWidth);
      const overlay = {
        id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        page: state.currentPage,
        type: 'image' as const,
        x: (slot.width - targetW) / 2,
        y: (slot.height - targetW * ratio) / 2,
        width: targetW,
        height: targetW * ratio,
        rotation: 0,
        opacity: 1,
        src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      };
      addOverlays([overlay]);
      dispatch({ type: 'SET_SELECTION', payload: [overlay.id] });
      setTool('select');
    };
    img.onerror = () => dispatch({ type: 'SHOW_TOAST', payload: { message: 'That image could not be read.', kind: 'error' } });
    img.src = src;
  };

  const moreAction = (id: (typeof MORE_ACTIONS)[number]['id']) => {
    setOpenPopover(null);
    if (id === 'watermark') dispatch({ type: 'SET_MODAL', payload: 'watermark' });
    else if (id === 'page-numbers') dispatch({ type: 'SET_MODAL', payload: 'page-numbers' });
    else if (id === 'header-footer') dispatch({ type: 'SET_MODAL', payload: 'header-footer' });
    else if (id === 'metadata') dispatch({ type: 'SET_MODAL', payload: 'metadata' });
    else if (id === 'extract') dispatch({ type: 'SET_MODAL', payload: 'extract' });
    else if (id === 'from-images') dispatch({ type: 'SET_MODAL', payload: 'from-images' });
  };

  return (
    <div className="hidden w-14 flex-col items-stretch gap-0.5 overflow-y-auto border-r border-gray-200 bg-white py-2 lg:flex dark:border-gray-800 dark:bg-gray-900">
      {MAIN_TOOLS.map((tool) => (
        <ToolButton
          key={tool.id}
          active={state.tool === tool.id}
          label={tool.label}
          onClick={() => pickTool(tool.id)}
        >
          <tool.icon size={19} />
        </ToolButton>
      ))}

      {/* Shapes */}
      <div className="relative">
        <ToolButton active={isShapeTool} label="Shapes" onClick={() => setOpenPopover(openPopover === 'shapes' ? null : 'shapes')}>
          <Icons.shapes size={19} />
        </ToolButton>
        {openPopover === 'shapes' && (
          <Popover onClose={() => setOpenPopover(null)}>
            {SHAPE_TOOLS.map((tool) => (
              <PopoverItem key={tool.id} active={state.tool === tool.id} onClick={() => pickTool(tool.id)}>
                <tool.icon size={16} />
                <span>{tool.label}</span>
              </PopoverItem>
            ))}
          </Popover>
        )}
      </div>

      <ToolButton label="Image" onClick={() => fileInputRef.current?.click()}>
        <Icons.image size={19} />
      </ToolButton>
      <ToolButton
        active={state.tool === 'signature'}
        label="Sign"
        onClick={() => {
          setTool('signature');
          dispatch({ type: 'SET_MODAL', payload: 'signature' });
        }}
      >
        <Icons.signature size={19} />
      </ToolButton>
      <ToolButton label="Note" active={state.tool === 'note'} onClick={() => pickTool('note')}>
        <Icons.note size={19} />
      </ToolButton>

      {/* Forms */}
      <div className="relative">
        <ToolButton active={isFormTool} label="Form" onClick={() => setOpenPopover(openPopover === 'form' ? null : 'form')}>
          <Icons.form size={19} />
        </ToolButton>
        {openPopover === 'form' && (
          <Popover onClose={() => setOpenPopover(null)}>
            {FORM_TOOLS.map((tool) => (
              <PopoverItem key={tool.id} active={state.tool === tool.id} onClick={() => pickTool(tool.id)}>
                <tool.icon size={16} />
                <span>{tool.label}</span>
              </PopoverItem>
            ))}
          </Popover>
        )}
      </div>

      <ToolButton active={state.tool === 'redact'} label="Redact" onClick={() => pickTool('redact')}>
        <Icons.redact size={19} />
      </ToolButton>

      <div className="my-2 border-t border-gray-200 dark:border-gray-800" />

      {/* More */}
      <div className="relative">
        <ToolButton label="More" onClick={() => setOpenPopover(openPopover === 'more' ? null : 'more')}>
          <Icons.more size={19} />
        </ToolButton>
        {openPopover === 'more' && (
          <Popover onClose={() => setOpenPopover(null)}>
            {MORE_ACTIONS.map((action) => (
              <PopoverItem key={action.id} onClick={() => moreAction(action.id)}>
                <action.icon size={16} />
                <span>{action.label}</span>
              </PopoverItem>
            ))}
          </Popover>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          handleImagePick(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}

function Popover({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} aria-hidden="true" />
      <div className="absolute left-14 top-0 z-40 w-44 rounded-lg border border-gray-200 bg-white p-1 shadow-xl dark:border-gray-700 dark:bg-gray-800">
        {children}
      </div>
    </>
  );
}

function PopoverItem({ children, onClick, active }: { children: React.ReactNode; onClick: () => void; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm ${
        active ? 'bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}
