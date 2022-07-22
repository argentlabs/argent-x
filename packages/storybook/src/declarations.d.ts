declare module "*.svg"
declare module "*.gif"
declare module "*.txt" {
  const url: string
  export default url
}
