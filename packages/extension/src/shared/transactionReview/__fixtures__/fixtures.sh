# Note these requests currenlty have a baked-in nonce per account

# Send

curl 'https://cloud.argent-api.com/v1/reviewer/transactions/v2/review/starknet' \
  -H 'Accept: application/json' \
  -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json' \
  -H 'Origin: chrome-extension://gienphendhddnhfjnjoebkmaleechdnb' \
  -H 'Sec-GPC: 1' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36' \
  --data-raw '{"transactions":[{"type":"INVOKE","chainId":"0x534e5f474f45524c49","cairoVersion":"1","nonce":"0xd","version":"0x100000000000000000000000000000001","account":"0x575b2948cbaa8ef2d24c62c5e5c3848a5950c0bbac4d260801b159d7806633","calls":[{"contractAddress":"0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7","calldata":["154344866577359164344739446380090869279696317484211928595226592103047915059","1882970796924913","0"],"entrypoint":"transfer"}]}]}' \
  --compressed \
  --insecure | jq > send.json

# Send NFT

curl 'https://cloud.argent-api.com/v1/reviewer/transactions/v2/review/starknet' \
  -H 'Accept: application/json' \
  -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json' \
  -H 'Origin: chrome-extension://gienphendhddnhfjnjoebkmaleechdnb' \
  -H 'Sec-GPC: 1' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36' \
  --data-raw '{"transactions":[{"type":"INVOKE","chainId":"0x534e5f474f45524c49","cairoVersion":"1","nonce":"0xf","version":"0x100000000000000000000000000000001","account":"0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25","calls":[{"contractAddress":"0x031f9085c75917a4860da8628ffc3b4d4587da88dc2ee664516a9271a94cf266","calldata":["2689035213040902571798644155430358178496847363710771602620498934381075712549","282696179318352530216632268592106648387683396644102179455743641374082480949","59","0"],"entrypoint":"transferFrom"}]}]}' \
  --compressed \
  --insecure | jq > send-nft.json

# Send NFT to Self

curl 'https://cloud.argent-api.com/v1/reviewer/transactions/v2/review/starknet' \
  -H 'Accept: application/json' \
  -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json' \
  -H 'Origin: chrome-extension://gienphendhddnhfjnjoebkmaleechdnb' \
  -H 'Sec-GPC: 1' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36' \
  --data-raw '{"transactions":[{"type":"INVOKE","chainId":"0x534e5f474f45524c49","cairoVersion":"1","nonce":"0xf","version":"0x100000000000000000000000000000001","account":"0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25","calls":[{"contractAddress":"0x031f9085c75917a4860da8628ffc3b4d4587da88dc2ee664516a9271a94cf266","calldata":["2689035213040902571798644155430358178496847363710771602620498934381075712549","2689035213040902571798644155430358178496847363710771602620498934381075712549","59","0"],"entrypoint":"transferFrom"}]}]}' \
  --compressed \
  --insecure | jq > send-nft-self.json

# Mint NFT

curl 'https://cloud.argent-api.com/v1/reviewer/transactions/v2/review/starknet' \
  -H 'Accept: application/json' \
  -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json' \
  -H 'Origin: chrome-extension://gienphendhddnhfjnjoebkmaleechdnb' \
  -H 'Sec-GPC: 1' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36' \
  --data-raw '{"transactions":[{"type":"INVOKE","chainId":"0x534e5f474f45524c49","cairoVersion":"1","nonce":"0xa","version":"0x100000000000000000000000000000001","account":"0xa00018122f54123d4003db254cd2054679d92eeefaa7c2d94c27abb9143b35","calls":[{"contractAddress":"0x031f9085c75917a4860da8628ffc3b4d4587da88dc2ee664516a9271a94cf266","calldata":["282696179318352530216632268592106648387683396644102179455743641374082480949","592","4","1000","1754026200","1535609522756849484462157072606864158281015256378820994918241359817756755066","3259482627899936719881475246938297414469283549872581894528882418407205675817"],"entrypoint":"mint"}]}]}' \
  --compressed \
  --insecure | jq > mint-nft.json

# Swap

curl 'https://cloud.argent-api.com/v1/reviewer/transactions/v2/review/starknet' \
  -H 'Accept: application/json' \
  -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json' \
  -H 'Origin: chrome-extension://gienphendhddnhfjnjoebkmaleechdnb' \
  -H 'Sec-GPC: 1' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36' \
  --data-raw '{"transactions":[{"type":"INVOKE","chainId":"0x534e5f474f45524c49","cairoVersion":"1","nonce":"0xf","version":"0x100000000000000000000000000000001","account":"0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25","calls":[{"contractAddress":"0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7","calldata":["1238176885782598120369776599988227623713703144193463695957844450027561601381","9771066479645102","0"],"entrypoint":"approve"},{"contractAddress":"0x2bcc885342ebbcbcd170ae6cafa8a4bed22bb993479f49806e72d96af94c965","calldata":["9771066479645102","0","329694585016","0","2","2087021424722619777119509474943472645767659996348769578120564519014510906823","159707947995249021625440365289670166666892266109381225273086299925265990694","2689035213040902571798644155430358178496847363710771602620498934381075712549","1698229751"],"entrypoint":"swap_exact_tokens_for_tokens"}]}]}' \
  --compressed \
  --insecure | jq > swap.json

# Upgrade

