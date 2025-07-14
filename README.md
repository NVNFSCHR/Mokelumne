# Mokelumne E-Commerce Plattform

Dies ist eine moderne, auf Microservices basierende E-Commerce-Anwendung. Sie verwendet Angular für das Frontend und eine Reihe von Backend-Diensten, die in einem Kubernetes-Cluster ausgeführt werden.

## Technologie-Stack

- **Frontend**: Angular
- **Backend**: Node.js / Express.js (Microservices)
- **Datenbank**: MongoDB
- **Containerisierung**: Docker
- **Orchestrierung**: Kubernetes (mit Kind für die lokale Entwicklung)
- **Authentifizierung**: Firebase Auth

## Features

- Vollständiger Produktkatalog mit Suche und Filterung
- Benutzerregistrierung und -authentifizierung (Kunden & Admins)
- Warenkorb-Funktionalität
- Mehrstufiger Checkout-Prozess mit Gast-Option
- Unterstützung für Gutscheincodes
- Admin-Panel zur Verwaltung von Benutzern, Produkten und Bestellungen
- Analytics-Dashboard mit Statistiken zu Umsatz, Bestellungen und Benutzern

## Projektstruktur

    ├── frontend/ # Angular Frontend-Anwendung 
    ├── services/ # Backend Microservices (product, user, cart, etc.) 
    ├── k8s/ # Kubernetes Manifeste (Deployments, Services, Ingress, etc.) 
    ├── start-k8s.sh # Skript zum Starten der gesamten Umgebung 
    ├── stop-k8s.sh # Skript zum Stoppen der Umgebung 
    └── kind-config.yaml # Konfiguration für den lokalen Kind-Cluster

## Voraussetzungen

Stellen Sie sicher, dass die folgenden Werkzeuge auf Ihrem System installiert sind:

- [Docker](https://www.docker.com/get-started)
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl-macos/)
- [kind](https://kind.sigs.k8s.io/docs/user/quick-start/#installation)

## Erste Schritte

Um die Anwendung lokal auszuführen, folgen Sie diesen Schritten. Die Skripte automatisieren den gesamten Prozess des Bauens, Konfigurierens und Bereitstellens.

### 1. Umgebung starten

Führen Sie das Start-Skript aus. Dieses Skript wird:
1.  Die Docker-Images für alle Microservices und das Frontend bauen.
2.  Einen neuen `kind` Kubernetes-Cluster erstellen (oder einen bestehenden löschen und neu erstellen).
3.  Die gebauten Docker-Images in den Cluster laden.
4.  Den NGINX Ingress Controller installieren.
5.  Alle Kubernetes-Ressourcen (Namespaces, Secrets, Deployments, Services, etc.) anwenden.

Achtung: Secrets für Firebase und Internal Services müssen im `k8s/secrets` Ordner liegen, bevor Sie das Skript ausführen.

```bash
./start-k8s.sh
```

Der Vorgang kann einige Minuten dauern.

2. Auf die Anwendung zugreifen
Nachdem das Skript erfolgreich durchgelaufen ist, sind die Dienste unter den folgenden URLs erreichbar:


- Frontend: http://localhost/
- User-Service: http://localhost/api/user
- Product-Service: http://localhost/api/products
- Image-Service: http://localhost/api/images
- Cart-Service: http://localhost/api/cart
- Order-Service: http://localhost/api/order
- Payment-Service: http://localhost/api/pay

3. Umgebung stoppen
Um den Kubernetes-Cluster und alle laufenden Container zu entfernen, führen Sie das Stop-Skript aus:

3. Umgebung stoppen
Um den Kubernetes-Cluster und alle laufenden Container zu entfernen, führen Sie das Stop-Skript aus:

```bash
./stop-k8s.sh
```

Verfügbare Skripte
start-k8s.sh: Baut und startet die gesamte Anwendungslandschaft in einem lokalen Kubernetes-Cluster.
stop-k8s.sh: Löscht den lokalen Kubernetes-Cluster und bereinigt die Umgebung.
