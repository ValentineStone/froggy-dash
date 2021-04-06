import styled from 'styled-components'
import { useCallback, useRef } from 'react'

const Root = styled.div<{
  _zIndex: number
  _background: any,
}>`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background: ${props => props._background};
  z-index: ${props => props._zIndex};
`
const RootDrawer = styled.div<{
  _size: number,
  _vert: any,
  _orientation: string,
  _open: boolean,
  _transisiton: string,
}>`
  position: absolute;
  height: ${props => props._vert ? props._size + 'px' : '100%'};
  width:  ${props => props._vert ? '100%' : props._size + 'px'};
  ${props => props._vert ? 'left: 0' : 'top: 0'};
  ${props => props._orientation}: 0;
  transition: ${props => 'margin-' + props._orientation + ' ' + props._transisiton};
`
const getOrientation = (right, left, top, bottom) =>
  right ? 'right'
    : left ? 'left'
      : top ? 'top'
        : bottom ? 'bottom'
          : undefined

const cap = str => str.charAt(0).toUpperCase() + str.slice(1)

export default function OverlayView({
  open = false,
  right = false,
  left = false,
  top = false,
  bottom = false,
  size = 0,
  zIndex = 1,
  children,
  classNameRoot = undefined,
  classNameDrawer = undefined,
  onClose = undefined,
  transitionDuration = '225ms',
  transitionTimingFunction = 'ease',
  backdropColor = 'rgba(0,0,0,0.5)',
  backdropColorClosed = 'rgba(0,0,0,0)'
}) {
  const transition = `${transitionDuration} ${transitionTimingFunction} 0s`
  const transitionRoot = `visibility 0s linear ${open ? '0s' : transitionDuration}, background ${transition}`
  const backdropRef = useRef(null)
  const handleBackdropClick = useCallback(event => {
    if (event.target === backdropRef.current)
      onClose?.(event)
  }, [onClose])
  const orientation = getOrientation(right, left, top, bottom)
  return (
    <Root
      ref={backdropRef}
      _zIndex={zIndex}
      _background={open ? backdropColor : backdropColorClosed}
      className={classNameRoot}
      onClick={handleBackdropClick}
      style={{
        visibility: open ? 'visible' : 'hidden',
        transition: transitionRoot
      }}
    >
      <RootDrawer
        _size={size}
        _orientation={orientation}
        _vert={top || bottom}
        _open={open}
        _transisiton={transition}
        className={classNameDrawer}
        style={{ ['margin' + cap(orientation)]: open ? 0 : `-${size}px` }}
      >
        {children}
      </RootDrawer>
    </Root>
  )
}