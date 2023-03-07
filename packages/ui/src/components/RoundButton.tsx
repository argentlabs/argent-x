import { Button, ButtonProps, Circle } from "@chakra-ui/react"

export const RoundButton = (props: ButtonProps) => {
  return (
    <Button {...props}>
      <Circle
        backgroundColor="neutrals.800"
        p="0.5em"
        _hover={{
          backgroundColor: "neutrals.600",
        }}
      >
        {props.children}
      </Circle>
    </Button>
  )
}
