import { createStore } from 'redux'
import { set as lodashSet, get as lodashGet } from 'lodash'

class Reducers {
  set(setter, state) {
    if (typeof setter === 'object') {
      if (Array.isArray(setter)) {
        const [path, value] = setter
        if (typeof value === 'function')
          return lodashSet(state, path, value(lodashGet(state, path)))
        else
          return lodashSet(state, path, value)
      }
      else {
        for (const path in setter) {
          const value = setter[path]
          if (typeof value === 'function')
            lodashSet(state, path, value(lodashGet(state, path)))
          else
            lodashSet(state, path, value)
        }
        return state
      }
    }
    else if (typeof setter === 'function') {
      return setter(state)
    }
  }

  @selectDebounce(1)
  select(uuid, state) {
    if (uuid === state.selected)
      uuid = null
    return {
      selected: uuid,
      selected_drone: state.drones_map[uuid]
    }
  }

  refresh_online_status([uuid, is_online], state) {
    const drones_map = state.drones_map
    const drone = drones_map[uuid]
    const online = is_online(drone)
    return (drone.online === online) ? state : {
      drones_map: {
        ...drones_map,
        [uuid]: { ...drone, online }
      }
    }
  }
}

const reducers = new Reducers()

const default_state = {
  user: undefined,
  selected_actively: false,
  selected: null,
  users: {},
  multifrogs: {},
  frogs: {},
  sensors: {},
  readings: {},
}

function rootReducer(state = default_state, action) {
  if (reducers[action.type]) {
    const transform = reducers[action.type](action.value, state, action)
    return { ...state, ...transform }
  } else return state
}

export const store = createStore(rootReducer)

import { Provider as Provider_ } from 'react-redux'

export const Provider = props => <Provider_ store={store} {...props} />

function selectDebounce(wait = 1): any {
  return function (target, name, descriptor) {
    const select = descriptor.value
    let timeoutId = undefined
    let prevSelected = undefined
    let currSelected = undefined
    const onTimeout = () => {
      currSelected = prevSelected
      timeoutId = undefined
      prevSelected = undefined
      store.dispatch({ // notify redux as this is happening in a timeout
        type: 'set',
        value: store => select(currSelected, store)
      })
    }
    descriptor.value = (selected, store) => {
      if (prevSelected !== undefined) {
        currSelected = prevSelected || selected
        clearTimeout(timeoutId)
        timeoutId = undefined
        prevSelected = undefined
        return select(currSelected, store)
      }
      else {
        prevSelected = selected
        timeoutId = setTimeout(onTimeout, wait)
      }
    }
    return descriptor
  }
}