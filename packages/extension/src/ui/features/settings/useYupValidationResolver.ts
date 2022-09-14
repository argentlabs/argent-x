import { useCallback } from "react"
import { Resolver } from "react-hook-form"
import { InferType, Schema, ValidationError } from "yup"

import { omitEmpty } from "../../../shared/utils/object"

export const useYupValidationResolver = <S extends Schema>(
  validationSchema: S,
) =>
  useCallback<Resolver<InferType<S>>>(
    async (data) => {
      try {
        const cleanedData = omitEmpty(data)
        const values = await validationSchema.validate(cleanedData, {
          abortEarly: false,
        })
        return {
          values,
          errors: {},
        }
      } catch (errors) {
        if (errors instanceof ValidationError) {
          return {
            values: data,
            errors: errors.inner.reduce(
              (allErrors, currentError) => ({
                ...allErrors,
                [currentError.path ?? "unknownPath"]: {
                  type: currentError.type ?? "validation",
                  message: currentError.message,
                },
              }),
              {},
            ),
          }
        }
        return {
          values: data,
          errors: {
            unknownError: {
              type: "unknown",
              message: "Unknown error",
            },
          },
        }
      }
    },
    [validationSchema],
  )
