import { BarCloseButton, H6, NavigationContainer, P4 } from "@argent/ui"
import { Center, Flex, Spinner } from "@chakra-ui/react"
import { FC, ReactEventHandler } from "react"

import { CustomButtonCell } from "../../components/CustomButtonCell"
import { AccountType, AccountTypeId } from "./AddNewAccountScreenContainer"

interface AddNewAccountScreenProps {
  onClose: ReactEventHandler
  accountTypes: AccountType[]
  isAccountTypeLoading: (id: AccountTypeId) => boolean
  onAccountTypeClick: (id: AccountTypeId) => void
}

export const AddNewAccountScreen: FC<AddNewAccountScreenProps> = ({
  onClose,
  accountTypes,
  isAccountTypeLoading,
  onAccountTypeClick,
}) => {
  return (
    <NavigationContainer
      rightButton={<BarCloseButton onClick={onClose} />}
      title="Add a new account"
    >
      <Flex p={4} gap={2} direction="column">
        {accountTypes.map(({ id, title, subtitle, icon }) => (
          <CustomButtonCell
            key={`account-type-${id}`}
            aria-label={title}
            aria-describedby={subtitle}
            p={4}
            alignItems="center"
            justifyContent="space-between"
            gap={3}
            onClick={() => onAccountTypeClick(id)}
            _hover={{
              backgroundColor: "neutrals.700",
              "& > .account-type-avatar": {
                backgroundColor: "neutrals.600",
              },
            }}
          >
            <Flex gap={3} alignItems="center" justify="start">
              <Center
                borderRadius="full"
                width={12}
                height={12}
                backgroundColor="neutrals.700"
                className="account-type-avatar"
              >
                {icon}
              </Center>
              <Flex direction="column" flex={0.5}>
                <H6>{title}</H6>
                <P4 fontWeight="bold" color="neutrals.300">
                  {subtitle}
                </P4>
              </Flex>
            </Flex>
            {isAccountTypeLoading(id) && <Spinner w={4} h={4} />}
          </CustomButtonCell>
        ))}
      </Flex>
    </NavigationContainer>
  )
}
