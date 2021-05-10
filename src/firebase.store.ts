import type EventEmitter from 'events'
import { database, firebase } from './firebase'
import { store } from './store'
import { throttledTimeout, log, once, unsubs, subscribe, effect } from './utils'

const online_timeout = 15000
const till_offline = online_at => online_timeout - since_online(online_at)
const since_online = online_at => Date.now() - online_at
const is_online = online_at => since_online(online_at) < online_timeout

const attachModel = (type, uuid, children?, ...restChildren) => {
  const childTypes = children ? children.split(',') : []
  const modelRef = database.ref('/' + type + '/' + uuid)
  const unsub = unsubs()
  const onModel = modelSnap => {
    const modelVal = modelSnap.val()
    if (modelVal) {
      store.dispatch({
        type: 'set',
        value: [type, state => ({ ...state, [uuid]: modelVal })]
      })
      for (const typeStr of childTypes) {
        const typePair = typeStr.split(':')
        const type = typePair[0]
        const idType = typePair[1] || type
        for (const uuid in modelVal[idType]) {
          unsub(attachModel(type, uuid, ...restChildren))
        }
      }
    } else {
      modelRef.off('value', onModel)
    }
  }
  modelRef.on('value', onModel)
  unsub(() => modelRef.off('value', onModel))
  return unsub()
}

let subscribed = false
firebase.auth().onAuthStateChanged(user => {
  user && user.getIdTokenResult().then(({ claims: { admin } }) => {
    if (admin && !subscribed) {
      subscribed = true
      attachModel('users', user.uid, 'multifrogs', 'frogs', 'sensors,readings:sensors')
      /*
      const db_ref = database.ref(`/`)
      db_ref.on('value', onDbValue)
      window.addEventListener(
        'beforeunload',
        () => db_ref.off('value', onDbValue))
      */
    }
  })
})
