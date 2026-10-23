# Changelog

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
