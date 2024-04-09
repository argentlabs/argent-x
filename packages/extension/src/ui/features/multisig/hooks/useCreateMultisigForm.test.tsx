import { FieldError, P3 } from "@argent/x-ui"
import { Box, Button, Input, InputGroup } from "@chakra-ui/react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { JSXElementConstructor, ReactElement } from "react"
import { z } from "zod"
import * as baseMultisigModule from "../../../../shared/multisig/utils/baseMultisig"
import { accountMessagingService } from "../../../services/accountMessaging"
import {
  CreateMultisigFormSchema,
  useCreateMultisigForm,
} from "./useCreateMultisigForm"

const FormSchema = CreateMultisigFormSchema()

beforeEach(() => {
  vi.spyOn(baseMultisigModule, "getBaseMultisigAccounts").mockReturnValue(
    Promise.resolve([]),
  )
  vi.spyOn(
    accountMessagingService,
    "getPublicKeysBufferForMultisig",
  ).mockReturnValue(Promise.resolve([]))
})

describe("CreateMultisigFormSchema", () => {
  const validSchema = {
    signerKeys: [
      {
        key: "WboHR2jHcDboaEs6kfZcnbbA8UKLVmrs3KAbakj6r7H",
        name: "Owner 1",
      },
      {
        key: "AboHR2jHcDboaEs6kfZcnbbA8UKLVmrs3KAbakj6r7H",
        name: "Owner 2",
      },
      {
        key: "BboHR2jHcDboaEs6kfZcnbbA8UKLVmrs3KAbakj6r7H",
      },
    ],
    confirmations: 1,
  }

  it("validates valid schema", async () => {
    const result = await FormSchema.safeParseAsync(validSchema)
    expect(result.success).toBe(true)
  })

  it("validates invalid signerKeys", async () => {
    const invalidSchema = JSON.parse(JSON.stringify(validSchema))
    invalidSchema.signerKeys.push({ key: "foo" })

    const result = await FormSchema.safeParseAsync(invalidSchema)
    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.error).toBeInstanceOf(z.ZodError)
      expect(result.error.errors[0].message).toBe("Incorrect signer pubkey")
    }
  })

  it("validates duplicate signerKeys", async () => {
    const invalidSchema = JSON.parse(JSON.stringify(validSchema))
    invalidSchema.signerKeys.push({
      key: "BboHR2jHcDboaEs6kfZcnbbA8UKLVmrs3KAbakj6r7H",
    })

    const result = await FormSchema.safeParseAsync(invalidSchema)
    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.error).toBeInstanceOf(z.ZodError)
      expect(result.error.errors[0].message).toBe(
        "You cannot use the same key twice",
      )
    }
  })

  it("validates duplicate name", async () => {
    const invalidSchema = JSON.parse(JSON.stringify(validSchema))
    invalidSchema.signerKeys[2].name = "Owner 1"
    const result = await FormSchema.safeParseAsync(invalidSchema)
    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.error).toBeInstanceOf(z.ZodError)
      expect(result.error.errors[0].message).toBe(
        "You cannot use the same name twice",
      )
    }
  })

  it("validates invalid confirmations", async () => {
    const invalidSchema = JSON.parse(JSON.stringify(validSchema))
    invalidSchema.confirmations = 6
    const result = await FormSchema.safeParseAsync(invalidSchema)
    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.error).toBeInstanceOf(z.ZodError)
      expect(result.error.errors[0].message).toBe(
        "Confirmations should be less than or equal to signer pubkeys",
      )
    }
  })
})

