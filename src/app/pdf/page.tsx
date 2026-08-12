import type { Metadata } from 'next';
import ToolCategoryPage from '@/components/ToolCategoryPage';

export const metadata: Metadata = {
  title: 'PDF Tools',
  description: 'Edit, merge, split and compress PDFs — free browser-based PDF tools that never upload your files.',
};

export default function PdfToolsPage() {
  return (
    <ToolCategoryPage
      group="pdf"
      title="PDF Tools"
      description="Edit, merge, split and work with PDFs — all in your browser, with your files never leaving your device."
    />
  );
}
