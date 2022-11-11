import { FieldError, Input, Select, icons } from "@argent/ui"
import { Box, Stack, Text } from "@chakra-ui/react"
import { get, isEmpty } from "lodash-es"
import { FC, ReactNode, useMemo, useRef, useState } from "react"
import { Controller, SubmitHandler, useForm } from "react-hook-form"

import { accountStore } from "../../../../shared/account/store"
import { useArrayStorage } from "../../../../shared/storage/hooks"
import { sendTransaction } from "../../../services/transactions"
import {
  getAccountName,
  useAccountMetadata,
} from "../../accounts/accountMetadata.state"
import { useNetworks } from "../../networks/useNetworks"

const { InfoIcon } = icons

interface FieldValues {
  account: string
  classHash: string
  contract: string
  network: string
}

interface DeclareSmartContractFormProps {
  children?: (options: { isDirty: boolean; isSubmitting: boolean }) => ReactNode
}

const Error: FC<{ message: string }> = ({ message }) => (
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
    <FieldError>{message}</FieldError>
  </Box>
)

const DeclareSmartContractForm: FC<DeclareSmartContractFormProps> = ({
  children,
}) => {
  const { control, formState, handleSubmit, clearErrors, watch, setValue } =
    useForm<FieldValues>({
      mode: "onSubmit",
    })
  const { errors, isDirty, isSubmitting } = formState
  const selectedNetwork = watch("network")

  const [contractJSON, setContractJSON] = useState("")

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const networks = useNetworks()
  const accounts = useArrayStorage(accountStore)
  const { accountNames } = useAccountMetadata()

  const onSubmit: SubmitHandler<FieldValues> = async ({
    account,
    classHash,
    contract,
    network,
  }: FieldValues) => {
    clearErrors()
    //sendTransaction({})
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="column" mx="4">
        <Controller
          name="contract"
          control={control}
          rules={{ required: true }}
          defaultValue=""
          render={({
            field: { ref, value, /* value, */ onChange, ...inputProps },
          }) => (
            <>
              <input
                type="file"
                accept="application/json"
                ref={fileInputRef}
                {...inputProps}
                onChange={async () => {
                  const file = get(fileInputRef, "current.files[0]")
                  const reader = new FileReader()
                  reader.onload = function () {
                    if (reader.result) {
                      setContractJSON(reader.result.toString())
                      setValue("contract", file.name)
                    }
                  }
                  reader.readAsText(file)
                }}
                style={{ display: "none" }}
              ></input>
              <Input
                _placeholder={{ color: "white" }}
                placeholder={value || "Upload contract JSON"}
                isInvalid={!isEmpty(errors.contract)}
                onClick={() => fileInputRef?.current?.click()}
                cursor="pointer"
                readOnly
              />
            </>
          )}
        />
        {!isEmpty(errors.contract) && <Error message="Contract is required" />}

        <Controller
          name="classHash"
          control={control}
          rules={{ required: true }}
          defaultValue=""
          render={({ field: { ref, ...field } }) => (
            <Input
              autoFocus
              placeholder="Classhash"
              {...field}
              isInvalid={!isEmpty(errors.classHash)}
            />
          )}
        />
        {!isEmpty(errors.classHash) && (
          <Error message="Classhash is required" />
        )}

        <Controller
          name="network"
          control={control}
          rules={{ required: true }}
          defaultValue=""
          render={({ field: { onChange, name, value } }) => (
            <Select
              placeholder="Network"
              name={name}
              isInvalid={!isEmpty(errors.network)}
              onChange={(v: any) => onChange(v)}
              options={networkOptions}
              value={value}
            />
          )}
        />
        {!isEmpty(errors.network) && <Error message="Network is required" />}

        <Controller
          name="account"
          control={control}
          rules={{ required: true }}
          defaultValue=""
          render={({ field: { onChange, name, value } }) => (
            <Select
              disabled={!selectedNetwork}
              placeholder="Account"
              emptyMessage="No accounts available on this network"
              name={name}
              isInvalid={!isEmpty(errors.account)}
              onChange={(v: any) => onChange(v)}
              options={accountOptions}
              value={value}
            />
          )}
        />
        {!isEmpty(errors.account) && <Error message="Account is required" />}

        {children?.({ isDirty, isSubmitting })}
      </Stack>
    </form>
  )
}

export { DeclareSmartContractForm }
