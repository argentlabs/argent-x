import { PasswordStrengthIndicator } from "@argent/ui"
import { Box } from "@chakra-ui/react"
import { ComponentProps, FC, useState } from "react"

export default {
  component: PasswordStrengthIndicator,
}

const Template: FC<ComponentProps<typeof PasswordStrengthIndicator>> = (
  props,
) => {
  const [pwd, setPassword] = useState("")
  return (
    <Box>
      <input
        type="text"
        onChange={(e) => setPassword(e.target.value)}
        placeholder="your password here"
        style={{
          marginBottom: "1rem",
        }}
      />
      <PasswordStrengthIndicator {...props} password={pwd} />
    </Box>
  )
}
export const Default = {
  render: Template,
  args: {
    password: "someMoreSophisticatedPwd5",
  },
}
