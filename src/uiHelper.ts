import * as vscode from 'vscode';
import { PackageSearchResult, SearchSuggestion, PackageInfo } from './npmService';

export class UIHelper {
  async showPackageQuickPick(
    packages: PackageSearchResult[],
  ): Promise<PackageSearchResult | undefined> {
    const items = packages.map((result) => {
      const pkg = result.package;
      const flags = this._getPackageFlags(result.flags);

      return {
        label: `$(package) ${pkg.name}${flags}`,
        description: `v${pkg.version}`,
        detail: pkg.description || 'No description available',
        buttons: [
          {
            iconPath: new vscode.ThemeIcon('info'),
            tooltip: 'View package details',
          },
        ],
        result: result,
      };
    });

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select a package to view details',
      matchOnDescription: true,
      matchOnDetail: true,
    });

    return selected?.result;
  }

  async showSuggestionsQuickPick(
    suggestions: SearchSuggestion[],
  ): Promise<SearchSuggestion | undefined> {
    const items = suggestions.map((suggestion) => {
      const pkg = suggestion.package;
      const flags = this._getPackageFlags(suggestion.flags);

      // Use highlight if available, otherwise use regular name
      const label = suggestion.highlight
        ? suggestion.highlight.replace(/<em>/g, '').replace(/<\/em>/g, '')
        : pkg.name;

      return {
        label: `$(package) ${label}${flags}`,
        description: `v${pkg.version}`,
        detail: pkg.description || 'No description available',
        suggestion: suggestion,
      };
    });

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select a package suggestion',
      matchOnDescription: true,
      matchOnDetail: true,
    });

    return selected?.suggestion;
  }

  private _getPackageFlags(flags?: {
    deprecated?: string;
    unstable?: boolean;
    insecure?: boolean;
  }): string {
    if (!flags) {
      return '';
    }

    const flagIcons = [];
    if (flags.deprecated) {
      flagIcons.push(' $(warning) Deprecated');
    }
    if (flags.unstable) {
      flagIcons.push(' $(beaker) Unstable');
    }
    if (flags.insecure) {
      flagIcons.push(' $(shield) Insecure');
    }

    return flagIcons.join('');
  }

  async showPackageDetails(result: PackageSearchResult | SearchSuggestion) {
    const pkg = result.package;

    const actions = await vscode.window.showQuickPick(
      [
        { label: '$(copy) Copy Install Command', value: 'install' },
        { label: '$(info) View Full Details', value: 'details' },
        { label: '$(browser) Open in Browser', value: 'browser' },
        { label: '$(github) View Repository', value: 'repo' },
        { label: '$(home) View Homepage', value: 'homepage' },
      ],
      {
        placeHolder: `${pkg.name}@${pkg.version} - What would you like to do?`,
      },
    );

    if (!actions) return;

    switch (actions.value) {
      case 'install':
        await this._showInstallOptions(pkg.name);
        break;
      case 'details':
        this._showDetailedPackageInfo(result);
        break;
      case 'browser':
        vscode.env.openExternal(vscode.Uri.parse(`https://www.npmjs.com/package/${pkg.name}`));
        break;
      case 'repo':
        if (pkg.links.repository) {
          vscode.env.openExternal(vscode.Uri.parse(pkg.links.repository));
        } else {
          vscode.window.showInformationMessage('No repository link available');
        }
        break;
      case 'homepage':
        if (pkg.links.homepage) {
          vscode.env.openExternal(vscode.Uri.parse(pkg.links.homepage));
        } else {
          vscode.window.showInformationMessage('No homepage available');
        }
        break;
    }
  }

  private async _showInstallOptions(packageName: string) {
    const options = await vscode.window.showQuickPick(
      [
        { label: 'pnpm add', command: `pnpm add ${packageName}` },
        { label: 'pnpm add -D', command: `pnpm add -D ${packageName}` },
        { label: 'npm install', command: `npm install ${packageName}` },
        { label: 'npm install --save-dev', command: `npm install --save-dev ${packageName}` },
        { label: 'yarn add', command: `yarn add ${packageName}` },
        { label: 'yarn add --dev', command: `yarn add --dev ${packageName}` },
      ],
      {
        placeHolder: 'Select install command',
      },
    );

    if (options) {
      await vscode.env.clipboard.writeText(options.command);
      vscode.window.showInformationMessage(`Copied: ${options.command}`);
    }
  }

  private _showDetailedPackageInfo(result: PackageSearchResult | SearchSuggestion) {
    const outputChannel = vscode.window.createOutputChannel('NPM Package Info');
    outputChannel.clear();

    const pkg = result.package;

    outputChannel.appendLine(`📦 Package: ${pkg.name}`);
    outputChannel.appendLine(`📌 Version: ${pkg.version}`);
    outputChannel.appendLine(`📝 Description: ${pkg.description || 'No description'}`);

    if (result.flags) {
      outputChannel.appendLine('\n⚠️  Flags:');
      if (result.flags.deprecated) {
        outputChannel.appendLine(`  - DEPRECATED: ${result.flags.deprecated}`);
      }
      if (result.flags.unstable) {
        outputChannel.appendLine(`  - UNSTABLE: Version < 1.0.0`);
      }
      if (result.flags.insecure) {
        outputChannel.appendLine(`  - INSECURE: Has security vulnerabilities`);
      }
    }

    outputChannel.appendLine('\n🔗 Links:');
    outputChannel.appendLine(`  - NPM: https://www.npmjs.com/package/${pkg.name}`);
    if (pkg.links.homepage) {
      outputChannel.appendLine(`  - Homepage: ${pkg.links.homepage}`);
    }
    if (pkg.links.repository) {
      outputChannel.appendLine(`  - Repository: ${pkg.links.repository}`);
    }

    outputChannel.appendLine('\n📥 Install Commands:');
    outputChannel.appendLine(`  pnpm:  pnpm add ${pkg.name}`);
    outputChannel.appendLine(`  npm:   npm install ${pkg.name}`);
    outputChannel.appendLine(`  yarn:  yarn add ${pkg.name}`);

    if (pkg.keywords && pkg.keywords.length > 0) {
      outputChannel.appendLine(`\n🏷️  Keywords: ${pkg.keywords.join(', ')}`);
    }

    if (pkg.author) {
      outputChannel.appendLine(
        `\n👤 Author: ${pkg.author.name || pkg.author.username || 'Unknown'}`,
      );
    }

    outputChannel.show();
  }

  showFullPackageInfo(packageInfo: PackageInfo) {
    const outputChannel = vscode.window.createOutputChannel('NPM Package Details');
    outputChannel.clear();

    outputChannel.appendLine(`📦 Package: ${packageInfo.name}`);
    outputChannel.appendLine(`📌 Version: ${packageInfo.version}`);
    outputChannel.appendLine(`📝 Description: ${packageInfo.description || 'No description'}`);
    outputChannel.appendLine(`🕐 Published: ${new Date(packageInfo.publishedAt).toLocaleString()}`);

    if (packageInfo.license) {
      outputChannel.appendLine(`📄 License: ${packageInfo.license}`);
    }

    outputChannel.appendLine('\n🔗 Links:');
    outputChannel.appendLine(`  - NPM: ${packageInfo.links.npm}`);
    if (packageInfo.links.homepage) {
      outputChannel.appendLine(`  - Homepage: ${packageInfo.links.homepage}`);
    }
    if (packageInfo.links.repository) {
      outputChannel.appendLine(`  - Repository: ${packageInfo.links.repository}`);
    }
    if (packageInfo.links.bugs) {
      outputChannel.appendLine(`  - Issues: ${packageInfo.links.bugs}`);
    }

    outputChannel.appendLine('\n📥 Install Commands:');
    outputChannel.appendLine(`  pnpm:  pnpm add ${packageInfo.name}`);
    outputChannel.appendLine(`  npm:   npm install ${packageInfo.name}`);
    outputChannel.appendLine(`  yarn:  yarn add ${packageInfo.name}`);

    if (packageInfo.keywords && packageInfo.keywords.length > 0) {
      outputChannel.appendLine(`\n🏷️  Keywords: ${packageInfo.keywords.join(', ')}`);
    }

    if (packageInfo.author) {
      outputChannel.appendLine(`\n👤 Author: ${packageInfo.author.name || 'Unknown'}`);
      if (packageInfo.author.email) {
        outputChannel.appendLine(`   Email: ${packageInfo.author.email}`);
      }
    }

    if (packageInfo.maintainers && packageInfo.maintainers.length > 0) {
      outputChannel.appendLine('\n👥 Maintainers:');
      packageInfo.maintainers.forEach((maintainer) => {
        outputChannel.appendLine(`  - ${maintainer.name} (${maintainer.email})`);
      });
    }

    if (packageInfo.dependencies && Object.keys(packageInfo.dependencies).length > 0) {
      outputChannel.appendLine('\n📦 Dependencies:');
      Object.entries(packageInfo.dependencies).forEach(([dep, version]) => {
        outputChannel.appendLine(`  - ${dep}: ${version}`);
      });
    }

    if (packageInfo.devDependencies && Object.keys(packageInfo.devDependencies).length > 0) {
      outputChannel.appendLine('\n🔧 Dev Dependencies:');
      Object.entries(packageInfo.devDependencies).forEach(([dep, version]) => {
        outputChannel.appendLine(`  - ${dep}: ${version}`);
      });
    }

    if (packageInfo.peerDependencies && Object.keys(packageInfo.peerDependencies).length > 0) {
      outputChannel.appendLine('\n🤝 Peer Dependencies:');
      Object.entries(packageInfo.peerDependencies).forEach(([dep, version]) => {
        outputChannel.appendLine(`  - ${dep}: ${version}`);
      });
    }

    outputChannel.show();
  }
}
