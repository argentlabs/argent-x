import { FC, ReactNode } from "react"

import { CellStack, ErrorMessage, Input, Select, SpacerCell } from "@argent/ui"
import { Box, chakra } from "@chakra-ui/react"
import { isEmpty } from "lodash-es"
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form"

import { Transaction } from "../../../../../shared/transactions"
import { useAppState } from "../../../../app.state"

import { ClassHashInputActions } from "./ClassHashInputActions"
import { useLastDeclaredContracts } from "./udc.state"
import { useFormSelects } from "./useFormSelects"
import { useAutoFocusInputRef } from "../../../../hooks/useAutoFocusInputRef"
import { DeploySmartContractParametersContainer } from "./DeploySmartContractParametersContainer"
import { udcService } from "../../../../services/udc"
import { DeployContractPayload } from "../../../../../shared/udc/service/interface"
import { clientAccountService } from "../../../../services/account"
import { FieldValues } from "../../../../../shared/udc/schema"

interface DeploySmartContractFormProps {
  children?: (options: { isDirty: boolean; isSubmitting: boolean }) => ReactNode
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
}

const DeploySmartContractForm: FC<DeploySmartContractFormProps> = ({
  children,
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
    watch,
    setValue,
    setError,
  } = methods
  const { errors, isDirty, isSubmitting } = formState

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
    try {
      useAppState.setState({ switcherNetworkId: network })

      await clientAccountService.select({
        address: account,
        networkId: network,
      })

      const payload: DeployContractPayload = {
        address: account,
        networkId: network,
        classHash,
        constructorCalldata: parameters,
        unique,
        salt: !salt ? "0" : salt, // Using empty string will cause toBigInt to fail. Therefore we use 0 salt.
      }

      await udcService.deployContract(payload)
    } catch (e) {
      console.error(e)
      if (e instanceof Error) {
        setError("root", {
          message: e.message,
        })
      }
    }
  }

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
          {Boolean(currentClassHash) && Boolean(currentNetwork) && (
            <DeploySmartContractParametersContainer
              currentClassHash={currentClassHash}
              currentNetwork={currentNetwork}
            />
          )}
          {children?.({ isDirty, isSubmitting })}
        </CellStack>
      </chakra.form>
    </FormProvider>
  )
}

export { DeploySmartContractForm }
