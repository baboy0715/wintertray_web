/**
 * =========================================================================
 * WINTERTRAY - KIADÁSI ADATOK ÉS VERZIÓTÖRTÉNET (RELEASES CONFIG)
 * =========================================================================
 * 
 * ÚJ VERZIÓ KIADÁSAKOR:
 * 1. Másold le a legfelső objektumot a tömbben.
 * 2. Illeszd be a legelső elemként (index 0).
 * 3. Állítsd be az új verziónál az "isLatest: true" értéket, a korábbinál "isLatest: false".
 * 4. Töltsd ki a verziószámot, dátumot, letöltési linkeket és az újdonságok listáját.
 * 
 * A weboldal automatikusan frissíti a Hero fő letöltőgombját, a verziószámot,
 * a fájlméretet, a hordozható verzió linkjét és a teljes Changelog idővonalat!
 */

window.WINTERTRAY_RELEASES = [
  {
    version: "v1.0.0",
    releaseDate: "2026-11-01",
    isLatest: true,
    isFeatured: true,
    badge: "Legfrissebb Stabil Kiadás",
    downloadUrl: "https://github.com/baboy0715/wintertray_web/releases/download/v1.0.0/WinterTray-Setup.exe",
    portableUrl: "https://github.com/baboy0715/wintertray_web/releases/download/v1.0.0/WinterTray-Portable.zip",
    fileSize: "18.4 MB",
    portableSize: "14.2 MB",
    sha256: "9b1c7a84e3f890c52d4e786b51034f19bcae710d24f0c8e1a7b3c2e1f0a8d9e2",
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
          "Klasszikus Windows telepítő (Silent install kapcsolókkal csendes telepítéshez)",
          "Önálló hordozható (Portable) kiadás, amely regisztrációs adatbázis módosítás nélkül fut"
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
    downloadUrl: "https://github.com/baboy0715/wintertray_web/releases/download/v0.9.5-beta/WinterTray-Setup-v0.9.5.exe",
    portableUrl: "https://github.com/baboy0715/wintertray_web/releases/download/v0.9.5-beta/WinterTray-Portable-v0.9.5.zip",
    fileSize: "17.9 MB",
    portableSize: "13.8 MB",
    sha256: "4a7f21b8c9e0d1f3b5a6c8e7d2f4a1b0c9e8d7f6a5b4c3d2e1f0a9b8c7d6e5f4",
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
