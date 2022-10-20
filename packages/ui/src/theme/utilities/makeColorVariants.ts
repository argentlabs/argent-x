import { colord } from "colord"
import { interpolate, linear } from "popmotion"

/** Where 500 is 'unmodified' */
const colorKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const

type ColorVariantKey = typeof colorKeys[number]

/** Make colour variants for Chakra from a single colour */

export const makeColorVariants = (baseColor: string, inverse = false) => {
  const colorVariants = {} as Record<ColorVariantKey, string>
  const { h, s, l, a } = colord(baseColor).toHsl()
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
      let lightness = mapper(colorKey)
      if (inverse) {
        lightness = 100 - lightness
      }
      colorVariants[colorKey] = colord({ h, s, l: lightness, a }).toHex()
    }
  })
  return colorVariants
}
