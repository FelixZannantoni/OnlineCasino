# Pflichtenheft - Online Casino

## Inhaltsverzeichnis

- [1. Ausgangslage](#1-ausgangslage)
  - [1.1. Ist-Situation](#11-ist-situation)
  - [1.2. Verbesserungspotenziale](#12-verbesserungspotenziale)
- [2. Zielsetzung](#2-zielsetzung)
- [3. Funktionale Anforderungen](#3-funktionale-anforderungen)
  - [3.1 Use Case A: Haupmenü](#31-use-case-a-haupmenü)
  - [3.2 Use Case B: Spielen von Blackjack](#32-use-case-b-spielen-von-blackjack)
  - [3.3 Use Case C: Spielen von Poker](#33-use-case-c-spielen-von-poker)
  - [3.4 Use Case D: Social Features](#34-use-case-d-social-features)

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



### 3.1 Use Case A: Haupmenü
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

**Nachbedingung:** Jegliche Aktionen sind verarbeitet, Guthaben aktualisiert.

**Ausnahmen:** Keine Internetverbindung → Offline-Hinweis, Session abgelaufen → Rückleitung zum Login

Mockup des Hauptmenüs
![Startmenü](resources/Startmenü.jpeg)



### 3.2 Use Case B: Spielen von Blackjack
**Akteur:** Eingeloggter Spieler

**Vorbedingung:** Der Benutzer hat Guthaben und wählt Blackjack.

**Beschreibung:**
1. Der Benutzer öffnet den virtuellen Blackjacktisch
2. Er platziert Einsätze.
3. Das System simuliert das Spiel (Karten austeilen, evtl. Spielzüge) mit Zufallsalgorithmen.
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
1. Der Benutzer öffnet den virtuellen Pokertisch
2. Er platziert Einsätze.
3. Das System simuliert das Spiel (Karten austeilen) mit Zufallsalgorithmen.
4. Runden werden ausgewertet, Gewinne/Verluste berechnet.
5. Der Benutzer kann aus der Runde aussteigen, er kann mitgehen, oder den Einsatz erhöhen.

**Nachbedingung:** Spielstand aktualisiert, Guthaben angepasst.

**Ausnahmen:** Verbindungsprobleme führen zu Pausen, Unzureichendes Guthaben verhindert den Start.

Mockup des Pokertisch
![Pokertisch](resources/Pokertisch.jpeg)


### 3.4 Use Case D: Social Features
**Akteur:** Eingeloggter Spieler

**Vorbedingung:** Der Benutzer ist eingeloogt.

**Beschreibung:**
1. Der Benutzer klickt auf das Social-/Chat-Symbol in der Navigation.
2. Die Freundesliste wird geladen und angezeigt.
3. Der Benutzer kann die Liste absteigend oder aufsteigend sortieren nach:
   - Chips
   - Freundschaftsdauer
   - Aktuelle Streak-Länge
   - Name
4. Eingehende Freunschatsanfragen:
   - Annehmen → Freund wird hinzugefügt
   - Ablehnen
5. Chatten mit einem Freund:
   - Wird ein Freund ausgewählt, ist auf der Seite dr Chatverlauf dessen offen
   - Nachrichten können gesendet werden
   - Empfangene Nachrichten werden angezeigt

**Nachbedingung:**
- Freundesliste ist sichtbar + sortiert
- Gesendete/angenommene Anfragen sind gespeichert
- Chat mit Freunden ist offen bzw. akualisiert

**Wichtige Ausnahmen:**
- Freundesliste leer → Hinweis + Button „Freunde finden / einladen“

Mockup der Social-Features
![SocialFeatures](resources/SocialFeatures.jpeg)
