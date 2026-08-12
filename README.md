# ToolboxHQ

ToolboxHQ is a free, privacy-focused collection of browser-based tools for developers, students, and general users. Process files locally in your browser with confidence that your data never leaves your device.

## Features

### Developer Tools
- **JSON Formatter** - Format and beautify JSON data
- **JSON Validator** - Validate JSON syntax
- **Base64 Encoder/Decoder** - Encode and decode Base64
- **UUID Generator** - Generate UUID v4 identifiers
- **Regex Tester** - Test regular expressions

### File Tools
- **JPG to PNG** - Convert JPG images to PNG
- **PNG to JPG** - Convert PNG images to JPG with quality control
- **Image Compressor** - Compress images locally
- **PDF Merger** - Merge multiple PDFs
- **PDF Splitter** - Split PDFs into pages

## Privacy First

Most tools process data entirely in your browser using modern web APIs:
- Your files never leave your device
- No server-side processing for most operations
- No account required
- No data collection or tracking

## Technology Stack

- **Next.js 16** - React framework for optimal performance
- **TypeScript** - Type-safe code
- **Tailwind CSS 4** - Modern utility-first styling
- **pdf-lib** - Client-side PDF processing
- **Canvas API** - Image processing

## Getting Started

### Prerequisites

- Node.js 20.9+ (required by Next.js 16)
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Infaix/ToolboxHQ.git
cd toolboxhq
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Building for Production

The site is statically exported to `out/`:

```bash
npm run build
```

Preview the static output locally (Cloudflare Pages simulator):

```bash
npm run preview
```

## Deploying to Cloudflare Pages

Settings live in `wrangler.jsonc` (project name, compatibility date, output directory) so every deployment uses the same configuration.

- **CI (recommended):** pushes to `main` deploy automatically via `.github/workflows/deploy.yml`. Add the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets to the GitHub repository.
- **Manual:** run `npm run deploy` with `wrangler` authenticated (`npx wrangler login`).
- **Dashboard:** create a Pages project, connect the repo, framework preset **Next.js (Static HTML Export)**, build command `npx next build`, build directory `out`.

## Adding a New Tool

1. Add the tool to the registry in `src/lib/toolRegistry.ts` (name, slug, category, description, keywords, and related tools). The category pages, homepage, sitemap, and related-tools links are generated from this registry automatically.
2. Create two files in the appropriate directory:
   - Developer tools: `src/app/developer/[tool-slug]/page.tsx`
   - File tools: `src/app/files/[tool-slug]/page.tsx`
   - The `page.tsx` is a server component that exports `metadata` and renders the tool's `client.tsx` (`'use client'`) component, which contains the interactive tool UI.
3. Use the reusable components from `src/components/tools/`
4. Add the tool link to the footer in `src/components/Footer.tsx`

## Project Structure

```
public/
├── favicon.ico           # Site favicon
└── robots.txt            # Search engine rules

src/
├── app/
│   ├── developer/        # Developer tools (page.tsx + client.tsx per tool)
│   ├── files/            # File tools (page.tsx + client.tsx per tool)
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Homepage
│   └── sitemap.ts        # SEO sitemap (generated from the registry)
├── components/
│   ├── Navigation.tsx    # Navigation bar
│   ├── Footer.tsx        # Footer
│   └── tools/            # Reusable tool components
├── contexts/
│   └── ThemeContext.tsx  # Dark mode context
└── lib/
    ├── seo.ts            # Tool metadata helper
    ├── clipboard.ts      # Clipboard utility
    └── toolRegistry.ts   # Tool registry (single source of truth)
```

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

## Security

For security policies, see [SECURITY.md](SECURITY.md).
