#!/bin/bash
yarn --cwd packages/extension add starknet@next
yarn --cwd packages/dapp add starknet@next
yarn --cwd packages/sessions add starknet@next
yarn --cwd packages/multicall add starknet@next
yarn --cwd packages/get-starknet add -D starknet@next
yarn --cwd packages/guardian add -D starknet@next
yarn --cwd packages/swap add starknet@next
