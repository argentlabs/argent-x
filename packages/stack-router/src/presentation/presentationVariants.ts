import { Target } from "framer-motion"
import { merge } from "lodash-es"

import { Presentation, PresentationVariant } from "../types"

export const variantForPresentation = (
  presentation: Presentation,
  reverse = false,
) => {
  const variant = merge(
    {},
    variants.push,
    variants[presentation],
  ) as PresentationVariant
  return reverse ? reverseVariant(variant) : variant
}

export const reverseVariant = ({
  enter,
  active,
  exit,
}: PresentationVariant): PresentationVariant => {
  const reverse = {
    enter: exit,
    active,
    exit: enter,
  }
  return reverse
}

const stackedBorderRadius: Target = {
  borderTopLeftRadius: "4px",
  borderTopRightRadius: "4px",
}

/** default display */
const defaultActive = {
  filter: "brightness(1)",
  transform: "translateX(0px) translateY(0px) scale(1)",
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  marginTop: 0,
}

const variants: Record<Presentation, Partial<PresentationVariant>> = {
  push: {
    enter: {
      filter: "brightness(1)",
      transform: "translateX(100%) translateY(0px)",
      boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)",
    },
    active: {
      ...defaultActive,
      boxShadow: "0 0 20px 5px rgba(0, 0, 0, 0.3)",
    },
    exit: {
      filter: "brightness(0.3)",
      transform: "translateX(-30%) translateY(0px)",
    },
  },
  modal: {
    get enter() {
      return this.exit
    },
    exit: {
      ...stackedBorderRadius,
      filter: "brightness(1)",
      transform: "translateX(0px) translateY(100%)",
      boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)",
    },
  },
  modalSheet: {
    get enter() {
      return variants.modal.enter
    },
    active: {
      ...stackedBorderRadius,
      filter: "brightness(1)",
      transform: "translateX(0px) translateY(0px) scale(1)",
      boxShadow: "0 0 20px 5px rgba(0, 0, 0, 0.3)",
      marginTop: "24px",
    },
    get exit() {
      return variants.modal.exit
    },
  },
  pushModalSheet: {
    get enter() {
      return {
        ...variants.push.enter,
        marginTop: "24px",
      }
    },
    get active() {
      return {
        ...variants.push.active,
        ...stackedBorderRadius,
        marginTop: "24px",
      }
    },
    get exit() {
      return {
        ...variants.push.exit,
        marginTop: "24px",
      }
    },
  },
  stacked: {
    get enter() {
      return this.exit
    },
    exit: {
      ...stackedBorderRadius,
      filter: "brightness(0.8)",
      transform: "translateX(0px) translateY(0px) scale(0.9)",
      marginTop: "12px",
    },
  },
  stackedStacked: {
    get enter() {
      return this.exit
    },
    get active() {
      return variants.stacked.exit
    },
    exit: {
      ...stackedBorderRadius,
      filter: "brightness(0)",
      transform: "translateX(0px) translateY(0px) scale(0.8)",
    },
  },
  modalStacked: {
    get enter() {
      return variants.stacked.enter
    },
    get active() {
      return variants.stacked.active
    },
    get exit() {
      return variants.stacked.exit
    },
  },
  replace: {
    get enter() {
      return defaultActive
    },
    get active() {
      return defaultActive
    },
    get exit() {
      return defaultActive
    },
  },
}
