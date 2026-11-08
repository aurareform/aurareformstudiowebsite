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

// Ana sayfa: kadın ve erkek figürlerindeki aura. Hareketi CSS yapar; burada yalnızca her tur
// bittiğinde yeni rastgele süre/gecikme ve zerre yolu seçilir (her karede çalışan JS yok).
// Böylece aşağı/yukarı dolaşan ışık, salınım ve saçılan zerreler hiç aynı ritimde tekrarlamaz.
document.querySelectorAll('.home-figure').forEach((figure) => {
  if (reducedMotion) return;
  const rand = (min, max) => min + Math.random() * (max - min);
  // Animasyonu baştan oynat (tüm tarayıcılarda çalışan yol).
  const restart = (el) => {
    el.style.animationName = 'none';
    void el.offsetWidth;
    el.style.animationName = '';
  };

  // Işık bantları ve salınım: her tur farklı süre ve kısa, rastgele bir ara.
  figure.querySelectorAll('[data-aura-rand]').forEach((el) => {
    const [min, max] = el.dataset.auraRand.split(',').map(Number);
    // isteğe bağlı tur arası bekleme (ışık geçişleri art arda gelmesin)
    const [gapMin, gapMax] = (el.dataset.auraGap || '0,0.6').split(',').map(Number);
    const pick = (first) => {
      const duration = rand(min, max);
      el.style.animationDuration = `${duration.toFixed(2)}s`;
      // ilk turda sayfa açılır açılmaz farklı yerlerden başlasınlar
      el.style.animationDelay = `${(first ? -rand(0, duration) : rand(gapMin, gapMax)).toFixed(2)}s`;
    };
    pick(true);
    // yalnızca kendi animasyonu bitince (içteki öğelerden kabarcıklanan olaylar sayılmaz)
    el.addEventListener('animationend', (event) => { if (event.target !== el) return; pick(false); restart(el); });
  });

  // Zerreler: baştan ayağa vücudun kenarından doğar, dışarı (ve biraz yukarı) savrulur.
  const colours = ['140,210,255', '90,160,255', '110,240,170', '200,240,255'];
  figure.querySelectorAll('.aura-motes b').forEach((mote) => {
    const pick = (first) => {
      const y = rand(3, 96);                                   // baştan ayağa
      const half = y < 12 ? 11 : y < 58 ? 30 : 18;              // baş, gövde+kollar, bacaklar
      const side = Math.random() < 0.5 ? -1 : 1;
      const x = 50 + side * rand(half * 0.55, half + 6);
      const time = rand(2.6, 5.4);
      mote.style.setProperty('--x', `${x.toFixed(1)}%`);
      mote.style.setProperty('--y', `${y.toFixed(1)}%`);
      mote.style.setProperty('--dx', `${(side * rand(1.2, 3.6)).toFixed(2)}vw`);
      mote.style.setProperty('--dy', `${(-rand(0.4, 4.5)).toFixed(2)}vh`);
      mote.style.setProperty('--s', `${rand(3, 8).toFixed(1)}px`);
      mote.style.setProperty('--c', colours[Math.floor(Math.random() * colours.length)]);
      mote.style.animationDuration = `${time.toFixed(2)}s`;
      mote.style.animationDelay = `${(first ? -rand(0, time) : rand(0, 1.4)).toFixed(2)}s`;
    };
    pick(true);
    mote.addEventListener('animationend', (event) => { if (event.target !== mote) return; pick(false); restart(mote); });
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

// Branş galerileri: yumuşak geçişli (solma) otomatik geçiş,
// klavye ve parmakla kaydırma (V11: oklar ve küçük resimler kaldırıldı; kod yoksa atlar).
document.querySelectorAll('[data-branch-gallery]').forEach((gallery) => {
  const slides = [...gallery.querySelectorAll('.bg-slide')];
  const thumbs = [...gallery.querySelectorAll('.bg-thumb')];
  const strip = gallery.querySelector('.bg-thumbs');
  const frame = gallery.querySelector('.bg-frame');
  const counter = gallery.querySelector('[data-current]');
  if (slides.length < 2) return;

  let index = 0;

  // Otomatik geçiş: süre CSS'teki --interval (ör. 2s). Fare üzerine gelince durmaz; tüm
  // tarayıcılarda aynı çalışan basit bir zamanlayıcı. Elle geçişte süre baştan başlar,
  // sekme gizliyken boşuna çalışmaz.
  const interval = () => {
    const raw = getComputedStyle(gallery).getPropertyValue('--interval').trim();
    const value = parseFloat(raw);
    if (!value) return 2000;
    return raw.endsWith('ms') ? value : value * 1000;
  };
  let timer;
  const runBar = () => {
    window.clearTimeout(timer);
    if (document.hidden) return;
    timer = window.setTimeout(() => show(index + 1), interval());
  };
  document.addEventListener('visibilitychange', runBar);

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
