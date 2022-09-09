import create from "zustand"
import { persist } from "zustand/middleware"

export interface ReviewState {
  hasReviewed: boolean
}

export const useReviewStatus = create<ReviewState>(
  persist(
    (_set, _get) => ({
      hasReviewed: false,
    }),
    { name: "userReview" },
  ),
)
