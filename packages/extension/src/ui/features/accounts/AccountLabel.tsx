import { L2 } from "@argent/ui"
import { FC } from "react"

import { ArgentAccountType } from "../../../shared/wallet.model"

export interface AccountLabelProps {
  accountType: ArgentAccountType
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
    <L2
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
    </L2>
  ) : null
}
