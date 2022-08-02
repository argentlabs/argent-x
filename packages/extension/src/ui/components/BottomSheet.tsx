import { FC, useEffect, useState } from "react"
import styled from "styled-components"

const BottomSheetBackground = styled.div<{
  open: boolean
}>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99;
  transition: all 0.3s ease-in-out;
  background-color: ${({ open }) =>
    open ? "rgba(0, 0, 0, 0.5)" : "transparent"};
  opacity: ${({ open }) => (open ? 1 : 0)};
  visibility: ${({ open }) => (open ? "visible" : "hidden")};
  pointer-events: ${({ open }) => (open ? "auto" : "none")};
`

const BottomSheetWrapper = styled.div<{
  open: boolean
  disableAnimation: boolean
  maxHeight?: string
}>`
  position: fixed;
  max-height: ${({ maxHeight }) => (maxHeight ? maxHeight : "94vh")};
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.bg1};
  border-radius: 16px 16px 0 0;
  border-top: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.3);
  padding: 0px;
  z-index: 100;
  transform: ${({ open }) => (open ? `translateY(0%)` : `translateY(100%)`)};
  transition: ${({ disableAnimation, open }) => {
    if (disableAnimation) {
      return `transform 0s`
    }
    return `transform 0.3s ${open ? "ease-out" : "ease-in"}`
  }};
`

const useFirstRender = () => {
  const [firstRender, setFirstRender] = useState(true)
  useEffect(() => {
    setFirstRender(false)
  }, [])
  return firstRender
}

export interface CustomBottomSheetProps {
  open: boolean
  onClose?: () => void
  backgroundClassName?: string
  children?: React.ReactNode
  maxHeight?: string
}

export const CustomBottomSheet: FC<CustomBottomSheetProps> = ({
  open,
  onClose,
  backgroundClassName,
  maxHeight,
  children,
  ...props
}) => {
  const isFirstRender = useFirstRender()

  return (
    <>
      <BottomSheetBackground
        className={backgroundClassName}
        open={open}
        onClick={onClose}
      />
      <BottomSheetWrapper
        disableAnimation={isFirstRender}
        open={open}
        maxHeight={maxHeight}
        {...props}
      >
        {children}
      </BottomSheetWrapper>
    </>
  )
}
