import { throttle } from '../utils/helpers';
import { ViewportObserver } from '../utils/viewport';

class PageAnimations {
  private watcher: ViewportObserver;

  constructor() {
    this.watcher = new ViewportObserver();
  }

  start(): void {
    this.watchElements();
    this.blobMove();
  }

  private watchElements(): void {
    this.watcher.observe(document.querySelectorAll('.reveal'));
  }

  private blobMove(): void {
    const handleMouseMove = throttle((e: MouseEvent) => {
      const blobs = document.querySelectorAll('.animate-float');
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      blobs.forEach((blob, i) => {
        const el = blob as HTMLElement;
        const speed = (i + 1) * 19;
        const moveX = (x - 0.5) * speed;
        const moveY = (y - 0.5) * speed;
        el.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
    }, 16);

    document.addEventListener('mousemove', handleMouseMove);
  }

  disconnect(): void {
    this.watcher.disconnect();
  }
}

export default PageAnimations;
