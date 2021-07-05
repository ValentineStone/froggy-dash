import { useEffect } from 'react'
import { memo, useState } from 'react'
import styled from 'styled-components'
import { database } from '../firebase'
import { useSelector, log, cx, timeout } from '../utils'
import Chart from './Chart'

const IndicatorCircle = styled.div`
  position: absolute;
  margin: 5px;
  width: 1em;
  height: 1em;
  border-radius: 1em;
  background: red;
  &.online {
    background: green;
  }
`
const Indicator = ({ last, period }) => {
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
  return <IndicatorCircle className={online ? 'online' : ''} />
}

const options = (data, labels, min, max, valueSeriesName) => {
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
          min: min - pad,
          max: max + pad,
          ticks: {
            display: false,
            callback: v => v === min || v === max ? '' : null,
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

const devmodeSelector = store => store.devmode
const ReadingsWidgetChart = ({ uuid, sensor, since = undefined }) => {
  const [readings, setReadings] = useState({})
  const [updated, setUpdated] = useState(Date.now())
  useEffect(() => {
    if (since === undefined) return
    const ref = database.ref('/readings/' + uuid).orderByKey().startAt(since)
    const onValue = v => {
      setReadings(v.val() || {})
      setUpdated(Date.now())
    }
    ref.on('value', onValue)
    return () => ref.off('value', onValue)
  }, [uuid, since])
  const devmode = useSelector(devmodeSelector)
  const { lowerThreshold, upperThreshold, valueSeriesName } = sensor.meta
  const keys = Object.keys(readings)
  const values = Object.values(readings)
  const overmax = values.length && values[values.length - 1] >= upperThreshold
  const undermin = values.length && values[values.length - 1] <= lowerThreshold
  const labels = keys.map(formatDate)
  const lastupdated = keys.length && +keys[keys.length - 1]
  const chartjs = options(
    values,
    labels,
    lowerThreshold,
    upperThreshold,
    valueSeriesName
  )
  return <>
    <Indicator last={lastupdated} period={20000} />
    <Chart key={updated} chartjs={chartjs} style={{
      border: '2px solid black',
      backgroundColor: overmax ? '#ff6044' : (undermin ? '#8aecff' : undefined),
    }} />
    {devmode && `[${uuid}](${keys.length})`}
  </>
}

export default memo(ReadingsWidgetChart)