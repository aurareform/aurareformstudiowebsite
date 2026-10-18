const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

// SSS: aynı anda tek soru açık kalır (sayfa tek ekranda kalsın diye).
document.querySelectorAll('[data-accordion]').forEach((list) => {
  const items = [...list.querySelectorAll('.qa-item')];
  const setOpen = (item, open) => {
    item.classList.toggle('open', open);
    item.querySelector('.qa-question')?.setAttribute('aria-expanded', String(open));
  };
  items.forEach((item) => {
    item.querySelector('.qa-question')?.addEventListener('click', () => {
      const willOpen = !item.classList.contains('open');
      items.forEach((other) => setOpen(other, false));
      setOpen(item, willOpen);
    });
  });
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Sayfa geçişleri. Menü çubuğunun giriş animasyonu ziyaret başına bir kez oynar.
const pageRoot = document.documentElement;
try {
  if (sessionStorage.getItem('aura-visited')) pageRoot.classList.add('is-returning');
  sessionStorage.setItem('aura-visited', '1');
} catch (error) { /* gizli pencere vb.: animasyon her sayfada oynar */ }

// Tarayıcı sayfalar arası View Transitions'ı destekliyorsa geçişi CSS yapar;
// desteklemiyorsa (veya dosya doğrudan açıldıysa) içerik JS ile söner/belirir.
const nativePageTransitions = location.protocol !== 'file:'
  && ('CSSViewTransitionRule' in window || 'PageRevealEvent' in window);
if (!nativePageTransitions && !reducedMotion) {
  pageRoot.classList.add('no-vt');
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target && link.target !== '_self') return;
    const url = new URL(link.href, location.href);
    const samePage = url.pathname === location.pathname && url.search === location.search;
    if (url.origin !== location.origin || samePage || !/(\.html?|\/)$/.test(url.pathname)) return;
    event.preventDefault();
    pageRoot.classList.add('is-leaving');
    // Perde tamamen kapanınca git (CSS'teki veilIn süresi); yeni sayfa aynı perdeden açılır.
    window.setTimeout(() => { location.href = url.href; }, 340);
  });
  // Geri tuşuyla önbellekten dönülürse sayfa sönük kalmasın.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) pageRoot.classList.remove('is-leaving');
  });
}

