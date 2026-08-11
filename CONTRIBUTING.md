# Contributing to ToolboxHQ

Thank you for your interest in contributing to ToolboxHQ! We welcome contributions from developers of all skill levels.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- A clear description of the problem
- Steps to reproduce the issue
- Expected behavior vs. actual behavior
- Screenshots if applicable
- Your browser and OS information

### Suggesting Features

Feature suggestions are welcome! Please provide:

- A clear description of the proposed feature
- Use cases and benefits
- Potential implementation approaches

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow existing code patterns
- Use Tailwind CSS for styling
- Keep components small and focused
- Write descriptive commit messages

### Adding New Tools

1. Add the tool to `src/lib/toolRegistry.ts` (name, slug, category, description, keywords, and related tools)
2. Create the tool's `page.tsx` (server component that exports `metadata`) and `client.tsx` (`'use client'` interactive component) in the appropriate directory
3. Use reusable components from `src/components/tools/`
4. Ensure client-side processing for privacy
5. Add explanatory content about the tool
6. The category pages, homepage, sitemap, and related-tools links are generated from the registry automatically
7. Add the tool link to `src/components/Footer.tsx`

### Testing

- Test your changes in multiple browsers (Chrome, Firefox, Safari)
- Test on both light and dark modes
- Test on mobile and desktop viewports
- Ensure accessibility standards are met

### Privacy Requirements

All tools must:
- Process data client-side whenever possible
- Clearly indicate if server-side processing is required
- Never collect or store user data without consent
- Follow the privacy policy

## Project Structure

```
src/
├── app/
│   ├── developer/          # Developer tool pages
│   ├── files/              # File tool pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   └── sitemap.ts          # SEO sitemap
├── components/
│   ├── Navigation.tsx      # Navigation bar
│   ├── Footer.tsx          # Footer
│   └── tools/              # Reusable tool components
├── contexts/
│   └── ThemeContext.tsx     # Dark mode context
└── lib/
    └── toolRegistry.ts     # Tool registry
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the dev server: `npm run dev`
4. Open http://localhost:3000

## Code Review Process

- All pull requests require review
- Maintainers may request changes
- Be responsive to feedback
- Keep discussions constructive

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
