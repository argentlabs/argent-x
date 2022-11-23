import { Error, H6, Input, L2, Switch } from "@argent/ui"
import { Flex, FormControl, FormLabel, Spinner } from "@chakra-ui/react"
import { get, isEmpty } from "lodash-es"
import { FC, Fragment, useCallback, useEffect } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { randomAddress } from "starknet/dist/utils/stark"

const DeploySmartContractParameters: FC<{
  isLoading: boolean
  constructorParameters: any
}> = ({ isLoading, constructorParameters }) => {
  const { control, register, formState, setValue, resetField } =
    useFormContext()
  const { errors } = formState
  const { fields, append, remove } = useFieldArray({
    control,
    name: "parameters",
  })

  useEffect(() => {
    if (constructorParameters.length === 0) {
      resetField("parameters")
      fields.map((_, index) => remove(index))
    } else {
      constructorParameters.map((input: any) => {
        append({ name: input.name, type: input.type, value: "" })
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [constructorParameters, append, resetField, remove])

  const generateRandomSalt = useCallback(() => {
    setValue("salt", randomAddress())
  }, [setValue])

  return (
    <>
      {fields.length > 0 && (
        <>
          <Flex borderTop="1px solid" borderTopColor="neutrals.600" my="5" />
          <Flex justifyContent="space-between">
            <H6>Parameters </H6>
            {isLoading && <Spinner />}
          </Flex>
          {fields.map((item, index) => (
            <Fragment key={item.id}>
              <Input
                key={item.id}
                autoFocus={index === 0}
                placeholder={`Constructor argument ${index + 1}`}
                {...register(`parameters.${index}.value`, {
                  required: true,
                })}
                isInvalid={!isEmpty(get(errors, `parameters[0]`))}
              />
              {!isEmpty(get(errors, `parameters[${index}]`)) && (
                <Error message="Constructor argument is required" />
              )}
            </Fragment>
          ))}
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
            <Switch id="unique" {...register("unique")} colorScheme="primary" />
          </FormControl>
        </>
      )}
    </>
  )
}

export { DeploySmartContractParameters }
