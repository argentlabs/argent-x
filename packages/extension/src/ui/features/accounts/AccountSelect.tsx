import { MenuItem, MenuList, Paper } from "@mui/material"
import OutlinedInput from "@mui/material/OutlinedInput"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import { FC, useState } from "react"
import styled from "styled-components"

import { KeyboardArrowDownRounded } from "../../components/Icons/MuiIcons"
import { scrollbarStyle } from "../../theme"
import { AccountListItem, AccountListItemProps } from "./AccountListItem"

const StyledPaper = styled(Paper)`
  max-height: 220px;
  ${scrollbarStyle}
`

const StyledMenuList = styled(MenuList)`
  padding: 0;
`

const SelectMenuProps = {
  MenuListProps: {
    component: StyledMenuList,
  },
  PaperProps: {
    component: StyledPaper,
  },
}

const StyledOutlinedInput = styled(OutlinedInput)`
  .MuiOutlinedInput-input {
    transition: all 200ms ease-in-out;
    padding: 0;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    &:hover {
      background-color: rgba(255, 255, 255, 0.15);
    }
  }
  fieldset {
    border: none;
  }
`

const StyledSelect = styled(Select<string>)`
  width: 100%;
`

const StyledMenuItem = styled(MenuItem)`
  transition: all 200ms ease-in-out;
  padding: 0;
  background-color: rgba(255, 255, 255, 0.05);
  &.Mui-selected {
    background-color: rgba(255, 255, 255, 0.15);
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
`

const StyledAccountListItem = styled(AccountListItem)`
  width: 100%;
`

export interface IAccountSelect {
  selectedAccount?: AccountListItemProps
  accounts: AccountListItemProps[]
  onSelectedAccountChange?: (selectedAccount: AccountListItemProps) => void
  style?: React.CSSProperties
  className?: string
}

export const AccountSelect: FC<IAccountSelect> = ({
  selectedAccount,
  accounts = [],
  onSelectedAccountChange,
  ...divProps
}) => {
  const [value, setValue] = useState(
    selectedAccount && selectedAccount.accountAddress,
  )
  const handleChange = (event: SelectChangeEvent<string>) => {
    const selectedAccountAddress = event.target.value
    const selectedAccount = accounts.find(
      ({ accountAddress }) => accountAddress === selectedAccountAddress,
    )
    setValue(selectedAccountAddress)
    selectedAccount &&
      onSelectedAccountChange &&
      onSelectedAccountChange(selectedAccount)
  }
  return (
    <StyledSelect
      value={value}
      onChange={handleChange}
      input={<StyledOutlinedInput />}
      IconComponent={KeyboardArrowDownRounded}
      /* @ts-expect-error valid 'component' key is missing in MUI types @see https://github.com/mui/material-ui/pull/32404 */
      MenuProps={SelectMenuProps}
      {...divProps}
    >
      {accounts.map((account) => (
        <StyledMenuItem
          value={account.accountAddress}
          key={account.accountAddress}
          disableRipple
        >
          <StyledAccountListItem transparent {...account} />
        </StyledMenuItem>
      ))}
    </StyledSelect>
  )
}
