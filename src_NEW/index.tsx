import "core-js/stable"
import "regenerator-runtime/runtime"

import './firebase'
import './firebase.store'

import ReactDOM from 'react-dom'
import App from './App'

ReactDOM.render(<App />, document.querySelector('#app'))
