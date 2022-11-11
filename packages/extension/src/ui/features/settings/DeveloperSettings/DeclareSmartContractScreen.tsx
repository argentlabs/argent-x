import {
  B3,
  BarBackButton,
  Button,
  H6,
  Input,
  NavigationContainer,
  icons,
} from "@argent/ui"
import {
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
} from "@chakra-ui/react"
/* import { Select } from "chakra-react-select" */
import { FC, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { accountStore } from "../../../../shared/account/store"
import { useArrayStorage } from "../../../../shared/storage/hooks"
import {
  getAccountName,
  useAccountMetadata,
} from "../../accounts/accountMetadata.state"
import { StickyGroup } from "../../actions/ConfirmScreen"
import { useNetworks } from "../../networks/useNetworks"
import { DeclareSmartContractForm } from "./DeclareSmartContractForm"

const { ChevronDownIcon } = icons

const DeclareSmartContractScreen: FC = () => {
  const navigate = useNavigate()
  const allNetworks = useNetworks()
  const allAccounts = useArrayStorage(accountStore)

  const [accounts, setAccounts] = useState<any>([])

  const { accountNames } = useAccountMetadata()

  /* useEffect(() => {
    setAccounts(
      allAccounts.filter(
        (account) => account.networkId === selectedNetwork?.id,
      ),
    )
  }, [allAccounts, selectedNetwork]) */

  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={() => navigate(-1)} />}
      title={"Declare smart contract"}
    >
      <DeclareSmartContractForm>
        {({ isDirty, isSubmitting }) => (
          <StickyGroup>
            <Button
              gap="2"
              colorScheme="primary"
              type="submit"
              disabled={!isDirty || isSubmitting}
              width="100%"
              /* isLoading={isLoading} */
              loadingText="Unlocking"
            >
              Declare
            </Button>
          </StickyGroup>
        )}
      </DeclareSmartContractForm>
      {/* 
        <Menu matchWidth>
          <MenuButton aria-label="Network">
            <InputGroup>
              <Input
                colorScheme={"neutrals"}
                placeholder={"Network"}
                _placeholder={{ color: "white" }}
              />
              <InputRightElement
                h="100%"
                w="auto"
                gap={2}
                mr="3"
                display="flex"
                alignItems="center"
                zIndex={0}
              >
                <H6>{selectedNetwork?.name}</H6>
                <Text color="neutrals.200">
                  <ChevronDownIcon />
                </Text>
              </InputRightElement>
            </InputGroup>
          </MenuButton>
          <MenuList borderRadius={0}>
            {allNetworks.map(({ id, name, baseUrl }) => (
              <MenuItem
                key={id}
                onClick={() => setSelectedNetwork({ id, name, baseUrl })}
                bgColor={id === selectedNetwork?.id ? "neutrals.600" : ""}
                data-group
              >
                <B3
                  color='"neutrals.100"'
                  _groupHover={{ color: "white" }}
                  py={3}
                >
                  {name}
                </B3>
              </MenuItem>
            ))}
          </MenuList>
        </Menu>

        <Menu matchWidth>
          <MenuButton aria-label="Account" disabled={!selectedNetwork}>
            <InputGroup>
              <Input colorScheme={"neutrals"} placeholder={"Account"} />
              <InputRightElement
                h="100%"
                w="auto"
                gap={2}
                mr="3"
                display="flex"
                alignItems="center"
                zIndex={0}
              >
                <H6>
                  {selectedAccount?.name &&
                    getAccountName(selectedAccount.name, accountNames)}
                </H6>
                <Text color="neutrals.200">
                  <ChevronDownIcon />
                </Text>
              </InputRightElement>
            </InputGroup>
          </MenuButton>
          <MenuList borderRadius={0}>
            {accounts.map((account: any) => (
              <MenuItem
                key={account.address}
                onClick={() => setSelectedAccount(account.address)}
                bgColor={
                  account.address === selectedAccount?.address
                    ? "neutrals.600"
                    : ""
                }
                data-group
              >
                <B3
                  color='"neutrals.100"'
                  _groupHover={{ color: "white" }}
                  py={3}
                >
                  {account && getAccountName(account, accountNames)}
                </B3>
              </MenuItem>
            ))}
          </MenuList>
        </Menu> */}
    </NavigationContainer>
  )
}

export { DeclareSmartContractScreen }
