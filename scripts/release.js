#!/usr/bin/env node
/* eslint-disable */

const fs = require('fs');
const { execSync } = require('child_process');

const bumpType = process.argv[2] || 'patch';

if (!['major', 'minor', 'patch'].includes(bumpType)) {
  console.error('Invalid bump type. Use: major, minor, or patch');
  process.exit(1);
}

try {
  // Read current package.json
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const currentVersion = packageJson.version;

  console.log(`Current version: ${currentVersion}`);

  // Bump version
  const versionParts = currentVersion.split('.').map(Number);

  if (bumpType === 'major') {
    versionParts[0]++;
    versionParts[1] = 0;
    versionParts[2] = 0;
  } else if (bumpType === 'minor') {
    versionParts[1]++;
    versionParts[2] = 0;
  } else {
    versionParts[2]++;
  }

  const newVersion = versionParts.join('.');
  console.log(`New version: ${newVersion}`);

  // Update package.json
  packageJson.version = newVersion;
  fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2) + '\n');

  // Run tests and build
  console.log('Running linting...');
  execSync('pnpm run lint', { stdio: 'inherit' });

  console.log('Compiling TypeScript...');
  execSync('pnpm run compile', { stdio: 'inherit' });

  // Create git commit and tag
  console.log('Creating git commit and tag...');
  execSync('git add package.json', { stdio: 'inherit' });
  execSync(`git commit -m "Bump version to ${newVersion}"`, { stdio: 'inherit' });
  execSync(`git tag -a "v${newVersion}" -m "Release v${newVersion}"`, { stdio: 'inherit' });

  console.log(`\n✅ Version bumped to ${newVersion}`);
  console.log('\nTo publish:');
  console.log(`  git push origin main`);
  console.log(`  git push origin v${newVersion}`);
  console.log('\nOr run the GitHub Actions workflow manually.');
  console.log('\nThe GitHub Actions workflow will automatically:');
  console.log('  - Run tests and linting');
  console.log('  - Build and package the extension');
  console.log('  - Publish to VS Code Marketplace');
  console.log('  - Publish to Open VSX Registry');
  console.log('  - Create a GitHub release with the VSIX file');
} catch (error) {
  console.error('Error during release:', error.message);
  process.exit(1);
}
