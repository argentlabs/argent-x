import { KnownDappButton } from "@argent/x-ui"
import { useDappDisplayAttributes } from "../../../services/knownDapps/useDappDisplayAttributes"

export const KnownDappButtonWrapper = ({ dappHost }: { dappHost: string }) => {
  const { verified, dapplandUrl } = useDappDisplayAttributes(dappHost)
  return <>{verified && <KnownDappButton dapplandUrl={dapplandUrl} />}</>
}
