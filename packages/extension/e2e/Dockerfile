
FROM shardlabs/starknet-devnet:latest
RUN addgroup -S localuser \
    && adduser -S localuser -G localuser

USER localuser
COPY ./packages/extension/e2e/network-setup /network-setup
ENTRYPOINT [ "starknet-devnet", "--host", "0.0.0.0", "--port", "5050", "--seed", "0", "--lite-mode", "--load-path", "/network-setup/dump.pkl" ]