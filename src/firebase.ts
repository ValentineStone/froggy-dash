// Firebase App (the core Firebase SDK) is always required and must be listed first
import _firebase from 'firebase/app'
export const firebase = _firebase
// If you are using v7 or any earlier version of the JS SDK, you should import firebase using namespace import
// import * as firebase from 'firebase/app'

// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import 'firebase/analytics'

// Add the Firebase products that you want to use
import 'firebase/auth'
import 'firebase/database'

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyCirEa4jJFaPCtneJjShV2V-xpKKIPDQYw",
  authDomain: "froggy-dash.firebaseapp.com",
  databaseURL: "https://froggy-db.europe-west1.firebasedatabase.app",
  projectId: "froggy-dash",
  storageBucket: "froggy-dash.appspot.com",
  messagingSenderId: "980323684617",
  appId: "1:980323684617:web:ed65c9dfdbc67cf70cc3d8",
  measurementId: "G-WNTE7H60WL"
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)
export const database = firebase.database()
export const auth = firebase.auth()

export const logout = () => auth.signOut()
export const logoutAndReload = () => auth.signOut()
  .then(() => location.reload())
  .catch(() => location.reload())

let loggedIn = false
const loginCallbacks = []
export const onLogin = (callback: (_auth: typeof auth) => any) => {
  if (loggedIn) callback(auth)
  else loginCallbacks.push(callback)
}
auth.onAuthStateChanged(user => {
  user && user.getIdTokenResult().then(({ claims: { admin } }) => {
    if (admin && !loggedIn) {
      loggedIn = true
      for (const callback of loginCallbacks)
        callback(auth)
    }
  })
})

export type Snap = _firebase.database.DataSnapshot
export type Ref = _firebase.database.Reference

import { once } from './utils'
export const get_value = async (path) => await once(database.ref(path), 'value')
  .then(v => v.val())