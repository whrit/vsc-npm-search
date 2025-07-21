import axios from 'axios';

export interface PackageSearchResult {
  package: {
    name: string;
    scope: string;
    version: string;
    description: string;
    keywords: string[];
    date: string;
    links: {
      npm: string;
      homepage?: string;
      repository?: string;
      bugs?: string;
    };
    author?: {
      name: string;
      email?: string;
      username?: string;
    };
    publisher: {
      username: string;
      email: string;
    };
    maintainers: Array<{
      username: string;
      email: string;
    }>;
  };
  flags?: {
    deprecated?: string;
    unstable?: boolean;
    insecure?: boolean;
  };
  score: {
    final: number;
    detail: {
      quality: number;
      popularity: number;
      maintenance: number;
    };
  };
  searchScore: number;
}

export interface SearchSuggestion extends PackageSearchResult {
  highlight?: string;
}

export interface SearchResponse {
  total: number;
  results: PackageSearchResult[];
}

export interface NpmRegistrySearchResponse {
  objects: Array<{
    package: {
      name: string;
      scope: string;
      version: string;
      description: string;
      keywords?: string[];
      date: string;
      links: {
        npm: string;
        homepage?: string;
        repository?: string;
        bugs?: string;
      };
      author?: {
        name: string;
        email?: string;
        username?: string;
      };
      publisher: {
        username: string;
        email: string;
      };
      maintainers: Array<{
        username: string;
        email: string;
      }>;
    };
    score: {
      final: number;
      detail: {
        quality: number;
        popularity: number;
        maintenance: number;
      };
    };
    searchScore: number;
    flags?: {
      deprecated?: string;
      unstable?: boolean;
      insecure?: boolean;
    };
  }>;
  total: number;
  time: string;
}

export interface NpmRegistryPackageInfo {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _rev: string;
  name: string;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'dist-tags': {
    latest: string;
    [tag: string]: string;
  };
  versions: {
    [version: string]: {
      name: string;
      version: string;
      description?: string;
      main?: string;
      keywords?: string[];
      author?: {
        name: string;
        email?: string;
        url?: string;
      };
      license?: string;
      dependencies?: { [key: string]: string };
      devDependencies?: { [key: string]: string };
      peerDependencies?: { [key: string]: string };
      repository?: {
        type: string;
        url: string;
      };
      homepage?: string;
      bugs?: {
        url: string;
      };
      maintainers: Array<{
        name: string;
        email: string;
      }>;
      dist: {
        tarball: string;
        shasum: string;
        integrity?: string;
      };
      // eslint-disable-next-line @typescript-eslint/naming-convention
      _npmUser: {
        name: string;
        email: string;
      };
    };
  };
  readme?: string;
  maintainers: Array<{
    name: string;
    email: string;
  }>;
  time: {
    created: string;
    modified: string;
    [version: string]: string;
  };
  homepage?: string;
  keywords?: string[];
  repository?: {
    type: string;
    url: string;
  };
  author?: {
    name: string;
    email?: string;
    url?: string;
  };
  bugs?: {
    url: string;
  };
  license?: string;
  users?: { [username: string]: boolean };
}

export interface PackageInfo {
  name: string;
  version: string;
  description?: string;
  keywords?: string[];
  author?: {
    name: string;
    email?: string;
    url?: string;
  };
  maintainers: Array<{
    name: string;
    email: string;
  }>;
  repository?: {
    type: string;
    url: string;
  };
  homepage?: string;
  bugs?: string;
  license?: string;
  dependencies?: { [key: string]: string };
  devDependencies?: { [key: string]: string };
  peerDependencies?: { [key: string]: string };
  publishedAt: string;
  links: {
    npm: string;
    homepage?: string;
    repository?: string;
    bugs?: string;
  };
}

export interface VersionInfo {
  version: string;
  publishedAt: string;
  description?: string;
  dependencies?: { [key: string]: string };
  devDependencies?: { [key: string]: string };
  peerDependencies?: { [key: string]: string };
  license?: string;
  author?: {
    name: string;
    email?: string;
    url?: string;
  };
}

export interface PackageVersionHistory {
  name: string;
  versions: VersionInfo[];
  totalVersions: number;
}

export interface PackageJsonDependency {
  name: string;
  version: string;
  type: 'dependency' | 'devDependency' | 'peerDependency' | 'optionalDependency';
}

export interface PackageJsonInfo {
  dependencies: PackageJsonDependency[];
  devDependencies: PackageJsonDependency[];
  peerDependencies: PackageJsonDependency[];
  optionalDependencies: PackageJsonDependency[];
}

export class NpmsService {
  private readonly _registryUrl = 'https://registry.npmjs.org';
  private readonly _searchUrl = 'http://registry.npmjs.com';

