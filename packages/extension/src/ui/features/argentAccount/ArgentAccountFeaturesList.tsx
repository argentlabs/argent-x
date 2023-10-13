import { icons, H6 } from "@argent/ui"
import { FC } from "react"
import { Flex, Text, Tooltip } from "@chakra-ui/react"

const { ArgentShieldIcon, EmailIcon, AddressBookIcon } = icons

type ArgentAccountFeaturesListProps = {
  isEmailNotificationsEnabled?: boolean
  isLoggedIn: boolean
  accountsWithShieldEnabled?: { accountName: string }[]
}

export const ArgentAccountFeaturesList: FC<ArgentAccountFeaturesListProps> = ({
  isEmailNotificationsEnabled,
  accountsWithShieldEnabled,
  isLoggedIn,
}) => {
  return (
    <Flex
      direction="column"
      p={5}
      bgColor="neutrals.800"
      borderRadius="lg"
      mb={1}
    >
      <Flex alignItems="start" mb={3}>
        <ArgentShieldIcon fontSize={20} mr={2} />
        <Flex direction="column">
          <H6 lineHeight={4}>Argent Shield</H6>
          <Text mt={1} fontSize={13} color="neutrals.300" lineHeight={4}>
            Protect your account with two-factor authentication (2FA)
          </Text>
          {accountsWithShieldEnabled && (
            <Text
              color="primary.500"
              fontSize={13}
              _hover={{ cursor: "pointer" }}
            >
              Enabled on{" "}
              <Tooltip
                label={accountsWithShieldEnabled.map((acc) => (
                  <Text key={acc.accountName}>{acc.accountName}</Text>
                ))}
              >
                <Text as="u">{accountsWithShieldEnabled.length} accounts</Text>
              </Tooltip>
            </Text>
          )}
        </Flex>
      </Flex>
      <Flex alignItems="start" mb={3}>
        <EmailIcon fontSize={20} mr={2} />
        <Flex direction="column">
          <H6 lineHeight={4}>Email notifications</H6>
          <Text mt={1} fontSize={13} color="neutrals.300" lineHeight={4}>
            Receive important security updates and announcements{" "}
          </Text>
          {isLoggedIn && (
            <Text color="primary.500" fontSize={13}>
              {isEmailNotificationsEnabled ? "Enabled" : "Disabled"}
            </Text>
          )}
        </Flex>
      </Flex>
      <Flex alignItems="start">
        <AddressBookIcon fontSize={20} mr={2} />
        <Flex direction="column">
          <H6 lineHeight={4}>Save account preferences</H6>
          <Text mt={1} fontSize={13} color="neutrals.300" lineHeight={4}>
            Retain your contacts and other preferences when your account is
            restored
          </Text>{" "}
          {isLoggedIn && (
            <Text color="primary.500" fontSize={13}>
              Coming soon
            </Text>
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}
