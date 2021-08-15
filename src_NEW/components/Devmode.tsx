import { log, useSelector } from '../utils'
import { ObjectInspector } from 'react-inspector'
import { memo, useEffect, useState } from 'react'
import { database } from '../firebase'
import SinceSelector from './SinceSelector'
import styled from 'styled-components'
import { Scatter } from 'react-chartjs-2'
import { useMemo } from 'react'
import SplitView from './SplitView'

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

const Box = styled.div`border: 1px solid black; margin: 0.5em; padding: 0.5em`

const configSelector = multifrog => store => store.hardware[multifrog]
const Graph = memo<any>(({ uuid, sensor }) => {
  const [readings, setReadings] = useState({})
  const [updated, setUpdated] = useState(Date.now())
  const [since, setSince] = useState(String(Date.now()))
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
  /*
  const keys = Object.keys(readings)
  const data = Object.entries(readings).map(([x,y]) => ({x,y:+y}))
  const labels = keys.map(formatDate)
  const lastupdated = keys.length && +keys[keys.length - 1]
  const period = configGet(config, sensor.frog, uuid, 'period')
  */
  return <Box>
    <SinceSelector onSelected={setSince} keep={'devmode:' + uuid} />
    {values.length
      ? <Scatter data={{
        datasets: [{
          label: valueSeriesName,
          data
        }],
      }} options={{
        animation: false,
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