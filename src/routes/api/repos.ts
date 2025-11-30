import RouteBuilder from '@structures/RouteBuilder';
import type { GitHubApiRepo, GitHubRepo } from '@typings/github';
import { logger } from '@utils/logger';

if (!process.env.GITHUB_USERNAME) {
  throw new Error('GITHUB_USERNAME is required in environment variables');
}

const username = process.env.GITHUB_USERNAME;

export default new RouteBuilder().on('get', async () => {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });

    if (!response.ok) {
      logger.error(`GitHub API returned ${response.status}`);
      return new Response(JSON.stringify({ error: 'failed to fetch repositories' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = (await response.json()) as GitHubApiRepo[];
    
    const filtered: GitHubRepo[] = data
      .filter(repo => !repo.fork && !repo.archived)
      .map(repo => ({
        name: repo.name,
        description: repo.description || 'no description',
        language: repo.language?.toLowerCase() || 'other',
        updated: new Date(repo.updated_at),
        url: repo.html_url,
        topics: repo.topics || [],
        stars: repo.stargazers_count
      }));

    return new Response(JSON.stringify(filtered), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    logger.error(err, 'Failed to fetch GitHub repos');
    return new Response(JSON.stringify({ error: 'failed to load projects' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
