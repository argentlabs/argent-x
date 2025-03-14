import type { ReactNode } from "react"

import { CopyPrimaryIcon } from "@argent/x-ui/icons"

import { CopyTooltip, H5, P4 } from "@argent/x-ui"
import type { ButtonProps } from "@chakra-ui/react"
import { Box, Button, Circle, Flex, forwardRef } from "@chakra-ui/react"

interface OptionProps extends Omit<ButtonProps, "title" | "rightIcon"> {
  icon: ReactNode
  title: ReactNode
  description?: string
  copyValue?: string
  rightIcon?: ReactNode
  rightIconColor?: string
}

export const Option = forwardRef<OptionProps, "div">(
  (
    {
      icon,
      title,
      description,
      copyValue,
      rightIcon,
      rightIconColor = "text-secondary",
      ...rest
    },
    ref,
  ) => (
    <Button
      gap={3}
      alignItems="center"
      h={"initial"}
      textAlign={"left"}
      fontWeight={"initial"}
      rounded={"xl"}
      p={4}
      ref={ref}
      {...rest}
    >
      {icon && (
        <Circle size={10} bg="icon-background" fontSize="xl">
          {icon}
        </Circle>
      )}
      <Flex grow={1} direction="column" justifySelf="flex-start" gap={0.5}>
        <H5>{title}</H5>
        {description && <P4 color="text-secondary">{description}</P4>}
      </Flex>
      {rightIcon && (
        <Flex ml="auto" fontSize="base" color={rightIconColor}>
          {rightIcon}
        </Flex>
      )}
      {copyValue && (
        <Flex p={2} bg="neutrals.700" borderRadius="50%">
          <CopyTooltip copyValue={copyValue}>
            <Box
              onClick={(e) => {
                /** prevent opening the parent link */
                e.stopPropagation()
              }}
            >
              <CopyPrimaryIcon width={4} height={4} />
            </Box>
          </CopyTooltip>
        </Flex>
      )}
    </Button>
  ),
)
