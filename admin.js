/**
 * =========================================================================
 * WINTERTRAY - ADMINISZTRÁCIÓS VEZÉRLŐPULT LOGIKA (ADMIN.JS)
 * =========================================================================
 * - PIN kódos hitelesítés és munkamenet-kezelés
 * - Kiadások megtekintése, szerkesztése, törlése és rendezése
 * - Fájlméret és valós kriptográfiai SHA-256 hash számítás a böngészőben (Web Crypto API)
 * - Élő előnézet (Live Preview) szerkesztés közben
 * - 1 kattintásos közvetlen GitHub API publikálás (Cloudflare Pages azonnali frissítés)
 * - Fájlexport és helyi tesztkörnyezet kezelése
 */

(function () {
  'use strict';

  // Alapértelmezett PIN kód
  const DEFAULT_PIN = 'winter2026';
  const GITHUB_REPO = 'baboy0715/wintertray_web';
  const GITHUB_BRANCH = 'main';

  let currentReleases = [];
  let editingIndex = -1;

  document.addEventListener('DOMContentLoaded', async () => {
    initAuth();
    initTabs();
    await loadReleases();
    initEditorEvents();
    initFileDropZone();
    initPublishEvents();
    initSettingsEvents();
  });

  /* =========================================================================
   * 1. HITELESÍTÉS ÉS BELÉPÉS
   * ========================================================================= */

  function initAuth() {
    const loginOverlay = document.getElementById('login-overlay');
    const adminApp = document.getElementById('admin-app');
    const loginForm = document.getElementById('login-form');
    const pinInput = document.getElementById('admin-pin');
    const loginError = document.getElementById('login-error');
    const rememberMe = document.getElementById('remember-me');
    const logoutBtn = document.getElementById('btn-logout');

    const savedAuth = localStorage.getItem('wintertray_admin_auth');
    if (savedAuth === 'true') {
      loginOverlay.style.display = 'none';
      adminApp.style.display = 'block';
    }

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredPin = pinInput.value.trim();
      const storedPin = localStorage.getItem('wintertray_admin_pin') || DEFAULT_PIN;

      if (enteredPin === storedPin) {
        loginError.style.display = 'none';
        if (rememberMe.checked) {
          localStorage.setItem('wintertray_admin_auth', 'true');
        } else {
          sessionStorage.setItem('wintertray_admin_auth', 'true');
        }
        loginOverlay.style.display = 'none';
        adminApp.style.display = 'block';
      } else {
        loginError.style.display = 'block';
        pinInput.focus();
        pinInput.select();
      }
    });

    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('wintertray_admin_auth');
      sessionStorage.removeItem('wintertray_admin_auth');
      window.location.reload();
    });
  }

  /* =========================================================================
   * 2. FÜLEK KEZELÉSE
   * ========================================================================= */

  function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab');
        switchTab(targetId);
      });
    });
  }

  function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

    const targetBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    const targetPane = document.getElementById(tabId);

    if (targetBtn) targetBtn.classList.add('active');
    if (targetPane) targetPane.classList.add('active');
  }

  /* =========================================================================
   * 3. KIADÁSOK BETÖLTÉSE ÉS MEGJELENÍTÉSE
   * ========================================================================= */

  async function loadReleases() {
    // 1. Megpróbáljuk a localStorage-ből betölteni (ha helyben szerkesztettük)
    const localData = localStorage.getItem('wintertray_custom_releases');
    if (localData) {
      try {
        currentReleases = JSON.parse(localData);
      } catch (e) {
        console.warn('Hiba a helyi kiadások beolvasásakor:', e);
      }
    }

    // 2. Ha nincs helyi módosítás, jöhet a releases.js / releases.json
    if (!currentReleases || currentReleases.length === 0) {
      if (window.WINTERTRAY_RELEASES && Array.isArray(window.WINTERTRAY_RELEASES)) {
        currentReleases = JSON.parse(JSON.stringify(window.WINTERTRAY_RELEASES));
      } else {
        try {
          const res = await fetch('releases.json');
          if (res.ok) {
            currentReleases = await res.json();
          }
        } catch (e) {
          console.warn('Nem sikerült a releases.json betöltése fetch-csel');
        }
      }
    }

    if (!currentReleases) {
      currentReleases = [];
    }

    renderReleasesTable();
    updateReleaseCountBadge();
  }

  function updateReleaseCountBadge() {
    const countEl = document.getElementById('release-count');
    if (countEl) countEl.textContent = currentReleases.length;
  }

  function renderReleasesTable() {
    const tbody = document.getElementById('releases-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (currentReleases.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 30px; color: var(--text-dim);">Nincsenek elérhető kiadások. Kattints a "+ Új verzió feltöltése" gombra!</td></tr>`;
      return;
    }

    currentReleases.forEach((rel, index) => {
      const tr = document.createElement('tr');

      let badgeClass = 'table-badge other';
      if (rel.isLatest) badgeClass = 'table-badge latest';
      else if (rel.badge && rel.badge.toLowerCase().includes('béta')) badgeClass = 'table-badge beta';

      tr.innerHTML = `
        <td><span class="table-version">${escapeHtml(rel.version)}</span></td>
        <td>${escapeHtml(rel.releaseDate || '-')}</td>
        <td>
          <span class="${badgeClass}">${escapeHtml(rel.badge || (rel.isLatest ? 'Legfrissebb' : 'Archív'))}</span>
        </td>
        <td>
          <a href="${rel.downloadUrl}" target="_blank" class="table-link" title="${rel.downloadUrl}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span>${rel.downloadUrl.startsWith('./downloads') ? 'Helyi Tárhely' : 'Külső Link'}</span>
          </a>
        </td>
        <td>
          ${rel.portableUrl ? `
            <a href="${rel.portableUrl}" target="_blank" class="table-link" title="${rel.portableUrl}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
              <span>${rel.portableSize || 'ZIP'}</span>
            </a>
          ` : '<span style="color: var(--text-dim);">-</span>'}
        </td>
        <td><strong style="color: var(--ice-light);">${escapeHtml(rel.fileSize || '-')}</strong></td>
        <td>
          <div class="table-actions">
            <button class="btn-icon-action btn-edit-release" data-index="${index}" title="Szerkesztés">
              ✏️ Szerkesztés
            </button>
            <button class="btn-icon-action btn-set-latest" data-index="${index}" title="Beállítás fő letöltésként">
              ${rel.isLatest ? '⭐ Fő verzió' : '⭐ Legyen ez a fő'}
            </button>
            <button class="btn-icon-action btn-delete-release" data-index="${index}" title="Törlés" style="color: #fca5a5;">
              🗑️
            </button>
          </div>
        </td>
      `;

      tbody.appendChild(tr);
    });

    // Eseménykezelők a táblázat gombjaihoz
    tbody.querySelectorAll('.btn-edit-release').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        openEditorForRelease(idx);
      });
    });

    tbody.querySelectorAll('.btn-set-latest').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        setReleaseAsLatest(idx);
      });
    });

    tbody.querySelectorAll('.btn-delete-release').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        deleteRelease(idx);
      });
    });
  }

  function setReleaseAsLatest(index) {
    currentReleases.forEach((r, i) => {
      r.isLatest = (i === index);
      if (i === index) {
        r.badge = 'Legfrissebb Stabil Kiadás';
      }
    });
    saveCurrentReleasesLocally();
    renderReleasesTable();
    showAdminAlert('A kijelölt verzió mostantól a Fő letöltési verzió a weboldalon! ⭐');
  }

  function deleteRelease(index) {
    const rel = currentReleases[index];
    if (confirm(`Biztosan törölni szeretnéd a(z) ${rel.version} kiadást?`)) {
      currentReleases.splice(index, 1);
      // Ha a legfrissebbet töröltük és van még más, az első legyen a legfrissebb
      if (currentReleases.length > 0 && !currentReleases.some(r => r.isLatest)) {
        currentReleases[0].isLatest = true;
      }
      saveCurrentReleasesLocally();
      renderReleasesTable();
      updateReleaseCountBadge();
      showAdminAlert(`A(z) ${rel.version} kiadás sikeresen törölve.`);
    }
  }

  /* =========================================================================
   * 4. SZERKESZTŐ ÉS ŰRLAP LOGIKA
   * ========================================================================= */

  function initEditorEvents() {
    const btnNew = document.getElementById('btn-create-new-release');
    const btnCancel = document.getElementById('btn-cancel-edit');
    const btnSave = document.getElementById('btn-save-release');
    const btnAddHighlight = document.getElementById('btn-add-highlight');
    const btnAddCategory = document.getElementById('btn-add-category');

    btnNew.addEventListener('click', () => {
      openEditorForRelease(-1);
    });

    btnCancel.addEventListener('click', () => {
      switchTab('tab-releases');
    });

    btnSave.addEventListener('click', () => {
      saveReleaseFromForm();
    });

    btnAddHighlight.addEventListener('click', () => {
      addHighlightRow('');
      updateLivePreview();
    });

    btnAddCategory.addEventListener('click', () => {
      addCategoryBox('Új kategória', ['Új funkció leírása']);
      updateLivePreview();
    });

    // Élő előnézet frissítése az összes beviteli mező változásakor
    const form = document.getElementById('release-form');
    form.addEventListener('input', () => {
      updateLivePreview();
    });

    // Rádiógombok: letöltési forrás váltása
    document.querySelectorAll('input[name="url-source"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const val = e.target.value;
        const version = document.getElementById('form-version').value.trim() || 'v1.0.0';
        const dlInput = document.getElementById('form-download-url');
        const portableInput = document.getElementById('form-portable-url');

        if (val === 'cloudflare') {
          dlInput.value = './downloads/WinterTray-Setup.exe';
          portableInput.value = './downloads/WinterTray-Portable.zip';
        } else if (val === 'github') {
          dlInput.value = `https://github.com/${GITHUB_REPO}/releases/download/${version}/WinterTray-Setup.exe`;
          portableInput.value = `https://github.com/${GITHUB_REPO}/releases/download/${version}/WinterTray-Portable.zip`;
        }
        updateLivePreview();
      });
    });
  }

  function openEditorForRelease(index) {
    editingIndex = index;
    const editorTitle = document.getElementById('editor-title');
    const editorTabLabel = document.getElementById('editor-tab-label');
    const btnCancel = document.getElementById('btn-cancel-edit');
    const hiddenIndex = document.getElementById('edit-release-index');

    hiddenIndex.value = index;

    if (index >= 0 && currentReleases[index]) {
      const rel = currentReleases[index];
      editorTitle.textContent = `${rel.version} Kiadás Szerkesztése`;
      editorTabLabel.textContent = `Szerkesztés (${rel.version})`;
      btnCancel.style.display = 'inline-flex';

      document.getElementById('form-version').value = rel.version || '';
      document.getElementById('form-date').value = rel.releaseDate || getTodayString();
      document.getElementById('form-badge').value = rel.badge || 'Legfrissebb Stabil Kiadás';
      document.getElementById('form-is-latest').checked = !!rel.isLatest;
      document.getElementById('form-filesize').value = rel.fileSize || '18.4 MB';
      document.getElementById('form-portablesize').value = rel.portableSize || '14.2 MB';
      document.getElementById('form-sha256').value = rel.sha256 || '';
      document.getElementById('form-download-url').value = rel.downloadUrl || './downloads/WinterTray-Setup.exe';
      document.getElementById('form-portable-url').value = rel.portableUrl || './downloads/WinterTray-Portable.zip';

      // Highlights
      renderHighlightRows(rel.highlights || []);

      // Changelog kategóriák
      renderCategoryBoxes(rel.changelog || []);
    } else {
      // Új kiadás létrehozása
      editorTitle.textContent = 'Új Verzió Létrehozása & Fájl Hozzárendelés';
      editorTabLabel.textContent = 'Új Verzió Hozzáadása';
      btnCancel.style.display = 'none';

      // Következő verziószám kitalálása
      const nextVersion = suggestNextVersion();
      document.getElementById('form-version').value = nextVersion;
      document.getElementById('form-date').value = getTodayString();
      document.getElementById('form-badge').value = 'Legfrissebb Stabil Kiadás';
      document.getElementById('form-is-latest').checked = true;
      document.getElementById('form-filesize').value = '18.4 MB';
      document.getElementById('form-portablesize').value = '14.2 MB';
      document.getElementById('form-sha256').value = '';
      document.getElementById('form-download-url').value = './downloads/WinterTray-Setup.exe';
      document.getElementById('form-portable-url').value = './downloads/WinterTray-Portable.zip';

      renderHighlightRows([
        'Új funkciók és továbbfejlesztett Windows 11 integráció.',
        'Hardveresen gyorsított, sima 60 FPS hóhullás szimuláció.',
        'Automatikus szüneteltetés játékok és teljes képernyős appok alatt.'
      ]);

      renderCategoryBoxes([
        {
          category: 'Új funkciók',
          items: ['Első tesztfunkció az új verzióban', 'Továbbfejlesztett egérfizika']
        },
        {
          category: 'Javítások',
          items: ['Optimalizált memóriahasználat']
        }
      ]);
    }

    switchTab('tab-editor');
    updateLivePreview();
  }

  function suggestNextVersion() {
    if (currentReleases.length === 0) return 'v1.0.0';
    const latest = currentReleases[0].version || 'v1.0.0';
    const match = latest.match(/v?(\d+)\.(\d+)\.?(\d+)?/);
    if (match) {
      const major = parseInt(match[1], 10);
      const minor = parseInt(match[2], 10);
      const patch = match[3] !== undefined ? parseInt(match[3], 10) : 0;
      return `v${major}.${minor + 1}.${patch}`;
    }
    return 'v1.1.0';
  }

  function getTodayString() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function renderHighlightRows(items) {
    const container = document.getElementById('highlights-container');
    container.innerHTML = '';
    items.forEach(text => addHighlightRow(text));
  }

  function addHighlightRow(text) {
    const container = document.getElementById('highlights-container');
    const div = document.createElement('div');
    div.className = 'dynamic-row';
    div.innerHTML = `
      <input type="text" class="form-control highlight-item-input" value="${escapeHtml(text)}" placeholder="Kiemelt újdonság leírása...">
      <button type="button" class="btn-remove-row" title="Eltávolítás">✕</button>
    `;
    div.querySelector('.btn-remove-row').addEventListener('click', () => {
      div.remove();
      updateLivePreview();
    });
    div.querySelector('input').addEventListener('input', () => {
      updateLivePreview();
    });
    container.appendChild(div);
  }

  function renderCategoryBoxes(categories) {
    const container = document.getElementById('changelog-categories-container');
    container.innerHTML = '';
    categories.forEach(cat => addCategoryBox(cat.category, cat.items));
  }

  function addCategoryBox(title, items) {
    const container = document.getElementById('changelog-categories-container');
    const box = document.createElement('div');
    box.className = 'changelog-category-box';

    let itemsHtml = '';
    (items || ['']).forEach(it => {
      itemsHtml += `
        <div class="dynamic-row" style="margin-bottom: 6px;">
          <input type="text" class="form-control category-item-input" value="${escapeHtml(it)}" placeholder="Pont leírása...">
          <button type="button" class="btn-remove-row" title="Eltávolítás">✕</button>
        </div>
      `;
    });

    box.innerHTML = `
      <div class="category-top-row">
        <input type="text" class="form-control category-title-input" value="${escapeHtml(title)}" placeholder="Kategória neve (pl. Új funkciók, Javítások)" style="font-weight: 700; color: var(--ice-light);">
        <button type="button" class="btn-sm-admin btn-add-cat-item">+ Sor</button>
        <button type="button" class="btn-remove-row btn-remove-cat" title="Kategória törlése">✕</button>
      </div>
      <div class="category-items-container">
        ${itemsHtml}
      </div>
    `;

    // Eseménykezelők a kategória dobozhoz
    box.querySelector('.btn-remove-cat').addEventListener('click', () => {
      box.remove();
      updateLivePreview();
    });

    box.querySelector('.btn-add-cat-item').addEventListener('click', () => {
      const itemsContainer = box.querySelector('.category-items-container');
      const row = document.createElement('div');
      row.className = 'dynamic-row';
      row.style.marginBottom = '6px';
      row.innerHTML = `
        <input type="text" class="form-control category-item-input" placeholder="Új pont leírása...">
        <button type="button" class="btn-remove-row" title="Eltávolítás">✕</button>
      `;
      row.querySelector('.btn-remove-row').addEventListener('click', () => {
        row.remove();
        updateLivePreview();
      });
      row.querySelector('input').addEventListener('input', () => updateLivePreview());
      itemsContainer.appendChild(row);
      updateLivePreview();
    });

    box.querySelectorAll('.btn-remove-row').forEach(b => {
      if (!b.classList.contains('btn-remove-cat')) {
        b.addEventListener('click', () => {
          b.closest('.dynamic-row').remove();
          updateLivePreview();
        });
      }
    });

    box.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('input', () => updateLivePreview());
    });

    container.appendChild(box);
  }

  /* =========================================================================
   * 5. DRAG & DROP ÉS VALÓDI BÖNGÉSZŐS SHA-256 GENERÁLÁS (WEB CRYPTO API)
   * ========================================================================= */

  function initFileDropZone() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input-exe');
    const filesizeInput = document.getElementById('form-filesize');
    const shaInput = document.getElementById('form-sha256');

    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processSelectedFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files.length > 0) {
        processSelectedFile(fileInput.files[0]);
      }
    });

    async function processSelectedFile(file) {
      showAdminAlert(`Fájl beolvasása: ${file.name} (${formatBytes(file.size)})... SHA-256 számítása folyamatban...`);

      // 1. Fájlméret automatikus beállítása
      filesizeInput.value = formatBytes(file.size);

      // 2. Kriptográfiai SHA-256 hash számítása a Web Crypto API-val
      try {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        shaInput.value = hashHex;

        showAdminAlert(`✅ Siker! Fájlméret: ${formatBytes(file.size)}, SHA-256 hash kiszámítva!`);
      } catch (err) {
        console.error('Hiba az SHA-256 számításakor:', err);
        showAdminAlert('Nem sikerült a hash számítása, kérlek add meg manuálisan.');
      }

      updateLivePreview();
    }
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /* =========================================================================
   * 6. ÉLŐ ELŐNÉZET (LIVE PREVIEW)
   * ========================================================================= */

  function updateLivePreview() {
    const previewContainer = document.getElementById('live-card-preview');
    if (!previewContainer) return;

    const version = document.getElementById('form-version').value.trim() || 'v1.0.0';
    const date = document.getElementById('form-date').value || getTodayString();
    const badge = document.getElementById('form-badge').value;
    const isLatest = document.getElementById('form-is-latest').checked;
    const filesize = document.getElementById('form-filesize').value.trim() || '18.4 MB';
    const portablesize = document.getElementById('form-portablesize').value.trim() || '14.2 MB';
    const sha = document.getElementById('form-sha256').value.trim();
    const downloadUrl = document.getElementById('form-download-url').value.trim();
    const portableUrl = document.getElementById('form-portable-url').value.trim();

    // Highlights
    const highlightInputs = document.querySelectorAll('.highlight-item-input');
    const highlights = [];
    highlightInputs.forEach(inp => {
      const v = inp.value.trim();
      if (v) highlights.push(v);
    });

    // Categories
    const categoryBoxes = document.querySelectorAll('.changelog-category-box');
    let categoriesHtml = '';
    categoryBoxes.forEach(box => {
      const catTitle = box.querySelector('.category-title-input').value.trim();
      const itemInputs = box.querySelectorAll('.category-item-input');
      const items = [];
      itemInputs.forEach(it => {
        const iv = it.value.trim();
        if (iv) items.push(iv);
      });

      if (catTitle && items.length > 0) {
        categoriesHtml += `
          <div class="changelog-category">
            <div class="category-title">${escapeHtml(catTitle)}</div>
            <ul class="category-items">
              ${items.map(it => `<li>${escapeHtml(it)}</li>`).join('')}
            </ul>
          </div>
        `;
      }
    });

    previewContainer.innerHTML = `
      <div class="release-header">
        <div class="release-title-group">
          <span class="release-version">${escapeHtml(version)}</span>
          <span class="release-badge ${isLatest ? '' : 'beta'}">${escapeHtml(badge)}</span>
          <span class="release-date">${escapeHtml(date)}</span>
        </div>
        <div class="release-download-group">
          <a href="${downloadUrl}" class="btn-release-dl" onclick="return false;">
            Telepítő (${escapeHtml(filesize)})
          </a>
          ${portableUrl ? `
            <a href="${portableUrl}" class="btn-release-portable" onclick="return false;">
              Hordozható (${escapeHtml(portablesize)})
            </a>
          ` : ''}
        </div>
      </div>

      <ul class="release-highlights">
        ${highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}
      </ul>

      ${categoriesHtml}

      <div class="release-footer-meta">
        <span>Windows 11 / 10 (64-bit)</span>
        ${sha ? `<span>SHA-256: <code>${sha.substring(0, 14)}...</code></span>` : ''}
      </div>
    `;
  }

  /* =========================================================================
   * 7. KIADÁS MENTÉSE
   * ========================================================================= */

  function saveReleaseFromForm() {
    const version = document.getElementById('form-version').value.trim();
    const releaseDate = document.getElementById('form-date').value.trim();
    const badge = document.getElementById('form-badge').value;
    const isLatest = document.getElementById('form-is-latest').checked;
    const fileSize = document.getElementById('form-filesize').value.trim();
    const portableSize = document.getElementById('form-portablesize').value.trim();
    const sha256 = document.getElementById('form-sha256').value.trim();
    const downloadUrl = document.getElementById('form-download-url').value.trim();
    const portableUrl = document.getElementById('form-portable-url').value.trim();

    if (!version) {
      alert('Kérlek add meg a verziószámot (pl. v1.1.0)!');
      return;
    }

    // Highlights gyűjtése
    const highlights = [];
    document.querySelectorAll('.highlight-item-input').forEach(inp => {
      const v = inp.value.trim();
      if (v) highlights.push(v);
    });

    // Changelog kategóriák gyűjtése
    const changelog = [];
    document.querySelectorAll('.changelog-category-box').forEach(box => {
      const catTitle = box.querySelector('.category-title-input').value.trim();
      const items = [];
      box.querySelectorAll('.category-item-input').forEach(it => {
        const iv = it.value.trim();
        if (iv) items.push(iv);
      });
      if (catTitle && items.length > 0) {
        changelog.push({ category: catTitle, items: items });
      }
    });

    const releaseObj = {
      version: version,
      releaseDate: releaseDate,
      isLatest: isLatest,
      isFeatured: isLatest,
      badge: badge,
      downloadUrl: downloadUrl,
      portableUrl: portableUrl,
      fileSize: fileSize,
      portableSize: portableSize,
      sha256: sha256,
      highlights: highlights,
      changelog: changelog
    };

    // Ha ez a legfrissebb, a többiről vesszük le az isLatest-et
    if (isLatest) {
      currentReleases.forEach(r => r.isLatest = false);
    }

    if (editingIndex >= 0 && currentReleases[editingIndex]) {
      currentReleases[editingIndex] = releaseObj;
      showAdminAlert(`A(z) ${version} kiadás sikeresen frissítve! 🎉`);
    } else {
      // Új kiadás mindig a legelső helyre kerül (index 0)
      currentReleases.unshift(releaseObj);
      showAdminAlert(`Új kiadás hozzáadva: ${version}! 🎉`);
    }

    saveCurrentReleasesLocally();
    renderReleasesTable();
    updateReleaseCountBadge();
    switchTab('tab-releases');
  }

  function saveCurrentReleasesLocally() {
    localStorage.setItem('wintertray_custom_releases', JSON.stringify(currentReleases, null, 2));
  }

  /* =========================================================================
   * 8. PUBLIKÁLÁS & GITHUB SZINKRONIZÁCIÓ
   * ========================================================================= */

  function initPublishEvents() {
    const btnPublishGithub = document.getElementById('btn-publish-github');
    const ghTokenInput = document.getElementById('gh-token');
    const publishStatus = document.getElementById('publish-status');
    const btnDlJs = document.getElementById('btn-download-releases-js');
    const btnDlJson = document.getElementById('btn-download-releases-json');
    const btnCopyJson = document.getElementById('btn-copy-json');
    const btnResetLocal = document.getElementById('btn-reset-local');

    // Korábbi token betöltése
    const savedToken = localStorage.getItem('wintertray_github_token');
    if (savedToken && ghTokenInput) {
      ghTokenInput.value = savedToken;
    }

    // 1. Publikálás a GitHubra REST API-val
    btnPublishGithub.addEventListener('click', async () => {
      const token = ghTokenInput.value.trim();
      if (!token) {
        alert('Kérlek add meg a GitHub Personal Access Token-edet a publikáláshoz!');
        ghTokenInput.focus();
        return;
      }

      localStorage.setItem('wintertray_github_token', token);
      publishStatus.style.display = 'block';
      publishStatus.className = 'publish-status loading';
      publishStatus.textContent = '⏳ Kapcsolódás a GitHubhoz és fájlok frissítése...';

      try {
        const jsonContent = JSON.stringify(currentReleases, null, 2);
        const jsContent = generateReleasesJsContent(currentReleases);

        // 1. releases.json feltöltése
        await commitFileToGitHub(token, 'releases.json', jsonContent, 'Update releases.json via WinterTray Admin');

        // 2. releases.js feltöltése
        await commitFileToGitHub(token, 'releases.js', jsContent, 'Update releases.js via WinterTray Admin');

        publishStatus.className = 'publish-status success';
        publishStatus.innerHTML = `
          🚀 <strong>Sikeres publikálás!</strong> A GitHub tároló frissült.<br>
          A Cloudflare Pages automatikusan elindította az új buildet, kb. 30 másodperc múlva éles a világon!
        `;
      } catch (err) {
        console.error('GitHub publikálási hiba:', err);
        publishStatus.className = 'publish-status error';
        publishStatus.textContent = `❌ Hiba a publikálás közben: ${err.message}`;
      }
    });

    // 2. Fájlok letöltése manuális commit-hoz
    btnDlJs.addEventListener('click', () => {
      const jsContent = generateReleasesJsContent(currentReleases);
      downloadFile(jsContent, 'releases.js', 'text/javascript');
    });

    btnDlJson.addEventListener('click', () => {
      const jsonContent = JSON.stringify(currentReleases, null, 2);
      downloadFile(jsonContent, 'releases.json', 'application/json');
    });

    btnCopyJson.addEventListener('click', () => {
      const jsonContent = JSON.stringify(currentReleases, null, 2);
      navigator.clipboard.writeText(jsonContent).then(() => {
        showAdminAlert('A teljes releases.json JSON kód a vágólapra másolva! 📋');
      });
    });

    // 3. Helyi tesztadatok törlése
    btnResetLocal.addEventListener('click', () => {
      if (confirm('Biztosan törölni szeretnéd a böngésződben tárolt tesztadatokat és visszaállítani a tároló alapállapotát?')) {
        localStorage.removeItem('wintertray_custom_releases');
        window.location.reload();
      }
    });
  }

  async function commitFileToGitHub(token, filePath, content, commitMessage) {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;

    // Létező fájl SHA-jának lekérése
    let sha = null;
    try {
      const getRes = await fetch(url + `?ref=${GITHUB_BRANCH}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (getRes.ok) {
        const fileInfo = await getRes.json();
        sha = fileInfo.sha;
      }
    } catch (e) {
      // Új fájl esetén nem baj ha nincs
    }

    // Base64 kódolás UTF-8 támogatással
    const b64Content = btoa(unescape(encodeURIComponent(content)));

    const bodyData = {
      message: commitMessage,
      content: b64Content,
      branch: GITHUB_BRANCH
    };
    if (sha) {
      bodyData.sha = sha;
    }

    const putRes = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify(bodyData)
    });

    if (!putRes.ok) {
      const errData = await putRes.json().catch(() => ({}));
      throw new Error(errData.message || `HTTP ${putRes.status}`);
    }

    return await putRes.json();
  }

  function generateReleasesJsContent(releases) {
    return `/**
 * =========================================================================
 * WINTERTRAY - KIADÁSI ADATOK ÉS VERZIÓTÖRTÉNET (RELEASES CONFIG)
 * =========================================================================
 * Frissítve a WinterTray Adminisztrációs Központból: ${new Date().toISOString()}
 */

window.WINTERTRAY_RELEASES = ${JSON.stringify(releases, null, 2)};
`;
  }

  function downloadFile(content, fileName, contentType) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /* =========================================================================
   * 9. BEÁLLÍTÁSOK
   * ========================================================================= */

  function initSettingsEvents() {
    const btnSavePin = document.getElementById('btn-save-pin');
    const newPinInput = document.getElementById('new-pin');

    if (btnSavePin && newPinInput) {
      btnSavePin.addEventListener('click', () => {
        const pin = newPinInput.value.trim();
        if (pin.length < 4) {
          alert('A PIN kódnak legalább 4 karakter hosszúnak kell lennie!');
          return;
        }
        localStorage.setItem('wintertray_admin_pin', pin);
        newPinInput.value = '';
        showAdminAlert('Új adminisztrátori PIN kód sikeresen elmentve! 🔒');
      });
    }
  }

  function showAdminAlert(message) {
    alert(message);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

})();
