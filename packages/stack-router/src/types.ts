import { Target } from "framer-motion"

export interface ScreenProps {
  /** path e.g. /accounts/:id */
  path: string
  /** pathname e.g. /accounts/123 */
  pathname: string
  /** unique history key e.g. 'default' or 'abc123' {@link https://github.com/remix-run/history/blob/main/docs/api-reference.md#locationkey} */
  key: string
  /** how this screen should be presented */
  presentation: Presentation
}

export type Presentation =
  | "replace"
  | "push"
  | "modal"
  | "modalSheet"
  | "modalStacked"
  | "pushModalSheet"
  | "stacked"
  | "stackedStacked"

export interface PresentationVariant {
  enter: Target
  active: Target
  exit: Target
}

export enum PresentationDirection {
  Replace = "REPLACE",
  Forwards = "FORWARDS",
  Backwards = "BACKWARDS",
}

export type DeclaredPresentationByPath = Record<string, Presentation>

export type PresentationByPath = Record<
  string,
  {
    variant: PresentationVariant
    presentation: Presentation
    zIndex: number
  }
>
