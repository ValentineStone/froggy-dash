import { createStore } from 'redux'
import { set as lodashSet, get as lodashGet } from 'lodash'

const selected_from_hash = () => {
  const hash = location.hash.split('/').slice(1)
  return {
    presentation: hash[0],
    multifrog: hash[1],
    frog: hash[2],
    sensor: hash[3],
    something: hash[0] || hash[1] || hash[2] || hash[3]
  }
}

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

  select() {
    return {
      selected: selected_from_hash()
    }
  }

  devmode(_, state) {
    if (state.devmode)
      localStorage.removeItem('store:devmode')
    else
      localStorage.setItem('store:devmode', 'true')
    return { devmode: !state.devmode }
  }

  appmenu([appmenu] = [], state) {
    if (typeof appmenu !== 'boolean')
      appmenu = !state.appmenu
    return { appmenu }
  }
}

const reducers = new Reducers()

const default_state = {
  appmenu: false,
  devmode: !!localStorage.getItem('store:devmode'),
  user: undefined,
  selected_actively: false,
  selected: selected_from_hash(),
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

window.addEventListener('hashchange', () => {
  store.dispatch({ type: 'select' })
})

window.addEventListener('keydown', event => {
  if (event.code === 'Backquote')
    store.dispatch({ type: 'devmode' })
}, true)