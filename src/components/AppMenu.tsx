import { useEffect, useState, useCallback, memo } from 'react'
import styled from 'styled-components'

const MenuRoot = styled.div`
  background: white;
  box-shadow: 0 0 8px #0000001e;
  padding-top: 2rem;
  overflow: hidden;
`

const MenuButton = styled.button`
  font-size: 20pt;
  padding: 0.5em;
  text-align: center;
  display: block;
  width: 100%;
  border: none;
  background: transparent;
  &:hover { background: #f4f4f4 }
`

const MenuText = styled.div<{ size?: number }>`
  font-size: ${({ size = 20 }) => size}pt;
  padding: 0.5em;
  text-align: center;
`

type UserIcon_props_t = { variant?: any }

let UserIcon: any = styled.img.attrs<UserIcon_props_t>(
  ({ variant }) => ({ src: `/assets/user-icons/${variant || Math.round(Math.random() * 19)}.png` })
) <UserIcon_props_t>`
  font-size: 20pt;
  display: block;
  margin: 0 auto 0.5em auto;
`
UserIcon = memo(UserIcon)

import { firebase, logoutAndReload } from '../firebase'
import { useSelector } from '../utils'

const selectUser = store => [store.user, store.dbuser, store.devmode]

function AppMenu() {
  const [user, dbuser, devmode] = useSelector(selectUser)
  console.log(dbuser)
  return (
    <MenuRoot className="expands">
      <UserIcon />
      <MenuText>{dbuser.name || user?.displayName}</MenuText>
      {devmode && <MenuText size={8}>{user?.uid}</MenuText>}
      <MenuButton onClick={logoutAndReload}>
        Log out
      </MenuButton>
    </MenuRoot>
  )
}

export default memo(AppMenu)