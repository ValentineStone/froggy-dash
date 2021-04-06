import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from '../utils'

import ListView from './ListView'

const dbSelector = store => store.db
export const DevicesListView = () => {
  const db = useSelector(dbSelector)
  const [items, setItems] = useState([])
  const dispatch = useDispatch()
  useEffect(() => {
    const $ = (label, ...rest) => ({
      label,
      id: label,
      onClick: () =>
        dispatch('set', {
          selected: {
            multifrog: rest[0],
            frog: rest[1],
            sensor: rest[2],
          }
        })
    })
    if (db) setItems(() => {
      const multifrogs = Object.keys(db.multifrogs).sort()
      return [
        $('Представление 1'),
        [
          $('Лягушки'),
          ...multifrogs.map((id1, index1) => {
            const frogs = Object.keys(db.multifrogs[id1].frogs).sort()
            return [
              $(`Мульти ${index1 + 1}`, id1),
              ...frogs.map((id2, index2) => {
                const sensors = Object.keys(db.frogs[id2].sensors).sort()
                return [
                  $(`Лягушка ${index1 + 1}.${index2 + 1}`, id1, id2),
                  ...sensors.map((id3, index3) => {
                    return $(`Сенсор ${index1 + 1}.${index2 + 1}.${index3 + 1}`, id1, id2, id3)
                  })
                ]
              })
            ]
          })

        ]
      ]
    })
  }, [db])
  return (
    <ListView items={items} />
  )
}