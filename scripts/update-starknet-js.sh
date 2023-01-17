#!/bin/bash
yarn --cwd packages/extension add starknet@next --force                        
yarn --cwd packages/dapp add starknet@next --force                        
yarn --cwd packages/sessions add starknet@next --force                        
yarn --cwd packages/multicall add starknet@next --force                        
yarn --cwd packages/get-starknet add -D starknet@next --force                        
yarn --cwd packages/swap add -D starknet@next --force                        
