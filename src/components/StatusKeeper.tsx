import { useState } from "react"
import { useEffect } from "react"
import { timeout, useSelector } from "../utils"
import { store } from "../store"
import { configGet } from "./Graph"

const updateExtras = (uuid, extras) => store.dispatch({ type: 'set', value: ['extras.' + uuid, s => ({ ...s, ...extras })] })

const GRACE = 5 * 60 * 1000
const MULTI_PERIOD = 30 * 1000

const configSelector = multifrog => store => store.hardware[multifrog]
const statusSelector = uuid => store => [store.sensors[uuid], store.extras[uuid]]
export const useSensorStatus = uuid => {
  const [online, setOnline] = useState(undefined)
  const [sensor, extra] = useSelector(statusSelector(uuid))
  const config = useSelector(configSelector(sensor?.multifrog))
  const period = config ? +configGet(config, sensor.frog, uuid, 'period') : undefined
  const { lowerThreshold, upperThreshold, valueSeriesName } = sensor?.meta || {}

  useEffect(() => {
    if (!extra || !period) return
    const untill = Math.max(0, period - (Date.now() - extra.onlineAt || 0) + GRACE)
    if (untill) {
      setOnline(true)
      return timeout(() => setOnline(false), untill)
    } else {
      setOnline(false)
    }
  }, [extra?.onlineAt, period])

  let status
  if (!sensor || !extra || !config || !period) status = undefined
  else if (extra.lastReading >= upperThreshold) status = valueSeriesName + ' is too high'
  else if (extra.lastReading <= lowerThreshold) status = valueSeriesName + ' is too low'
  else if (online === undefined) status = undefined
  else if (online === false) status = 'Sensor offline'
  else status = true

  useEffect(() => { updateExtras(uuid, { status, online, period, type: 'Sensor' }) }, [status, online, extra?.onlineAt, period])
  return status
}

const userSelector = store => store.dbuser
export const StatusKeeper = () => {
  const user = useSelector(userSelector)
  return Object.entries<any>(user?.multifrogs || {}).map(([uuid, multi]) =>
    <MultifrogStatusKeeper uuid={uuid} key={uuid} />
  ) as any
}

export default StatusKeeper

const multiSelector = uuid => store => store.multifrogs[uuid]
export const MultifrogStatusKeeper = ({ uuid }) => {
  const multifrog = useSelector(multiSelector(uuid))
  useEffect(() => {
    if (!multifrog) return
    const untill = Math.max(0, MULTI_PERIOD - (Date.now() - multifrog.online || 0) + GRACE)
    if (untill) {
      updateExtras(uuid, { online: true, type: 'Multifrog' })
      return timeout(() => updateExtras(uuid, { online: false, type: 'Multifrog' }), untill)
    } else {
      updateExtras(uuid, { online: false, type: 'Multifrog' })
    }
  }, [multifrog, multifrog?.online])
  return Object.entries<any>(multifrog?.frogs || {}).map(([uuid, multi]) =>
    <FrogStatusKeeper uuid={uuid} key={uuid} />
  ) as any
}

const frogSelector = uuid => store => store.frogs[uuid]
const FrogStatusKeeper = ({ uuid }) => {
  const frog = useSelector(frogSelector(uuid))
  const [sensorStatus, setSensorStatus] = useState({})
  const hasProblem = Object.values(sensorStatus).find(v => typeof v === 'string')
  const isNotReady = Object.values(sensorStatus).find(v => v === undefined)
  const status = hasProblem ? 'Has sensor problems' : (isNotReady ? undefined : true)
  useEffect(() => { updateExtras(uuid, { status, type: 'Frog' }) }, [status])
  return Object.keys(frog?.sensors || {}).map(uuid =>
    <SensorStatusKeeper uuid={uuid} key={uuid} onStatus={setSensorStatus} />
  ) as any
}


const SensorStatusKeeper = ({ uuid, onStatus }) => {
  const status = useSensorStatus(uuid)
  useEffect(() => onStatus(v => ({ ...v, [uuid]: status })), [status])
  return null
}