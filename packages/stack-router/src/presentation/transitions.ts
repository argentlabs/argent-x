import { Transition } from "framer-motion"

/**
 * Exact values from UINavigationController's animation configuration.
 * From react-navigation, see
 * {@link https://github.com/react-navigation/react-navigation/blob/main/packages/stack/src/TransitionConfigs/TransitionSpecs.tsx}
 */

export const animatedTransition: Transition = {
  // duration: 3 /** uncomment to slow animations for debugging */,
  transition: {
    type: "spring",
    stiffness: 1000,
    damping: 500,
    mass: 3,
    bounce: 0,
    restDelta: 10,
    restSpeed: 10,
  },
}

export const replaceTransition: Transition = {
  duration: 0,
}
