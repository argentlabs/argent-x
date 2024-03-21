import { KnownDappButton } from "@argent/x-ui"
import { useDappDisplayAttributes } from "./useDappDisplayAttributes"

export const KnownDappButtonWrapper = ({ dappHost }: { dappHost: string }) => {
  const { verified, dapplandUrl } = useDappDisplayAttributes(dappHost)
  return <>{verified && <KnownDappButton dapplandUrl={dapplandUrl} />}</>
}
