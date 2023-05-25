import { create } from "zustand"
import { persist } from "zustand/middleware"

import { INITIAL_ALLOWED_SLIPPAGE } from "../constants"

export interface UserState {
  // user defined slippage tolerance in bips, used in all txns
  userSlippageTolerance: number
  updateUserSlippageTolerance: (userSlippageTolerance: number) => void
}

export const useUserState = create<UserState>()(
  persist(
    (set) => ({
      userSlippageTolerance: INITIAL_ALLOWED_SLIPPAGE,
      updateUserSlippageTolerance: (userSlippageTolerance: number) =>
        set((state) => {
          return {
            ...state,
            userSlippageTolerance,
          }
        }),
    }),
    { name: "user" },
  ),
)

// export function useUserSlippageTolerance(): [
//   number,
//   (slippage: number) => void,
// ] {
//   const dispatch = useDispatch<AppDispatch>()
//   const userSlippageTolerance = useSelector<
//     AppState,
//     AppState["user"]["userSlippageTolerance"]
//   >((state) => {
//     return state.user.userSlippageTolerance
//   })

//   const setUserSlippageTolerance = useCallback(
//     (userSlippageTolerance: number) => {
//       dispatch(updateUserSlippageTolerance({ userSlippageTolerance }))
//     },
//     [dispatch],
//   )

//   return [userSlippageTolerance, setUserSlippageTolerance]
// }

export default useUserState
