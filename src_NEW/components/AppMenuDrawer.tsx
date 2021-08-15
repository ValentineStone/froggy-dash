import { useEffect } from 'react'
import Drawer from './Drawer'

import AppMenu from './AppMenu'
import { useDispatch, useSelector } from '../utils'

const appmenuSelector = state => state.appmenu
export default function AppMenuDrawer() {
  const open = useSelector(appmenuSelector)
  const [toggle] = useDispatch([d => v => d('appmenu', [v])], [])
  useEffect(() => {
    const handleKeydown = event => event.code === 'Escape' && toggle(false)
    window.addEventListener("keydown", handleKeydown, true)
    return () => window.removeEventListener("keydown", handleKeydown)
  }, [])
  return (
    <Drawer left size={250} open={open} zIndex={14} onClose={toggle}>
      <AppMenu />
    </Drawer>
  )
}