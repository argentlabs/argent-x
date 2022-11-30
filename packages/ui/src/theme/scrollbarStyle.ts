export const scrollbarStyle = {
  "&::-webkit-scrollbar-track": {
    backgroundColor: "transparent",
  },
  "&::-webkit-scrollbar-corner": {
    backgroundColor: "transparent",
  },
  "&::-webkit-scrollbar": {
    width: 1.5,
    height: 1.5,
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "black30",
    borderRadius: "3px",
    border: "1px solid",
    borderColor: "white30",
  },
  scrollbarWidth: "none" /** hides scrollbar on FireFox */,
}