curl 'https://cloud.argent-api.com/v1/reviewer/transactions/v2/review/starknet' \
  -H 'Accept: application/json' \
  -H 'Referer;' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36' \
  -H 'Content-Type: application/json' \
  --data-raw '{"transactions":[{"type":"INVOKE","chainId":"0x534e5f474f45524c49","cairoVersion":"0","nonce":"0x1","version":"0x100000000000000000000000000000001","account":"0x25cfa66be93da0eccafda056f168b2c51f9208a61541e940b3a8b0c9b8790c8","calls":[{"contractAddress":"0x25cfa66be93da0eccafda056f168b2c51f9208a61541e940b3a8b0c9b8790c8","entrypoint":"upgrade","calldata":["747754797100332948667821850294777448537830572225381519032197321912236318723","0"]}]}]}' \
  --compressed \
  --insecure | jq > upgrade.json

# Add Shield

curl 'https://cloud.argent-api.com/v1/reviewer/transactions/v2/review/starknet' \
  -H 'Accept: application/json' \
  -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json' \
  -H 'Origin: chrome-extension://gienphendhddnhfjnjoebkmaleechdnb' \
  -H 'Sec-GPC: 1' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36' \
  --data-raw '{"transactions":[{"type":"INVOKE","chainId":"0x534e5f474f45524c49","cairoVersion":"1","nonce":"0x1e","version":"0x100000000000000000000000000000001","account":"0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25","calls":[{"contractAddress":"0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25","entrypoint":"change_guardian","calldata":["2741694347102943600871280873022221851817804225003651186046337463495789335483"]}]}]}' \
  --compressed \
  --insecure | jq > shield-add.json

# Remove Shield

curl 'https://cloud.argent-api.com/v1/reviewer/transactions/v2/review/starknet' \
  -H 'Accept: application/json' \
  -H 'Referer;' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36' \
  -H 'Content-Type: application/json' \
  --data-raw '{"transactions":[{"type":"INVOKE","chainId":"0x534e5f474f45524c49","cairoVersion":"1","nonce":"0x1e","version":"0x100000000000000000000000000000001","account":"0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25","calls":[{"contractAddress":"0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25","entrypoint":"change_guardian","calldata":["0"]}]}]}' \
  --compressed \
  --insecure | jq > shield-remove.json

# Keep Shield

curl 'https://cloud.argent-api.com/v1/reviewer/transactions/v2/review/starknet' \
  -H 'Accept: application/json' \
  -H 'Referer;' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36' \
  -H 'Content-Type: application/json' \
  --data-raw '{"transactions":[{"type":"INVOKE","chainId":"0x534e5f474f45524c49","cairoVersion":"1","nonce":"0x1e","version":"0x100000000000000000000000000000001","account":"0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25","calls":[{"contractAddress":"0x05f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25","entrypoint":"cancel_escape","calldata":[]}]}]}' \
  --compressed \
  --insecure | jq > shield-keep.json

# Multisig add signer

curl 'https://cloud.argent-api.com/v1/reviewer/transactions/v2/review/starknet' \
  -H 'Accept: application/json' \
  -H 'Referer;' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36' \
  -H 'Content-Type: application/json' \
  --data-raw '{"transactions":[{"type":"INVOKE","chainId":"0x534e5f474f45524c49","cairoVersion":"1","nonce":"0x3","version":"0x100000000000000000000000000000001","account":"0x01cf2a3112c54821398a8544736108b8491a72dfd9d0687759037bc0792097ec","calls":[{"contractAddress":"0x01cf2a3112c54821398a8544736108b8491a72dfd9d0687759037bc0792097ec","entrypoint":"add_signers","calldata":["1","1","2110724608934816813321617549385877489143281708467346823067930903549958145863"]}]}]}' \
  --compressed \
  --insecure | jq > multisig-add.json

# Multisig change threshold

curl 'https://cloud.argent-api.com/v1/reviewer/transactions/v2/review/starknet' \
  -H 'Accept: application/json' \
  -H 'Referer;' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36' \
  -H 'Content-Type: application/json' \
  --data-raw '{"transactions":[{"type":"INVOKE","chainId":"0x534e5f474f45524c49","cairoVersion":"1","nonce":"0x2","version":"0x100000000000000000000000000000001","account":"0x01cf2a3112c54821398a8544736108b8491a72dfd9d0687759037bc0792097ec","calls":[{"contractAddress":"0x01cf2a3112c54821398a8544736108b8491a72dfd9d0687759037bc0792097ec","entrypoint":"change_threshold","calldata":["2"]}]}]}' \
  --compressed \
  --insecure | jq > multisig-change.json

# JediSwap non-native swap

curl 'https://cloud.argent-api.com/v1/reviewer/transactions/v2/review/starknet' \
  -H 'Accept: application/json' \
  -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json' \
  -H 'Origin: chrome-extension://gienphendhddnhfjnjoebkmaleechdnb' \
  -H 'Sec-GPC: 1' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36' \
  --data-raw '{"transactions":[{"type":"INVOKE","chainId":"0x534e5f474f45524c49","cairoVersion":"1","nonce":"0xf","version":"0x100000000000000000000000000000001","account":"0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25","calls":[{"contractAddress":"0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7","calldata":["1238176885782598120369776599988227623713703144193463695957844450027561601381","10771066479645102","0"],"entrypoint":"approve"},{"contractAddress":"0x2bcc885342ebbcbcd170ae6cafa8a4bed22bb993479f49806e72d96af94c965","calldata":["10771066479645102","0","11471663166221121338","0","2","2087021424722619777119509474943472645767659996348769578120564519014510906823","1767481910113252210994791615708990276342505294349567333924577048691453030089","2689035213040902571798644155430358178496847363710771602620498934381075712549","1698229924"],"entrypoint":"swap_exact_tokens_for_tokens"}]}]}' \
  --compressed \
  --insecure | jq > non-native-jediswap.json


