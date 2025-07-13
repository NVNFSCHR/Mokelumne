#!/bin/bash

docker build -t order-service:latest ./services/order-service

kind load docker-image order-service:latest --name mokelumne-cluster

kubectl rollout restart deployment order-service -n mokelumne
