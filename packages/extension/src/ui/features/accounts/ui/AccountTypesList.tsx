import { CellStack, H6, P4 } from "@argent/x-ui"
import { Center, Flex, Spinner } from "@chakra-ui/react"
import { FC } from "react"
import styled from "styled-components"
import { CustomButtonCell } from "../../../components/CustomButtonCell"
import { useExtensionIsInTab } from "../../browser/tabs"
import { AccountType, AccountTypeId } from "../AddNewAccountScreen"
import { useShowSmartAccountButtonVariant } from "../../../services/onboarding/useOnboardingExperiment"

const DetailedDescriptionContainer = styled.div<{ isSelected: boolean }>`
  svg {
    color: ${({ isSelected, theme }) => (isSelected ? theme.primary : "white")};
  }
`
interface AccountTypesListProps {
  accountTypes: AccountType[]
  isAccountTypeLoading: (id: AccountTypeId) => boolean
  isAccountTypeDisabled?: (id: AccountTypeId) => boolean
  selectedAccountTypeId: AccountTypeId
  setSelectedAccountTypeId: (id: AccountTypeId) => void
}

export const AccountTypesList: FC<AccountTypesListProps> = ({
  accountTypes,
  isAccountTypeLoading,
  selectedAccountTypeId,
  setSelectedAccountTypeId,
  isAccountTypeDisabled,
}) => {
  const extensionIsInTab = useExtensionIsInTab()
  const { showSmartAccountButtonVariant } = useShowSmartAccountButtonVariant()
  return (
    <CellStack p={0} w={"full"}>
      {accountTypes.map(
        ({
          id,
          title,
          subtitle,
          icon,
          label,
          detailedDescription,
          disabledText,
        }) => (
          <CustomButtonCell
            key={`account-type-${id}`}
            aria-label={title}
            aria-describedby={typeof subtitle === "string" ? subtitle : label}
            p={4}
            alignItems="center"
            justifyContent="space-between"
            gap={3}
            onClick={() => setSelectedAccountTypeId(id)}
            _hover={selectedAccountTypeId !== id ? undefined : {}}
            isDisabled={isAccountTypeDisabled?.(id)}
            {...(selectedAccountTypeId === id
              ? {
                  backgroundColor: showSmartAccountButtonVariant
                    ? "surface-elevated-web"
                    : "primary.orange.1000",
                  border: "1px",
                  borderColor: "primary.500",
                  boxSizing: "border-box",
                }
              : {})}
          >
            <Flex direction="column">
              <Flex gap={3} alignItems="center" justify="start">
                <Center
                  borderRadius="full"
                  minWidth={12}
                  height={12}
                  backgroundColor={
                    selectedAccountTypeId === id
                      ? "primary.500"
                      : "neutrals.700"
                  }
                  color={
                    selectedAccountTypeId === id ? "neutrals.700" : "white"
                  }
                  className="account-type-avatar"
                  alignSelf={extensionIsInTab ? "start" : "center"}
                >
                  {icon}
                </Center>
                <Flex direction="column">
                  <Flex
                    direction={["column", null, "row"]}
                    alignItems={["left", null, "center"]}
                  >
                    <H6>{title}</H6>
                    {label && (
                      <P4
                        fontWeight="extrabold"
                        color="neutrals.400"
                        border="1px"
                        borderRadius="4px"
                        width="fit-content"
                        p={"3px"}
                        pt={"2px"}
                        mt={[1, null, 0]}
                        ml={[null, null, 2]}
                      >
                        {label}
                      </P4>
                    )}
                  </Flex>
                  <P4 fontWeight="bold" color="neutrals.300">
                    {isAccountTypeDisabled?.(id) && disabledText
                      ? disabledText
                      : subtitle}
                  </P4>
                  {extensionIsInTab && (
                    <DetailedDescriptionContainer
                      isSelected={selectedAccountTypeId === id}
                    >
                      {detailedDescription}
                    </DetailedDescriptionContainer>
                  )}
                </Flex>
              </Flex>
              {!extensionIsInTab && (
                <DetailedDescriptionContainer
                  isSelected={selectedAccountTypeId === id}
                >
                  {detailedDescription}
                </DetailedDescriptionContainer>
              )}
            </Flex>
            {selectedAccountTypeId === id &&
              isAccountTypeLoading(selectedAccountTypeId) && (
                <Spinner w={4} h={4} position={"absolute"} right={4} />
              )}
          </CustomButtonCell>
        ),
      )}
    </CellStack>
  )
}
