import { FC, ReactNode } from "react"

import { CopyTooltip, icons, H6, P4 } from "@argent/ui"
import { Box, Flex } from "@chakra-ui/react"

const { CopyIcon } = icons

interface OptionProps {
  icon: ReactNode
  title: ReactNode
  description?: string
  onClick?: () => void
  disabled?: boolean
  copyValue?: string
}

export const Option: FC<OptionProps> = ({
  icon,
  title,
  description,
  onClick,
  disabled,
  copyValue,
}) => (
  <Flex
    gap={3}
    alignItems="center"
    p={4}
    borderRadius={8}
    onClick={onClick}
    cursor={disabled ? "auto" : "pointer"}
    pointerEvents={disabled ? "none" : "auto"}
    bg="neutrals.800"
    opacity={disabled ? 0.4 : 1}
    boxShadow="menu"
    _hover={{ bg: "neutrals.700" }}
  >
    {icon && (
      <Flex p={3} borderRadius="50%" bg="neutrals.700">
        {icon}
      </Flex>
    )}
    <Flex grow={1} direction="column" justifySelf="flex-start">
      <H6>{title}</H6>
      {description && (
        <P4 fontWeight="bold" color="neutrals.300">
          {description}
        </P4>
      )}
    </Flex>
    {copyValue && (
      <Flex p={2} bg="neutrals.700" borderRadius="50%">
        <CopyTooltip copyValue={copyValue}>
          <Box
            onClick={(e) => {
              /** prevent opening the parent link */
              e.stopPropagation()
            }}
          >
            <CopyIcon width={4} height={4} />
          </Box>
        </CopyTooltip>
      </Flex>
    )}
  </Flex>
)
