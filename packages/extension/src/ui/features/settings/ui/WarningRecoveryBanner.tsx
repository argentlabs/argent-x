import { H6, P4, icons } from "@argent/ui"
import { Box, Flex, FlexProps, HStack, VStack } from "@chakra-ui/react"
import { FC, ReactNode } from "react"

const { AlertFillIcon } = icons

interface WarningRecoveryBannerProps extends Omit<FlexProps, "title"> {
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
      <H6 color="errorText" mb={5} ml={1} textAlign={"center"}>
        {title}
      </H6>
      <VStack spacing={2} alignItems={"flex-start"}>
        {reasons.map((reason, index) => {
          return (
            <HStack alignItems={"flex-start"} key={`${reason}-${index}`}>
              <Box>
                <AlertFillIcon color="errorText" fontSize="lg" />
              </Box>
              <P4>{reason}</P4>
            </HStack>
          )
        })}
      </VStack>
    </Flex>
  )
}
