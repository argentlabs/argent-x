import { P3, icons } from "@argent/ui"
import {
  Flex,
  FormLabel,
  UseCheckboxProps,
  useCheckbox,
} from "@chakra-ui/react"
import { FC, PropsWithChildren } from "react"

const { CheckboxDefaultIcon, CheckboxActiveIcon } = icons

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
          <CheckboxActiveIcon color={"success.500"} />
        ) : (
          <CheckboxDefaultIcon color={"neutrals.500"} />
        )}
      </Flex>
      <P3>{children}</P3>
    </FormLabel>
  )
}
