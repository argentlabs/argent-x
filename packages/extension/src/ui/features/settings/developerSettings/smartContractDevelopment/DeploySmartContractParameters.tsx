import {
  H6,
  Input,
  L2,
  Switch,
  TextareaAutosize,
  iconsDeprecated,
} from "@argent/x-ui"
import {
  Flex,
  FormControl,
  FormLabel,
  Spinner,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { isNull } from "lodash-es"
import { get, isEmpty } from "lodash-es"
import { FC, useCallback, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { stark } from "starknet"
import { z } from "zod"

const { randomAddress } = stark

const { InfoIcon } = iconsDeprecated

const DeploySmartContractParameters: FC<{
  isLoading: boolean
  constructorParameters: any
}> = ({ isLoading, constructorParameters }) => {
  const { register, formState, setValue, watch } = useFormContext()
  const { errors } = formState
  const parameters = watch("parameters")

  const generateRandomSalt = useCallback(() => {
    setValue("salt", randomAddress())
  }, [setValue])
  const constructorAbi = constructorParameters?.find(
    (item: { type: string }) => item?.type === "constructor",
  )
  useEffect(() => {
    const processInput = (input?: unknown) => {
      if (typeof input === "undefined") {
        return undefined
      }
      const parsedInput = z.coerce.string().parse(input)
      return parsedInput?.split(",").map((item) => item.trim())
    }

    setValue("parameters", processInput(parameters))
  }, [parameters, setValue])

  return (
    <>
      {!isNull(constructorParameters) && (
        <>
          <Flex borderTop="1px solid" borderTopColor="neutrals.600" my="5" />
          <Flex justifyContent="space-between">
            <H6>Parameters </H6>
            {isLoading && <Spinner />}
          </Flex>
        </>
      )}
      {constructorAbi && "inputs" in constructorAbi && (
        <TextareaAutosize
          placeholder={`Your deployment parameters as comma separated values based on the following requirements: \n ${JSON.stringify(
            constructorAbi["inputs"],
          )}`}
          {...register("parameters")}
          isInvalid={!isEmpty(get(errors, "parameters"))}
        />
      )}

      {!isNull(constructorParameters) && (
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
            <FormLabel
              htmlFor="unique"
              mb="0"
              display="flex"
              alignItems="center"
            >
              Unique address
              <Tooltip label="The generated address is unique to the deployer of the contract and cannot be squatted">
                <Text fontSize="xs" pl="2">
                  <InfoIcon />
                </Text>
              </Tooltip>
            </FormLabel>
            <Switch id="unique" {...register("unique")} colorScheme="primary" />
          </FormControl>
        </>
      )}
    </>
  )
}

export { DeploySmartContractParameters }
