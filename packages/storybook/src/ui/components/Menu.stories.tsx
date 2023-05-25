import { icons } from "@argent/ui"
import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react"
import { FC } from "react"

const { DropdownDownIcon } = icons

const networks = ["Mainnet", "Testnet", "Integration", "Localhost 5050"]
const selectedNetwork = networks[0]

const MenuStory: FC = (props) => (
  <Menu size="2xs">
    <MenuButton
      size="2xs"
      as={Button}
      rightIcon={<DropdownDownIcon />}
      {...props}
    >
      {selectedNetwork}
    </MenuButton>
    <MenuList>
      {networks.map((n) => {
        return (
          <MenuItem key={n} onClick={() => console.log("onClick", n)}>
            {n}
          </MenuItem>
        )
      })}
    </MenuList>
  </Menu>
)

export default {
  component: MenuStory,
}

export const Default = {
  args: {},
}

export const Disabled = {
  ...Default,
  args: { isDisabled: true },
}
