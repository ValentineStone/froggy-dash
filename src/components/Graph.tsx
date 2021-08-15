import { log, useSelector } from '../utils'
import { ObjectInspector } from 'react-inspector'
import { Fragment, memo, useEffect, useState } from 'react'
import { database } from '../firebase'
import SinceSelector from './SinceSelector'
import styled from 'styled-components'
import { Scatter } from 'react-chartjs-2'
import { useMemo } from 'react'
import SplitView from './SplitView'

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

const Box = styled.div`border: 1px solid black; padding: 0.5em; margin: 0.5em auto`

const configSelector = multifrog => store => store.hardware[multifrog]
export const Graph = memo<any>(({ uuid, sensor, since }) => {
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
  const { lowerThreshold, upperThreshold, valueSeriesName } = sensor.meta
  const values = Object.values(readings)
  const overmax = values.length && values[values.length - 1] >= upperThreshold
  const undermin = values.length && values[values.length - 1] <= lowerThreshold
  const config = configGet(multi_config, sensor.frog, uuid, true)
  const keys = Object.keys(readings)
  const data = Object.entries(readings).map(([x, y]) => ({ x: +x, y }))
  return <Box>
    {values.length
      ? <Scatter data={{
        datasets: [{
          label: valueSeriesName,
          data
        }],
      }} options={{
        animation: false,
        aspectRatio: 3 / 4,
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

            borderColor: 'black',
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
      : 'No no readings in selected timeframe'
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
import ExportWidget from './ExportWidget'
import HardResetWidget from './HardResetWidget'
import { useCallback } from 'react'
import MetaEditorWidget from './MetaEditorWidget'
import HardwareConfigEditorWidget from './HardwareConfigEditorWidget'

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
      width: 50%;
    }
  }
  @media only screen and (min-width: 1200px) {
    & > * {
      width: 25%;
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
  font-size: large;
`

const Form = styled.div`
  & > * {
    width: 100%;
    margin-bottom: 0.5em;
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
        <div>
          <img src="assets/graph.svg" onClick={toggleGraph} />
          <img src="assets/export.svg" onClick={toggleExport} />
          <img src="assets/settings.svg" onClick={toggleSettings} />
        </div>
        <div>
          {mode === 'graph' && <Flex>
            {picked.map(uuid =>
              !!allSensors[uuid] && (
                <div key={uuid}>
                  <GraphHeader>
                    {name(allSensors[uuid], 'Sensor', uuid)}
                  </GraphHeader>
                  <Graph
                    key={uuid}
                    uuid={uuid}
                    sensor={allSensors[uuid]}
                    since={since}
                  />
                  <div>
                    Last {extras[uuid] && `${extras[uuid]?.lastReading} at ${formatDate(extras[uuid]?.lastReadingAt)}`}
                  </div>
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