import { cx, log, useSelector, useToggle } from '../utils'
import { ObjectInspector } from 'react-inspector'
import { Fragment, memo, useEffect, useState } from 'react'
import { database } from '../firebase'
import SinceSelector from './SinceSelector'
import styled from 'styled-components'
import { Scatter } from 'react-chartjs-2'
import { useMemo } from 'react'
import SplitView from './SplitView'
import FirebaseEditorField from './FirebaseEditorField'
import SettingsIcon from '@material-ui/icons/Settings'
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined'

export const name = (some, type, uuid) => some?.name || type + ' ' + uuid.slice(0, 7)

const storeSelector = store => store

export default function Devmode() {
  const store = useSelector(storeSelector)
  return <>
    <ObjectInspector expandLevel={1} data={store} />
    {Object.entries(store.sensors).map(([uuid, sensor]) =>
      <Graph uuid={uuid} sensor={sensor} key={uuid} />
    )}
  </>
}

const underminColor = '#6A5ACD'
const overmaxColor = '#fe0909'

const Box = styled.div`
  border: 1px solid black;
  padding: 0.5em;
  margin: 0.5em auto;

  &.undermin {
    border-color: ${underminColor};
    color: ${underminColor};
  }

  &.overmax {
    border-color: ${overmaxColor};
    color: ${overmaxColor};
  }
`

const configSelector = multifrog => store => store.hardware[multifrog]
export const Graph = memo<any>(({ uuid, sensor, since, extra }) => {
  const [readings, setReadings] = useState({})
  const [updated, setUpdated] = useState(Date.now())
  useEffect(() => {
    if (since === undefined) return
    const ref = database.ref('/readings/' + uuid).orderByKey().startAt(since)
    const onValue = v => {
      const readings = v.val() || {}
      setReadings(readings)
      setUpdated(Date.now())
    }
    ref.on('value', onValue)
    return () => ref.off('value', onValue)
  }, [uuid, since])
  const multi_config = useSelector(configSelector(sensor.multifrog))
  const {
    lowerThreshold: lowerThresholdInitial,
    upperThreshold: upperThresholdInitial,
    valueSeriesName
  } = sensor.meta
  const [lowerThreshold, setLowerThreshold] = useState(lowerThresholdInitial)
  const [upperThreshold, setUpperThreshold] = useState(upperThresholdInitial)
  const values = Object.values(readings)
  const overmax = values.length && values[values.length - 1] >= upperThresholdInitial
  const undermin = values.length && values[values.length - 1] <= lowerThresholdInitial
  const data = Object.entries(readings).map(([x, y]) => ({ x: +x, y }))
  const [miniSettings, toggleMiniSettings] = useToggle(useState(false))
  return <Box className={cx({ overmax, undermin })}>
    <GraphHeader>
      <FirebaseEditorField value={name(sensor, 'Sensor', uuid)} path={`/sensors/${uuid}/name`} />
      {miniSettings ? <SettingsIcon onClick={toggleMiniSettings} /> : <SettingsOutlinedIcon onClick={toggleMiniSettings} />}
    </GraphHeader>
    {extra?.lastReading !== undefined &&
      <GraphFooter>
        Last: {extra.lastReading} at {formatDate(extra.lastReadingAt)}
      </GraphFooter>
    }
    {!!values.length
      ? <Scatter data={{
        datasets: [{
          label: valueSeriesName,
          data
        }],
      }} options={{
        animation: false,
        aspectRatio: 4 / 3,
        plugins: {
          legend: { display: false },
          tooltip: {
            displayColors: false,
            callbacks: {
              label: ({ raw: { x, y } }) => formatDate(x) + ': ' + y
            }
          }
        },
        datasets: {
          scatter: {
            showLine: true,

            fill: false,
            lineTension: 0,

            pointRadius: 0,
            pointHoverRadius: 0,
            pointHoverBorderWidth: 0,
            pointBorderWidth: 0,
            pointHitRadius: 10,

            borderColor: undermin ? underminColor : (overmax ? overmaxColor : 'black'),
            borderWidth: 1,
          },
        },
        scales: {
          y: {
            min: lowerThreshold,
            max: upperThreshold,
            title: {
              display: true,
              text: valueSeriesName,
            }
          },
          x: {
            ticks: {
              callback: formatDate
            },
            title: {
              display: true,
              text: 'Time',
            }
          },
        },
      }} />
      : <GraphFooter>
        No readings for selected time
      </GraphFooter>
    }
    {!!values.length && <>
      <GraphFooter>
        <TextField
          margin="none"
          type="number"
          label="Min"
          value={lowerThreshold}
          onChange={e => setLowerThreshold(Math.round(+e.target.value))}
        />
        <TextField
          margin="none"
          type="number"
          label="Max"
          value={upperThreshold}
          onChange={e => setUpperThreshold(Math.round(+e.target.value))}
        />
      </GraphFooter>
      <GraphFooter>
        <ExportWidgetMini sensors={[uuid]} since={since}></ExportWidgetMini>
      </GraphFooter>
    </>}
    {miniSettings && <GraphFooter>
      <MetaEditorWidget path={`/sensors/${uuid}`} />
    </GraphFooter>
    }
  </Box>
})

