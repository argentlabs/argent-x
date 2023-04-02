#!/bin/bash
pnpm --cwd packages/extension add starknet@next
pnpm --cwd packages/dapp add starknet@next
pnpm --cwd packages/sessions add starknet@next
pnpm --cwd packages/multicall add starknet@next
pnpm --cwd packages/get-starknet add -D starknet@next
pnpm --cwd packages/guardian add -D starknet@next
pnpm --cwd packages/swap add starknet@next
