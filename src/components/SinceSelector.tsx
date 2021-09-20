import { log, useLocalStorageState } from '../utils'

import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import TextField from '@material-ui/core/TextField'
import { useCallback } from 'react'
import { useEffect } from 'react'
import DateFnsUtils from '@date-io/date-fns'
import {
  DateTimePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers'
import { memo } from 'react'

const years = n => n * 365 * 30 * 24 * 60 * 60 * 1000
const months = n => n * 30 * 24 * 60 * 60 * 1000
const days = n => n * 24 * 60 * 60 * 1000
const hours = n => n * 60 * 60 * 1000
const minutes = n => n * 60 * 1000
const sinceStr = ms => ms === 0 ? '0' : String(Date.now() - ms)
const isnum = v => /^\d+$/.test(v)
const sinceDate = since => new Date(since).toLocaleString('ru-RU', {
  month: 'numeric',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})
const timeframes = [
  [String(hours(1)), 'Hour'],
  [String(days(1)), 'Day'],
  [String(days(7)), 'Week'],
  [String(months(1)), 'Month'],
  [String(months(3)), '3 months'],
  [String(months(6)), 'Half a year'],
  [String(years(1)), 'Year'],
  [String(0), 'Forever'],
  ['custom', 'Custom'],
]
const standartTimeframe = tf => timeframes.find(v => v[0] === tf)

const SinceSelector = ({ onSelected = null, keep = undefined }) => {
  const [timeframe, setTimeframe] = useLocalStorageState('SinceSelector:timeframe:' + keep, String(days(1)))
  const [custom, setCustom] = useLocalStorageState('SinceSelector:custom:' + keep, false)
  const [since, setSince] = useLocalStorageState('SinceSelector:since:' + keep, sinceStr(days(1)))
  const currentsince = custom ? since : sinceStr(+timeframe)
  useEffect(() => onSelected?.(currentsince), [])
  const onChangeSelect = useCallback(event => {
    if (event.target.value === 'custom') {
      setCustom(true)
    }
    else {
      setCustom(false)
      setTimeframe(event.target.value)
      onSelected?.(sinceStr(+event.target.value))
    }
  }, [])
  const onChangeCustom = useCallback(date => {
    const since = String(date.getTime())
    const timeframe = String(Date.now() - date.getTime())
    setTimeframe(timeframe)
    setSince(since)
    onSelected?.(since)
  }, [])
  return <  >
    <FormControl>
      <InputLabel htmlFor="since">Since</InputLabel>
      <Select
        native
        value={custom ? 'custom' : (standartTimeframe(timeframe) ? timeframe : 'custom')}
        onChange={onChangeSelect}
        inputProps={{ id: 'since' }}
      >
        {timeframes.map(([value, label]) =>
          <option key={value} value={value}>{label}</option>
        )}
      </Select>
    </FormControl>
    {!!custom &&
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <DateTimePicker label="Custom" value={+since} onChange={onChangeCustom} />
      </MuiPickersUtilsProvider>
    }
    <TextField
      disabled
      label="Since date"
      value={sinceDate(+currentsince)}
    />
  </>
}

export default SinceSelector