// İmlece göre hafif 3B eğim ve ışık konumu (galeri çerçevesi, portre).
if (!reducedMotion) {
  document.querySelectorAll('[data-tilt]').forEach((el) => {
    el.addEventListener('pointermove', (event) => {
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      el.style.setProperty('--rx', `${((0.5 - y) * 6).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${((x - 0.5) * 8).toFixed(2)}deg`);
      el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });
}

// Fotoğraflar: sağ tık menüsü ("Resmi farklı kaydet") ve sürükleyip bırakarak kaydetme kapalı.
// Not: tarayıcıda gösterilen bir görselin kopyalanmasını tamamen engellemek mümkün değildir
// (ekran görüntüsü, geliştirici araçları); bu sadece sıradan kopyalama yollarını kapatır.
const photoSelector = 'img, .bg-frame, .bg-thumb, .about-frame, .sport-card';
document.addEventListener('contextmenu', (event) => {
  if (event.target.closest(photoSelector)) event.preventDefault();
});
document.addEventListener('dragstart', (event) => {
  if (event.target.closest('img')) event.preventDefault();
});

// Kenarlarda dalgalanan aura (kuzey ışığı) perdeleri, kenar hâlesi ve süzülen ışık zerreleri.
// V9 efekti; V11'de tüm hareketler yarı hızda (saat yarı hızda akar, zerreler yarı hızda yükselir).
document.querySelectorAll('[data-aura-waves]').forEach((canvas) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const host = canvas.parentElement;
  // data-aura-waves="lite": ana sayfa dışındaki sayfalar için daha soluk ve çok daha ucuz sürüm
  // (daha az perde, çekirdek ışık yok, seyrek satırlar, az zerre, ~20 kare/sn).
  const lite = canvas.dataset.auraWaves === 'lite';
  // Marka renkleri: mavi, camgöbeği, aura yeşili, limon yeşili.
  const palette = [[47, 135, 255], [49, 215, 255], [90, 236, 150], [149, 228, 31]];
  let width = 0;
  let height = 0;
  let step = 3;
  let curtains = [];
  let motes = [];
  let running = false;
  let frame;

  const rand = (min, max) => min + Math.random() * (max - min);

  // Ortası parlak, dört kenarı şeffaf yumuşak bir ışık çizgisi; her renk için bir kez çizilir.
  const makeSprite = ([r, g, b]) => {
    const sprite = document.createElement('canvas');
    sprite.width = 128;
    sprite.height = 16;
    const s = sprite.getContext('2d');
    const across = s.createLinearGradient(0, 0, 128, 0);
    across.addColorStop(0, `rgba(${r},${g},${b},0)`);
    across.addColorStop(0.5, `rgba(${r},${g},${b},1)`);
    across.addColorStop(1, `rgba(${r},${g},${b},0)`);
    s.fillStyle = across;
    s.fillRect(0, 0, 128, 16);
    const fade = s.createLinearGradient(0, 0, 0, 16);
    fade.addColorStop(0, 'rgba(0,0,0,0)');
    fade.addColorStop(0.5, 'rgba(0,0,0,1)');
    fade.addColorStop(1, 'rgba(0,0,0,0)');
    s.globalCompositeOperation = 'destination-in';
    s.fillStyle = fade;
    s.fillRect(0, 0, 128, 16);
    return sprite;
  };
  const sprites = palette.map(makeSprite);

  // Işık zerresi: beyaz çekirdek → renk → şeffaf. Her karede gradyan oluşturmak yerine bir kez çizilir.
  const makeMote = ([r, g, b]) => {
    const sprite = document.createElement('canvas');
    sprite.width = 32;
    sprite.height = 32;
    const s = sprite.getContext('2d');
    const dot = s.createRadialGradient(16, 16, 0, 16, 16, 16);
    dot.addColorStop(0, 'rgba(255,255,240,1)');
    dot.addColorStop(0.35, `rgba(${r},${g},${b},.6)`);
    dot.addColorStop(1, `rgba(${r},${g},${b},0)`);
    s.fillStyle = dot;
    s.fillRect(0, 0, 32, 32);
    return sprite;
  };
  const moteSprites = palette.map(makeMote);

  const build = () => {
    const narrow = width < 760;
    const reach = Math.min(Math.max(width * 0.11, 70), 190);
    const perSide = narrow || lite ? 2 : 3;
    step = lite ? 11 : narrow ? 9 : 7; // seyrek satırlar, her biri daha uzun ve yumuşak çizilir
    curtains = [];
    [-1, 1].forEach((side) => {
      for (let i = 0; i < perSide; i += 1) {
        const a = (i + (side > 0 ? 1 : 0)) % palette.length;
        curtains.push({
          side,
          base: reach * (0.32 + i * 0.3),
          amp: reach * rand(0.25, 0.42),
          size: reach * rand(0.9, 1.5),
          a,
          b: (a + 2) % palette.length,
          phase: rand(0, Math.PI * 2),
          speed: rand(0.18, 0.32),
          alpha: lite ? rand(0.2, 0.28) : rand(0.34, 0.48),
        });
      }
    });
    motes = Array.from({ length: Math.round(height / (lite ? 48 : narrow ? 30 : 20)) }, () => ({
      side: Math.random() < 0.5 ? -1 : 1,
      x: rand(0, reach * 1.6),
      y: rand(0, height),
      r: rand(1, 2.6),
      rise: rand(6, 16),
      twinkle: rand(0, Math.PI * 2),
      sprite: moteSprites[Math.floor(rand(0, moteSprites.length))],
    }));
  };

  const resize = () => {
    // Işık zaten yumuşak ve bulanık: yarım çözünürlükte çizip CSS ile büyütmek gözle fark edilmez,
    // ama boyanacak pikselleri dörtte birine indirir.
    const dpr = 0.5;
    const nextWidth = host.clientWidth;
    const nextHeight = host.clientHeight;
    if (nextWidth === width && nextHeight === height) return false;
    width = nextWidth;
    height = nextHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
    return true;
  };

  const draw = (time) => {
    const t = time / 1000;
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    // Kenarlardan içeri doğru sönen, nefes alan geniş hâle.
    const haze = Math.min(Math.max(width * 0.2, 120), 340);
    [-1, 1].forEach((side, i) => {
      const breathe = 0.05 + 0.025 * Math.sin(t * 0.5 + i * 2);
      const x0 = side < 0 ? 0 : width;
      const x1 = side < 0 ? haze : width - haze;
      const glow = ctx.createLinearGradient(x0, 0, x1, 0);
      glow.addColorStop(0, `rgba(49,215,255,${breathe})`);
      glow.addColorStop(0.5, `rgba(90,236,150,${breathe * 0.45})`);
      glow.addColorStop(1, 'rgba(47,135,255,0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = glow;
      ctx.fillRect(Math.min(x0, x1), 0, haze, height);
    });

    // Aura perdeleri: dalgalanan bir eksen boyunca üst üste binen yumuşak ışık çizgileri.
    const k = 1 / Math.max(height * 0.18, 120);
    curtains.forEach((c) => {
      for (let y = 0; y < height; y += step) {
        const wave = Math.sin(y * k + t * c.speed + c.phase)
          + 0.35 * Math.sin(y * k * 2.6 - t * c.speed * 1.7 + c.phase * 1.3);
        const center = c.base + c.amp * wave;
        const x = c.side < 0 ? center : width - center;
        // Yavaş parlaklık dalgaları + perde kıvrımları + ince titreşim.
        const glow = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(y * 0.009 + t * 0.6 + c.phase), 1.5);
        const fold = 0.55 + 0.45 * Math.sin(y * 0.045 - t * 1.3 + c.phase * 2);
        const shimmer = 0.7 + 0.3 * Math.sin(y * 0.22 + t * 3.2 + c.phase);
        const light = c.alpha * glow * fold * shimmer;
        if (light < 0.004) continue;
        const w = c.size * (0.55 + 0.45 * fold);
        const mix = 0.5 + 0.5 * Math.sin(y * 0.004 + t * 0.25 + c.phase);
        // Geniş yumuşak perde…
        ctx.globalAlpha = light * mix * 0.6;
        ctx.drawImage(sprites[c.a], x - w / 2, y - step * 1.5, w, step * 3);
        ctx.globalAlpha = light * (1 - mix) * 0.6;
        ctx.drawImage(sprites[c.b], x - w / 2, y - step * 1.5, w, step * 3);
        // …ve ortasında parlak, ince çekirdek ışık (hafif sürümde yok).
        if (lite) continue;
        const core = w * 0.22;
        ctx.globalAlpha = Math.min(light * 1.1, 1);
        ctx.drawImage(sprites[mix > 0.5 ? c.a : c.b], x - core / 2, y - step * 1.25, core, step * 2.5);
      }
    });

    // Yukarı süzülen yumuşak ışık zerreleri.
    motes.forEach((m) => {
      m.y -= (m.rise / 120) * (frameGap / 31);
      if (m.y < -10) m.y = height + 10;
      const x = m.side < 0 ? m.x : width - m.x;
      const size = m.r * 8;
      ctx.globalAlpha = 0.25 + 0.55 * Math.abs(Math.sin(t * 0.9 + m.twinkle));
      ctx.drawImage(m.sprite, x - size / 2, m.y - size / 2, size, size);
    });

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  };

  // Tek bir sürekli saat: durağan ilk kare ile hareketli kareler arasında sıçrama olmaz.
  const clock = () => (performance.now() + 8000) * 0.5;
  let started = false; // sayfanın giriş animasyonları rahatlayana kadar hareket başlamaz
  let onScreen = true;
  // Perdeler yavaş hareket eder: saniyede ~24 kare (hafif sürümde ~16) yeterli;
  // sayfanın geri kalanı tam hızda akar.
  const frameGap = lite ? 62 : 41;
  let lastDraw = 0;
  const loop = (now) => {
    if (now - lastDraw >= frameGap) {
      lastDraw = now;
      draw(clock());
    }
    if (running) frame = window.requestAnimationFrame(loop);
  };
  const play = () => {
    if (running || reducedMotion || !started || !onScreen || document.hidden) return;
    running = true;
    frame = window.requestAnimationFrame(loop);
  };
  const pause = () => {
    running = false;
    window.cancelAnimationFrame(frame);
  };

  resize();
  draw(clock());

  // Yazı tipi yüklenince ya da pencere değişince alan boyutu değişebilir. Kare başına en fazla
  // bir kez bakılır ve katman yalnızca boyut gerçekten değiştiyse yeniden kurulur.
  let refitQueued = false;
  const refit = () => {
    if (refitQueued) return;
    refitQueued = true;
    window.requestAnimationFrame(() => {
      refitQueued = false;
      if (resize() && !running) draw(clock());
    });
  };
  if ('ResizeObserver' in window) new ResizeObserver(refit).observe(host);
  else window.addEventListener('resize', refit);

  // Ekranda değilken çizimi durdur.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) play(); else pause();
    }).observe(host);
  }
  document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));

  // İlk açılışta tarayıcı yazı tiplerini, görselleri ve giriş animasyonlarını işlerken
  // ışık hareketini bekletmek takılmayı önler.
  window.setTimeout(() => { started = true; play(); }, 700);
});

