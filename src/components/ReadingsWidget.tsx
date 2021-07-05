import styles from 'styled-components'
import { useSelector, log } from '../utils'
import ReadingsWidgetChart from './ReadingsWidgetChart'
import SinceSelector from './SinceSelector'
import ExportWidget from './ExportWidget'
import { useState } from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

const Flex = styles.div`
  margin-top: 1em;
  display: flex;
  flex-flow: row wrap;
  & > * {
    padding-right: 1em;
    padding-bottom: 1em;
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

const sensorSelector = store => [store.sensors]

const ReadingsWidget = ({ sensors = null, sensor = null }) => {
  const [allSensors] = useSelector(sensorSelector)
  const [since, setSince] = useState(String(Date.now()))
  const [sexportSince, setExportSince] = useState(String(Date.now()))
  const picked = sensors
    ? (Array.isArray(sensors)
      ? sensors
      : Object.keys(sensors))
    : (sensor
      ? [sensor]
      : Object.keys(allSensors))
  return (
    <>
      <Card>
        <CardContent>
          <SinceSelector onSelected={setSince} keep={location.hash} />
          <Flex>
            {picked.map(uuid =>
              !!allSensors[uuid] && (
                <div key={uuid}>
                  <ReadingsWidgetChart
                    key={uuid}
                    uuid={uuid}
                    sensor={allSensors[uuid]}
                    since={since}
                  />
                </div>
              )
            )}
          </Flex>
        </CardContent>
      </Card>
      <ExportWidget sensors={picked} />
    </>
  )
}

export default ReadingsWidget