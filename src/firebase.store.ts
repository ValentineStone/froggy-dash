import { database, firebase } from './firebase'
import { store } from './store'
import { throttledTimeout, log } from './utils'

const online_timeout = 15000
const till_offline = online_at => online_timeout - since_online(online_at)
const since_online = online_at => Date.now() - online_at
const is_online = online_at => since_online(online_at) < online_timeout

const onDbValue = db_snap => {
  const db = db_snap.val()
  store.dispatch({ type: 'set', value: { db } })
}

let subscribed = false
firebase.auth().onAuthStateChanged(user => {
  user && user.getIdTokenResult().then(({ claims: { admin } }) => {
    if (admin && !subscribed) {
      subscribed = true
      const db_ref = database.ref(`/`)
      db_ref.on('value', onDbValue)
      window.addEventListener(
        'beforeunload',
        () => db_ref.off('value', onDbValue))
    }
  })
})
