Im Projekt-Root:

    docker-compose up --build

um Alles zu starten (ohne Kubernetes).

Kubernetes Cluster erstellen (Docker muss geöffnet sein & Kubernetes aktiviert):

    # Wenn dein Cluster gelöscht wurde, neu erstellen:
    kind create cluster --name mokelumne-cluster
    
    # Images in den Cluster laden
    kind load docker-image image-service:latest --name mokelumne-cluster
    kind load docker-image product-service:latest --name mokelumne-cluster


Kubernetes Ressourcen erstellen:

    kubectl apply -f k8s/namespaces/
    kubectl apply -f k8s/storage/
    kubectl apply -f k8s/mongo/
    kubectl apply -f k8s/services/
    kubectl apply -f k8s/ingress/
    
    # Überprüfen, ob alles läuft
    kubectl get all -n mokelumne


Portweiterleitung:

    # Für den Image-Service
    kubectl port-forward -n mokelumne service/image-service 4000:4000
    
    # In einem zweiten Terminal für den Product-Service
    kubectl port-forward -n mokelumne service/product-service 3000:3000