const formatDate = v => {
  const date = new Date(+v)
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }) + '  ' + date.toLocaleDateString('ru-RU', {
    month: 'numeric',
    day: 'numeric',
  })
}

export const configGet = (config, frogUuid, arg2, arg3?) => {
  const frog = config.find(v => v.uuid === frogUuid)
  if (arg3) {
    const sensor = frog.sensors.find(v => v.uuid === arg2)
    if (arg3 === true)
      return sensor
    else
      return sensor[arg3]
  } else {
    return frog[arg2]
  }
}

import styles from 'styled-components'
import ReadingsWidgetChart from './Graph'
import { ExportWidgetMini } from './ExportWidget'
import ExportWidget from './ExportWidget'
import HardResetWidget from './HardResetWidget'
import { useCallback } from 'react'
import MetaEditorWidget from './MetaEditorWidget'
import HardwareConfigEditorWidget from './HardwareConfigEditorWidget'
import { Button, TextField, Typography } from '@material-ui/core'

const Flex = styles.div`
  display: flex;
  flex-flow: row wrap;
  & > * {
    padding-right: 1em;
    padding-bottom: 1em;
    width: 100%;
  }
  @media only screen and (min-width: 800px) {
    & > * {
      width: 100%;
    }
  }
  @media only screen and (min-width: 1200px) {
    & > * {
      width: 50%;
    }
  }
`

const RootFlex = styles.div`
  margin-top: 1em;
  display: flex;
  & > :nth-child(1) {
    display: flex;
    flex-direction: column;
    min-width: 60px;
    max-width: 60px;
    padding: 15px;
    padding-top: 100px;
    & > * {
      margin-bottom: 15px;
    }
  }
  & > :nth-child(2) {
    flex-grow: 1;
  }
`

const GraphHeader = styled.div`
  display: flex;
  font-size: 22px;
  & > :nth-child(1) {
    flex-grow: 1;
  }
`

const GraphFooter = styled.div`
  margin-bottom: 0.5em;
  display: flex;
`

const Form = styled.div`
  padding: 0 15px;
  & > * {
    width: 100%;
    margin-bottom: 0.5em;
  }  
`

const Iconlist = styled.div`
  & > * {
    cursor: pointer;
  }  
`

const sensorSelector = store => [store.sensors, store.extras]
export const ReadingsWidget = ({ sensors = null, sensor = null, type = undefined, uuid = undefined }) => {
  const [allSensors, extras] = useSelector(sensorSelector)
  const [since, setSince] = useState(String(Date.now()))
  const picked = sensors
    ? (Array.isArray(sensors)
      ? sensors
      : Object.keys(sensors))
    : (sensor
      ? [sensor]
      : Object.keys(allSensors))

  const [mode, setMode] = useState('graph')
  const toggleGraph = useCallback(() => setMode('graph'), [])
  const toggleExport = useCallback(() => setMode(v => v === 'export' ? 'graph' : 'export'), [])
  const toggleSettings = useCallback(() => setMode(v => v === 'settings' ? 'graph' : 'settings'), [])
  return (
    <>
      <SinceSelector onSelected={setSince} keep={location.hash} />
      <RootFlex>
        <Iconlist>
          <img src="assets/graph.svg" onClick={toggleGraph} />
          <img src="assets/export.svg" onClick={toggleExport} />
          <img src="assets/settings.svg" onClick={toggleSettings} />
        </Iconlist>
        <div>
          {mode === 'graph' && <Flex>
            {picked.map(uuid =>
              !!allSensors[uuid] && (
                <div key={uuid}>
                  <Graph
                    key={uuid}
                    uuid={uuid}
                    sensor={allSensors[uuid]}
                    since={since}
                    extra={extras[uuid]}
                  />
                </div>
              )
            )}
          </Flex>}
          {mode === 'export' && <Form>
            <ExportWidget sensors={picked} />
          </Form>}
          {mode === 'settings' && <Form>
            {type === 'multifrogs' && <>
              <MetaEditorWidget path={`/multifrogs/${uuid}`} />
              <HardwareConfigEditorWidget uuid={uuid} />
            </>}
            {type === 'frogs' && <>
              <MetaEditorWidget path={`/frogs/${uuid}`} />
            </>}
            {picked.map(uuid => !!allSensors[uuid] && (
              <Fragment key={uuid}>
                <GraphHeader>
                  {name(allSensors[uuid], 'Sensor', uuid)}
                </GraphHeader>
                <MetaEditorWidget path={`/sensors/${uuid}`} />
              </Fragment>
            ))}
            <HardResetWidget sensors={picked} />
          </Form>}
        </div>
      </RootFlex>
    </>
  )
}