#!/bin/bash
yarn --cwd packages/extension add starknet@next
yarn --cwd packages/dapp add starknet@next
yarn --cwd packages/get-starknet add -D starknet@next
