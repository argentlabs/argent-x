FROM shardlabs/starknet-devnet:0.6.3
RUN addgroup -S localuser \
    && adduser -S localuser -G localuser
USER localuser
COPY ./packages/e2e/extension/network-setup /network-setup
ENTRYPOINT [ "starknet-devnet", "--host", "0.0.0.0", "--port", "5050", "--seed", "0", "--lite-mode" ]