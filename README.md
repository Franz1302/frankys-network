# Frankys_Stuff Network v1.2 — Steve / Speedport Smart 4

**v1.2 – Prüffassung für den ersten HA-Test** mit 8 oberen HUDs, Sparkline-Verläufen, WLAN, Gast-WLAN-QR, Routeraktionen, Clientliste, 7 Mesh-Geräten, Detaildialogen und Video-Hintergrund.

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