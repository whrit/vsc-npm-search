// PyPI API integration using built-in fetch (no external dependencies)

/* eslint-disable @typescript-eslint/naming-convention */
// Note: PyPI API uses snake_case property names, so we disable naming convention checks

export interface PyPiPackageInfo {
  name: string;
  version: string;
  summary?: string;
  description?: string;
  author?: string;
  author_email?: string;
  license?: string;
  keywords?: string;
  home_page?: string;
  project_url?: string;
  project_urls?: {
    [key: string]: string;
  };
  requires_dist?: string[];
  requires_python?: string;
  classifiers?: string[];
}

export interface PyPiRelease {
  version: string;
  upload_time: string;
  python_version: string;
  requires_python?: string;
  packagetype: string;
  size: number;
  digests: {
    md5: string;
    sha256: string;
  };
}

export interface PyPiPackageDetails {
  info: PyPiPackageInfo;
  releases: {
    [version: string]: PyPiRelease[];
  };
  urls: PyPiRelease[];
  last_serial: number;
}

export interface PyPiSearchResult {
  name: string;
  version: string;
  summary?: string;
}

export interface PyPiVersionHistory {
  name: string;
  versions: Array<{
    version: string;
    uploadTime: string;
    requiresPython?: string;
  }>;
  totalVersions: number;
}

export class PyPiService {
  private readonly _pypiUrl = 'https://pypi.org/pypi';

  private async _fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      headers: { accept: 'application/json' },
    });

    if (!response.ok) {
      let text = '';
      try {
        text = await response.text();
      } catch {
        // ignore
      }
      throw new Error(`HTTP ${response.status} ${response.statusText}${text ? `: ${text}` : ''}`);
    }

    return (await response.json()) as T;
  }

  async getPackageInfo(packageName: string): Promise<PyPiPackageDetails> {
    try {
      const data = await this._fetchJson<PyPiPackageDetails>(
        `${this._pypiUrl}/${encodeURIComponent(packageName)}/json`,
      );
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('HTTP 404')) {
        throw new Error(`Package "${packageName}" not found on PyPI`);
      }
      console.error('Error getting PyPI package info:', error);
      throw new Error('Failed to get PyPI package information');
    }
  }

  async searchPackages(query: string): Promise<PyPiSearchResult[]> {
    // Note: PyPI doesn't have a robust JSON search API like npm
    // This is a simplified implementation that tries to get the exact package
    // For a more robust search, we would need to use a third-party service or web scraping
    try {
      const data = await this.getPackageInfo(query);
      return [
        {
          name: data.info.name,
          version: data.info.version,
          summary: data.info.summary,
        },
      ];
    } catch (error) {
      // If exact match fails, return empty results
      // In a production implementation, we'd want to use PyPI's search API or a service
      console.warn('PyPI search failed, package not found:', error);
      return [];
    }
  }

  async getPackageVersionHistory(packageName: string, limit = 50): Promise<PyPiVersionHistory> {
    try {
      const data = await this.getPackageInfo(packageName);

      // Get all versions and their upload times
      const versions = Object.entries(data.releases)
        .map(([version, releases]) => {
          // Get the first release for this version (usually the source distribution)
          const firstRelease = releases[0];
          return {
            version,
            uploadTime: firstRelease?.upload_time || '',
            requiresPython: firstRelease?.requires_python,
          };
        })
        .filter((v) => v.uploadTime) // Filter out versions without upload times
        .sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime())
        .slice(0, limit);

      return {
        name: data.info.name,
        versions,
        totalVersions: Object.keys(data.releases).length,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('HTTP 404')) {
        throw new Error(`Package "${packageName}" not found on PyPI`);
      }
      console.error('Error getting PyPI version history:', error);
      throw new Error('Failed to get PyPI package version history');
    }
  }

  extractPackageNamesFromText(text: string): string[] {
    // Extract Python package names from various formats
    const patterns = [
      // requirements.txt format: package==1.0.0 or package>=1.0.0
      /^([a-zA-Z0-9_-]+)(?:[=><~!]+[\d.]+)?/gm,
      // package-name==1.0.0 inline
      /([a-zA-Z0-9_-]+)(?:[=><~!]+[\d.]+)/g,
      // Just package names
      /\b([a-zA-Z0-9_-]+)\b/g,
    ];

    const packageNames = new Set<string>();

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const name = match[1];

        // Filter out common non-package names and validate
        if (
          name &&
          name.length > 1 &&
          !/^(true|false|null|none|import|from|as|def|class|if|else|elif|return|for|while|in|is|not)$/i.test(
            name,
          ) &&
          !/^\d+$/.test(name) &&
          // Exclude version numbers
          !/^[\d.]+$/.test(name) &&
          // Exclude operators
          !/^[=><~!]+$/.test(name)
        ) {
          packageNames.add(name);
        }
      }
    }

    return Array.from(packageNames);
  }

  parseRequirementsTxt(text: string): Array<{ name: string; version: string }> {
    const lines = text.split('\n');
    const packages: Array<{ name: string; version: string }> = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      // Parse package name and version specifier
      // Supports: package==1.0.0, package>=1.0.0, package~=1.0, etc.
      const match = trimmed.match(/^([a-zA-Z0-9_-]+)([=><~!]+.+)?$/);
      if (match) {
        packages.push({
          name: match[1],
          version: match[2] || '',
        });
      }
    }

    return packages;
  }

  async searchPackagesByNames(packageNames: string[]): Promise<Record<string, PyPiSearchResult[]>> {
    try {
      const results: Record<string, PyPiSearchResult[]> = {};

      for (const packageName of packageNames) {
        try {
          const searchResults = await this.searchPackages(packageName);
          results[packageName] = searchResults;
        } catch (error) {
          console.warn(`Failed to search for PyPI package ${packageName}:`, error);
          results[packageName] = [];
        }
      }

      return results;
    } catch (error) {
      console.error('Error searching PyPI packages by names:', error);
      throw new Error('Failed to search PyPI packages by names');
    }
  }

  getInstallCommand(packageName: string, manager: 'pip' | 'conda' | 'poetry' = 'pip'): string {
    switch (manager) {
      case 'pip':
        return `pip install ${packageName}`;
      case 'conda':
        return `conda install ${packageName}`;
      case 'poetry':
        return `poetry add ${packageName}`;
      default:
        return `pip install ${packageName}`;
    }
  }
}
