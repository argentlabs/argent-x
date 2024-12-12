import { DappIcon } from "./DappIcon"
import { useDappDisplayAttributes } from "../../../services/knownDapps/useDappDisplayAttributes"

export const DappIconContainer = ({ host }: { host: string }) => {
  const dappDisplayAttributes = useDappDisplayAttributes(host)
  return <DappIcon dappDisplayAttributes={dappDisplayAttributes} />
}
