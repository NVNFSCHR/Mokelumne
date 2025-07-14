#!/bin/bash

docker build -t payment-service:latest ./services/payment-service

kind load docker-image payment-service:latest --name mokelumne-cluster

kubectl rollout restart deployment payment-service -n mokelumne
