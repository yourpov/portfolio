import type { GitHubRepo } from '../types/github';
import { ViewportObserver } from '../utils/viewport';

class GitHubProjects {
  private watcher: ViewportObserver;

  constructor() {
    this.watcher = new ViewportObserver();
  }

  async load(): Promise<void> {
    try {
      const response = await fetch('/api/repos');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = (await response.json()) as GitHubRepo[];
      this.show(data.slice(0, 6), data);
    } catch (err) {
      console.error('Failed to load GitHub repos:', err);
      this.showError();
    }
  }

  private show(displayRepos: GitHubRepo[], allRepos: GitHubRepo[]): void {
    const container = document.getElementById('reposContainer');
    if (!container) return;

    const skeletons = container.querySelectorAll('.skeleton-card');
    skeletons.forEach(skeleton => skeleton.remove());

    container.innerHTML = displayRepos.map(repo => `
      <a href="${repo.url}" target="_blank" class="project-card bg-dark/40 backdrop-blur-sm p-6 rounded-2xl card-glow hover:scale-105 transition-all border border-accent/10">
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm text-accent font-semibold">${repo.language || 'code'}</span>
          <span class="text-xs text-gray-500">${this.timeAgo(new Date(repo.updated))}</span>
        </div>
        <h3 class="text-xl font-bold mb-3">${repo.name.toLowerCase()}</h3>
        <p class="text-gray-400 text-sm">${repo.description}</p>
      </a>
    `).join('');

    if (allRepos.length > 6) {
      const showAllBtn = document.createElement('button');
      showAllBtn.id = 'showAllRepos';
      showAllBtn.className = 'col-span-full mt-4 px-6 py-3 bg-dark/40 text-gray-300 font-medium rounded-xl hover:bg-dark/60 hover:text-accent transition-all border border-accent/10';
      showAllBtn.textContent = `show all (${allRepos.length})`;
      showAllBtn.addEventListener('click', () => {
        this.show(allRepos, allRepos);
        showAllBtn.remove();
      });
      container.appendChild(showAllBtn);
    }

    this.watcher.observe(document.querySelectorAll('#reposContainer .reveal'));
  }

  private showError(): void {
    const container = document.getElementById('reposContainer');
    if (container) {
      container.innerHTML = '<div class="text-center text-gray-500 col-span-full py-12">couldnt load repos</div>';
    }
  }

  private timeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const w = Math.floor(d / 7);
    const m = Math.floor(d / 30);

    if (d < 1) return 'today';
    if (d === 1) return '1d ago';
    if (d < 7) return `${d}d ago`;
    if (w < 4) return `${w}w ago`;
    if (m < 12) return `${m}mo ago`;
    return date.toLocaleDateString('en', { month: 'short' });
  }

  disconnect(): void {
    this.watcher.disconnect();
  }
}

export default GitHubProjects;
