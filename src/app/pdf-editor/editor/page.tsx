import type { Metadata } from 'next';
import { EditorProvider } from './EditorContext';
import EditorApp from './components/EditorApp';

export const metadata: Metadata = {
  title: 'PDF Editor',
  description:
    'Free browser-based PDF editor. Annotate, add text, shapes, images and signatures, fill forms, rearrange pages, and export — all locally in your browser.',
  alternates: {
    canonical: '/pdf-editor/editor',
  },
  openGraph: {
    type: 'website',
    url: '/pdf-editor/editor',
    siteName: 'ToolboxHQ',
    title: 'PDF Editor - Annotate & Edit PDFs in Your Browser',
    description:
      'Annotate, add text, shapes, images and signatures, fill forms, rearrange pages, and export — all locally in your browser.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'PDF Editor - Annotate & Edit PDFs in Your Browser',
    description:
      'Annotate, add text, shapes, images and signatures, fill forms, rearrange pages, and export — all locally in your browser.',
  },
};

export default function PdfEditorPage() {
  return (
    <EditorProvider>
      <EditorApp />
    </EditorProvider>
  );
}
