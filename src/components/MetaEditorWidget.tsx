import { TextField } from '@material-ui/core'
import { Button } from '@material-ui/core'
import styled from 'styled-components'
import { useEffect, useRef, useState } from 'react'
import { database } from '../firebase'

const MetaEditorWidgetRoot = styled.div`
  & > * {
    margin: 1em !important;
  }
`

const AddReading = styled.div`
  display: inline-flex;
  flex-direction: column;
  border: 1px solid lightgray;
  padding: 1rem;
`

const format = str =>
  str.split('').map((letter, index) =>
    letter.toUpperCase() === letter
      ? (index ? ' ' : '') + letter.toLowerCase()
      : index ? letter : letter.toUpperCase()
  ).join('')


export default function MetaEditorWidget({ path }) {
  const [state, setState] = useState({})
  const readingsPath = path.replace('sensors', 'readings')
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
  const readingRef = useRef(null)
  const [addedReading, setAddedReading] = useState(null)
  const onAddReading = () => {
    if (!readingRef.current) return
    const time = String(Date.now())
    const value = Number(readingRef.current.value)
    database.ref(readingsPath).update({ [time]: value })
    setAddedReading(time)
  }
  const onPurge = () => {
    if (!readingRef.current) return
    const time1 = String(Date.now() - 1000)
    const time2 = String(Date.now())
    const value = Number(readingRef.current.value)
    database.ref(readingsPath).set({ [time1]: value, [time2]: value })
  }
  const onCancelReading = () => {
    if (!addedReading) return
    database.ref(readingsPath).update({ [addedReading]: null })
    setAddedReading(null)
  }
  return (
    <MetaEditorWidgetRoot>
      {Object.entries(state).map(([key, value]) =>
        <TextField
          key={key}
          //fullWidth
          margin="none"
          label={format(key)}
          value={value}
          onChange={onChange(key, typeof value)}
        />
      )}
      <br />
      <AddReading>
        <TextField
          margin="none"
          label="Reading value"
          defaultValue={12}
          inputRef={readingRef}
        />
        <Button color="primary" onClick={onAddReading}>Add reading</Button>
        {!!addedReading &&
          <Button color="primary" onClick={onCancelReading}>Cancel</Button>
        }
        <Button color="primary" onClick={onPurge}>Purge</Button>
      </AddReading>
    </MetaEditorWidgetRoot>
  )
}