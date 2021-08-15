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
  padding: 1em 2em;
  overflow: auto;
}
`

import SplitView from './components/SplitView'
import AppMenuDrawer from './components/AppMenuDrawer'
import AuthShield from './components/AuthShield'
import Devmode from './components/Devmode'
import { Provider } from './store'
import styled from 'styled-components'
import { cx, useLocalStorageState, useSelector, useToggle } from './utils'
import Overlay from './components/Overlay'
import Drawer from './components/Drawer'
import { useState } from 'react'
import { useEffect } from 'react'
import AppMenu from './components/AppMenu'

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

  &.active {
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

  filter: contrast(0%);

  &:hover {
    filter: contrast(10%) sepia(100%) saturate(180%) hue-rotate(90deg);
  }

  &.active {
    border-right-color: black;
    filter: contrast(10%) sepia(100%) saturate(180%) hue-rotate(90deg);
  }
`

const subviewSelector = store => store.selected.subview
const SlimSubmenuPlans = () => {
  const subview = useSelector(subviewSelector)
  return (
    <div>
      <SlimButton icon="assets/plans.svg" label="Plan" className="black" />
      <SlimLink href="#/plans/plan1" className={cx({ active: subview === 'plan1' })}>Plan1</SlimLink>
      <SlimLink href="#/plans/plan2" className={cx({ active: subview === 'plan2' })}>Plan2</SlimLink>
    </div>
  )
}

const SlimSubmenuDrawer = () => {
  const view = useSelector(viewSelector)
  const subview = useSelector(subviewSelector)
  const open = !subview && (view === 'account' || view === 'frogs' || view === 'errors' || view === 'plans')
  const hide = () => location.hash = '#'
  let Submenu: any = 'div'
  switch (view) {
    case 'account': Submenu = AppMenu; break
    case 'frogs': Submenu = 'div'; break
    case 'errors': Submenu = 'div'; break
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

export default function App() {
  return (
    <Provider>
      <CssReset />
      <CssGlobals />
      <AuthShield>
        <AppMenuDrawer />
        <SlimSubmenuDrawer />
        <SplitView left size={105} classNameRoot="expands" classNameWide="panel-wide" classNameSlim="panel-slim">
          <SlimMenu />
          <main>
            <Devmode />
          </main>
        </SplitView>
      </AuthShield>
    </Provider>
  )
}