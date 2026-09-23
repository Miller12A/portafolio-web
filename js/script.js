(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------
     THEME SYSTEM — light/dark toggle + Minecraft/Roblox easter eggs
  --------------------------------------------- */
  const root = document.documentElement;
  const THEME_KEY = 'mj-theme';
  const themeToggle = document.getElementById('themeToggle');

  let baseTheme = localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
  let funMode = null; // 'minecraft' | 'roblox' | null — overrides baseTheme while active

  function applyTheme() {
    root.setAttribute('data-theme', funMode || baseTheme);
    if (themeToggle) {
      themeToggle.classList.toggle('is-disabled', !!funMode);
      themeToggle.setAttribute('aria-disabled', funMode ? 'true' : 'false');
    }
  }
  applyTheme();

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      if (funMode) return;
      baseTheme = baseTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, baseTheme);
      applyTheme();
    });
  }

  let easterToast;
  function showEasterToast(html) {
    if (!easterToast) {
      easterToast = document.createElement('div');
      easterToast.className = 'easter-toast';
      document.body.appendChild(easterToast);
    }
    easterToast.innerHTML = html;
    easterToast.classList.remove('show');
    void easterToast.offsetWidth;
    easterToast.classList.add('show');
    clearTimeout(showEasterToast._t);
    showEasterToast._t = setTimeout(() => easterToast.classList.remove('show'), 4200);
  }

  const FUN_MODES = {
    minecraft: { emoji: '⛏️', es: '¡Modo Minecraft activado!', en: 'Minecraft mode activated!' },
    roblox: { emoji: '🧱', es: '¡Modo Roblox activado!', en: 'Roblox mode activated!' },
    amongus: { emoji: '🔪', es: '¡Modo Among Us activado!', en: 'Among Us mode activated!' },
    fortnite: { emoji: '🪂', es: '¡Modo Fortnite activado!', en: 'Fortnite mode activated!' }
  };

  let typedBuffer = '';
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
    const activeTag = document.activeElement ? document.activeElement.tagName : '';
    if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

    typedBuffer = (typedBuffer + e.key.toLowerCase()).slice(-20);

    const isEn = typeof currentLang !== 'undefined' && currentLang === 'en';
    const matched = Object.keys(FUN_MODES).find(word => typedBuffer.endsWith(word));

    if (matched) {
      funMode = matched;
      applyTheme();
      const m = FUN_MODES[matched];
      const line = isEn
        ? `${m.emoji} <strong>${m.en}</strong><br>Type «normal» to go back.`
        : `${m.emoji} <strong>${m.es}</strong><br>Escribe «normal» para volver.`;
      showEasterToast(line);
      typedBuffer = '';
    } else if (typedBuffer.endsWith('normal')) {
      if (funMode) {
        funMode = null;
        applyTheme();
        showEasterToast(isEn ? '✨ Normal mode restored.' : '✨ Modo normal restaurado.');
      }
      typedBuffer = '';
    }
  });

  /* ---------------------------------------------
     LOADER
  --------------------------------------------- */
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => loader.classList.add('hidden'), 500);
  });

  /* ---------------------------------------------
     YEAR
  --------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------
     HEADER SCROLL STATE + PROGRESS BAR
  --------------------------------------------- */
  const header = document.getElementById('header');
  const progressBar = document.getElementById('scrollProgress');

  function onScroll() {
    const scrollY = window.scrollY;
    header.classList.toggle('scrolled', scrollY > 10);

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------
     MOBILE NAV
  --------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* ---------------------------------------------
     ACTIVE NAV LINK ON SCROLL
  --------------------------------------------- */
  const sections = document.querySelectorAll('main section[id]');
  const navItems = document.querySelectorAll('.nav-link');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navItems.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(sec => navObserver.observe(sec));

  /* ---------------------------------------------
     SCROLL REVEAL
  --------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in-view'), i * 60 % 300);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------------------------------------------
     STAT COUNTERS
  --------------------------------------------- */
  const counters = document.querySelectorAll('.stat-number');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10) || 0;
      if (prefersReducedMotion) {
        el.textContent = target;
      } else {
        const duration = 1400;
        const start = performance.now();
        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));

  /* ---------------------------------------------
     TYPED TEXT (hero role)
  --------------------------------------------- */
  const typedEl = document.getElementById('typed');
  const PHRASES = {
    es: [
      'Desarrollador Full Stack',
      'Especialista en Angular & Node.js',
      'Arquitecto de Microservicios',
      'Integrador de sistemas empresariales'
    ],
    en: [
      'Full Stack Developer',
      'Angular & Node.js Specialist',
      'Microservices Architect',
      'Enterprise Systems Integrator'
    ]
  };
  let currentLang = localStorage.getItem('mj-lang') === 'en' ? 'en' : 'es';
  let typeGen = 0;

  function startTyping() {
    if (!typedEl) return;
    typeGen++;
    const myGen = typeGen;
    const phrases = PHRASES[currentLang] || PHRASES.es;

    if (prefersReducedMotion) {
      typedEl.textContent = phrases[0];
      return;
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function typeLoop() {
      if (myGen !== typeGen) return; // a language switch superseded this run
      const current = phrases[phraseIndex];
      if (!deleting) {
        charIndex++;
        typedEl.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(typeLoop, 1800);
          return;
        }
        setTimeout(typeLoop, 55);
      } else {
        charIndex--;
        typedEl.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(typeLoop, 300);
          return;
        }
        setTimeout(typeLoop, 28);
      }
    }
    typeLoop();
  }
  startTyping();

  /* ---------------------------------------------
     LANGUAGE SYSTEM (ES / EN)
  --------------------------------------------- */
  const I18N = {
    es: {
      'nav.home': 'Inicio', 'nav.about': 'Sobre mí', 'nav.experience': 'Experiencia',
      'nav.projects': 'Proyectos', 'nav.contact': 'Contacto', 'nav.cv': 'CV',

      'hero.eyebrow': 'Disponible para nuevos proyectos',
      'hero.title': 'Hola, soy <span class="gradient-text">Miller Mora</span>',
      'hero.desc': 'Desarrollador Full Stack especializado en <strong>Angular</strong>, <strong>Node.js</strong> y arquitecturas de <strong>microservicios</strong>. Construyo soluciones empresariales escalables, integraciones robustas y experiencias de usuario que combinan rendimiento con diseño.',
      'hero.cta.experience': 'Ver experiencia',
      'btn.print': 'Imprimir CV', 'btn.download': 'Descargar CV',
      'btn.downloadPdf': 'Descargar CV (PDF)', 'btn.downloadWord': 'Descargar CV (Word)',

      'about.tag': '01 · Sobre mí', 'about.title': 'Perfil profesional',
      'about.text': 'Desarrollador Full Stack con experiencia en el diseño, desarrollo e implementación de soluciones empresariales escalables basadas en <strong class="hl">arquitecturas de microservicios y microfrontends</strong>. Especializado en tecnologías <strong class="hl">JavaScript/TypeScript, Angular y Node.js</strong>, con ecosistemas orientados a alta disponibilidad y rendimiento.<br><br>He participado en proyectos estratégicos para entidades gubernamentales, aseguradoras y corporaciones privadas en Ecuador, liderando iniciativas de desarrollo frontend y backend, integraciones empresariales, sincronización de plataformas, automatización de procesos y modernización de sistemas legacy.<br><br>Cuento con experiencia en <strong class="hl">liderazgo técnico</strong>, revisión de código (Pull Requests), definición de estándares de desarrollo, optimización de rendimiento con Redis, integración basada en eventos con Kafka y despliegue de servicios contenerizados mediante Docker, todo bajo metodologías ágiles (Scrum).',
      'about.stat1': 'Proyectos empresariales', 'about.stat2': 'Sistemas integrados en una sola sincronización',
      'about.stat3': 'Tecnologías dominadas', 'about.stat4': 'Proyectos liderados técnicamente',
      'about.edu.title': 'Tecnólogo Superior en Desarrollo de Software', 'about.edu.school': 'Instituto Superior Tecnológico Guayaquil',

      'skills.tag': '02 · Habilidades', 'skills.title': 'Stack tecnológico',
      'skills.sub': 'Tecnologías y herramientas que utilizo para construir productos escalables, de principio a fin.',
      'skills.cat.db': 'Bases de datos', 'skills.cat.arch': 'Arquitectura & DevOps',
      'skills.cat.ai': 'Inteligencia Artificial', 'skills.cat.quality': 'Metodologías & Calidad',
      'skills.carousel': 'Todas las tecnologías con las que trabajo — pasa el cursor sobre un ícono',

      'exp.tag': '03 · Trayectoria', 'exp.title': 'Experiencia profesional',
      'exp.sub': 'Todo mi recorrido ha sido en <strong class="hl">Viamatica</strong>, participando en múltiples proyectos estratégicos para distintos clientes.',

      'exp1.date': 'Agosto 2025 — Actualidad', 'exp1.role': 'Desarrollador Full Stack',
      'exp1.li1': 'Soluciones empresariales para el sector asegurador con microservicios y microfrontends.',
      'exp1.li2': 'Frontend con Angular, Tailwind CSS y arquitectura modular desacoplada.',
      'exp1.li3': 'APIs y servicios backend con Node.js, TypeScript, C# y .NET.',
      'exp1.li4': 'Flujos asincrónicos con Kafka para sincronizar usuarios y eventos entre plataformas.',
      'exp1.li5': 'Automatización de creación de usuarios entre ~7 sistemas desde una única transacción.',
      'exp1.li6': 'SSO, cacheo con Redis y documentación de APIs con Swagger/OpenAPI.',

      'exp2.date': 'Junio 2025 — Agosto 2025', 'exp2.role': 'Desarrollador Full Stack',
      'exp2.li1': 'Proyecto internacional con empresa intermediaria de Costa Rica para modernización corporativa.',
      'exp2.li2': 'Migración de formularios de Oracle Forms hacia Angular y Node.js.',
      'exp2.li3': 'Renderizado dinámico de formularios con Webix y estructuras configurables en MongoDB.',
      'exp2.li4': 'Lógica dinámica para construir formularios en tiempo de ejecución.',

      'exp3.date': 'Enero 2025 — Junio 2025', 'exp3.role': 'Líder de Desarrollo Frontend',
      'exp3.li1': 'Liderazgo técnico del equipo frontend desde la etapa inicial del proyecto.',
      'exp3.li2': 'Definición de arquitectura frontend, estándares y estructura escalable.',
      'exp3.li3': 'Módulos para gestión de usuarios, solicitudes de proveedores y control de visitantes.',
      'exp3.li4': 'Asignación de tareas, revisión de Pull Requests y seguimiento del equipo.',

      'exp4.date': 'Noviembre 2024 — Enero 2025', 'exp4.role': 'Desarrollador Full Stack',
      'exp4.li1': 'Sistema POS para gestión de ventas, inventario y facturación.',
      'exp4.li2': 'Aplicación móvil multiplataforma con React Native.',
      'exp4.li3': 'APIs backend con Node.js y TypeScript, datos en PostgreSQL.',
      'exp4.li4': 'Redis para manejo de sesiones y optimización de rendimiento.',

      'exp5.date': 'Septiembre 2024 — Noviembre 2024', 'exp5.role': 'Líder de Proyecto / Desarrollador Full Stack',
      'exp5.li1': 'Liderazgo técnico y funcional, coordinando al equipo bajo metodología Scrum.',
      'exp5.li2': 'Sistema administrativo integrado con Active Directory (AD).',
      'exp5.li3': 'Microfrontends con Angular y backend con Node.js y PostgreSQL.',
      'exp5.li4': 'Revisión de Pull Requests y control de calidad de código.',

      'exp6.date': 'Mayo 2024 — Septiembre 2024', 'exp6.role': 'Desarrollador Full Stack',
      'exp6.li1': 'CMS empresarial desde cero para gestión dinámica de contenidos.',
      'exp6.li2': 'Frontend con Angular, Angular Material y Tailwind CSS.',
      'exp6.li3': 'Microservicios en Node.js, con MongoDB y PostgreSQL.',
      'exp6.li4': 'Estructuras matriciales para administración dinámica de contenidos, con SonarQube.',

      'proj.tag': '04 · Proyectos destacados', 'proj.title': 'Soluciones empresariales',
      'proj.sub': 'Sistemas reales desarrollados para clientes corporativos y gubernamentales de Ecuador, todos construidos en Viamatica. Las ilustraciones son representaciones propias del tipo de solución <strong class="hl">(no capturas reales)</strong>, ya que se trata de software empresarial privado.',

      'p1.badge': 'Sector asegurador · Confidencial', 'p1.title': 'Plataforma de integración — ASUR (Aseguradora del Sur)',
      'p1.desc': 'Suite de soluciones empresariales para el sector asegurador, orientada a sincronizar identidades y datos entre múltiples plataformas internas en tiempo real.',
      'p1.li1': 'Automaticé la creación y sincronización de usuarios entre ~7 sistemas empresariales desde una única transacción.',
      'p1.li2': 'Implementé SSO y sincronización centralizada de credenciales entre plataformas.',
      'p1.li3': 'Diseñé flujos asincrónicos con Kafka (producers/consumers) para eventos entre sistemas.',
      'p1.li4': 'Usé Redis para cacheo y documenté las APIs con Swagger/OpenAPI.',

      'p2.badge': 'Sector gubernamental · Confidencial', 'p2.title': 'CMS empresarial — VUI (Ventanilla Única de Inversiones)',
      'p2.desc': 'Gestor de contenidos construido desde cero para modernizar la gestión de información de la Ventanilla Única de Inversiones de Ecuador.',
      'p2.li1': 'Arquitectura de microservicios en Node.js con frontend en Angular, Angular Material y Tailwind CSS.',
      'p2.li2': 'Persistencia híbrida en MongoDB y PostgreSQL para datos estructurados y no estructurados.',
      'p2.li3': 'Lógica de estructuras matriciales para administrar contenidos dinámicos en tiempo real.',
      'p2.li4': 'Redis para consultas frecuentes y calidad de código validada con SonarQube.',

      'p3.badge': 'Retail / Consumo masivo · Confidencial', 'p3.title': 'Sistema POS — Sellout / Labra',
      'p3.desc': 'Plataforma de punto de venta con app móvil complementaria para gestionar ventas, inventario y facturación en tiempo real.',
      'p3.li1': 'Construí la app móvil multiplataforma en React Native para el equipo comercial en campo.',
      'p3.li2': 'Desarrollé las APIs backend con Node.js y TypeScript, con datos modelados en PostgreSQL.',
      'p3.li3': 'Implementé Redis para manejo de sesiones y optimización de rendimiento.',
      'p3.li4': 'Integré inventario, facturación y control de ventas en un flujo en tiempo real.',

      'p4.badge': 'Sector público · Confidencial', 'p4.title': 'Portal administrativo — PCG (Prefectura Ciudadana del Guayas)',
      'p4.desc': 'Sistema administrativo integrado con Active Directory para la gestión interna de la Prefectura del Guayas.',
      'p4.li1': 'Lideré técnica y funcionalmente el proyecto, coordinando al equipo bajo Scrum.',
      'p4.li2': 'Integré autenticación y gestión de usuarios con Active Directory (AD).',
      'p4.li3': 'Desarrollé microfrontends en Angular para modularizar y escalar la aplicación.',
      'p4.li4': 'Construí el backend con Node.js y PostgreSQL, revisando Pull Requests del equipo.',

      'p5.badge': 'Telecomunicaciones · Proyecto internacional', 'p5.title': 'Modernización de formularios — Claro',
      'p5.desc': 'Proyecto conjunto con una empresa intermediaria de Costa Rica para modernizar formularios corporativos legacy.',
      'p5.li1': 'Migré formularios de Oracle Forms hacia Angular y Node.js.',
      'p5.li2': 'Implementé renderizado dinámico de formularios con Webix y estructuras configurables en MongoDB.',
      'p5.li3': 'Desarrollé lógica para construir formularios en tiempo de ejecución mediante identificadores parametrizados.',
      'p5.li4': 'Optimicé el flujo de carga y renderización de componentes dinámicos.',

      'p6.badge': 'Industria acuícola · Confidencial', 'p6.title': 'Portal de proveedores — Promarisco',
      'p6.desc': 'Portal empresarial para la gestión de usuarios, solicitudes de proveedores y control de visitantes.',
      'p6.li1': 'Lideré el equipo de desarrollo frontend desde la etapa inicial del proyecto.',
      'p6.li2': 'Definí la arquitectura frontend, estándares de desarrollo y estructura escalable.',
      'p6.li3': 'Construí módulos de gestión de usuarios, proveedores y control de visitantes.',
      'p6.li4': 'Apliqué Angular Material y Tailwind CSS con enfoque responsive y reusable.',

      'contact.tag': '05 · Contacto', 'contact.title': 'Hablemos de tu próximo proyecto',
      'contact.sub': 'Estoy abierto a nuevas oportunidades y colaboraciones. Escríbeme por cualquiera de estos medios.',
      'contact.phone': 'Teléfono', 'contact.location': 'Ubicación',
      'contact.cv.title': '¿Prefieres revisar mi CV completo?', 'contact.cv.sub': 'Descárgalo o imprímelo en un clic.',

      'footer.text': 'Diseñado y construido con HTML, CSS &amp; JavaScript.'
    },
    en: {
      'nav.home': 'Home', 'nav.about': 'About', 'nav.experience': 'Experience',
      'nav.projects': 'Projects', 'nav.contact': 'Contact', 'nav.cv': 'Resume',

      'hero.eyebrow': 'Available for new projects',
      'hero.title': 'Hi, I\'m <span class="gradient-text">Miller Mora</span>',
      'hero.desc': 'Full Stack Developer specialized in <strong>Angular</strong>, <strong>Node.js</strong> and <strong>microservices</strong> architectures. I build scalable enterprise solutions, robust integrations, and user experiences that blend performance with design.',
      'hero.cta.experience': 'View experience',
      'btn.print': 'Print Resume', 'btn.download': 'Download Resume',
      'btn.downloadPdf': 'Download Resume (PDF)', 'btn.downloadWord': 'Download Resume (Word)',

      'about.tag': '01 · About Me', 'about.title': 'Professional Profile',
      'about.text': 'Full Stack Developer with experience designing, building, and shipping scalable enterprise solutions based on <strong class="hl">microservices and microfrontend architectures</strong>. Specialized in <strong class="hl">JavaScript/TypeScript, Angular, and Node.js</strong>, with ecosystems built for high availability and performance.<br><br>I have worked on strategic projects for government agencies, insurers, and private corporations in Ecuador, leading frontend and backend development initiatives, enterprise integrations, platform synchronization, process automation, and legacy system modernization.<br><br>I bring experience in <strong class="hl">technical leadership</strong>, code review (Pull Requests), development standards, performance optimization with Redis, event-driven integration with Kafka, and containerized deployments with Docker, all under agile methodologies (Scrum).',
      'about.stat1': 'Enterprise projects', 'about.stat2': 'Systems integrated in a single sync',
      'about.stat3': 'Technologies mastered', 'about.stat4': 'Projects led technically',
      'about.edu.title': 'Higher Technologist in Software Development', 'about.edu.school': 'Instituto Superior Tecnológico Guayaquil',

      'skills.tag': '02 · Skills', 'skills.title': 'Tech Stack',
      'skills.sub': 'Technologies and tools I use to build scalable products, end to end.',
      'skills.cat.db': 'Databases', 'skills.cat.arch': 'Architecture & DevOps',
      'skills.cat.ai': 'Artificial Intelligence', 'skills.cat.quality': 'Methodologies & Quality',
      'skills.carousel': 'All the technologies I work with — hover over an icon',

      'exp.tag': '03 · Career Path', 'exp.title': 'Professional Experience',
      'exp.sub': 'My entire career has been at <strong class="hl">Viamatica</strong>, working on multiple strategic projects for different clients.',

      'exp1.date': 'August 2025 — Present', 'exp1.role': 'Full Stack Developer',
      'exp1.li1': 'Enterprise solutions for the insurance sector built with microservices and microfrontends.',
      'exp1.li2': 'Frontend built with Angular, Tailwind CSS, and a decoupled modular architecture.',
      'exp1.li3': 'APIs and backend services with Node.js, TypeScript, C#, and .NET.',
      'exp1.li4': 'Asynchronous Kafka flows to sync users and events across platforms.',
      'exp1.li5': 'Automated user provisioning across ~7 systems from a single transaction.',
      'exp1.li6': 'SSO, Redis caching, and API documentation with Swagger/OpenAPI.',

      'exp2.date': 'June 2025 — August 2025', 'exp2.role': 'Full Stack Developer',
      'exp2.li1': 'International project with a Costa Rican intermediary company for corporate modernization.',
      'exp2.li2': 'Migrated legacy Oracle Forms to Angular and Node.js.',
      'exp2.li3': 'Dynamic form rendering with Webix and configurable structures in MongoDB.',
      'exp2.li4': 'Dynamic logic to build forms at runtime.',

      'exp3.date': 'January 2025 — June 2025', 'exp3.role': 'Frontend Development Lead',
      'exp3.li1': 'Led the frontend team technically from the project\'s kickoff.',
      'exp3.li2': 'Defined frontend architecture, standards, and scalable structure.',
      'exp3.li3': 'Modules for user management, supplier requests, and visitor control.',
      'exp3.li4': 'Task assignment, Pull Request review, and team follow-up.',

      'exp4.date': 'November 2024 — January 2025', 'exp4.role': 'Full Stack Developer',
      'exp4.li1': 'POS system for sales, inventory, and billing management.',
      'exp4.li2': 'Cross-platform mobile app built with React Native.',
      'exp4.li3': 'Backend APIs with Node.js and TypeScript, data in PostgreSQL.',
      'exp4.li4': 'Redis for session handling and performance optimization.',

      'exp5.date': 'September 2024 — November 2024', 'exp5.role': 'Project Lead / Full Stack Developer',
      'exp5.li1': 'Technical and functional leadership, coordinating the team under Scrum.',
      'exp5.li2': 'Administrative system integrated with Active Directory (AD).',
      'exp5.li3': 'Microfrontends with Angular and backend with Node.js and PostgreSQL.',
      'exp5.li4': 'Pull Request review and code quality control.',

      'exp6.date': 'May 2024 — September 2024', 'exp6.role': 'Full Stack Developer',
      'exp6.li1': 'Enterprise CMS built from scratch for dynamic content management.',
      'exp6.li2': 'Frontend with Angular, Angular Material, and Tailwind CSS.',
      'exp6.li3': 'Node.js microservices with MongoDB and PostgreSQL.',
      'exp6.li4': 'Matrix-based structures for dynamic content management, with SonarQube.',

      'proj.tag': '04 · Featured Projects', 'proj.title': 'Enterprise Solutions',
      'proj.sub': 'Real systems built for corporate and government clients in Ecuador, all developed at Viamatica. The illustrations are my own representations of each solution <strong class="hl">(not real screenshots)</strong>, since this is private enterprise software.',

      'p1.badge': 'Insurance sector · Confidential', 'p1.title': 'Integration Platform — ASUR (Aseguradora del Sur)',
      'p1.desc': 'Suite of enterprise solutions for the insurance sector, focused on syncing identities and data across multiple internal platforms in real time.',
      'p1.li1': 'Automated user creation and sync across ~7 enterprise systems from a single transaction.',
      'p1.li2': 'Implemented SSO and centralized credential sync across platforms.',
      'p1.li3': 'Designed asynchronous Kafka flows (producers/consumers) for cross-system events.',
      'p1.li4': 'Used Redis for caching and documented APIs with Swagger/OpenAPI.',

      'p2.badge': 'Government sector · Confidential', 'p2.title': 'Enterprise CMS — VUI (Ventanilla Única de Inversiones)',
      'p2.desc': 'Content management system built from scratch to modernize information management for Ecuador\'s Ventanilla Única de Inversiones.',
      'p2.li1': 'Node.js microservices architecture with an Angular, Angular Material, and Tailwind CSS frontend.',
      'p2.li2': 'Hybrid persistence in MongoDB and PostgreSQL for structured and unstructured data.',
      'p2.li3': 'Matrix-structure logic to manage dynamic content in real time.',
      'p2.li4': 'Redis for frequent queries and code quality validated with SonarQube.',

      'p3.badge': 'Retail / CPG · Confidential', 'p3.title': 'POS System — Sellout / Labra',
      'p3.desc': 'Point-of-sale platform with a companion mobile app to manage sales, inventory, and billing in real time.',
      'p3.li1': 'Built the cross-platform mobile app in React Native for the field sales team.',
      'p3.li2': 'Developed backend APIs with Node.js and TypeScript, with data modeled in PostgreSQL.',
      'p3.li3': 'Implemented Redis for session handling and performance optimization.',
      'p3.li4': 'Integrated inventory, billing, and sales control into a real-time flow.',

      'p4.badge': 'Public sector · Confidential', 'p4.title': 'Administrative Portal — PCG (Prefectura Ciudadana del Guayas)',
      'p4.desc': 'Administrative system integrated with Active Directory for the Prefectura del Guayas\' internal management.',
      'p4.li1': 'Led the project technically and functionally, coordinating the team under Scrum.',
      'p4.li2': 'Integrated authentication and user management with Active Directory (AD).',
      'p4.li3': 'Built Angular microfrontends to modularize and scale the application.',
      'p4.li4': 'Built the backend with Node.js and PostgreSQL, reviewing the team\'s Pull Requests.',

      'p5.badge': 'Telecommunications · International project', 'p5.title': 'Forms Modernization — Claro',
      'p5.desc': 'Joint project with a Costa Rican intermediary company to modernize legacy corporate forms.',
      'p5.li1': 'Migrated Oracle Forms to Angular and Node.js.',
      'p5.li2': 'Implemented dynamic form rendering with Webix and configurable structures in MongoDB.',
      'p5.li3': 'Built logic to construct forms at runtime using parameterized identifiers.',
      'p5.li4': 'Optimized the loading and rendering flow for dynamic components.',

      'p6.badge': 'Aquaculture industry · Confidential', 'p6.title': 'Supplier Portal — Promarisco',
      'p6.desc': 'Enterprise portal for user management, supplier requests, and visitor control.',
      'p6.li1': 'Led the frontend development team from the project\'s early stage.',
      'p6.li2': 'Defined the frontend architecture, development standards, and scalable structure.',
      'p6.li3': 'Built modules for user management, suppliers, and visitor control.',
      'p6.li4': 'Applied Angular Material and Tailwind CSS with a responsive, reusable approach.',

      'contact.tag': '05 · Contact', 'contact.title': 'Let\'s talk about your next project',
      'contact.sub': 'I\'m open to new opportunities and collaborations. Reach out through any of these channels.',
      'contact.phone': 'Phone', 'contact.location': 'Location',
      'contact.cv.title': 'Prefer to review my full resume?', 'contact.cv.sub': 'Download or print it in one click.',

      'footer.text': 'Designed and built with HTML, CSS &amp; JavaScript.'
    }
  };

  function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const val = I18N[lang][el.getAttribute('data-i18n')];
      if (val !== undefined) el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const val = I18N[lang][el.getAttribute('data-i18n-html')];
      if (val !== undefined) el.innerHTML = val;
    });
    const langLabel = document.querySelector('[data-lang-label]');
    if (langLabel) langLabel.textContent = lang.toUpperCase();
    startTyping();
  }

  applyLanguage(currentLang);

  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const next = currentLang === 'es' ? 'en' : 'es';
      localStorage.setItem('mj-lang', next);
      applyLanguage(next);
    });
  }

  /* ---------------------------------------------
     CURSOR GLOW
  --------------------------------------------- */
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    }, { passive: true });
  }

  /* ---------------------------------------------
     COSMOS CANVAS — black hole / gravity well (hero background)
  --------------------------------------------- */
  const COSMOS_PALETTES = {
    dark: { c1: [34, 211, 238], c2: [220, 253, 255], star: [200, 235, 255], blocky: false },
    light: { c1: [59, 130, 246], c2: [15, 30, 65], star: [50, 75, 110], blocky: false },
    minecraft: { c1: [106, 168, 79], c2: [235, 235, 170], star: [210, 205, 150], blocky: true },
    roblox: { c1: [226, 35, 26], c2: [35, 8, 6], star: [90, 90, 98], blocky: false },
    amongus: { c1: [90, 60, 160], c2: [230, 225, 255], star: [180, 170, 220], blocky: false },
    fortnite: { c1: [123, 58, 190], c2: [255, 230, 150], star: [210, 190, 230], blocky: false }
  };

  // Clickable-target tiers for the "pick it / hit it every 5 clicks" easter eggs.
  const TIERS = {
    minecraft: [
      { name: { es: 'Tierra', en: 'Dirt' }, base: '#7b5330', speck: '#5c3d22' },
      { name: { es: 'Piedra', en: 'Stone' }, base: '#8a8a8a', speck: '#6e6e6e' },
      { name: { es: 'Mena de Carbón', en: 'Coal Ore' }, base: '#8f8f8f', speck: '#1c1c1c' },
      { name: { es: 'Mena de Hierro', en: 'Iron Ore' }, base: '#ab9784', speck: '#e4d9c8' },
      { name: { es: 'Mena de Diamante', en: 'Diamond Ore' }, base: '#8a8a8a', speck: '#4fd8e8' }
    ],
    roblox: [
      { name: { es: 'Robux de Bronce', en: 'Bronze Robux' }, base: '#b08d57' },
      { name: { es: 'Robux de Plata', en: 'Silver Robux' }, base: '#c7c9cc' },
      { name: { es: 'Robux de Oro', en: 'Gold Robux' }, base: '#ffd54a' },
      { name: { es: 'Robux de Platino', en: 'Platinum Robux' }, base: '#dff1ff' },
      { name: { es: 'Robux Arcoíris', en: 'Rainbow Robux' }, base: 'rainbow' }
    ],
    amongus: [
      { name: { es: 'Rojo', en: 'Red' }, base: '#c51111' },
      { name: { es: 'Azul', en: 'Blue' }, base: '#132ed1' },
      { name: { es: 'Verde', en: 'Green' }, base: '#117f2d' },
      { name: { es: 'Amarillo', en: 'Yellow' }, base: '#f6f657' },
      { name: { es: 'Rosado', en: 'Pink' }, base: '#ed54ba' },
      { name: { es: 'Cian', en: 'Cyan' }, base: '#44fff2' },
      { name: { es: 'Morado', en: 'Purple' }, base: '#6b2fbb' },
      { name: { es: 'Naranja', en: 'Orange' }, base: '#ef7d0d' },
      { name: { es: 'Negro', en: 'Black' }, base: '#3f474e' },
      { name: { es: 'Blanco', en: 'White' }, base: '#d6e0f0' }
    ],
    fortnite: [
      { name: { es: 'Piñata Común', en: 'Common Llama' }, base: '#b0b0b0' },
      { name: { es: 'Piñata Poco Común', en: 'Uncommon Llama' }, base: '#1eff00' },
      { name: { es: 'Piñata Rara', en: 'Rare Llama' }, base: '#0090ff' },
      { name: { es: 'Piñata Épica', en: 'Epic Llama' }, base: '#b14bf4' },
      { name: { es: 'Piñata Legendaria', en: 'Legendary Llama' }, base: '#ff8c1a' }
    ]
  };

  function shadeColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    let r = (num >> 16) + percent;
    let g = ((num >> 8) & 0x00ff) + percent;
    let b = (num & 0x0000ff) + percent;
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return `rgb(${r}, ${g}, ${b})`;
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  const canvas = document.getElementById('cosmos');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const hero = canvas.closest('.hero');
    let width, height, dpr;
    let center = { x: 0, y: 0 };
    let horizonRadius = 30;
    let wellOuter = 260;
    let maxLift = 340;
    const squash = 0.4; // flattens circular orbits into a tilted, funnel-like well
    const STRANDS = 3;
    const STRAND_STEPS = 34;
    let stars = [];
    let motes = [];
    let bursts = [];
    let animationId;
    let startTime = null;
    let hasDragged = false;
    let palette = COSMOS_PALETTES.dark;
    let activeTheme = 'dark';
    let progress = { hits: 0, tier: 0 };

    const orb = { radius: 0, angle: 0, dragging: false, px: 0, py: 0, size: 9, fx: 0, fy: 0 };

    function targetSize() {
      if (!TIERS[activeTheme]) return orb.size;
      return Math.max(36, Math.min(58, Math.min(width, height) * 0.12));
    }

    function grabRadius() {
      return targetSize() + 16;
    }

    function langKey() {
      return (typeof currentLang !== 'undefined' && currentLang === 'en') ? 'en' : 'es';
    }

    function tierMessage(theme, label) {
      const en = langKey() === 'en';
      switch (theme) {
        case 'minecraft': return en ? `⛏️ Now mining: <strong>${label}</strong>!` : `⛏️ ¡Ahora picas <strong>${label}</strong>!`;
        case 'roblox': return en ? `💎 Unlocked: <strong>${label}</strong>!` : `💎 ¡Desbloqueaste <strong>${label}</strong>!`;
        case 'amongus': return en ? `👨‍🚀 New color: <strong>${label}</strong>!` : `👨‍🚀 ¡Nuevo color: <strong>${label}</strong>!`;
        case 'fortnite': return en ? `🦙 Llama smashed: <strong>${label}</strong>!` : `🦙 ¡Piñata reventada: <strong>${label}</strong>!`;
        default: return label;
      }
    }

    function spawnBurst(x, y, big) {
      const count = big ? 22 : 10;
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const speed = (big ? 2.4 : 1.4) + Math.random() * (big ? 2.2 : 1.2);
        bursts.push({
          x, y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          life: 1,
          decay: 0.02 + Math.random() * 0.02,
          size: (big ? 3 : 2) + Math.random() * 2,
          color: palette.c2
        });
      }
    }

    let shakeStart = -Infinity;
    let shakeDuration = 0;
    let shakeMag = 0;

    function triggerShake(big) {
      shakeStart = performance.now();
      shakeDuration = big ? 480 : 220;
      shakeMag = big ? 20 : 9;
    }

    function currentShakeOffset(time) {
      const t = (time - shakeStart) / shakeDuration;
      if (t < 0 || t > 1) return { x: 0, y: 0 };
      const decay = 1 - t;
      return {
        x: (Math.random() - 0.5) * shakeMag * decay,
        y: (Math.random() - 0.5) * shakeMag * decay
      };
    }

    function registerHit() {
      const tiers = TIERS[activeTheme];
      if (!tiers) return;
      progress.hits++;
      spawnBurst(orb.px, orb.py, false);
      triggerShake(false);
      if (progress.hits % 5 === 0) {
        progress.tier = (progress.tier + 1) % tiers.length;
        spawnBurst(orb.px, orb.py, true);
        triggerShake(true);
        const label = tiers[progress.tier].name[langKey()];
        showEasterToast(tierMessage(activeTheme, label));
      }
    }

    function drawBursts() {
      bursts = bursts.filter(p => p.life > 0);
      bursts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.94; p.vy *= 0.94;
        p.life -= p.decay;
        drawDot(p.x, p.y, p.size, `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${Math.max(0, p.life)})`);
      });
    }

    function drawProgressPips(cx, cy, size, hitsInTier) {
      const n = 5;
      const totalW = (n - 1) * 8;
      for (let i = 0; i < n; i++) {
        const px = cx - totalW / 2 + i * 8;
        const py = cy + size + 14;
        ctx.beginPath();
        ctx.arc(px, py, 2.4, 0, Math.PI * 2);
        if (i < hitsInTier) {
          ctx.fillStyle = rgbaStr(palette.c2, 0.95);
          ctx.fill();
        } else {
          ctx.strokeStyle = rgbaStr(palette.c2, 0.35);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    function drawMinecraftBlock(cx, cy, size, tier, hitsInTier) {
      ctx.save();
      ctx.fillStyle = tier.base;
      ctx.fillRect(cx - size, cy - size, size * 2, size * 2);
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - size, cy - size, size * 2, size * 2);
      ctx.fillStyle = tier.speck;
      const specks = [[-0.5, -0.4], [0.35, -0.25], [-0.2, 0.35], [0.45, 0.3], [0, 0.05]];
      specks.forEach(([ox, oy]) => {
        const s = size * 0.3;
        ctx.fillRect(cx + ox * size - s / 2, cy + oy * size - s / 2, s, s);
      });
      if (hitsInTier > 0) {
        ctx.strokeStyle = 'rgba(10,10,10,0.6)';
        ctx.lineWidth = 1.3;
        for (let i = 0; i < hitsInTier; i++) {
          const off = -size * 0.7 + i * (size * 0.4);
          ctx.beginPath();
          ctx.moveTo(cx + off, cy - size * 0.8);
          ctx.lineTo(cx + off + size * 0.3, cy + size * 0.8);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    function drawRobuxCoin(cx, cy, size, tier, time) {
      const color = tier.base === 'rainbow' ? `hsl(${(time * 0.06) % 360}, 85%, 60%)` : tier.base;
      ctx.save();
      ctx.translate(cx, cy);
      // coin body
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = size * 0.06;
      ctx.stroke();
      // inner rim
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.78, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = size * 0.05;
      ctx.stroke();
      // Robux gem mark in the center
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.42); ctx.lineTo(size * 0.32, 0); ctx.lineTo(0, size * 0.42); ctx.lineTo(-size * 0.32, 0);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // shine highlight
      ctx.beginPath();
      ctx.ellipse(-size * 0.32, -size * 0.32, size * 0.22, size * 0.12, -0.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fill();
      ctx.restore();
    }

    function drawCrewmate(cx, cy, size, tier) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.fillStyle = shadeColor(tier.base, -40);
      roundRectPath(ctx, -size * 0.55, -size * 0.1, size * 0.32, size * 0.6, size * 0.14);
      ctx.fill();
      ctx.fillStyle = tier.base;
      roundRectPath(ctx, -size * 0.5, -size * 0.75, size, size * 1.5, size * 0.5);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#bfe9ff';
      roundRectPath(ctx, -size * 0.05, -size * 0.55, size * 0.65, size * 0.35, size * 0.17);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      roundRectPath(ctx, size * 0.08, -size * 0.5, size * 0.2, size * 0.12, size * 0.06);
      ctx.fill();
      ctx.restore();
    }

    function drawLlama(cx, cy, size, tier) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.fillStyle = tier.base;
      ctx.beginPath(); ctx.ellipse(0, size * 0.15, size * 0.65, size * 0.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(size * 0.45, -size * 0.35, size * 0.28, size * 0.4, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(size * 0.55, -size * 0.7); ctx.lineTo(size * 0.4, -size * 0.92); ctx.lineTo(size * 0.65, -size * 0.8);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(size * 0.72, -size * 0.65); ctx.lineTo(size * 0.62, -size * 0.9); ctx.lineTo(size * 0.85, -size * 0.75);
      ctx.closePath(); ctx.fill();
      ctx.fillRect(-size * 0.45, size * 0.45, size * 0.15, size * 0.35);
      ctx.fillRect(size * 0.15, size * 0.45, size * 0.15, size * 0.35);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath(); ctx.arc(-size * 0.15, size * 0.05, size * 0.12, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(size * 0.1, size * 0.3, size * 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    function drawThemeTarget(theme, cx, cy, size, time) {
      const tiers = TIERS[theme];
      const tier = tiers[progress.tier % tiers.length];
      const hitsInTier = progress.hits % 5;
      ctx.save();
      ctx.shadowColor = rgbaStr(palette.c2, 0.7);
      ctx.shadowBlur = orb.dragging ? 22 : 12;
      if (theme === 'minecraft') drawMinecraftBlock(cx, cy, size, tier, hitsInTier);
      else if (theme === 'roblox') drawRobuxCoin(cx, cy, size, tier, time);
      else if (theme === 'amongus') drawCrewmate(cx, cy, size, tier);
      else if (theme === 'fortnite') drawLlama(cx, cy, size, tier);
      ctx.restore();
      drawProgressPips(cx, cy, size, hitsInTier);
    }

    function currentPalette() {
      const theme = document.documentElement.getAttribute('data-theme') || 'dark';
      return COSMOS_PALETTES[theme] || COSMOS_PALETTES.dark;
    }

    function rgbaStr(c, a) {
      return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;
    }

    function lerpColor(t) {
      // outer accent -> inner "hot" accent, deep in the well
      const c1 = palette.c1;
      const c2 = palette.c2;
      return [
        Math.round(c1[0] + (c2[0] - c1[0]) * t),
        Math.round(c1[1] + (c2[1] - c1[1]) * t),
        Math.round(c1[2] + (c2[2] - c1[2]) * t)
      ];
    }

    function posFor(radius, angle) {
      return {
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius * squash
      };
    }

    function makeStar() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.1 + 0.3,
        baseAlpha: Math.random() * 0.5 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2
      };
    }

    function makeMote(atOuterEdge) {
      return {
        angle: Math.random() * Math.PI * 2,
        radius: atOuterEdge ? wellOuter : horizonRadius + Math.random() * (wellOuter - horizonRadius),
        size: Math.random() * 1.5 + 0.5
      };
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = hero.offsetWidth;
      height = hero.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const isWide = width > 900;
      center = {
        x: width * (isWide ? 0.74 : 0.5),
        y: height * (isWide ? 0.46 : 0.66)
      };
      const scale = Math.min(width, height);
      horizonRadius = Math.max(16, Math.min(34, scale * 0.035));
      wellOuter = Math.min(scale * 0.46, 320);
      maxLift = wellOuter * 1.35;

      const starCount = Math.min(180, Math.floor((width * height) / 9000));
      stars = Array.from({ length: starCount }, makeStar);

      const moteCount = Math.min(130, Math.floor((width * height) / 4800));
      motes = Array.from({ length: moteCount }, () => makeMote(Math.random() > 0.3));

      if (orb.radius === 0) {
        orb.radius = wellOuter * 0.62;
        orb.angle = -Math.PI / 3;
        orb.fx = center.x;
        orb.fy = center.y;
      }
    }

    function drawFunnel(time) {
      const rotation = time * 0.00018;
      for (let s = 0; s < STRANDS; s++) {
        const baseAngle = (s / STRANDS) * Math.PI * 2;
        let prev = null;
        for (let step = 0; step <= STRAND_STEPS; step++) {
          const t = step / STRAND_STEPS;
          const r = horizonRadius + (wellOuter - horizonRadius) * (1 - t) ** 1.4;
          const ang = baseAngle + rotation * (1 + t) + t * Math.PI * 2.4;
          const pt = posFor(r, ang);
          if (prev) {
            const [cr, cg, cb] = lerpColor(t);
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(pt.x, pt.y);
            ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${0.08 + t * 0.4})`;
            ctx.lineWidth = 1 + t * 1.4;
            ctx.stroke();
          }
          prev = pt;
        }
      }
    }

    function drawDot(x, y, r, fillStyle) {
      ctx.fillStyle = fillStyle;
      if (palette.blocky) {
        const s = r * 1.9;
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      } else {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function renderFrame(time) {
      if (startTime === null) startTime = time;
      const elapsed = time - startTime;
      palette = currentPalette();
      const theme = document.documentElement.getAttribute('data-theme') || 'dark';
      const isFun = !!TIERS[theme];
      if (theme !== activeTheme) {
        activeTheme = theme;
        progress = { hits: 0, tier: 0 };
        bursts = [];
        if (isFun) { orb.fx = center.x; orb.fy = center.y; }
      }
      ctx.imageSmoothingEnabled = !palette.blocky;
      ctx.clearRect(0, 0, width, height);

      // twinkling starfield (kept in every mode, it's ambient — not part of the "well")
      stars.forEach(s => {
        const a = s.baseAlpha + Math.sin(time * s.twinkleSpeed + s.phase) * 0.25;
        drawDot(s.x, s.y, s.r, rgbaStr(palette.star, Math.max(0, a)));
      });

      if (isFun) {
        // no spinning gravity well in the fun modes — just the collectible, resting near the center
        if (!orb.dragging) {
          orb.fx += (center.x - orb.fx) * 0.05;
          orb.fy += (center.y - orb.fy) * 0.05;
        }
        orb.px = orb.fx;
        orb.py = orb.fy + Math.sin(time * 0.0018) * 5;
      } else {
        // spinning gravity-well funnel (spirals endlessly toward the center)
        drawFunnel(time);

        // glowing core at the bottom of the well
        const pulse = 1 + Math.sin(time * 0.0025) * 0.08;
        const core = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, horizonRadius * 2.4 * pulse);
        core.addColorStop(0, rgbaStr(palette.c2, 0.95));
        core.addColorStop(0.4, rgbaStr(palette.c1, 0.55));
        core.addColorStop(1, rgbaStr(palette.c1, 0));
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(center.x, center.y, horizonRadius * 2.4 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // drifting dust caught in the well
        const behind = [];
        const front = [];
        motes.forEach(m => {
          const t = 1 - (m.radius - horizonRadius) / (wellOuter - horizonRadius);
          const clampedT = Math.min(Math.max(t, 0), 1);
          const angularSpeed = 0.003 + clampedT * clampedT * 0.045;
          const fallSpeed = 0.1 + clampedT * 1.1;

          m.angle += angularSpeed;
          m.radius -= fallSpeed;
          if (m.radius <= horizonRadius) {
            m.radius = wellOuter * (0.7 + Math.random() * 0.3);
            m.angle = Math.random() * Math.PI * 2;
          }

          const p = posFor(m.radius, m.angle);
          const [r, g, b] = lerpColor(clampedT);
          const alpha = 0.2 + clampedT * 0.6;
          const entry = { px: p.x, py: p.y, r, g, b, alpha, size: m.size * (0.6 + clampedT * 0.7) };
          (p.y < center.y ? behind : front).push(entry);
        });

        const drawMote = (e) => {
          drawDot(e.px, e.py, e.size, `rgba(${e.r}, ${e.g}, ${e.b}, ${e.alpha})`);
        };
        behind.forEach(drawMote);
        front.forEach(drawMote);

        // the draggable orb: pick it up, and gravity pulls it back down in a spiral
        if (!orb.dragging) {
          const t = 1 - (orb.radius - horizonRadius) / (maxLift - horizonRadius);
          const clampedT = Math.min(Math.max(t, 0), 1);
          const angularSpeed = 0.006 + clampedT * clampedT * 0.035;
          const fallSpeed = 0.12 + clampedT * 0.9;
          orb.angle += angularSpeed;
          orb.radius -= fallSpeed;
          if (orb.radius <= horizonRadius) {
            orb.radius = maxLift * (0.75 + Math.random() * 0.2);
            orb.angle = Math.random() * Math.PI * 2;
          }
        }
        const op = posFor(orb.radius, orb.angle);
        orb.px = op.x;
        orb.py = op.y;
      }

      // one-time "drag me" hint ring, fades once discovered or after a few seconds
      if (!hasDragged && elapsed < 5000) {
        const hintAlpha = 0.5 * (1 - elapsed / 5000) * (0.6 + Math.sin(time * 0.005) * 0.4);
        ctx.beginPath();
        ctx.arc(orb.px, orb.py, targetSize() + 10, 0, Math.PI * 2);
        ctx.strokeStyle = rgbaStr(palette.c2, Math.max(0, hintAlpha));
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      if (isFun) {
        const shake = currentShakeOffset(time);
        drawThemeTarget(activeTheme, orb.px + shake.x, orb.py + shake.y, targetSize(), time);
      } else {
        ctx.save();
        ctx.shadowColor = rgbaStr(palette.c2, 0.95);
        ctx.shadowBlur = orb.dragging ? 26 : 16;
        drawDot(orb.px, orb.py, orb.size, rgbaStr(palette.c2, 1));
        ctx.restore();
      }

      drawBursts();

      if (!prefersReducedMotion) {
        animationId = requestAnimationFrame(renderFrame);
      }
    }

    function pointerPos(e) {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function distToOrb(pos) {
      return Math.hypot(pos.x - orb.px, pos.y - orb.py);
    }

    let pressStart = null;

    canvas.style.touchAction = 'none';

    canvas.addEventListener('pointermove', (e) => {
      const pos = pointerPos(e);
      if (orb.dragging) {
        if (TIERS[activeTheme]) {
          const s = targetSize();
          orb.fx = Math.min(Math.max(pos.x, s), width - s);
          orb.fy = Math.min(Math.max(pos.y, s), height - s);
        } else {
          const dx = pos.x - center.x;
          const dy = (pos.y - center.y) / squash;
          orb.angle = Math.atan2(dy, dx);
          orb.radius = Math.min(Math.max(Math.hypot(dx, dy), horizonRadius * 1.3), maxLift);
        }
      } else {
        canvas.style.cursor = distToOrb(pos) < grabRadius() ? 'grab' : 'default';
      }
    });

    canvas.addEventListener('pointerdown', (e) => {
      const pos = pointerPos(e);
      if (distToOrb(pos) < grabRadius()) {
        orb.dragging = true;
        hasDragged = true;
        pressStart = { x: pos.x, y: pos.y, time: performance.now() };
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = 'grabbing';
        e.preventDefault();
      }
    });

    function releaseOrb(e) {
      if (orb.dragging) {
        orb.dragging = false;
        if (pressStart) {
          const pos = pointerPos(e);
          const dt = performance.now() - pressStart.time;
          const dist = Math.hypot(pos.x - pressStart.x, pos.y - pressStart.y);
          if (dt < 400 && dist < 8) registerHit();
        }
        pressStart = null;
        canvas.style.cursor = 'default';
        try { canvas.releasePointerCapture(e.pointerId); } catch (err) { /* no-op */ }
      }
    }
    canvas.addEventListener('pointerup', releaseOrb);
    canvas.addEventListener('pointercancel', releaseOrb);

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else if (!prefersReducedMotion) {
        animationId = requestAnimationFrame(renderFrame);
      }
    });

    resize();
    if (prefersReducedMotion) {
      renderFrame(0);
    } else {
      animationId = requestAnimationFrame(renderFrame);
    }
  }

  /* ---------------------------------------------
     TECH CAROUSEL
  --------------------------------------------- */
  const TECH_ROWS = [
    [
      { slug: 'html5', name: 'HTML5', color: '#E34F26' },
      { slug: 'css3', name: 'CSS3', color: '#1572B6' },
      { slug: 'javascript', name: 'JavaScript', color: '#F7DF1E' },
      { slug: 'typescript', name: 'TypeScript', color: '#3178C6' },
      { slug: 'angular', name: 'Angular', color: '#DD0031' },
      { slug: 'tailwindcss', name: 'Tailwind CSS', color: '#06B6D4' },
      { slug: 'react', name: 'React Native', color: '#61DAFB' },
      { slug: 'nodedotjs', name: 'Node.js', color: '#339933' }
    ],
    [
      { slug: 'dotnet', name: '.NET', color: '#512BD4' },
      { slug: 'postgresql', name: 'PostgreSQL', color: '#4169E1' },
      { slug: 'mongodb', name: 'MongoDB', color: '#47A248' },
      { slug: 'oracle', name: 'Oracle', color: '#F80000' },
      { slug: 'docker', name: 'Docker', color: '#2496ED' },
      { slug: 'redis', name: 'Redis', color: '#DC382D' },
      { slug: 'git', name: 'Git', color: '#F05032' }
    ],
    [
      { slug: 'apachekafka', name: 'Kafka', color: '#A9B4BC' },
      { slug: 'sonarqube', name: 'SonarQube', color: '#4E9BD5' },
      { slug: 'swagger', name: 'Swagger', color: '#85EA2D' },
      { slug: 'claude', name: 'Claude', color: '#D97757' },
      { slug: 'openai', name: 'ChatGPT', color: '#EAEAEA' },
      { slug: 'googlegemini', name: 'Gemini', color: '#4796E3' },
      { slug: 'terminal-generic', name: 'OpenCode', color: '#22D3EE' }
    ]
  ];

  TECH_ROWS.forEach((row, i) => {
    const track = document.querySelector(`#techRow${i + 1} .tech-track`);
    if (!track) return;
    const tilesHtml = row.map(t => {
      const iconUrl = `assets/icons/${t.slug}.svg`;
      return `
        <div class="tech-tile" title="${t.name}">
          <span class="tech-icon" style="--brand:${t.color}; mask-image:url('${iconUrl}'); -webkit-mask-image:url('${iconUrl}');"></span>
          <span class="tech-tile-label">${t.name}</span>
        </div>`;
    }).join('');
    // duplicated once so the marquee can loop seamlessly at -50%
    track.innerHTML = tilesHtml + tilesHtml;
  });

  /* ---------------------------------------------
     PRINT / DOWNLOAD CV
  --------------------------------------------- */
  const CV_PATH = 'assets/cv/CV_Miller_Mora_ATS_Harvard.pdf';
  const printFrame = document.getElementById('printFrame');

  function printCv() {
    if (!printFrame) {
      window.open(CV_PATH, '_blank');
      return;
    }
    printFrame.onload = () => {
      try {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
      } catch (err) {
        window.open(CV_PATH, '_blank');
      }
    };
    printFrame.src = CV_PATH;
  }

  ['btnPrintCv', 'btnPrintCv2'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', printCv);
  });

})();
