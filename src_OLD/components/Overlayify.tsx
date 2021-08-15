import styled from 'styled-components'
import {cx} from '../utils'

const OverlayifyProxy = styled(({ className, extraClassName, children }) => {
  return children(cx(className, extraClassName))
}) <{
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

export default function Overlayify({
  right = false,
  left = false,
  top = false,
  bottom = false,
  size = 0,
  zIndex = 1,
  hidden = false,
  children = undefined,
  className = undefined,
}) {
  return (
    <OverlayifyProxy
      hidden={hidden}
      _zIndex={zIndex}
      _size={size}
      _orientation={getOrientation(right, left, top, bottom)}
      vert={top || bottom}
      extraClassName={className}
      children={children}
    />
  )
}