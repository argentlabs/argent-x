import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { clientUIService } from "."
import type { UIShowNotificationPayload } from "../../../shared/ui/UIMessage"
import { Notification } from "../../components/Notification"
import { ShowNotification } from "./IClientUIService"
import { nonWalletPaths } from "../../AppRoutes"
import { useIsFullScreen } from "./useIsFullScreen"

export const useClientUIShowNotification = (pathname: string) => {
  const navigate = useNavigate()
  const isFullscreen = useIsFullScreen()

  useEffect(() => {
    function onShowNotification(payload: UIShowNotificationPayload) {
      const { notificationId, ...rest } = payload
      const toastId = toast.custom((t) => (
        <Notification
          onClose={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toast.dismiss(t)
          }}
          onClick={onClick}
          {...rest}
        />
      ))
      function onClick() {
        void clientUIService.onNotificationClicked(notificationId)
        toast.dismiss(toastId)
      }
    }
    if (!nonWalletPaths.includes(pathname) && !isFullscreen) {
      clientUIService.emitter.on(ShowNotification, onShowNotification)
    }
    return () =>
      clientUIService.emitter.off(ShowNotification, onShowNotification)
  }, [navigate, pathname, isFullscreen])
}
