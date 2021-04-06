import styled from 'styled-components'
import { useCallback, useEffect, useState } from 'react'
import Drawer from './Drawer'

/*
import { FontAwesomeIcon as FontAwesomeIconBase } from '@fortawesome/react-fontawesome'
const FontAwesomeIcon = memo(FontAwesomeIconBase)
import { faBars } from '@fortawesome/free-solid-svg-icons'
*/
const MenuIcon = () => <h2><a href="#">Menu</a></h2>

const DrawerButton = styled.button`
  position: fixed;
  background: transparent;
  right: 1rem;
  top: 1rem;
  border: none;
  z-index: 13;
`

import AppMenu from './AppMenu'

export default function AppMenuDrawer() {
  const [open, setOpen] = useState(false)
  const toggleDrawer = useCallback(event => setOpen(s => !s), [])
  useEffect(() => {
    if (!open) return
    const handleKeydown = event => event.code === 'Escape' && setOpen(false)
    window.addEventListener("keydown", handleKeydown, true)
    return () => window.removeEventListener("keydown", handleKeydown)
  }, [open])
  return <>
    <DrawerButton onClick={toggleDrawer}>
      <MenuIcon />
    </DrawerButton>
    <Drawer left size={250} open={open} zIndex={14} onClose={toggleDrawer}>
      <AppMenu />
    </Drawer>
  </>
}