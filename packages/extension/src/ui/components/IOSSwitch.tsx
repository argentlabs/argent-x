import { styled } from "@mui/material/styles"
import Switch, { SwitchProps } from "@mui/material/Switch"
import { FC, useId } from "react"

/** @see https://mui.com/material-ui/react-switch/#CustomizedSwitches.tsx */

const IOSSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.mode === "dark" ? "#02BBA8" : "#02BBA8",
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#02BBA8",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color:
        theme.palette.mode === "light"
          ? theme.palette.grey[100]
          : theme.palette.grey[600],
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}))

export default IOSSwitch

export interface ILazyInitialisedIOSSwitch extends SwitchProps {
  initialised: boolean
}

/** A wrapped IOSSwitch which does not animate when initialised with the original value  */

export const LazyInitialisedIOSSwitch: FC<ILazyInitialisedIOSSwitch> = ({
  initialised,
  ...rest
}) => {
  const id = useId()
  return initialised ? (
    <IOSSwitch {...rest} />
  ) : (
    <IOSSwitch key={id} disabled {...rest} />
  )
}
