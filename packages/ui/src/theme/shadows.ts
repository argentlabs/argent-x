export const shadows = {
  outline:
    "0 0 0 3px rgba(255, 255, 255, 0.5)" /** default used for :focus-visible */,
  outlineAccent: "0 0 0 2px var(--chakra-colors-accent-500)",
  outlineError: "0 0 0 2px var(--chakra-colors-error-500)",
  error:
    "inset 0 -20px 0 -18px var(--chakra-colors-error-500)" /** using large values gives a 2px inner shadow with no visual influence from the border radius */,
  menu: "0px 4px 20px rgba(0, 0, 0, 0.5);",
  neutralsButtonLight: "0px 4px 12px rgba(0, 0, 0, 0.06)",
  box: "0px 0px 10px rgba(0, 0, 0, 0.03)",
}
