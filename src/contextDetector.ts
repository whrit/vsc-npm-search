import * as vscode from 'vscode';

export type PackageEcosystem = 'npm' | 'pypi' | 'unknown';

export interface EcosystemContext {
  ecosystem: PackageEcosystem;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

export class ContextDetector {
  /**
   * Detects the package ecosystem based on the active editor's file
   */
  detectEcosystem(editor?: vscode.TextEditor): EcosystemContext {
    if (!editor) {
      return {
        ecosystem: 'unknown',
        confidence: 'low',
        reason: 'No active editor',
      };
    }

    const document = editor.document;
    const fileName = document.fileName.toLowerCase();
    const languageId = document.languageId;

    // High confidence detection based on file name
    if (fileName.endsWith('package.json') || fileName.endsWith('package-lock.json')) {
      return {
        ecosystem: 'npm',
        confidence: 'high',
        reason: 'package.json file detected',
      };
    }

    if (
      fileName.endsWith('requirements.txt') ||
      fileName.endsWith('requirements-dev.txt') ||
      fileName.endsWith('requirements-test.txt')
    ) {
      return {
        ecosystem: 'pypi',
        confidence: 'high',
        reason: 'requirements.txt file detected',
      };
    }

    if (fileName.endsWith('pyproject.toml')) {
      return {
        ecosystem: 'pypi',
        confidence: 'high',
        reason: 'pyproject.toml file detected',
      };
    }

    if (fileName.endsWith('setup.py') || fileName.endsWith('setup.cfg')) {
      return {
        ecosystem: 'pypi',
        confidence: 'high',
        reason: 'Python setup file detected',
      };
    }

    if (fileName.endsWith('pipfile') || fileName.endsWith('pipfile.lock')) {
      return {
        ecosystem: 'pypi',
        confidence: 'high',
        reason: 'Pipfile detected',
      };
    }

    if (fileName.endsWith('poetry.lock')) {
      return {
        ecosystem: 'pypi',
        confidence: 'high',
        reason: 'poetry.lock file detected',
      };
    }

    // Medium confidence detection based on file extension
    if (fileName.endsWith('.py')) {
      return {
        ecosystem: 'pypi',
        confidence: 'medium',
        reason: 'Python file detected',
      };
    }

    if (
      fileName.endsWith('.js') ||
      fileName.endsWith('.ts') ||
      fileName.endsWith('.jsx') ||
      fileName.endsWith('.tsx') ||
      fileName.endsWith('.mjs') ||
      fileName.endsWith('.cjs')
    ) {
      return {
        ecosystem: 'npm',
        confidence: 'medium',
        reason: 'JavaScript/TypeScript file detected',
      };
    }

    // Low confidence detection based on language ID
    if (languageId === 'python') {
      return {
        ecosystem: 'pypi',
        confidence: 'low',
        reason: 'Python language detected',
      };
    }

    if (
      languageId === 'javascript' ||
      languageId === 'typescript' ||
      languageId === 'javascriptreact' ||
      languageId === 'typescriptreact'
    ) {
      return {
        ecosystem: 'npm',
        confidence: 'low',
        reason: 'JavaScript/TypeScript language detected',
      };
    }

    // Check workspace for package.json or requirements.txt
    const workspaceContext = this._checkWorkspace();
    if (workspaceContext) {
      return workspaceContext;
    }

    return {
      ecosystem: 'unknown',
      confidence: 'low',
      reason: 'Unable to determine ecosystem',
    };
  }

  private _checkWorkspace(): EcosystemContext | null {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return null;
    }

    // Check for package.json in workspace root
    // Note: We can't do async file checks here, so we return null
    // In a real implementation, you might want to cache workspace file information
    // and check for the existence of package.json, requirements.txt, or pyproject.toml
    return null;
  }

  /**
   * Gets a user-friendly name for the ecosystem
   */
  getEcosystemDisplayName(ecosystem: PackageEcosystem): string {
    switch (ecosystem) {
      case 'npm':
        return 'npm';
      case 'pypi':
        return 'PyPI';
      case 'unknown':
        return 'Unknown';
    }
  }

  /**
   * Prompts the user to select an ecosystem if detection is uncertain
   */
  async promptForEcosystem(currentContext: EcosystemContext): Promise<PackageEcosystem> {
    if (currentContext.confidence === 'high') {
      return currentContext.ecosystem;
    }

    const options: Array<{ label: string; value: PackageEcosystem; description: string }> = [
      {
        label: '$(package) npm',
        value: 'npm',
        description: 'JavaScript/TypeScript packages',
      },
      {
        label: '$(symbol-class) PyPI',
        value: 'pypi',
        description: 'Python packages',
      },
    ];

    let placeHolder = 'Select package ecosystem';
    if (currentContext.ecosystem !== 'unknown') {
      placeHolder = `Select package ecosystem (detected: ${this.getEcosystemDisplayName(currentContext.ecosystem)} - ${currentContext.reason})`;
    }

    const selected = await vscode.window.showQuickPick(options, {
      placeHolder,
    });

    return selected?.value || currentContext.ecosystem;
  }
}
