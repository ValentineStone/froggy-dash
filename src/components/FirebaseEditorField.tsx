
import EditIcon from '@material-ui/icons/Edit'
import SaveIcon from '@material-ui/icons/Save'
import { useToggle } from '../utils'
import { useState, useCallback } from 'react'
import { database } from '../firebase'
import styled from 'styled-components'

const Input = styled.input.attrs(({ value }) => ({ size: String(value).length }))``

const defaultRender = value => value
const preventDefault = event => event.preventDefault()

const FirebaseEditorField = ({ value, path, children = defaultRender }) => {
  const [editing, toggleEditing] = useToggle(useState(false))
  const onToggleClick = useCallback(event => { event.preventDefault(); toggleEditing() }, [])
  const onKeyDown = useCallback(event => event.key === 'Enter' && onToggleClick(event), [])
  const rename = useCallback(event => database.ref(path).set(event.target.value), [path])
  return editing ? <>
    <Input
      value={value || ''}
      onChange={rename}
      onKeyDown={onKeyDown}
      onClick={preventDefault}
      onDoubleClick={preventDefault}
    />
    <SaveIcon onClick={onToggleClick} />
  </> : children(<>
    <span>{value}</span>{' '}<EditIcon onClick={onToggleClick} />
  </>)
}

export default FirebaseEditorField