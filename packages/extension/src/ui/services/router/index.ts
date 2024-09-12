import RouterService from "./RouterService"
import { useRestorationState } from "../../features/stateRestoration/restoration.state"

export const routerService = new RouterService(useRestorationState)
