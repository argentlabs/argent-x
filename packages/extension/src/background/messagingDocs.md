# Messaging

Direct communication from frontend and background service is not allowed and it's done through `messages`. We use [trpc](https://trpc.io/) alongside the [trpc-chrome](https://github.com/jlalmes/trpc-chrome) dependency to make these messages type-safe and keep the architecture clean and modular.

## Mutations / writes

```js
const Component = () => {
  const onClick = () => {
    someService.doSomethingInTheBackground(argument)
  }

  return <button onClick={onClick} />
}
```

We usually recommend using trpc `mutations` to cover this message flow.

```js
import { messageClient } from "...."
class SomeService implements ISomeService {
  async doSomethingInTheBackground() {
    try {
      messageClient.someBackgroundService.doSomething.mutate()
    } catch (e) {
      throw Error(`doSomethingInTheBackground failed with: ${e}`)
    }
  }
}
```

These messages will be then managed by the correct router in the background. `router.ts` is where the different routers are implemented. We have one router for each service and we try to inject dependencies into trpc rather than import them in the `procedures`.

Once routed, this message lands with its payload in the correct procedure, in this case we would have `doSomethingProcedure` that is mapped to `doSomething`.

#### Make sure to preserve separation of concerns between the UI and the background. Utils that can be used by both should be in shared, everything else should live in the right folder.

Each procedure then acts in a similar way to a middleware, doing the following:

- Input and output validation with zod
- Dependency injection
- Service calls

Use background services in the procedures rather than having the logic there directly

```js
export const doSomethingProcedure = extensionOnlyProcedure
  .input(myInputValidationSchema)
  .ouput(myOutputValidationSchema)
  .mutation(
    async ({
      input,
      ctx: {
        // these are the injected services if necessary
        services
      }
    }) => {
      try {
        const result = await backgroundService.doSomething(input)
        return result
      } catch (e) {
        throw new Error(
          `Something failed in doSomethingProcedure: ${e}`
        )
      }
    }
  )
```

#### ⚠️ Important: the messaging system should be used primarily to mutate data. When reading reading data, the general rule of thumb is to first rely on the shared storage between background and UI, and only if necessary rely on trpc `queries`.
