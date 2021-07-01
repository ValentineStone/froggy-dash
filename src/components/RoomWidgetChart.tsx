import { memo } from 'react'
import { useSelector } from '../utils'
import Chart from './Chart'

const options = (data, labels, line, aspectRatio = 3 / 4) => ({
  type: 'line',
  options: {
    aspectRatio,
    plugins: {
      legend: { display: false },
      tooltip: { displayColors: false }
    },
    layout: {
      padding: 5
    },
    scales: {
      xAxes: {
        display: false
      },
      yAxes: {
        ticks: {
          display: false,
          callback: v => v === line ? '' : null,
        },
        grid: {
          tickLength: 0,
          drawBorder: false,
          color: 'red',
          lineWidth: 2
        }
      }
    }
  },
  data: {
    labels,
    datasets: [
      {
        label: 'Temperature',
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
})

const formatDate = v => new Date(+v).toLocaleString('ru-RU', {
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

const devmodeSelector = store => store.devmode
const RoomWidgetChart = ({ uuid, sensor, readings, aspectRatio = undefined }) => {
  const devmode = useSelector(devmodeSelector)
  const { readingCritical } = sensor.meta
  const keys = Object.keys(readings).slice(-30);
  const values = Object.values(readings).slice(-30);
  const critical = values[values.length - 1] >= readingCritical
  const labels = keys.map(formatDate)
  const chartjs = options(
    values,
    labels,
    readingCritical,
    aspectRatio,
  )
  return <>
    <Chart chartjs={chartjs} style={{
      border: '2px solid black',
      backgroundColor: critical ? '#ff6044' : undefined,
    }} />
    {devmode && `[${uuid}]`}
  </>
}

export default memo(RoomWidgetChart)