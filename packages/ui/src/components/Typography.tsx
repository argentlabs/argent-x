import { FC, HTMLAttributes } from "react"
import styled, { css } from "styled-components"

import {
  UtilitiesProps,
  Variant,
  fg,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
  utilities,
  withVariants,
} from "../theme/utilities"

const VariantToAs = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  p1: "p",
  p2: "p",
  p3: "p",
  p4: "p",
  b1: "span",
  b2: "span",
  b3: "span",
  l1: "label",
  l2: "label",
}

interface TypographyProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof VariantToAs
}

const variants: Variant<TypographyProps>[] = [
  // size, line height and letter spacing
  {
    props: { variant: "h1" },
    style: css`
      ${fontSize("5xl")}
      ${lineHeight(12)}
    `,
  },
  {
    props: { variant: "h2" },
    style: css`
      ${fontSize("4xl")}
      ${lineHeight(10)}
    `,
  },
  {
    props: { variant: "h3" },
    style: css`
      ${fontSize("3xl")}
      ${lineHeight(8)}
    `,
  },
  {
    props: { variant: "h4" },
    style: css`
      ${fontSize("2xl")}
      ${lineHeight(7)}
    `,
  },
  {
    props: { variant: "h5" },
    style: css`
      ${fontSize("xl")}
      ${lineHeight(6)}
    `,
  },
  {
    props: { variant: "h6" },
    style: css`
      ${fontSize("base")}
      ${lineHeight(5)}
    `,
  },
  {
    props: [{ variant: "p1" }, { variant: undefined }],
    style: css`
      ${fontSize("2xl")}
      ${lineHeight(8)}
    `,
  },
  {
    props: { variant: "p2" },
    style: css`
      ${fontSize("xl")}
      ${lineHeight(7)}
    `,
  },
  {
    props: { variant: "p3" },
    style: css`
      ${fontSize("base")}
      ${lineHeight(5)}
    `,
  },
  {
    props: { variant: "p4" },
    style: css`
      ${fontSize("xs")}
      ${lineHeight(4)}
    `,
  },
  {
    props: { variant: "b1" },
    style: css`
      ${fontSize("lg")}
      line-height: 1;
    `,
  },
  {
    props: { variant: "b2" },
    style: css`
      ${fontSize("base")}
      line-height: 1;
    `,
  },
  {
    props: { variant: "b3" },
    style: css`
      ${fontSize("sm")}
      line-height: 1;
    `,
  },
  {
    props: { variant: "l1" },
    style: css`
      ${fontSize("xs")}
      ${lineHeight("3.5")}
      ${letterSpacing("wider")}
      text-transform: uppercase;
    `,
  },
  {
    props: { variant: "l2" },
    style: css`
      ${fontSize("2xs")}
      ${lineHeight("3.5")}
    `,
  },
  // weight
  {
    props: [{ variant: "h1" }, { variant: "h2" }],
    style: css`
      ${fontWeight("extrabold")}
    `,
  },
  {
    props: [
      { variant: "h3" },
      { variant: "h4" },
      { variant: "h5" },
      { variant: "h6" },
      { variant: "b1" },
      { variant: "b2" },
      { variant: "b3" },
      { variant: "l1" },
    ],
    style: css`
      ${fontWeight("bold")}
    `,
  },
  {
    props: { variant: "l2" },
    style: css`
      ${fontWeight("semibold")}
    `,
  },
]

const TypographyAs = styled.span.attrs<TypographyProps>((props) => {
  const as = props.variant && VariantToAs[props.variant]
  if (as) {
    return {
      ...props,
      as,
    }
  }
  return props
})``

export const Typography = styled(TypographyAs)<
  TypographyProps & UtilitiesProps
>`
  ${utilities}
  margin: 0;
  color: ${({ theme }) => theme.text1};
  ${withVariants(variants)}
`

export const TypographyWithVariant = (variant: keyof typeof VariantToAs) => {
  const Variant: FC<TypographyProps & UtilitiesProps> = (props) => (
    <Typography variant={variant} {...props} />
  )
  return Variant
}

export const H1 = TypographyWithVariant("h1")
export const H2 = TypographyWithVariant("h2")
export const H3 = TypographyWithVariant("h3")
export const H4 = TypographyWithVariant("h4")
export const H5 = TypographyWithVariant("h5")
export const H6 = TypographyWithVariant("h6")
export const P1 = TypographyWithVariant("p1")
export const P2 = TypographyWithVariant("p2")
export const P3 = TypographyWithVariant("p3")
export const P4 = TypographyWithVariant("p4")
export const B1 = TypographyWithVariant("b1")
export const B2 = TypographyWithVariant("b2")
export const B3 = TypographyWithVariant("b3")
export const L1 = TypographyWithVariant("l1")
export const L2 = TypographyWithVariant("l2")

export const FieldError = styled(L1)`
  ${fg("error")}
  text-transform: none;
`
