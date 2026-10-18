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

// Ana sayfa: kürenin kenarından rastgele saçılan ışıklar. Her parlama/zerre açılışta rastgele
// bir açı, süre ve başlangıç anı alır; her turu bitirdiğinde (o an görünmezken) yeni bir
// rastgele açıya geçer. JS yalnızca bu tur bitişlerinde çalışır, hareketi GPU yapar.
document.querySelectorAll('[data-rim-lights]').forEach((host) => {
  if (reducedMotion) return;
  const lights = [...host.children];
  // Aura dalgaları aynı yerden arka arkaya çıkmasın: 12 rastgele aday arasından son üç
  // dalganın yönüne en uzak olanı seçilir. Zerreler tamamen rastgele.
  const recentWaves = [];
  const gap = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
  const newAngle = (el) => {
    let angle = Math.random() * 360;
    if (el.classList.contains('rim-flare')) {
      let best = -1;
      for (let i = 0; i < 12; i += 1) {
        const candidate = Math.random() * 360;
        const nearest = recentWaves.length ? Math.min(...recentWaves.map((r) => gap(r, candidate))) : 360;
        if (nearest > best) { best = nearest; angle = candidate; }
      }
      recentWaves.push(angle);
      if (recentWaves.length > 3) recentWaves.shift();
    }
    el.style.setProperty('--a', `${Math.round(angle)}deg`);
  };
  const waves = lights.filter((el) => el.classList.contains('rim-flare'));
  lights.forEach((el) => {
    const flare = el.classList.contains('rim-flare');
    // Dalgalar sayfa kenarına kadar gider: yavaş ve seyrek olsun.
    const duration = flare ? 18 + Math.random() * 8 : 6 + Math.random() * 6;
    newAngle(el);
    el.style.setProperty('--t', `${duration.toFixed(1)}s`);
    if (!flare) el.style.setProperty('--out', (0.12 + Math.random() * 0.22).toFixed(2));
    // Dalgaların başlangıçları eşit aralıklı (üst üste binmesinler); zerreler rastgele.
    const offset = flare ? (waves.indexOf(el) / waves.length) * duration : Math.random() * duration;
    el.style.animationDelay = `${(-offset).toFixed(1)}s`;
    // Süre sabit kalır (değiştirmek animasyonu sıçratır); yalnızca açı yenilenir.
    el.addEventListener('animationiteration', () => newAngle(el));
  });
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

// Branş galerileri: yumuşak geçiş + yavaş yakınlaşma, ilerleme çizgisi, küçük resimler,
// oklar, klavye ve parmakla kaydırma (3B eğim: [data-tilt]).
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
