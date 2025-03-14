// This file is types defined in emoji-picker-react. This is to avoid importing the entire library in the extension.
// The component itself is lazy loaded in the AvatarEmojiPicker component.
export enum Categories {
  SUGGESTED = "suggested",
  CUSTOM = "custom",
  SMILEYS_PEOPLE = "smileys_people",
  ANIMALS_NATURE = "animals_nature",
  FOOD_DRINK = "food_drink",
  TRAVEL_PLACES = "travel_places",
  ACTIVITIES = "activities",
  OBJECTS = "objects",
  SYMBOLS = "symbols",
  FLAGS = "flags",
}

export enum EmojiStyle {
  NATIVE = "native",
  APPLE = "apple",
  TWITTER = "twitter",
  GOOGLE = "google",
  FACEBOOK = "facebook",
}

export enum Theme {
  DARK = "dark",
  LIGHT = "light",
  AUTO = "auto",
}
