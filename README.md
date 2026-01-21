# Pflichtenheft - Online Casino

## Inhaltsverzeichnis

- [1. Ausgangslage](#1-ausgangslage)
  - [1.1. Ist-Situation](#11-ist-situation)
  - [1.2. Verbesserungspotenziale](#12-verbesserungspotenziale)
- [2. Zielsetzung](#2-zielsetzung)
- [3. Funktionale Anforderungen](#3-funktionale-anforderungen)
  - [3.1 Use Case A: Haupmenü](#31-use-case-b-haupmenü)
  - [3.2 Use Case B: Spielen von Blackjack](#32-use-case-b-spielen-von-blackjack)
  - [3.3 Use Case C: Spielen von Poker](#33-use-case-c-spielen-von-poker)

## 1. Ausgangslage

### 1.1. Ist-Situation

- Siehe Projektantrag

### 1.2. Verbesserungspotenziale

- Siehe Projektantrag

## 2. Zielsetzung

- Siehe Projektantrag

## 3. Funktionale Anforderungen

Die Zielsetzung ist die Entwicklung eines benutzerfreundlichen Online-Casinos mit moderner Benutzeroberfläche. Es sollen verschiedene Spiele implementiert werden: Slots, Poker, Roulette und Blackjack. Das System soll eine Währung (virtuelles Geld) handhaben, Benutzerkonten verwalten und faire Zufallslogik sicherstellen.

Ziele umfassen: Hohe Verfügbarkeit, Automatisierung der Spiele, Sammeln von Projekterfahrungen und potenziell Monetarisierung. Die Umsetzung erfolgt in Meilensteinen: Grundfunktionen bis Ostern, Erweiterungen bis Mai, Fertigstellung bis Juni.

![UCD](resources/UCD.png)



### 3.1 Use Case B: Haupmenü
**Akteur:** Eingeloggter Spieler

**Vorbedingung:** Der Benutzer ist eingeloggt und hat Guthaben auf dem Konto.

**Beschreibung:**
1. Der Benutzer öffnet die Anwendung nach dem Login
2. Das System zeigt das Hauptmenü (Dashboard) an
3. Der Benutzer sieht folgende zentrale Elemente:
    1. Aktuelles Guthaben & Bonusinformationen (oben prominent)
    2. Schnellzugriffe / Kategorien (Slots, Live Casino, Tischspiele, Sportwetten, Crash/Turbo-Spiele etc.)
    3. Empfohlene / beliebte Spiele (Carousel oder Grid)
    4. Kontostand und Chat
    
4. Der Benutzer kann per Klick/Tap in einen Spielbereich wechseln oder eine Aktion starten (z. B. Einzahlen, Spiel öffnen)

**Nachbedingung:** Das Spielergebnis ist verarbeitet, Guthaben aktualisiert.

**Ausnahmen:** Keine Internetverbindung → Offline-Hinweis, Session abgelaufen → Rückleitung zum Login

Mockup des Hauptmenüs
![Startmenü](resources/Startmenü.jpeg)



### 3.2 Use Case B: Spielen von Blackjack
**Akteur:** Eingeloggter Spieler

**Vorbedingung:** Der Benutzer hat Guthaben und wählt Blackjack.

**Beschreibung:**
1. Der Benutzer betritt den virtuellen Blackjacktisch
2. Er platziert Einsätze.
3. Das System simuliert das Spiel (Karten austeilen) mit Zufallsalgorithmen.
4. Runden werden ausgewertet, Gewinne/Verluste berechnet.
5. Der Benutzer kann aus der Runde noch eine Kate bekommen, bleiben, verdoppeln und teilen.
**Nachbedingung:** Spielstand aktualisiert, Guthaben angepasst.

**Ausnahmen:** Verbindungsprobleme führen zu Pausen, Unzureichendes Guthaben verhindert den Start.

Mockup des Blackjacktisch
![Pokertisch](resources/Blackjacktisch.jpeg)



### 3.3 Use Case C: Spielen von Poker
**Akteur:** Eingeloggter Spieler

**Vorbedingung:** Der Benutzer hat Guthaben und wählt Poker.

**Beschreibung:**
1. Der Benutzer betritt den virtuellen Pokertisch
2. Er platziert Einsätze.
3. Das System simuliert das Spiel (Karten austeilen) mit Zufallsalgorithmen.
4. Runden werden ausgewertet, Gewinne/Verluste berechnet.
5. Der Benutzer kann aus der Runde aussteigen er kann mitgehen und den Einsatzt erhöhen.

**Nachbedingung:** Spielstand aktualisiert, Guthaben angepasst.

**Ausnahmen:** Verbindungsprobleme führen zu Pausen, Unzureichendes Guthaben verhindert den Start.

Mockup des Pokertisch
![Pokertisch](resources/Pokertisch.jpeg)