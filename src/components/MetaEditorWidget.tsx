import { TextField } from '@material-ui/core'
import styled from 'styled-components'
import { useEffect, useRef, useState } from 'react'
import { database } from '../firebase'

const MetaEditorWidgetRoot = styled.div`
  & > * {
    margin: 1em !important;
  }
`
const format = str =>
  str.split('').map((letter, index) =>
    letter.toUpperCase() === letter
      ? (index ? ' ' : '') + letter.toLowerCase()
      : index ? letter : letter.toUpperCase()
  ).join('')

export default function MetaEditorWidget({ path }) {
  const [state, setState] = useState({})
  useEffect(() => {
    const metaRef = database.ref(path + '/meta')
    const onValue = s => setState(s.val())
    metaRef.on('value', onValue)
    return () => metaRef.off('value', onValue)
  }, [path])
  const onChange = (key, type) => event => {
    let value = event.target.value
    if (type === 'number')
      value = +value
    else if (type === 'boolean')
      value = String(value).startsWith('t') ? true : false
    database.ref(path + '/meta').update({ [key]: value })
  }
  return <MetaEditorWidgetRoot>
    {Object.entries(state).map(([key, value]) =>
      <TextField
        key={key}
        margin="none"
        label={format(key)}
        value={value}
        onChange={onChange(key, typeof value)}
      />
    )}
  </MetaEditorWidgetRoot>
}