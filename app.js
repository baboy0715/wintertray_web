/**
 * =========================================================================
 * WINTERTRAY - FŐ ALKALMAZÁSLOGIKA (APP.JS)
 * =========================================================================
 * - Dinamikus verziókezelés (releases.js / releases.json alapján)
 * - Letöltőgombok és Hero adatok automatikus frissítése
 * - Kiadások és Changelog idővonal dinamikus felépítése
 * - SHA-256 ellenőrzőösszeg másolása vágólapra Toast visszajelzéssel
 * - Interaktív vezérlők összekötése a hóhullás motorral (SnowEngine)
 * - Harmonika (FAQ) és mobilmenü kezelése
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Inicializáljuk a hóhullás motort
  let snowEngine = null;
  if (window.SnowEngine) {
    snowEngine = new window.SnowEngine('snow-canvas');
  }

  // 2. Verzióadatok betöltése és felület frissítése
  await initReleases();

  // 3. Eseménykezelők regisztrálása
  initHeaderScroll();
  initMobileMenu();
  initFaqAccordion();
  initMockupInteractivity(snowEngine);
  initPlaygroundControls(snowEngine);
  initAdminShortcut();
});

/**
 * Gyorsbillentyű az Admin felület megnyitásához (Ctrl + Shift + A)
 */
function initAdminShortcut() {
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      window.location.href = 'admin.html';
    }
  });
}

/**
 * Kiadások betöltése (Elsődlegesen localStorage override, másodlagosan window.WINTERTRAY_RELEASES, harmadlagosan fetch('releases.json'))
 */
async function initReleases() {
  let releases = null;

  // Helyi szerkesztett verziók ellenőrzése az admin felületből
  try {
    const savedCustom = localStorage.getItem('wintertray_custom_releases');
    if (savedCustom) {
      releases = JSON.parse(savedCustom);
    }
  } catch (e) {
    console.warn('Nem sikerült a localStorage-ből betölteni az egyedi kiadásokat:', e);
  }

  if (!releases) {
    releases = window.WINTERTRAY_RELEASES;
  }

  if (!releases || !Array.isArray(releases)) {
    try {
      const response = await fetch('releases.json');
      if (response.ok) {
        releases = await response.json();
      }
    } catch (e) {
      console.warn('Nem sikerült a releases.json betöltése fetch-csel (lehet helyi file:// protokoll):', e);
    }
  }

  if (!releases || releases.length === 0) {
    console.warn('Nem találhatók kiadási adatok.');
    return;
  }

  // A legújabb kiadás megkeresése (isLatest = true vagy az első elem)
  const latestRelease = releases.find(r => r.isLatest) || releases[0];

  // Hero és egyéb letöltőgombok frissítése
  updateHeroDownloadButtons(latestRelease);

  // Changelog idővonal generálása
  renderChangelogTimeline(releases);
}

/**
 * Frissíti a Hero, a Header és a Záró CTA blokk letöltési linkjeit
 */
function updateHeroDownloadButtons(release) {
  // Hero fő gomb
  const heroBtn = document.getElementById('hero-download-btn');
  const heroVersionLabel = document.getElementById('hero-version-label');
  const heroSizeLabel = document.getElementById('hero-size-label');
  const heroPortableBtn = document.getElementById('hero-portable-btn');
  const heroPortableSize = document.getElementById('hero-portable-size');

  // Navigációs és Footer CTA gombok
  const navDownloadBtn = document.getElementById('nav-download-btn');
  const bannerDownloadBtn = document.getElementById('banner-download-btn');
  const bannerVersionLabel = document.getElementById('banner-version-label');

  if (heroBtn) {
    heroBtn.href = release.downloadUrl || '#';
  }
  if (heroVersionLabel) {
    heroVersionLabel.textContent = `Letöltés (${release.version})`;
  }
  if (heroSizeLabel) {
    heroSizeLabel.textContent = `${release.fileSize || '18 MB'} • Windows 11 / 10 (64-bit)`;
  }
  if (heroPortableBtn) {
    heroPortableBtn.href = release.portableUrl || '#';
  }
  if (heroPortableSize && release.portableSize) {
    heroPortableSize.textContent = `(${release.portableSize})`;
  }

  if (navDownloadBtn) {
    navDownloadBtn.href = release.downloadUrl || '#';
  }
  if (bannerDownloadBtn) {
    bannerDownloadBtn.href = release.downloadUrl || '#';
  }
  if (bannerVersionLabel) {
    bannerVersionLabel.textContent = `WinterTray ${release.version} letöltése most`;
  }
}

