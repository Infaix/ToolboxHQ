import type { Metadata } from 'next';
import ToolCategoryPage from '@/components/ToolCategoryPage';

export const metadata: Metadata = {
  title: 'Image Tools',
  description: 'Convert and compress images online — JPG to PNG, PNG to JPG and more, processed locally in your browser.',
};

export default function ImageToolsPage() {
  return (
    <ToolCategoryPage
      group="images"
      title="Image Tools"
      description="Convert, compress and resize images without uploading them anywhere."
    />
  );
}