// Sayaçlar: görününce 0'dan hedef değere yumuşak artış.
const countUp = (el) => {
  const target = Number(el.dataset.count);
  const startTime = performance.now();
  const tick = (now) => {
    const progress = Math.min((now - startTime) / 1600, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
    if (progress < 1) window.requestAnimationFrame(tick);
  };
  window.requestAnimationFrame(tick);
};

// Branş sayfalarındaki tek görsel penceresi: görseller bu pencere içinde kayar.
document.querySelectorAll('[data-image-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('.image-carousel-track');
  const slides = [...carousel.querySelectorAll('.image-slide')];
  const dots = [...carousel.querySelectorAll('.carousel-dots span')];
  const prev = carousel.querySelector('.carousel-prev');
  const next = carousel.querySelector('.carousel-next');
  if (!track || slides.length < 2) return;

  let index = 0;
  let timer;

  const show = (newIndex) => {
    index = (newIndex + slides.length) % slides.length;
    track.style.transform = `translate3d(-${index * 100}%,0,0)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  };

  const stop = () => window.clearInterval(timer);
  const start = () => {
    stop();
    if (!reducedMotion) timer = window.setInterval(() => show(index + 1), 4200);
  };

  prev?.addEventListener('click', () => { show(index - 1); start(); });
  next?.addEventListener('click', () => { show(index + 1); start(); });
  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  carousel.addEventListener('focusin', stop);
  carousel.addEventListener('focusout', start);

  let startX = null;
  carousel.addEventListener('pointerdown', (event) => { startX = event.clientX; });
  carousel.addEventListener('pointerup', (event) => {
    if (startX === null) return;
    const diff = event.clientX - startX;
    if (Math.abs(diff) > 45) show(index + (diff < 0 ? 1 : -1));
    startX = null;
    start();
  });

  show(0);
  start();
});

// Danışan yorumları: üçlü görünüm masaüstünde, yatay kayan kartlar.
document.querySelectorAll('[data-reviews-carousel]').forEach((carousel) => {
  const viewport = carousel.querySelector('.reviews-viewport');
  const prev = carousel.querySelector('.reviews-prev');
  const next = carousel.querySelector('.reviews-next');
  if (!viewport) return;

  const step = () => Math.max(280, viewport.clientWidth * 0.88);
  const atEnd = () => viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 8;
  const moveNext = () => {
    if (atEnd()) viewport.scrollTo({ left: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    else viewport.scrollBy({ left: step(), behavior: reducedMotion ? 'auto' : 'smooth' });
  };
  const movePrev = () => {
    if (viewport.scrollLeft <= 8) viewport.scrollTo({ left: viewport.scrollWidth, behavior: reducedMotion ? 'auto' : 'smooth' });
    else viewport.scrollBy({ left: -step(), behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  prev?.addEventListener('click', movePrev);
  next?.addEventListener('click', moveNext);

  let timer;
  const stop = () => window.clearInterval(timer);
  const start = () => {
    stop();
    if (!reducedMotion) timer = window.setInterval(moveNext, 5200);
  };
  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  carousel.addEventListener('focusin', stop);
  carousel.addEventListener('focusout', start);
  start();
});

// Hafif giriş animasyonları. JS kapalıysa içerik normal görünür.
const revealTargets = document.querySelectorAll('.reveal, .feature, .program-list li, .review-card, .contact-card');
if (!reducedMotion && 'IntersectionObserver' in window) {
  revealTargets.forEach((el) => el.classList.add('reveal-ready'));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  revealTargets.forEach((el) => observer.observe(el));
}


// Branş galerilerinde çok hafif ışık takibi.
document.querySelectorAll('.sport-gallery').forEach((gallery) => {
  if (reducedMotion) return;
  gallery.addEventListener('pointermove', (event) => {
    const rect = gallery.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    gallery.style.setProperty('--mx', `${x.toFixed(1)}%`);
    gallery.style.setProperty('--my', `${y.toFixed(1)}%`);
  });
  gallery.addEventListener('pointerleave', () => {
    gallery.style.setProperty('--mx', '48%');
    gallery.style.setProperty('--my', '28%');
  });
});

// Branş videoları sayfayı bozmadan modal pencerede açılır.
document.querySelectorAll('[data-video-open]').forEach((button) => {
  const key = button.getAttribute('data-video-open');
  const modal = document.querySelector(`[data-video-modal="${key}"]`);
  if (!modal) return;
  const close = modal.querySelector('.video-modal-close');
  const video = modal.querySelector('video');

  button.addEventListener('click', () => {
    if (typeof modal.showModal === 'function') modal.showModal();
    else modal.setAttribute('open', '');
  });

  const closeModal = () => {
    video?.pause();
    if (typeof modal.close === 'function') modal.close();
    else modal.removeAttribute('open');
  };

  close?.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });
});

/* =========================================================
   V9 — ANİMASYONLU ANA SAYFA
   ========================================================= */

// Ana sayfa videosu henüz eklenmediyse boş video katmanını gizle
// (yoksa "screen" karışımı her karede boşuna hesaplanır).
document.querySelectorAll('.hero-video').forEach((video) => {
  const hide = () => { video.hidden = true; };
  video.querySelector('source')?.addEventListener('error', hide);
  video.addEventListener('error', hide);
  if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) hide();
});

// Başlıktaki kelimeleri tek tek ortaya çıkarmak için böl.
const splitWords = (root) => {
  let index = 0;
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = child.textContent.split(/(\s+)/);
        const fragment = document.createDocumentFragment();
        parts.forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { fragment.append(part); return; }
          const word = document.createElement('span');
          word.className = 'word';
          word.style.setProperty('--i', index);
          index += 1;
          word.textContent = part;
          fragment.append(word);
        });
        child.replaceWith(fragment);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  };
  walk(root);
};

// Giriş animasyonları (sıra ve gecikme CSS'teki --d ile). JS kapalıysa içerik normal görünür.
const animTargets = document.querySelectorAll('[data-anim]');
if (!reducedMotion && 'IntersectionObserver' in window) {
  animTargets.forEach((el) => {
    if (el.dataset.anim === 'words') splitWords(el);
    el.classList.add('anim-ready');
  });
  // İlk ekranda görünenler HTML'deki --d sırasıyla gelir; aşağı kaydırınca
  // görünenler beklemeden, aynı anda girenler kısa arayla gelir.
  let firstBatch = true;
  const animObserver = new IntersectionObserver((entries) => {
    entries.filter((entry) => entry.isIntersecting).forEach((entry, i) => {
      if (!firstBatch) entry.target.style.setProperty('--d', `${(i * 0.12).toFixed(2)}s`);
      entry.target.classList.add('in-view');
      entry.target.querySelectorAll('[data-count]').forEach(countUp);
      animObserver.unobserve(entry.target);
    });
    firstBatch = false;
  }, { threshold: 0.2, rootMargin: '0px 0px -6% 0px' });
  animTargets.forEach((el) => animObserver.observe(el));
}

// İmleci takip eden yumuşak ışık (hero ve branş kartları).
if (!reducedMotion) {
  document.querySelectorAll('[data-spotlight]').forEach((el) => {
    el.addEventListener('pointermove', (event) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${((event.clientX - rect.left) / rect.width * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${((event.clientY - rect.top) / rect.height * 100).toFixed(1)}%`);
    });
  });
}

