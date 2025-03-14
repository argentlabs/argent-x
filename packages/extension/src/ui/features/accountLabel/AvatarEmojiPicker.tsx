import type { SystemStyleObject } from "@chakra-ui/react"
import { Box, useBreakpoint } from "@chakra-ui/react"
import { lazy, Suspense } from "react"
import type { FC } from "react"
import { Categories, Theme } from "./emoji-picker.types"
import { motion } from "framer-motion"
import { scrollbarStyleThin, typographyStyles } from "@argent/x-ui/theme"

const EmojiPickerLazy = lazy(() => import("emoji-picker-react"))

const configByCategory = [
  {
    category: Categories.SMILEYS_PEOPLE,
    name: "Smileys & People",
  },
  {
    category: Categories.ANIMALS_NATURE,
    name: "Animals & Nature",
  },
  {
    category: Categories.FOOD_DRINK,
    name: "Food & Drink",
  },
  {
    category: Categories.TRAVEL_PLACES,
    name: "Travel & Places",
  },
  {
    category: Categories.ACTIVITIES,
    name: "Activities",
  },
  {
    category: Categories.OBJECTS,
    name: "Objects",
  },
  {
    category: Categories.SYMBOLS,
    name: "Symbols",
  },
  {
    category: Categories.FLAGS,
    name: "Flags",
  },
]

interface AvatarEmojiPickerProps {
  emoji?: string | null
  onEmojiChange: (emoji: string) => void
  bgColor?: string
}

export const AvatarEmojiPicker: FC<AvatarEmojiPickerProps> = ({
  emoji,
  onEmojiChange,
  bgColor,
}) => {
  const breakpoint = useBreakpoint()
  const height = breakpoint === "base" ? "228px" : "450px"

  const emojiFocusColor = bgColor || "text-success"

  const styles: SystemStyleObject = {
    ".EmojiPickerReact": {
      "--epr-bg-color": "var(--chakra-colors-surface-default)",
      "--epr-category-label-bg-color": "var(--chakra-colors-surface-default)",
      "--epr-picker-border-color": "var(--chakra-colors-stroke-subtle)",
      "--epr-header-padding": "7px 8px 12px",
      "--epr-emoji-size": "26px",
      "--epr-picker-border-radius": "var(--chakra-radii-lg)",
      "--epr-search-input-border-radius": "var(--chakra-radii-xl)",
      "--epr-dark-search-input-bg-color": "var(--chakra-colors-surface-sunken)",
      "--epr-search-input-text-color": "var(--chakra-colors-text-primary)",
      "--epr-category-padding": "0 20px",
      "--epr-category-label-padding": "0 20px 8px",
      "--epr-emoji-padding": "2px",
      "--epr-highlight-color": "var(--chakra-colors-text-subtle)",
      "--epr-focus-bg-color": `var(--chakra-colors-${emojiFocusColor})`,
      "--epr-search-input-padding": "0 40px",
      "--epr-search-border-color": "var(--chakra-colors-neutrals-400)",

      ".epr-emoji-category-content": {
        rowGap: "5px",
        columnGap: "13px",
        gridTemplateColumns: "repeat(auto-fill, minmax(26px, 1fr))",
      },

      input: {
        fontFamily: "var(--chakra-fonts-body)",
        ...typographyStyles.P2,
      },

      ".epr-icn-search": {
        backgroundImage: 'url("../../../assets/search.svg")',
        backgroundPositionY: "center",
      },

      "#epr-category-nav-id": {
        // Hide the category nav
        display: "none",
      },

      ".epr-emoji-category-label": {
        height: "auto",
        color: "#707174",
        fontSize: "12px",
        fontWeight: "600",
        textTransform: "uppercase",
        fontFamily: "var(--chakra-fonts-body)",
      },

      ...scrollbarStyleThin,
    },
  }

  return (
    <Box my={4} sx={styles}>
      <Suspense fallback={null}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <EmojiPickerLazy
            open
            lazyLoadEmojis
            onEmojiClick={({ emoji }) => onEmojiChange(emoji)}
            skinTonesDisabled
            autoFocusSearch={false}
            theme={Theme.DARK}
            width="100%"
            height={height}
            categories={configByCategory}
            previewConfig={{
              showPreview: false,
              defaultEmoji: emoji ?? undefined,
            }}
          />
        </motion.div>
      </Suspense>
    </Box>
  )
}
