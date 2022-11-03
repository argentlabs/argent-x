import { chakra } from "@chakra-ui/react"

export const H1 = chakra("h1", {
  baseStyle: {
    fontSize: "5xl",
    lineHeight: 12,
    fontWeight: "extrabold",
    margin: 0,
  },
})

export const H2 = chakra("h2", {
  baseStyle: {
    fontSize: "4xl",
    lineHeight: 10,
    fontWeight: "extrabold",
  },
})

export const H3 = chakra("h3", {
  baseStyle: {
    fontSize: "3xl",
    lineHeight: 8,
    fontWeight: "bold",
  },
})

export const H4 = chakra("h4", {
  baseStyle: {
    fontSize: "2xl",
    lineHeight: 7,
    fontWeight: "bold",
  },
})

export const H5 = chakra("h5", {
  baseStyle: {
    fontSize: "xl",
    lineHeight: 6,
    fontWeight: "bold",
  },
})

export const H6 = chakra("h6", {
  baseStyle: {
    fontSize: "base",
    lineHeight: 5,
    fontWeight: "bold",
  },
})

// paragraphs

export const P1 = chakra("p", {
  baseStyle: {
    fontSize: "2xl",
    lineHeight: 8,
  },
})

export const P2 = chakra("p", {
  baseStyle: {
    fontSize: "xl",
    lineHeight: 7,
  },
})

export const P3 = chakra("p", {
  baseStyle: {
    fontSize: "base",
    lineHeight: 5,
  },
})

export const P4 = chakra("p", {
  baseStyle: {
    fontSize: "xs",
    lineHeight: 4,
  },
})

// button text

export const B1 = chakra("span", {
  baseStyle: {
    fontSize: "lg",
    lineHeight: "1em",
    fontWeight: "bold",
  },
})

export const B2 = chakra("span", {
  baseStyle: {
    fontSize: "base",
    lineHeight: "1em",
    fontWeight: "bold",
  },
})

export const B3 = chakra("span", {
  baseStyle: {
    fontSize: "sm",
    lineHeight: "1em",
    fontWeight: "bold",
  },
})

// labels

export const L1 = chakra("label", {
  baseStyle: {
    fontSize: "xs",
    lineHeight: "3.5",
    fontWeight: "bold",
    letterSpacing: "wide",
    textTransform: "uppercase",
  },
})

export const L2 = chakra("label", {
  baseStyle: {
    fontSize: "2xs",
    lineHeight: "3.5",
    fontWeight: "semibold",
  },
})

// form

export const FieldError = chakra(L1, {
  baseStyle: {
    color: "error.500",
    textTransform: "none",
  },
})
