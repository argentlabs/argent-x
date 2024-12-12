import type { FlexProps } from "@chakra-ui/react"
import { Box, Flex } from "@chakra-ui/react"
import type { FC, KeyboardEvent } from "react"
import { useState, useCallback, useRef } from "react"
import StarIcon from "./StarIcon"

interface RatingProps extends Omit<FlexProps, "onChange"> {
  max?: number
  onChange?: (rating: number) => void
}

export const StarRating: FC<RatingProps> = ({ max = 5, onChange, ...rest }) => {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [focused, setFocused] = useState(0)
  const containerRef = useRef(null)

  const handleClick = useCallback(
    (value: number) => {
      setRating(value)
      if (onChange) {
        onChange(value)
      }
    },
    [onChange],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault()
      let newFocus = focused

      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          newFocus = Math.min(focused + 1, max)
          break
        case "ArrowLeft":
        case "ArrowDown":
          newFocus = Math.max(focused - 1, 1)
          break
        case " ":
        case "Enter":
          handleClick(focused)
          return
        default:
          return
      }

      setFocused(newFocus)
    },
    [focused, max, handleClick],
  )

  return (
    <Flex
      ref={containerRef}
      tabIndex={0}
      role="radiogroup"
      aria-label="Rating"
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {[...Array(max)].map((_, index) => {
        const value = index + 1
        return (
          <Box
            key={index}
            as="button"
            aria-label={`Rate ${value} stars`}
            role="radio"
            aria-checked={rating === value}
            aria-posinset={value}
            aria-setsize={max}
            onClick={() => handleClick(value)}
            onMouseEnter={() => setHover(value)}
            onMouseLeave={() => setHover(0)}
            onFocus={() => setFocused(value)}
            className="focus:outline-none"
            fontSize="36px"
          >
            <StarIcon
              opacity={value <= (hover || focused || rating) ? 1 : 0.4}
              transform={value === hover ? `scale(1.2)` : undefined}
            />
          </Box>
        )
      })}
    </Flex>
  )
}
