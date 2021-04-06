import { createGlobalStyle } from 'styled-components'

const CssReset = createGlobalStyle`
@import url(https://fonts.googleapis.com/css2?family=Roboto);

/* Box sizing rules */
* { box-sizing: border-box }

/* Remove default padding */
ul, ol { padding: 0 }

/* Remove default margin */
body, h1, h2, h3, h4, p, ul, ol, li, figure,
figcaption, blockquote, dl, dd { margin: 0 }

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
  font-family: 'Roboto', sans-serif;
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

.gray { background: gray }
.darkgray { background: darkgray }
.lightgray { background: lightgray }
.pale { background: #fffe }

.right-panel {
  box-shadow: 0 0 8px #0000001e;
  overflow-x: hidden;
}

.app-view-root > * {
  padding: 1em;
  overflow: auto;
}
`

import SplitView from './components/SplitView'
import AppMenuDrawer from './components/AppMenuDrawer'
import AuthShield from './components/AuthShield'
import { Provider } from './store'

import Overlayify from './components/Overlayify'
import { PresentationView } from './components/PresentationView'
import { DevicesListView } from './components/DevicesListView'

export default function App() {
  return (
    <Provider>
      <CssReset />
      <CssGlobals />
      <AuthShield>
        <AppMenuDrawer />
        <SplitView left size={350} classNameRoot="expands app-view-root" classNameSlim="right-panel">
          <DevicesListView />
          <PresentationView />
        </SplitView>
      </AuthShield>
    </Provider>
  )
}