/**
 * Represents a GitHub event.
 */
export interface GitHubEvent {
  /** The unique identifier of the event. */
  id: string;
  /** The type of the event. */
  type: string;
  /** The actor who triggered the event. */
  actor: {
    /** The ID of the actor. */
    id: number;
    /** The login name of the actor. */
    login: string;
    /** The avatar URL of the actor. */
    avatar_url: string;
  };
  /** The repository associated with the event. */
  repo: {
    /** The ID of the repository. */
    id: number;
    /** The name of the repository. */
    name: string;
    /** The URL of the repository. */
    url: string;
  };
  /** The payload of the event. */
  payload: any;
  /** Whether the event is public. */
  public: boolean;
  /** The creation date of the event. */
  created_at: string;
}

/**
 * Represents a GitHub user.
 */
export interface GitHubUser {
  /** The type of the user (e.g., User, Organization). */
  type: string;
  /** The login name of the user. */
  login: string;
  /** The unique identifier of the user. */
  id: number;
  /** The avatar URL of the user. */
  avatar_url: string;
  /** The HTML URL of the user's profile. */
  html_url: string;
  /** The display name of the user. */
  name: string;
  /** The company of the user. */
  company: string;
  /** The blog URL of the user. */
  blog: string;
  /** The location of the user. */
  location: string;
  /** The email of the user. */
  email: string;
  /** The bio of the user. */
  bio: string;
  /** The Twitter username of the user. */
  twitter_username: string;
  /** The number of public repositories. */
  public_repos: number;
  /** The number of public gists. */
  public_gists: number;
  /** The number of followers. */
  followers: number;
  /** The number of users the user is following. */
  following: number;
  /** The creation date of the user. */
  created_at: string;
  /** The last update date of the user. */
  updated_at: string;
}

/**
 * Represents a GitHub organization.
 */
export interface GitHubOrganization {
  /** The login name of the organization. */
  login: string;
  /** The unique identifier of the organization. */
  id: number;
  /** The API URL of the organization. */
  url: string;
  /** The avatar URL of the organization. */
  avatar_url: string;
  /** The description of the organization. */
  description: string | null;
}

/**
 * Represents a GitHub follower.
 */
export interface GitHubFollower {
  /** The login name of the follower. */
  login: string;
  /** The unique identifier of the follower. */
  id: number;
  /** The avatar URL of the follower. */
  avatar_url: string;
  /** The HTML URL of the follower's profile. */
  html_url: string;
}

/**
 * Represents a GitHub gist.
 */
export interface GitHubGist {
  /** The unique identifier of the gist. */
  id: string;
  /** The HTML URL of the gist. */
  html_url: string;
  /** The files contained in the gist. */
  files: Record<
    string,
    {
      /** The filename of the gist file. */
      filename: string;
      /** The MIME type of the gist file. */
      type: string;
      /** The programming language of the gist file. */
      language: string;
      /** The size of the gist file in bytes. */
      size: number;
      /** The content of the gist file. */
      content?: string;
    }
  >;
  /** Whether the gist is public. */
  public: boolean;
  /** The creation date of the gist. */
  created_at: string;
  /** The last update date of the gist. */
  updated_at: string;
  /** The description of the gist. */
  description: string | null;
}

/**
 * Represents a GitHub repository.
 */
export interface GitHubRepo {
  /** The unique identifier of the repository. */
  id: number;
  /** The name of the repository. */
  name: string;
  /** The full name of the repository (including owner). */
  full_name: string;
  /** The owner of the repository. */
  owner: GitHubUser;
  /** The HTML URL of the repository. */
  html_url: string;
  /** The description of the repository. */
  description: string;
  /** Whether the repository is a fork. */
  fork: boolean;
  /** The creation date of the repository. */
  created_at: string;
  /** The last update date of the repository. */
  updated_at: string;
  /** The last push date of the repository. */
  pushed_at: string;
  /** The homepage URL of the repository. */
  homepage: string;
  /** The size of the repository. */
  size: number;
  /** The number of stargazers. */
  stargazers_count: number;
  /** The number of watchers. */
  watchers_count: number;
  /** The main programming language of the repository. */
  language: string;
  /** The number of forks. */
  forks_count: number;
  /** The number of open issues. */
  open_issues_count: number;
  /** The license information of the repository. */
  license: {
    /** The key of the license. */
    key: string;
    /** The name of the license. */
    name: string;
    /** The SPDX identifier of the license. */
    spdx_id: string;
    /** The URL of the license. */
    url: string;
  };
  /** The topics associated with the repository. */
  topics: string[];
  /** The default branch of the repository. */
  default_branch: string;
  /** The visibility of the repository. */
  visibility: string;
  /** Whether the repository is archived. */
  archived: boolean;
  /** Whether the repository is disabled. */
  disabled: boolean;
}

/**
 * Represents the result of a GitHub search.
 */
export interface GitHubSearchResult {
  /** The total number of results. */
  total_count: number;
  /** Whether the results are incomplete. */
  incomplete_results: boolean;
  /** The items returned by the search. */
  items: (GitHubUser | GitHubRepo)[];
}
