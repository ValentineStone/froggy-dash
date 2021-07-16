import { useEffect } from 'react'
import { memo, useState } from 'react'
import styled from 'styled-components'
import { database } from '../firebase'
import { useSelector, log, cx, timeout } from '../utils'
import Chart from './Chart'
import SignalCellularConnectedNoInternet0Bar from '@material-ui/icons/SignalCellularConnectedNoInternet0Bar'
import SignalCellularAlt from '@material-ui/icons/SignalCellularAlt'

const IndicatorIconOff = styled(SignalCellularConnectedNoInternet0Bar).attrs(() => ({ color: 'secondary' }))``
const IndicatorIconOn = styled(SignalCellularAlt).attrs(() => ({ color: 'primary' }))``
const IndicatorRoot = styled.div`
  position: relative;
  & > * {
    position: absolute;
    top: 5px;
    left: 5px;
  }
`

export const Indicator = ({ last, period: _period = 0, grace = 10000 }) => {
  const period = _period + grace
  const [online, setOnline] = useState(Date.now() - last <= period)
  useEffect(() => {
    const untill = Math.max(0, period - (Date.now() - last))
    if (untill) {
      setOnline(true)
      return timeout(() => setOnline(false), untill)
    } else {
      setOnline(false)
    }
  }, [last, period])
  return online ? <IndicatorIconOn /> : <IndicatorIconOff />
}

const IndicatorFloat = ({ last, period = 0, grace = 10000 }) => {
  return <IndicatorRoot>
    <Indicator last={last} period={period} grace={grace} />
  </IndicatorRoot>
}

const options = (data, labels, min, max, valueSeriesName) => {
  const step = Math.abs(max - min)
  const pad = Math.abs(max - min) / 10
  return {
    type: 'line',
    options: {
      animation: false,
      aspectRatio: 3 / 4,
      plugins: {
        legend: { display: false },
        tooltip: { displayColors: false }
      },
      layout: {
        padding: 5
      },
      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            display: false,
            minRotation: 0,
            maxRotation: 0,
          },
          title: {
            display: true,
            text: 'Time',
            color: '#000000',
          }
        },
        y: {
          min: min,
          max: max,
          ticks: {
            count: 2,
            stepSize: step,
            callback: v => v === min ? min : (v === max ? max : null),
            minRotation: 0,
            maxRotation: 0,
          },
          grid: {
            tickLength: 0,
            drawBorder: false,
            color: '#000000',
            lineWidth: 2
          },
          title: {
            display: true,
            text: valueSeriesName,
            color: '#000000',
          }
        }
      }
    },
    data: {
      labels,
      datasets: [
        {
          label: valueSeriesName,
          fill: false,
          lineTension: 0,
          data,

          pointRadius: 0,
          pointHoverRadius: 0,
          pointHoverBorderWidth: 0,
          pointBorderWidth: 0,
          pointHitRadius: 10,

          borderColor: 'black',
          borderWidth: 2,
        }
      ]
    }
  }
}

const formatDate = v => new Date(+v).toLocaleString('ru-RU', {
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

import { configGet } from './HardwareConfigEditorWidget'
import { Typography } from '@material-ui/core'

const configSelector = multifrog => store => [store.hardware[multifrog], store.devmode]
const ReadingsWidgetChart = ({ uuid, sensor, since = undefined }) => {
  const [readings, setReadings] = useState({})
  const [updated, setUpdated] = useState(Date.now())
  useEffect(() => {
    if (since === undefined) return
    const ref = database.ref('/readings/' + uuid).orderByKey().startAt(since)
    const onValue = v => {
      const readings = v.val() || {}
      if (Object.keys(readings).length) {
        setReadings(readings)
        setUpdated(Date.now())
      } else {
        database.ref('/readings/' + uuid).limitToLast(3).get().then(v => {
          setReadings(v.val() || {})
          setUpdated(Date.now())
        }).catch(e => { })
      }
    }
    ref.on('value', onValue)
    return () => ref.off('value', onValue)
  }, [uuid, since])
  const [config, devmode] = useSelector(configSelector(sensor.multifrog))
  const { lowerThreshold, upperThreshold, valueSeriesName } = sensor.meta
  const keys = Object.keys(readings)
  const values = Object.values(readings)
  const overmax = values.length && values[values.length - 1] >= upperThreshold
  const undermin = values.length && values[values.length - 1] <= lowerThreshold
  const labels = keys.map(formatDate)
  const lastupdated = keys.length && +keys[keys.length - 1]
  const period = configGet(config, sensor.frog, uuid, 'period')
  const chartjs = options(
    values,
    labels,
    lowerThreshold,
    upperThreshold,
    valueSeriesName
  )
  return <>
    <IndicatorFloat last={lastupdated} period={period} />
    <Chart key={updated} chartjs={chartjs} style={{
      border: '2px solid black',
      backgroundColor: overmax ? '#ffd1c9' : (undermin ? '#e3e8ff' : undefined),
    }} />
    <div>
      <Typography variant="h6" display="inline" color={overmax ? 'secondary' : (undermin ? 'primary' : 'initial')}>
        {values[values.length - 1]}
      </Typography>
      {' at '}{labels[labels.length - 1]}
    </div>
    {devmode && `[${uuid}](${keys.length})`}
  </>
}

export default memo(ReadingsWidgetChart)