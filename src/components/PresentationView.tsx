import { useSelector } from '../utils'
import { firebaseConfig } from '../firebase'
import RoomWidgetChart from './RoomWidgetChart'
import RoomWidget from './RoomWidget'

const dbSelector = store => [store.db, store.selected]
export const PresentationView = () => {
  const [db, selected] = useSelector(dbSelector)
  console.log(selected)
  if (!db) return null
  return <>
    <h1>
      Selected: {selected?.something ? <br /> : 'nothing'}
    </h1>
    {selected?.something &&
      <pre style={{ padding: '1em' }}>
        {selected?.presentation && `Presentation [${selected.presentation}]`}
        {selected?.presentation && <br />}
        {selected?.multifrog && `Multifrog [${selected.multifrog}]`}
        {selected?.multifrog && <br />}
        {selected?.frog && `Frog [${selected.frog}]`}
        {selected?.frog && <br />}
        {selected?.sensor && `Sensor [${selected.sensor}]`}
      </pre>
    }
    {selected?.presentation === 'rooms' &&
      <RoomWidget />
    }
    {selected?.sensor &&
      <div style={{
        margin: '0 auto',
        maxWidth: 600,
      }}>
        <RoomWidgetChart
          readings={db.readings[selected.sensor]}
          sensor={db.sensors[selected.sensor]}
        />
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