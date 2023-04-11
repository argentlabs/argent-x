#!/bin/sh

docker build . --tag e2e-starknet-devnet:latest

docker login argentlabs-argent-x.jfrog.io
docker tag e2e-starknet-devnet argentlabs-argent-x.jfrog.io/e2e-starknet-devnet:latest
docker push argentlabs-argent-x.jfrog.io/e2e-starknet-devnet:latest
