import { H1, H4, P3 } from "@argent/ui"
import { Box, Center } from "@chakra-ui/react"
import { FC } from "react"
import { useParams } from "react-router-dom"

import { Account } from "../accounts/Account"
import { useAccount } from "../accounts/accounts.state"
import { useCurrentNetwork } from "../networks/useNetworks"
import { useMultisigInfo } from "./hooks/useMultisigInfo"
import { MultisigSettingsWrapper } from "./MultisigSettingsWrapper"

export const MultisigConfirmationsScreen: FC = () => {
  const currentNetwork = useCurrentNetwork()
  const { accountAddress = "" } = useParams<{ accountAddress: string }>()
  const account = useAccount({
    address: accountAddress,
    networkId: currentNetwork.id,
  })
  return (
    <MultisigSettingsWrapper>
      {account && <MultisigConfirmations account={account} />}
    </MultisigSettingsWrapper>
  )
}

const MultisigConfirmations = ({ account }: { account: Account }) => {
  const { multisig } = useMultisigInfo(account)
  return (
    <Box m={4}>
      <H4>Set confirmations</H4>
      <P3 color="neutrals.100" pb={4}>
        How many owners must confirm each transaction before it&apos;s sent?
      </P3>
      <Box>
        <Box borderRadius="lg" backgroundColor="neutrals.800" p={4} my={4}>
          <Center>
            <H1>{multisig?.threshold}</H1>
          </Center>
        </Box>
        <Center>
          <P3 color="neutrals.100">out of {multisig?.signers.length} owners</P3>
        </Center>
      </Box>
    </Box>
  )
}
