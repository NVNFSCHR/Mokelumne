#!/bin/bash

docker build -t user-service:latest ./services/user-service

kind load docker-image user-service:latest --name mokelumne-cluster

kubectl rollout restart deployment user-service -n mokelumne