describe("useCreateMultisigForm", () => {
  const TOTAL_OWNERS = 3

  const setup = (
    jsx: ReactElement<any, string | JSXElementConstructor<any>>,
  ) => {
    return {
      user: userEvent.setup(),
      ...render(jsx),
    }
  }

  describe("create a component that has a form and uses useCreateMultisigForm hook", async () => {
    const Component = () => {
      const signerKey = "EroHR2jHcDboaEs6kfZcnbbA8UKLVmrs3KAbakj6r7H"

      const {
        register,
        trigger,
        formState: { errors },
      } = useCreateMultisigForm(signerKey)

      return (
        <form onSubmit={() => void trigger("signerKeys")}>
          <P3 mb="1">Add owners</P3>
          {Array.from({ length: TOTAL_OWNERS }).map((_, index) => {
            return (
              <Box key={index}>
                <InputGroup display="flex" alignItems="center">
                  <Input
                    placeholder="Name"
                    {...register(`signerKeys.${index}.name` as const, {
                      required: true,
                    })}
                    mb={2}
                    aria-label={`input-name-${index}`}
                  />
                </InputGroup>
                <Box aria-label="key-name">
                  {errors.signerKeys?.[index]?.name && (
                    <FieldError aria-label={`error-name-${index}`}>
                      {errors.signerKeys?.[index]?.key?.message}
                    </FieldError>
                  )}
                </Box>

                <InputGroup display="flex" alignItems="center">
                  <Input
                    placeholder="Signer pubkey..."
                    {...register(`signerKeys.${index}.key` as const, {
                      required: true,
                    })}
                    aria-label={`input-key-${index}`}
                  />
                </InputGroup>
                <Box aria-label="key-error">
                  {errors.signerKeys?.[index]?.key && (
                    <FieldError aria-label={`error-key-${index}`}>
                      {errors.signerKeys?.[index]?.key?.message}
                    </FieldError>
                  )}
                </Box>
              </Box>
            )
          })}
          {errors.signerKeys && !Array.isArray(errors.signerKeys) && (
            <FieldError aria-label={`custom-error`}>
              {errors.signerKeys.message}
            </FieldError>
          )}
          <Button type={"submit"}>validate</Button>
        </form>
      )
    }

    it("validates the form and there are no errors", async () => {
      const { user } = setup(<Component key={Math.random()} />)
      // test that the form is rendered
      expect(screen.getByText("Add owners")).toBeInTheDocument()
      expect(await screen.findByText("validate")).toBeInTheDocument()

      for (let i = 0; i < TOTAL_OWNERS; i++) {
        await user.type(screen.getByLabelText(`input-name-${i}`), `Owner ${i}`)
        await user.type(
          screen.getByLabelText(`input-key-${i}`),
          `${i}roHR2jHcDboaEs6kfZcnbbA8UKLVmrs3KAbakj6r7H`,
        )
      }

      await user.click(screen.getByRole("button"))

      expect(
        screen.queryAllByLabelText("error-name-", { exact: false }),
      ).toHaveLength(0)

      expect(
        screen.queryAllByLabelText("error-key-", { exact: false }),
      ).toHaveLength(0)
    })

    it("displays error invalid signer keys", async () => {
      const { user } = setup(<Component key={Math.random()} />)
      // test that the form is rendered
      expect(screen.getByText("Add owners")).toBeInTheDocument()
      expect(await screen.findByText("validate")).toBeInTheDocument()

      for (let i = 0; i < TOTAL_OWNERS; i++) {
        await user.type(screen.getByLabelText(`input-name-${i}`), `Owner ${i}`)
        await user.type(
          screen.getByLabelText(`input-key-${i}`),
          `${i}roHR2jHcDb`,
        )
      }

      await user.click(screen.getByRole("button"))

      expect(
        screen.queryAllByLabelText("error-name-", { exact: false }),
      ).toHaveLength(0)

      const keyErrors = screen.queryAllByLabelText("error-key-", {
        exact: false,
      })
      expect(keyErrors).toHaveLength(TOTAL_OWNERS)
      Array.from({ length: TOTAL_OWNERS }).forEach((_, i) => {
        expect(keyErrors[i]).toHaveTextContent("Incorrect signer pubkey")
      })
    })

    it("displays error duplicate signer keys", async () => {
      const { user } = setup(<Component key={Math.random()} />)
      // test that the form is rendered
      expect(screen.getByText("Add owners")).toBeInTheDocument()
      expect(await screen.findByText("validate")).toBeInTheDocument()

      for (let i = 0; i < TOTAL_OWNERS; i++) {
        await user.type(screen.getByLabelText(`input-name-${i}`), `Owner ${i}`)
        await user.type(
          screen.getByLabelText(`input-key-${i}`),
          `WboHR2jHcDboaEs6kfZcnbbA8UKLVmrs3KAbakj6r7H`,
        )
      }

      await user.click(screen.getByRole("button"))

      expect(
        screen.queryAllByLabelText("error-name-", { exact: false }),
      ).toHaveLength(0)
      expect(
        screen.queryAllByLabelText("error-key-", { exact: false }),
      ).toHaveLength(0)

      expect(await screen.findByLabelText("custom-error")).toHaveTextContent(
        "You cannot use the same key twice",
      )
    })

    it("displays error duplicate signer names", async () => {
      const { user } = setup(<Component key={Math.random()} />)
      // test that the form is rendered
      expect(screen.getByText("Add owners")).toBeInTheDocument()
      expect(await screen.findByText("validate")).toBeInTheDocument()

      for (let i = 0; i < TOTAL_OWNERS; i++) {
        await user.type(screen.getByLabelText(`input-name-${i}`), `Owner`)
        await user.type(
          screen.getByLabelText(`input-key-${i}`),
          `${i}roHR2jHcDboaEs6kfZcnbbA8UKLVmrs3KAbakj6r7H`,
        )
      }

      await user.click(screen.getByRole("button"))

      expect(
        screen.queryAllByLabelText("error-name-", { exact: false }),
      ).toHaveLength(0)
      expect(
        screen.queryAllByLabelText("error-key-", { exact: false }),
      ).toHaveLength(0)

      expect(await screen.findByLabelText("custom-error")).toHaveTextContent(
        "You cannot use the same name twice",
      )
    })
  })
})
