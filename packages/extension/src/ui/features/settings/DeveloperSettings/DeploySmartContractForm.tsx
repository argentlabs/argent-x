import {
  Alert,
  CellStack,
  Error as ErrorEl,
  Input,
  P4,
  Select,
} from "@argent/ui"
import { Box } from "@chakra-ui/react"
import { isEmpty } from "lodash-es"
import { FC, ReactNode, useCallback, useEffect, useState } from "react"
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form"
import { AbiEntry, number, uint256 } from "starknet"

import { Transaction } from "../../../../shared/transactions"
import { WalletAccount } from "../../../../shared/wallet.model"
import { useAppState } from "../../../app.state"
import { isEqualAddress } from "../../../services/addresses"
import {
  deployContract,
  fetchConstructorParams,
} from "../../../services/udc.service"
import { useSelectedAccountStore } from "../../accounts/accounts.state"
import { ClassHashInputActions } from "./ClassHashInputActions"
import { DeploySmartContractParameters } from "./DeploySmartContractParameters"
import { useLastDeclaredContracts } from "./udc.state"
import { useFormSelects } from "./useFormSelects"

export type ParameterField = {
  name: string
  type: string
  value: string
}

interface FieldValues {
  account: string
  classHash: string
  network: string
  parameters: ParameterField[]
  salt: string
  unique: boolean
}

interface DeploySmartContractFormProps {
  children?: (options: { isDirty: boolean; isSubmitting: boolean }) => ReactNode
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
}

const supportedConstructorTypes = ["felt", "Uint256"]

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
  const { accounts, accountOptions, networkOptions } =
    useFormSelects(currentNetwork)

  const onSubmit: SubmitHandler<FieldValues> = async ({
    account,
    classHash,
    network,
    parameters,
    salt,
    unique,
  }: FieldValues) => {
    const selectedAccount = accounts.find(
      (act: WalletAccount) =>
        isEqualAddress(act.address, account) && act.networkId === network,
    )
    useAppState.setState({ switcherNetworkId: network })
    useSelectedAccountStore.setState({
      selectedAccount,
    })

    const constructorCalldata = parameters.flatMap<string>((param, i) => {
      try {
        if (param.type === "felt") {
          return [number.toHex(number.toBN(param.value))]
        }
        if (param.type === "Uint256") {
          const { low, high } = uint256.bnToUint256(number.toBN(param.value))
          return [low, high]
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
    await deployContract({
      address: account,
      classHash,
      networkId: network,
      constructorCalldata,
      salt,
      unique,
    })
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
      const { abi } = await fetchConstructorParams(
        currentClassHash,
        currentNetwork,
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

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CellStack pb="24">
          <Box position="relative">
            <Input
              {...register("classHash", { required: true })}
              autoFocus
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
            <ErrorEl message="Classhash is required" />
          ) : (
            errors.classHash?.type === "manual" && (
              <ErrorEl message={errors.classHash.message ?? ""} />
            )
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
          {!isEmpty(errors.network) && (
            <ErrorEl message="Network is required" />
          )}

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
          {!isEmpty(errors.account) && (
            <ErrorEl message="Account is required" />
          )}

          {fetchError && (
            <Box mx="4">
              <Alert backgroundColor="error.900" mt="6">
                <P4 color="error.500">{fetchError}</P4>
              </Alert>
            </Box>
          )}
          <DeploySmartContractParameters
            isLoading={isLoading}
            constructorParameters={parameterFields}
          />
          {children?.({ isDirty, isSubmitting })}
        </CellStack>
      </form>
    </FormProvider>
  )
}

export { DeploySmartContractForm }
