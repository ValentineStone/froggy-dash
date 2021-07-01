import { useSelector } from '../utils'
import { firebaseConfig } from '../firebase'
import RoomWidgetChart from './RoomWidgetChart'
import RoomWidget from './RoomWidget'
import MetaEditorWidget from './MetaEditorWidget'
import ReadingsEditorWidget from './ReadingsEditorWidget'
import ValueEditorWidget from './ValueEditorWidget'
import styled from 'styled-components'

const Subheading = styled.h3`margin-bottom: 0.6rem;`
const Section = styled.section`
  margin: 1rem 0;
  padding: 1rem;
  border: 1px solid lightgray;
`

import { ObjectInspector } from 'react-inspector'

const uidSelector = store => store.user.uid
export const PresentationMultifrog = ({ multifrog, uuid }) => {
  const uid = useSelector(uidSelector)
  return <>
    <ValueEditorWidget
      multiline
      name="Hardware"
      path={`/users/${uid}/hardware/${uuid}`}
      initial={multifrog.hardware}
    />
  </>
}

export const PresentationFrog = ({ frog, uuid }) => {
  return <>
  </>
}

const readingsSelector = uuid => store => [store.readings[uuid], store.devmode]
export const PresentationSensor = ({ uuid, sensor }) => {
  const [readings, devmode] = useSelector(readingsSelector(uuid))
  return (
    <>
      <MetaEditorWidget path={`/sensors/${uuid}`} />
      {!!readings && devmode && 
        <ReadingsEditorWidget uuid={uuid} />
      }
      {!!readings &&
        <div
          style={{
            padding: '1em',
            maxWidth: 600,
          }}
        >
          <RoomWidgetChart
            key={uuid}
            uuid={uuid}
            aspectRatio={1}
            sensor={sensor}
            readings={readings}
          />
        </div>
      }
    </>
  )
}

export const PresentationSomething = ({ selected }) => {
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
  </>
}

export const PresentationRooms = () => {
  return (
    <RoomWidget />
  )
}

export const PresentationFroggy = () => {
  return (
    <PresentationRooms />
  )
}

const selectedSelector = store => [
  store.multifrogs[store.selected?.multifrog],
  store.frogs[store.selected?.frog],
  store.sensors[store.selected?.sensor],
  store.selected,
  store
]
export const PresentationView = () => {
  const [multifrog, frog, sensor, selected, store] = useSelector(selectedSelector)
  return (
    <>
      {store.devmode && <PresentationSomething selected={selected} />}
      <PresentationSwitch {...{ multifrog, frog, sensor, selected }} />
      {store.devmode && <>
        <Section>
          <Subheading>Firebase API keys:</Subheading>
          <ObjectInspector expandLevel={1} data={firebaseConfig} />
        </Section>
        <Section>
          <Subheading>Store:</Subheading>
          <ObjectInspector expandLevel={1} data={store} />
        </Section>
      </>}
    </>
  )
}

const PresentationSwitch = ({ multifrog, frog, sensor, selected }) => {
  switch (selected.presentation) {
    case 'rooms': return <PresentationRooms />
    case 'froggy': return <PresentationFroggy />
    case 'multifrog': return !!multifrog && <PresentationMultifrog uuid={selected.multifrog} multifrog={multifrog} />
    case 'frog': return !!frog && <PresentationFrog uuid={selected.frog} frog={frog} />
    case 'sensor': return !!sensor && <PresentationSensor uuid={selected.sensor} sensor={sensor} />
    default: return null
  }
}