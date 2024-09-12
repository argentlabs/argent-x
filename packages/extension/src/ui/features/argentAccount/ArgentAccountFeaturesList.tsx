import { H6, iconsDeprecated } from "@argent/x-ui"
import { Flex, Text, Tooltip } from "@chakra-ui/react"
import { FC } from "react"

const { SmartAccountActiveIcon } = iconsDeprecated

type ArgentAccountFeaturesListProps = {
  isLoggedIn: boolean
  accountsWithGuardianEnabled?: { accountName: string }[]
}

export const ArgentAccountFeaturesList: FC<ArgentAccountFeaturesListProps> = ({
  accountsWithGuardianEnabled,
}) => {
  return (
    <Flex
      direction="column"
      p={5}
      bgColor="neutrals.800"
      borderRadius="lg"
      mb={1}
    >
      <Flex alignItems="start">
        <SmartAccountActiveIcon fontSize={20} mr={2} />
        <Flex direction="column">
          <H6 lineHeight={4}>Smart Account</H6>
          <Text mt={1} fontSize={13} color="neutrals.300" lineHeight={4}>
            Protect your account with two-factor authentication (2FA)
          </Text>
          {accountsWithGuardianEnabled &&
            accountsWithGuardianEnabled.length > 0 && (
              <Text
                color="primary.500"
                fontSize={13}
                _hover={{ cursor: "pointer" }}
              >
                Enabled on{" "}
                <Tooltip
                  label={accountsWithGuardianEnabled.map((acc) => (
                    <Text key={acc.accountName}>{acc.accountName}</Text>
                  ))}
                >
                  <Text as="u">
                    {accountsWithGuardianEnabled.length} accounts
                  </Text>
                </Tooltip>
              </Text>
            )}
        </Flex>
      </Flex>
    </Flex>
  )
}
