# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2024-12-19

### Fixed

- Optimized VSIX package size by excluding unnecessary files
- Improved .vscodeignore configuration
- Reduced package size by 40.8% (from 49.96 KB to 29.6 KB)

### Enhanced

- Better package organization for marketplace distribution
- Excluded development files, CI/CD configurations, and documentation from published extension

## [1.1.0] - 2024-12-19

### Added

- **Version History Feature**: View complete version history for any npm package

  - See all versions with publish dates
  - View version-specific details (dependencies, authors, descriptions)
  - Sort by newest first with configurable limit
  - New command: "NPM: View Package Version History"

- **Text Selection Search**: Search packages directly from selected text

  - Smart package name extraction from various formats
  - Works with package.json, README files, code comments, etc.
  - New keyboard shortcut: `Ctrl+Shift+N` (or `Cmd+Shift+N` on Mac)
  - New command: "NPM: Search Selected Text"
  - Context menu integration for right-click access

- **Package.json Analysis**: Comprehensive analysis of package.json files

  - Parse and categorize all dependency types
  - View dependencies, devDependencies, peerDependencies, and optionalDependencies
  - Quick search integration for any dependency
  - New command: "NPM: Analyze Package.json"

- **Multi-Package Search**: Search multiple packages simultaneously

  - Select multiple packages from text
  - Batch search results in organized output
  - Perfect for analyzing dependency lists
  - New command: "NPM: Search Multiple Selected Packages"

- **Clipboard Search**: Search packages from clipboard content

  - Extract package names from clipboard text
  - Support for various package name formats
  - New command: "NPM: Search from Clipboard"

- **Enhanced UI Features**:

  - Context menu integration for selected text
  - Improved package selection with multi-select support
  - Better organized search results output
  - Enhanced version display with publish dates

- **CI/CD Pipeline**: Comprehensive GitHub Actions workflow
  - Multi-platform testing (Windows, macOS, Linux)
  - Security audits and vulnerability checks
  - Automated publishing to VS Code Marketplace
  - Release creation with generated notes
  - Support for Node.js 18.x and 20.x

### Enhanced

- **Package Information Display**: More detailed package information

  - Better organized output channels
  - Enhanced version history display
  - Improved dependency categorization
  - More comprehensive package details

- **Error Handling**: Better error messages and user feedback

  - More descriptive error messages
  - Graceful handling of invalid package.json files
  - Better validation for user inputs

- **Performance**: Optimized package search and data processing
  - Improved package name extraction algorithms
  - Better handling of large dependency lists
  - More efficient version history retrieval

### Technical Improvements

- **TypeScript Enhancements**: Better type safety and interfaces

  - New interfaces for version history and package.json parsing
  - Improved type definitions for all new features
  - Better error handling with proper typing

- **Code Organization**: Better structured codebase

  - Enhanced service layer with new methods
  - Improved UI helper functions
  - Better separation of concerns

- **Documentation**: Comprehensive documentation updates
  - Updated README with all new features
  - Detailed usage instructions
  - CI/CD pipeline documentation
  - Contributing guidelines

## [1.0.3] - 2024-12-18

### Fixed

- Improved error handling for network requests
- Better handling of malformed package data
- Fixed issues with package scoring display

### Enhanced

- Updated dependencies to latest versions
- Improved TypeScript configuration
- Better ESLint rules and formatting

## [1.0.2] - 2024-12-17

### Added

- Support for package suggestions
- Enhanced search qualifiers
- Better package scoring display

### Fixed

- Improved error messages
- Better handling of package metadata

## [1.0.1] - 2024-12-16

### Added

- Basic package search functionality
- Package information display
- Install command generation

### Fixed

- Initial release fixes and improvements

## [1.0.0] - 2024-12-15

### Added

- Initial release of NPM Package Search extension
- Basic package search using npm registry API
- Package information display
- Install command generation for pnpm, npm, and yarn
- Advanced search with qualifiers
- Package suggestions feature
