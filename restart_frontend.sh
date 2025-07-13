#!/bin/bash

docker build -t mokelumne-frontend:latest ./frontend/mokelumne-frontend

kind load docker-image mokelumne-frontend:latest --name mokelumne-cluster

kubectl rollout restart deployment frontend -n mokelumne
