export interface Tool {
  name: string;
  slug: string;
  category: 'developer' | 'files';
  description: string;
  icon?: string;
  keywords: string[];
  component?: string;
  processesFiles: boolean;
  clientSideOnly: boolean;
  relatedTools?: string[];
}

export const tools: Tool[] = [
  {
    name: 'JSON Formatter',
    slug: 'json-formatter',
    category: 'developer',
    description: 'Format and beautify JSON data with syntax highlighting',
    keywords: ['json', 'format', 'beautify', 'pretty print'],
    processesFiles: false,
    clientSideOnly: true,
    relatedTools: ['json-validator'],
  },
  {
    name: 'JSON Validator',
    slug: 'json-validator',
    category: 'developer',
    description: 'Validate JSON syntax and display useful error messages',
    keywords: ['json', 'validate', 'syntax', 'check'],
    processesFiles: false,
    clientSideOnly: true,
    relatedTools: ['json-formatter'],
  },
  {
    name: 'Base64 Encoder/Decoder',
    slug: 'base64',
    category: 'developer',
    description: 'Encode text to Base64 or decode Base64 to text',
    keywords: ['base64', 'encode', 'decode', 'convert'],
    processesFiles: false,
    clientSideOnly: true,
  },
  {
    name: 'UUID Generator',
    slug: 'uuid-generator',
    category: 'developer',
    description: 'Generate UUID v4 identifiers',
    keywords: ['uuid', 'guid', 'identifier', 'random'],
    processesFiles: false,
    clientSideOnly: true,
  },
  {
    name: 'Regex Tester',
    slug: 'regex-tester',
    category: 'developer',
    description: 'Test regular expressions with real-time matching',
    keywords: ['regex', 'regular expression', 'pattern', 'match'],
    processesFiles: false,
    clientSideOnly: true,
  },
  {
    name: 'JPG to PNG',
    slug: 'jpg-to-png',
    category: 'files',
    description: 'Convert JPG images to PNG format',
    keywords: ['jpg', 'jpeg', 'png', 'convert', 'image'],
    processesFiles: true,
    clientSideOnly: true,
    relatedTools: ['png-to-jpg', 'image-compressor'],
  },
  {
    name: 'PNG to JPG',
    slug: 'png-to-jpg',
    category: 'files',
    description: 'Convert PNG images to JPG format with quality control',
    keywords: ['png', 'jpg', 'jpeg', 'convert', 'image'],
    processesFiles: true,
    clientSideOnly: true,
    relatedTools: ['jpg-to-png', 'image-compressor'],
  },
  {
    name: 'Image Compressor',
    slug: 'image-compressor',
    category: 'files',
    description: 'Compress images while maintaining quality',
    keywords: ['compress', 'optimize', 'reduce size', 'image'],
    processesFiles: true,
    clientSideOnly: true,
    relatedTools: ['jpg-to-png', 'png-to-jpg'],
  },
  {
    name: 'PDF Merger',
    slug: 'pdf-merger',
    category: 'files',
    description: 'Merge multiple PDF files into one document',
    keywords: ['pdf', 'merge', 'combine', 'join'],
    processesFiles: true,
    clientSideOnly: true,
    relatedTools: ['pdf-splitter'],
  },
  {
    name: 'PDF Splitter',
    slug: 'pdf-splitter',
    category: 'files',
    description: 'Split PDF files into separate pages or ranges',
    keywords: ['pdf', 'split', 'extract', 'separate'],
    processesFiles: true,
    clientSideOnly: true,
    relatedTools: ['pdf-merger'],
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((tool) => tool.slug === slug);
}

export function getToolsByCategory(category: 'developer' | 'files'): Tool[] {
  return tools.filter((tool) => tool.category === category);
}

export function searchTools(query: string): Tool[] {
  const lowerQuery = query.toLowerCase();
  return tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery) ||
      tool.keywords.some((keyword) => keyword.toLowerCase().includes(lowerQuery))
  );
}
