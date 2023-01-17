import { Error as ErrorEl, Input, Select } from "@argent/ui"
import { Box, Flex, Spinner } from "@chakra-ui/react"
import { get, isEmpty } from "lodash-es"
import { FC, ReactNode, useCallback, useRef, useState } from "react"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { hash } from "starknet5"

import { WalletAccount } from "../../../../shared/wallet.model"
import { useAppState } from "../../../app.state"
import { isEqualAddress } from "../../../services/addresses"
import { selectAccount } from "../../../services/backgroundAccounts"
import { declareContract } from "../../../services/udc.service"
import { useFormSelects } from "./useFormSelects"

interface FieldValues {
  account: string
  classHash: string
  contract: string
  network: string
}

const readFileAsString = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result) {
        return resolve(reader.result?.toString())
      }
      return reject(new Error("Could not read file"))
    }
    reader.onerror = reject
    reader.onabort = reject.bind(null, new Error("User aborted"))
    reader.readAsText(file)
  })
}

interface DeclareSmartContractFormProps {
  children?: (options: {
    isDirty: boolean
    isSubmitting: boolean
    isBusy: boolean
    hasInvalidFile: boolean
  }) => ReactNode
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

  const [contractClassHashLoading, setContractClassHashLoading] =
    useState(false)
  const [contractClassHashComputed, setContractClassHashComputed] =
    useState(false)

  const uploadFile = useCallback(async () => {
    setContractClassHashComputed(false)
    setContractClassHashLoading(true)

    const file: File | undefined = get(fileInputRef, "current.files[0]")

    if (file) {
      setValue("contract", (file as File).name)
      clearErrors("contract")
      try {
        const contractContent = await readFileAsString(file)
        setContractJSON(contractContent)

        const classHash = hash.computeContractClassHash(contractContent)
        setValue("classHash", classHash)

        setContractClassHashComputed(true)
      } catch (error) {
        setError("contract", {
          type: "invalid",
          message: "Invalid JSON file",
        })
        setValue("classHash", "")
      }
    }

    setContractClassHashLoading(false)
  }, [clearErrors, setError, setValue])

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
    await selectAccount(selectedAccount)
    await declareContract(account, classHash, contractJSON, network)
    clearErrors()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex direction="column" mx="4" gap={1}>
        <Controller
          name="contract"
          control={control}
          rules={{
            required: true,
            validate: () =>
              !(errors.contract?.type === "invalid") || "Invalid JSON file",
          }}
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
                placeholder={value || "Click to upload contract JSON"}
                isInvalid={!isEmpty(errors.contract)}
                onClick={() => fileInputRef?.current?.click()}
                cursor="pointer"
                readOnly
              />
            </>
          )}
        />
        {!isEmpty(errors.contract) && (
          <ErrorEl
            message={
              errors.contract.type === "required"
                ? "A contract is required"
                : "Invalid contract file"
            }
          />
        )}

        <Box position="relative">
          <Controller
            name="classHash"
            control={control}
            rules={{ required: true }}
            defaultValue=""
            render={({ field: { ref, ...field } }) => (
              <Input
                readOnly={contractClassHashComputed}
                disabled={contractClassHashLoading}
                placeholder="Contract classhash"
                {...field}
                isInvalid={!isEmpty(errors.classHash)}
              />
            )}
          />
          {contractClassHashLoading && (
            <Box
              position="absolute"
              top="0"
              right="0"
              bottom="0"
              left="0"
              display="flex"
              alignItems="center"
              justifyContent="center"
              backdropFilter="blur(2px)"
              borderRadius="lg"
            >
              <Spinner size="sm" />
            </Box>
          )}
        </Box>
        {!isEmpty(errors.classHash) && (
          <ErrorEl message="Classhash is required" />
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
        {!isEmpty(errors.network) && <ErrorEl message="Network is required" />}

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
        {!isEmpty(errors.account) && <ErrorEl message="Account is required" />}

        {children?.({
          isDirty,
          isSubmitting,
          isBusy: contractClassHashLoading,
          hasInvalidFile: !isEmpty(errors.contract),
        })}
      </Flex>
    </form>
  )
}

export { DeclareSmartContractForm }
