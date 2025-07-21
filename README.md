# NPM Package Search

A VS Code extension that allows you to search npm packages directly from VS Code using the npm registry API.

## Features

- 🔍 **Quick Package Search** - Search npm packages without leaving VS Code
- 📊 **Package Scoring** - View quality, popularity, and maintenance scores
- 🏷️ **Advanced Search** - Use qualifiers like `scope:types`, `author:username`, `not:deprecated`
- 💡 **Smart Suggestions** - Get package suggestions with highlighted matches
- 📦 **Install Commands** - Generate install commands for pnpm, npm, or yarn
- ⚠️ **Security Flags** - See deprecated, unstable, or insecure package warnings
- 📅 **Version History** - View package version history with publish dates
- 🎯 **Text Selection Search** - Select text and search for packages instantly
- 📋 **Package.json Analysis** - Analyze dependencies in package.json files
- 🔗 **Multi-Package Search** - Search multiple packages from selected text
- 📋 **Clipboard Search** - Search packages from clipboard content

## Installation

1. Clone this repository
2. Install dependencies with `pnpm install`
3. Compile with `pnpm run compile`
4. Press F5 in VS Code to test

## Usage

### Basic Search

- Press `Ctrl+Shift+T` (or `Cmd+Shift+T` on Mac)
- Enter a package name to search
- Select a package to view details

### Advanced Search

- Use Command Palette (`Ctrl+Shift+P`) and run "NPM: Advanced Search"
- Use qualifiers like:
  - `scope:types react` - TypeScript types
  - `author:sindresorhus` - By author
  - `not:deprecated` - Exclude deprecated

### Version History

- Use Command Palette and run "NPM: View Package Version History"
- Enter a package name to see all versions with publish dates
- View version details including dependencies and authors

### Text Selection Search

- Select any text containing package names
- Press `Ctrl+Shift+H` (or `Cmd+Shift+H` on Mac)
- Or right-click and select "NPM: Search Selected Text"
- The extension will extract package names and search for them

### Package.json Analysis

- Open a package.json file
- Use Command Palette and run "NPM: Analyze Package.json"
- View all dependencies categorized by type
- Optionally search for any dependency

### Multi-Package Search

- Select text containing multiple package names
- Right-click and select "NPM: Search Multiple Selected Packages"
- Choose which packages to search
- View results for all selected packages

### Clipboard Search

- Copy any text containing package names to clipboard
- Use Command Palette and run "NPM: Search from Clipboard"
- Search for packages found in clipboard content

### Get Install Commands

- Run "NPM: Get Install Command"
- Choose package manager (pnpm/npm/yarn)
- Choose if dev dependency
- Command is copied to clipboard

## New Features in v1.1.0

### Version History

- View complete version history for any package
- See publish dates, descriptions, and dependencies for each version
- Sort by newest first with configurable limit

### Text Selection Integration

- Select package names from any file and search instantly
- Works with package.json, README files, code comments, etc.
- Smart package name extraction from various formats

### Package.json Analysis

- Parse and analyze package.json files
- Categorize dependencies by type (dependencies, devDependencies, etc.)
- Quick search integration for any dependency

### Multi-Package Search

- Search multiple packages simultaneously
- Batch search results in organized output
- Perfect for analyzing dependency lists

### Context Menu Integration

- Right-click on selected text to access NPM search features
- Quick access to single and multi-package search
- Seamless integration with VS Code workflow

## Development

```bash
# Install dependencies
pnpm install

# Compile TypeScript
pnpm run compile

# Run linting
pnpm run lint

# Fix linting issues
pnpm run lint:fix

# Watch mode
pnpm run watch

# Package extension
pnpm run package

# Publish to marketplace
pnpm run publish
```

## CI/CD Pipeline

This extension uses GitHub Actions for automated testing and publishing:

- **Multi-platform testing** on Windows, macOS, and Linux
- **Security audits** to check for vulnerabilities
- **Automated publishing** to VS Code Marketplace on tag creation
- **Release creation** with generated release notes

### Publishing Process

1. Create a new tag: `git tag v1.1.0`
2. Push the tag: `git push origin v1.1.0`
3. GitHub Actions will automatically:
   - Run tests on all platforms
   - Perform security audit
   - Publish to VS Code Marketplace
   - Create a GitHub release

### Required Secrets

Set up the following secrets in your GitHub repository:

- `VSCE_PAT`: Your VS Code Marketplace Personal Access Token

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `pnpm run lint` and `pnpm run compile`
5. Submit a pull request

## License

ISC License - see LICENSE file for details.
