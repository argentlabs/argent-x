import { Route, Routes, RoutesConfig } from "@argent/stack-router"
import { FC } from "react"

import { About } from "../screens/About"
import { Account } from "../screens/Account"
import { Accounts } from "../screens/Accounts"
import { Home } from "../screens/Home"
import { Picker } from "../screens/Picker"
import { PickerNested } from "../screens/PickerNested"
import { PickerNestedPicker } from "../screens/PickerNestedPicker"
import { Settings } from "../screens/Settings"
import { SettingsNested } from "../screens/SettingsNested"
import { TabScreen1, TabScreen2, TabScreen3 } from "../screens/Tabs"

export const RootRoutes: FC = () => {
  return (
    <RoutesConfig defaultPresentation={"push"}>
      <Routes>
        <Route path="/" element={<Home />} />
        <>
          <Route path="/accounts/:id" element={<Account />} />
          <Route
            presentation="modalSheet"
            path="/accounts"
            element={<Accounts />}
          />
        </>
        <Route presentation="modal" path="/settings">
          <Route index element={<Settings />} />
          <Route path="nested" element={<SettingsNested />} />
        </Route>
        <Route presentation="modalSheet" path="/picker">
          <Route index element={<Picker />} />
          <Route path="nested" element={<PickerNested />} />
          <Route
            path="nested/picker"
            presentation="modalSheet"
            element={<PickerNestedPicker />}
          />
        </Route>
        <Route path="/tabs/1" element={<TabScreen1 />}></Route>
        <Route path="/tabs/2" element={<TabScreen2 />}></Route>
        <Route path="/tabs/3" element={<TabScreen3 />}></Route>
        <>
          <>
            <Route path="/about" element={<About />} />
          </>
        </>
      </Routes>
    </RoutesConfig>
  )
}
