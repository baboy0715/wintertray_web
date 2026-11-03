# ❄️ WinterTray — Hivatalos Weboldal és Letöltőközpont

> Prémium, modern, letisztult és látványos bemutató- és letöltő weboldal a **WinterTray** nevű Windows 11 asztali alkalmazáshoz.

A weboldal 100%-ban statikus, zéró külső szerverfüggőséggel bíró, villámgyors megoldás, amely **Cloudflare Pages** és **GitHub Pages** környezetben azonnal publikálható közvetlenül ebből a tárolóból (`https://github.com/baboy0715/wintertray_web.git`).

---

## 🌟 Főbb Jellemzők

- **Éjféli téli design (Glassmorphism & Windows 11 Mica stílus):** Mélykék és sötétlila háttér, finom jégkristályos akcentusok, üveghatású kártyák és Windows 11 stílusú lekerekítések.
- **Interaktív 60 FPS HTML5 Canvas hóhullás motor (`snow.js`):**
  - 3 mélységi réteg (Parallax mélységérzet kristályos hópelyhekkel).
  - Dinamikus turbulencia és szélörvények.
  - Egérkurzor kitérés és egérsöprési fizika.
  - Alul finoman megülő hótakaró (procedurális hullámzással).
  - Page Visibility API integráció: a háttérbe küldött lapon automatikusan szünetel a processzorhasználat minimalizálásáért.
- **Interaktív Windows 11 Mockup és Hó-Játszótér:**
  - Valósághű ablakkeret interaktív jégcsapokkal (kattintásra hózáport robbant).
  - Működő Fluent csúszkák és kapcsolók, amelyek közvetlenül vezérlik az oldalon hulló hó sűrűségét és szélirányát.
- **Dinamikus és könnyen frissíthető Verziótörténet (`releases.js` / `releases.json`):**
  - Ha új verziót (pl. v1.1 vagy v2.0) adsz ki, **csak a `releases.js` fájlhoz kell hozzáadnod pár sort**, és a weboldal **automatikusan frissíti**:
    - A Hero szekció nagy letöltőgombját (verziószám, fájlméret, közvetlen letöltési link).
    - A másodlagos hordozható verzió linkjét és méretét.
    - A teljes idővonalas Kiadások (Changelog) listát kategóriákkal, újdonságokkal és SHA-256 ellenőrzőösszeggel.

---

## 🛠️ Vizuális Admin Felület (Admin Dashboard)

Az oldal rendelkezik egy beépített, modern **Adminisztrációs Vezérlőpulttal** (`admin.html`), ahol kódolás nélkül, grafikus felületen tölthetsz fel új verziókat:

- **Elérés:** Nyisd meg az `admin.html`-t vagy nyomd le a főoldalon a **`Ctrl + Shift + A`** billentyűkombinációt.
- **Alapértelmezett PIN kód:** `winter2026` (a Beállítások fülön bármikor módosítható).
- **Fő funkciók az Adminban:**
  - 📂 **Drag & Drop Fájlfeltöltő:** Egyszerűen húzd be a gépedről a `WinterTray-Setup.exe` fájlt; a böngésző a Web Crypto API segítségével **másodpercek alatt kiszámolja a pontos fájlméretet és az ellenőrzött SHA-256 hash-t**!
  - 🛡️ **Zéró 404 letöltési hiba:** A telepítők közvetlenül a `./downloads/` mappából szolgálódnak ki a Cloudflare Pages globális CDN hálózatán keresztül.
  - 🚀 **1 Kattintásos GitHub Publikálás:** Ha megadod a GitHub Token-edet, egyetlen gombnyomásra commitolja az új kiadást a repóba, és a Cloudflare Pages azonnal frissíti a weboldalt az egész világon!
  - 💾 **Export / Helyi letöltés:** Letöltheted a frissített `releases.js` és `releases.json` fájlokat manuális commit-hoz is.

---

## 🚀 Hogyan adj hozzá új verziót (Release frissítés 1 perc alatt)

Nyisd meg a `releases.js` (és tetszés szerint a `releases.json`) fájlt, és másold be a legfelső elem elé az új kiadást:

```javascript
window.WINTERTRAY_RELEASES = [
  {
    version: "v1.1.0",
    releaseDate: "2026-12-05",
    isLatest: true,          // <--- Állítsd true-ra a legfrissebb verziónál!
    isFeatured: true,
    badge: "Legfrissebb Stabil Kiadás",
    downloadUrl: "https://github.com/baboy0715/wintertray_web/releases/download/v1.1.0/WinterTray-Setup.exe",
    portableUrl: "https://github.com/baboy0715/wintertray_web/releases/download/v1.1.0/WinterTray-Portable.zip",
    fileSize: "19.1 MB",
    portableSize: "14.8 MB",
    sha256: "ide-jöhet-az-új-sha256-hash",
    highlights: [
      "Új téli aurora háttérkép effektus.",
      "Optimalizált hóolvadási sebesség melegedő ablakok esetén."
    ],
    changelog: [
      {
        category: "Új funkciók",
        items: [
          "Egyéni színű hópelyhek és aurora háttérvilágítás opció",
          "Továbbfejlesztett többmonitoros kurzorkövetés"
        ]
      }
    ]
  },
  // ... a korábbi verzióknál az "isLatest" legyen false
];
```

Mentés után a weboldal azonnal az új verziót fogja mutatni és ajánlani a látogatóknak!

---

## 📁 Fájlszerkezet

```
wintertray_web/
├── index.html       # Szemantikus, SEO-optimalizált, reszponzív HTML5 váz
├── style.css        # Windows 11 Fluent 2 / Mica stíluslap, animációk, glassmorphism
├── snow.js          # 60 FPS HTML5 Canvas hóhullás fizikai motor
├── releases.js      # Verziók és Changelog konfiguráció (offline/CORS-biztos)
├── releases.json    # Standard JSON formátumú verzióadatbázis
├── app.js           # Dinamikus UI építő, eseménykezelők, vágólapkezelő
├── LICENSE          # MIT Licenc
└── README.md        # Projekt dokumentáció
```

---

## ☁️ Publikálás Cloudflare Pages-re

1. Menj a [Cloudflare Dashboard](https://dash.cloudflare.com/) felületére.
2. Válaszd a **Workers & Pages** > **Create application** > **Pages** menüpontot.
3. Csatlakoztasd a GitHub fiókodat és válaszd ki a `wintertray_web` repót.
4. Telepítési beállítások:
   - **Framework preset:** `None` (statikus HTML)
   - **Build command:** *(üresen hagyható)*
   - **Build output directory:** `.` (vagy `/`)
5. Kattints a **Save and Deploy** gombra. Néhány másodperc múlva a weboldal él és elérhető a világ bármely pontjáról egyéni domainnel és automatikus HTTPS-sel!

---

## 📄 Licenc

Ez a projekt nyílt forráskódú és az **MIT Licenc** feltételei szerint használható.
