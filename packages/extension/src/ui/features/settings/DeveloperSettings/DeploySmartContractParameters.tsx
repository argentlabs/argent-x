import {
  CellStack,
  ErrorMessage,
  H6,
  Input,
  L2,
  Switch,
  icons,
} from "@argent/ui"
import {
  Flex,
  FormControl,
  FormLabel,
  Spinner,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { isNull, isNumber } from "lodash-es"
import { get, isEmpty } from "lodash-es"
import { FC, Fragment, useCallback, useEffect } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { stark } from "starknet"

import { ParameterField } from "./DeploySmartContractForm"

const { randomAddress } = stark

const { InfoIcon } = icons

const DeploySmartContractParameters: FC<{
  isLoading: boolean
  constructorParameters: ParameterField[] | null
}> = ({ isLoading, constructorParameters }) => {
  const { control, register, formState, setValue, resetField, watch } =
    useFormContext()
  const { errors } = formState
  const { fields, append, remove } = useFieldArray({
    control,
    name: "parameters",
  })

  useEffect(() => {
    resetField("parameters")
    fields.map((_, index) => remove(index))

    constructorParameters?.map((input) => {
      append({ name: input.name, type: input.type, value: input.value })
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [constructorParameters, append, resetField, remove])

  const generateRandomSalt = useCallback(() => {
    setValue("salt", randomAddress())
  }, [setValue])

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

      {fields.map((item, index) => {
        const value: string | string[] = get(item, "value", "")
        if (Array.isArray(value)) {
          const prevValue: string =
            watch(`parameters.${index - 1}.value`) || "0"
          const parsedPrevValue = parseInt(prevValue, 10)

          if (
            !isNumber(parsedPrevValue) ||
            isNaN(parsedPrevValue) ||
            parsedPrevValue <= 0
          ) {
            return null
          }

          return (
            <CellStack
              key={`${item.id}`}
              bgColor="neutrals.700"
              borderRadius="lg"
            >
              <L2>
                {get(item, "name", "")}: {get(item, "type", "felt*")}
              </L2>
              {Array(parsedPrevValue)
                .fill(0)
                .map((_, i) => {
                  return (
                    <Fragment key={`${item.id}[${i}]`}>
                      <Input
                        key={`${item.id}[${i}]`}
                        autoFocus={index === 0}
                        placeholder={`${get(item, "name", "")}[${i}]: ${get(
                          item,
                          "type",
                          "felt",
                        ).replace("*", "")}`}
                        {...register(`parameters.${index}.value.${i}`, {
                          required: true,
                        })}
                        isInvalid={
                          !isEmpty(get(errors, `parameters[${index}]`))
                        }
                      />
                      {get(errors, `parameters[${index}][${i}]`)?.type ===
                      "required" ? (
                        <ErrorMessage message="Constructor argument is required" />
                      ) : (
                        get(errors, `parameters[${index}][${i}]`)?.type ===
                          "manual" && (
                          <ErrorMessage
                            message={
                              (get(errors, `parameters[${index}][${i}]`)
                                ?.message as string) ?? ""
                            }
                          />
                        )
                      )}
                    </Fragment>
                  )
                })}
            </CellStack>
          )
        }
        return (
          <Fragment key={item.id}>
            <Input
              key={item.id}
              autoFocus={index === 0}
              placeholder={`${get(item, "name", "")}: ${get(
                item,
                "type",
                "felt",
              )}`}
              {...register(`parameters.${index}.value`, {
                required: true,
              })}
              isInvalid={!isEmpty(get(errors, `parameters[${index}]`))}
            />
            {get(errors, `parameters[${index}]`)?.type === "required" ? (
              <ErrorMessage message="Constructor argument is required" />
            ) : (
              get(errors, `parameters[${index}]`)?.type === "manual" && (
                <ErrorMessage
                  message={
                    (get(errors, `parameters[${index}]`)?.message as string) ??
                    ""
                  }
                />
              )
            )}
          </Fragment>
        )
      })}
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
