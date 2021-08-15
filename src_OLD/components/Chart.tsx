import ChartJS from 'chart.js/auto'
import { useEffect, useRef, useState } from 'react'
import merge from 'lodash/merge'

export default function Chart({ chartjs, ...props }) {
  const [canvas, setCanvas] = useState(null)
  const chart = useRef(null)
  useEffect(() => {
    if (!chart.current) return
    merge(chart.current.options, chartjs.options)
    merge(chart.current.data, chartjs.data)
    chart.current.update()
  }, [chartjs])
  useEffect(() => {
    if (!canvas) return
    chart.current = new ChartJS(canvas, chartjs)
    return () => {
      chart.current.destroy()
      chart.current = null
    }
  }, [canvas])
  return <canvas {...props} ref={setCanvas} />
}