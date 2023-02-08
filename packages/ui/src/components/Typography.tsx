import { chakra } from "@chakra-ui/react"

export const typographyStyles = {
  H1: {
    fontSize: "5xl",
    lineHeight: 12,
    fontWeight: "extrabold",
    margin: 0,
  },
  H2: {
    fontSize: "4xl",
    lineHeight: 10,
    fontWeight: "extrabold",
  },
  H3: {
    fontSize: "3xl",
    lineHeight: 8,
    fontWeight: "bold",
  },
  H4: {
    fontSize: "2xl",
    lineHeight: 7,
    fontWeight: "bold",
  },
  H5: {
    fontSize: "xl",
    lineHeight: 6,
    fontWeight: "bold",
  },
  H6: {
    fontSize: "base",
    lineHeight: 5,
    fontWeight: "bold",
  },

  // paragraphs

  P1: {
    fontSize: "2xl",
    lineHeight: 8,
  },
  P2: {
    fontSize: "xl",
    lineHeight: 7,
  },
  P3: {
    fontSize: "base",
    lineHeight: 5,
  },
  P4: {
    fontSize: "xs",
    lineHeight: 4,
  },

  // button text

  B1: {
    fontSize: "lg",
    lineHeight: "1em",
    fontWeight: "bold",
  },
  B2: {
    fontSize: "base",
    lineHeight: "1em",
    fontWeight: "bold",
  },
  B3: {
    fontSize: "sm",
    lineHeight: "1em",
    fontWeight: "bold",
  },

  // labels

  L1: {
    fontSize: "xs",
    lineHeight: "3.5",
    fontWeight: "bold",
    letterSpacing: "wide",
  },
  L2: {
    fontSize: "2xs",
    lineHeight: "3.5",
    fontWeight: "semibold",
  },

  // form

  FieldError: {
    color: "error.500",
    textTransform: "none",
  },
}

export const H1 = chakra("h1", {
  baseStyle: {
    ...typographyStyles.H1,
  },
})

export const H2 = chakra("h2", {
  baseStyle: {
    ...typographyStyles.H2,
  },
})

export const H3 = chakra("h3", {
  baseStyle: {
    ...typographyStyles.H3,
  },
})

export const H4 = chakra("h4", {
  baseStyle: {
    ...typographyStyles.H4,
  },
})

export const H5 = chakra("h5", {
  baseStyle: {
    ...typographyStyles.H5,
  },
})

export const H6 = chakra("h6", {
  baseStyle: {
    ...typographyStyles.H6,
  },
})

// paragraphs

export const P1 = chakra("p", {
  baseStyle: {
    ...typographyStyles.P1,
  },
})

export const P2 = chakra("p", {
  baseStyle: {
    ...typographyStyles.P2,
  },
})

export const P3 = chakra("p", {
  baseStyle: {
    ...typographyStyles.P3,
  },
})

export const P4 = chakra("p", {
  baseStyle: {
    ...typographyStyles.P4,
  },
})

// button text

export const B1 = chakra("span", {
  baseStyle: {
    ...typographyStyles.B1,
  },
})

export const B2 = chakra("span", {
  baseStyle: {
    ...typographyStyles.B2,
  },
})

export const B3 = chakra("span", {
  baseStyle: {
    ...typographyStyles.B3,
  },
})

// labels

export const L1 = chakra("label", {
  baseStyle: {
    ...typographyStyles.L1,
  },
})

export const L2 = chakra("label", {
  baseStyle: {
    ...typographyStyles.L2,
  },
})

export const Pre = chakra("pre")

// form

export const FieldError = chakra(L1, {
  baseStyle: {
    ...typographyStyles.FieldError,
  },
})
