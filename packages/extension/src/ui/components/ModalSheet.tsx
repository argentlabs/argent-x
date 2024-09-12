import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerProps,
  Flex,
} from "@chakra-ui/react"
import { FC } from "react"

import { ResponsiveBox } from "./Responsive"

export const ModalSheet: FC<DrawerProps> = ({ children, ...rest }) => {
  return (
    <Drawer placement="bottom" size={"full"} {...rest}>
      <DrawerOverlay bg={"rgba(0,0,0,0.8)"} />
      <DrawerContent
        bg={"transaprent"}
        top={8}
        h={"auto"}
        borderTopRadius={"lg"}
        pointerEvents={"none"}
      >
        <ResponsiveBox display={"flex"} flex={1} flexDirection={"column"}>
          <Flex
            flex={1}
            bg={"surface-default"}
            borderTopRadius={"lg"}
            flexDirection={"column"}
            pointerEvents={"auto"}
          >
            {children}
          </Flex>
        </ResponsiveBox>
      </DrawerContent>
    </Drawer>
  )
}
