import { useParams } from "react-router-dom"

import { SignerType } from "../../../../shared/wallet.model"
import { MultisigCreationForm } from "./MultisigCreationForm"

export const CreateMultisigStartScreen = () => {
  const { networkId, creatorType } = useParams() as {
    networkId: string
    creatorType: SignerType
  }

  if (!networkId || !creatorType) {
    return <></>
  }
  return <MultisigCreationForm networkId={networkId} signerType={creatorType} />
}
