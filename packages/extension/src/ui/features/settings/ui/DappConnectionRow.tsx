import type { ComponentProps, FC } from "react"
import { DappRow } from "@argent/x-ui"

import { useDappFromKnownDappsByHost } from "../../../services/knownDapps"

interface DappConnectionRowProps
  extends Omit<ComponentProps<typeof DappRow>, "dappId"> {
  host: string
}

export const DappConnectionRow: FC<DappConnectionRowProps> = ({
  host,
  ...rest
}) => {
  const dapp = useDappFromKnownDappsByHost(host)
  return <DappRow dappId={dapp?.dappId || ""} fallbackName={host} {...rest} />
}
