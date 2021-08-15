import { useState, useCallback } from 'react'
import { log } from '../utils'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Collapse from '@material-ui/core/Collapse'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'

const ListView = ({ items, collapsable = false, onClick = undefined, href = undefined }) => {
  const [open, setOpen] = useState(true)
  const toggle = useCallback(() => setOpen(open => !open), [])

  const renderedItems = items.map(item => Array.isArray(item) ? (
    <ListView
      key={item[0].id}
      collapsable={item[0].label}
      items={item.slice(1)}
      onClick={item[0].onClick}
      href={item[0].href}
    />
  ) : (
    <ListItem button key={item.id} onClick={item.onClick} component="a" href={item.href}>
      {/*<ListItemIcon><SendIcon /></ListItemIcon>*/}
      <ListItemText primary={item.label} />
    </ListItem>
  ))

  return collapsable === false ? (
    <List>
      {renderedItems}
    </List>
  ) : (
    <>
      <ListItem button onClick={onClick} component="a" href={href}>
        <ListItemText primary={collapsable} />
        {open ? <ExpandLess onClick={toggle} /> : <ExpandMore onClick={toggle} />}
      </ListItem>
      <Collapse in={open} timeout="auto" style={{ paddingLeft: '1em' }}>
        <List>
          {renderedItems}
        </List>
      </Collapse>
    </>
  )
}
export default ListView