import { TextField } from '@material-ui/core'
import { Button } from '@material-ui/core'
import styled from 'styled-components'
import { useRef, useState } from 'react'
import { database } from '../firebase'

const AddReading = styled.div`
  display: inline-flex;
  flex-direction: column;
  border: 1px solid lightgray;
  padding: 1rem;
`

const devmodeSelector = store => store.devmode
export default function ReadingsEditorWidget({ uuid }) {
  const readingsPath = '/readings/' + uuid
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
  )
}