import { DefaultTheme } from "styled-components"

import * as functions from "./functions"

type ThemeProp = {
  theme: DefaultTheme
}

/**
 * Map a single prop to the expected function argument from './functions'
 * e.g. fontSize: FontSizeKey
 */

export type FunctionsProps = {
  [Property in keyof typeof functions]: Parameters<
    typeof functions[Property]
  >[0]
}

export type UtilitiesProps = Partial<FunctionsProps>

/**
 * Adds the capability to process passed component props through the utility functions
 * and return the derived styles for the current theme
 *
 * @example
 *
 * // Creates a Box component with utility props
 * const Box = styled.div`
 *   ${utilities}
 * `;
 *
 * // Box with padding 5, fontSize '5xl' and forground colour 'primary' from current theme
 * <Box p={5} fontSize={'5xl'} fg={'primary'} />
 *
 * @returns an array of style strings from each utility function
 */

export const utilities = ({ theme, ...props }: ThemeProp & UtilitiesProps) => {
  /** Take each component prop key */
  const propsKeys = Object.keys(props) as Array<keyof FunctionsProps>
  return propsKeys.flatMap((key) => {
    /** The function that matches this prop key, e.g. fontSize */
    const fn = functions[key]
    /** The component prop value that was passed e.g. '5xl' from fontSize={'5xl'} */
    const input = props[key]
    /** If we have both then pass input into the utility function e.g. fontSize('5xl')  */
    if (fn && input) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore FIXME type of fn and input are not recognised as being expected here
      return fn(input)
    }
    /** no match, do nothing */
    return []
  })
}
