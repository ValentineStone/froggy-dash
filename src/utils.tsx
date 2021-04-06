import { useCallback, useEffect, useMemo, useState } from 'react'

const cx_flatten = (from, to = []) => {
  if (typeof from === 'string' || from instanceof String)
    to.push(from)
  else if (from && typeof from === 'object')
    if (typeof from[Symbol.iterator] === 'function')
      for (const item of from)
        cx_flatten(item, to)
    else
      for (const key in from)
        if (from[key])
          to.push(key)
  return to
}

export const cx = (...args) => cx_flatten(args).join(' ')


export const _switch = (cases, defaultCase) => value => {
  if (value in cases) return cases[value]
  return defaultCase
}

export const log = (...args) => (console.log(...args), args[0])


export function dateAdd(date, interval, units) {
  if (!(date instanceof Date))
    return undefined;
  var ret = new Date(date); //don't change original date
  var checkRollover = function () { if (ret.getDate() != date.getDate()) ret.setDate(0); };
  switch (String(interval).toLowerCase()) {
    case 'year': ret.setFullYear(ret.getFullYear() + units); checkRollover(); break;
    case 'quarter': ret.setMonth(ret.getMonth() + 3 * units); checkRollover(); break;
    case 'month': ret.setMonth(ret.getMonth() + units); checkRollover(); break;
    case 'week': ret.setDate(ret.getDate() + 7 * units); break;
    case 'day': ret.setDate(ret.getDate() + units); break;
    case 'hour': ret.setTime(ret.getTime() + units * 3600000); break;
    case 'minute': ret.setTime(ret.getTime() + units * 60000); break;
    case 'second': ret.setTime(ret.getTime() + units * 1000); break;
    default: ret = undefined; break;
  }
  return ret;
}

export const sleep = ms => new Promise(r => setTimeout(r, ms))



const importedStyles = new Set()

export function stylize(nameOrUrl, content?) {
  if (!importedStyles.has(nameOrUrl)) {
    importedStyles.add(nameOrUrl)
    const style = document.createElement('style')
    style.innerHTML = content ? content : `@import url(${nameOrUrl});`
    document.head.appendChild(style)
  }
  else
    console.warn('attempted styles reimport for', nameOrUrl)
}

const createdStyles = new Map()
const createdStylesCounts = new Map()
export function Stylize({
  name = undefined,
  url = undefined,
  children = null
}) {
  useEffect(() => {
    let styleElement = createdStyles.get(name || url)
    let count = createdStylesCounts.get(name || url)
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.innerHTML = children ? children : `@import url(${url});`
      createdStyles.set(name || url, styleElement)
      createdStylesCounts.set(name || url, 0)
      count = 0
    }

    count += 1
    createdStylesCounts.set(name || url, count)
    styleElement.dataset.count = count

    if (count === 1)
      document.head.appendChild(styleElement)

    return () => {
      const count = createdStylesCounts.get(name || url)
      createdStylesCounts.set(name || url, count - 1)
      if (count === 1)
        document.head.removeChild(styleElement)
    }
  }, [name, url, children])
  return null
}

const Nothing = () => null
const Children = ({ children }) => typeof children === 'function' ? children() : children
export function usePromise(asyncFunction, dependencies = []) {
  const [state, setState] = useState(() => ({
    fulfilled: false,
    rejected: false,
    settled: false,
    pending: true,
    reason: undefined,
    value: undefined,
    Loading: (({ pending: Pending = Nothing }) => <Pending />) as any
  }))
  useEffect(() => {
    asyncFunction().then(
      value => setState(state => ({
        ...state,
        value,
        pending: false,
        fulfilled: true,
        settled: true,
        Loading: Children
      })),
      reason => setState(state => ({
        ...state,
        reason,
        pending: false,
        rejected: true,
        settled: true,
        Loading: () => { throw new Error(reason) }
      }))
    )
  }, [...dependencies])
  return state
}


