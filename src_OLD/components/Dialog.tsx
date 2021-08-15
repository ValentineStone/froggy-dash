import styled from 'styled-components'
import { useCallback, useRef } from 'react'

const Root = styled.div<{
  _zIndex: number,
  _background: any,
}>`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background: ${props => props._background};
  z-index: ${props => props._zIndex};

  display: flex;
  align-items: center;
  justify-content: center;
`
const RootDialog = styled.div<{
  _transition: any,
}>`
  transition: opacity ${props => props._transition};
`

export default function OverlayView({
  open = false,
  zIndex = 1,
  children,
  classNameRoot = undefined,
  classNameDialog = undefined,
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
      onClose?.(false)
  }, [onClose])
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
      <RootDialog
        _transition={transition}
        className={classNameDialog}
        style={{ opacity: open ? 1 : 0 }}
      >
        {children}
      </RootDialog>
    </Root>
  )
}