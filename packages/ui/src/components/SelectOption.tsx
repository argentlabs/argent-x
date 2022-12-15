import { FC } from "react"

import { H6 } from "./Typography"

interface SelectOptionProps {
  label: string
}

const SelectOption: FC<SelectOptionProps> = ({ label }) => (
  <H6 color='"neutrals.100"' _groupHover={{ color: "white" }} py={3}>
    {label}
  </H6>
)

export { SelectOption }
