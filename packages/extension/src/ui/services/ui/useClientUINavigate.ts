import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { clientUIService } from "."
import { Navigate } from "./IClientUIService"
import type { UINavigatePayload } from "../../../shared/ui/UIMessage"

export const useClientUINavigate = () => {
  const navigate = useNavigate()
  useEffect(() => {
    function onNavigate({ path }: UINavigatePayload) {
      navigate(path, { replace: true })
    }
    clientUIService.emitter.on(Navigate, onNavigate)
    return () => clientUIService.emitter.off(Navigate, onNavigate)
  }, [navigate])
}