export const asciify = str => str.replace(/\W/g, '').toLowerCase()

const idCounters = {}
export function claim_id(name = 'id') {
  if (!idCounters[name]) idCounters[name] = 0
  return asciify(name) + '_' + idCounters[name]++
}

export function parsePromptField(desc) {
  let name
  let type
  let message

  switch (desc[0]) {
    case '^': type = 'button'; break
    case '*': type = 'password'; break
    case '#': type = 'number'; break
    case '~': type = 'boolean'; break
    default: type = 'text'
  }

  if (type !== 'text') desc = desc.slice(1)

  const descPair = desc.split(':')
  if (descPair.length === 2) {
    message = descPair[1]
    name = descPair[0]
  } else {
    message = descPair[0]
    name = asciify(descPair[0])
  }

  return { name, type, message }
}

export const unbitmap_k = (value, bitmap) => Object.fromEntries(
  Object.entries(bitmap).filter(v => value & +v[0])
)
export const unbitmap_v = (value, bitmap) => Object.fromEntries(
  Object.entries(bitmap).filter(v => value & +v[1])
)

type GenericFunction = (...args) => any
export const call = <T extends GenericFunction>(fn: T) => fn() as ReturnType<T>
export const proxy_fn = <T extends GenericFunction>(fn: T) => ((...args) => fn(...args)) as T

import { EventEmitter } from 'events'
//@ts-ignore
EventEmitter.captureRejections = true

type Listener = (...args: any[]) => void

const subscribe_one = (emitter: EventEmitter, event: string, func: Listener) => {
  emitter.on(event, func)
  return () => emitter.off(event, func)
}

export const subscribe = (
  emitter: EventEmitter,
  event: string, func: Listener,
  ...morelisteners: any
) => {
  if (!morelisteners.length)
    return subscribe_one(emitter, event, func)
  const unsubbers = [subscribe_one(emitter, event, func)]
  for (let i = 0; morelisteners[i + 1]; i += 2)
    unsubbers.push(subscribe_one(emitter, morelisteners[i], morelisteners[i + 1]))
  return () => unsubbers.forEach(call)
}

export const once = (
  emitter: EventEmitter,
  event: string,
  check?: (...arg: any) => any,
  transform?: (...arg: any) => any,
) => {
  return new Promise((resolve, reject) => {
    const listen = (...args) => {
      if (!check || check(...args)) {
        emitter.off('error', reject)
        resolve(transform ? transform(...args) : args[0])
      }
      else emitter.once(event, listen)
    }
    emitter.once(event, listen)
    emitter.once('error', reject)
  }) as Promise<any>
}

export const assert_one = (value, error) => {
  if (value instanceof Promise)
    return value.then(v => assert(v, error))
  if (value)
    return value
  else
    throw new Error(error || 'Assertion failed')
}

export const assert = (value, error, ...more) => {
  if (!more.length)
    return assert_one(value, error)
  let assertion = assert_one(value, error)
  let is_async = assertion instanceof Promise
  const assertions = [assertion]
  for (let i = 0; i < more.length; i += 2) {
    assertion = assert_one(more[i], more[i + 1])
    is_async = is_async || assertion instanceof Promise
    assertions.push(assertion)
  }
  if (is_async)
    return Promise.all(assertions)
  else
    return assertions
}

export const stub = (...args: any) => undefined as any
export const identity = v => v
export const refEqual = (a, b) => a === b
export const useMap = (initialItems = [], onAdd?, onRemove?) => {
  const [{ raw, mapped }, setState] = useState(() => ({
    raw: [...initialItems],
    mapped: onAdd ? initialItems.map(onAdd) : [...initialItems]
  }))
  const addItems = useCallback((...items) => setState(({ raw, mapped }) => ({
    raw: [...raw, ...items],
    mapped: [...mapped, ...(onAdd ? items.map(onAdd) : items)]
  })), [onAdd])
  const removeItems = useCallback((...items) => setState(({ raw, mapped }) => {
    const raw_ = [...raw]
    const mapped_ = [...mapped]
    for (const item of items) {
      const index = raw_.indexOf(item)
      raw_.splice(index, 1)
      mapped_.splice(index, 1)
      if (onRemove) onRemove(mapped_[index], raw_[index])
    }
    return { raw: raw_, mapped: mapped_ }
  }), [onRemove])
  return [mapped as any, addItems, removeItems]
}

