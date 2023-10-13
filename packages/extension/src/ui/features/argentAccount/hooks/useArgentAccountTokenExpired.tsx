import useSWR from "swr"
import { argentAccountService } from "../../../services/argentAccount"

export const useArgentAccountTokenExpired = () =>
  useSWR("tokenExpired", () => argentAccountService.isTokenExpired())
