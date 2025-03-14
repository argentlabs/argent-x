import { Flex, Input } from "@chakra-ui/react"
import type { FC } from "react"
import { StarknetIdOrAddressLabel } from "../../components/StarknetIdOrAddressLabel"
import type { BaseWalletAccount } from "../../../shared/wallet.model"
import { useFormContext } from "react-hook-form"
import { typographyStyles } from "@argent/x-ui/theme"

export interface AccountNameInputProps {
  account: BaseWalletAccount
}

export const AccountNameInput: FC<AccountNameInputProps> = ({ account }) => {
  const { register } = useFormContext()

  return (
    <Flex direction="column" align="center" gap="2" mb="2">
      <Input
        {...register("accountName")} // Use the register function provided by useFormContext
        textAlign="center"
        spellCheck="false"
        placeholder="Account name"
        border="none"
        bg="transparent"
        {...typographyStyles.H2}
        autoFocus
        py={0}
        minH={0}
      />
      <StarknetIdOrAddressLabel account={account} />
    </Flex>
  )
}
