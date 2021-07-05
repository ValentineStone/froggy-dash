import { useState, useEffect } from 'react'
import { useSelector, useDispatch, log } from '../utils'

import ListView from './ListView'

const frogsSelector = store => [
  store.multifrogs,
  store.frogs,
  //store.sensors,
]
export const DevicesListView = () => {
  const [multifrogs, frogs, sensors] = useSelector(frogsSelector)
  const [items, setItems] = useState([])
  const [showAppmenu] = useDispatch([d => () => d('appmenu', [true])], [])
  useEffect(() => {
    const $ = (label, ...rest) => {
      const href = '#/' + (
        rest[0]
          ? (rest[1]
            ? (rest[2]
              ? `sensor/${rest[0]}/${rest[1]}/${rest[2]}`
              : `frog/${rest[0]}/${rest[1]}`)
            : `multifrog/${rest[0]}`)
          : rest[3]
      )
      return {
        href,
        label,
        id: label,
        onClick: () => { },
      }
    }
    setItems(() => {
      const multifrog_ids = Object.keys(multifrogs).sort()
      return [
        { label: 'Меню', id: 'Меню', onClick: showAppmenu },
        $('Комнаты', null, null, null, 'rooms'),
        [
          $('Лягушки', null, null, null, 'froggy'),
          ...multifrog_ids.map((id1, index1) => {
            const frog_ids = Object.keys(multifrogs[id1]?.frogs || {}).sort()
            return [
              $(`Мульти ${index1 + 1}`, id1),
              ...frog_ids.map((id2, index2) => {
                const sensor_ids = Object.keys(frogs[id2]?.sensors || {}).sort()
                return [
                  $(`Лягушка ${index1 + 1}.${index2 + 1}`, id1, id2),
                  ...sensor_ids.map((id3, index3) => {
                    return $(`Сенсор ${index1 + 1}.${index2 + 1}.${index3 + 1}`, id1, id2, id3)
                  })
                ]
              })
            ]
          })

        ],
      ]
    })
  }, [multifrogs, frogs])
  return (
    <ListView items={items} />
  )
}