import { icons } from "@argent/ui"
import { theme } from "@argent/ui"
import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react"
import { getThemingArgTypes } from "@chakra-ui/storybook-addon"
import { FC } from "react"

const { DropdownDownIcon } = icons

const networks = ["Mainnet", "Testnet", "Integration", "Localhost 5050"]
const selectedNetwork = networks[0]

const MenuStory: FC = (props: any) => (
  <Menu size={props.size}>
    <MenuButton as={Button} rightIcon={<DropdownDownIcon />} {...props}>
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
  argTypes: {
    ...getThemingArgTypes(theme, "Menu"),
  },
}

export const Default = {
  args: {
    size: "2xs",
  },
}

export const Disabled = {
  args: {
    ...Default.args,
    isDisabled: true,
  },
}