// Branş galerileri: yumuşak geçiş + yavaş yakınlaşma, ilerleme çizgisiyle otomatik geçiş,
// klavye ve parmakla kaydırma (V11: oklar ve küçük resimler kaldırıldı; kod yoksa atlar).
document.querySelectorAll('[data-branch-gallery]').forEach((gallery) => {
  const slides = [...gallery.querySelectorAll('.bg-slide')];
  const thumbs = [...gallery.querySelectorAll('.bg-thumb')];
  const strip = gallery.querySelector('.bg-thumbs');
  const frame = gallery.querySelector('.bg-frame');
  const counter = gallery.querySelector('[data-current]');
  const bar = gallery.querySelector('.bg-progress i');
  if (slides.length < 2) return;

  let index = 0;

  // İlerleme çizgisi dolunca sonraki fotoğrafa geçilir; üzerine gelince CSS çizgiyi
  // (dolayısıyla geçişi de) duraklatır.
  const runBar = () => {
    if (!bar || reducedMotion) return;
    bar.classList.remove('is-running');
    void bar.offsetWidth; // animasyonu baştan başlat
    bar.classList.add('is-running');
  };

  const show = (next) => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle('is-active', i === index);
      if (i === index) thumb.setAttribute('aria-current', 'true');
      else thumb.removeAttribute('aria-current');
    });
    // Sayfayı değil, yalnızca küçük resim şeridini kaydır.
    const thumb = thumbs[index];
    if (strip && thumb) {
      strip.scrollTo({
        left: thumb.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2,
        behavior: reducedMotion ? 'auto' : 'smooth',
      });
    }
    if (counter) counter.textContent = String(index + 1).padStart(2, '0');
    runBar();
  };

  bar?.addEventListener('animationend', () => show(index + 1));
  gallery.querySelector('[data-prev]')?.addEventListener('click', () => show(index - 1));
  gallery.querySelector('[data-next]')?.addEventListener('click', () => show(index + 1));
  thumbs.forEach((thumb, i) => thumb.addEventListener('click', () => show(i)));
  gallery.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(index - 1);
    if (event.key === 'ArrowRight') show(index + 1);
  });

  let startX = null;
  frame?.addEventListener('pointerdown', (event) => { startX = event.clientX; });
  frame?.addEventListener('pointerup', (event) => {
    if (startX === null) return;
    const diff = event.clientX - startX;
    if (Math.abs(diff) > 45) show(index + (diff < 0 ? 1 : -1));
    startX = null;
  });

  runBar();
});
