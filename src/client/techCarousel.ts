export default class TechCarousel {
  start(): void {
    window.addEventListener('techStackLoaded', () => {
      const carousel = document.querySelector('.tech-carousel');
      if (carousel) {
        // Duplicate items for seamless loop
        const items = Array.from(carousel.children);
        items.forEach(item => {
          carousel.appendChild(item.cloneNode(true));
        });
      }
    });
  }

  disconnect(): void {
    // Nothing to clean up
  }
}
