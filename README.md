# NPM Package Search

A VS Code extension that allows you to search npm packages directly from VS Code using the npms.io API.

## Features

- 🔍 **Quick Package Search** - Search npm packages without leaving VS Code
- 📊 **Package Scoring** - View quality, popularity, and maintenance scores
- 🏷️ **Advanced Search** - Use qualifiers like `scope:types`, `author:username`, `not:deprecated`
- 💡 **Smart Suggestions** - Get package suggestions with highlighted matches
- 📦 **Install Commands** - Generate install commands for pnpm, npm, or yarn
- ⚠️ **Security Flags** - See deprecated, unstable, or insecure package warnings

## Installation

1. Clone this repository
2. Install dependencies with `pnpm install`
3. Compile with `pnpm run compile`
4. Press F5 in VS Code to test

## Usage

### Basic Search
- Press `Ctrl+Shift+N` (or `Cmd+Shift+N` on Mac)
- Enter a package name to search
- Select a package to view details

### Advanced Search
- Use Command Palette (`Ctrl+Shift+P`) and run "NPM: Advanced Search"
- Use qualifiers like:
  - `scope:types react` - TypeScript types
  - `author:sindresorhus` - By author
  - `not:deprecated` - Exclude deprecated

### Get Install Commands
- Run "NPM: Get Install Command"
- Choose package manager (pnpm/npm/yarn)
- Choose if dev dependency
- Command is copied to clipboard

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
```
