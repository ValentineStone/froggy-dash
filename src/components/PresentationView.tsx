import { useEffect, useState } from 'react'
import { useSelector } from '../utils'
import { firebaseConfig, auth } from '../firebase'

import { Line } from 'react-chartjs-2'

const dbSelector = store => [store.db, store.selected, store.user]
export const PresentationView = () => {
  const [db, selected, user] = useSelector(dbSelector)
  const [sensorData, setSensorData] = useState(null)
  useEffect(() => {
    if (!selected?.sensor) return setSensorData(false)
    const readings = db.readings[selected.sensor]
    const sensor = db.sensors[selected.sensor]
    setSensorData({
      labels: Object.keys(readings).map(v => new Date(+v).toLocaleString('ru-RU', {
        //year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })),
      datasets: [
        {
          label: sensor.meta.valueSeriesName,
          fill: false,
          lineTension: 0,
          data: Object.values(readings)
        }
      ]
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
    {sensorData &&
      <div style={{ margin: '0 auto', maxWidth: 600 }}>
        <Line data={sensorData} />
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