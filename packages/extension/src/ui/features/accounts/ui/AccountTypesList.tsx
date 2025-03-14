import { CellStack, H5, P3Bold, P4Bold } from "@argent/x-ui"
import type { BoxProps } from "@chakra-ui/react"
import { Box, Center, Flex, Spinner } from "@chakra-ui/react"
import type { FC } from "react"

import { CustomButtonCell } from "../../../components/CustomButtonCell"
import { useExtensionIsInTab } from "../../browser/tabs"
import type { AccountType, AccountTypeId } from "../AddNewAccountScreen"

function DetailedDescriptionContainer({
  isSelected,
  ...rest
}: BoxProps & { isSelected: boolean }) {
  return (
    <Box
      {...rest}
      sx={{
        svg: {
          color: isSelected ? "var(--chakra-colors-text-brand)" : "inherit",
        },
      }}
    />
  )
}

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
  return (
    <CellStack p={0} w={"full"}>
      {accountTypes.map(
        ({
          id,
          type,
          title,
          subtitle,
          icon,
          label,
          detailedDescription,
          disabledText,
        }) => (
          <CustomButtonCell
            key={`account-type-${id}`}
            data-testid={
              selectedAccountTypeId === id
                ? `selected-${type}-account`
                : `${type}-account`
            }
            aria-label={title}
            aria-describedby={typeof subtitle === "string" ? subtitle : label}
            p={4}
            alignItems="center"
            justifyContent="space-between"
            gap={3}
            onClick={() => setSelectedAccountTypeId(id)}
            _hover={selectedAccountTypeId !== id ? undefined : {}}
            isDisabled={isAccountTypeDisabled?.(id)}
            border="1px solid"
            sx={{ textWrap: "wrap" }}
            {...(selectedAccountTypeId === id
              ? {
                  backgroundColor: "surface-elevated-web",
                  borderColor: "stroke-brand",
                }
              : {
                  borderColor: "transparent",
                })}
          >
            <Flex direction="column">
              <Flex gap={3} alignItems="center" justify="start">
                <Center
                  borderRadius="full"
                  minWidth={12}
                  height={12}
                  backgroundColor={
                    selectedAccountTypeId === id
                      ? "icon-background-brand"
                      : "surface-elevated-hover"
                  }
                  color={
                    selectedAccountTypeId === id
                      ? "surface-default"
                      : "text-primary"
                  }
                  className="account-type-avatar"
                  alignSelf={extensionIsInTab ? "start" : "center"}
                >
                  {icon}
                </Center>
                <Flex direction="column">
                  <Flex
                    alignItems={"baseline"}
                    direction={{ base: "column", sm: "row" }}
                    gap={{ base: 0, sm: 1 }}
                  >
                    <H5>{title}</H5>
                    {label && (
                      <P4Bold
                        color="text-secondary"
                        border="1px solid"
                        borderColor="stroke-focused"
                        rounded="base"
                        width="fit-content"
                        px={1}
                        py={0.5}
                        mt={{ base: 1, sm: 0 }}
                        ml={{ sm: 1 }}
                      >
                        {label}
                      </P4Bold>
                    )}
                  </Flex>
                  <P3Bold color="text-secondary">
                    {isAccountTypeDisabled?.(id) && disabledText
                      ? disabledText
                      : subtitle}
                  </P3Bold>
                </Flex>
              </Flex>
              <DetailedDescriptionContainer
                ml={{ base: 0, sm: 15 }}
                isSelected={selectedAccountTypeId === id}
              >
                {detailedDescription}
              </DetailedDescriptionContainer>
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
