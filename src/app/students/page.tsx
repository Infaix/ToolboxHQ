import type { Metadata } from 'next';
import ToolCategoryPage from '@/components/ToolCategoryPage';

export const metadata: Metadata = {
  title: 'Student Tools',
  description: 'Useful free tools for school and study — word counters, generators and more, right in your browser.',
};

export default function StudentToolsPage() {
  return (
    <ToolCategoryPage
      group="students"
      title="Student Tools"
      description="Useful tools for school and study. This section of the toolbox is growing."
    />
  );
}
