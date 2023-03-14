import path from "path"

export default {
  password: "MyP@ss3!",
  artifactsDir: path.resolve(__dirname, "../artifacts/playwright"),
  reportsDir: path.resolve(__dirname, "../artifacts/reports"),
  distDir: path.join(__dirname, "../../dist/"),

  wallets: [
    {
      // NOTE: Seed phrase is here intentionally and is used only for local testing. DO NOT use for any other purpose
      seed: "dove luxury shield hill chronic radio used barely rifle brick author bounce",
      accounts: [
        // 0.9992 ETH, deployed
        "0x0027A5C4b2Fe3D2F2623A9B9d91b73b53fBefba45087e572C22A27005a602B74",
        // 2 ETH, not deployed
        "0x03eC198B36781Bbb352ffa55c3E3b48F74C469da3495b6Bc211D87d61B9fDF7b",
      ],
    },
    {
      // NOTE: Seed phrase is here intentionally and is used only for local testing. DO NOT use for any other purpose
      seed: "muffin abandon fancy enhance neglect fit team biology loyal traffic ocean wash",
      accounts: [
        // 1 ETH, not deployed
        "0x035508Aaf6C124D348686F31ca9981568F0c0d29b563a2Ecb045aA8C81334057",
      ],
    },
    {
      // NOTE: Seed phrase is here intentionally and is used only for local testing. DO NOT use for any other purpose
      seed: "slam water student cotton chalk okay auto police frown smart vague salon",
      // 32 accounts
    },
  ],
}
