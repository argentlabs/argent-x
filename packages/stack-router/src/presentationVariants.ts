import { merge } from "lodash-es"

import { Presentation, PresentationVariant } from "./types"

export const variantForPresentation = (
  presentation: Presentation,
  reverse = false,
) => {
  const variant = merge(
    {},
    variants.default,
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

const variants: Record<Presentation, Partial<PresentationVariant>> = {
  /** horizontal */
  default: {
    enter: {
      filter: "brightness(1)",
      translateX: "100%",
      translateY: 0,
      boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)",
    },
    active: {
      filter: "brightness(1)",
      translateX: 0,
      translateY: 0,
      marginTop: 0,
      scale: 1,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
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
      filter: "brightness(1)",
      translateX: 0,
      translateY: "100%",
      boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)",
      borderTopLeftRadius: "4px",
      borderTopRightRadius: "4px",
    },
  },
  /** vertical with previous screens visibly 'stacked' */
  modalSheet: {
    get enter() {
      return variants.modal.enter
    },
    active: {
      filter: "brightness(1)",
      translateX: 0,
      translateY: 0,
      marginTop: "30px",
      scale: 1,
      borderTopLeftRadius: "4px",
      borderTopRightRadius: "4px",
      boxShadow: "0 0 20px 5px rgba(0, 0, 0, 0.3)",
    },
    get exit() {
      return variants.modal.exit
    },
  },
  /** horizontal within a modal sheet */
  defaultModalSheet: {
    get enter() {
      return {
        ...variants.default.enter,
        marginTop: variants.modalSheet.active?.marginTop,
      }
    },
    get active() {
      return {
        ...variants.default.active,
        marginTop: variants.modalSheet.active?.marginTop,
        borderTopLeftRadius: variants.modalSheet.active?.borderTopLeftRadius,
        borderTopRightRadius: variants.modalSheet.active?.borderTopRightRadius,
      }
    },
    get exit() {
      return {
        ...variants.default.exit,
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
      filter: "brightness(0.5)",
      translateX: 0,
      translateY: 0,
      marginTop: "10px",
      scale: 0.9,
      borderTopLeftRadius: "4px",
      borderTopRightRadius: "4px",
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
      filter: "brightness(0)",
      translateX: 0,
      translateY: 0,
      marginTop: "0px",
      scale: 0.8,
      borderTopLeftRadius: "4px",
      borderTopRightRadius: "4px",
    },
  },
}
