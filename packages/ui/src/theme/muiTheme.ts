import { createTheme } from "@mui/material/styles"

export const muiTheme = createTheme({
  palette: {
    mode: "dark",
  },
  typography: {
    allVariants: {
      /** unset default Roboto font */
      fontFamily: undefined,
    },
  },
})
