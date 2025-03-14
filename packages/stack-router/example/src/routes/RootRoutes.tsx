import { Route, Routes, RoutesConfig } from "@argent/stack-router"
import type { FC } from "react"

import { About } from "../screens/About"
import { Account } from "../screens/Account"
import { Accounts } from "../screens/Accounts"
import { Home } from "../screens/Home"
import { LockScreen } from "../screens/LockScreen"
import { Picker } from "../screens/Picker"
import { PickerNested } from "../screens/PickerNested"
import { PickerNestedPicker } from "../screens/PickerNestedPicker"
import { Settings } from "../screens/Settings"
import { SettingsNested } from "../screens/SettingsNested"
import { TabScreen1, TabScreen2, TabScreen3 } from "../screens/Tabs"
import { Token } from "../screens/Token"
import { Activities } from "../screens/Activities"
import { Activity } from "../screens/Activity"

export const RootRoutes: FC = () => {
  return (
    <RoutesConfig defaultPresentation={"push"}>
      <Routes>
        <Route
          presentation="replace"
          path="/lock-screen"
          element={<LockScreen />}
        />
        <Route path="/" element={<Home />} />
        <>
          <Route path="/tokens/:id" element={<Token />} />
        </>
        <>
          <Route path="/accounts/:id" element={<Account />} />
          <Route
            presentation="modalSheet"
            path="/accounts"
            element={<Accounts />}
          />
        </>
        <>
          <Route path="/activity/:id" element={<Activity />} />
          <Route path="/activity" element={<Activities />} />
        </>
        <>
          <Route path="/settings" presentation="modal" element={<Settings />} />
          <Route path="/settings/nested" element={<SettingsNested />} />
        </>
        <>
          <Route
            presentation="modalSheet"
            path="/picker"
            element={<Picker />}
          />
          <Route path="/picker/nested" element={<PickerNested />} />
          <Route
            path="/picker/nested/picker"
            presentation="modalSheet"
            element={<PickerNestedPicker />}
          />
        </>
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
