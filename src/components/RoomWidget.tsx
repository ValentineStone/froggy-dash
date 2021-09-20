import styled from 'styled-components'
import { useSelector, log, spawnUuid, useLocalStorageState, useToggle } from '../utils'
import ReadingsWidgetChart from './ReadingsWidgetChart'
import SinceSelector from './SinceSelector'
import ExportWidget from './ExportWidget'
import HardResetWidget from './HardResetWidget'
import { useState } from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Button from '@material-ui/core/Button'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import EditIcon from '@material-ui/icons/Edit'
import DeleteIcon from '@material-ui/icons/Delete'
import SaveIcon from '@material-ui/icons/Save'
import Collapse from '@material-ui/core/Collapse'

import FormLabel from '@material-ui/core/FormLabel'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import Checkbox from '@material-ui/core/Checkbox'
import ReadingsWidget from './ReadingsWidget'
import Typography from '@material-ui/core/Typography'
import AddIcon from '@material-ui/icons/Add'
import { database } from '../firebase'
import { store } from '../store'
import { useCallback } from 'react'
import { useMemo } from 'react'

const RoomViewItems = styled.div`& > * { margin-bottom: 1em; }`
const Header = styled(Typography).attrs<any>(() => ({
  gutterBottom: true,
  variant: 'h4'
}))`
  display: flex;
  align-items: center;
  cursor: pointer;
  & > *:first-child { flex: 1 }
`

const allSensorsSelector = store => {
  const allSensors = {}
  for (const multifrog in store.dbuser.multifrogs)
    for (const frog in store.dbuser.multifrogs[multifrog])
      for (const sensor in store.dbuser.multifrogs[multifrog][frog])
        if (store.sensors[sensor])
          allSensors[sensor] = (store.sensors[sensor].name || 'Sensor ' + sensor.slice(0, 7))
          + ' ('
          + (store.frogs[frog].name || 'Frog ' + frog.slice(0, 7))
          + ')'
  return allSensors
}

const RoomEditorWidget = ({ uuid, room }) => {
  const sensors = useSelector(allSensorsSelector)

  const toggleSensor = useCallback((event, value) => {
    const sensor = event.target.name
    database.ref(`/views/${uuid}/sensors/${sensor}`).set(value ? true : null)
  }, [uuid])
  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">Select sensors</FormLabel>
      <FormGroup>
        {Object.entries<any>(sensors).map(([uuid, name]) =>
          <FormControlLabel
            key={uuid}
            control={<Checkbox name={uuid} checked={!!room.sensors?.[uuid]} onChange={toggleSensor} />}
            label={name}
          />
        )}
      </FormGroup>
    </FormControl>
  )
}

const bigly = { fontSize: 'inherit' }

const RoomWidget = ({ uuid, room }) => {
  const [open, setOpen] = useLocalStorageState(`RoomWidget:open:${uuid}`, true)
  const toggleOpen = useCallback(() => setOpen(open => !open), [])
  const name = room.name || 'Room ' + uuid.slice(0, 7)
  const [editing, toggleEditing] = useToggle(useState(false))
  const rename = useCallback(event => database.ref(`/views/${uuid}/name`).set(event.target.value), [uuid])
  const onKeyDown = useCallback(event => event.key === 'Enter' && toggleEditing(), [])
  const onDetele = useCallback(() => {
    const uid = room.user
    if (confirm(`Are you sure you want to delete ${name} forver? All configuration will be lost`)) {
      database.ref(`/views/${uuid}`).set(null)
      database.ref(`/users/${uid}/views/${uuid}`).set(null)
    }
  }, [uuid])
  const sensors = useMemo(() => room.sensors || {}, [room.sensors])
  return (
    <Card key={uuid}>
      <CardContent>
        <Header>
          <div onClick={editing ? undefined : toggleOpen}>
            {editing ? <input value={room.name || ''} onChange={rename} onKeyDown={onKeyDown} /> : name}
          </div>
          <EditIcon onClick={toggleEditing} />
          {open
            ? <ExpandLess style={bigly} onClick={toggleOpen} />
            : <ExpandMore style={bigly} onClick={toggleOpen} />
          }
        </Header>
      </CardContent>
      {editing ? <>
        <CardContent>
          <RoomEditorWidget room={room} uuid={uuid} />
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={toggleEditing}
          >
            Save
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<DeleteIcon />}
            onClick={onDetele}
          >
            Delete this room
          </Button>
        </CardActions>
      </> : (
        <Collapse in={open} timeout="auto">
          <CardContent>
            <RoomViewItems>
              {Object.keys(sensors).length
                ? <ReadingsWidget sensors={sensors} />
                : <Typography color="secondary">
                  No sensors selected for this room
                </Typography>
              }
            </RoomViewItems>
          </CardContent>
        </Collapse>
      )}
    </Card>
  )
}

export default RoomWidget