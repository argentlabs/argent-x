import { ListItem, OrderedList } from "@chakra-ui/react"

export default {
  title: "components/List",
}

export const Ordered = () => (
  <OrderedList variant={"bordered"}>
    <ListItem>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit
    </ListItem>
    <ListItem>
      Assumenda, quia temporibus eveniet a libero incidunt suscipit
    </ListItem>
    <ListItem>
      Quidem, ipsam illum quis sed voluptatum quae eum fugit earum
    </ListItem>
  </OrderedList>
)
