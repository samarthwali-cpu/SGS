document.addEventListener('DOMContentLoaded', async () => {
  const components = [
    { id: 'header-mount', path: 'components/header/header', hasCss: true, hasJs: false },
    { id: 'nav-mount', path: 'components/nav/nav', hasCss: true, hasJs: true },
    { id: 'hero-mount', path: 'sections/hero/hero', hasCss: true, hasJs: false },
    { id: 'vision-mount', path: 'sections/vision/vision', hasCss: true, hasJs: false },
    { id: 'products-mount', path: 'sections/products/products', hasCss: true, hasJs: false },
    { id: 'roadmap-mount', path: 'sections/roadmap/roadmap', hasCss: true, hasJs: false },
    { id: 'about-mount', path: 'sections/about/about', hasCss: true, hasJs: false },
    { id: 'contact-mount', path: 'sections/contact/contact', hasCss: true, hasJs: true },
    { id: 'footer-mount', path: 'components/footer/footer', hasCss: true, hasJs: true }
  ];

  for (const comp of components) {
    try {
      // 1. Fetch HTML
      const response = await fetch(`${comp.path}.html`);
      if (response.ok) {
        const html = await response.text();
        const container = document.getElementById(comp.id);
        if (container) {
          container.innerHTML = html;
        }

        // 2. Load CSS
        if (comp.hasCss) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = `${comp.path}.css`;
          document.head.appendChild(link);
        }

        // 3. Load JS
        if (comp.hasJs) {
          const script = document.createElement('script');
          script.src = `${comp.path}.js`;
          script.defer = true;
          document.body.appendChild(script);
        }
      }
    } catch (e) {
      console.error(`Failed to load ${comp.path}`, e);
    }
  }

  // Handle legacy hashes mapping
  const hashMapping = {
    '#services': '#products',
    '#approach': '#vision'
  };

  const handleHash = () => {
    let hash = window.location.hash;
    if (hashMapping[hash]) {
      // Replace the hash without refreshing
      history.replaceState(null, null, hashMapping[hash]);
      hash = hashMapping[hash];
    }
    
    // Wait a brief moment for dynamic content to be in DOM, then scroll
    if (hash) {
      setTimeout(() => {
        const target = document.querySelector(hash);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  };

  handleHash();
  window.addEventListener('hashchange', handleHash);
});
