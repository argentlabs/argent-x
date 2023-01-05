import { FC } from "react"
import { Route, RouteProps } from "react-router-dom"

import { Presentation } from "./types"

type StackRouteProps = RouteProps & {
  presentation?: Presentation
}

/** adds the 'presentation' prop to a {@link Route} */

export const StackRoute: FC<StackRouteProps> = Route
