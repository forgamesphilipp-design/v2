# Architecture (SwissOrient v2)

Ziel: Saubere, skalierbare Vite+React App, die man versteht und leicht erweitern kann.
Dieses Dokument ist die “Freeze”-Basis: Wir ändern die Architektur nur noch bewusst.

## Layer
### `src/app/`
- Composition Root: Router, Layout-Wiring, Repositories wiring, Config.
- Keine Business-Logik hier – nur “zusammenstecken”.

### `src/features/`
- User-Flows / Screens / Use-Cases (z.B. Explore, Quiz, Navigation).
- Darf Entities benutzen.
- Darf Repositories nur über `app/repositories` ansprechen (nicht direkt importieren von infra).

### `src/entities/`
- Domain-Model + Domain-Interfaces.
- “Dumb” Types + pure helpers.
- Repository Interfaces liegen hier (z.B. `entities/moments/repository.ts`).

### `src/shared/`
- Wiederverwendbare UI + helpers ohne Domain-Wissen.

## Regeln (wichtig)
1) **Kein `fetch` / Cloud SDK in Screens**  
   → Datenzugriff nur über Repositories.

2) **Entities sind stabil**  
   → Entities enthalten keine React-Komponenten.

3) **Features sind austauschbar**  
   → Alles Feature-spezifische bleibt in `features/<name>/...`.

4) **Demos/Placeholders müssen abschaltbar sein**  
   → über `app/config.ts` Feature Flags.

## Moments (Status)
- Aktuell: `MomentsRepositoryMemory`
- Später: `MomentsRepositoryCloud` (z.B. Supabase/Firebase)
- UI bleibt gleich, nur Repository-Implementierung wird ausgetauscht.

## Geo Navigation (Status)
- Geo Tree + `useGeoNavigation` funktioniert minimal.
- Map/GPS kommt später; aktuelle Map ist ein Placeholder.

## Definition of Done (Freeze)
- Die Folder-Struktur bleibt so.
- Neue Features kommen als neue Feature-Ordner.
- Cloud/Kamera/Map werden als Feature-Implementierungen ergänzt, nicht als Umbau der Basis.
