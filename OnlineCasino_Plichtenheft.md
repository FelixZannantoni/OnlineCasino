# Pflichtenheft - Online Casino

## 1. Beschreibung der Ausgangslage

Die Ausgangslage basiert auf dem Projektantrag der HTL Leonding (3. Klasse Syp-Projekt). Das Ziel ist die Entwicklung eines Online-Casinos als Software-Projekt, bei dem die Logik von Glücksspielen im Vordergrund steht. Das Thema Glücksspiel ist für das Team spannend und motivierend. 

Aktuell existieren physische Casinos, die jedoch Einschränkungen wie begrenzte Öffnungszeiten, Standortabhängigkeit und manuelle Prozesse aufweisen. Ein Online-Casino bietet Verbesserungspotenziale durch 24/7-Verfügbarkeit, Zugriff von überall und Automatisierung durch Computer.

### Use Case 1: Benutzerregistrierung und Login
**Akteur:** Potenzieller Spieler
**Vorbedingung:** Der Benutzer öffnet die Website des Online-Casinos.
**Beschreibung:**
1. Der Benutzer navigiert zur Registrierungsseite.
2. Er gibt persönliche Daten ein (z.B. E-Mail, Passwort, Alter zur Altersverifikation).
3. Das System validiert die Daten und erstellt ein Konto.
4. Nach Registrierung loggt sich der Benutzer ein.
5. Das System authentifiziert den Benutzer und gewährt Zugriff auf das Dashboard.
**Nachbedingung:** Der Benutzer ist eingeloggt und kann Spiele spielen.
**Ausnahmen:** Ungültige Daten führen zu Fehlermeldungen.

Mockup der Login-Seite:




## 2. Ist-Zustand

Im Ist-Zustand gibt es kein bestehendes Online-Casino-System. Das Projekt startet von Grund auf als Schülerprojekt. Die aktuelle Situation umfasst physische Casinos, die manuell betrieben werden und keine digitale Automatisierung bieten. Es fehlt an einer Plattform, die Glücksspiele wie Slots, Poker, Roulette und Blackjack online zugänglich macht.

Die Teammitglieder haben hohe Motivation, aber begrenzte Erfahrung mit großen Projekten. Potenzielle Risiken sind Zeitdruck, Merge-Konflikte in Git und unübersichtlicher Code.

### Use Case 2: Spielen eines Slot-Spiels
**Akteur:** Eingeloggter Spieler
**Vorbedingung:** Der Benutzer ist eingeloggt und hat Guthaben auf dem Konto.
**Beschreibung:**
1. Der Benutzer wählt das Slot-Spiel aus dem Menü.
2. Er setzt einen Einsatz.  
3. Das System startet den Spin (basierend auf Zufallslogik).
4. Das Ergebnis wird angezeigt, und Gewinne werden dem Konto gutgeschrieben.
5. Der Benutzer kann weiter spielen oder zurückkehren.
**Nachbedingung:** Das Spielergebnis ist verarbeitet, Guthaben aktualisiert.
**Ausnahmen:** Unzureichendes Guthaben verhindert den Start.

Mockup des Hauptmenüs



## 3. Zielsetzung

Die Zielsetzung ist die Entwicklung eines benutzerfreundlichen Online-Casinos mit moderner Benutzeroberfläche. Es sollen verschiedene Spiele implementiert werden: Slots, Poker, Roulette und Blackjack. Das System soll eine Währung (virtuelles Geld) handhaben, Benutzerkonten verwalten und faire Zufallslogik sicherstellen.

Ziele umfassen: Hohe Verfügbarkeit, Automatisierung der Spiele, Sammeln von Projekterfahrungen und potenziell Monetarisierung. Die Umsetzung erfolgt in Meilensteinen: Grundfunktionen bis Ostern, Erweiterungen bis Mai, Fertigstellung bis Juni.

### Use Case 3: Spielen von Tischspielen (z.B. Poker, Roulette, Blackjack)
**Akteur:** Eingeloggter Spieler  
**Vorbedingung:** Der Benutzer hat Guthaben und wählt ein Tischspiel.
**Beschreibung:**  
1. Der Benutzer betritt den virtuellen Tisch (z.B. Poker).
2. Er platziert Einsätze.  
3. Das System simuliert das Spiel (Karten austeilen, Rad drehen etc.) mit Zufallsalgorithmen.
4. Runden werden ausgewertet, Gewinne/Verluste berechnet.
5. Der Benutzer kann Runden wiederholen oder verlassen.
**Nachbedingung:** Spielstand aktualisiert, Guthaben angepasst.
**Ausnahmen:** Verbindungsprobleme führen zu Pausen.

Mockups für Tischspiele:
**Poker-Tisch:**


**Roulette:**


**Blackjack:**