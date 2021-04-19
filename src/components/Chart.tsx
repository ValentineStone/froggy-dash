import ChartJS from 'chart.js/auto'
import { useEffect, useState } from 'react'

export default function Chart({ chartjs, ...props }) {
  const [canvas, setCanvas] = useState(null)
  useEffect(() => {
    let chart
    if (canvas) chart = new ChartJS(canvas, chartjs)
    return () => chart && chart.destroy()
  }, [canvas, chartjs])
  return <canvas {...props} ref={setCanvas} />
}