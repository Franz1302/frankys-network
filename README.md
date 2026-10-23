# Frankys_Stuff Network v1.2.5 — Steve / Speedport Smart 4

**v1.2.1 – Netzwerkkarte mit automatischer Clientliste** mit 8 oberen HUDs, Sparkline-Verläufen, WLAN, Gast-WLAN-QR, Routeraktionen, Clientliste, 7 Mesh-Geräten, Detaildialogen und Video-Hintergrund.

## Bereits jetzt

1. In Steves HACS **Frankys_Stuff Network → Erneut herunterladen** (Branch `main`).
2. Browser hart neu laden (`Strg+F5`).
3. Dashboard-Karte mit `lovelace/Steve-Speedport.yaml` ersetzen. `public_mode: true` zeigt 8 Demohuds ohne Routerzugang.
5. Die MP4 liegt bei Steve bereits unter `/config/www/JARVIS_Netzwerk_Loop_Crossfade.mp4`. Die Beispiel-YAML verweist auf `/local/JARVIS_Netzwerk_Loop_Crossfade.mp4`.

## Sobald Speedport verbunden ist

1. Einstellungen → Geräte & Dienste → Speedport → verfügbare Entitäten anzeigen.
2. Vorhandene Entity-IDs **nur in** `entities`, `wifi[].entity`, `actions[].entity`, `mesh[].topology_name` bzw. `mesh[].entity` und `clients[]` eintragen.
3. `public_mode: false` setzen. Nicht unterstützte Sensorfelder (z. B. CPU, kumuliertes Datenvolumen) leer lassen; HUD zeigt dann `—`.
4. Die Speedport-Integration muss einen Topologie-Sensor mit `attributes.mesh_nodes` liefern, damit alle Linkraten/Mesh-Details automatisch befüllt werden. Sonst können einzelne Mesh-Tracker zugeordnet werden, aber fehlende Linkdaten werden nicht erfunden.

## Erweiterte Repeater-Details (v1.2.5)

Bei `mesh[].client_name` zeigt das Popup neben Status und manuell bezeichnetem Gerätetyp die **IPv4-Adresse**, **MAC-Adresse** und **Erkennungsquelle** automatisch aus `entities.clients.attributes.devices`. Nur lokal aus Home Assistant gelesene Werte erscheinen; es werden keine privaten Adressen im GitHub-Code gespeichert. Falls die Gerätedaten fehlen, stehen die entsprechenden Felder auf `—`. Firmware und Clientzuordnung pro Verstärker sind damit nicht verfügbar.

## Klickflächen und Client-Popups (v1.2.4)

Klicks auf die gerenderten Gerätebereiche (auch oberhalb der Textbeschriftung) öffnen das zugehörige Detailfenster. Beim Router-Knoten (`kind: router`) listet das Popup unter den sechs Messfeldern alle verfügbaren Gerätenamen aus `entities.clients.attributes.devices` als scrollbare Liste auf und unterscheidet diese Liste von der Gesamtzahl des Sensors.

Normale WLAN-Verstärker (z. B. über `client_name` eingebunden) sind nur als Gerät in der Speedport-Clientliste nachweisbar. Die Speedport-Integration stellt **keine Client→Verstärker-Zuordnung** bereit. Das Popup weist darauf hin; es erfindet keine Geräteverbindungen. Falls eine Integration tatsächlich `mesh_nodes[].clients` zur Verfügung stellt, werden die betreffenden Clients wie bisher knotenspezifisch angezeigt.

## Normale WLAN-Verstärker via Speedport (v1.2.3)

Wenn die Speedport-Integration die verbundenen Geräte im Attribut `devices` des unter `entities.clients` eingetragenen Sensors liefert, lassen sich einzelne Verstärker per `client_name` einblenden, auch ohne eigenen `device_tracker`:

```yaml
mesh:
  - label: WLAN-Verstärker 1
    client_name: "NAME_AUS_DER_SPEEDPORT_CLIENTLISTE"
    model: "WLAN-Verstärker"
    connection_label: "WLAN (Geräteklasse, manuell)"
```

Die Zuordnung erfolgt nur über den exakten Namen, ohne Beachtung von Groß-/Kleinschreibung. Wenn ein Client aktuell in der Speedport-Liste vorhanden ist, erhält er einen grünen Status. Fehlt der Name, bleibt der Status unbekannt, da die Geräteliste möglicherweise unvollständig ist. Es werden keine WLAN-Linkraten, Firmware-Versionen oder Clientzahlen für die Repeater erfunden.

## Router ohne Mesh-Topologie (v1.2.2)

Normale WLAN-Verstärker bilden nicht zwingend ein von Home Assistant auslesbares Mesh. Deshalb kann ein Overlay-Knoten optional als Router konfiguriert werden:

```yaml
mesh:
  - label: Router
    kind: router
    entity: sensor.DEIN_ROUTER_STATUS
    model: Routermodell
    connection_label: "Mobilfunk / Hybrid (manuelle Angabe)"
    firmware: "Firmware-Version (manuelle Angabe)"
  - label: WLAN-Verstärker
    entity: device_tracker.DEIN_VERSTAERKER
```

Der Router-Dialog verwendet dabei automatisch die vorhandenen `entities.download`, `entities.upload` und `entities.clients` für **Live-Download**, **Live-Upload** und **Gerätezahl**; `mesh[].entity` liefert den Routerstatus. `connection_label` und `firmware` sind manuelle Beschriftungen und werden **nicht automatisch aktualisiert**. Bei normalen Verstärkern ist eine HA-Entität optional; ohne eigene Datenquelle bleibt der Zustand unbekannt. Internetdurchsatz ist keine Mesh-Linkgeschwindigkeit. Andere HUDs bleiben unverändert.

## Automatische Clientliste

Bei `clients: []` und einem über `entities.clients` konfigurierten Zählsensor mit Attribut `devices` listet die Karte automatisch bis zu 100 verbundene Geräte nach Namen auf. Die Liste ist scrollbar und sortiert; Typcodes werden nicht als LAN oder WLAN geraten. Die Gesamtzahl im HUD kann von der Anzahl der im Attribut enthaltenen Geräte abweichen. Für Steves Installation ist keine Änderung an der bestehenden Karten-YAML nötig.

## Einheiten

Die Datenrate erkennt übliche `unit_of_measurement`-Werte (`kB/s`, `kbit/s`, `Mbit/s` usw.). Bei Bedarf `throughput_unit` bzw. `dsl_unit` statt `auto` explizit setzen. Datentotale über `volume_unit` (GB/TB/MB/Byte). `uptime_mode` kennt `start_time` und `duration` plus `uptime_unit`.

## Grenzen und Sicherheit

- Keine Routeraktion im Demo-Modus; ohne konfigurierte Aktionsentität wird nichts ausgelöst.
- Zugriff auf historische Sensorwerte ist optional. Verlaufskurven zeigen mit laufender Messung allmählich mehr Daten.
- Ohne Speedport-Passwort keine echten Routerdaten; die Integration muss erst verbunden werden.
- Das Originalvideo ist nicht im kleinen Updatepaket enthalten, ist aber bereits auf Steves HA installiert.
- Bisheriger funktionierender v1.1-Stand bleibt erhalten, bis du v1.2 in GitHub veröffentlichst.
- Enthält keine FRITZ!Box- oder privaten Home-Assistant-Entity-IDs.
- JS-Syntax- und Mock-Funktionstests bestanden; noch **kein** echter Home-Assistant-v1.2-Test.

Copyright © 2026 Franz Schwenninger — PolyForm Noncommercial License 1.0.0.