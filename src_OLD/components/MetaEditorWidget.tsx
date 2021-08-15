import { TextField } from '@material-ui/core'
import styled from 'styled-components'
import { useEffect, useRef, useState } from 'react'
import { database } from '../firebase'

import Card from '@material-ui/core/Card'
import CardContentBase from '@material-ui/core/CardContent'

const CardContent = styled(CardContentBase)`
  & > * {
    margin-right: 1em !important;
    margin-bottom: 1em !important;
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
  const [name, setName] = useState('')
  useEffect(() => {
    const metaRef = database.ref(path + '/meta')
    const onValue = s => setState(s.val() || {})
    metaRef.on('value', onValue)
    return () => metaRef.off('value', onValue)
  }, [path])
  useEffect(() => {
    const nameRef = database.ref(path + '/name')
    const onName = s => setName(s.val() || '')
    nameRef.on('value', onName)
    return () => nameRef.off('value', onName)
  }, [path])
  const onChange = (key, type) => event => {
    let value = event.target.value
    if (key === 'name') {
      database.ref(path + '/name').set(value)
      return
    }
    if (type === 'number')
      value = +value
    else if (type === 'boolean')
      value = String(value).startsWith('t') ? true : false
    database.ref(path + '/meta').update({ [key]: value })
  }
  return <Card>
    <CardContent>
      <TextField
        margin="none"
        label="Name"
        value={name}
        onChange={onChange('name', 'string')}
      />
      {Object.entries(state).map(([key, value]) =>
        <TextField
          key={key}
          margin="none"
          label={format(key)}
          value={value}
          onChange={onChange(key, typeof value)}
        />
      )}
    </CardContent>
  </Card>
}