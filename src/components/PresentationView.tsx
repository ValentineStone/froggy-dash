import { useSelector } from '../utils'
import { firebaseConfig } from '../firebase'
import RoomWidgetChart from './RoomWidgetChart'
import RoomWidget from './RoomWidget'
import MetaEditorWidget from './MetaEditorWidget'

const selectedSelector = store => [
  store.sensors[store.selected?.sensor],
  store.readings[store.selected?.sensor],
  store.selected
]
export const PresentationView = () => {
  const [sensor, readings, selected] = useSelector(selectedSelector)
  return (
    <>
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
        <>
          <MetaEditorWidget path={`/sensors/${selected.sensor}`} />
          <div
            style={{
              padding: '1em',
              maxWidth: 600,
            }}
          >
            <RoomWidgetChart
              aspectRatio={1}
              sensor={sensor}
              readings={readings}
            />
          [{selected.sensor}]
        </div>
        </>
      }
      <details style={{ background: 'lightgray', padding: '1em' }}>
        <summary><b>{'Firebase API keys:'}</b></summary>
        <pre>
          {JSON.stringify(firebaseConfig, null, 2)}
        </pre>
      </details>
    </>
  )
}