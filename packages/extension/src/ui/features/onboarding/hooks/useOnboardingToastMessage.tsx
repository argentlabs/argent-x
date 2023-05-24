import { useToast } from "@chakra-ui/react"
import { useEffect, useRef } from "react"

import { OnboardingToastMessage } from "../ui/OnboardingToastMessage"

export const useOnboardingToastMessage = () => {
  const toast = useToast()
  const didTriggerToast = useRef(false)
  useEffect(() => {
    if (!didTriggerToast.current) {
      didTriggerToast.current = true
      toast({
        position: "top-right",
        isClosable: false,
        render: () => <OnboardingToastMessage />,
      })
    }
  }, [toast])
}
