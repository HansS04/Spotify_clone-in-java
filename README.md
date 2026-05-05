Spotify Clone — Java Spring backend + React frontend

Přehled projektu
Aplikace slouží jako demonstrační hudební systém: backend v Javě (Spring Boot) poskytuje REST API a persistenční vrstvu pomocí JPA; frontend je v React (Vite). Podporovány jsou nahrávání audio souborů, avatarů a coverů, streaming s podporou HTTP Range, asynchronní zpracování uploadů a základní uživatelská správa.

Spuštění
1) Rychlé spuštění z kořenového adresáře:
   make start
   (Makefile provede sestavení backendu i frontendu a spustí oba procesy.)
2) Manuální:
   mvn clean package
   mvn spring-boot:run
   cd frontend && npm install && npm run dev
3) Přístupné URL:
   - Aplikace: http://localhost:5173
   - API: http://localhost:8080
   - Swagger UI: http://localhost:8080/swagger-ui.html
   - OpenAPI JSON: http://localhost:8080/v3/api-docs
   - H2 konzole: http://localhost:8080/h2-console (JDBC: jdbc:h2:mem:spotifydb)

Hlavní API (přehled)
- POST /api/auth/register — registrace (form-data: username,password,role,profileImage,coverImage)
- POST /api/auth/login — přihlášení (JSON {username,password})
- GET /api/artists, GET /api/albums, GET /api/songs — vrací metadata (bez audio dat)
- POST /api/songs/upload — multipart: title, volitelně albumId, volitelně username, genre, file (vrací 202 Accepted, zpracování asynchronně)
- GET /api/songs/{id}/play — stream audio (podpora Range), odpověď obsahuje metadata v hlavičkách (X-Album-Name, X-Artist-Name, X-Owner-Username)
- POST /api/songs/{id}/cover — nahrání coveru písně
- POST /api/songs/{id}/update — úprava metadat písně
- Playlisty: /api/playlists/* (vytvoření, přidání skladby atd.)

Architektura a návrhová rozhodnutí
- Oddělení metadat a streamu: seznamy písní vrací DTO (SongDTO) bez audio byte[]; audio je dostupné pouze přes streamovací endpoint. Tím se minimalizuje přenos dat a zvyšuje bezpečnost.
- Asynchronní zpracování: nahrávání audio souborů je delegováno do asynchronního executor poolu, aby HTTP požadavky byly rychlé a zpracování probíhalo na pozadí.
- Streaming: endpoint podporuje HTTP Range, proto funguje seek a resume v prohlížeči.

Struktura projektu — backend (stručný popis souborů)
- pom.xml — konfigurace Maven (závislosti: Spring Boot, springdoc-openapi, Log4j2, H2, lombok, jaudiotagger, hibernate-validator).
- Makefile — build a start skripty (spuštění backendu a frontendu, správCdrq0811.2VSB
- a PID, uvolnění portu 8080).
- src/main/resources/application.properties — konfigurace serveru, HikariCP, limity nahrávek, H2 konzole.
- src/main/resources/log4j2-spring.xml — konfigurace logování (konzole + rotující soubor).

Zdrojový kód (hlavní balíček: src/main/java/cz/vsb/spotify_clone)
- SpotifyCloneApplication.java — hlavní spouštěcí třída.
- config/AsyncConfig.java — konfigurace asynchronního executor poolu.
- controller/AuthController.java — registrace, přihlášení, update profilu, správa avatarů.
- controller/SpotifyController.java — hlavní operace nad artists/albums/songs (metadata, vytvoření alba, delegace uploadu, streamování).
- controller/AlbumController.java — tvorba a úprava alb, získání vlastních alb.
- controller/PlaylistController.java — správa playlistů (vytvoření, přidání skladeb, cover playlistu).
- controller/SongController.java — upload/get coveru písně, aktualizace metadat, výpis písní uživatele.
- service/MusicService.java — obchodní logika, mapování na SongDTO, asynchronní zpracování nahraných souborů (výpočet délky, uložení bytu zvuku, přiřazení owner/album).
- DataLoader.java — volitelný initializer testovacích dat.

Repositories
- repository/* — Spring Data JPA repozitáře (ArtistRepository, AlbumRepository, SongRepository, PlaylistRepository, UserRepository). SongRepository obsahuje hledání a metody pro nejnovější položky i výpis podle owner.

Entity
- AudioContent — společná báze pro audio položky (id, title, duration).
- Song — rozšíření AudioContent; obsahuje album, owner (User), audioData (LOB), contentType, coverImage (LOB), imageContentType, genre.
- Album — název, rok vydání, vztah na Artist, coverImage, backgroundColor.
- Artist — jméno, seznam alb, obrázky profilu a cover.
- Playlist — owner (User), seznam skladeb (M:N), cover.
- User — uživatel (username, password je označeno @JsonIgnore), role, avatar.

DTO
- SongDTO — metadata zasílaná frontendu (id, title, duration, genre, contentType, album/artist identifikátory a názvy, ownerUsername, coverUrl, streamUrl).

Frontend (frontend/)
- package.json — závislosti a skripty (Vite).
- src/main.jsx — vstupní bod aplikace.
- src/App.jsx — hlavní kontejner, správa stavu aplikace (uživatel, currentSong, isPlaying, playlists, apod.).
- src/BottomPlayer.jsx — persistentní přehrávač; před přehráním načte krátký Range, získá metadata z hlaviček a následně použije streamovací endpoint pro audio.
- src/SongUpload.jsx — formulář pro nahrání písně; podporuje nahrání i bez alba a předání username pro přiřazení ownera.
- src/SongList.jsx, src/ArtistProfile.jsx — komponenty používají SongDTO, zobrazují cover písně (pokud existuje) a umožňují editaci vlastní písně (inline) a nahrání coveru.
- ostatní komponenty: AlbumDetail, AlbumEdit, PlaylistCreate, PlaylistDetail, Register, Login, Search, AddToPlaylistModal.

Bezpečnost a provozní poznámky
- Hesla jsou ukládána pomocí BCrypt.
- API listuje pouze metadata; audio byty jsou přístupné pouze přes streamovací endpoint.
- Pro produkční použití doporučeno: přidat JWT nebo session-based autorizaci, server-side ověření vlastnictví před úpravou/odstraněním, a ukládat audio soubory v externím úložišti (disk/objektové úložiště) místo DB BLOB pro lepší škálovatelnost.

Logování a ladění
- Logy backendu: logs/app.log (rotující) a backend.log (Makefile). Frontend: frontend.log.
- Pokud je port 8080 obsazený, Makefile provede příkaz sudo fuser -k 8080/tcp před startem.

Nasazení
- Pro jednodušší správu procesů doporučeno buildnout JAR a spouštět přes java -jar target/*.jar (v Makefile je aktuálně spuštění přes mvn spring-boot:run).

Kontakt pro nasazení
V případě nasazení na server zajistit Java 25 (nebo verzi uvedenou v pom.xml), Maven, Node.js a nastavit environment proměnné podle potřeby (např. server.port, DB URL při přechodu na persistenci).
