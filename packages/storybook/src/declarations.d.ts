declare module "*.svg"
declare module "*.gif"
declare module "*.png" {
  const url: string
  export default url
}
declare module "*.txt" {
  const url: string
  export default url
}
