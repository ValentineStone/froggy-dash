import styled from 'styled-components'
import { useEffect, useRef, useState } from 'react'
import { database } from '../firebase'
import TextField from '@material-ui/core/TextField'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

const format = str =>
  str.split('').map((letter, index) =>
    letter.toUpperCase() === letter
      ? (index ? ' ' : '') + letter.toLowerCase()
      : index ? letter : letter.toUpperCase()
  ).join('')


export default function ValueEditorWidget({ path, name = undefined, multiline = false, initial = undefined }) {
  if (name === undefined)
    name = format(path.slice(path.lastIndexOf('/') + 1))
  const [value, setValue] = useState(initial)
  const [type, setType] = useState(typeof initial)
  useEffect(() => {
    const ref = database.ref(path)
    const onValue = v => {
      const value = v.val() === null ? '' : v.val()
      setValue(value)
      setType(typeof value)
    }
    ref.on('value', onValue)
    return () => ref.off('value', onValue)
  }, [path])
  const onChange = event => {
    let value = event.target.value
    if (type === 'number')
      value = +value
    else if (type === 'boolean')
      value = String(value).startsWith('t') ? true : false
    database.ref(path).set(value)
  }
  return value !== undefined && (
    <Card>
      <CardContent>
        <TextField
          multiline={multiline}
          fullWidth={multiline}
          margin="none"
          label={name}
          value={value}
          onChange={onChange}
        />
      </CardContent>
    </Card>
  )
}