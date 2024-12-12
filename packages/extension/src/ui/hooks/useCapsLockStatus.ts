import { useState, useEffect } from "react"

const useCapsLockStatus = () => {
  const [isCapsLockOn, setIsCapsLockOn] = useState(false)

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.getModifierState("CapsLock")) {
      setIsCapsLockOn(true)
    } else {
      setIsCapsLockOn(false)
    }
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    if (!event.getModifierState("CapsLock")) {
      setIsCapsLockOn(false)
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  return isCapsLockOn
}

export default useCapsLockStatus
