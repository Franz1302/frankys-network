# Changelog

## v1.3.1
- Zusätzliche Speedport-Clients können als freie Netzwerkknoten (`mesh[].kind: device`, `mesh[].client_name`) mit ihren verfügbaren IP-/MAC-Details erscheinen.
- Bei allgemeinen Geräten wird keine irreführende Repeater-Clientzuordnung behauptet; die bisherigen Repeater-Popups bleiben unverändert.
- Optionaler `status_mode: router` unterstützt Routerstatus `OK` und zeigt "Router OK" statt eines ungesicherten Gesamtstatus.
- Ohne diese Optionen bleiben vorhandene Konfigurationen kompatibel; keine privaten Gerätedaten veröffentlicht.

## v1.3.0
- Optional konfigurierbare drei HUDs: DSL-Link → LTE-/Hybrid-Tunnelstatus, CPU → LTE-dBm, Laufzeit → 5G-dBm.
- Anpassbare Labels und Symbole; Signalsensoren auch als Quelle für Verlaufskurven.
- Nicht konfigurierte HUDs, Demo-Modus und bestehende Karten bleiben kompatibel; keine Routerfunktionen werden ausgelöst.
- Erweiterung rein clientseitig, ohne private Entity-IDs im veröffentlichten Repository.

## v1.2.5
- Repeater-Dialog zeigt IPv4-Adresse und MAC-Adresse aus dem vorhandenen Speedport-`devices`-Attribut; keine neuen Integrationen oder Zugangsdaten nötig.
- Gerätetyp und Statusquelle gekennzeichnet; bei fehlenden Geräten bleiben IP/MAC unbekannt, keine erfundene Firmware.
- Clientzuordnung pro Verstärker weiterhin nicht verfügbar; Routerdetails und übrige Karte unverändert.

## v1.2.4
- Transparente Klickfläche über den grafischen Netzwerkgeräten erweitert, sodass auch das Gerätebild das Popup öffnet.
- Router-Popup zeigt die namentlich vorhandenen Clients des `entities.clients`-Sensors scrollbar und dedupliziert; die Gesamtzahl bleibt separat ausgewiesen.
- Echte Mesh-Knotendaten können weiterhin zugehörige Clients im Popup anzeigen.
- TP-Link-/gewöhnliche Verstärker zeigen ohne übermittelte Zuordnung ausdrücklich, dass Speedport keine Clients pro Verstärker bereitstellt; es werden keine Verbindungen erfunden.
- CSS und Funktionsprüfung mit Beispielgeräten durchgeführt; echter Browser-Test folgt.

## v1.2.3
- Gewöhnliche WLAN-Verstärker können über `mesh[].client_name` anhand ihres Namens in `entities.clients.attributes.devices` zugeordnet werden.
- Status wird bei vorhandener Quelle als "In Speedport-Clientliste" dargestellt; fehlender Name oder ausgefallene Datenquelle bedeutet "unbekannt", nicht automatisch offline.
- Details zeigen Status und optionalen Gerätetyp; Mesh-RX/TX-Raten werden nicht erfunden.
- Bestehende Router-, WLAN- und Client-Funktionen bleiben erhalten.

## v1.2.2
- Optional `mesh[].kind: router` erzeugt ein eigenes Router-Detailfenster mit Routerstatus, Echtzeit-Download/Upload, verbundenen Geräten und konfigurierbarer Firmware
- `mesh[].entity` kann nun den Routerstatus `OK` aus HA auswerten; physische WLAN-Verstärker benötigen für eigene Daten passende Entitäten
- Keine fiktiven Mesh-Linkraten oder Firmware-Daten; ohne Sensor wird `Keine Datenquelle` angezeigt
- Bestehendes v1.2.1-Layout und automatischer Clientimport unverändert

## v1.2.1
- Clientliste liest automatisch `devices` aus `entities.clients` und zeigt bis zu 100 Geräte scrollbar an
- Manuelle Clientliste und Demo bleiben unverändert; unbekannte Router-Typcodes werden nicht interpretiert
- Keine privaten Gerätenamen, IP- oder MAC-Adressen im Kartenquellcode

## v1.2
- Vollständige acht HUDs mit Verlaufskurven, WLAN, QR, Routeraktionen, Clientliste, sieben Mesh-Positionen und Dialogen
- Speedport-Vorlage mit leeren Sensorzuordnungen; keine FRITZ!Box-Abhängigkeit
- Demo-Modus für Funktionstest ohne Router-Zugang
- Originalvideo über bestehenden `/local/`-Pfad; MP4 separat von HACS
- Noch kein Live-Test auf Steves Home Assistant

## v1.1
- Erste anonymisierte Share-Karte
