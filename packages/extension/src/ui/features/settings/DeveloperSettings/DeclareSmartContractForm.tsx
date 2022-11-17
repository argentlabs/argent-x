import { Error, Input, Select } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { get, isEmpty } from "lodash-es"
import { FC, ReactNode, useCallback, useRef, useState } from "react"
import { Controller, SubmitHandler, useForm } from "react-hook-form"

import { WalletAccount } from "../../../../shared/wallet.model"
import { useAppState } from "../../../app.state"
import { isEqualAddress } from "../../../services/addresses"
import { declareContract } from "../../../services/udp.service"
import { useSelectedAccountStore } from "../../accounts/accounts.state"
import { useFormSelects } from "./useFormSelects"

interface FieldValues {
  account: string
  classHash: string
  contract: string
  network: string
}

interface DeclareSmartContractFormProps {
  children?: (options: { isDirty: boolean; isSubmitting: boolean }) => ReactNode
}

const DeclareSmartContractForm: FC<DeclareSmartContractFormProps> = ({
  children,
}) => {
  const {
    control,
    formState,
    handleSubmit,
    clearErrors,
    watch,
    setValue,
    setError,
  } = useForm<FieldValues>({
    mode: "onSubmit",
  })
  const { errors, isDirty, isSubmitting } = formState
  const selectedNetwork = watch("network")

  const [contractJSON, setContractJSON] = useState("")

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { accounts, accountOptions, networkOptions } =
    useFormSelects(selectedNetwork)

  const uploadFile = useCallback(async () => {
    const file = get(fileInputRef, "current.files[0]")
    const reader = new FileReader()
    reader.onload = function () {
      if (reader.result) {
        try {
          JSON.parse(reader.result.toString())
        } catch (e) {
          setError("contract", {
            type: "invalid",
          })
          return
        }
        setContractJSON(reader.result.toString())
        setValue("contract", file.name)
      }
    }
    reader.readAsText(file)
  }, [setValue])

  const onSubmit: SubmitHandler<FieldValues> = async ({
    account,
    classHash,
    network,
  }: FieldValues) => {
    const selectedAccount = accounts.find(
      (act: WalletAccount) =>
        isEqualAddress(act.address, account) && act.networkId === network,
    )
    useAppState.setState({ switcherNetworkId: network })
    useSelectedAccountStore.setState({
      selectedAccount,
    })
    await declareContract(account, classHash, contractJSON, network)
    clearErrors()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex direction="column" mx="4" gap={1}>
        <Controller
          name="contract"
          control={control}
          rules={{ required: true }}
          defaultValue=""
          render={({ field: { ref, value, onChange, ...inputProps } }) => (
            <>
              <input
                type="file"
                accept="application/json"
                ref={fileInputRef}
                {...inputProps}
                onChange={uploadFile}
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
        {!isEmpty(errors.contract) && (
          <Error
            message={
              errors.contract.type === "required" ? "Required" : "Invalid JSON"
            }
          />
        )}

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
              disabled={!selectedNetwork}
              placeholder="Account"
              emptyMessage="No accounts available on this network"
              maxH="33vh"
              name={name}
              isInvalid={!isEmpty(errors.account)}
              onChange={onChange}
              options={accountOptions}
              value={value}
            />
          )}
        />
        {!isEmpty(errors.account) && <Error message="Account is required" />}

        {children?.({ isDirty, isSubmitting })}
      </Flex>
    </form>
  )
}

export { DeclareSmartContractForm }
