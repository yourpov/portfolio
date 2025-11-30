class GameCarousel {
  private carousel: HTMLElement | null = null;
  private dots: NodeListOf<Element> | null = null;
  private items: NodeListOf<Element> | null = null;
  private curr = 0;
  private autoScroll: number | null = null;
  private isDragging = false;
  private startX = 0;
  private scrollLeft = 0;

  start() {
    this.carousel = document.querySelector('.gaming-carousel');
    this.dots = document.querySelectorAll('.carousel-dot');
    this.items = document.querySelectorAll('.gaming-carousel-item');

    if (!this.carousel || !this.dots || !this.items) return;

    this.setupNav();
    this.setupDrag();
    this.setupAutoScroll();
    this.setupHoverEffects();
  }

  private setupNav() {
    this.dots?.forEach((dot, i) => {
      dot.addEventListener('click', () => this.goTo(i));
    });

    this.carousel?.addEventListener('scroll', () => {
      this.updateActive();
    });
  }

  private setupDrag() {
    if (!this.carousel) return;

    this.carousel.addEventListener('mousedown', (e: MouseEvent) => {
      this.isDragging = true;
      this.carousel!.style.cursor = 'grabbing';
      this.startX = e.pageX - this.carousel!.offsetLeft;
      this.scrollLeft = this.carousel!.scrollLeft;
      if (this.autoScroll) {
        clearInterval(this.autoScroll);
        this.autoScroll = null;
      }
    });

    this.carousel.addEventListener('mouseleave', () => {
      this.isDragging = false;
      this.carousel!.style.cursor = 'grab';
      this.setupAutoScroll();
    });

    this.carousel.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.carousel!.style.cursor = 'grab';
      this.setupAutoScroll();
    });

    this.carousel.addEventListener('mousemove', (e: MouseEvent) => {
      if (!this.isDragging) return;
      e.preventDefault();
      const x = e.pageX - this.carousel!.offsetLeft;
      const walk = (x - this.startX) * 2.1;
      this.carousel!.scrollLeft = this.scrollLeft - walk;
    });

    this.carousel.style.cursor = 'grab';
  }

  private setupAutoScroll() {
    if (this.autoScroll) clearInterval(this.autoScroll);
    
    this.autoScroll = window.setInterval(() => {
      if (!this.isDragging && this.items) {
        this.curr = (this.curr + 1) % this.items.length;
        this.goTo(this.curr);
      }
    }, 4000);
  }

  private setupHoverEffects() {
    this.items?.forEach(item => {
      item.addEventListener('mouseenter', () => {
        if (this.autoScroll) {
          clearInterval(this.autoScroll);
          this.autoScroll = null;
        }
      });

      item.addEventListener('mouseleave', () => {
        this.setupAutoScroll();
      });
    });
  }

  private goTo(idx: number) {
    if (!this.carousel || !this.items) return;
    
    const item = this.items[idx] as HTMLElement;
    const scrollPos = item.offsetLeft - (this.carousel.clientWidth / 2) + (item.clientWidth / 2);
    
    this.carousel.scrollTo({
      left: scrollPos,
      behavior: 'smooth'
    });

    this.curr = idx;
    this.updateDots();
  }

  private updateActive() {
    if (!this.carousel || !this.items) return;

    const center = this.carousel.scrollLeft + this.carousel.clientWidth / 2;
    let closest = 0;
    let minDist = Infinity;

    this.items.forEach((item, i) => {
      const el = item as HTMLElement;
      const itemCenter = el.offsetLeft + el.clientWidth / 2;
      const dist = Math.abs(center - itemCenter);

      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });

    this.curr = closest;
    this.updateDots();
  }

  private updateDots() {
    this.dots?.forEach((dot, i) => {
      if (i === this.curr) {
        dot.classList.add('bg-accent');
        dot.classList.remove('bg-accent/30');
      } else {
        dot.classList.remove('bg-accent');
        dot.classList.add('bg-accent/30');
      }
    });
  }

  disconnect() {
    if (this.autoScroll) clearInterval(this.autoScroll);
  }
}

export default GameCarousel;
