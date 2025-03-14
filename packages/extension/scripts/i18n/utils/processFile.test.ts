import { describe, expect, it } from "vitest"
import { processFileContent } from "./processFile"

describe("processFileContent", () => {
  it("should process simple text content", async () => {
    const mockContent = `
        function MyComponent() {
            return <div>Hello World</div>
        }
    `
    const result = await processFileContent({
      content: mockContent,
      componentName: "MyComponent",
    })

    expect(result).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslation } from "react-i18next";
      function MyComponent() {
        const { t } = useTranslation();
        return <div>{t("myComponent.helloWorld")}</div>;
      }
      ",
        "needsTranslation": true,
        "translation": {
          "myComponent.helloWorld": "Hello World",
        },
      }
    `)
  })

  it("should process JSX attributes", async () => {
    const mockContent = `
      function MyComponent() {
        return <button title="Click Me">Submit</button>
      }
    `
    const result = await processFileContent({
      content: mockContent,
      componentName: "MyComponent",
    })

    expect(result).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslation } from "react-i18next";
      function MyComponent() {
        const { t } = useTranslation();
        return (
          <button title={t("myComponent.clickMe")}>{t("myComponent.submit")}</button>
        );
      }
      ",
        "needsTranslation": true,
        "translation": {
          "myComponent.clickMe": "Click Me",
          "myComponent.submit": "Submit",
        },
      }
    `)
  })

  it("should process conditional expressions", async () => {
    const mockContent = `
      function MyComponent({ isError }) {
        return <div>{isError ? "Error occurred" : "Success"}</div>
      }
    `
    const result = await processFileContent({
      content: mockContent,
      componentName: "MyComponent",
    })

    expect(result).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslation } from "react-i18next";
      function MyComponent({ isError }) {
        const { t } = useTranslation();
        return (
          <div>
            {isError ? t("myComponent.errorOccurred") : t("myComponent.success")}
          </div>
        );
      }
      ",
        "needsTranslation": true,
        "translation": {
          "myComponent.errorOccurred": "Error occurred",
          "myComponent.success": "Success",
        },
      }
    `)
  })

  it("should process array literals", async () => {
    const mockContent = `
      function MyComponent() {
        const messages = ["First Message", "Second Message"]
        return <div>{messages.map(msg => <p>{msg}</p>)}</div>
      }
    `
    const result = await processFileContent({
      content: mockContent,
      componentName: "MyComponent",
    })

    expect(result).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslation } from "react-i18next";
      function MyComponent() {
        const { t } = useTranslation();
        const messages = [
          t("myComponent.firstMessage"),
          t("myComponent.secondMessage"),
        ];
        return (
          <div>
            {messages.map((msg) => (
              <p>{msg}</p>
            ))}
          </div>
        );
      }
      ",
        "needsTranslation": true,
        "translation": {
          "myComponent.firstMessage": "First Message",
          "myComponent.secondMessage": "Second Message",
        },
      }
    `)
  })

  it("should not translate non-localizable content", async () => {
    const mockContent = `
      function MyComponent() {
        return <div>hello_world</div>
      }
    `
    const result = await processFileContent({
      content: mockContent,
      componentName: "MyComponent",
    })

    expect(result).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslation } from "react-i18next";
      function MyComponent() {
        const { t } = useTranslation();
        return <div>{t("myComponent.helloWorld")}</div>;
      }
      ",
        "needsTranslation": true,
        "translation": {
          "myComponent.helloWorld": "hello_world",
        },
      }
    `)
  })

  it("should handle nested JSX elements", async () => {
    const mockContent = `
      function MyComponent() {
        return (
          <div>
            <h1>Welcome</h1>
            <p>Please read our <a href="#">Terms of Service</a></p>
          </div>
        )
      }
    `
    const result = await processFileContent({
      content: mockContent,
      componentName: "MyComponent",
    })

    expect(result).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslation } from "react-i18next";
      function MyComponent() {
        const { t } = useTranslation();
        return (
          <div>
            <h1>{t("myComponent.welcome")}</h1>
            <p>
              {t("myComponent.pleaseReadOur")}
              <a href="#">{t("myComponent.termsOfService")}</a>
            </p>
          </div>
        );
      }
      ",
        "needsTranslation": true,
        "translation": {
          "myComponent.pleaseReadOur": "Please read our",
          "myComponent.termsOfService": "Terms of Service",
          "myComponent.welcome": "Welcome",
        },
      }
    `)
  })

  it("should verify translation key format", async () => {
    const mockContent = `
      function MyComponent() {
        return <div>Hello World</div>
      }
    `
    const result = await processFileContent({
      content: mockContent,
      componentName: "MyComponent",
    })

    expect(result).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslation } from "react-i18next";
      function MyComponent() {
        const { t } = useTranslation();
        return <div>{t("myComponent.helloWorld")}</div>;
      }
      ",
        "needsTranslation": true,
        "translation": {
          "myComponent.helloWorld": "Hello World",
        },
      }
    `)
  })

  it("should handle multiple translations in the same component", async () => {
    const mockContent = `
      function MyComponent() {
        return (
          <>
            <h1>Welcome</h1>
            <p>Please login</p>
            <button>Submit</button>
          </>
        )
      }
    `
    const result = await processFileContent({
      content: mockContent,
      componentName: "MyComponent",
    })

    expect(result).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslation } from "react-i18next";
      function MyComponent() {
        const { t } = useTranslation();
        return (
          <>
            <h1>{t("myComponent.welcome")}</h1>
            <p>{t("myComponent.pleaseLogin")}</p>
            <button>{t("myComponent.submit")}</button>
          </>
        );
      }
      ",
        "needsTranslation": true,
        "translation": {
          "myComponent.pleaseLogin": "Please login",
          "myComponent.submit": "Submit",
          "myComponent.welcome": "Welcome",
        },
      }
    `)
  })

  it("should process text attributes but not data-like attributes", async () => {
    const mockContent = `
        function MyComponent() {
          return (
            <View
              p="10"
              bg="red"
              data-testid="hello-world"
              bg="rgba(0, 0, 0, 0.5)"
              background="neutrals.700"
              borderRadius="2xl"
              title={"Title attribute"}
              subtitle={"Subtitle attribute"}
            >
              Hello World
            </View>
          );
        }
    `
    const result = await processFileContent({
      content: mockContent,
      componentName: "MyComponent",
    })

    expect(result).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslation } from "react-i18next";
      function MyComponent() {
        const { t } = useTranslation();
        return (
          <View
            p="10"
            bg="red"
            data-testid="hello-world"
            bg="rgba(0, 0, 0, 0.5)"
            background="neutrals.700"
            borderRadius="2xl"
            title={t("myComponent.titleAttribute")}
            subtitle={t("myComponent.subtitleAttribute")}
          >
            {t("myComponent.helloWorld")}
          </View>
        );
      }
      ",
        "needsTranslation": true,
        "translation": {
          "myComponent.helloWorld": "Hello World",
          "myComponent.subtitleAttribute": "Subtitle attribute",
          "myComponent.titleAttribute": "Title attribute",
        },
      }
    `)
  })

  it("should not interpolate control characters", async () => {
    const mockContent = `
      function MyComponent(props) {
        return (
          <Text
            color="text-success"
            bg="rgba(0, 0, 0, 0.5)"
            background="neutrals.700"
            borderRadius="2xl"
            {...props}
          >
            {"\u23FA"} Ledger connected{" "}
          </Text>
        )
      }
    `
    const result = await processFileContent({
      content: mockContent,
      componentName: "MyComponent",
    })

    expect(result).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslation } from "react-i18next";
      function MyComponent(props) {
        const { t } = useTranslation();
        return (
          <Text
            color="text-success"
            bg="rgba(0, 0, 0, 0.5)"
            background="neutrals.700"
            borderRadius="2xl"
            {...props}
          >
            {"\u23FA"}
            {t("myComponent.ledgerConnected")}{" "}
          </Text>
        );
      }
      ",
        "needsTranslation": true,
        "translation": {
          "myComponent.ledgerConnected": "Ledger connected",
        },
      }
    `)
  })

  it("should translate multi line ternary in atribute", async () => {
    const mockContent = `
      function MyComponent() {
        return (
          <Option
            as={Link}
            to={routes.fundingProvider()}
            state={state}
            title={"Buy with card or bank transfer"}
            icon={<CardSecondaryIcon />}
            description={
              isBanxaEnabled
                ? "Provided by Ramp, Banxa and Topper"
                : "Provided by Ramp and Topper"
            }
          />
        );
      }
    `

    const result = await processFileContent({
      content: mockContent,
      componentName: "MyComponent",
    })

    expect(result).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslation } from "react-i18next";
      function MyComponent() {
        const { t } = useTranslation();
        return (
          <Option
            as={Link}
            to={routes.fundingProvider()}
            state={state}
            title={t("myComponent.buyWithCardOrBankTransfer")}
            icon={<CardSecondaryIcon />}
            description={
              isBanxaEnabled
                ? t("myComponent.providedByRampBanxaAndTopper")
                : t("myComponent.providedByRampAndTopper")
            }
          />
        );
      }
      ",
        "needsTranslation": true,
        "translation": {
          "myComponent.buyWithCardOrBankTransfer": "Buy with card or bank transfer",
          "myComponent.providedByRampAndTopper": "Provided by Ramp and Topper",
          "myComponent.providedByRampBanxaAndTopper": "Provided by Ramp, Banxa and Topper",
        },
      }
    `)
  })

  it("should not add unnecessary interpolation variables", async () => {
    const mockContent = `
      function MyComponent() {
        return <span data-testid="tokenBalance">
          Balance: {prettifyTokenBalance({ ...token, balance })}
        </span>
      }
    `

    const result = await processFileContent({
      content: mockContent,
      componentName: "MyComponent",
    })

    expect(result).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslation } from "react-i18next";
      function MyComponent() {
        const { t } = useTranslation();
        return (
          <span data-testid="tokenBalance">
            {t("myComponent.balance")}
            {prettifyTokenBalance({ ...token, balance })}
          </span>
        );
      }
      ",
        "needsTranslation": true,
        "translation": {
          "myComponent.balance": "Balance:",
        },
      }
    `)
  })

  it("should not add the hook if there are no translations", async () => {
    const mockContent = `
      function MyComponent1() {
        return <PrivateKeyExportButton onClick={onClick} action={upperFirst(action)} />
      }

      function MyComponent2() {
        return <div>Hello World</div>
      }
    `

    const result = await processFileContent({
      content: mockContent,
      componentName: "MyComponent",
    })

    expect(result).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslation } from "react-i18next";
      function MyComponent1() {
        return (
          <PrivateKeyExportButton onClick={onClick} action={upperFirst(action)} />
        );
      }

      function MyComponent2() {
        const { t } = useTranslation();
        return <div>{t("myComponent.helloWorld")}</div>;
      }
      ",
        "needsTranslation": true,
        "translation": {
          "myComponent.helloWorld": "Hello World",
        },
      }
    `)
  })

  it("should interpolate translatable strings", async () => {
    const mockContent = `
      function MyComponent() {
        return <MenuItem
          onClick={() =>
            void openBlockExplorerAddress(currentNetwork, tokenAddress)
          }
        >
          View on {blockExplorerTitle}
        </MenuItem>
      }
    `

    const result = await processFileContent({
      content: mockContent,
      componentName: "MyComponent",
    })

    expect(result).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslation } from "react-i18next";
      function MyComponent() {
        const { t } = useTranslation();
        return (
          <MenuItem
            onClick={() =>
              void openBlockExplorerAddress(currentNetwork, tokenAddress)
            }
          >
            {t("myComponent.viewOn", { blockExplorerTitle })}
          </MenuItem>
        );
      }
      ",
        "needsTranslation": true,
        "translation": {
          "myComponent.viewOn": "View on {{blockExplorerTitle}}",
        },
      }
    `)
  })

  it("should add the hook when the tranlsation is in a closure", async () => {
    const mockContent = `
      function MyComponent() {
        const header = (
          <Center px={4} pt={2} pb={6}>
            <H3>Activity</H3>
          </Center>
        )
        return <SomeOtherComponent header={header} />
      }
    `

    const result = await processFileContent({
      content: mockContent,
      componentName: "MyComponent",
    })

    expect(result).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslation } from "react-i18next";
      function MyComponent() {
        const { t } = useTranslation();
        const header = (
          <Center px={4} pt={2} pb={6}>
            <H3>{t("myComponent.activity")}</H3>
          </Center>
        );

        return <SomeOtherComponent header={header} />;
      }
      ",
        "needsTranslation": true,
        "translation": {
          "myComponent.activity": "Activity",
        },
      }
    `)
  })

  it("should add the hook when the translation is in an effect", async () => {
    const mockContent = `
      function MyComponent() {
        const header = useMemo(() => (
          <Center px={4} pt={2} pb={6}>
            <H3>Activity</H3>
          </Center>
        ), [])
        return <SomeOtherComponent header={header} />
      }
    `

    const result = await processFileContent({
      content: mockContent,
      componentName: "MyComponent",
    })

    expect(result).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslation } from "react-i18next";
      function MyComponent() {
        const { t } = useTranslation();
        const header = useMemo(
          () => (
            <Center px={4} pt={2} pb={6}>
              <H3>{t("myComponent.activity")}</H3>
            </Center>
          ),
          [],
        );
        return <SomeOtherComponent header={header} />;
      }
      ",
        "needsTranslation": true,
        "translation": {
          "myComponent.activity": "Activity",
        },
      }
    `)
  })
})
