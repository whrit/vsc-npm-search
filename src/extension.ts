import * as vscode from 'vscode';
import { NpmsService } from './npmService';
import { PyPiService } from './pypiService';
import { UIHelper } from './uiHelper';
import { ContextDetector } from './contextDetector';

export function activate(context: vscode.ExtensionContext): void {
  console.log('NPM/PyPI Package Search extension is now active!');

  const npmsService = new NpmsService();
  const pypiService = new PyPiService();
  const uiHelper = new UIHelper();
  const contextDetector = new ContextDetector();

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

  // PyPI COMMANDS

  // Command: Search PyPI Package
  const pypiSearchCommand = vscode.commands.registerCommand(
    'npmSearch.pypiSearchPackage',
    async () => {
      try {
        const query = await vscode.window.showInputBox({
          prompt: 'Enter Python package name to search on PyPI',
          placeHolder: 'e.g., requests, numpy, django',
        });

        if (!query) {
          return;
        }

        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: `Searching PyPI for "${query}"...`,
            cancellable: false,
          },
          async () => {
            const packageDetails = await pypiService.getPackageInfo(query);
            await uiHelper.showPyPiPackageDetails(packageDetails);
          },
        );
      } catch (error) {
        vscode.window.showErrorMessage(`Error searching PyPI: ${String(error)}`);
      }
    },
  );

  // Command: View PyPI Package Version History
  const pypiVersionHistoryCommand = vscode.commands.registerCommand(
    'npmSearch.pypiVersionHistory',
    async () => {
      try {
        const packageName = await vscode.window.showInputBox({
          prompt: 'Enter Python package name to view version history',
          placeHolder: 'e.g., requests, numpy, django',
        });

        if (!packageName) {
          return;
        }

        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: `Getting PyPI version history for "${packageName}"...`,
            cancellable: false,
          },
          async () => {
            const versionHistory = await pypiService.getPackageVersionHistory(packageName);
            uiHelper.showPyPiVersionHistory(versionHistory);
          },
        );
      } catch (error) {
        vscode.window.showErrorMessage(`Error getting PyPI version history: ${String(error)}`);
      }
    },
  );

  // Command: Analyze requirements.txt
  const analyzeRequirementsCommand = vscode.commands.registerCommand(
    'npmSearch.analyzeRequirements',
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

        const packages = pypiService.parseRequirementsTxt(text);

        if (packages.length === 0) {
          vscode.window.showInformationMessage('No packages found in requirements file');
          return;
        }

        const outputChannel = vscode.window.createOutputChannel('Requirements Analysis');
        outputChannel.clear();
        outputChannel.appendLine('📋 Requirements.txt Analysis\n');
        outputChannel.appendLine(`Total Packages: ${packages.length}\n`);

        packages.forEach((pkg, index) => {
          outputChannel.appendLine(
            `${index + 1}. ${pkg.name}${pkg.version ? ` ${pkg.version}` : ''}`,
          );
        });

        outputChannel.show();

        const action = await vscode.window.showInformationMessage(
          `Found ${packages.length} packages. Would you like to search any of them?`,
          'Search Single',
          'Search Multiple',
          'No Thanks',
        );

        if (action === 'Search Single') {
          const packageNames = packages.map((p) => p.name);
          const selected = await vscode.window.showQuickPick(packageNames, {
            placeHolder: 'Select a package to search on PyPI',
          });

          if (selected) {
            await vscode.window.withProgress(
              {
                location: vscode.ProgressLocation.Notification,
                title: `Searching PyPI for "${selected}"...`,
                cancellable: false,
              },
              async () => {
                const packageDetails = await pypiService.getPackageInfo(selected);
                await uiHelper.showPyPiPackageDetails(packageDetails);
              },
            );
          }
        } else if (action === 'Search Multiple') {
          const packageNames = packages.map((p) => p.name);
          const selected = await vscode.window.showQuickPick(packageNames, {
            placeHolder: 'Select packages to search (use space to select multiple)',
            canPickMany: true,
          });

          if (selected && selected.length > 0) {
            await vscode.window.withProgress(
              {
                location: vscode.ProgressLocation.Notification,
                title: `Searching PyPI for ${selected.length} packages...`,
                cancellable: false,
              },
              async () => {
                const results = await pypiService.searchPackagesByNames(selected);
                uiHelper.showPyPiSearchResultsByPackage(results);
              },
            );
          }
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Error analyzing requirements: ${String(error)}`);
      }
    },
  );

  // SMART COMMANDS (Context-Aware)

  // Command: Smart Search (detects npm or PyPI based on context)
  const smartSearchCommand = vscode.commands.registerCommand('npmSearch.smartSearch', async () => {
    try {
      const editor = vscode.window.activeTextEditor;
      const context = contextDetector.detectEcosystem(editor);

      let ecosystem = context.ecosystem;
      if (context.confidence !== 'high') {
        ecosystem = await contextDetector.promptForEcosystem(context);
      }

      const query = await vscode.window.showInputBox({
        prompt: `Enter ${contextDetector.getEcosystemDisplayName(ecosystem)} package name to search`,
        placeHolder:
          ecosystem === 'npm' ? 'e.g., express, react, lodash' : 'e.g., requests, numpy, django',
      });

      if (!query) {
        return;
      }

      if (ecosystem === 'npm') {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: `Searching npm for "${query}"...`,
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
      } else if (ecosystem === 'pypi') {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: `Searching PyPI for "${query}"...`,
            cancellable: false,
          },
          async () => {
            const packageDetails = await pypiService.getPackageInfo(query);
            await uiHelper.showPyPiPackageDetails(packageDetails);
          },
        );
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Error in smart search: ${String(error)}`);
    }
  });

  // Command: Smart Search Selected Text
  const smartSearchSelectedCommand = vscode.commands.registerCommand(
    'npmSearch.smartSearchSelected',
    async () => {
      try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showInformationMessage('No active editor found');
          return;
        }

        const context = contextDetector.detectEcosystem(editor);
        let ecosystem = context.ecosystem;

        if (context.confidence !== 'high') {
          ecosystem = await contextDetector.promptForEcosystem(context);
        }

        const selection = editor.selection;
        const text = editor.document.getText(selection);

        if (!text.trim()) {
          vscode.window.showInformationMessage('No text selected');
          return;
        }

        // Extract package names based on ecosystem
        let packageNames: string[] = [];
        if (ecosystem === 'npm') {
          packageNames = npmsService.extractPackageNamesFromText(text);
        } else if (ecosystem === 'pypi') {
          packageNames = pypiService.extractPackageNamesFromText(text);
        }

        if (packageNames.length === 0) {
          vscode.window.showInformationMessage('No package names found in selected text');
          return;
        }

        if (packageNames.length === 1) {
          const packageName = packageNames[0];
          if (ecosystem === 'npm') {
            await vscode.window.withProgress(
              {
                location: vscode.ProgressLocation.Notification,
                title: `Searching npm for "${packageName}"...`,
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
          } else if (ecosystem === 'pypi') {
            await vscode.window.withProgress(
              {
                location: vscode.ProgressLocation.Notification,
                title: `Searching PyPI for "${packageName}"...`,
                cancellable: false,
              },
              async () => {
                const packageDetails = await pypiService.getPackageInfo(packageName);
                await uiHelper.showPyPiPackageDetails(packageDetails);
              },
            );
          }
        } else {
          const selectedPackage = await vscode.window.showQuickPick(packageNames, {
            placeHolder: 'Select a package to search',
          });

          if (selectedPackage) {
            if (ecosystem === 'npm') {
              await vscode.window.withProgress(
                {
                  location: vscode.ProgressLocation.Notification,
                  title: `Searching npm for "${selectedPackage}"...`,
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
            } else if (ecosystem === 'pypi') {
              await vscode.window.withProgress(
                {
                  location: vscode.ProgressLocation.Notification,
                  title: `Searching PyPI for "${selectedPackage}"...`,
                  cancellable: false,
                },
                async () => {
                  const packageDetails = await pypiService.getPackageInfo(selectedPackage);
                  await uiHelper.showPyPiPackageDetails(packageDetails);
                },
              );
            }
          }
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Error in smart search selected: ${String(error)}`);
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
    pypiSearchCommand,
    pypiVersionHistoryCommand,
    analyzeRequirementsCommand,
    smartSearchCommand,
    smartSearchSelectedCommand,
  );
}

export function deactivate(): void {
  // Clean up resources if needed
}
