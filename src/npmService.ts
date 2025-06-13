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

export interface PackageInfo {
  analyzedAt: string;
  collected: {
    metadata: {
      name: string;
      scope?: string;
      version: string;
      description: string;
      keywords?: string[];
      date: string;
      author?: {
        name: string;
        email?: string;
        url?: string;
      };
      publisher: {
        username: string;
        email: string;
      };
      maintainers: Array<{
        username: string;
        email: string;
      }>;
      repository?: {
        type: string;
        url: string;
      };
      links: {
        npm: string;
        homepage?: string;
        repository?: string;
        bugs?: string;
      };
      license?: string;
      dependencies?: { [key: string]: string };
      devDependencies?: { [key: string]: string };
      peerDependencies?: { [key: string]: string };
      releases: Array<{
        from: string;
        to: string;
        count: number;
      }>;
    };
    npm: {
      downloads: Array<{
        from: string;
        to: string;
        count: number;
      }>;
      dependentsCount: number;
      starsCount: number;
    };
    github?: {
      homepage?: string;
      starsCount: number;
      forksCount: number;
      subscribersCount: number;
      issues: {
        count: number;
        openCount: number;
        distribution: { [key: string]: number };
        isDisabled: boolean;
      };
      contributors: Array<{
        username: string;
        commitsCount: number;
      }>;
      commits: Array<{
        from: string;
        to: string;
        count: number;
      }>;
    };
    source?: {
      files: {
        readmeSize: number;
        testsSize: number;
        hasChangelog: boolean;
      };
      coverage?: number;
    };
  };
  evaluation: {
    quality: {
      carefulness: number;
      tests: number;
      health: number;
      branding: number;
    };
    popularity: {
      communityInterest: number;
      downloadsCount: number;
      downloadsAcceleration: number;
      dependentsCount: number;
    };
    maintenance: {
      releasesFrequency: number;
      commitsFrequency: number;
      openIssues: number;
      issuesDistribution: number;
    };
  };
  score: {
    final: number;
    detail: {
      quality: number;
      popularity: number;
      maintenance: number;
    };
  };
  error?: {
    message: string;
    code: string;
  };
}

export class NpmsService {
  private readonly _baseUrl = 'https://api.npms.io/v2';

  async searchPackages(query: string, size = 25, from = 0): Promise<SearchResponse> {
    try {
      const response = await axios.get<SearchResponse>(`${this._baseUrl}/search`, {
        params: {
          q: query,
          size: Math.min(size, 250),
          from: Math.min(from, 5000),
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error searching packages:', error);
      throw new Error('Failed to search npm packages');
    }
  }

  async getSuggestions(query: string, size = 25): Promise<SearchSuggestion[]> {
    try {
      const response = await axios.get<SearchSuggestion[]>(`${this._baseUrl}/search/suggestions`, {
        params: {
          q: query,
          size: Math.min(size, 100),
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      throw new Error('Failed to get package suggestions');
    }
  }

  async getPackageInfo(packageName: string): Promise<PackageInfo> {
    try {
      const response = await axios.get<PackageInfo>(
        `${this._baseUrl}/package/${encodeURIComponent(packageName)}`,
      );
      return response.data;
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
      const response = await axios.post<Record<string, PackageInfo>>(
        `${this._baseUrl}/package/mget`,
        packageNames,
        {
          headers: {
            ['Content-Type']: 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error getting multiple packages info:', error);
      throw new Error('Failed to get packages information');
    }
  }
}
