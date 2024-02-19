import { Button, icons } from "@argent/ui"
import {
  Input,
  InputGroup,
  InputLeftElement,
  InputProps,
  InputRightElement,
} from "@chakra-ui/react"
import { FC, FormEvent, useCallback, useRef, useState } from "react"

import { useOnClickOutside } from "../../../services/useOnClickOutside"

const { EditIcon, TickIcon } = icons

interface AccountNameProps extends InputProps {
  onSubmit: () => void
  onCancel: () => void
}

export const AccountEditName: FC<AccountNameProps> = ({
  onSubmit,
  onCancel,
  ...rest
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  useOnClickOutside(formRef, () => {
    setIsEditing(false)
    onCancel()
  })
  const doSubmit = useCallback(() => {
    inputRef.current?.blur()
    setIsEditing(false)
    onSubmit()
  }, [onSubmit])
  const handleFromSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      doSubmit()
    },
    [doSubmit],
  )
  const onAccessoryButtonClick = useCallback(() => {
    if (isEditing) {
      doSubmit()
    } else {
      inputRef.current?.focus()
    }
  }, [doSubmit, isEditing])
  return (
    <form ref={formRef} onSubmit={handleFromSubmit} autoComplete="off">
      <InputGroup>
        <Input
          ref={inputRef}
          textAlign="center"
          fontWeight="bold"
          fontSize="base"
          spellCheck="false"
          onFocus={() => setIsEditing(true)}
          placeholder="Account name"
          {...rest}
        />
        <InputLeftElement w={6} bottom={0} h="initial" />
        <InputRightElement bottom={0} h="initial">
          <Button
            colorScheme={isEditing ? "primary" : "transparent"}
            padding="1"
            fontSize="base"
            size="auto"
            rounded="full"
            onClick={onAccessoryButtonClick}
          >
            {isEditing ? <TickIcon /> : <EditIcon />}
          </Button>
        </InputRightElement>
      </InputGroup>
    </form>
  )
}
