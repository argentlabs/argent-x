
FROM shardlabs/starknet-devnet:0.6.3
RUN addgroup -S localuser \
    && adduser -S localuser -G localuser

USER localuser

COPY ./dump.pkl ./dump.pkl
ENTRYPOINT [ "starknet-devnet", "--host", "0.0.0.0", "--port", "5050", "--seed", "0", "--lite-mode" ]