# NPM Package Search - Advanced Search Guide

## Search Qualifiers

The npms.io API supports powerful search qualifiers to help you find exactly what you need:

### Scope Filtering

- `scope:types` - Find packages in the @types scope
- `scope:babel` - Find packages in the @babel scope

### Author/Maintainer Filtering

- `author:sindresorhus` - Find packages by a specific author
- `maintainer:sindresorhus` - Find packages maintained by a specific user

### Keywords

- `keywords:gulpplugin` - Find packages with specific keywords
- `keywords:react,hooks` - Find packages with multiple keywords
- `keywords:react,-class` - Find packages with 'react' but exclude 'class'

### Package Status

- `not:deprecated` - Exclude deprecated packages
- `not:unstable` - Exclude packages with version < 1.0.0
- `not:insecure` - Exclude insecure packages
- `is:deprecated` - Only show deprecated packages
- `is:unstable` - Only show unstable packages
- `is:insecure` - Only show insecure packages

### Scoring Adjustments

- `boost-exact:false` - Don't boost exact matches
- `score-effect:14` - Adjust score effect (default: 15.3)
- `quality-weight:1` - Adjust quality weight (default: 1.95)
- `popularity-weight:1` - Adjust popularity weight (default: 3.3)
- `maintenance-weight:1` - Adjust maintenance weight (default: 2.05)

## Example Queries

1. **Find TypeScript type definitions for React:**

   ```
   scope:types react
   ```

2. **Find popular, well-maintained Express middleware:**

   ```
   keywords:express,middleware not:deprecated popularity-weight:2
   ```

3. **Find packages by a specific author, excluding unstable ones:**

   ```
   author:sindresorhus not:unstable
   ```

4. **Find secure React hooks packages:**

   ```
   keywords:react,hooks not:insecure not:deprecated
   ```

5. **Find Babel plugins with high quality scores:**
   ```
   scope:babel keywords:plugin quality-weight:3
   ```

## Package Scores Explained

Each package has three score components:

- **Quality**: Code quality, tests, documentation
- **Popularity**: Downloads, dependents, community interest
- **Maintenance**: Update frequency, issue resolution

The overall score combines all three factors to help you choose the best packages.

## Development Guide

### Linting and Code Quality

This extension uses ESLint with TypeScript support and Prettier for code formatting.

#### Available Lint Scripts

```bash
# Run ESLint to check for issues
pnpm run lint

# Run ESLint and automatically fix issues
pnpm run lint:fix

# Compile and lint (runs before tests)
pnpm run pretest
```

#### ESLint Rules

The project enforces several code quality rules:

- TypeScript strict mode
- Consistent naming conventions (camelCase for variables, PascalCase for types)
- No floating promises
- No misused promises
- Prettier formatting
- Always use `===` instead of `==`
- Always use curly braces for control structures

#### VS Code Integration

With the included `.vscode/settings.json`, VS Code will:

- Format code on save using Prettier
- Fix ESLint issues on save
- Show ESLint errors inline
- Use the workspace TypeScript version

### Contributing

Before submitting code:

1. Run `pnpm run lint` to check for issues
2. Run `pnpm run lint:fix` to auto-fix what's possible
3. Ensure `pnpm run compile` succeeds
4. Test your changes with F5 in VS Code

### Migrating to ESLint Flat Config

This project uses ESLint v9 with the new flat config format. Key differences:

- Configuration is in `eslint.config.js` instead of `.eslintrc.js`
- No more `.eslintignore` file - ignores are configured in the config file
- Plugins are imported as ES modules
- No `--ext` flag needed in scripts
