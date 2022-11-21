import { Call } from "starknet"

import { reviewErc20Transfer } from "./erc20"

export interface ReviewRow {
  title: string
  value: string
}

export interface ReviewBlock {
  rows: ReviewRow[]
}

export interface Review {
  title: string
  blocks: ReviewBlock[]
}

const reviewServices = [reviewErc20Transfer]

async function reviewCall(call: Call): Promise<ReviewBlock> {
  const reviews = await Promise.allSettled(
    reviewServices.map((service) => service(call)),
  )
  const review = reviews.find((review) => review.status === "fulfilled")
  if (!review || review.status !== "fulfilled") {
    console.warn("No review found for call", reviews)
    return {
      rows: [
        {
          title: "Unknown contract",
          value: call.contractAddress,
        },
        {
          title: `Method`,
          value: call.entrypoint,
        },
      ],
    }
  }
  return review.value
}

export async function reviewTransaction(calls: Call[]): Promise<Review> {
  const blocks = await Promise.all(calls.map(reviewCall))
  return {
    title: "Review transaction",
    blocks,
  }
}
