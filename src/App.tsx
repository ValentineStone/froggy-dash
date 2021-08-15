import { createGlobalStyle } from 'styled-components'

const CssReset = createGlobalStyle`
@import url(https://fonts.googleapis.com/css2?family=Roboto);

/* Box sizing rules */
* { box-sizing: border-box }

/* Remove default padding */
ul, ol { padding: 0 }

/* Remove default margin */
body, h1, h2, h3, h4, p, ul, ol, li, figure,
figcaption, blockquote, dl, dd, pre { margin: 0 }

/* Make body (and app) like in html 4 */
body, html, #app { height: 100% }

/* Make images easier to work with */
img { max-width: 100% }

/* Why does canvas even have focus?.. */
canvas:focus { outline: none }

/* Inherit fonts for inputs and buttons */
input, button, textarea, select { font: inherit }

/* Lighten up the default tabindex outline */
*:focus { outline-color: rgba(0,0,0,0.2) }

/* Remove animations and transitions for people who prefer not to see them */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
`

const CssGlobals = createGlobalStyle`

html {
  font-family: AvenirNextCyr-Regular;
}

.centers-text {
  text-align: center;
}

.centers-text::before {
  content: '';
  display: inline-block;
  height: 100%;
  vertical-align: middle;
}

.expands {
  width: 100%;
  height: 100%;
}

.relative {
  position: relative;
}

.block {
  display: block;
}

.gray { background: gray }
.darkgray { background: darkgray }
.lightgray { background: lightgray }
.pale { background: #fffe }

.slim-background {
  background: #f9f9f9;
}

.panel-slim {
  overflow-x: hidden;
  background: #f9f9f9;
}

.panel-wide {
  overflow: auto;
}

.plan-zoom-button {
  width: 38px;
  height: 38px;
  box-shadow: 0 5px 7px rgba(0,0,0,0.3);
  border-radius: 20px;
  border: none;
  background: white;
  margin: 10px;
  font-size: 24px;
  overflow: hidden;
  color: #BABABA;
}

.plan-zoom-controls {
  position: absolute;
  right: 0;
  top: 45%;
  margin-right: 50px;
}
`

import SplitView from './components/SplitView'
import AppMenuDrawer from './components/AppMenuDrawer'
import AuthShield from './components/AuthShield'
import { Graph } from './components/Graph'
import { Provider } from './store'
import styled from 'styled-components'
import { cx, interval, useLocalStorageState, useSelector, useToggle } from './utils'
import Overlay from './components/Overlay'
import Drawer from './components/Drawer'
import Dialog from './components/Dialog'
import { Fragment, useState } from 'react'
import { useEffect } from 'react'
import AppMenu from './components/AppMenu'
import { ReadingsWidget } from './components/Graph'
import StatusKeeper from './components/StatusKeeper'
import { useRef } from 'react'
import { MapInteractionCSS } from 'react-map-interaction'
import { ObjectInspector } from 'react-inspector'

export const name = (some, type, uuid) => some?.name || type + ' ' + uuid.slice(0, 7)

const SlimButtonRoot = styled.a`
  width: 105px;
  padding: 0 25.5px;
  margin: 20px 0;

  font-size: 22px;

  height: 93px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  
  color: inherit;
  text-decoration: inherit;

  border-right: 3px solid transparent;
  border-left: 3px solid transparent;

  filter: contrast(0%);

  & > img {
    margin-bottom: 10px;
  }

  &:hover {
    filter: contrast(10%) sepia(100%) saturate(180%) hue-rotate(90deg);
  }

  &.active, &:hover {
    border-right-color: black;
    filter: contrast(10%) sepia(100%) saturate(180%) hue-rotate(90deg);
  }

  &.black {
    filter: none;
  }

  &.black.active, &.black:hover {
    filter: none;
    border-right-color: transparent;
  }
`
const SlimButton = ({ label, icon, className = undefined, active = false, ...rest }) => (
  <SlimButtonRoot {...rest} className={cx({ active }, className)}>
    <img src={icon} className="block" />
    <div className="centers-text">{label}</div>
  </SlimButtonRoot>
)

