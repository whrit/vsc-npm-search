import * as vscode from 'vscode';
import { NpmsService } from './npmService';
import { UIHelper } from './uiHelper';

export function activate(context: vscode.ExtensionContext): void {
  console.log('NPM Package Search extension is now active!');

  const npmsService = new NpmsService();
  const uiHelper = new UIHelper();

  // Create status bar item for updating packages
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = 'npmSearch.updateAllPackages';
  statusBarItem.text = '$(refresh) Update All';
  statusBarItem.tooltip = 'Update all packages in package.json to latest versions';

  // Function to update status bar visibility
  const updateStatusBarVisibility = () => {
    const activeEditor = vscode.window.activeTextEditor;
    if (
      activeEditor &&
      (activeEditor.document.fileName.endsWith('package.json') ||
        activeEditor.document.fileName.endsWith('/package.json'))
    ) {
      statusBarItem.show();
    } else {
      statusBarItem.hide();
    }
  };

  // Update visibility when active editor changes
  vscode.window.onDidChangeActiveTextEditor(updateStatusBarVisibility, null, context.subscriptions);

  // Update visibility when text document is opened
  vscode.workspace.onDidOpenTextDocument(updateStatusBarVisibility, null, context.subscriptions);

  // Initial visibility check
  updateStatusBarVisibility();

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

  // NEW COMMANDS

  // Command: View Package Version History
  const versionHistoryCommand = vscode.commands.registerCommand(
    'npmSearch.viewVersionHistory',
    async () => {
      try {
        const packageName = await vscode.window.showInputBox({
          prompt: 'Enter npm package name to view version history',
          placeHolder: 'e.g., express, react, lodash',
        });

        if (!packageName) {
          return;
        }

        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: `Getting version history for "${packageName}"...`,
            cancellable: false,
          },
          async () => {
            const versionHistory = await npmsService.getPackageVersionHistory(packageName);
            uiHelper.showVersionHistory(versionHistory);
          },
        );
      } catch (error) {
        vscode.window.showErrorMessage(`Error getting version history: ${String(error)}`);
      }
    },
  );

  // Command: Search Selected Text
  const searchSelectedTextCommand = vscode.commands.registerCommand(
    'npmSearch.searchSelectedText',
    async () => {
      try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showInformationMessage('No active editor found');
          return;
        }

        const selection = editor.selection;
        const text = editor.document.getText(selection);

        if (!text.trim()) {
          vscode.window.showInformationMessage('No text selected');
          return;
        }

        // Extract package names from selected text
        const packageNames = npmsService.extractPackageNamesFromText(text);

        if (packageNames.length === 0) {
          vscode.window.showInformationMessage('No package names found in selected text');
          return;
        }

        if (packageNames.length === 1) {
          // Single package - search directly
          const packageName = packageNames[0];
          await vscode.window.withProgress(
            {
              location: vscode.ProgressLocation.Notification,
              title: `Searching for "${packageName}"...`,
              cancellable: false,
            },
            async () => {
              const results = await npmsService.searchPackages(packageName);
              if (results.results.length > 0) {
                const selected = await uiHelper.showPackageQuickPick(results.results);
                if (selected) {
                  await uiHelper.showPackageDetails(selected);
                }
              } else {
                vscode.window.showInformationMessage(`No packages found for "${packageName}"`);
              }
            },
          );
        } else {
          // Multiple packages - let user choose
          const selectedPackage = await vscode.window.showQuickPick(packageNames, {
            placeHolder: 'Select a package to search',
          });

          if (selectedPackage) {
            await vscode.window.withProgress(
              {
                location: vscode.ProgressLocation.Notification,
                title: `Searching for "${selectedPackage}"...`,
                cancellable: false,
              },
              async () => {
                const results = await npmsService.searchPackages(selectedPackage);
                if (results.results.length > 0) {
                  const selected = await uiHelper.showPackageQuickPick(results.results);
                  if (selected) {
                    await uiHelper.showPackageDetails(selected);
                  }
                } else {
                  vscode.window.showInformationMessage(
                    `No packages found for "${selectedPackage}"`,
                  );
                }
              },
            );
          }
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Error searching selected text: ${String(error)}`);
      }
    },
  );

  // Command: Search Multiple Selected Packages
  const searchMultiplePackagesCommand = vscode.commands.registerCommand(
    'npmSearch.searchMultiplePackages',
    async () => {
      try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showInformationMessage('No active editor found');
          return;
        }

        const selection = editor.selection;
        const text = editor.document.getText(selection);

        if (!text.trim()) {
          vscode.window.showInformationMessage('No text selected');
          return;
        }

        // Extract package names from selected text
        const packageNames = npmsService.extractPackageNamesFromText(text);

        if (packageNames.length === 0) {
          vscode.window.showInformationMessage('No package names found in selected text');
          return;
        }

        // Let user select multiple packages
        const selectedPackages = await vscode.window.showQuickPick(packageNames, {
          placeHolder: 'Select packages to search (use space to select multiple)',
          canPickMany: true,
        });

        if (!selectedPackages || selectedPackages.length === 0) {
          return;
        }

        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: `Searching for ${selectedPackages.length} packages...`,
            cancellable: false,
          },
          async () => {
            const results = await npmsService.searchPackagesByNames(selectedPackages);
            uiHelper.showSearchResultsByPackage(results);
          },
        );
      } catch (error) {
        vscode.window.showErrorMessage(`Error searching multiple packages: ${String(error)}`);
      }
    },
  );

  // Command: Analyze Package.json
  const analyzePackageJsonCommand = vscode.commands.registerCommand(
    'npmSearch.analyzePackageJson',
    async () => {
      try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showInformationMessage('No active editor found');
          return;
        }

        const document = editor.document;
        const text = document.getText();

        if (!text.trim()) {
          vscode.window.showInformationMessage('No content found in current file');
          return;
        }

        try {
          const packageJsonInfo = npmsService.parsePackageJsonFromText(text);
          uiHelper.showPackageJsonInfo(packageJsonInfo);

          // Ask if user wants to search any dependencies
          const allDeps = [
            ...packageJsonInfo.dependencies,
            ...packageJsonInfo.devDependencies,
            ...packageJsonInfo.peerDependencies,
            ...packageJsonInfo.optionalDependencies,
          ];

          if (allDeps.length > 0) {
            const action = await vscode.window.showInformationMessage(
              `Found ${allDeps.length} dependencies. Would you like to search any of them?`,
              'Search Single',
              'Search Multiple',
              'No Thanks',
            );

            if (action === 'Search Single') {
              const selected = await uiHelper.showDependencyQuickPick(allDeps);
              if (selected) {
                await vscode.window.withProgress(
                  {
                    location: vscode.ProgressLocation.Notification,
                    title: `Searching for "${selected.name}"...`,
                    cancellable: false,
                  },
                  async () => {
                    const results = await npmsService.searchPackages(selected.name);
                    if (results.results.length > 0) {
                      const result = await uiHelper.showPackageQuickPick(results.results);
                      if (result) {
                        await uiHelper.showPackageDetails(result);
                      }
                    } else {
                      vscode.window.showInformationMessage(
                        `No packages found for "${selected.name}"`,
                      );
                    }
                  },
                );
              }
            } else if (action === 'Search Multiple') {
              const selected = await uiHelper.showMultipleDependenciesQuickPick(allDeps);
              if (selected.length > 0) {
                await vscode.window.withProgress(
                  {
                    location: vscode.ProgressLocation.Notification,
                    title: `Searching for ${selected.length} packages...`,
                    cancellable: false,
                  },
                  async () => {
                    const packageNames = selected.map((dep) => dep.name);
                    const results = await npmsService.searchPackagesByNames(packageNames);
                    uiHelper.showSearchResultsByPackage(results);
                  },
                );
              }
            }
          }
        } catch {
          vscode.window.showErrorMessage('Invalid package.json format');
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Error analyzing package.json: ${String(error)}`);
      }
    },
  );

  // Command: Search from Clipboard
  const searchFromClipboardCommand = vscode.commands.registerCommand(
    'npmSearch.searchFromClipboard',
    async () => {
      try {
        const clipboardText = await vscode.env.clipboard.readText();

        if (!clipboardText.trim()) {
          vscode.window.showInformationMessage('No text found in clipboard');
          return;
        }

        // Extract package names from clipboard text
        const packageNames = npmsService.extractPackageNamesFromText(clipboardText);

        if (packageNames.length === 0) {
          vscode.window.showInformationMessage('No package names found in clipboard text');
          return;
        }

        if (packageNames.length === 1) {
          // Single package - search directly
          const packageName = packageNames[0];
          await vscode.window.withProgress(
            {
              location: vscode.ProgressLocation.Notification,
              title: `Searching for "${packageName}"...`,
              cancellable: false,
            },
            async () => {
              const results = await npmsService.searchPackages(packageName);
              if (results.results.length > 0) {
                const selected = await uiHelper.showPackageQuickPick(results.results);
                if (selected) {
                  await uiHelper.showPackageDetails(selected);
                }
              } else {
                vscode.window.showInformationMessage(`No packages found for "${packageName}"`);
              }
            },
          );
        } else {
          // Multiple packages - let user choose
          const selectedPackage = await vscode.window.showQuickPick(packageNames, {
            placeHolder: 'Select a package to search',
          });

          if (selectedPackage) {
            await vscode.window.withProgress(
              {
                location: vscode.ProgressLocation.Notification,
                title: `Searching for "${selectedPackage}"...`,
                cancellable: false,
              },
              async () => {
                const results = await npmsService.searchPackages(selectedPackage);
                if (results.results.length > 0) {
                  const selected = await uiHelper.showPackageQuickPick(results.results);
                  if (selected) {
                    await uiHelper.showPackageDetails(selected);
                  }
                } else {
                  vscode.window.showInformationMessage(
                    `No packages found for "${selectedPackage}"`,
                  );
                }
              },
            );
          }
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Error searching from clipboard: ${String(error)}`);
      }
    },
  );

  // Command: Update All Packages
  const updateAllPackagesCommand = vscode.commands.registerCommand(
    'npmSearch.updateAllPackages',
    async () => {
      try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showInformationMessage('No active editor found');
          return;
        }

        const document = editor.document;
        if (document.fileName !== 'package.json' && !document.fileName.endsWith('/package.json')) {
          vscode.window.showInformationMessage(
            'Please open a package.json file to update packages',
          );
          return;
        }

        const text = document.getText();
        if (!text.trim()) {
          vscode.window.showInformationMessage('No content found in package.json');
          return;
        }

        // Validate that it's a valid package.json
        try {
          JSON.parse(text);
        } catch {
          vscode.window.showErrorMessage('Invalid package.json format');
          return;
        }

        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Checking for package updates...',
            cancellable: false,
          },
          async () => {
            const updateResult = await npmsService.updateAllPackagesInPackageJson(text);
            const shouldApply = await uiHelper.showPackageUpdates(updateResult);

            if (shouldApply) {
              // Apply the updates by replacing the file content
              const edit = new vscode.WorkspaceEdit();
              const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(text.length),
              );
              edit.replace(document.uri, fullRange, updateResult.updatedPackageJson);

              const success = await vscode.workspace.applyEdit(edit);
              if (success) {
                vscode.window.showInformationMessage(
                  `Successfully updated ${updateResult.packagesWithUpdates} packages!`,
                );
              } else {
                vscode.window.showErrorMessage('Failed to apply package updates');
              }
            }
          },
        );
      } catch (error) {
        vscode.window.showErrorMessage(`Error updating packages: ${String(error)}`);
      }
    },
  );

  context.subscriptions.push(
    searchCommand,
    advancedSearchCommand,
    suggestionsCommand,
    versionCommand,
    installCommand,
    versionHistoryCommand,
    searchSelectedTextCommand,
    searchMultiplePackagesCommand,
    analyzePackageJsonCommand,
    searchFromClipboardCommand,
    updateAllPackagesCommand,
    statusBarItem,
  );
}

export function deactivate(): void {
  // Clean up resources if needed
}
