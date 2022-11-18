import { Error, Input, Select } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { get, isEmpty } from "lodash-es"
import { FC, ReactNode, useEffect } from "react"
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form"

import { WalletAccount } from "../../../../shared/wallet.model"
import { useAppState } from "../../../app.state"
import { isEqualAddress } from "../../../services/addresses"
import { deployContract } from "../../../services/udp.service"
import { useSelectedAccountStore } from "../../accounts/accounts.state"
import { useFormSelects } from "./useFormSelects"

interface FieldValues {
  account: string
  classHash: string
  network: string
  parameters: any
}

interface DeploySmartContractFormProps {
  children?: (options: { isDirty: boolean; isSubmitting: boolean }) => ReactNode
}

const DeploySmartContractForm: FC<DeploySmartContractFormProps> = ({
  children,
}) => {
  const { control, formState, handleSubmit, clearErrors, watch } =
    useForm<FieldValues>({
      mode: "onSubmit",
    })
  const { errors, isDirty, isSubmitting } = formState

  const currentNetwork = watch("network")
  const currentAccount = watch("account")
  const currentClassHash = watch("classHash")

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      control, // control props comes from useForm (optional: if you are using FormContext)
      name: "parameters", // unique name for your Field Array
    },
  )

  const { accounts, accountOptions, networkOptions } =
    useFormSelects(currentNetwork)

  const onSubmit: SubmitHandler<FieldValues> = async ({
    account,
    classHash,
    network,
    parameters,
  }: FieldValues) => {
    console.log(parameters)
    const selectedAccount = accounts.find(
      (act: WalletAccount) =>
        isEqualAddress(act.address, account) && act.networkId === network,
    )
    useAppState.setState({ switcherNetworkId: network })
    useSelectedAccountStore.setState({
      selectedAccount,
    })
    await deployContract({
      address: account,
      classHash,
      networkId: network,
      constructorCalldata: parameters,
      salt: "123",
      unique: false,
    })
    // deployContract
    clearErrors()
  }

  useEffect(() => {
    // if all 3 fields are filled, retrieve params
  }, [currentAccount, currentClassHash, currentNetwork])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex direction="column" mx="4" gap={1}>
        <Controller
          name="classHash"
          control={control}
          rules={{ required: true }}
          defaultValue=""
          render={({ field: { ref, ...field } }) => (
            <Input
              autoFocus
              placeholder="Contract classhash"
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
              maxH="45vh"
              name={name}
              isInvalid={!isEmpty(errors.network)}
              onChange={onChange}
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
              disabled={!currentNetwork}
              placeholder="Account"
              emptyMessage="No accounts available on this network"
              maxH="45vh"
              name={name}
              isInvalid={!isEmpty(errors.account)}
              onChange={onChange}
              options={accountOptions}
              value={value}
            />
          )}
        />
        {!isEmpty(errors.account) && <Error message="Account is required" />}

        {/* TODO: use array */}
        <Controller
          name={`parameters.${0}`}
          control={control}
          rules={{ required: true }}
          defaultValue=""
          render={({ field: { ref, ...field } }) => (
            <Input
              autoFocus
              placeholder={`Paramter ${1}`}
              {...field}
              isInvalid={!isEmpty(get(errors, `parameters[0]`))}
            />
          )}
        />
        {!isEmpty(get(errors, `parameters[0]`)) && (
          <Error message="Parameter is required" />
        )}

        <Controller
          name={`parameters.${1}`}
          control={control}
          rules={{ required: true }}
          defaultValue=""
          render={({ field: { ref, ...field } }) => (
            <Input
              autoFocus
              placeholder={`Paramter ${2}`}
              {...field}
              isInvalid={!isEmpty(get(errors, `parameters[1]`))}
            />
          )}
        />
        {!isEmpty(get(errors, `parameters[1]`)) && (
          <Error message="Parameter is required" />
        )}

        {children?.({ isDirty, isSubmitting })}
      </Flex>
    </form>
  )
}

export { DeploySmartContractForm }
