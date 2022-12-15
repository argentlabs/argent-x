import { Target } from "framer-motion"

export interface ScreenProps {
  /** pathname e.g. /users/edit/123 */
  pathname: string
  /** unique history key e.g. 'default' or 'abc123' {@link https://github.com/remix-run/history/blob/main/docs/api-reference.md#locationkey} */
  key: string
  /** how this screen should be presented */
  presentation: Presentation
}

export type Presentation =
  | "default"
  | "modal"
  | "modalSheet"
  | "defaultModalSheet"
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

export type PresentationByPathname = Record<
  string,
  {
    variant: PresentationVariant
    presentation: Presentation
    zIndex: number
  }
>
