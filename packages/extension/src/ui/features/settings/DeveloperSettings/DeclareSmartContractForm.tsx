import { CellStack, ErrorMessage, P3, Select, SpacerCell } from "@argent/ui"
import { isEmpty } from "lodash-es"
import { FC, ReactNode, useCallback, useRef, useState } from "react"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { CompiledSierraCasm, hash, isSierra } from "starknet"
import { chakra } from "@chakra-ui/react"

import { readFileAsString } from "@argent/shared"
import { accountService } from "../../../../shared/account/service"
import { DeclareContract } from "../../../../shared/udc/type"
import { useAppState } from "../../../app.state"
import { declareContract } from "../../../services/udc.service"
import { FileNameWithClassHash } from "./ui/ContractWithClassHash"
import { FileInputButton } from "./ui/FileInputButton"
import { useFormSelects } from "./useFormSelects"

interface FieldValues {
  contractJson: string
  contractCasm: string
  account: string
  network: string
}

interface DeclareSmartContractFormProps {
  children?: (options: {
    isDirty: boolean
    isSubmitting: boolean
    isBusy: boolean
    hasInvalidFile: boolean
  }) => ReactNode
}

/** TODO: refactor into container pattern and extract logic into service(s) */

export const DeclareSmartContractForm: FC<DeclareSmartContractFormProps> = ({
  children,
}) => {
  const contractJsonRef = useRef<string | null>(null)
  const contractJsonFileInputRef = useRef<HTMLInputElement | null>(null)
  const contractCasmRef = useRef<CompiledSierraCasm | null>(null)
  const contractCasmFileInputRef = useRef<HTMLInputElement | null>(null)

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

  const { accountOptions, networkOptions } = useFormSelects(selectedNetwork)

  const [contractClassHash, setContractClassHash] = useState<string | null>(
    null,
  )
  const [contractClassHashIsLoading, setContractClassHashIsLoading] =
    useState(false)
  const [contractJsonIsSierra, setContractJsonIsSierra] = useState<
    boolean | null
  >(null)
  const [contractCasmClassHash, setContractCasmClassHash] = useState<
    string | null
  >(null)
  const [contractCasmClassHashIsLoading, setContractCasmClassHashIsLoading] =
    useState(false)

  const onChangeContractJson = useCallback(async () => {
    const file = contractJsonFileInputRef.current?.files?.[0]
    if (!file) {
      return
    }
    try {
      setContractClassHashIsLoading(true)

      setValue("contractJson", file.name)
      clearErrors("contractJson")
      setValue("contractCasm", "")
      clearErrors("contractCasm")

      setContractJsonIsSierra(null)
      setContractClassHash(null)
      setContractCasmClassHash(null)
      contractJsonRef.current = null
      contractCasmRef.current = null

      const contractContent = await readFileAsString(file)
      contractJsonRef.current = contractContent

      setContractJsonIsSierra(isSierra(contractContent))

      const classHash = hash.computeContractClassHash(contractContent)
      setContractClassHash(classHash)
    } catch (error) {
      setContractClassHash(null)
      setError("contractJson", {
        type: "invalid",
        message: "Invalid JSON file",
      })
    } finally {
      setContractClassHashIsLoading(false)
    }
  }, [clearErrors, setError, setValue])

  const onChangeContractCasm = useCallback(async () => {
    const file = contractCasmFileInputRef.current?.files?.[0]
    if (!file) {
      return
    }
    try {
      setContractCasmClassHashIsLoading(true)

      setValue("contractCasm", file.name)
      clearErrors("contractCasm")
      setContractCasmClassHash(null)

      contractCasmRef.current = null

      const contractContent = await readFileAsString(file)

      const contractContentJson = JSON.parse(contractContent)
      const contractCasmClassHash =
        hash.computeCompiledClassHash(contractContentJson)
      if (!contractCasmClassHash) {
        throw new Error("Invalid casm")
      }
      contractCasmRef.current = contractContentJson

      setContractCasmClassHash(contractCasmClassHash)
    } catch (error) {
      setError("contractCasm", {
        type: "invalid",
        message: "Invalid JSON file",
      })
    } finally {
      setContractCasmClassHashIsLoading(false)
    }
  }, [clearErrors, setError, setValue])

  const onSubmit: SubmitHandler<FieldValues> = async ({
    account,
    network,
  }: FieldValues) => {
    if (!contractClassHash) {
      return
    }
    if (!contractJsonRef.current) {
      return
    }
    useAppState.setState({ switcherNetworkId: network })
    await accountService.select({
      address: account,
      networkId: network,
    })
    const payload: DeclareContract = {
      address: account,
      contract: contractJsonRef.current,
      networkId: network,
      classHash: contractClassHash,
    }
    if (contractJsonIsSierra) {
      if (!contractCasmClassHash) {
        throw new Error("Contract casm class hash is missing")
      }
      // can supply either the casm file or its compiledClassHash here
      // payload.casm = contractCasmRef.current
      payload.compiledClassHash = contractCasmClassHash
    }

    await declareContract(payload)
    clearErrors()
  }

  const hasContractJsonError = Boolean(errors.contractJson)
  const hasContractCasmError = Boolean(errors.contractCasm)

  return (
    <chakra.form
      display={"flex"}
      flexDirection={"column"}
      flex={1}
      onSubmit={handleSubmit(onSubmit)}
    >
      <CellStack pt={0} flex={1}>
        <Controller
          name="contractJson"
          control={control}
          rules={{
            required: true,
            validate: () =>
              !(errors.contractJson?.type === "invalid") || "Invalid JSON file",
          }}
          defaultValue=""
          render={({ field: { ref, value, onChange, ...inputProps } }) => (
            <>
              <input
                ref={contractJsonFileInputRef}
                type="file"
                accept="application/json"
                {...inputProps}
                onChange={() => void onChangeContractJson()}
                style={{ display: "none" }}
              />
              <FileInputButton
                value={value}
                isInvalid={hasContractJsonError}
                isLoading={contractClassHashIsLoading}
                onClick={() => contractJsonFileInputRef?.current?.click()}
              >
                {value ? (
                  <FileNameWithClassHash
                    fileName={value}
                    classHash={contractClassHash}
                  />
                ) : (
                  <P3>Click to upload contract JSON</P3>
                )}
              </FileInputButton>
            </>
          )}
        />
        {errors.contractJson && (
          <ErrorMessage
            message={
              errors.contractJson.type === "required"
                ? "A contract is required"
                : "Invalid contract file"
            }
          />
        )}
        {contractJsonIsSierra && (
          <Controller
            name="contractCasm"
            control={control}
            rules={{
              required: true,
              validate: () =>
                !(errors.contractCasm?.type === "invalid") ||
                "Invalid JSON file",
            }}
            defaultValue=""
            render={({ field: { ref, value, onChange, ...inputProps } }) => (
              <>
                <input
                  ref={contractCasmFileInputRef}
                  type="file"
                  accept="application/json"
                  {...inputProps}
                  onChange={() => void onChangeContractCasm()}
                  style={{ display: "none" }}
                />
                <FileInputButton
                  value={value}
                  isInvalid={hasContractCasmError}
                  isLoading={contractCasmClassHashIsLoading}
                  onClick={() => contractCasmFileInputRef?.current?.click()}
                >
                  {value ? (
                    <FileNameWithClassHash
                      fileName={value}
                      classHash={contractCasmClassHash}
                    />
                  ) : (
                    <P3>Click to upload casm JSON</P3>
                  )}
                </FileInputButton>
              </>
            )}
          />
        )}
        {errors.contractCasm && (
          <ErrorMessage
            message={
              errors.contractCasm.type === "required"
                ? "A contract is required"
                : "Invalid casm file"
            }
          />
        )}
        <SpacerCell />

        <Controller
          name="network"
          control={control}
          rules={{ required: true }}
          defaultValue=""
          render={({ field: { onChange, name, value } }) => (
            <Select
              label="Network"
              placeholder="Select network"
              maxH="45vh"
              name={name}
              isInvalid={!isEmpty(errors.network)}
              onChange={onChange}
              options={networkOptions}
              value={value}
            />
          )}
        />
        {!isEmpty(errors.network) && (
          <ErrorMessage message="Network is required" />
        )}

        <Controller
          name="account"
          control={control}
          rules={{ required: true }}
          defaultValue=""
          render={({ field: { onChange, name, value } }) => (
            <Select
              isDisabled={!selectedNetwork}
              label="Account"
              placeholder="Select account"
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
        {!isEmpty(errors.account) && (
          <ErrorMessage message="Account is required" />
        )}

        {children?.({
          isDirty,
          isSubmitting,
          isBusy: contractClassHashIsLoading,
          hasInvalidFile: !isEmpty(errors.contractJson),
        })}
      </CellStack>
    </chakra.form>
  )
}
