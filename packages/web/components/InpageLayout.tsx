import { P4, icons } from "@argent/ui"
import { FC, PropsWithChildren } from "react"

import { useBackendAccount } from "../hooks/account"

const { ProfileIcon } = icons

export const InpageLayout: FC<PropsWithChildren<{}>> = ({ children }) => {
  const { account } = useBackendAccount()
  return (
    <>
      <P4
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap={2}
        p={4}
        w="100%"
        backgroundColor="#FAF8F5"
        color="#8C8C8C"
      >
        <ProfileIcon fontSize="12px" />
        {account?.email}
      </P4>
      {children}
    </>
  )
}