const PanelSlim = styled.nav`
  display: flex;
  flex-direction: column;
  & > img {
    margin: 15px auto;
    display: block;
  }
  & > div {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  padding-bottom: 71px;
`

const viewSelector = store => store.selected.view
const SlimMenu = () => {
  const view = useSelector(viewSelector)
  return (
    <PanelSlim className="expands">
      <img src="assets/logo.png" />
      <div>
        <SlimButton icon="assets/plans.svg" label="Plan" href="#/plans" active={view === 'plans'} />
        <SlimButton icon="assets/frog.svg" label="Frogs" href="#/frogs" active={view === 'frogs'} />
        <SlimButton icon="assets/caution.svg" label="Errors" href="#/errors" active={view === 'errors'} />
        <SlimButton icon="assets/user.png" label="Account" href="#/account" active={view === 'account'} />
      </div>
    </PanelSlim>
  )
}


const PanelSlimLinks = styled.nav`
  display: flex;
  flex-direction: column;
  & > img {
    margin: 15px 25.5px;
    display: block;
    width: 30px;
  }
  & > div {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  padding-bottom: 60px;
`


const SlimLink = styled.a`
  font-size: 22px;
  position: relative;
  
  padding: 0 25.5px;
  
  color: inherit;
  text-decoration: inherit;

  border-right: 3px solid transparent;
  border-left: 3px solid transparent;

  &:hover {
    filter: contrast(20%) sepia(100%) saturate(180%) hue-rotate(90deg);
  }

  &.active, &:hover {
    border-right-color: black;
    filter: contrast(20%) sepia(100%) saturate(180%) hue-rotate(90deg);
  }
  margin-bottom: 0.5em;
`

const viewsSelector = store => store.views
const SlimSubmenuPlans = () => {
  const views = useSelector(viewsSelector)
  return (
    <div>
      <SlimButton icon="assets/plans.svg" label="Plan" className="black" />
      {Object.entries<any>(views).map(([uuid, view]) =>
        view.type === 'plan' ? <SlimLink key={uuid} href={'#/plans/' + uuid}>{view.name}</SlimLink> : null
      )}
    </div>
  )
}

const Smallify = styled.small`padding-left: 1em`

const multifrogsSelector = store => [store.multifrogs, store.frogs]
const SlimSubmenuFrogs = () => {
  const [multifrogs, frogs] = useSelector(multifrogsSelector)
  return (
    <div>
      <SlimButton icon="assets/frog.svg" label="Frogs" className="black" />
      {Object.entries<any>(multifrogs).map(([uuid, multifrog]) => <Fragment key={uuid}>
        <SlimLink href={'#/multifrogs/' + uuid}>{name(multifrog, 'Multifrog', uuid)}</SlimLink>
        {Object.keys(multifrog.frogs).map(uuid =>
          <SlimLink key={uuid} href={'#/frogs/' + uuid}><Smallify>{name(frogs[uuid], 'Frog', uuid)}</Smallify></SlimLink>
        )}
      </Fragment>)}
    </div>
  )
}

const extrasSelector = store => [
  store.extras,
  Object.fromEntries(Object.entries<any>(store.extras).map(([uuid, extra]) => [
    uuid,
    name(store[extra.type?.toLowerCase?.() + 's'][uuid], extra.type, uuid)
  ]))
]
const SlimSubmenuErrors = () => {
  const [extras, names] = useSelector(extrasSelector)
  return (
    <div>
      <SlimButton icon="assets/caution.svg" label="Errors" className="black" />
      {Object.entries<any>(extras).map(([uuid, extra]) =>
        typeof extra?.status === 'string' ? <SlimLink key={uuid}><b>{names[uuid]}:</b><br />{extra?.status}</SlimLink> : null
      )}
    </div>
  )
}

