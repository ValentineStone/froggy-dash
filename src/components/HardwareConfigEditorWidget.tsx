import { useState, useEffect, Fragment } from 'react'
import { database } from '../firebase'
import { log } from '../utils'
import TextField from '@material-ui/core/TextField'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import SettingsIcon from '@material-ui/icons/Settings'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import Collapse from '@material-ui/core/Collapse'
import Button from '@material-ui/core/Button'
import CardActions from '@material-ui/core/CardActions'
import SaveIcon from '@material-ui/icons/Save'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { useCallback } from 'react'

const Header = styled.div`
  display: flex;
  align-items: center;
  & > *:first-child { margin-right: 0.3em }
  & > *:nth-child(2) { flex: 1 }
`
const CardSlim = styled(Card)`width: max-content`
const FrogConfig = styled.div`& > * { margin-bottom: 1em }`

export const configGet = (config, frogUuid, arg2, arg3?) => {
  const frog = config.find(v => v.uuid === frogUuid)
  if (arg3) {
    const sensor = frog.sensors.find(v => v.uuid === arg2)
    return sensor[arg3]
  } else {
    return frog[arg2]
  }
}

export const parse = str => {
  if (!str) return []
  const frogStrs = str.split(';')
  const frogs = []
  for (const frogStr of frogStrs) {
    const [frogUuid, frogNumber, ...sensorStrs] = frogStr.split(':')
    const frog = {
      uuid: frogUuid,
      number: frogNumber,
      sensors: []
    }
    frogs.push(frog)
    for (let i = 0; i < sensorStrs.length; i += 3) {
      frog.sensors.push({
        uuid: sensorStrs[i],
        port: sensorStrs[i + 1],
        period: sensorStrs[i + 2]
      })
    }
  }
  return frogs
}

export const pack = parsed => parsed.map(({ uuid, number, sensors }) =>
  [uuid, number, ...sensors.map(({ uuid, port, period }) =>
    `${uuid}:${port}:${period}`
  )].join(':')
).join(';')

const selector = store => [store.frogs, store.sensors]

const HardwareConfigEditorWidget = ({ uid = undefined, uuid }) => {
  const [frogs, dbsensors] = useSelector(selector)
  const [raw, setRaw] = useState('')
  const [parsed, setParsed] = useState([])
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen(open => !open), [])
  useEffect(() => {
    const ref = database.ref(`/multifrogs/${uuid}/hardware`)
    const onValue = v => {
      const raw = v.val() || ''
      const parsed = parse(raw)
      const packed = pack(parsed)
      setRaw(raw)
      setParsed(parsed)
    }
    ref.on('value', onValue)
    return () => ref.off('value', onValue)
  }, [uuid])
  const onChange = (...args) => event => {
    let intValue = parseInt(event.target.value)
    if (isNaN(intValue)) return
    let location = parsed
    const path = [...args]
    const last = path.pop()
    for (const step of path)
      location = location?.[step]
    if (location[last] !== undefined) {
      if (last === 'port' || last === 'number')
        intValue = Math.max(Math.min(intValue, 255), 0)
      else if (last === 'period')
        intValue = Math.abs(intValue)
      location[last] = String(intValue)
      setParsed([...parsed])
    }
  }
  const onSave = useCallback(() => {
    database.ref(`/multifrogs/${uuid}/hardware`).set(pack(parsed))
  }, [parsed])
  return (
    <CardSlim>
      <CardContent onClick={toggle}>
        <Header>
          <SettingsIcon />
          <Typography variant="h6">Configure hardware</Typography>
          {open ? <ExpandLess /> : <ExpandMore />}
        </Header>
      </CardContent>
      <Collapse in={open} timeout="auto">
        <CardContent>
          {parsed.map(({ uuid, number, sensors }, frogIndex) =>
            <FrogConfig key={uuid}>
              <div>
                <Typography color="primary" variant="h6">
                  {frogs[uuid]?.name || 'Frog ' + uuid.slice(4)}
                </Typography>
                <TextField
                  margin="none"
                  label="Hardware ID number"
                  value={number}
                  onChange={onChange(frogIndex, 'number')}
                />
              </div>
              {sensors.map(({ uuid, port, period }, sensorIndex) =>
                <div key={uuid}>
                  <Typography color="primary">
                    {dbsensors[uuid]?.name || 'Sensor ' + uuid.slice(0, 7)}
                  </Typography>
                  <TextField
                    margin="none"
                    label="Port number"
                    value={port}
                    onChange={onChange(frogIndex, 'sensors', sensorIndex, 'port')}
                  />
                  <TextField
                    margin="none"
                    label="Period (ms)"
                    value={period}
                    onChange={onChange(frogIndex, 'sensors', sensorIndex, 'period')}
                  />
                </div>
              )}
            </FrogConfig>
          )}
        </CardContent>
        <CardActions>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={onSave}
          >
            Save
          </Button>
        </CardActions>
      </Collapse>
    </CardSlim>
  )
}

export default HardwareConfigEditorWidget