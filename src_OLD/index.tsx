import "core-js/stable"
import "regenerator-runtime/runtime"

import './firebase'
import './firebase.store'

import ReactDOM from 'react-dom'
import App from './App'

if (!location.hash) location.hash = '#/froggy'

ReactDOM.render(<App />, document.querySelector('#app'))
