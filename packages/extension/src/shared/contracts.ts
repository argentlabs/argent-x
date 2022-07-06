export interface KnownContract {
  network: string
  iconFileName: string
  name: string
}

export interface KnownContractsMap {
  [contractAddress: string]: KnownContract
}

export const icons = {
  alpharoad: "alpharoad.svg",
  briq: "briq.png",
  jediswap: "jediswap.svg",
  myswap: "myswap.png",
}

export const knownContracts: KnownContractsMap = {
  "0x0266b1276d23ffb53d99da3f01be7e29fa024dd33cd7f7b1eb7a46c67891c9d0": {
    network: "goerli-alpha",
    name: "briq",
    iconFileName: icons.briq,
  },
  "0x04bc8ac16658025bff4a3bd0760e84fcf075417a4c55c6fae716efdd8f1ed26c": {
    network: "goerli-alpha",
    name: "Jediswap",
    iconFileName: icons.jediswap,
  },
  "0x05f405f9650c7ef663c87352d280f8d359ad07d200c0e5450cb9d222092dc756": {
    network: "goerli-alpha",
    name: "Jediswap",
    iconFileName: icons.jediswap,
  },
  "0x024da028e8176afd3219fbeafb17c49624af9b86dcbe81007ae40d93f741617d": {
    network: "goerli-alpha",
    name: "Jediswap",
    iconFileName: icons.jediswap,
  },
  "0x01ca5dedf1612b1ffb035e838ac09d70e500d22cf9cd0de4bebcef8553506fdb": {
    network: "goerli-alpha",
    name: "Jediswap",
    iconFileName: icons.jediswap,
  },
  "0x7394cbe418daa16e42b87ba67372d4ab4a5df0b05c6e554d158458ce245bc10": {
    network: "goerli-alpha",
    name: "mySwap",
    iconFileName: icons.myswap,
  },
  "0x71faa7d6c3ddb081395574c5a6904f4458ff648b66e2123b877555d9ae0260e": {
    network: "goerli-alpha",
    name: "mySwap",
    iconFileName: icons.myswap,
  },
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7": {
    network: "goerli-alpha",
    name: "Alpha Road",
    iconFileName: icons.alpharoad,
  },
  "0x4aec73f0611a9be0524e7ef21ab1679bdf9c97dc7d72614f15373d431226b6a": {
    network: "goerli-alpha",
    name: "Alpha Road",
    iconFileName: icons.alpharoad,
  },
}