export function repeatRetryUntilTimeout(repeat, until, timeout = Infinity, retryLimit = Infinity, currentLimit = 0) {
  if (currentLimit >= retryLimit) return Promise.reject(new Error(
    `repeatRetryUntilTimeout hit retry limit of ${currentLimit} out of ${retryLimit} in:\n\trepeat ${repeat}\n\tuntil ${until}`
  ))
  return new Promise((resolve, reject) => {
    if (repeat) {
      try {
        const repeated = repeat()
        if (repeated instanceof Promise)
          repeated.catch(reject)
      } catch (e) {
        reject(e)
      }
    }
    until().then(resolve).catch(reject)
    if (timeout !== Infinity) setTimeout(reject, timeout)
  }).catch(reason => {
    if (reason instanceof Error)
      throw reason
    else
      return repeatRetryUntilTimeout(repeat, until, timeout, retryLimit, currentLimit + 1)
  })
}

const minus = (a, b, arr) => {
  if (arr) {
    const c = new Array(a.length)
    for (let i = 0; i < a.length; i++)
      c[i] = a[i] - b[i]
    return c
  }
  else return a - b
}
const plus_scaled = (a, b, scale, deltaIgnore, arr) => {
  if (arr) {
    const c = new Array(a.length)
    for (let i = 0; i < a.length; i++) {
      if (Math.abs(b[i]) <= deltaIgnore)
        c[i] = a[i]
      else
        c[i] = a[i] + b[i] * scale
    }
    return c
  }
  else {
    if (Math.abs(b) <= deltaIgnore)
      return a
    else
      return a + b * scale
  }
}

export const interpolate = (delta = 0) => {
  let arr
  let deltaIgnore = delta
  let prevTime
  let currTime
  let diffTime
  let prevPos
  let currPos
  let diffPos
  const next = (nextPos) => {
    arr = Array.isArray(nextPos)
    prevTime = currTime
    currTime = process.hrtime.bigint()
    prevPos = currPos
    currPos = nextPos
    if (!prevTime) {
      prevTime = currTime
      prevPos = currPos
    }
    diffTime = Number(currTime - prevTime)
    diffPos = minus(currPos, prevPos, arr)
  }
  const now = () => {
    if (!prevTime) return undefined
    const nowTime = process.hrtime.bigint()
    const nowDiffTime = Number(nowTime - currTime)
    const nowFracTime = diffTime ? nowDiffTime / diffTime : 0
    const nowPos = plus_scaled(currPos, diffPos, nowFracTime, deltaIgnore, arr)
    return nowPos
  }
  return { next, now }
}