/**
 * Kirajzolja a Kiadások (Changelog) szekció idővonalát
 */
function renderChangelogTimeline(releases) {
  const container = document.getElementById('changelog-timeline');
  if (!container) return;

  container.innerHTML = '';

  releases.forEach((rel) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'timeline-item';

    // Badge stílus
    const badgeClass = rel.isLatest ? 'release-badge' : 'release-badge beta';
    const badgeText = rel.badge || (rel.isLatest ? 'Legfrissebb Kiadás' : 'Archív Kiadás');

    // Kiemelt pontok (Highlights)
    const highlightsHtml = (rel.highlights || []).map(h => `<li>${escapeHtml(h)}</li>`).join('');

    // Részletes kategóriák (Changelog csoportok)
    let categoriesHtml = '';
    if (rel.changelog && rel.changelog.length > 0) {
      categoriesHtml = rel.changelog.map(cat => `
        <div class="changelog-category">
          <div class="category-title">${escapeHtml(cat.category)}</div>
          <ul class="category-items">
            ${cat.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
      `).join('');
    }

    // SHA-256 másolható doboz
    const shaHtml = rel.sha256 ? `
      <div class="sha-box" onclick="copyToClipboard('${rel.sha256}', 'SHA-256 ellenőrzőösszeg másolva!')" title="Kattints a másoláshoz">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
        <span>SHA-256: <code>${rel.sha256.substring(0, 16)}...</code></span>
      </div>
    ` : '';

    itemEl.innerHTML = `
      <div class="timeline-node">
        <div class="timeline-node-inner"></div>
      </div>
      <div class="timeline-card">
        <div class="release-header">
          <div class="release-title-group">
            <span class="release-version">${escapeHtml(rel.version)}</span>
            <span class="${badgeClass}">${escapeHtml(badgeText)}</span>
            <span class="release-date">${formatDate(rel.releaseDate)}</span>
          </div>
          <div class="release-download-group">
            <a href="${rel.downloadUrl}" class="btn-release-dl" target="_blank" rel="noopener">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Telepítő (${rel.fileSize || 'EXE'})
            </a>
            ${rel.portableUrl ? `
              <a href="${rel.portableUrl}" class="btn-release-portable" target="_blank" rel="noopener">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                Hordozható (${rel.portableSize || 'ZIP'})
              </a>
            ` : ''}
          </div>
        </div>

        <ul class="release-highlights">
          ${highlightsHtml}
        </ul>

        ${categoriesHtml}

        <div class="release-footer-meta">
          <span>Támogatott: Windows 11 / Windows 10 (64-bit)</span>
          ${shaHtml}
        </div>
      </div>
    `;

    container.appendChild(itemEl);
  });
}

/**
 * Szöveg vágólapra másolása és Toast visszajelzés
 */
window.copyToClipboard = function (text, message = 'Vágólapra másolva!') {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(message);
    }).catch(() => {
      fallbackCopyText(text, message);
    });
  } else {
    fallbackCopyText(text, message);
  }
};

function fallbackCopyText(text, message) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(message);
  } catch (err) {
    showToast('A másolás nem sikerült.');
  }
  document.body.removeChild(textArea);
}

