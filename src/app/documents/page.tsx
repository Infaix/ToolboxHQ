import type { Metadata } from 'next';
import ToolCategoryPage from '@/components/ToolCategoryPage';

export const metadata: Metadata = {
  title: 'Document Tools',
  description: 'Document utilities for everyday tasks — converted and processed locally in your browser.',
};

export default function DocumentToolsPage() {
  return (
    <ToolCategoryPage
      group="documents"
      title="Document Tools"
      description="Convert and work with documents. This section of the toolbox is growing."
    />
  );
}
