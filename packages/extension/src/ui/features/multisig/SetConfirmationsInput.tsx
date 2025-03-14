import { PlusSecondaryIcon, MinusPrimaryIcon } from "@argent/x-ui/icons"
import { FieldError, MassiveTitle } from "@argent/x-ui"
import { Box, Button, Center, Flex } from "@chakra-ui/react"
import { Controller, useFormContext } from "react-hook-form"

import type { FieldValuesThresholdForm } from "./hooks/useUpdateThreshold"

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
                  backgroundColor="surface-elevated"
                  borderRadius={"lg"}
                  mb="1.5"
                >
                  <Button
                    data-testid="decrease-threshold"
                    backgroundColor="surface-default"
                    onClick={() =>
                      field.onChange(field.value > 1 ? field.value - 1 : 1)
                    }
                    px="1em"
                  >
                    <MinusPrimaryIcon />
                  </Button>
                  <MassiveTitle
                    data-testid="threshold"
                    defaultValue={existingThreshold}
                  >
                    {field.value}
                  </MassiveTitle>
                  <Button
                    data-testid="increase-threshold"
                    backgroundColor="surface-default"
                    onClick={() =>
                      field.onChange(
                        totalSigners && field.value < totalSigners
                          ? field.value + 1
                          : field.value,
                      )
                    }
                    px="1em"
                  >
                    <PlusSecondaryIcon />
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
