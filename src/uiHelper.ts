import * as vscode from 'vscode';
import { PackageSearchResult, SearchSuggestion, PackageInfo } from './npmService';

export class UIHelper {
  async showPackageQuickPick(
    packages: PackageSearchResult[],
  ): Promise<PackageSearchResult | undefined> {
    const items = packages.map((result) => {
      const pkg = result.package;
      const score = Math.round(result.score.final * 100);
      const flags = this._getPackageFlags(result.flags);

      return {
        label: `$(package) ${pkg.name}${flags}`,
        description: `v${pkg.version} • Score: ${score}%`,
        detail: pkg.description || 'No description available',
        buttons: [
          {
            iconPath: new vscode.ThemeIcon('star'),
            tooltip: `Quality: ${Math.round(result.score.detail.quality * 100)}%, Popularity: ${Math.round(result.score.detail.popularity * 100)}%, Maintenance: ${Math.round(result.score.detail.maintenance * 100)}%`,
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
      const score = Math.round(suggestion.score.final * 100);
      const flags = this._getPackageFlags(suggestion.flags);

      // Use highlight if available, otherwise use regular name
      const label = suggestion.highlight
        ? suggestion.highlight.replace(/<em>/g, '').replace(/<\/em>/g, '')
        : pkg.name;

      return {
        label: `$(package) ${label}${flags}`,
        description: `v${pkg.version} • Score: ${score}%`,
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
    const score = result.score;

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

    outputChannel.appendLine('\n📊 Scores:');
    outputChannel.appendLine(`  - Overall: ${Math.round(score.final * 100)}%`);
    outputChannel.appendLine(`  - Quality: ${Math.round(score.detail.quality * 100)}%`);
    outputChannel.appendLine(`  - Popularity: ${Math.round(score.detail.popularity * 100)}%`);
    outputChannel.appendLine(`  - Maintenance: ${Math.round(score.detail.maintenance * 100)}%`);

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

    const metadata = packageInfo.collected.metadata;
    const npm = packageInfo.collected.npm;
    const github = packageInfo.collected.github;
    const score = packageInfo.score;

    outputChannel.appendLine(`📦 Package: ${metadata.name}`);
    outputChannel.appendLine(`📌 Version: ${metadata.version}`);
    outputChannel.appendLine(`📝 Description: ${metadata.description || 'No description'}`);
    outputChannel.appendLine(`🕐 Analyzed: ${new Date(packageInfo.analyzedAt).toLocaleString()}`);

    outputChannel.appendLine('\n📊 Scores:');
    outputChannel.appendLine(`  - Overall: ${Math.round(score.final * 100)}%`);
    outputChannel.appendLine(`  - Quality: ${Math.round(score.detail.quality * 100)}%`);
    outputChannel.appendLine(`  - Popularity: ${Math.round(score.detail.popularity * 100)}%`);
    outputChannel.appendLine(`  - Maintenance: ${Math.round(score.detail.maintenance * 100)}%`);

    outputChannel.appendLine('\n📈 NPM Stats:');
    outputChannel.appendLine(`  - Dependents: ${npm.dependentsCount}`);
    if (npm.downloads.length > 0) {
      const lastMonth = npm.downloads[npm.downloads.length - 1];
      outputChannel.appendLine(`  - Downloads (last month): ${lastMonth.count.toLocaleString()}`);
    }

    if (github) {
      outputChannel.appendLine('\n🐙 GitHub Stats:');
      outputChannel.appendLine(`  - Stars: ${github.starsCount.toLocaleString()}`);
      outputChannel.appendLine(`  - Forks: ${github.forksCount.toLocaleString()}`);
      outputChannel.appendLine(`  - Open Issues: ${github.issues.openCount}`);
    }

    outputChannel.appendLine('\n📥 Install Commands:');
    outputChannel.appendLine(`  pnpm:  pnpm add ${metadata.name}`);
    outputChannel.appendLine(`  npm:   npm install ${metadata.name}`);
    outputChannel.appendLine(`  yarn:  yarn add ${metadata.name}`);

    if (metadata.dependencies && Object.keys(metadata.dependencies).length > 0) {
      outputChannel.appendLine('\n📦 Dependencies:');
      Object.entries(metadata.dependencies).forEach(([dep, version]) => {
        outputChannel.appendLine(`  - ${dep}: ${version}`);
      });
    }

    outputChannel.show();
  }
}
