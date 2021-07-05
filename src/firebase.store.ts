import { database, firebase, onLogin, Ref } from './firebase'
import { store } from './store'
import { once, subscribe, unsubs } from './utils'
import { parse as parseConfig } from './components/HardwareConfigEditorWidget'

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

const attach = (type, uuid, transform = (v: Ref) => v as any) => subscribe(
  transform(database.ref(`/${type}/${uuid}`)),
  'value',
  v => store.dispatch({
    type: 'set',
    value: [type, ({ ...state }) => {
      if (v.val() === null)
        delete state[uuid]
      else
        state[uuid] = v.val()
      return state
    }]
  })
)

const attachUser = (uid, callback) => {
  let uncallback
  const unsub = subscribe(
    database.ref(`/users/${uid}`), 'value', v => {
      const dbuser = v.val()
      store.dispatch({
        type: 'set',
        value: ['dbuser', v.val()]
      })
      uncallback?.()
      uncallback = callback(dbuser)
    }
  )
  return () => {
    uncallback?.()
    unsub()
  }
}

const attachRaw = (type, path, uuid, transform) => subscribe(
  database.ref(path + '/' + uuid),
  'value',
  v => store.dispatch({
    type: 'set',
    value: [type, state => ({ ...state, [uuid]: transform(v.val()) })]
  })
)

onLogin(async auth => {
  const uid = auth.currentUser.uid
  return attachUser(uid, ({ multifrogs, views }) => {
    const unsub = unsubs()
    for (const view in views)
      unsub(attach('views', view))
    for (const multifrog in multifrogs) {
      unsub(attach('multifrogs', multifrog))
      unsub(attachRaw('hardware', `/users/${uid}/hardware`, multifrog, parseConfig))
      const frogs = multifrogs[multifrog]
      for (const frog in frogs) {
        unsub(attach('frogs', frog))
        const sensors = frogs[frog]
        for (const sensor in sensors) {
          unsub(attach('sensors', sensor))
          //unsub(attach('readings', sensor, d => d.limitToLast(30)))
        }
      }
    }
    return unsub()
  })
})
