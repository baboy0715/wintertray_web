/**
 * =========================================================================
 * WINTERTRAY - KIADÁSI ADATOK ÉS VERZIÓTÖRTÉNET (RELEASES CONFIG)
 * =========================================================================
 * 
 * TIPP: Használd az új Admin Felületet a kényelmes, vizuális szerkesztéshez!
 * Elérés: admin.html vagy a billentyűzeteden nyomd le: Ctrl + Shift + A
 * 
 * Közvetlen letöltés: a "./downloads/WinterTray-Setup.exe" és "./downloads/WinterTray-Portable.zip"
 * közvetlenül a Cloudflare Pages tárhelyéről szolgálódik ki 404 nélkül!
 */

window.WINTERTRAY_RELEASES = [
  {
    version: "v1.0.0",
    releaseDate: "2026-11-01",
    isLatest: true,
    isFeatured: true,
    badge: "Legfrissebb Stabil Kiadás",
    downloadUrl: "./downloads/WinterTray-Setup.exe",
    githubReleaseUrl: "https://github.com/baboy0715/wintertray_web/releases/download/v1.0.0/WinterTray-Setup.exe",
    portableUrl: "./downloads/WinterTray-Portable.zip",
    githubPortableUrl: "https://github.com/baboy0715/wintertray_web/releases/download/v1.0.0/WinterTray-Portable.zip",
    fileSize: "18.4 MB",
    portableSize: "14.2 MB",
    sha256: "337af21d375c0a629e30e581ed5869810c99177e3f7d88eb440b844972e60ff6",
    highlights: [
      "Első hivatalos nyilvános kiadás Windows 11 és Windows 10 (64-bit) rendszerekre.",
      "Valós idejű, hardveresen gyorsított (DirectX 11) fizikai hóhullás szimuláció.",
      "Ablaktapadás fizika: a hó automatikusan megül a nyitott ablakok felső élén.",
      "Egérrel lesöpörhető porhó és kattintásra leomló/szétrobbanó jégcsapok.",
      "Zéró CPU/GPU terhelés: teljes képernyős játékok vagy programok alatt azonnal szünetel.",
      "Rendszertálca (System Tray) menü gyorskapcsolókkal és finomhangolási beállításokkal."
    ],
    changelog: [
      {
        category: "Új funkciók",
        items: [
          "Fizikai alapú hóhullás szimuláció állítható részecskeszámmal (50 - 2000 pehely)",
          "Ablakkeret-érzékelés a Windows Desktop Window Manager (DWM) API segítségével",
          "Interaktív jégcsapok az ablakok szélein valósághű csöpögő vízcsepp animációval",
          "Dinamikus szélgenerátor és lágy légörvények egérmozgásra reagáló részecskékkel",
          "Rendszertálca gyorsmenü: hóvihar mód, sűrűség- és sebességszabályozás",
          "Többmonitoros konfigurációk automatikus felismerése egyedi DPI skálázással"
        ]
      },
      {
        category: "Teljesítmény & Erőforrás",
        items: [
          "DirectX 11 hardveres renderelő: < 0.8% átlagos CPU használat",
          "Játékos mód (Game Mode): Fullscreen Direct3D/Vulkan alkalmazás esetén 0% terhelés",
          "Snipping Tool / Képmetsző integráció: automatikus elrejtés képernyőmentés közben",
          "Minimális memórialábnyom: mindössze ~24 MB RAM használat a háttérben"
        ]
      },
      {
        category: "Telepítő & Hordozhatóság",
        items: [
          "Közvetlen Cloudflare Pages letöltés: villámgyors globális CDN kiszolgálás",
          "Klasszikus Windows telepítő és önálló hordozható (Portable) kiadás"
        ]
      }
    ]
  },
  {
    version: "v0.9.5-beta",
    releaseDate: "2026-10-18",
    isLatest: false,
    isFeatured: false,
    badge: "Béta Előzetes",
    downloadUrl: "./downloads/WinterTray-Setup.exe",
    githubReleaseUrl: "https://github.com/baboy0715/wintertray_web/releases/download/v0.9.5-beta/WinterTray-Setup-v0.9.5.exe",
    portableUrl: "./downloads/WinterTray-Portable.zip",
    githubPortableUrl: "https://github.com/baboy0715/wintertray_web/releases/download/v0.9.5-beta/WinterTray-Portable-v0.9.5.zip",
    fileSize: "17.9 MB",
    portableSize: "13.8 MB",
    sha256: "de4ab787321fe4acf2bd5ca2bc47f66d6121f2d507ae7dbd69a92535f20fd04e",
    highlights: [
      "Béta tesztverzió az ablakfizikai motor és a DWM rétegek tesztelésére.",
      "Kezdeti Windows 11 lekerekített sarkú ablakok támogatása.",
      "Kísérleti egérsöprési mechanizmus a meggyűlt hóra."
    ],
    changelog: [
      {
        category: "Új funkciók",
        items: [
          "Alapértelmezett hópehely modellek különböző kristályformákkal és méretekkel",
          "Egérkurzor körüli szélörvény tesztelése",
          "Kezdeti beállítások panel a tálcamenüből"
        ]
      },
      {
        category: "Javítások",
        items: [
          "Kijavítva a multi-monitor váltáskor fellépő váratlan pozicionálási hiba",
          "Optimalizált DirectWrite szöveg- és ikonmegjelenítés"
        ]
      }
    ]
  }
];