const subviewSelector = store => store.selected.subview
const SlimSubmenuDrawer = () => {
  const view = useSelector(viewSelector)
  const subview = useSelector(subviewSelector)
  const open = !subview && (view === 'account' || view === 'frogs' || view === 'errors' || view === 'plans')
  const hide = () => location.hash = '#'
  let Submenu: any = 'div'
  switch (view) {
    case 'account': Submenu = AppMenu; break
    case 'frogs': Submenu = SlimSubmenuFrogs; break
    case 'errors': Submenu = SlimSubmenuErrors; break
    case 'plans': Submenu = SlimSubmenuPlans; break
  }
  return (
    <Drawer size={274} left open={open} onClose={hide} backdropColor="transparent" classNameDrawer="panel-slim" >
      <PanelSlimLinks className="expands">
        <img src="assets/left-arrow.svg" onClick={hide} />
        <Submenu />
      </PanelSlimLinks>
    </Drawer>
  )
}

const DialogRoot = styled.div`
  max-width: 80vw;
  width: 1580px;
  height: 860px;
  border-radius: 20px;
  background: white;
  padding: 20px;
`

const DialogInner = styled.div`
  overflow: auto;
  height: 100%;
  position: relative;
`

const DialogClose = styled.button`
  &::before { content: '✕'; }
  float: right;
  width: 38px;
  height: 38px;
  border-radius: 20px;
  font-size: 24px;
  color: #BABABA;
  text-align: center;
  border: none;
  background: white;
`

const sensorsSelector = (uuid, type) => store => {
  if (type === 'frogs') return store.frogs[uuid]?.sensors || []
  let sensors = []
  for (const frog in store.dbuser.multifrogs[uuid])
    sensors.push(...Object.keys(store.dbuser.multifrogs[uuid][frog]))
  return sensors
}
const FrogsDialog = () => {
  const view = useSelector(viewSelector)
  const subview = useSelector(subviewSelector)
  const sensors = useSelector(sensorsSelector(subview, view))
  const open = (view === 'frogs' || view === 'multifrogs') && subview
  const hide = () => location.hash = '#'
  return (
    <Dialog open={open} onClose={hide} key={location.hash}>
      <DialogRoot>
        <DialogInner>
          <DialogClose onClick={hide} />
          <ReadingsWidget sensors={sensors} type={view} uuid={subview} />
        </DialogInner>
      </DialogRoot>
    </Dialog>
  )
}

const PlanRoot = styled.div`
  & > a {
    position: absolute;
  }
  & > img {
    max-width: none;
  }
  & > a > img {
    max-width: none;
    width: 50px;
  }
  position: relative;
`

const planSelector = current => store => Object.entries<any>(store.views).find(([uuid, view]) =>
  view.type === 'plan' && (
    store.selected.view === 'plans' && store.selected.subview
      ? store.selected.subview === uuid
      : !current[0] || uuid === current[0]
  )
)
const PlanView = () => {
  const [current, setCurrent] = useLocalStorageState('PlanView:current', [], true)
  const [uuid, plan] = useSelector(planSelector(current)) || []
  useEffect(() => {
    if (plan) setCurrent([uuid, plan])
  }, [uuid, plan])
  return (!!plan &&
    <MapInteractionCSS key={uuid} showControls btnClass="plan-zoom-button" controlsClass="plan-zoom-controls">
      <PlanRoot className="expands">
        <img src={plan.img} />
        {Object.entries<any>(plan.frogs).map(([uuid, { x, y }]) => <PlanFrogIcon key={uuid} uuid={uuid} x={x} y={y} />)}
      </PlanRoot>
    </MapInteractionCSS>
  )
}

const statusSelector = uuid => store => store.extras[uuid]?.status
const PlanFrogIcon = ({ x, y, uuid }) => {
  const status = useSelector(statusSelector(uuid))
  return (<a style={{ top: y, left: x }} href={'#/frogs/' + uuid} key={uuid}>
    <img src={typeof status === 'string' ? 'assets/frog-red.svg' : (status === undefined ? 'assets/frog.svg' : 'assets/frog-green.svg')} />
  </a>
  )
}

export default function App() {
  return (
    <Provider>
      <CssReset />
      <CssGlobals />
      <AuthShield>
        <StatusKeeper />
        <AppMenuDrawer />
        <SlimSubmenuDrawer />
        <SplitView left size={105} classNameRoot="expands" classNameWide="panel-wide" classNameSlim="panel-slim">
          <SlimMenu />
          <PlanView />
        </SplitView>
        <FrogsDialog />
      </AuthShield>
    </Provider>
  )
}