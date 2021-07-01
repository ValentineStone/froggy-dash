import { database, firebase, onLogin, get_value, Ref } from './firebase'
import { store } from './store'
import { once, subscribe, unsubs } from './utils'

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
    value: [type, state => ({ ...state, [uuid]: v.val() })]
  })
)

onLogin(async auth => {
  const unsub = unsubs()
  const uid = auth.currentUser.uid
  const multifrogs = await get_value(`/users/${uid}/multifrogs`)
  for (const multifrog in multifrogs) {
    unsub(attach('multifrogs', multifrog))
    const frogs = multifrogs[multifrog]
    for (const frog in frogs) {
      unsub(attach('frogs', frog))
      const sensors = frogs[frog]
      for (const sensor in sensors) {
        unsub(attach('sensors', sensor))
        unsub(attach('readings', sensor, d => d.limitToLast(30)))
      }
    }
  }
})
