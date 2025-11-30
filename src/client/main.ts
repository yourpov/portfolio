import PageAnimations from './animations';
import GameCarousel from './carousel';
import ConfigLoader from './config';
import DiscordStatus from './discord';
import GitHubProjects from './repos';
import WorkRequest from './request';
import TechCarousel from './techCarousel';

const uid = document.body.dataset.discordId || '';

const discord = new DiscordStatus(uid);
const repos = new GitHubProjects();
const anims = new PageAnimations();
const req = new WorkRequest();
const cfg = new ConfigLoader();
const carousel = new GameCarousel();
const techCarousel = new TechCarousel();

function createDynamicOrbs() {
  const container = document.querySelector('.orbs-container');
  if (!container) return;

  const gradients = [
    'radial-gradient(circle, rgba(255, 107, 107, 0.25) 0%, rgba(255, 107, 107, 0.08) 40%, transparent 100%)',
    'radial-gradient(circle, rgba(168, 85, 247, 0.22) 0%, rgba(168, 85, 247, 0.07) 40%, transparent 100%)',
    'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, rgba(236, 72, 153, 0.06) 40%, transparent 100%)',
    'radial-gradient(circle, rgba(139, 92, 246, 0.23) 0%, rgba(139, 92, 246, 0.08) 40%, transparent 100%)',
  ];

  const pageHeight = document.body.scrollHeight;
  const orbCount = Math.floor(pageHeight / 350);

  for (let i = 0; i < orbCount; i++) {
    const orb = document.createElement('div');
    orb.className = 'glow-orb';
    
    const size = 400 + Math.random() * 300;
    const section = (i / orbCount);
    const top = section * 100 + (Math.random() * 30 - 15);
    const left = Math.random() * 100;
    const gradient = gradients[Math.floor(Math.random() * gradients.length)]!;
    const duration = 8 + Math.random() * 7;
    const delay = Math.random() * 5;
    
    orb.style.width = `${size}px`;
    orb.style.height = `${size}px`;
    orb.style.top = `${top}%`;
    orb.style.left = `${left}%`;
    orb.style.background = gradient;
    orb.style.animationDuration = `${duration}s`;
    orb.style.animationDelay = `${delay}s`;
    orb.style.opacity = '1';
    
    container.appendChild(orb);
  }
}

