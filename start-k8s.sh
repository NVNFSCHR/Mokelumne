#!/bin/bash

# Images bauen
echo "Baue Docker Images..."
docker build -t image-service:latest ./services/image-service
docker build -t product-service:latest ./services/product-service
docker build -t user-service:latest ./services/user-service
docker build -t mokelumne-frontend:latest ./frontend/mokelumne-frontend

# Cluster erstellen oder neu erstellen
if kind get clusters | grep -q mokelumne-cluster; then
  echo "Lösche vorhandenen Cluster und erstelle ihn neu mit Port-Mapping..."
  kind delete cluster --name mokelumne-cluster
fi

echo "Erstelle Kubernetes Cluster mit Port-Mapping..."
kind create cluster --config kind-config.yaml

# Images in den Cluster laden
echo "Lade Docker Images in den Cluster..."
kind load docker-image image-service:latest --name mokelumne-cluster
kind load docker-image product-service:latest --name mokelumne-cluster
kind load docker-image user-service:latest --name mokelumne-cluster
kind load docker-image mokelumne-frontend:latest --name mokelumne-cluster

# Zuerst den Ingress-Controller installieren
echo "Installiere Ingress-Controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/kind/deploy.yaml

# Warten bis der Ingress-Controller vollständig bereit ist
echo "Warte auf Ingress-Controller..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=180s

# Jetzt erst die Kubernetes Ressourcen erstellen
echo "Erstelle Kubernetes Ressourcen..."
kubectl apply -f k8s/namespaces/
kubectl apply -f k8s/secrets/
kubectl apply -f k8s/storage/
kubectl apply -f k8s/mongo/
kubectl apply -f k8s/services/
kubectl apply -f k8s/frontend/frontend-deployment.yaml

echo "Warte auf Pods..."
kubectl wait --for=condition=ready pods --all -n mokelumne --timeout=120s

# Ingress erst nach allen anderen Ressourcen erstellen
echo "Erstelle und konfiguriere Ingress..."
kubectl apply -f k8s/ingress/
kubectl patch ingress mokelumne-ingress -n mokelumne --type=json -p='[{"op": "add", "path": "/spec/ingressClassName", "value": "nginx"}]'

echo "Kubernetes-Setup abgeschlossen!"
echo "Dienste sind unter folgenden URLs erreichbar:"
echo "- Image-Service: http://localhost/api/images"
echo "- User-Service: http://localhost/api/user"
echo "- Product-Service: http://localhost/api/products"
echo "- Frontend: http://localhost/"
