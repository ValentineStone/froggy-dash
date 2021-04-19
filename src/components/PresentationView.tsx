import { useEffect, useState } from 'react'
import { useSelector } from '../utils'
import { firebaseConfig, auth } from '../firebase'

import Chart from './Chart'

const dbSelector = store => [store.db, store.selected, store.user]
export const PresentationView = () => {
  const [db, selected, user] = useSelector(dbSelector)
  const [chartjs, setChartjs] = useState(null)
  useEffect(() => {
    if (!selected?.sensor) return setChartjs(false)
    const readings = db.readings[selected.sensor]
    const reading_keys = Object.keys(readings)
    const reading_values = Object.values(readings)
    const critical = reading_values[reading_values.length - 1] >= 14
    const sensor = db.sensors[selected.sensor]
    const formatted_labes = reading_keys.map(v => new Date(+v).toLocaleString('ru-RU', {
      //year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }))
    const stub_labels = new Array(reading_values.length).fill('')
    setChartjs({
      critical,
      chartjs: {
        type: 'line',
        options: {
          aspectRatio: 3/4,
          plugins: {
            legend: { display: false },
            tooltip: { displayColors: false }
          },
          layout: {
            padding: 5
          },
          scales: {
            xAxes: {
              display: false //this will remove all the x-axis grid lines
            },
            yAxes: {
              ticks: {
                display: false,
                callback: v => v === 14 ? '' : null,
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
          labels: formatted_labes,
          datasets: [
            {
              label: sensor.meta.valueSeriesName,
              fill: false,
              lineTension: 0,
              data: reading_values,


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
    })
  }, [selected?.sensor])
  if (!db) return null
  return <>
    <h1>
      Selected: {selected?.multifrog ? <br /> : 'nothing'}
    </h1>
    {selected?.multifrog &&
      <pre style={{ padding: '1em' }}>
        {selected?.multifrog && `Multifrog ${selected.multifrog}`}
        {selected?.multifrog && <br />}
        {selected?.frog && `Frog ${selected.frog}`}
        {selected?.frog && <br />}
        {selected?.sensor && `Sensor ${selected.sensor}`}
      </pre>
    }
    {chartjs &&
      <div style={{
        margin: '0 auto',
        maxWidth: 600,
        border: '2px solid black',
        ...(chartjs.critical ? { backgroundColor: '#FF6044' } : {})
      }}>
        <Chart chartjs={chartjs.chartjs} />
      </div>
    }
    <pre style={{ background: 'lightgray', padding: '1em' }}>
      <b>{'Firebase API keys:'}</b>
      <br />
      {JSON.stringify(firebaseConfig, null, 2)}
    </pre>
    <pre>
      {JSON.stringify(db, null, 2)}
    </pre>
  </>
}