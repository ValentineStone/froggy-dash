import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import { useEffect, useState, useCallback } from 'react'
import styled from 'styled-components'
import { memo, useRef } from 'react'

import { auth, firebase, logout } from '../firebase'
import { useDispatch } from '../utils'

const ShiedRoot = styled.div`
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
`

const ShiedInner = styled.div`
  text-align: center;
  position: relative;
  & > *:last-child {
    position: absolute;
    width: max-content;
    transform: translate(-50%);
    display: inline-block;
  }
  & > *:last-child > .mdl-card {
    margin-top: 0.5rem;
  }
`

const ShiedLogo = styled.img.attrs(
  () => ({ src: '/favicon.png' })
)`
  display: block;
  padding-bottom: 1rem;
`

const uiConfig = {
  signInFlow: 'popup',
  callbacks: {
    signInSuccessWithAuthResult: () => false,
  },
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ],
}

function AuthShield({ children }) {
  const [user, setUser] = useState(auth.currentUser || undefined)
  const [admin, setAdmin] = useState(false)
  const dispatch = useDispatch()
  useEffect(() => auth.onAuthStateChanged(user => {
    if (user) {
      user.getIdTokenResult().then(({ claims }) => {
        user.getIdTokenResult(true).then(fresh => {
          setUser(user)
          if (fresh.claims.admin !== claims.admin)
            logout()
          if (fresh.claims.admin) {
            dispatch('set', ['user', user])
            setAdmin(claims.admin)
          }
        })
      })
    } else setUser(null)
  }), [])
  return admin ? children : (
    <ShiedRoot>
      <ShiedInner>
        <ShiedLogo />
        {user === undefined ? null : (
          user ? (
            <div>
              This user has no access <a href="#" onClick={logout}>Logout</a>
              <br />
              <br />Request access for uid
              <br />{user.uid}
            </div>
          ) : (
            <StyledFirebaseAuth
              uiConfig={uiConfig}
              firebaseAuth={firebase.auth()}
            />
          )
        )}
      </ShiedInner>
    </ShiedRoot>
  )
}

export default memo(AuthShield)