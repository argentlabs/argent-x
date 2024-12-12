import { icons, P2 } from "@argent/x-ui"
import type { UseCheckboxProps } from "@chakra-ui/react"
import { Flex, FormLabel, useCheckbox } from "@chakra-ui/react"
import type { FC, PropsWithChildren } from "react"

const { RadioEmptyIcon, RadioFilledIcon } = icons

export const OnboardingCheckbox: FC<PropsWithChildren & UseCheckboxProps> = ({
  children,
  ...rest
}) => {
  const { state, getCheckboxProps, getInputProps, htmlProps } =
    useCheckbox(rest)

  return (
    <FormLabel
      display={"flex"}
      flexDirection={"row"}
      alignItems={"center"}
      minHeight={"unset"}
      border={"1px solid"}
      width={"full"}
      rounded={"xl"}
      borderColor={"neutrals.600"}
      gap={5}
      px={6}
      py={5}
      cursor={"pointer"}
      _active={{ transform: "scale(0.975)" }}
      transitionProperty={"common"}
      transitionDuration={"fast"}
      {...htmlProps}
    >
      <input {...getInputProps()} hidden />
      <Flex {...getCheckboxProps()} fontSize={"4xl"}>
        {state.isChecked ? (
          <RadioFilledIcon color={"success.500"} />
        ) : (
          <RadioEmptyIcon color={"neutrals.500"} />
        )}
      </Flex>
      <P2>{children}</P2>
    </FormLabel>
  )
}
