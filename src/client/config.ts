import type { SiteConfig } from '../types/config';

class ConfigLoader {
  private cfg: SiteConfig | null = null;

  async load(): Promise<void> {
    try {
      const res = await fetch('/api/config');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.cfg = await res.json() as SiteConfig;
      this.apply();
    } catch (e) {
      console.error('config load failed:', e);
    }
  }

  private apply(): void {
    if (!this.cfg) return;

    document.querySelectorAll('[data-config-age]').forEach(el => {
      el.textContent = `${this.cfg!.age} years old`;
    });

    document.querySelectorAll('[data-config-years]').forEach(el => {
      el.textContent = this.cfg!.yearsExperience;
    });

    document.querySelectorAll('[data-config-song-count]').forEach(el => {
      el.textContent = `music production, ${this.cfg!.songCount} songs`;
    });

    this.showTech();
    this.getVisitors();

    const desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute('content', `${this.cfg.age} year old freelance developer, roblox game developer, and music artist with ${this.cfg.songCount}+ songs`);
    }

    const title = document.querySelector('title');
    if (title) {
      title.textContent = `pov - ${this.cfg.age} year old freelance dev, roblox game dev, artist`;
    }

    document.querySelectorAll('[data-counter]').forEach(el => {
      const t = el.getAttribute('data-counter-type');
      if (t === 'projects') el.setAttribute('data-counter', this.cfg!.projectsCompleted);
      if (t === 'songs') el.setAttribute('data-counter', this.cfg!.songCount);
      if (t === 'years') el.setAttribute('data-counter', this.cfg!.yearsExperience);
      if (t === 'clients') el.setAttribute('data-counter', this.cfg!.clientsCount);
    });

    this.setLinks();
  }

  private setLinks(): void {
    if (!this.cfg) return;

    const links = {
      github: `https://github.com/${this.cfg.socials.github}`,
      steam: `https://steamcommunity.com/id/${this.cfg.socials.steam}/`,
      discord: `https://discord.com/users/${this.cfg.socials.discord}`,
      twitter: `https://twitter.com/${this.cfg.socials.twitter}`,
      instagram: `https://instagram.com/${this.cfg.socials.instagram}`,
      telegram: `https://t.me/${this.cfg.socials.telegram}`
    };

    Object.entries(links).forEach(([p, url]) => {
      document.querySelectorAll(`[data-social="${p}"]`).forEach(el => {
        if (el instanceof HTMLAnchorElement) el.href = url;
      });
    });

    document.querySelectorAll('[data-username]').forEach(el => {
      const p = el.getAttribute('data-username');
      if (p && this.cfg!.socials[p as keyof typeof this.cfg.socials]) {
        el.textContent = this.cfg!.socials[p as keyof typeof this.cfg.socials];
      }
    });

    const val = document.querySelector('[data-username="valorant"]');
    if (val && this.cfg.socials.valorant) {
      val.textContent = this.cfg.socials.valorant;
    }
  }

  private showTech(): void {
    if (!this.cfg) return;
    
    const box = document.querySelector('[data-tech-stack]');
    if (!box) return;

    const icons: Record<string, string> = {
      'Lua': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/lua/lua-original.svg',
      'Golang': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg',
      'TypeScript': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
      'JavaScript': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
      'Python': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
      'HTML': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
      'CSS': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
      'React': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
      'Node.js': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
      'Bun': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bun/bun-original.svg',
      'Tailwind CSS': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg',
      'HTMX': 'https://raw.githubusercontent.com/bigskysoftware/htmx/master/www/static/img/htmx_logo.1.png',
      'Smarty': 'https://www.smarty.net/images/smarty-logo.svg',
      'VSCode': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg'
    };

    const urls: Record<string, string> = {
      'Lua': 'https://www.lua.org/',
      'Golang': 'https://go.dev/',
      'TypeScript': 'https://www.typescriptlang.org/',
      'JavaScript': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
      'Python': 'https://www.python.org/',
      'HTML': 'https://developer.mozilla.org/en-US/docs/Web/HTML',
      'CSS': 'https://developer.mozilla.org/en-US/docs/Web/CSS',
      'React': 'https://react.dev/',
      'Node.js': 'https://nodejs.org/',
      'Bun': 'https://bun.sh/',
      'Tailwind CSS': 'https://tailwindcss.com/',
      'HTMX': 'https://htmx.org/',
      'Smarty': 'https://www.smarty.net/',
      'VSCode': 'https://code.visualstudio.com/'
    };

    const stuff = [...this.cfg.techStack, ...this.cfg.frameworks, 'VSCode'];

    box.innerHTML = stuff.map(tech => {
      const icon = icons[tech];
      const url = urls[tech];
      const img = icon
        ? `<img src="${icon}" alt="${tech}" class="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300" onerror="this.style.display='none'">`
        : '<span class="text-3xl group-hover:scale-110 transition-transform duration-300">💻</span>';
      
      return `
        <a href="${url}" target="_blank" rel="noopener" class="group bg-dark/50 backdrop-blur-sm px-6 py-4 rounded-xl border border-accent/10 hover:border-accent/30 transition-all duration-300 flex items-center gap-3 whitespace-nowrap cursor-pointer">
          ${img}
          <span class="text-sm font-bold text-white">${tech}</span>
        </a>
      `;
    }).join('');

    // Dispatch event to notify that tech items are loaded
    window.dispatchEvent(new CustomEvent('techStackLoaded'));
  }

  private async getVisitors(): Promise<void> {
    try {
      const res = await fetch('/api/visitors', { method: 'POST' });
      if (!res.ok) throw new Error('cant get visitors');
      const data = await res.json() as { count: number };
      const el = document.querySelector('[data-visitor-count]');
      if (el) {
        this.countUp(el as HTMLElement, 0, data.count, 1000);
      }
    } catch (err) {
      console.error('Failed to load visitor count:', err);
    }
  }

  private countUp(el: HTMLElement, start: number, end: number, dur: number): void {
    const t = Date.now();
    const update = () => {
      const now = Date.now();
      const prog = Math.min((now - t) / dur, 1);
      const curr = Math.floor(start + (end - start) * prog);
      el.textContent = curr.toLocaleString();
      if (prog < 1) requestAnimationFrame(update);
    };
    update();
  }
}

export default ConfigLoader;
