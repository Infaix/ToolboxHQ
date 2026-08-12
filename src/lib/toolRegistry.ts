/**
 * The canonical ToolboxHQ tool catalogue.
 *
 * `category` keeps the URL prefix used by existing routes (do not change it —
 * moving a page would break links). `group` is the toolbox section the tool is
 * displayed under on the homepage, navigation and category pages.
 */
export type ToolCategory = 'developer' | 'files' | 'pdf';

export type ToolGroup =
  | 'pdf'
  | 'images'
  | 'documents'
  | 'students'
  | 'utilities'
  | 'developer'
  | 'files';

export interface Tool {
  name: string;
  slug: string;
  category: ToolCategory;
  /** Toolbox section used for display grouping. Defaults to `category`. */
  group: ToolGroup;
  description: string;
  icon?: string;
  keywords: string[];
  component?: string;
  processesFiles: boolean;
  clientSideOnly: boolean;
  relatedTools?: string[];
  /** Overrides the default `/${category}/${slug}` URL when the tool lives at a custom route. */
  path?: string;
}

export const tools: Tool[] = [
  {
    name: 'PDF Editor',
    slug: 'pdf-editor',
    category: 'pdf',
    group: 'pdf',
    description: 'Annotate, edit, fill forms and sign PDF documents in your browser.',
    icon: '📝',
    keywords: ['pdf', 'edit', 'annotate', 'sign', 'acrobat', 'forms', 'redact', 'highlight', 'merge'],
    processesFiles: true,
    clientSideOnly: true,
    relatedTools: ['pdf-merger', 'pdf-splitter'],
    path: '/pdf-editor',
  },
  {
    name: 'PDF Merger',
    slug: 'pdf-merger',
    category: 'files',
    group: 'pdf',
    description: 'Merge multiple PDF files into one document',
    icon: '📑',
    keywords: ['pdf', 'merge', 'combine', 'join'],
    processesFiles: true,
    clientSideOnly: true,
    relatedTools: ['pdf-splitter', 'pdf-editor'],
  },
  {
    name: 'PDF Splitter',
    slug: 'pdf-splitter',
    category: 'files',
    group: 'pdf',
    description: 'Split PDF files into separate pages or ranges',
    icon: '✂️',
    keywords: ['pdf', 'split', 'extract', 'separate'],
    processesFiles: true,
    clientSideOnly: true,
    relatedTools: ['pdf-merger', 'pdf-editor'],
  },
  {
    name: 'JPG to PNG',
    slug: 'jpg-to-png',
    category: 'files',
    group: 'images',
    description: 'Convert JPG images to PNG format',
    icon: '📷',
    keywords: ['jpg', 'jpeg', 'png', 'convert', 'image'],
    processesFiles: true,
    clientSideOnly: true,
    relatedTools: ['png-to-jpg', 'image-compressor'],
  },
  {
    name: 'PNG to JPG',
    slug: 'png-to-jpg',
    category: 'files',
    group: 'images',
    description: 'Convert PNG images to JPG format with quality control',
    icon: '🖼️',
    keywords: ['png', 'jpg', 'jpeg', 'convert', 'image'],
    processesFiles: true,
    clientSideOnly: true,
    relatedTools: ['jpg-to-png', 'image-compressor'],
  },
  {
    name: 'Image Compressor',
    slug: 'image-compressor',
    category: 'files',
    group: 'images',
    description: 'Compress images while maintaining quality',
    icon: '🗜️',
    keywords: ['compress', 'optimize', 'reduce size', 'image'],
    processesFiles: true,
    clientSideOnly: true,
    relatedTools: ['jpg-to-png', 'png-to-jpg'],
  },
  {
    name: 'JSON Formatter',
    slug: 'json-formatter',
    category: 'developer',
    group: 'developer',
    description: 'Format and beautify JSON data with syntax highlighting',
    icon: '📋',
    keywords: ['json', 'format', 'beautify', 'pretty print'],
    processesFiles: false,
    clientSideOnly: true,
    relatedTools: ['json-validator'],
  },
  {
    name: 'JSON Validator',
    slug: 'json-validator',
    category: 'developer',
    group: 'developer',
    description: 'Validate JSON syntax and display useful error messages',
    icon: '✅',
    keywords: ['json', 'validate', 'syntax', 'check'],
    processesFiles: false,
    clientSideOnly: true,
    relatedTools: ['json-formatter'],
  },
  {
    name: 'Base64 Encoder/Decoder',
    slug: 'base64',
    category: 'developer',
    group: 'developer',
    description: 'Encode text to Base64 or decode Base64 to text',
    icon: '🔤',
    keywords: ['base64', 'encode', 'decode', 'convert'],
    processesFiles: false,
    clientSideOnly: true,
  },
  {
    name: 'UUID Generator',
    slug: 'uuid-generator',
    category: 'developer',
    group: 'developer',
    description: 'Generate UUID v4 identifiers',
    icon: '🔢',
    keywords: ['uuid', 'guid', 'identifier', 'random'],
    processesFiles: false,
    clientSideOnly: true,
  },
  {
    name: 'Regex Tester',
    slug: 'regex-tester',
    category: 'developer',
    group: 'developer',
    description: 'Test regular expressions with real-time matching',
    icon: '🔍',
    keywords: ['regex', 'regular expression', 'pattern', 'match'],
    processesFiles: false,
    clientSideOnly: true,
  },
];

/** Resolve the canonical URL for a tool. */
export function toolUrl(tool: Tool): string {
  return tool.path ?? `/${tool.category}/${tool.slug}`;
}

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((tool) => tool.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter((tool) => tool.category === category);
}

export function getToolsByGroup(group: ToolGroup): Tool[] {
  return tools.filter((tool) => tool.group === group);
}

export function searchTools(query: string): Tool[] {
  const lowerQuery = query.trim().toLowerCase();
  if (!lowerQuery) return [];
  return tools
    .filter(
      (tool) =>
        tool.name.toLowerCase().includes(lowerQuery) ||
        tool.description.toLowerCase().includes(lowerQuery) ||
        tool.group.toLowerCase().includes(lowerQuery) ||
        tool.keywords.some((keyword) => keyword.toLowerCase().includes(lowerQuery))
    )
    .sort((a, b) => {
      const aExact = a.name.toLowerCase() === lowerQuery;
      const bExact = b.name.toLowerCase() === lowerQuery;
      if (aExact !== bExact) return aExact ? -1 : 1;
      const aStarts = a.name.toLowerCase().startsWith(lowerQuery);
      const bStarts = b.name.toLowerCase().startsWith(lowerQuery);
      if (aStarts !== bStarts) return aStarts ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}
