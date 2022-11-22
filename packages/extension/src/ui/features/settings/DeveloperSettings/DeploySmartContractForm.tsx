import {
  Alert,
  Button,
  CellStack,
  Error,
  H6,
  Input,
  L2,
  P4,
  Select,
  icons,
} from "@argent/ui"
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Spinner,
  Switch,
} from "@chakra-ui/react"
import { get, isEmpty, isEqual } from "lodash-es"
import {
  FC,
  Fragment,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react"
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form"
import { AbiEntry } from "starknet"
import { randomAddress } from "starknet/dist/utils/stark"

import { Transaction } from "../../../../shared/transactions"
import { WalletAccount } from "../../../../shared/wallet.model"
import { useAppState } from "../../../app.state"
import { isEqualAddress } from "../../../services/addresses"
import {
  deployContract,
  fetchConstructorParams,
} from "../../../services/udc.service"
import { useSelectedAccountStore } from "../../accounts/accounts.state"
import { LatestDeclaredContracts } from "./LatestDeclaredContracts"
import { useLastDeclaredContracts } from "./udc.state"
import { useFormSelects } from "./useFormSelects"

interface FieldValues {
  account: string
  classHash: string
  network: string
  parameters: {
    name: string
    type: string
    value: string
  }[]
  salt: string
  unique: boolean
}

const { CloseIcon } = icons

interface DeploySmartContractFormProps {
  children?: (options: { isDirty: boolean; isSubmitting: boolean }) => ReactNode
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
}

const DeploySmartContractForm: FC<DeploySmartContractFormProps> = ({
  children,
  isLoading,
  setIsLoading,
}) => {
  const {
    register,
    resetField,
    control,
    formState,
    handleSubmit,
    clearErrors,
    watch,
    setValue,
  } = useForm<FieldValues>({
    mode: "onSubmit",
  })
  const { errors, isDirty, isSubmitting } = formState

  const [fetchError, setFetchError] = useState("")
  const [currentAbi, setCurrentAbi] = useState()

  const currentNetwork = watch("network")
  const currentClassHash = watch("classHash")

  const { fields, append, remove } = useFieldArray({
    control,
    name: "parameters",
  })

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

    await deployContract({
      address: account,
      classHash,
      networkId: network,
      constructorCalldata: parameters.map((p) => p.value),
      salt,
      unique,
    })
    clearErrors()
  }

  const resetAbiFields = useCallback(() => {
    resetField("parameters")
    fields.map((_, index) => remove(index))
    resetField("salt")
    resetField("unique")
  }, [fields, remove, resetField])

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
      setCurrentAbi(constructorAbi)

      /* 
        same constructor retrieved for network / classhash,
        keep the fields 
      */
      if (isEqual(constructorAbi, currentAbi)) {
        return
      }
      resetAbiFields()
      constructorAbi.inputs.map((input: AbiEntry) => {
        append({ name: input.name, type: input.type, value: "" })
      })
    } catch (error) {
      resetAbiFields()
      setFetchError("Contract classhash not found in this network")
    } finally {
      setIsLoading(false)
    }
  }

  const generateRandomSalt = useCallback(() => {
    setValue("salt", randomAddress())
  }, [setValue])

  useEffect(() => {
    if (currentNetwork && currentClassHash) {
      setFetchError("")
      getConstructorParams(currentClassHash, currentNetwork)
    }
  }, [currentClassHash, currentNetwork])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CellStack>
        <Box position="relative">
          <Input
            {...register("classHash", { required: true })}
            autoFocus
            placeholder="Contract classhash"
            isInvalid={!isEmpty(errors.classHash)}
          />
          {!currentClassHash && (
            <LatestDeclaredContracts
              onClick={(transaction: Transaction) => {
                setValue("classHash", transaction.meta?.subTitle || "")
              }}
              transactions={lastDeclaredContracts}
            />
          )}
          {currentClassHash && (
            <Box
              position="absolute"
              top="50%"
              right="12px"
              transform={"translateY(-50%)"}
              zIndex={10}
            >
              <Button
                color="neutrals.200"
                padding="1.5"
                fontSize="xl"
                size="auto"
                rounded="full"
                onClick={() => {
                  resetField("classHash")
                }}
              >
                <CloseIcon />
              </Button>
            </Box>
          )}
        </Box>
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

        {fields.length > 0 && (
          <>
            <Flex borderTop="1px solid" borderTopColor="neutrals.600" my="5" />
            <Flex justifyContent="space-between">
              <H6>Parameters </H6>
              {isLoading && <Spinner />}
            </Flex>
          </>
        )}

        {fields.map((item, index) => (
          <Fragment key={item.id}>
            <Input
              key={item.id}
              autoFocus={index === 0}
              placeholder={`Constructor argument ${index + 1}`}
              {...register(`parameters.${index}.value`, { required: true })}
              isInvalid={!isEmpty(get(errors, `parameters[0]`))}
            />
            {!isEmpty(get(errors, `parameters[${index}]`)) && (
              <Error message="Constructor argument is required" />
            )}
          </Fragment>
        ))}

        {fetchError && (
          <Box mx="4">
            <Alert backgroundColor="error.900" mt="6">
              <P4 color="error.500">{fetchError}</P4>
            </Alert>
          </Box>
        )}

        {fields.length > 0 && (
          <>
            <Input
              placeholder="Salt"
              {...register("salt")}
              isInvalid={!isEmpty(get(errors, "salt"))}
            />
            <Flex justifyContent="flex-end">
              <L2
                mb="3"
                cursor="pointer"
                color="neutrals.400"
                onClick={generateRandomSalt}
              >
                Generate random
              </L2>
            </Flex>
            <FormControl
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              backgroundColor="neutrals.800"
              borderRadius="8"
              py="4.5"
              px="5"
            >
              <FormLabel htmlFor="unique" mb="0">
                Unique address
              </FormLabel>
              <Switch
                id="unique"
                {...register("unique")}
                colorScheme="primary"
              />
            </FormControl>
          </>
        )}

        {children?.({ isDirty, isSubmitting })}
      </CellStack>
    </form>
  )
}

export { DeploySmartContractForm }
