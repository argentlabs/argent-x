import Emittery, {
  DatalessEventNames,
  EventName,
  OmnipresentEventData,
} from "emittery"
import { noop } from "lodash-es"
import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
} from "react"

interface EventEmitterContextProps {
  emitter: Emittery
}

const EventEmitterContext = createContext<EventEmitterContextProps | null>(null)

export const useEventEmitterContext = () => useContext(EventEmitterContext)

export const useIsEventEmitterEnabled = () =>
  Boolean(useEventEmitterContext()?.emitter)

interface EventEmitterProviderProps extends PropsWithChildren {
  emitter: Emittery
}

/**
 * Provides the instance of Emittery used by the hooks
 *
 * @example
 *
 * import Emittery from "emittery"
 *
 * function Component() {
 *   const emitter = useRef(new Emittery()).current
 *   return (
 *     <EventEmitterProvider emitter={emitter}>
 *       ...
 *     </EventEmitterProvider>
 *   )
 * }
 *
 * // typed events using Symbol
 *
 * const EventNameFooBar = Symbol("EventNameFooBar")
 *
 * type Events = { [EventNameFooBar]: void }
 *
 * // emit an event
 *
 * const emitEvent = useEmitEvent<Events>()
 * emitEvent(EventNameFooBar, ...)
 *
 * // listen for an event
 *
 * const eventListener = useEventListener<Events>()
 * eventListener(EventNameFooBar, () => {
 *   ...
 * });
 */

export const EventEmitterProvider: FC<EventEmitterProviderProps> = ({
  emitter,
  children,
}) => {
  return (
    <EventEmitterContext.Provider
      value={{
        emitter,
      }}
    >
      {children}
    </EventEmitterContext.Provider>
  )
}

/**
 * Provides a typed instance of Emittery
 *
 * @example
 *
 * const emitter = useEventEmitter<Events>();
 */

let _useEventEmitterDidWarn = false

export const useEventEmitter = <
  EventData = Record<EventName, unknown>,
  AllEventData = EventData & OmnipresentEventData,
  DatalessEvents = DatalessEventNames<EventData>,
>() => {
  const emitter = useEventEmitterContext()?.emitter
  if (!emitter && !_useEventEmitterDidWarn) {
    console.warn(
      "useEventEmitter - no emitter in current context, events will not work",
    )
    _useEventEmitterDidWarn = true
    return
  }
  const typedEmitter = emitter as Emittery<
    EventData,
    AllEventData,
    DatalessEvents
  >
  return typedEmitter
}

/**
 * Provides a typed event emitter - uses emitter.emit
 *
 * @example
 *
 * const emitEvent = useEmitEvent<Events>()
 * emitEvent(EventNameFooBar, ...)
 */

export const useEmitEvent = <EventData = Record<EventName, unknown>,>() => {
  const emitter = useEventEmitter<EventData>()
  if (!emitter) {
    return noop
  }
  return emitter.emit.bind(emitter)
}

/**
 * Provides a typed event listener - uses emitter.on and automatically unsubscribes
 *
 * @example
 *
 * const eventListener = useEventListener<Events>()
 * eventListener(EventNameFooBar, () => {
 *   ...
 * });
 */

export const useEventListener = <
  EventData = Record<EventName, unknown>,
  AllEventData = EventData & OmnipresentEventData,
>() => {
  const emitter = useEventEmitter<EventData, AllEventData>()
  const useEventListener = <Name extends keyof AllEventData>(
    eventName: Name | readonly Name[],
    listener: (eventData: AllEventData[Name]) => void,
  ) => {
    useEffect(() => {
      if (!emitter) {
        return
      }
      const unsubscribe = emitter.on(eventName, listener)
      return unsubscribe
    }, [eventName, listener])
  }
  return useEventListener
}
