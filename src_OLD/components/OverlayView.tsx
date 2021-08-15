import styled from 'styled-components'
import { Children } from 'react'
const Root = styled.div`
  position: relative;
`
const RootMain = styled.div`
  width: 100%;
  height: 100%;
`
const RootOver = styled.div<{
  _size: number,
  vert: any,
  _zIndex: number,
  _orientation: string,
}>`
  position: absolute;
  z-index: ${props => props._zIndex};
  height: ${props => props.vert ? props._size + 'px' : '100%'};
  width:  ${props => props.vert ? '100%' : props._size + 'px'};
  ${props => props.vert ? 'left: 0' : 'top: 0'};
  ${props => props._orientation}: 0;
`
const getOrientation = (right, left, top, bottom) =>
  right ? 'right'
    : left ? 'left'
      : top ? 'top'
        : bottom ? 'bottom'
          : undefined

export default function OverlayView({
  right = false,
  left = false,
  top = false,
  bottom = false,
  size = 0,
  zIndex = 1,
  hidden = false,
  children,
  classNameRoot = undefined,
  classNameMain = undefined,
  classNameOver = undefined,
}) {
  children = Children.toArray(children)
  return (
    <Root className={classNameRoot}>
      <RootMain className={classNameMain}>
        {children[0]}
      </RootMain>
      {!hidden && children[1] &&
        <RootOver
          _zIndex={zIndex}
          _size={size}
          _orientation={getOrientation(right, left, top, bottom)}
          vert={top || bottom}
          className={classNameOver}
        >
          {children[1]}
        </RootOver>
      }
    </Root>
  )
}