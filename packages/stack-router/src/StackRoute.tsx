import type { FC } from "react"
import type { RouteProps } from "react-router-dom"
import { Route } from "react-router-dom"

import type { Presentation } from "./types"

type StackRouteProps = RouteProps & {
  presentation?: Presentation
}

/** adds the 'presentation' prop to a {@link Route} */

export const StackRoute: FC<StackRouteProps> = Route
