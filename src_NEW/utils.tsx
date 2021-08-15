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

export const unbitmap_k = (value, bitmap) => Object.fromEntries(
  Object.entries(bitmap).filter(v => value & +v[0])
)
export const unbitmap_v = (value, bitmap) => Object.fromEntries(
  Object.entries(bitmap).filter(v => value & +v[1])
)

export type GenericFunction = (...args) => any
export const call = <T extends GenericFunction>(fn: T) => fn() as ReturnType<T>
export const proxy_fn = <T extends GenericFunction>(fn: T) => ((...args) => fn(...args)) as T

import { EventEmitter } from 'events'

EventEmitter.captureRejections = true

interface TinyEmitter {
  on: (event: string, cb: (...args) => any) => any
  once: (event: string, cb: (...args) => any) => any
  off: (event: string, cb: (...args) => any) => any
  emit?: (event: string, ...args) => any
}

type Listener = (...args: any[]) => void

const subscribe_one = (emitter: TinyEmitter, event: string, func: Listener) => {
  emitter.on(event, func)
  return () => emitter.off(event, func)
}

export const subscribe = (
  emitter: TinyEmitter,
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

export const unsubs = () => {
  const unsubbers = []
  return (fn?: GenericFunction) => {
    if (fn) unsubbers.push(fn)
    else return () => unsubbers.forEach(call)
  }
}

export const promise_guts = <T extends any = any>() => {
  let guts = {} as any
  const promise = new Promise((resolve, reject) => guts = { resolve, reject })
  guts.promise = promise
  return guts as {
    resolve: (value?: T) => void
    reject: (reason?: any) => void
    promise: Promise<T>
  }
}

import CancelablePromise from 'cancelable-promise'

export const once = (
  emitter: TinyEmitter,
  event: string,
  check?: (...arg: any) => any,
  transform?: (...arg: any) => any,
) => {
  const simple = !check && !transform
  if (simple) {
    return new CancelablePromise<any>((resolve, reject, onCancel) => {
      emitter.once(event, resolve)
      onCancel(() => {
        emitter.off(event, resolve)
        reject()
      })
    })
  }
  else {
    return new CancelablePromise<any>((resolve, reject, onCancel) => {
      const listen = (...args) => {
        if (!check || check(...args)) {
          emitter.off('error', reject)
          resolve(transform ? transform(...args) : args[0])
        }
        else emitter.once(event, listen)
      }
      emitter.once(event, listen)
      emitter.once('error', reject)
      onCancel(() => {
        emitter.off(event, listen)
        emitter.off('error', reject)
      })
    })
  }
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
    const untilPromise = until()
    untilPromise.then(resolve).catch(reject)
    if (timeout !== Infinity) setTimeout(() => {
      if (untilPromise.cancel)
        untilPromise.cancel()
      reject()
    }, timeout)
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

export const proxy_events = (source: TinyEmitter, dest: TinyEmitter, ...events: string[]) => {
  const listeners = events.map(e => (...args) => dest.emit(e, ...args))
  events.forEach((e, i) => source.on(e, listeners[i]))
  return () => events.forEach((e, i) => source.off(e, listeners[i]))
}

import { useSelector as _useSelector, shallowEqual, useStore } from 'react-redux'

export function useSelector(selector = identity, comparator: typeof shallowEqual | false = shallowEqual) {
  return _useSelector(selector, comparator || refEqual)
}

/*
// Memoized cool useSelector, but its semantics do not allow for prop
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

export const useLocalStorageState = (item, initalValue = null, initialize = false) => {
  const [value, _setValue] = useState(() => {
    let value = localStorage.getItem(item)
    value = value ? JSON.parse(value) : undefined
    if (value === undefined) {
      value = typeof initalValue === 'function' ? initalValue() : initalValue
      if (initialize && value !== undefined)
        localStorage.setItem(item, JSON.stringify(value))
    }
    return value
  })
  const setValue = useCallback(value => {
    _setValue(prevValue => {
      if (typeof value === 'function') value = value(prevValue)
      if (value === undefined)
        localStorage.removeItem(item)
      else
        localStorage.setItem(item, JSON.stringify(value))
      return value
    })
  }, [])
  return [value, setValue] as [any, typeof setValue]
}

export const useToggle = ([value, set]) => {
  return [value, useCallback(() => set(v => !v), [])]
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

export const interval = (fn: GenericFunction, ms: number, immediate = false) => {
  if (immediate) fn()
  const id = setInterval(fn, ms)
  return () => clearInterval(id)
}

export const timeout = (fn: GenericFunction, ms: number) => {
  const id = setTimeout(fn, ms)
  return () => clearTimeout(id)
}

export const immediate = (fn: GenericFunction, ms: number) => {
  const id = setImmediate(fn, ms)
  return () => clearImmediate(id)
}

import uuid_v5 from 'uuid/v5'
export const spawnUuid = (
  namespace = 'e72bc52c-7700-11eb-9439-0242ac130002'
) => {
  const name = Date.now() + '-' + Math.random()
  return uuid_v5(name, namespace)
}