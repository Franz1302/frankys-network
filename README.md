# Frankys_Stuff Network v1.1

Eine anonymisierte, leicht anpassbare **Code-only-Netzwerkkarte für Home Assistant**.

Sie zeigt zentrale Netzwerkdaten in einer futuristischen HUD-Ansicht. Persönliche
Entity-IDs werden ausschließlich in der Lovelace-Konfiguration eingetragen. Das Paket
enthält **keine privaten IP-Adressen, MAC-Adressen, Zugangsdaten, QR-Dateien oder Videos**.

## Enthalten

- Download und Upload
- DSL-Link Down / Up
- CPU-Temperatur
- Uptime
- Anzahl verbundener Clients
- optionale WLAN-Schalter
- optionale Router-Aktionsbuttons
- optionaler Gast-WLAN-QR aus einer Home-Assistant-Bildentität
- optionale Mesh-Knoten mit Detailansicht
- optionaler eigener Video-Hintergrund
- neutraler CSS-Hintergrund ohne Video
- Demo-/Public-Mode ohne echte Service-Aktionen

Nicht enthalten sind Historienkurven, eigenes WAN-Sampling, ein fertiger Topologie-Sensor
oder ein Hintergrundvideo.

## Voraussetzungen

- Home Assistant
- Zugriff auf `/config/www/`
- passende Sensoren/Entitäten für die gewünschten Funktionen

**Nicht erforderlich:** Browser Mod, Button Card oder HA-LCARS.

## Installation über HACS Custom Repository

Voraussetzung: HACS ist bereits eingerichtet. Vorgesehener Repository-Name: `frankys-network`.
Die Adresse `https://github.com/Franz1302/frankys-network` ist ein **vorgesehenes Ziel, noch nicht veröffentlicht**.
Die folgenden HACS-Schritte funktionieren erst nach Veröffentlichung dieses Ordnerinhalts im öffentlichen Repository.

1. Home Assistant → HACS → oben rechts **⋮ → Benutzerdefinierte Repositories / Custom repositories**.
2. `https://github.com/Franz1302/frankys-network` eintragen.
3. Typ **Dashboard** auswählen (in älteren HACS-Versionen **Lovelace**), dann **Hinzufügen**.
4. Nach **Frankys_Stuff Network** suchen, öffnen und **Herunterladen** wählen; ohne GitHub-Release den Standardbranch verwenden.
5. Browser neu laden. Unter **Einstellungen → Dashboards → ⋮ → Ressourcen** prüfen, ob folgende Ressource vorhanden ist; nur ergänzen, wenn sie fehlt (gegebenenfalls im Profil den erweiterten Modus einschalten):

```yaml
url: /hacsfiles/frankys-network/frankys-network.js
type: module
```

6. Dashboard bearbeiten → Karte hinzufügen → **Manuell**, zum ersten Prüfen ohne Routerzugang:

```yaml
type: custom:frankys-network-card
public_mode: true
mesh:
  - label: Demo Mesh Node
```

7. Für echte Werte `lovelace/Netzwerkkarte.yaml` verwenden und die Platzhalter ausschließlich in der eigenen Dashboard-Konfiguration ersetzen; dazu `public_mode: false` setzen.

Die Karte installiert keine Routerintegration und erzeugt keine Sensoren. Fehlende Router-Zugangsdaten verhindern die Demo nicht; echte Werte benötigen passende bestehende Entitäten. Ein visueller Konfigurationseditor ist nicht enthalten.

### Manuelle Installation ohne GitHub

`frankys-network.js` nach `/config/www/frankys_stuff/network/frankys-network.js` kopieren und als JavaScript-Modul `/local/frankys_stuff/network/frankys-network.js?v=1.1` registrieren. Danach die Demo-Karte von oben hinzufügen.
Nur eine Variante der Ressource laden: bei Wechsel zu HACS den bisherigen manuellen Ressourceneintrag ersetzen, damit nicht die alte Datei zuerst registriert wird.

