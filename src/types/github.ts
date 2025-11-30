export interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  updated: Date;
  url: string;
  topics: string[];
  stars: number;
}

export interface GitHubApiRepo {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  updated_at: string;
  topics: string[];
  stargazers_count: number;
  fork: boolean;
  archived: boolean;
}
