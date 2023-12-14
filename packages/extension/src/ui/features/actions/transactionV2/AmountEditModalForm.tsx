import { BigDecimal, bigDecimal } from "@argent/shared"
import { ModalDialog, icons, Input, FieldError, P3 } from "@argent/ui"
import { Button, Flex, InputGroup, InputRightElement } from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { FC } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const { TickIcon } = icons
const { createUnitsSchema } = bigDecimal

interface AmountEditModalFormProps {
  isOpen: boolean
  onClose: () => void
  title: string
  onSubmit: (e: { amount: BigDecimal }) => void
  defaultAmount: BigDecimal
  currency?: string
  buttonTitle?: string
  decimals?: number
}
export const AmountEditModalForm: FC<AmountEditModalFormProps> = ({
  isOpen,
  onClose,
  title,
  onSubmit,
  defaultAmount,
  currency = "ETH",
  buttonTitle = "Save",
  decimals = 18,
}) => {
  const formSchema = z.object({
    amount: createUnitsSchema(decimals),
  })
  type FormType = z.infer<typeof formSchema>

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormType>({
    defaultValues: {
      amount: defaultAmount,
    },
    resolver: zodResolver(formSchema),
  })

  return (
    <ModalDialog isOpen={isOpen} onClose={onClose} title={title}>
      <Flex
        direction="column"
        justifyContent="space-between"
        alignItems="center"
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        w="100%"
        position="relative"
      >
        <Flex w="100%">
          <InputGroup>
            <Input {...register("amount")} w="100%" />
            <InputRightElement mr={2}>
              <P3 color="neutrals.200">{currency}</P3>
            </InputRightElement>
          </InputGroup>
        </Flex>
        {errors.amount && (
          <FieldError px={4} mt={4} textAlign={"center"}>
            {errors?.amount.message}
          </FieldError>
        )}
        <Button colorScheme="gray" leftIcon={<TickIcon />} type="submit" mt={4}>
          {buttonTitle}
        </Button>
      </Flex>
    </ModalDialog>
  )
}