type EE<T extends keyof EventEmitter> = Parameters<EventEmitter[T]>
export class ArrayEventEmitter extends Array implements EventEmitter {
  #ee: EventEmitter
  constructor(...args) {
    super(...args)
    this.#ee = new EventEmitter()
  }
  addListener = (...a: EE<'addListener'>) => (this.#ee.addListener(...a), this)
  emit = (...a: EE<'emit'>) => this.#ee.emit(...a)
  eventNames = (...a: EE<'eventNames'>) => this.#ee.eventNames(...a)
  getMaxListeners = (...a: EE<'getMaxListeners'>) => this.#ee.getMaxListeners(...a)
  listenerCount = (...a: EE<'listenerCount'>) => this.#ee.listenerCount(...a)
  listeners = (...a: EE<'listeners'>) => this.#ee.listeners(...a)
  off = (...a: EE<'off'>) => (this.#ee.off(...a), this)
  on = (...a: EE<'on'>) => (this.#ee.on(...a), this)
  once = (...a: EE<'once'>) => (this.#ee.once(...a), this)
  prependListener = (...a: EE<'prependListener'>) => (this.#ee.prependListener(...a), this)
  prependOnceListener = (...a: EE<'prependOnceListener'>) => (this.#ee.prependOnceListener(...a), this)
  removeAllListeners = (...a: EE<'removeAllListeners'>) => (this.#ee.removeAllListeners(...a), this)
  removeListener = (...a: EE<'removeListener'>) => (this.#ee.removeListener(...a), this)
  setMaxListeners = (...a: EE<'setMaxListeners'>) => (this.#ee.setMaxListeners(...a), this)
  rawListeners = (...a: EE<'rawListeners'>) => (this.#ee.rawListeners(...a), this)
}

export const proxy_events = (source: EventEmitter, dest: EventEmitter, ...events: string[]) => {
  const listeners = events.map(e => (...args) => dest.emit(e, ...args))
  events.forEach((e, i) => source.on(e, listeners[i]))
  return () => events.forEach((e, i) => source.off(e, listeners[i]))
}

import { useSelector as _useSelector, shallowEqual, useStore } from 'react-redux'

export function useSelector(selector = identity, comparator = shallowEqual) {
  return _useSelector(selector, comparator || refEqual)
}

/*
// Memoized cool useSelector, but its semantics does not allow for prop
// dependant selector logic
export function useSelector(selector = identity, comparator = shallowEqual) {
  const store = useStore()
  const [selected, setSelected] = useState(() => selector(store.getState()))
  useEffect(() => {
    return store.subscribe(() => setSelected(prevSelected => {
      const newSelected = selector(store.getState())
      const same = comparator
        ? comparator(prevSelected, newSelected)
        : prevSelected === newSelected
      if (!same) setSelected(newSelected)
    }))
  })
  return selected
}
*/

export const useLocalStorageState = (item, initalValue = null) => {
  const [value, _setValue] = useState(() => {
    let value = localStorage.getItem(item)
    if (value === null) {
      value = typeof initalValue === 'function' ? initalValue() : initalValue
      if (value !== null)
        localStorage.setItem(item, value)
    }
    return value === null ? null : String(value)
  })
  const setValue = useCallback(value => {
    if (value === null) {
      localStorage.removeItem(item)
      _setValue(null)
    }
    else {
      localStorage.setItem(item, value)
      _setValue(String(value))
    }
  }, [])
  return [value, setValue] as [any, typeof setValue]
}

export function useDispatch(_dispatchers = [], memo?): any {
  const store = useStore()
  const [dispatch, dispatchers] = useMemo(() => {
    const dispatch = (type, value) => store.dispatch({ type, value })
    return [dispatch, _dispatchers.map(d => d(dispatch))]
  }, memo && [store, ...memo])
  if (dispatchers.length)
    return [...dispatchers, dispatch]
  else
    return dispatch
}

export function useRedux(selector = identity, comparator = shallowEqual) {
  return [useSelector(selector, comparator), useDispatch()]
}

export const throttledTimeout = (func?: GenericFunction, ms?: number) => {
  let id = null
  return (_func?: GenericFunction, _ms?: number) => {
    clearTimeout(id)
    const local_id = setTimeout(
      _func || func,
      typeof _ms === 'number' ? _ms : ms
    )
    id = local_id
    return () => clearTimeout(local_id)
  }
}
export const throttledInterval = (func?: GenericFunction, ms?: number) => {
  let id = null
  return (_func?: GenericFunction, _ms?: number) => {
    clearInterval(id)
    const local_id = setInterval(
      _func || func,
      typeof _ms === 'number' ? _ms : ms
    )
    id = local_id
    return () => clearInterval(local_id)
  }
}