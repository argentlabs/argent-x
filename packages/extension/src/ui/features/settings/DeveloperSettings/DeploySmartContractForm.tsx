import { FC, ReactNode, useCallback, useEffect, useState } from "react"

import {
  Alert,
  CellStack,
  ErrorMessage,
  Input,
  Select,
  SpacerCell,
  icons,
} from "@argent/ui"
import { Box, chakra } from "@chakra-ui/react"
import { isEmpty } from "lodash-es"
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form"
import { AbiEntry, num, uint256 } from "starknet"

import { accountService } from "../../../../shared/account/service"
import { Transaction } from "../../../../shared/transactions"
import { useAppState } from "../../../app.state"
import { udcService } from "../../../services/udc"
import {
  DeployContractServicePayload,
  deployContract,
} from "../../../services/udc.service"

import { ClassHashInputActions } from "./ClassHashInputActions"
import { DeploySmartContractParameters } from "./DeploySmartContractParameters"
import { useLastDeclaredContracts } from "./udc.state"
import { useFormSelects } from "./useFormSelects"
import { useAutoFocusInputRef } from "../../../hooks/useAutoFocusInputRef"
import { FieldValues, ParameterField } from "./deploySmartContractForm.model"

const { AlertIcon } = icons

interface DeploySmartContractFormProps {
  children?: (options: { isDirty: boolean; isSubmitting: boolean }) => ReactNode
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
}

const supportedConstructorTypes = ["felt", "Uint256", "felt*"]

const DeploySmartContractForm: FC<DeploySmartContractFormProps> = ({
  children,
  isLoading,
  setIsLoading,
}) => {
  const methods = useForm<FieldValues>({
    mode: "onSubmit",
  })

  const {
    register,
    resetField,
    control,
    formState,
    handleSubmit,
    clearErrors,
    setError,
    watch,
    setValue,
  } = methods
  const { errors, isDirty, isSubmitting } = formState

  const [fetchError, setFetchError] = useState("")
  const [parameterFields, setParameterFields] = useState<
    ParameterField[] | null
  >(null)

  const currentNetwork = watch("network")
  const currentClassHash = watch("classHash")

  const lastDeclaredContracts = useLastDeclaredContracts({ limit: 10 })
  const { accountOptions, networkOptions } = useFormSelects(currentNetwork)

  const onSubmit: SubmitHandler<FieldValues> = async ({
    account,
    classHash,
    network,
    parameters,
    salt,
    unique,
  }: FieldValues) => {
    useAppState.setState({ switcherNetworkId: network })

    await accountService.select({
      address: account,
      networkId: network,
    })

    const constructorCalldata = parameters.flatMap<string>((param, i) => {
      try {
        if (param.type === "felt") {
          return [num.toHex(param.value)]
        }
        if (param.type === "felt*") {
          return param.value.map((value) => num.toHex(value))
        }
        if (param.type === "Uint256") {
          const { low, high } = uint256.bnToUint256(num.toBigInt(param.value))
          return [low, high].map(num.toHex)
        }
        setError(`parameters.${i}`, {
          type: "manual",
          message: `Unsupported type ${param.type}`,
        })
        throw new Error(`Unsupported type ${param.type}`)
      } catch (e) {
        setError(`parameters.${i}`, {
          type: "manual",
          message:
            "Invalid parameter. Only hex and decimal numbers are supported",
        })
        throw new Error("Invalid parameter")
      }
    })

    clearErrors()

    const payload: DeployContractServicePayload = {
      address: account,
      networkId: network,
      classHash,
      constructorCalldata,
      unique,
    }
    if (salt !== "") {
      payload.salt = salt
    }
    await deployContract(payload)
  }

  const resetAbiFields = useCallback(() => {
    resetField("parameters")
    resetField("salt")
    resetField("unique")
    setParameterFields(null)
  }, [resetField])

  const getConstructorParams = async (
    currentClassHash: string,
    currentNetwork: string,
  ) => {
    setIsLoading(true)
    try {
      const { abi } = await udcService.getConstructorParams(
        currentNetwork,
        currentClassHash,
      )
      const constructorAbi = abi?.find((item) => item.type === "constructor")
      setParameterFields(
        constructorAbi?.inputs.map((input: AbiEntry) => {
          if (!supportedConstructorTypes.includes(input.type)) {
            throw Error(
              `Unsupported constructor type "${input.type}" for ${
                input.name
              }. Only ${supportedConstructorTypes.join(", ")} are supported.`,
            )
          }

          if (input.type.endsWith("*")) {
            return {
              name: input.name,
              type: input.type,
              value: [],
            }
          }
          return {
            name: input.name,
            type: input.type,
            value: "",
          }
        }) || [],
      )
    } catch (e) {
      resetAbiFields()
      if (
        e instanceof Error &&
        e.message.startsWith("Unsupported constructor type")
      ) {
        setError("classHash", {
          type: "manual",
          message: e.message,
        })
      } else {
        setFetchError("Contract classhash not found in this network")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (currentNetwork && currentClassHash) {
      setFetchError("")
      getConstructorParams(currentClassHash, currentNetwork)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentClassHash, currentNetwork])

  const inputRef = useAutoFocusInputRef<HTMLInputElement>()
  const { ref, ...classHashInputRest } = register("classHash", {
    required: true,
  })

  return (
    <FormProvider {...methods}>
      <chakra.form
        display={"flex"}
        flexDirection={"column"}
        flex={1}
        onSubmit={handleSubmit(onSubmit)}
      >
        <CellStack pt={0} flex={1}>
          <Box position="relative">
            <Input
              {...classHashInputRest}
              ref={(e) => {
                ref(e)
                inputRef.current = e
              }}
              placeholder="Contract classhash"
              isInvalid={!isEmpty(errors.classHash)}
            />
            <ClassHashInputActions
              classHash={currentClassHash}
              onClick={(transaction: Transaction) => {
                setValue("classHash", transaction.meta?.subTitle || "")
                clearErrors("classHash")
              }}
              reset={() => resetField("classHash")}
              transactions={lastDeclaredContracts}
            />
          </Box>
          {errors.classHash?.type === "required" ? (
            <ErrorMessage message="Classhash is required" />
          ) : (
            errors.classHash?.type === "manual" && (
              <ErrorMessage message={errors.classHash.message ?? ""} />
            )
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
                isDisabled={!currentNetwork}
                label="Account"
                placeholder="Select account"
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
          {!isEmpty(errors.account) && (
            <ErrorMessage message="Account is required" />
          )}

          {fetchError && (
            <>
              <SpacerCell />
              <Alert
                icon={<AlertIcon />}
                colorScheme={"error"}
                description={fetchError}
              />
            </>
          )}
          <SpacerCell />

          <DeploySmartContractParameters
            isLoading={isLoading}
            constructorParameters={parameterFields}
          />
          {children?.({ isDirty, isSubmitting })}
        </CellStack>
      </chakra.form>
    </FormProvider>
  )
}

export { DeploySmartContractForm }
