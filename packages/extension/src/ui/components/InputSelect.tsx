import { HTMLProps, useId } from "react"
import { Controller, ControllerProps, FieldValues } from "react-hook-form"
import Select, {
  DropdownIndicatorProps,
  Props as ReactSelectProps,
  components,
} from "react-select"
import styled, { css } from "styled-components"

import { ChevronDown } from "./Icons/ChevronDown"
import { Container } from "./InputText"

export type InputSelectProps = Omit<
  ReactSelectProps,
  "ref" | "as" | "theme"
> & {
  classNamePrefix: string
}

const CustomDropdownIndicator = (props: DropdownIndicatorProps) => {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDown />
    </components.DropdownIndicator>
  )
}

export const InputSelect = styled(
  ({
    placeholder,
    autoFocus,
    onChange,
    value,
    isDisabled,
    className,
    style,
    inputRef,
    defaultValue,
    options,
    classNamePrefix,
    ...props
  }: {
    inputRef: any
    style: HTMLProps<HTMLDivElement>["style"]
  } & InputSelectProps) => {
    const id = useId()
    return (
      <Container className={className} style={style}>
        <Select
          placeholder={placeholder}
          id={id}
          onChange={onChange}
          blurInputOnSelect={true}
          value={value}
          autoFocus={autoFocus}
          isDisabled={isDisabled}
          ref={inputRef}
          defaultValue={defaultValue}
          options={options}
          classNamePrefix={classNamePrefix}
          components={{
            IndicatorSeparator: null,
            DropdownIndicator: CustomDropdownIndicator,
          }}
          {...props}
        />
      </Container>
    )
  },
)``

export type SelectOption = { label: string; value: string }

export type ControlledSelectProps<T extends FieldValues> = InputSelectProps &
  Omit<ControllerProps<T>, "render"> & {
    options: SelectOption[]
  }

export const validateSelectOption = (o: any): o is SelectOption => {
  return "label" in o && "value" in o
}

export const ControlledSelect = <T extends FieldValues>({
  name,
  control,
  defaultValue,
  rules,
  options,
  ...props
}: ControlledSelectProps<T>) => (
  <Controller
    name={name}
    control={control}
    defaultValue={defaultValue}
    rules={rules}
    render={({ field: { ref, value, onChange: onValueChange, ...field } }) => (
      <InputSelect
        style={{ position: "relative" }}
        options={options}
        value={options.find(
          (o) => validateSelectOption(o) && o.value === value,
        )}
        inputRef={ref}
        defaultValue={defaultValue}
        onChange={(newVal) =>
          validateSelectOption(newVal) && onValueChange(newVal.value)
        }
        {...field}
        {...props}
      />
    )}
  />
)

export type ControlledSelectType = typeof ControlledSelect

export const StyledControlledSelect: ControlledSelectType = styled(
  ControlledSelect,
)`
  padding: 0;

  ${({ classNamePrefix, theme }) => css`
    .${classNamePrefix}__control {
      padding: 17px 16px;
      background-color: ${theme.black};
      border: none;
      border-radius: 8px;
      cursor: pointer;
      border: 1px solid ${({ theme }) => theme.bg2};
      background-color: ${({ theme }) => theme.black};

      &:hover {
        border-color: ${({ theme }) => theme.bg2};
      }

      &--is-focused {
        box-shadow: none;
        border-radius: 8px 8px 0px 0px;
      }

      &--is-disabled {
        opacity: 0.5;
      }
    }

    .${classNamePrefix}__value-container, .${classNamePrefix}__indicator {
      padding: 0;
    }

    .${classNamePrefix}__single-value {
      font-size: 17px;
      line-height: 22px;
      color: ${theme.text1};
    }

    .${classNamePrefix}__menu {
      top: 85%;
      border: 1px solid ${theme.bg2};
      border-radius: 0px 0px 8px 8px;
      background-color: ${theme.black};

      &-list {
        overscroll-behavior: none;
        -ms-overflow-style: none; /* IE and Edge */
        scrollbar-width: none; /* Firefox */
        &::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      }
    }

    .${classNamePrefix}__option {
      font-size: 17px;
      line-height: 22px;
      color: ${theme.text1};
      padding: 13px 16px;
      cursor: pointer;

      &:active {
        background-color: rgba(255, 255, 255, 0.2);
      }

      &--is-focused {
        background-color: rgba(255, 255, 255, 0.1);
      }

      &--is-selected {
        background-color: rgba(255, 255, 255, 0.3);
      }
    }
  `}
`
