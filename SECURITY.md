# Security Policy

## Supported Versions

Currently, only the latest version of ToolboxHQ is supported with security updates.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly.

### How to Report

Send an email to security@toolboxhq.com with:

- A description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Any proposed fixes (if available)

### What to Expect

- We will acknowledge receipt within 48 hours
- We will provide a detailed response within 7 days
- We will work with you to understand and fix the issue
- We will coordinate disclosure with you

## Security Principles

### Client-Side Processing

Most tools process data entirely in the browser:
- No file uploads to servers
- No data collection
- No tracking or analytics
- Privacy by design

### Dependencies

We regularly update dependencies to address security vulnerabilities. We use:
- npm audit to identify vulnerabilities
- Dependabot for automated dependency updates
- Manual review of security advisories

### Data Handling

- No user data is stored on servers
- No authentication or account system
- No cookies for tracking
- LocalStorage only for non-sensitive preferences

## Best Practices for Users

1. **Keep your browser updated** - Ensure you're using the latest version of your browser
2. **Verify the URL** - Always check you're on the official ToolboxHQ website
3. **Don't share sensitive data** - While we don't collect data, avoid processing highly sensitive information
4. **Use HTTPS** - Ensure the connection is secure (HTTPS)

## Third-Party Libraries

We use the following third-party libraries:

- **pdf-lib** - Client-side PDF processing
- **Next.js** - React framework
- **React** - UI library
- **Tailwind CSS** - Styling

All libraries are sourced from npm and are regularly audited.

## Security Updates

Security updates will be:
- Released as soon as possible
- Announced in the release notes
- Applied to the latest version

## License

This project is licensed under the MIT License. See LICENSE for details.
