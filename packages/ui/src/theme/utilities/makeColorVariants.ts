import { HslaColor, LchaColor, colord, extend } from "colord"
import lchPlugin from "colord/plugins/lch"
import { interpolate, linear } from "popmotion"

extend([lchPlugin])

/** Where 500 is 'unmodified' */
const colorKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const

type ColorVariantKey = typeof colorKeys[number]

export enum ColorMode {
  HSL = "HSL" /** Color key determines lightness only */,
  HCL = "HCL" /** Color key determines lightness with constant chroma, like Material Design */,
}

/**
 * Make colour variants for Chakra from a single colour
 * @param baseColor The base colour for the variants, will be variant.500
 * @param mode The mode to use for creating the colour variants
 */

export const makeColorVariants = (
  baseColor: string,
  mode: ColorMode = ColorMode.HCL,
) => {
  const colorVariants = {} as Record<ColorVariantKey, string>
  const props =
    mode === ColorMode.HCL
      ? colord(baseColor).toLch()
      : colord(baseColor).toHsl()
  const { h, l, a } = props
  // interpolate lightness from baseColor lightness
  // colorKey =  0   ...        500         ... 1000
  // lightness = 100 ... baseColorLightness ... 0
  const mapper = interpolate([0, 500, 1000], [100, l, 0], {
    ease: linear,
  })
  colorKeys.forEach((colorKey) => {
    // 500 should give the original lightness value 'l' from above
    if (colorKey === 500) {
      colorVariants[colorKey] = baseColor
    } else {
      const lightness = mapper(colorKey)
      if (mode === ColorMode.HCL) {
        const { c } = props as LchaColor
        colorVariants[colorKey] = colord({ h, c, l: lightness, a }).toHex()
      } else {
        const { s } = props as HslaColor
        colorVariants[colorKey] = colord({ h, s, l: lightness, a }).toHex()
      }
    }
  })
  return colorVariants
}
