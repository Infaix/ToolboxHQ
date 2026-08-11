import { ReactNode } from 'react';

interface ToolContainerProps {
  children: ReactNode;
}

export default function ToolContainer({ children }: ToolContainerProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {children}
    </div>
  );
}
