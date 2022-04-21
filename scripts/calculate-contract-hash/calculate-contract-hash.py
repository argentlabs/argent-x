import json
from starkware.starknet.core.os.contract_hash import compute_contract_hash
from starkware.starknet.services.api.contract_definition import ContractDefinition

artifact_json = json.load(
    open('../../packages/extension/src/contracts/Proxy.txt'))

contract_definition = ContractDefinition.load(data=artifact_json)
contract_hash = compute_contract_hash(
    contract_definition=contract_definition
)

print(hex(contract_hash))
