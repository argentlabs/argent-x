import { H4, H6, P3 } from "@argent/ui"
import { Box, Divider } from "@chakra-ui/react"
import { FC } from "react"

import { formatTruncatedSignerKey } from "../../services/addresses"
import { Account } from "../accounts/Account"
import { useEncodedPublicKeys, useSignerKey } from "../accounts/usePublicKey"
import { useRouteAccount } from "../shield/useRouteAccount"
import { useMultisigInfo } from "./hooks/useMultisigInfo"
import { MultisigSettingsWrapper } from "./MultisigSettingsWrapper"

export const MultisigOwnersScreen: FC = () => {
  const account = useRouteAccount()

  return (
    <MultisigSettingsWrapper>
      {account && <MultisigOwners account={account} />}
    </MultisigSettingsWrapper>
  )
}

const MultisigOwners = ({ account }: { account: Account }) => {
  const { multisig } = useMultisigInfo(account)
  const signerKey = useSignerKey()
  const signerKeys = useEncodedPublicKeys(multisig?.signers ?? [])
  return (
    <Box m={4}>
      <H4>{multisig?.signers.length} owners</H4>
      <P3 color="neutrals.300">
        {multisig?.threshold}/{multisig?.signers.length} owners must confirm
        each transactions
      </P3>
      <Divider my={4} color="neutrals.800" />
      <P3 color="neutrals.300" mb={1}>
        Me
      </P3>
      <Box borderRadius="lg" backgroundColor="neutrals.800" p={4} mb={3}>
        {signerKey && (
          <H6 color="white">{formatTruncatedSignerKey(signerKey)}</H6>
        )}
      </Box>
      <P3 color="neutrals.300" mb={1}>
        Other owners
      </P3>
      {signerKeys
        .filter((signer) => signer !== signerKey)
        .map((signer) => {
          return (
            <Box
              borderRadius="lg"
              backgroundColor="neutrals.800"
              p={4}
              key={signer}
              my={1}
            >
              <H6 color="white">{formatTruncatedSignerKey(signer)}</H6>
            </Box>
          )
        })}
    </Box>
  )
}