function showToast(message) {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
    <span>${escapeHtml(message)}</span>
  `;

  toastContainer.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 400);
  }, 2800);
}

/**
 * Fejléc görgetés figyelése (Scrolled osztály hozzáadása)
 */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/**
 * Mobil navigációs menü megnyitása és bezárása
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });

  // Ha rákattint egy menüpontra, zárja be a menüt
  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
    });
  });
}

/**
 * Harmonika kérdések (FAQ) nyitása és csukása
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (questionBtn && answer) {
      questionBtn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Összes többi becsukása
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('open');
            const otherAnswer = otherItem.querySelector('.faq-answer');
            if (otherAnswer) otherAnswer.style.maxHeight = null;
          }
        });

        if (isOpen) {
          item.classList.remove('open');
          answer.style.maxHeight = null;
        } else {
          item.classList.add('open');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    }
  });
}

/**
 * Mockup alkalmazásvezérlők interaktivitása (Összekapcsolva a hóhullás szimulációval)
 */
function initMockupInteractivity(snowEngine) {
  // Toggle gombok a mockupon belül
  const toggles = document.querySelectorAll('.w11-toggle');
  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('checked');
      const feature = toggle.getAttribute('data-feature');
      const isChecked = toggle.classList.contains('checked');

      if (feature === 'icicles') {
        const iciclesRow = document.querySelector('.icicles-decor');
        if (iciclesRow) {
          iciclesRow.style.display = isChecked ? 'flex' : 'none';
        }
        showToast(isChecked ? 'Jégcsapok bekapcsolva' : 'Jégcsapok kikapcsolva');
      } else if (feature === 'snow-cap') {
        const snowCap = document.querySelector('.snow-cap');
        if (snowCap) {
          snowCap.style.display = isChecked ? 'block' : 'none';
        }
        showToast(isChecked ? 'Ablaktapadás aktív' : 'Ablaktapadás szüneteltetve');
      } else if (feature === 'game-mode') {
        showToast(isChecked ? 'Játékos mód (Auto-szüneteltetés) aktív' : 'Játékos mód inaktív');
      }
    });
  });

  // Mockup sebesség és sűrűség csúszkák
  const speedSlider = document.getElementById('mockup-speed-slider');
  const speedVal = document.getElementById('mockup-speed-val');
  if (speedSlider && speedVal && snowEngine) {
    speedSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      speedVal.textContent = `${Math.round(val * 100)}%`;
      snowEngine.setDensity(val);
    });
  }

  const windSlider = document.getElementById('mockup-wind-slider');
  const windVal = document.getElementById('mockup-wind-val');
  if (windSlider && windVal && snowEngine) {
    windSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      windVal.textContent = val > 0 ? `+${val.toFixed(1)} ÉK` : `${val.toFixed(1)} ÉNY`;
      snowEngine.setWind(val);
    });
  }

  // Interaktív mockupon kattintásra leomló jégcsap szimuláció
  const icicles = document.querySelectorAll('.icicle');
  icicles.forEach(icicle => {
    icicle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (snowEngine) {
        snowEngine.triggerFlurry(e.clientX, e.clientY);
      }
      showToast('Jégcsap leolvasztva! ❄');
    });
  });
}

/**
 * Hó-játszótér (Snow Playground) kezelőszervei
 */
function initPlaygroundControls(snowEngine) {
  if (!snowEngine) return;

  const pgDensity = document.getElementById('pg-density');
  const pgDensityVal = document.getElementById('pg-density-val');
  if (pgDensity && pgDensityVal) {
    pgDensity.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      pgDensityVal.textContent = `${Math.round(val * 100)}%`;
      snowEngine.setDensity(val);
    });
  }

  const pgWind = document.getElementById('pg-wind');
  const pgWindVal = document.getElementById('pg-wind-val');
  if (pgWind && pgWindVal) {
    pgWind.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      let desc = 'Szélcsend';
      if (val > 0.5) desc = 'Jobbra (ÉK)';
      else if (val < -0.5) desc = 'Balra (ÉNY)';
      pgWindVal.textContent = desc;
      snowEngine.setWind(val);
    });
  }

  const flurryBtn = document.getElementById('btn-trigger-flurry');
  if (flurryBtn) {
    flurryBtn.addEventListener('click', () => {
      snowEngine.triggerFlurry();
      showToast('Hózápor aktiválva! ❄💨');
    });
  }
}

/**
 * Segédfüggvény: Dátum formázása magyar formátumra
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const months = ['január', 'február', 'március', 'április', 'május', 'június', 'július', 'augusztus', 'szeptember', 'október', 'november', 'december'];
      const year = parts[0];
      const month = months[parseInt(parts[1], 10) - 1] || parts[1];
      const day = parseInt(parts[2], 10);
      return `${year}. ${month} ${day}.`;
    }
  } catch (e) {
    // fallback
  }
  return dateStr;
}

/**
 * Segédfüggvény: HTML kódok védelme (XSS megelőzés)
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
