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
const defaultActive: Target = {
  filter: "brightness(1)",
  translateX: 0,
  translateY: 0,
  marginTop: 0,
  scale: 1,
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
}

const variants: Record<Presentation, Partial<PresentationVariant>> = {
  /** horizontal */
  push: {
    enter: {
      filter: "brightness(1)",
      translateX: "100%",
      translateY: 0,
      boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)",
    },
    active: {
      ...defaultActive,
      boxShadow: "0 0 20px 5px rgba(0, 0, 0, 0.3)",
    },
    exit: {
      filter: "brightness(0.3)",
      translateX: "-30%",
      translateY: 0,
    },
  },
  /** vertical covering whole screen */
  modal: {
    get enter() {
      return variants.modal.exit
    },
    exit: {
      ...stackedBorderRadius,
      filter: "brightness(1)",
      translateX: 0,
      translateY: "100%",
      boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)",
    },
  },
  /** vertical with previous screens visibly 'stacked' */
  modalSheet: {
    get enter() {
      return variants.modal.enter
    },
    active: {
      ...stackedBorderRadius,
      filter: "brightness(1)",
      translateX: 0,
      translateY: 0,
      marginTop: "24px",
      scale: 1,
      boxShadow: "0 0 20px 5px rgba(0, 0, 0, 0.3)",
    },
    get exit() {
      return variants.modal.exit
    },
  },
  /** horizontal within a modal sheet */
  pushModalSheet: {
    get enter() {
      return {
        ...variants.push.enter,
        marginTop: variants.modalSheet.active?.marginTop,
      }
    },
    get active() {
      return {
        ...variants.push.active,
        ...stackedBorderRadius,
        marginTop: variants.modalSheet.active?.marginTop,
      }
    },
    get exit() {
      return {
        ...variants.push.exit,
        marginTop: variants.modalSheet.active?.marginTop,
      }
    },
  },
  /** stacked behind modalSheet */
  stacked: {
    get enter() {
      return variants.stacked.exit
    },
    exit: {
      ...stackedBorderRadius,
      filter: "brightness(0.8)",
      translateX: 0,
      translateY: 0,
      marginTop: "12px",
      scale: 0.9,
    },
  },
  /** stacked behind stacked (visually hidden) */
  stackedStacked: {
    get enter() {
      return variants.stackedStacked.exit
    },
    get active() {
      return variants.stacked.exit
    },
    exit: {
      ...stackedBorderRadius,
      filter: "brightness(0)",
      translateX: 0,
      translateY: 0,
      marginTop: 0,
      scale: 0.8,
    },
  },
  /** beneath modal (same as animation 'stacked' but not persistent) */
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
  /** no animation */
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