  async searchPackages(query: string, size = 25, from = 0): Promise<SearchResponse> {
    try {
      const response = await axios.get<NpmRegistrySearchResponse>(
        `${this._searchUrl}/-/v1/search`,
        {
          params: {
            text: query,
            size: Math.min(size, 250),
            from: Math.min(from, 5000),
          },
        },
      );

      const results: PackageSearchResult[] = response.data.objects.map((obj) => ({
        package: {
          name: obj.package.name,
          scope: obj.package.scope || 'unscoped',
          version: obj.package.version,
          description: obj.package.description || '',
          keywords: obj.package.keywords || [],
          date: obj.package.date,
          links: obj.package.links,
          author: obj.package.author,
          publisher: obj.package.publisher,
          maintainers: obj.package.maintainers,
        },
        flags: obj.flags,
        score: obj.score,
        searchScore: obj.searchScore,
      }));

      return {
        total: response.data.total,
        results,
      };
    } catch (error) {
      console.error('Error searching packages:', error);
      throw new Error('Failed to search npm packages');
    }
  }

  async getSuggestions(query: string, size = 25): Promise<SearchSuggestion[]> {
    try {
      const response = await axios.get<NpmRegistrySearchResponse>(
        `${this._searchUrl}/-/v1/search`,
        {
          params: {
            text: query,
            size: Math.min(size, 100),
          },
        },
      );

      return response.data.objects.map((obj) => ({
        package: {
          name: obj.package.name,
          scope: obj.package.scope || 'unscoped',
          version: obj.package.version,
          description: obj.package.description || '',
          keywords: obj.package.keywords || [],
          date: obj.package.date,
          links: obj.package.links,
          author: obj.package.author,
          publisher: obj.package.publisher,
          maintainers: obj.package.maintainers,
        },
        flags: obj.flags,
        score: obj.score,
        searchScore: obj.searchScore,
        highlight: obj.package.name,
      }));
    } catch (error) {
      console.error('Error getting suggestions:', error);
      throw new Error('Failed to get package suggestions');
    }
  }

