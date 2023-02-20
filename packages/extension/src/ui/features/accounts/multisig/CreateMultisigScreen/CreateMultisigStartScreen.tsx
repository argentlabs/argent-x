import { H1, P3 } from "@argent/ui"
import { icons } from "@argent/ui"
import {
  Box,
  Button,
  ButtonProps,
  Center,
  Circle,
  Divider,
  Flex,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

import { StyledControlledInput } from "../../../../components/InputText"
import { FormError } from "../../../../theme/Typography"
import { useSignerKey } from "../useSignerKey"
import { CreateMultisigScreen } from "."

const { CloseIcon, AddIcon, MinusIcon, TickCircleIcon } = icons

const formSchema = z
  .object({
    signerKeys: z
      .object({
        key: z.string().regex(/^[a-zA-Z0-9]{43}$/, "Incorrect signer key"),
      })
      .array(),
    confirmations: z
      .number()
      .positive()
      .min(1, "You need at least one confirmation")
      .default(1),
  })
  // We increment by 1 to include the owner
  .refine((data) => data.confirmations <= data.signerKeys.length + 1, {
    message: "Confirmations should be less than or equal to signer keys",
    path: ["confirmations"],
  })

type FieldValues = z.infer<typeof formSchema>

const FIRST_STEP = 0
const SECOND_STEP = 1
const THIRD_STEP = 2

export const CreateMultisigStartScreen = () => {
  const { encodedPubKey } = useSignerKey()
  const {
    control,
    formState: { errors },
    register,
    getValues,
  } = useForm<FieldValues>({
    mode: "all",
    resolver: zodResolver(formSchema),
  })

  const [currentStep, setStep] = useState(0)
  const { fields, append, remove } = useFieldArray({
    name: "signerKeys",
    control,
  })
  const goNext = () => setStep((step) => step + 1)
  const handleNavigationToConfirmationScreen = () => {
    if (!errors.signerKeys) {
      goNext()
    }
  }
  const handleCreateMultisig = () => {
    if (!errors) {
      // create multisig here
      goNext()
    }
  }
  const goBack = () => setStep((step) => step - 1)
  return (
    <>
      {currentStep === FIRST_STEP && (
        <CreateMultisigScreen
          subtitle="Ask your co-owners to go to “Join existing multisig” in Argent X and send you their signer key"
          currentIndex={FIRST_STEP}
          title="Add owners"
        >
          <P3 textColor={"primary"}>A signer key is NOT an account address</P3>
          <Divider color="neutrals.700" my="4" />
          <Box my="2" width="100%">
            <P3 mb="1">Owner 1 (Me)</P3>
            <StyledControlledInput
              placeholder={encodedPubKey}
              {...register(`signerKeys.-1.key` as const, {
                required: true,
                value: encodedPubKey,
              })}
              control={control}
              disabled={true}
              value={encodedPubKey}
              className={errors?.signerKeys?.[-1]?.key ? "error" : ""}
            />
          </Box>
          {fields.map((field, index) => {
            return (
              <Box key={field.id} my="2" width="100%">
                <P3 mb="1">Owner {index + 2}</P3>
                <InputGroup display="flex" alignItems="center">
                  <StyledControlledInput
                    placeholder="Signer key..."
                    {...register(`signerKeys.${index}.key` as const, {
                      required: true,
                    })}
                    control={control}
                    className={errors?.signerKeys?.[index]?.key ? "error" : ""}
                  />
                  <InputRightElement my="auto">
                    <RoundButton onClick={() => remove(index)}>
                      <CloseIcon />
                    </RoundButton>
                  </InputRightElement>
                </InputGroup>
                {errors.signerKeys && (
                  <FormError>
                    {errors.signerKeys?.[index]?.key?.message}
                  </FormError>
                )}
              </Box>
            )
          })}
          <Center width="100%">
            <Button
              variant="link"
              onClick={() => append({ key: "" })}
              size="xs"
            >
              + Add another owner
            </Button>
          </Center>
          <Button
            colorScheme="primary"
            onClick={handleNavigationToConfirmationScreen}
          >
            Next
          </Button>
        </CreateMultisigScreen>
      )}
      {currentStep === SECOND_STEP && (
        <CreateMultisigScreen
          subtitle="How many owners must confirm each transaction before it’s sent?"
          currentIndex={SECOND_STEP}
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
                        out of {getValues("signerKeys").length + 1} owners
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
        </CreateMultisigScreen>
      )}
      {currentStep === THIRD_STEP && (
        <CreateMultisigScreen
          subtitle="Reopen the Argent X extension and add funds to your multisig to activate"
          currentIndex={THIRD_STEP}
          title={
            <H1 display="flex">
              Multisig created{" "}
              <TickCircleIcon color="#3ED373" alignSelf="flex-end" ml="1" />
            </H1>
          }
          goBack={goBack}
          back={true}
        >
          <Button colorScheme="primary" onClick={() => goNext()}>
            Finish
          </Button>
        </CreateMultisigScreen>
      )}
    </>
  )
}

const RoundButton = ({ onClick, children }: ButtonProps) => {
  return (
    <Button
      onClick={onClick}
      height="5"
      size="xs"
      mr="2"
      my="0"
      mt="0.5em"
      pb="0"
      variant="link"
    >
      <Circle
        backgroundColor="neutrals.800"
        p="0.5em"
        _hover={{
          backgroundColor: "neutrals.600",
        }}
      >
        {children}
      </Circle>
    </Button>
  )
}
