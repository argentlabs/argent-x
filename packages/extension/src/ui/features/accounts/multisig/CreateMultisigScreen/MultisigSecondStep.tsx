import { H1 } from "@argent/ui"
import { icons } from "@argent/ui"
import { Box, Button, Center, Flex } from "@chakra-ui/react"
import { Controller, useFormContext } from "react-hook-form"

import { isEmptyValue } from "../../../../../shared/utils/object"
import { useAppState } from "../../../../app.state"
import { FormError } from "../../../../theme/Typography"
import { useNetwork } from "../../../networks/useNetworks"
import { useSignerKey } from "../useSignerKey"
import { ScreenLayout } from "./ScreenLayout"
import { useCreateMultisig } from "./useCreateMultisig"
import { FieldValues } from "./useCreateMultisigForm"

const { AddIcon, MinusIcon } = icons

export const MultisigSecondStep = ({
  index,
  goBack,
  goNext,
}: {
  index: number
  goBack: () => void
  goNext: () => void
}) => {
  const { switcherNetworkId } = useAppState()
  const { encodedPubKey } = useSignerKey()
  const { createMultisigAccount, isError } = useCreateMultisig()
  const network = useNetwork(switcherNetworkId)
  const {
    control,
    formState: { errors },
    getValues,
  } = useFormContext<FieldValues>()

  const handleCreateMultisig = async () => {
    if (isEmptyValue(errors) && encodedPubKey) {
      const result = await createMultisigAccount({
        networkId: network.id,
        signers: [...getValues("signerKeys").map((i) => i.key), encodedPubKey],
        threshold: getValues("confirmations").toString(),
      })
      if (result) {
        goNext()
      }
    }
  }

  return (
    <ScreenLayout
      subtitle="How many owners must confirm each transaction before it’s sent?"
      currentIndex={index}
      title="Set confirmations"
      goBack={goBack}
      back={true}
    >
      <Box my="2" width="100%">
        <Controller
          name="confirmations"
          control={control}
          defaultValue={1}
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
                    borderRadius="8px"
                    mb="1.5"
                  >
                    <Button
                      borderRadius="90"
                      backgroundColor="neutrals.900"
                      onClick={() => field.onChange(field.value - 1)}
                      px="1em"
                    >
                      <MinusIcon />
                    </Button>
                    <H1>{field.value}</H1>
                    <Button
                      borderRadius="90"
                      backgroundColor="neutrals.900"
                      onClick={() => field.onChange(field.value + 1)}
                      px="1em"
                    >
                      <AddIcon />
                    </Button>
                  </Flex>
                  <Center>
                    out of {getValues("signerKeys")?.length + 1} owners
                  </Center>
                </Flex>
              </Center>
            </>
          )}
        />
        {errors.confirmations && (
          <FormError>{errors.confirmations.message}</FormError>
        )}
      </Box>
      <Button colorScheme="primary" onClick={handleCreateMultisig} mt="3">
        Create multisig
      </Button>
      {isError && (
        <Box mt="2">
          <FormError>Something went wrong creating the multisig</FormError>
        </Box>
      )}
    </ScreenLayout>
  )
}
