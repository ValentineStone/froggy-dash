import styled from 'styled-components'
import { Children } from 'react'
const Root = styled.div<{ vert: any }>`
  display: flex;
  flex-direction: ${props => props.vert ? 'column' : 'row'};
`
const RootWide = styled.div`
  flex-grow: 1;
`
const RootSlim = styled.div<{ _size: number, vert: any }>`
  flex-shrink: 0;
  ${props => (props.vert ? 'height' : 'width') + ':' + props._size + 'px'};
`

export default function SplitView({
  right = false,
  left = false,
  top = false,
  bottom = false,
  size = 0,
  hidden = false,
  children,
  classNameRoot = undefined,
  classNameSlim = undefined,
  classNameWide = undefined
}) {
  children = Children.toArray(children)
  const slim = !hidden && (
    <RootSlim _size={size} vert={top || bottom} className={classNameSlim}>
      {children[(left || top) ? 0 : 1]}
    </RootSlim>
  )
  const wide = (
    <RootWide className={classNameWide}>
      {children[(right || bottom) ? 0 : 1]}
    </RootWide>
  )
  const root = (left || top)
    ? <Root className={classNameRoot} vert={top || bottom}>{slim}{wide}</Root>
    : <Root className={classNameRoot} vert={top || bottom}>{wide}{slim}</Root>
  return root
}