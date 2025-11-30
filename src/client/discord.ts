import type { Activity, LanyardData, LanyardMessage, SpotifyActivity } from '../types/lanyard';

class DiscordStatus {
  private ws: WebSocket | null = null;
  private hb: NodeJS.Timeout | null = null;
  private attempts = 0;
  private readonly maxAttempts = 5;
  private readonly uid: string;
  private readonly statusColors = {
    online: '#43b581',
    idle: '#faa61a',
    dnd: '#f04747',
    offline: '#747f8d'
  };

  constructor(userId: string) {
    this.uid = userId;
  }

  start(): void {
    this.ws = new WebSocket('wss://api.lanyard.rest/socket');
    this.ws.onopen = () => {
      this.attempts = 0;
    };
    this.ws.onmessage = (e: MessageEvent) => {
      const msg = JSON.parse(e.data) as LanyardMessage;
      if (msg.op === 1) {
        const hbData = msg.d as { heartbeat_interval: number };
        this.hb = setInterval(() => {
          this.ws?.send(JSON.stringify({ op: 3 }));
        }, hbData.heartbeat_interval);
        this.ws?.send(JSON.stringify({ op: 2, d: { subscribe_to_id: this.uid } }));
      }
      if (msg.t === 'INIT_STATE' || msg.t === 'PRESENCE_UPDATE') {
        this.update(msg.d as LanyardData);
      }
    };
    this.ws.onclose = () => {
      if (this.hb) clearInterval(this.hb);
      if (this.attempts < this.maxAttempts) {
        const delay = Math.min(1000 * Math.pow(2, this.attempts), 30000);
        this.attempts++;
        setTimeout(() => this.start(), delay);
      }
    };
    this.ws.onerror = () => this.ws?.close();
  }

  update(data: LanyardData): void {
    if (!data || !data.discord_user) return;

    const av = document.getElementById('discordAvatar');
    const user = document.getElementById('discordUsername');
    const stat = document.getElementById('discordStatus');
    const dot = document.getElementById('statusDot');
    const ring = document.getElementById('statusRing');
    const deco = document.getElementById('discordDecoration') as HTMLImageElement;

    if (!av || !user || !stat) return;

    const avUrl = `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png?size=256`;
    av.style.backgroundImage = `url(${avUrl})`;
    av.style.backgroundSize = 'cover';
    av.style.backgroundPosition = 'center';

    if (data.discord_user.avatar_decoration_data && deco) {
      const decoUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${data.discord_user.avatar_decoration_data.asset}.png?size=256`;
      deco.src = decoUrl;
      deco.classList.remove('hidden');
    } else if (deco) {
      deco.classList.add('hidden');
    }

    user.textContent = data.discord_user.username;

    const col = this.statusColors[data.discord_status] || '#747f8d';
    stat.textContent = data.discord_status;
    stat.style.color = col;
    
    if (dot) {
      dot.style.background = col;
      dot.style.boxShadow = `0 0 10px ${col}`;
    }
    
    if (ring) {
      ring.style.background = `conic-gradient(from 0deg, ${col}, ${col})`;
    }

    this.updateCustom(data.activities);

    // Update activity or spotify
    if (data.spotify) {
      this.updateSpotify(data.spotify);
    } else {
      this.updateAct(data.activities);
    }
  }

  private getEmojiUrl(emoji: { name: string; id?: string; animated?: boolean }): string | null {
    if (!emoji.id) return null;
    const ext = emoji.animated ? 'gif' : 'png';
    return `https://cdn.discordapp.com/emojis/${emoji.id}.${ext}?size=96&quality=lossless`;
  }

  private updateCustom(activities?: Activity[]): void {
    const customStatusDiv = document.getElementById('customStatus');
    const emojiEl = document.getElementById('customStatusEmoji');
    const textEl = document.getElementById('customStatusText');

    if (!customStatusDiv || !emojiEl || !textEl) return;

    const customActivity = activities?.find(a => a.type === 4);
    
    if (customActivity && (customActivity.emoji || customActivity.state)) {
      customStatusDiv.classList.remove('hidden');
      
      // Handle emoji
      if (customActivity.emoji) {
        const emojiUrl = this.getEmojiUrl(customActivity.emoji);
        if (emojiUrl) {
          emojiEl.innerHTML = `<img src="${emojiUrl}" alt="${customActivity.emoji.name}" class="w-6 h-6 object-contain" />`;
        } else {
          emojiEl.textContent = customActivity.emoji.name || '';
        }
      } else {
        emojiEl.textContent = '';
      }
      
      textEl.textContent = customActivity.state || '';
    } else {
      customStatusDiv.classList.add('hidden');
    }
  }

  private updateAct(activities?: Activity[]): void {
    const actDiv = document.getElementById('discordActivity');
    const spotDiv = document.getElementById('spotifyActivity');

    if (spotDiv) spotDiv.classList.add('hidden');
    if (!actDiv) return;

    const activity = activities?.find(a => a.type !== 2 && a.type !== 4);

    if (activity) {
      actDiv.classList.remove('hidden');
      
      const nameEl = document.getElementById('activityName');
      const detailsEl = document.getElementById('activityDetails');
      const stateEl = document.getElementById('activityState');
      const labelEl = document.getElementById('activityLabel');

      if (nameEl) nameEl.textContent = activity.name;
      if (detailsEl) detailsEl.textContent = activity.details || '';
      if (stateEl) stateEl.textContent = activity.state || '';
      
      if (labelEl) {
        const labels: Record<number, string> = {
          0: 'playing',
          1: 'streaming',
          3: 'watching',
          5: 'competing in'
        };
        labelEl.textContent = labels[activity.type] || 'doing';
      }
    } else {
      actDiv.classList.add('hidden');
    }
  }

  private updateSpotify(spotify: SpotifyActivity): void {
    const spotDiv = document.getElementById('spotifyActivity');
    const actDiv = document.getElementById('discordActivity');

    if (actDiv) actDiv.classList.add('hidden');
    if (!spotDiv) return;

    spotDiv.classList.remove('hidden');

    const cover = document.getElementById('spotifyCover') as HTMLImageElement;
    const song = document.getElementById('spotifySong');
    const artist = document.getElementById('spotifyArtist');

    if (cover) cover.src = spotify.album_art_url;
    if (song) song.textContent = spotify.song;
    if (artist) artist.textContent = spotify.artist;
  }

  disconnect(): void {
    if (this.hb) clearInterval(this.hb);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default DiscordStatus;
