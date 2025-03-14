import { WarningCirclePrimaryIcon } from "@argent/x-ui/icons"
import { H5, P3 } from "@argent/x-ui"
import type { FlexProps } from "@chakra-ui/react"
import { Box, Flex, HStack, VStack } from "@chakra-ui/react"
import type { FC, ReactNode } from "react"

export interface WarningRecoveryBannerProps extends Omit<FlexProps, "title"> {
  title: ReactNode
  reasons: ReactNode[]
}

export const WarningRecoveryBanner: FC<WarningRecoveryBannerProps> = ({
  title,
  reasons,
  ...rest
}) => {
  return (
    <Flex
      p={5}
      pb={6}
      direction={"column"}
      backgroundColor="error.900"
      justifyContent={"center"}
      alignContent={"center"}
      borderRadius="xl"
      {...rest}
    >
      <H5 color="text-danger" mb={5} ml={1} textAlign={"center"}>
        {title}
      </H5>
      <VStack spacing={2} alignItems={"flex-start"}>
        {reasons.map((reason, index) => {
          return (
            <HStack alignItems={"flex-start"} key={`${reason}-${index}`}>
              <Box>
                <WarningCirclePrimaryIcon color="text-danger" fontSize="lg" />
              </Box>
              <P3>{reason}</P3>
            </HStack>
          )
        })}
      </VStack>
    </Flex>
  )
}
