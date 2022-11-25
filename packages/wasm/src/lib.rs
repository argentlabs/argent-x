mod utils;

use starknet::core::types::contract_artifact;
use utils::set_panic_hook;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub async fn calculate_class_hash(compiled_contract_json: &str) -> Result<String, JsError> {
    set_panic_hook();
    let compiled_contract: Result<contract_artifact::ContractArtifact, _> =
        serde_json::from_str(compiled_contract_json);
    let class_hash = compiled_contract?.class_hash();

    match class_hash {
        Ok(class_hash) => Ok(format!("0x{:x}", class_hash)),
        Err(err) => Err(JsError::new(&format!("{:?}", err))),
    }
}
