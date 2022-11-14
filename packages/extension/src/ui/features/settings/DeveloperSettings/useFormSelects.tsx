import { SelectOption } from "@argent/ui"
import { Circle, Flex, Image } from "@chakra-ui/react"
import { useMemo } from "react"
import { ComponentProps, FC } from "react"

import { accountStore } from "../../../../shared/account/store"
import { useArrayStorage } from "../../../../shared/storage/hooks"
import {
  getAccountName,
  useAccountMetadata,
} from "../../accounts/accountMetadata.state"
import { getNetworkAccountImageUrl } from "../../accounts/accounts.service"
import { useNetworks } from "../../networks/useNetworks"
import { SelectOptionAccount } from "./SelectOptionAccount"

interface AccountAvatarProps extends ComponentProps<"img"> {
  outlined?: boolean
}

const AccountAvatar: FC<AccountAvatarProps> = ({ outlined, ...rest }) => {
  return (
    <Flex position={"relative"} flexShrink={0}>
      <Image borderRadius={"full"} width={12} height={12} {...rest} />
      {outlined && (
        <>
          <Circle
            position={"absolute"}
            top={0}
            size={12}
            borderWidth={"0.25rem"}
            borderColor={"black"}
          />
          <Circle
            position={"absolute"}
            top={0}
            size={12}
            borderWidth={"0.125rem"}
            borderColor={"white"}
          />
        </>
      )}
    </Flex>
  )
}

const useFormSelects = (selectedNetwork: string) => {
  const networks = useNetworks()
  const accounts = useArrayStorage(accountStore)
  const { accountNames } = useAccountMetadata()

  const networkOptions = useMemo(
    () =>
      networks.map((network: any) => ({
        label: <SelectOption label={network.name} />,
        labelSelected: network.name,
        value: network.id,
      })),
    [networks],
  )

  const accountOptions = useMemo(
    () =>
      accounts
        .filter((account) => account.networkId === selectedNetwork)
        .map((account: any) => ({
          icon: (
            <AccountAvatar
              src={getNetworkAccountImageUrl({
                accountName: getAccountName(account, accountNames),
                accountAddress: account.address,
                networkId: account.networkId,
                backgroundColor: undefined,
              })}
            />
          ),
          label: <SelectOptionAccount account={account} />,
          labelSelected: getAccountName(account, accountNames),
          value: account.address,
        })),
    [accounts, accountNames, selectedNetwork],
  )

  return {
    accountOptions,
    networkOptions,
  }
}

export { useFormSelects }
