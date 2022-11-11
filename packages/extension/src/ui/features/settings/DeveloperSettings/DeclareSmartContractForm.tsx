import { FieldError, Select, icons } from "@argent/ui"
import { Box, Stack, Text } from "@chakra-ui/react"
import { isEmpty } from "lodash-es"
import { FC, ReactNode, useMemo } from "react"
import { Controller, SubmitHandler, useForm } from "react-hook-form"

import { accountStore } from "../../../../shared/account/store"
import { useArrayStorage } from "../../../../shared/storage/hooks"
import {
  getAccountName,
  useAccountMetadata,
} from "../../accounts/accountMetadata.state"
import { useNetworks } from "../../networks/useNetworks"

interface FieldValues {
  account: string
  network: string
}

interface DeclareSmartContractFormProps {
  children?: (options: { isDirty: boolean; isSubmitting: boolean }) => ReactNode
}

const DeclareSmartContractForm: FC<DeclareSmartContractFormProps> = ({
  children,
}) => {
  const networks = useNetworks()
  const accounts = useArrayStorage(accountStore)
  const { control, formState, handleSubmit, clearErrors, watch } =
    useForm<FieldValues>({
      mode: "onSubmit",
    })
  const { errors, isDirty, isSubmitting } = formState
  const { InfoIcon } = icons
  const { accountNames } = useAccountMetadata()

  const selectedNetwork = watch("network")

  const onSubmit: SubmitHandler<FieldValues> = async (data: FieldValues) => {
    clearErrors()
    console.log(data)
  }

  const networkOptions = useMemo(
    () =>
      networks.map((network: any) => ({
        label: network.name,
        value: network.id,
      })),
    [networks],
  )

  const accountOptions = useMemo(
    () =>
      accounts
        .filter((account) => account.networkId === selectedNetwork)
        .map((account: any) => ({
          label: getAccountName(account, accountNames),
          value: account.address,
        })),
    [accounts, accountNames, selectedNetwork],
  )

  console.log(errors)

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="column" mx="4">
        <Controller
          name="network"
          control={control}
          rules={{ required: true }}
          defaultValue=""
          render={({ field: { onChange, name, value } }) => (
            <Select
              placeholder="Network"
              control={control}
              name={name}
              isInvalid={!isEmpty(errors.network)}
              onChange={(v: any) => onChange(v)}
              options={networkOptions}
              value={value}
            />
          )}
        />
        {!isEmpty(errors.network) && (
          <Box
            position="relative"
            display="flex"
            justifyContent="flex-start"
            gap="5px"
            mt="3"
          >
            <Text fontSize="sm" color="error.500">
              <InfoIcon />
            </Text>
            {errors.network?.type === "required" && (
              <FieldError>network is required</FieldError>
            )}
          </Box>
        )}

        <Controller
          name="account"
          control={control}
          rules={{ required: true }}
          defaultValue=""
          render={({ field: { onChange, name, value } }) => (
            <Select
              placeholder="Account"
              control={control}
              name={name}
              isInvalid={!isEmpty(errors.account)}
              onChange={(v: any) => onChange(v)}
              options={accountOptions}
              value={value}
            />
          )}
        />

        {children?.({ isDirty, isSubmitting })}
      </Stack>
    </form>
  )
}

export { DeclareSmartContractForm }
