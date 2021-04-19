import styles from 'styled-components'
import { useSelector } from '../utils'
import RoomWidgetChart from './RoomWidgetChart'

const Flex = styles.div`
  display: flex;
  flex-flow: row wrap;
  & > * {
    width: 100%;
    padding: 0.5em;
  }

  @media only screen and (min-width: 750px) {
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
        <div>
          <RoomWidgetChart
            key={uuid}
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