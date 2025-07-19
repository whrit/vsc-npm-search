# Contributing to NPM Package Search

Thank you for your interest in contributing to the NPM Package Search VS Code extension! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- pnpm 8.x or higher
- VS Code (for testing the extension)
- Git

### Setup

1. Fork the repository
2. Clone your fork:

   ```bash
   git clone https://github.com/your-username/vsc-npm-search.git
   cd vsc-npm-search
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Compile the extension:

   ```bash
   pnpm run compile
   ```

5. Open the project in VS Code and press F5 to start debugging

## Development Workflow

### Code Style

This project uses:

- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **pnpm** for package management

### Running Scripts

```bash
# Compile TypeScript
pnpm run compile

# Watch mode for development
pnpm run watch

# Run linting
pnpm run lint

# Fix linting issues automatically
pnpm run lint:fix

# Run tests
pnpm test

# Package the extension
pnpm run package

# Publish to marketplace (requires VSCE_PAT)
pnpm run publish
```

### Making Changes

1. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the coding standards

3. Test your changes:

   - Run `pnpm run lint` to check for linting issues
   - Run `pnpm run compile` to ensure TypeScript compiles
   - Test the extension functionality in VS Code

4. Commit your changes with a descriptive message:

   ```bash
   git commit -m "feat: add new search functionality"
   ```

5. Push your branch and create a pull request

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding or updating tests
- `chore:` for maintenance tasks

## Project Structure

```
vsc-npm-search/
├── src/
│   ├── extension.ts          # Main extension entry point
│   ├── npmService.ts         # NPM registry API service
│   └── uiHelper.ts           # UI helper functions
├── .github/
│   ├── workflows/            # GitHub Actions workflows
│   └── ISSUE_TEMPLATE/       # Issue templates
├── package.json              # Extension manifest
├── tsconfig.json            # TypeScript configuration
├── eslint.config.mjs        # ESLint configuration
└── README.md                # Project documentation
```

## Testing

### Manual Testing

1. Press F5 in VS Code to start debugging
2. Test all commands in the Command Palette
3. Test keyboard shortcuts
4. Test context menu options
5. Test with various package names and scenarios

### Automated Testing

The project includes automated tests that run in the CI/CD pipeline:

- Linting checks
- TypeScript compilation
- Security audits
- Multi-platform testing

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows the project's style guidelines
- [ ] All linting checks pass (`pnpm run lint`)
- [ ] TypeScript compiles without errors (`pnpm run compile`)
- [ ] Tests pass (if applicable)
- [ ] Documentation is updated
- [ ] No breaking changes are introduced

### Pull Request Template

When creating a pull request, please include:

1. **Description**: What changes are being made and why
2. **Type of Change**: Bug fix, feature, documentation, etc.
3. **Testing**: How the changes were tested
4. **Breaking Changes**: Any breaking changes and migration steps
5. **Screenshots**: If UI changes are involved

## Issue Guidelines

### Reporting Bugs

1. Use the bug report template
2. Include steps to reproduce
3. Provide environment information
4. Include console output if applicable
5. Add screenshots if helpful

### Feature Requests

1. Use the feature request template
2. Describe the problem and proposed solution
3. Consider alternatives
4. Provide implementation ideas if possible

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **Major** version for incompatible API changes
- **Minor** version for new functionality in a backward-compatible manner
- **Patch** version for backward-compatible bug fixes

### Publishing

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create and push a tag:
   ```bash
   git tag v1.1.0
   git push origin v1.1.0
   ```
4. GitHub Actions will automatically:
   - Run tests
   - Publish to VS Code Marketplace
   - Create a GitHub release

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Use welcoming and inclusive language
- Be collaborative and constructive
- Focus on what is best for the community

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the project maintainers.

## Getting Help

- **Issues**: Use GitHub issues for bug reports and feature requests
- **Discussions**: Use GitHub Discussions for questions and general discussion
- **Documentation**: Check the README and HELP files for usage information

## License

By contributing to this project, you agree that your contributions will be licensed under the ISC License.

Thank you for contributing to NPM Package Search! 🚀
