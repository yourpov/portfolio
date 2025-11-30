export class ViewportObserver {
  private observer: IntersectionObserver;

  constructor(options?: IntersectionObserverInit) {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
        ...options
      }
    );
  }

  observe(elements: NodeListOf<Element> | Element[]): void {
    elements.forEach(el => this.observer.observe(el));
  }

  disconnect(): void {
    this.observer.disconnect();
  }
}
