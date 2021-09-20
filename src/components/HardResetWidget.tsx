import styles from 'styled-components'
import { useSelector, log, once } from '../utils'
import SinceSelector from './SinceSelector'
import { store } from '../store'
import { useState } from 'react'
import Button from '@material-ui/core/Button'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import Collapse from '@material-ui/core/Collapse'

import CardBase from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Typography from '@material-ui/core/Typography'
import DeleteIcon from '@material-ui/icons/Delete'
import styled from 'styled-components'
import { useCallback } from 'react'
import { database } from '../firebase'

const Card = styled(CardBase)`width: max-content`
const Header = styled.div`
  display: flex;
  align-items: center;
  & > *:first-child { margin-right: 0.3em }
  & > *:nth-child(2) { flex: 1 }
`

const hardReset = uuids => {
  if (window.confirm(`This action will delete all data for (${uuids.length}) sensors, are you sure about this?`))
    for (const uuid of uuids)
      database.ref('/readings/' + uuid).set(null)
}

const HardResetWidget = ({ sensors = [] }) => {
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen(open => !open), [])
  const deleteAll = useCallback(() => hardReset(sensors), [sensors])
  return (
    <Card>
      <CardContent onClick={toggle}>
        <Header>
          <DeleteIcon />
          <Typography variant="h6">
            Hard reset
          </Typography>
          {open ? <ExpandLess /> : <ExpandMore />}
        </Header>
      </CardContent>
      <Collapse in={open} timeout="auto">
        <CardContent>
          Warning!<br />
          This action will delete all data<br />
          for ({sensors.length}) sensors
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<DeleteIcon />}
            onClick={deleteAll}
          >
            Delete all data
          </Button>
        </CardActions>
      </Collapse>
    </Card>
  )
}

export default HardResetWidget