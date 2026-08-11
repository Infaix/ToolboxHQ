interface ToolHeaderProps {
  title: string;
  description: string;
  clientSideOnly?: boolean;
}

export default function ToolHeader({ title, description, clientSideOnly }: ToolHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
      {clientSideOnly && (
        <div className="mt-4 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-900 dark:text-green-200">
          <svg className="mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          100% Client-Side Processing
        </div>
      )}
    </div>
  );
}
