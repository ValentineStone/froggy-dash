import { useCallback, useState } from 'react'
import { useSelector, useDispatch, useLocalStorageState, useToggle } from '../utils'
import styled from 'styled-components'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Collapse from '@material-ui/core/Collapse'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import Save from '@material-ui/icons/Save'
import { database } from '../firebase'

import { Indicator } from './ReadingsWidgetChart'

const Flex = styled.div`
  display: flex;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: auto;
  & > * { flex: 1 }
`

const MultiName = styled.div`
  display: flex;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: auto;
  & > *:first-child { flex: 1 }
  padding-right: 1em;
`

const ItemSingle = ({ label, children = null, renames = null, ...rest }: any) => {
  const [renaming, toggleRenaming] = useToggle(useState(false))
  const onDoubleClick = useCallback(() => renames && toggleRenaming(), [renames])
  const onChange = useCallback(event => renames && database.ref(renames + '/name').set(event.target.value), [renames])
  const onKeyDown = useCallback(event => renames && event.key === 'Enter' && toggleRenaming(), [renames])
  return (
    <ListItem onDoubleClick={onDoubleClick} {...rest} button component="a">
      {renaming
        ? <ListItemText><input value={label} onChange={onChange} onKeyDown={onKeyDown} /></ListItemText>
        : <ListItemText primary={label} />
      }
      {renaming ? <Save onClick={toggleRenaming} /> : children}
    </ListItem>
  )
}

const ItemCollapsable = ({ label, children, ...rest }: any) => {
  const [open, setOpen] = useLocalStorageState(label, true)
  const toggle = useCallback(() => setOpen(open => !open), [])
  return <>
    <ItemSingle {...rest} label={label}>
      {open
        ? <ExpandLess onClick={toggle} />
        : <ExpandMore onClick={toggle} />
      }
    </ItemSingle>
    <Collapse in={open} timeout="auto" style={{ paddingLeft: '1em' }}>
      <List>
        {children}
      </List>
    </Collapse>
  </>
}

const Item = ({ children = null, ...rest }: any) => {
  if (children)
    return <ItemCollapsable {...rest} children={children} />
  else
    return <ItemSingle {...rest} />
}

const fakename = (type, uuid) => type + ' ' + uuid.slice(0, 7)
const map = (Items, slice, cb) =>
  Object.keys(slice || Items)
    .map(key => Items[key] ? cb(key, Items[key]) : null)

const frogsSelector = store => [
  store.multifrogs,
  store.frogs,
  store.sensors,
]
export const DevicesListView = () => {
  const [multifrogs, frogs, sensors] = useSelector(frogsSelector)
  const [toggleAppmenu] = useDispatch([d => () => d('appmenu', [true])], [])
  return (
    <List>
      <Item label="Menu" onClick={toggleAppmenu} />
      <Item label="Rooms" href="#/rooms" />
      <Item label="Frogs" href="#/froggy" >
        {map(multifrogs, null, (mId, m) =>
          <Item
            key={mId}
            renames={`/multifrogs/${mId}`}
            label={<MultiName>
              <div>{m.name || fakename('Multifrog', mId)}</div>
              <Indicator last={m.online} period={30000} />
            </MultiName>}
            href={`#/multifrog/${mId}`}
          >
            {map(frogs, m.frogs, (fId, f) =>
              <Item
                key={fId}
                renames={`/frogs/${fId}`}
                label={f.name || fakename('Frog', fId)}
                href={`#/frog/${mId}/${fId}`}
              >
                {map(sensors, f.sensors, (sId, s) =>
                  <Item
                    key={sId}
                    renames={`/sensors/${sId}`}
                    label={s.name || fakename('Sensor', sId)}
                    href={`#/sensor/${mId}/${fId}/${sId}`}
                  />
                )}
              </Item>
            )}
          </Item>
        )}
      </Item>
    </List>
  )
}