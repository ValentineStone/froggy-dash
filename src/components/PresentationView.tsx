import { useSelector, log } from '../utils'
import { firebaseConfig } from '../firebase'
import ReadingsWidget from './ReadingsWidget'
import MetaEditorWidget from './MetaEditorWidget'
import ReadingsEditorWidget from './ReadingsEditorWidget'
import HardwareConfigEditorWidget from './HardwareConfigEditorWidget'
import RoomsWidget from './RoomsWidget'
import styled from 'styled-components'

const PresentationViewRoot = styled.div`padding: 1em;`
const Subheading = styled.h3`margin-bottom: 0.6rem;`
const Section = styled.section`
  margin: 1rem 0;
  padding: 1rem;
  border: 1px solid lightgray;
`
const PresentationItems = styled.section`& > * { margin-bottom: 1em; }`

import { ObjectInspector } from 'react-inspector'

const multifrogSelector = store => [store.user.uid, store.dbuser]

export const PresentationMultifrog = ({ multifrog, uuid }) => {
  const [uid, dbuser] = useSelector(multifrogSelector)
  const sensors = []
  if (dbuser.multifrogs)
    for (const multi in dbuser.multifrogs)
      for (const frog in dbuser.multifrogs[multi])
        sensors.push(...Object.keys(dbuser.multifrogs[multi][frog]))
  return <PresentationItems>
    <MetaEditorWidget path={`/multifrogs/${uuid}`} />
    <HardwareConfigEditorWidget uid={uid} uuid={uuid} />
    <ReadingsWidget sensors={sensors} key={uuid} />
  </PresentationItems>
}

export const PresentationFrog = ({ frog, uuid }) => {
  return <PresentationItems>
    <MetaEditorWidget path={`/frogs/${uuid}`} />
    <ReadingsWidget sensors={frog.sensors} key={uuid} />
  </PresentationItems>
}

const devmodeSelector = store => store.devmode

export const PresentationSensor = ({ uuid, sensor }) => {
  const devmode = useSelector(devmodeSelector)
  return (
    <PresentationItems>
      <MetaEditorWidget path={`/sensors/${uuid}`} />
      {devmode && <ReadingsEditorWidget uuid={uuid} />}
      <ReadingsWidget sensor={uuid} key={uuid} />
    </PresentationItems>
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
    <PresentationItems>
      <RoomsWidget />
    </PresentationItems>
  )
}

export const PresentationFroggy = () => {
  return (
    <PresentationItems>
      <ReadingsWidget />
    </PresentationItems>
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