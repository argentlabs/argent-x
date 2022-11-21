import { P4, icons } from "@argent/ui"
import { Box } from "@chakra-ui/react"
import { FC, PropsWithChildren } from "react"
import useSwr from "swr"

import { getAccount } from "../services/backend/account"

const { ProfileIcon } = icons

export const InpageLayout: FC<PropsWithChildren<{}>> = ({ children }) => {
  const { data } = useSwr("services/backend/account/getAccount", () =>
    getAccount(),
  )
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
        {data?.email}
      </P4>
      {children}
    </>
  )
}
