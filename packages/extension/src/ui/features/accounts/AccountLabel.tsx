import { L2Bold } from "@argent/x-ui"
import type { FC } from "react"

import type { WalletAccountType } from "../../../shared/wallet.model"

export interface AccountLabelProps {
  accountType: WalletAccountType
}

export const AccountLabel: FC<AccountLabelProps> = ({ accountType }) => {
  let label: string | null = null

  switch (accountType) {
    case "plugin":
      label = "Plugin"
      break

    case "betterMulticall":
      label = "Better MC"
      break

    default:
      break
  }

  return label ? (
    <L2Bold
      backgroundColor={"neutrals.900"}
      px={1}
      py={0.5}
      textTransform="uppercase"
      fontWeight={"extrabold"}
      color={"neutrals.200"}
      borderRadius={"base"}
      border={"1px solid"}
      borderColor={"neutrals.700"}
    >
      {label}
    </L2Bold>
  ) : null
}