function initScrollAnimations() {
  const opts = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, opts);

  document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right').forEach(el => {
    observer.observe(el);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  createDynamicOrbs();
  initScrollAnimations();
  await cfg.load();
  if (uid) discord.start();
  repos.load();
  anims.start();
  req.start();
  carousel.start();
  techCarousel.start();

  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      tabButtons.forEach(b => {
        b.classList.remove('active', 'text-white', 'bg-linear-to-r', 'from-accent', 'to-accent/80');
        b.classList.add('text-gray-400');
        b.setAttribute('aria-selected', 'false');
      });
      
      btn.classList.add('active', 'text-white', 'bg-linear-to-r', 'from-accent', 'to-accent/80');
      btn.classList.remove('text-gray-400');
      btn.setAttribute('aria-selected', 'true');
      
      tabContents.forEach(content => {
        if (content.id === `${targetTab}-tab`) {
          content.classList.remove('hidden');
        } else {
          content.classList.add('hidden');
        }
      });
    });
  });

  const cryptoAddresses = document.querySelectorAll('.crypto-address');
  cryptoAddresses.forEach(el => {
    el.addEventListener('click', async () => {
      const address = el.getAttribute('data-address');
      if (!address) return;
      
      try {
        await navigator.clipboard.writeText(address);
        const originalBorder = el.className;
        el.classList.remove('border-accent/10');
        el.classList.add('border-accent', 'scale-105');
        
        setTimeout(() => {
          el.className = originalBorder;
        }, 1000);
      } catch (err) {
      }
    });
  });

  const counters = document.querySelectorAll('[data-counter]');
  const cntOpts = {
    threshold: 0.5,
    rootMargin: '0px'
  };

  const cntObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target as HTMLElement;
        const val = parseInt(el.getAttribute('data-counter') || '0');
        let curr = 0;
        const inc = val / 48;
        const dur = 2000;
        const step = 42;

        const t = setInterval(() => {
          curr += inc;
          if (curr >= val) {
            el.textContent = val.toString();
            clearInterval(t);
          } else {
            el.textContent = Math.floor(curr).toString();
          }
        }, step);

        cntObs.unobserve(el);
      }
    });
  }, cntOpts);

  counters.forEach(counter => cntObs.observe(counter));

  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      if (targetId) {
        const target = document.querySelector(targetId);
        if (target) {
          const navHeight = 64;
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  const card = document.getElementById('discordCard');
  const glow = document.getElementById('cardGlow');
  if (card) {
    let rx = 0;
    let ry = 0;
    let s = 1;
    let tx = 0;
    let ty = 0;
    let ts = 1;
    let anim = false;
    let hover = false;
    let glowX = 50;
    let glowY = 50;
    
    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };
    
    const animate = () => {
      const f = hover ? 0.12 : 0.08;
      
      rx = lerp(rx, tx, f);
      ry = lerp(ry, ty, f);
      s = lerp(s, ts, f);
      
      const intensity = hover ? Math.abs(rx) + Math.abs(ry) : 0;
      const glowIntensity = Math.min(intensity / 15, 1);
      
      card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`;
      card.style.boxShadow = `0 ${10 + intensity}px ${30 + intensity * 2}px rgba(255, 107, 107, ${0.15 + glowIntensity * 0.2}), 0 0 ${40 + intensity}px rgba(255, 107, 107, ${0.1 + glowIntensity * 0.15})`;
      
      if (glow) {
        const glowLerpX = lerp(parseFloat(glow.style.backgroundPositionX || '50') || 50, glowX, 0.15);
        const glowLerpY = lerp(parseFloat(glow.style.backgroundPositionY || '50') || 50, glowY, 0.15);
        glow.style.background = `radial-gradient(circle at ${glowLerpX}% ${glowLerpY}%, rgba(255, 107, 107, ${hover ? 0.25 + glowIntensity * 0.1 : 0}), transparent 70%)`;
        glow.style.backgroundPositionX = `${glowLerpX}`;
        glow.style.backgroundPositionY = `${glowLerpY}`;
        glow.style.opacity = hover ? '1' : '0';
      }
      
      const threshold = 0.005;
      if (Math.abs(tx - rx) > threshold || 
          Math.abs(ty - ry) > threshold ||
          Math.abs(ts - s) > 0.001) {
        requestAnimationFrame(animate);
      } else {
        anim = false;
        if (!hover) {
          card.style.transform = 'none';
          card.style.boxShadow = '';
        }
      }
    };
    
    const start = () => {
      if (!anim) {
        anim = true;
        requestAnimationFrame(animate);
      }
    };
    
    card.addEventListener('mouseenter', () => {
      hover = true;
      ts = 1.08;
      start();
    });
    
    card.addEventListener('mousemove', (e: MouseEvent) => {
      if (!hover) return;
      
      const rect = card.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const percentX = (mouseX - centerX) / centerX;
      const percentY = (mouseY - centerY) / centerY;
      
      ty = percentX * 20;
      tx = -percentY * 20;
      
      glowX = (mouseX / rect.width) * 100;
      glowY = (mouseY / rect.height) * 100;
      
      start();
    });
    
    card.addEventListener('mouseleave', () => {
      hover = false;
      tx = 0;
      ty = 0;
      ts = 1;
      start();
    });
  }

  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  const scrollToTopBtn = document.getElementById('scrollToTop');
  if (scrollToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        scrollToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
        scrollToTopBtn.classList.add('opacity-100', 'pointer-events-auto');
      } else {
        scrollToTopBtn.classList.add('opacity-0', 'pointer-events-none');
        scrollToTopBtn.classList.remove('opacity-100', 'pointer-events-auto');
      }
    });

    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});

window.addEventListener('beforeunload', () => {
  discord.disconnect();
  repos.disconnect();
  anims.disconnect();
  carousel.disconnect();
  techCarousel.disconnect();
});