### Rückweg

Vor einer bestehenden Installation die bisherige JS-Datei, Ressourcenadresse und Karten-YAML sichern. Zum Rückwechsel die bisherige Ressource und Datei wiederherstellen und den Browser neu laden; bei einer Erstinstallation Karte und Ressourceneintrag entfernen und den Download in HACS entfernen. Die Karte ändert selbst keine Home-Assistant-Konfigurationsdateien.

### Veröffentlichung dieses Pakets

Den **Inhalt** dieses Ordners direkt in das Root eines öffentlichen Repositorys `Franz1302/frankys-network` übertragen, nicht den übergeordneten Ordner oder die ZIP selbst. Beschreibung: `Configurable Home Assistant network dashboard card`; passende Topics: `home-assistant`, `hacs`, `lovelace`, `custom-card`.
Ein GitHub-Release ist optional; ohne Release verwendet HACS den Standardbranch. Die vorhandene PolyForm-Noncommercial-Lizenz bleibt unverändert.

Offizielle Dokumentation: [HACS Custom Repositories](https://www.hacs.xyz/docs/faq/custom_repositories/), [Dashboard-Struktur](https://www.hacs.xyz/docs/publish/plugin/), [hacs.json](https://www.hacs.xyz/docs/publish/start/).

## USER CONFIG

Beispiel:

```yaml
entities:
  download: sensor.DEIN_DOWNLOAD
  upload: sensor.DEIN_UPLOAD
  dsl_down: sensor.DEIN_DSL_DOWNLOAD
  dsl_up: sensor.DEIN_DSL_UPLOAD
  cpu_temp: sensor.DEINE_CPU_TEMPERATUR
  uptime: sensor.DEINE_UPTIME
  clients: sensor.DEINE_CLIENT_ANZAHL
  connection: binary_sensor.DEINE_INTERNET_VERBINDUNG
  guest_qr: image.DEIN_GAST_WLAN_QR
  topology: sensor.DEINE_MESH_TOPOLOGIE
```

## Einheiten

Für Download/Upload:

```yaml
throughput_unit: kB/s
```

Mögliche Werte: `kB/s`, `kbit/s`, `Mbit/s`.

Für DSL-Link:

```yaml
dsl_unit: kbit/s
```

Mögliche Werte: `kbit/s`, `Mbit/s`.

## Uptime

Startzeitpunkt:

```yaml
uptime_mode: start_time
```

Numerische Laufzeit:

```yaml
uptime_mode: duration
uptime_unit: seconds
```

Mögliche Einheiten: `seconds`, `minutes`, `hours`, `days`.

## WLAN-Schalter

```yaml
wifi:
  - label: Wi-Fi 2,4 GHz
    entity: switch.DEIN_WLAN_24
  - label: Wi-Fi 5 GHz
    entity: switch.DEIN_WLAN_5
```

Die Karte verwendet dafür `switch.turn_on` und `switch.turn_off`.

## Aktionsbuttons

```yaml
actions:
  - label: Router neu starten
    description: Router neu starten
    icon: mdi:power
    entity: button.DEIN_ROUTER_NEUSTART
    danger: true
    confirm: Router wirklich neu starten?
```

Die Karte verwendet `button.press`. Für kritische Aktionen empfiehlt sich `confirm:`.

## Gast-WLAN QR

`entities.guest_qr` muss eine Bildentität mit `attributes.entity_picture` liefern. Ist die
Quelle nicht verfügbar, wird ein zuvor angezeigter QR entfernt.

## Mesh

Mesh ist **optional**. `entities.topology` muss ein Attribut `mesh_nodes` liefern, zum Beispiel:

```yaml
mesh_nodes:
  - name: Beispielknoten
    model: Beispielgerät
    firmware: 1.0.0
    parent_link_state: CONNECTED
    parent_link_type: WLAN
    parent_cur_rx_kbps: 300000
    parent_cur_tx_kbps: 240000
    clients:
      - connection_state: CONNECTED
```

`mesh[].topology_name` muss exakt zum jeweiligen `name` passen.

Ein Klick auf einen Mesh-Knoten zeigt Status, Verbindungstyp, RX/TX-Linkrate,
Client-Anzahl und Firmware.

Die Karte erzeugt diesen Topologie-Sensor **nicht selbst**. Wer keinen passenden Sensor hat,
entfernt `entities.topology` und den gesamten `mesh:`-Block.

## Hintergrund

Ein eigenes MP4-Video ist optional:

```yaml
background: /local/mein-netzwerk-loop.mp4
```

Ohne `background:` wird ein neutraler CSS-Hintergrund verwendet.

## Demo-Modus

```yaml
public_mode: true
```

Im Demo-Modus werden Beispielwerte angezeigt und WLAN-/Button-Aktionen nicht ausgeführt.

## Datenschutz

Dieses Share-Paket enthält keine persönlichen Netzwerkdaten des Autors. Vor dem öffentlichen
Posten eigener Screenshots trotzdem prüfen, ob echte Client-Namen, QR-Codes, IP-Adressen oder
andere private Informationen sichtbar sind.

## Paketprüfung und Grenzen

Der JavaScript-Code ist bytegleich zur hochgeladenen v1.1-SHARE-Datei. HACS-Metadaten, Ressourcenbeispiel und Demo wurden ergänzt. Syntax, YAML, Registrierung, Demo-Aktionssperre, Service-Ziele, Uptime und QR-Fallback wurden lokal geprüft; siehe `BUILD_CHECKS.json` (historischer Prüfbericht vor der Veröffentlichung; die dortigen GitHub-Statusfelder beschreiben den damaligen Stand).
Es fand keine Installation oder Prüfung in einer echten Home-Assistant-/HACS-Instanz statt. Eine Mindestversion wird ohne entsprechenden Kompatibilitätstest nicht behauptet.
Die Uhr aktualisiert sich bei Home-Assistant-Zustandsupdates; es gibt keinen eigenen Uhr-Timer. Für schmale Mobilansichten ist die großflächige Karte nur eingeschränkt geeignet.

Das zusätzlich auf ZIP-Wurzelebene enthaltene `JARVIS_Netzwerk_Loop_Crossfade.mp4` gehört laut ursprünglicher Dokumentation nicht zum Code-Paket und wird hier nicht weitergegeben. Der neutrale Hintergrund funktioniert ohne Video; ein eigener lokaler Hintergrund bleibt konfigurierbar.
Die öffentliche Dateiauswahl enthält nur Karten-Code, Lizenz, Dokumentation, generische Beispiele, HACS-Metadaten und Prüfdateien. Copyright-Name und Lizenzhinweise bleiben erhalten; persönliche HA-Konfigurationen wurden nicht ausgelesen oder geändert.

## Lizenz

Eigener Code, Konfiguration und Dokumentation in diesem Paket stehen unter der
**PolyForm Noncommercial License 1.0.0**.

Nichtkommerzielle Nutzung, Änderung und Weitergabe sind im Rahmen dieser Lizenz erlaubt.
Eine kommerzielle Nutzung wird durch dieses Paket nicht eingeräumt.

Siehe `LICENSE.md`.

**Required Notice: Copyright © 2026 Franz Schwenninger**

## Drittanbieter

Home Assistant und Material Design Icons werden nur als externe Laufzeitumgebung bzw.
Iconquelle verwendet und nicht als Bestandteil dieses Pakets mitgeliefert.

Details: `THIRD_PARTY_NOTICES.md`.

Frankys_Stuff Network ist ein unabhängiges Community-Projekt und keine offizielle
Erweiterung oder Veröffentlichung der genannten Drittanbieter.