  async getPackageInfo(packageName: string): Promise<PackageInfo> {
    try {
      const response = await axios.get<NpmRegistryPackageInfo>(
        `${this._registryUrl}/${encodeURIComponent(packageName)}`,
      );

      const data = response.data;
      const latestVersion = data['dist-tags'].latest;
      const latestVersionData = data.versions[latestVersion];

      if (!latestVersionData) {
        throw new Error(`Latest version data not found for package "${packageName}"`);
      }

      const packageInfo: PackageInfo = {
        name: data.name,
        version: latestVersion,
        description: latestVersionData.description || data.description,
        keywords: latestVersionData.keywords || data.keywords,
        author: latestVersionData.author || data.author,
        maintainers: data.maintainers,
        repository: latestVersionData.repository || data.repository,
        homepage: latestVersionData.homepage || data.homepage,
        bugs: latestVersionData.bugs?.url || data.bugs?.url,
        license: latestVersionData.license || data.license,
        dependencies: latestVersionData.dependencies,
        devDependencies: latestVersionData.devDependencies,
        peerDependencies: latestVersionData.peerDependencies,
        publishedAt: data.time[latestVersion] || data.time.modified,
        links: {
          npm: `https://www.npmjs.com/package/${packageName}`,
          homepage: latestVersionData.homepage || data.homepage,
          repository: latestVersionData.repository?.url || data.repository?.url,
          bugs: latestVersionData.bugs?.url || data.bugs?.url,
        },
      };

      return packageInfo;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`Package "${packageName}" not found`);
      }
      console.error('Error getting package info:', error);
      throw new Error('Failed to get package information');
    }
  }

  async getMultiplePackagesInfo(packageNames: string[]): Promise<Record<string, PackageInfo>> {
    try {
      const promises = packageNames.map(async (name) => {
        try {
          const info = await this.getPackageInfo(name);
          return { name, info };
        } catch (error) {
          console.warn(`Failed to get info for package ${name}:`, error);
          return { name, info: null };
        }
      });

      const results = await Promise.all(promises);
      const packageInfoMap: Record<string, PackageInfo> = {};

      results.forEach(({ name, info }) => {
        if (info) {
          packageInfoMap[name] = info;
        }
      });

      return packageInfoMap;
    } catch (error) {
      console.error('Error getting multiple packages info:', error);
      throw new Error('Failed to get packages information');
    }
  }

  async getPackageVersionHistory(packageName: string, limit = 50): Promise<PackageVersionHistory> {
    try {
      const response = await axios.get<NpmRegistryPackageInfo>(
        `${this._registryUrl}/${encodeURIComponent(packageName)}`,
      );

      const data = response.data;
      const versions: VersionInfo[] = [];
      const versionEntries = Object.entries(data.versions);

      // Sort versions by publish date (newest first)
      const sortedVersions = versionEntries
        .map(([version, versionData]) => ({
          version,
          versionData,
          publishedAt: data.time[version] || data.time.modified,
        }))
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, limit);

      for (const { version, versionData, publishedAt } of sortedVersions) {
        versions.push({
          version,
          publishedAt,
          description: versionData.description,
          dependencies: versionData.dependencies,
          devDependencies: versionData.devDependencies,
          peerDependencies: versionData.peerDependencies,
          license: versionData.license,
          author: versionData.author,
        });
      }

      return {
        name: data.name,
        versions,
        totalVersions: Object.keys(data.versions).length,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`Package "${packageName}" not found`);
      }
      console.error('Error getting package version history:', error);
      throw new Error('Failed to get package version history');
    }
  }

  parsePackageJsonFromText(text: string): PackageJsonInfo {
    try {
      const packageJson = JSON.parse(text) as Record<string, unknown>;
      const result: PackageJsonInfo = {
        dependencies: [],
        devDependencies: [],
        peerDependencies: [],
        optionalDependencies: [],
      };

      if (packageJson.dependencies && typeof packageJson.dependencies === 'object') {
        result.dependencies = Object.entries(
          packageJson.dependencies as Record<string, string>,
        ).map(([name, version]) => ({
          name,
          version,
          type: 'dependency' as const,
        }));
      }

      if (packageJson.devDependencies && typeof packageJson.devDependencies === 'object') {
        result.devDependencies = Object.entries(
          packageJson.devDependencies as Record<string, string>,
        ).map(([name, version]) => ({
          name,
          version,
          type: 'devDependency' as const,
        }));
      }

      if (packageJson.peerDependencies && typeof packageJson.peerDependencies === 'object') {
        result.peerDependencies = Object.entries(
          packageJson.peerDependencies as Record<string, string>,
        ).map(([name, version]) => ({
          name,
          version,
          type: 'peerDependency' as const,
        }));
      }

      if (
        packageJson.optionalDependencies &&
        typeof packageJson.optionalDependencies === 'object'
      ) {
        result.optionalDependencies = Object.entries(
          packageJson.optionalDependencies as Record<string, string>,
        ).map(([name, version]) => ({
          name,
          version,
          type: 'optionalDependency' as const,
        }));
      }

      return result;
    } catch (error) {
      console.error('Error parsing package.json:', error);
      throw new Error('Invalid package.json format');
    }
  }

  extractPackageNamesFromText(text: string): string[] {
    // Extract package names from various formats
    const patterns = [
      // "package-name": "^1.0.0" or "package-name": "1.0.0"
      /"([^"]+)":\s*["^~]?[\d.]+/g,
      // package-name@1.0.0
      /([a-zA-Z0-9@._-]+)@[\d.]+/g,
      // Scoped packages: @scope/package-name
      /@([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)/g,
      // Regular package names (but not scoped ones)
      /\b([a-zA-Z0-9._-]+)\b/g,
    ];

    const packageNames = new Set<string>();
    const processedRanges: Array<{ start: number; end: number }> = [];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const matchStart = match.index;
        const matchEnd = matchStart + match[0].length;

        // Check if this match overlaps with a previously processed scoped package
        const isOverlapping = processedRanges.some(
          (range) => matchStart < range.end && matchEnd > range.start,
        );

        if (isOverlapping) {
          continue; // Skip this match as it's part of a scoped package
        }

        let name: string;

        // Handle scoped packages specially
        if (pattern.source.includes('@([a-zA-Z0-9._-]+)\\/([a-zA-Z0-9._-]+)')) {
          // For scoped packages, combine scope and package name
          name = `@${match[1]}/${match[2]}`;
          // Record the range of this scoped package to prevent overlap
          processedRanges.push({ start: matchStart, end: matchEnd });
        } else {
          name = match[1];
        }

        // Filter out common non-package names and validate
        if (
          name &&
          name.length > 0 &&
          !/^(true|false|null|undefined|function|class|const|let|var|import|export|from|require)$/.test(
            name,
          ) &&
          !/^\d+$/.test(name) &&
          // Exclude version numbers (pure numbers or version-like strings)
          !/^[\d.]+$/.test(name) &&
          !/^[\^~]?[\d.]+$/.test(name) &&
          // For scoped packages, ensure they have the proper format
          (name.startsWith('@') ? name.includes('/') : true) &&
          // Avoid adding individual parts of scoped packages
          !(name.startsWith('@') && !name.includes('/'))
        ) {
          packageNames.add(name);
        }
      }
    }

    return Array.from(packageNames);
  }

  async searchPackagesByNames(
    packageNames: string[],
  ): Promise<Record<string, PackageSearchResult[]>> {
    try {
      const results: Record<string, PackageSearchResult[]> = {};

      for (const packageName of packageNames) {
        try {
          const searchResults = await this.searchPackages(packageName, 5);
          results[packageName] = searchResults.results;
        } catch (error) {
          console.warn(`Failed to search for package ${packageName}:`, error);
          results[packageName] = [];
        }
      }

      return results;
    } catch (error) {
      console.error('Error searching packages by names:', error);
      throw new Error('Failed to search packages by names');
    }
  }
}
