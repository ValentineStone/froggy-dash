import { useSelector } from '../utils'
import { firebaseConfig } from '../firebase'
import RoomWidgetChart from './RoomWidgetChart'
import RoomWidget from './RoomWidget'
import MetaEditorWidget from './MetaEditorWidget'
import styled from 'styled-components'

const Subheading = styled.h3`margin-bottom: 0.6rem;`
const Section = styled.section`
  margin: 1rem 0;
  padding: 1rem;
  border: 1px solid lightgray;
`

import { ObjectInspector } from 'react-inspector'

const selectedSelector = store => [
  store.sensors[store.selected?.sensor],
  store.readings[store.selected?.sensor],
  store.selected,
  store
]
export const PresentationView = () => {
  const [sensor, readings, selected, store] = useSelector(selectedSelector)
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
      <Section>
        <Subheading>Firebase API keys:</Subheading>
        <ObjectInspector expandLevel={1} data={firebaseConfig} />
      </Section>
      <Section>
        <Subheading>Store:</Subheading>
        <ObjectInspector expandLevel={1} data={store} />
      </Section>
    </>
  )
}