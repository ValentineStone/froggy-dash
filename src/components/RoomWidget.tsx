import styles from 'styled-components'
import { useSelector, log } from '../utils'
import RoomWidgetChart from './RoomWidgetChart'

const Flex = styles.div`
  display: flex;
  flex-flow: row wrap;
  & > * {
    padding: 0.5em;
    width: 100%;
  }
  @media only screen and (min-width: 800px) {
    & > * {
      width: 50%;
    }
  }
  @media only screen and (min-width: 1200px) {
    & > * {
      width: 25%;
    }
  }
`

const sensorSelector = store => [store.sensors, store.readings]
const RoomWidget = () => {
  const [sensors, readings] = useSelector(sensorSelector)
  return (
    <Flex>
      {Object.keys(sensors).map(uuid =>
        !!sensors[uuid] && !!readings[uuid] && (
          <div key={uuid}>
            <RoomWidgetChart
              key={uuid}
              uuid={uuid}
              sensor={sensors[uuid]}
              readings={readings[uuid]}
            />
          </div>
        )
      )}
    </Flex>
  )
}

export default RoomWidget