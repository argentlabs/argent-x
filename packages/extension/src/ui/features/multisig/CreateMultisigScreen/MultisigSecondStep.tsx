import { FieldError, H1 } from "@argent/ui"
import { icons } from "@argent/ui"
import { Box, Button, Center, Flex } from "@chakra-ui/react"
import { Controller, useFormContext } from "react-hook-form"

import { isEmptyValue } from "../../../../shared/utils/object"
import { useAppState } from "../../../app.state"
import { useSelectedAccount } from "../../accounts/accounts.state"
import { useNextPublicKey, useNextSignerKey } from "../../accounts/usePublicKey"
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
  const creatorPubKey = useNextPublicKey()
  const creatorSignerKey = useNextSignerKey()
  const { createMultisigAccount, isError } = useCreateMultisig()
  const {
    control,
    formState: { errors },
    getValues,
  } = useFormContext<FieldValues>()

  const selectedAccount = useSelectedAccount()

  const handleCreateMultisig = async () => {
    if (isEmptyValue(errors) && creatorSignerKey && selectedAccount) {
      const signers = [creatorSignerKey].concat(
        getValues("signerKeys").map((i) => i.key),
      )

      const threshold = getValues("confirmations")

      const result = await createMultisigAccount({
        creator: creatorPubKey,
        signers,
        threshold,
        networkId: switcherNetworkId,
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
                    borderRadius={'lg'}
                    mb="1.5"
                  >
                    <Button
                      borderRadius="full"
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
          <FieldError>{errors.confirmations.message}</FieldError>
        )}
      </Box>
      <Button colorScheme="primary" onClick={handleCreateMultisig} mt="3">
        Create multisig
      </Button>
      {isError && (
        <Box mt="2">
          <FieldError>Something went wrong creating the multisig</FieldError>
        </Box>
      )}
    </ScreenLayout>
  )
}
