import * as vscode from 'vscode';
import { NpmsService } from './npmService';
import { UIHelper } from './uiHelper';

export function activate(context: vscode.ExtensionContext): void {
  console.log('NPM Package Search extension is now active!');

  const npmsService = new NpmsService();
  const uiHelper = new UIHelper();

  // Command: Search Package
  const searchCommand = vscode.commands.registerCommand('npmSearch.searchPackage', async () => {
    try {
      const query = await vscode.window.showInputBox({
        prompt: 'Enter npm package name to search',
        placeHolder: 'e.g., express, react, lodash',
      });

      if (!query) {
        return;
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Searching for "${query}"...`,
          cancellable: false,
        },
        async () => {
          const results = await npmsService.searchPackages(query);

          if (results.results.length === 0) {
            vscode.window.showInformationMessage(`No packages found for "${query}"`);
            return;
          }

          const selected = await uiHelper.showPackageQuickPick(results.results);

          if (selected) {
            await uiHelper.showPackageDetails(selected);
          }
        },
      );
    } catch (error) {
      vscode.window.showErrorMessage(`Error searching packages: ${String(error)}`);
    }
  });

  // Command: Advanced Search with Qualifiers
  const advancedSearchCommand = vscode.commands.registerCommand(
    'npmSearch.searchWithQualifiers',
    async () => {
      try {
        const query = await vscode.window.showInputBox({
          prompt: 'Enter search with qualifiers',
          placeHolder: 'e.g., scope:types react, author:sindresorhus, not:deprecated',
          validateInput: (value) => {
            if (!value) {
              return 'Query cannot be empty';
            }
            return null;
          },
        });

        if (!query) {
          return;
        }

        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: `Searching with qualifiers: "${query}"...`,
            cancellable: false,
          },
          async () => {
            const results = await npmsService.searchPackages(query);

            if (results.results.length === 0) {
              vscode.window.showInformationMessage(`No packages found for "${query}"`);
              return;
            }

            const selected = await uiHelper.showPackageQuickPick(results.results);

            if (selected) {
              await uiHelper.showPackageDetails(selected);
            }
          },
        );
      } catch (error) {
        vscode.window.showErrorMessage(`Error searching packages: ${String(error)}`);
      }
    },
  );

  // Command: Search Suggestions
  const suggestionsCommand = vscode.commands.registerCommand(
    'npmSearch.searchSuggestions',
    async () => {
      try {
        const query = await vscode.window.showInputBox({
          prompt: 'Enter text for package suggestions',
          placeHolder: 'e.g., react, express',
        });

        if (!query) {
          return;
        }

        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: `Getting suggestions for "${query}"...`,
            cancellable: false,
          },
          async () => {
            const suggestions = await npmsService.getSuggestions(query);

            if (suggestions.length === 0) {
              vscode.window.showInformationMessage(`No suggestions found for "${query}"`);
              return;
            }

            const selected = await uiHelper.showSuggestionsQuickPick(suggestions);

            if (selected) {
              await uiHelper.showPackageDetails(selected);
            }
          },
        );
      } catch (error) {
        vscode.window.showErrorMessage(`Error getting suggestions: ${String(error)}`);
      }
    },
  );

  // Command: Get Latest Version
  const versionCommand = vscode.commands.registerCommand('npmSearch.getLatestVersion', async () => {
    try {
      const packageName = await vscode.window.showInputBox({
        prompt: 'Enter exact npm package name',
        placeHolder: 'e.g., express, react, lodash',
      });

      if (!packageName) {
        return;
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Getting info for "${packageName}"...`,
          cancellable: false,
        },
        async () => {
          const packageInfo = await npmsService.getPackageInfo(packageName);

          const version = packageInfo.version;
          const message = `Latest version of ${packageName}: ${version}`;

          const action = await vscode.window.showInformationMessage(
            message,
            'Copy Version',
            'Copy Install Command',
            'View Details',
          );

          if (action === 'Copy Version') {
            await vscode.env.clipboard.writeText(version);
            vscode.window.showInformationMessage('Version copied to clipboard!');
          } else if (action === 'Copy Install Command') {
            await vscode.env.clipboard.writeText(`pnpm add ${packageName}`);
            vscode.window.showInformationMessage('Install command copied to clipboard!');
          } else if (action === 'View Details') {
            uiHelper.showFullPackageInfo(packageInfo);
          }
        },
      );
    } catch (error) {
      vscode.window.showErrorMessage(`Error getting package info: ${String(error)}`);
    }
  });

  // Command: Get Install Command
  const installCommand = vscode.commands.registerCommand(
    'npmSearch.getInstallCommand',
    async () => {
      try {
        const packageName = await vscode.window.showInputBox({
          prompt: 'Enter npm package name',
          placeHolder: 'e.g., express, react, lodash',
        });

        if (!packageName) {
          return;
        }

        const packageManager = await vscode.window.showQuickPick(['pnpm', 'npm', 'yarn'], {
          placeHolder: 'Select package manager',
        });

        if (!packageManager) {
          return;
        }

        let installCmd = '';
        switch (packageManager) {
          case 'pnpm':
            installCmd = `pnpm add ${packageName}`;
            break;
          case 'npm':
            installCmd = `npm install ${packageName}`;
            break;
          case 'yarn':
            installCmd = `yarn add ${packageName}`;
            break;
        }

        const devDep = await vscode.window.showQuickPick(['No', 'Yes'], {
          placeHolder: 'Install as dev dependency?',
        });

        if (devDep === 'Yes') {
          switch (packageManager) {
            case 'pnpm':
              installCmd = `pnpm add -D ${packageName}`;
              break;
            case 'npm':
              installCmd = `npm install --save-dev ${packageName}`;
              break;
            case 'yarn':
              installCmd = `yarn add --dev ${packageName}`;
              break;
          }
        }

        await vscode.env.clipboard.writeText(installCmd);
        vscode.window.showInformationMessage(`Copied to clipboard: ${installCmd}`);
      } catch (error) {
        vscode.window.showErrorMessage(`Error generating install command: ${String(error)}`);
      }
    },
  );

  context.subscriptions.push(
    searchCommand,
    advancedSearchCommand,
    suggestionsCommand,
    versionCommand,
    installCommand,
  );
}

export function deactivate(): void {
  // Clean up resources if needed
}
