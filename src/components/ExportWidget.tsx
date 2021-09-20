import styles from 'styled-components'
import { useSelector, log, once } from '../utils'
import SinceSelector from './SinceSelector'
import { store } from '../store'
import { useState } from 'react'
import Button from '@material-ui/core/Button'

import CardBase from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Typography from '@material-ui/core/Typography'
import styled from 'styled-components'
import { useCallback } from 'react'
import { database } from '../firebase'

const Card = styled(CardBase)`width: max-content`

const exportExcel = (uuids, separator, since) => {
  const { sensors } = store.getState()
  for (const uuid of uuids) {
    const sensor = sensors[uuid]
    const name = sensor.name || 'Sensor-' + uuid
    const type = sensor.meta.valueSeriesName
    const ref = database.ref('/readings/' + uuid).orderByKey().startAt(since)
    once((ref as any), 'value')
      .then(v => v.val())
      .then(readings => {
        if (readings) {
          const text = ['Time', type].join(separator) + '\n' +
            Object.entries(readings).map(v => v.join(separator)).join('\n')
          const element = document.createElement('a')
          element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
          element.setAttribute('download', name + '.csv')
          element.style.display = 'none'
          element.click()
        }
        else
          console.log('Nothing to export for ' + name)
      })
  }

}

const ExportWidget = ({ sensors = [], since: forceSince = undefined }) => {
  const [since, setSince] = useState(String(Date.now()))
  const activeSince = forceSince === undefined ? since : forceSince
  const exportSemi = () => exportExcel(sensors, ';', activeSince)
  const exportComma = () => exportExcel(sensors, ',', activeSince)
  return (
    <Card>
      {forceSince === undefined &&
        <CardContent>
          <Typography variant="h6" gutterBottom>Export</Typography>
          <SinceSelector onSelected={setSince} keep="export" />
        </CardContent>
      }
      <CardActions>
        <Button color="primary" onClick={exportSemi}>Export Excel (;)</Button>
        <Button color="primary" onClick={exportComma}>Export Excel (,)</Button>
      </CardActions>
    </Card>
  )
}

export default ExportWidget



export const ExportWidgetMini = ({ sensors = [], since }) => {
  const exportSemi = () => exportExcel(sensors, ';', since)
  const exportComma = () => exportExcel(sensors, ',', since)
  return <>
    <Button color="primary" onClick={exportSemi}>Export (;)</Button>
    <Button color="primary" onClick={exportComma}>Export (,)</Button>
  </>
}