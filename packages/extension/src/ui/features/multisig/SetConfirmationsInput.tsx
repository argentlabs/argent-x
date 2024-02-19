import { FieldError, H1 } from "@argent/ui"
import { icons } from "@argent/ui"
import { Box, Button, Center, Flex } from "@chakra-ui/react"
import { Controller, useFormContext } from "react-hook-form"

import { FieldValuesThresholdForm } from "./hooks/useUpdateThreshold"

const { AddIcon, RemoveIcon } = icons

export const SetConfirmationsInput = ({
  existingThreshold,
  totalSigners,
}: {
  existingThreshold?: number
  totalSigners?: number
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<FieldValuesThresholdForm>()

  return (
    <Box my="2" width="100%">
      <Controller
        name="confirmations"
        control={control}
        defaultValue={existingThreshold}
        rules={{ required: true }}
        render={({ field }) => (
          <>
            <Center>
              <Flex direction="column" width="100%">
                <Flex
                  justifyContent="space-between"
                  width="100%"
                  p="3"
                  backgroundColor="neutrals.800"
                  borderRadius={"lg"}
                  mb="1.5"
                >
                  <Button
                    data-testid="decrease-threshold"
                    borderRadius="full"
                    backgroundColor="neutrals.900"
                    onClick={() =>
                      field.onChange(field.value > 1 ? field.value - 1 : 1)
                    }
                    px="1em"
                  >
                    <RemoveIcon />
                  </Button>
                  <H1 data-testid="threshold" defaultValue={existingThreshold}>
                    {field.value}
                  </H1>
                  <Button
                    data-testid="increase-threshold"
                    borderRadius="90"
                    backgroundColor="neutrals.900"
                    onClick={() =>
                      field.onChange(
                        totalSigners && field.value < totalSigners
                          ? field.value + 1
                          : field.value,
                      )
                    }
                    px="1em"
                  >
                    <AddIcon />
                  </Button>
                </Flex>
                <Center>out of {totalSigners} owners</Center>
              </Flex>
            </Center>
          </>
        )}
      />
      {errors.confirmations && (
        <FieldError>{errors.confirmations.message}</FieldError>
      )}
    </Box>
  )
}
