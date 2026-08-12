import type { Metadata } from 'next';
import ToolCategoryPage from '@/components/ToolCategoryPage';

export const metadata: Metadata = {
  title: 'Utilities',
  description: 'Calculators, converters and everyday utilities — free and processed locally in your browser.',
};

export default function UtilitiesPage() {
  return (
    <ToolCategoryPage
      group="utilities"
      title="Utilities"
      description="Calculators, converters and everyday tools. This section of the toolbox is growing."
    />
  );
}
