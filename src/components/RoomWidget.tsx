import styles from 'styled-components'
import { useSelector } from '../utils'
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

const sensorSelector = store => [store.db.sensors, store.db.readings]
const RoomWidget = () => {
  const [sensors, readings] = useSelector(sensorSelector)
  return (
    <Flex>
      {Object.keys(sensors).map(uuid =>
        <div key={uuid}>
          <RoomWidgetChart
            sensor={sensors[uuid]}
            readings={readings[uuid]}
          />
          [{uuid}]
        </div>
      )}
    </Flex>
  )
}

export default RoomWidget