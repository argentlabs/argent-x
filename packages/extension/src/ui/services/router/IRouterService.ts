import { NavigateOptions } from "react-router-dom"

export interface IRouterService {
  getInitialRoute: ({
    query,
    isOnboardingComplete,
  }: {
    query: URLSearchParams
    isOnboardingComplete: boolean
  }) => { entry: string; options?: NavigateOptions }
}
