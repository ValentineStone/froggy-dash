import styled from 'styled-components'
import { useSelector, log, spawnUuid } from '../utils'
import SinceSelector from './SinceSelector'
import ExportWidget from './ExportWidget'
import HardResetWidget from './HardResetWidget'
import { useState } from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Button from '@material-ui/core/Button'

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

import RoomWidget from './RoomWidget'

const RoomViewItems = styled.div`& > * { margin-bottom: 1em; }`

const spawnRoom = () => {
  const uid = store.getState().user.uid
  const roomUuid = spawnUuid()
  database.ref(`/views/${roomUuid}`).set({ type: 'room', user: uid })
  database.ref(`/users/${uid}/views/${roomUuid}`).set(true)
}

const viewsSelector = store => store.views
const RoomsWidget = () => {
  const views = useSelector(viewsSelector)
  return (
    <RoomViewItems>
      <div>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={spawnRoom}
        >
          Add room
        </Button>
      </div>
      {Object.entries<any>(views).map(([uuid, room]) =>
        <RoomWidget key={uuid} uuid={uuid} room={room} />
      )}
    </RoomViewItems>
  )
}

export default RoomsWidget