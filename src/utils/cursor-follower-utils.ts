interface StickerConfig {
  logo: string
  position: { x: number; y: number }
  rotation: number
}

interface CursorFollowerState {
  cursorX: number
  cursorY: number
  followerX: number
  followerY: number
  isOverSlider: boolean
  isOverSpecialButton: boolean
}

const STICKER_SHAPES = [
  'shape-circle',
  'shape-rounded',
  'shape-pill',
  'shape-squircle',
  'shape-blob',
  'shape-arch',
  'shape-shield',
  'shape-ticket'
]

const STICKER_BORDERS = [
  'border-simple',
  'border-double',
  'border-dotted',
  'border-dashed'
]

const STICKER_COLORS = [
  'border-color-1',
  'border-color-2',
  'border-color-3',
  'border-color-4',
  'border-color-5'
]

const ANIMATION_SPEED = 0.1
const BORDER_MARGIN = 10
const FALLBACK_IMAGE = '/placeholder.png'

export const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

export const getRandomRotation = (): number => {
  return Math.random() * 30 - 15
}

export const createStickerElement = (config: StickerConfig): HTMLElement => {
  const outerContainer = document.createElement('div')
  const stickerImage = document.createElement('img')

  const randomShape = getRandomElement(STICKER_SHAPES)
  const randomBorder = getRandomElement(STICKER_BORDERS)
  const randomColor = getRandomElement(STICKER_COLORS)

  outerContainer.classList.add(
    'click-sticker',
    randomShape,
    randomBorder,
    randomColor
  )
  outerContainer.style.left = `${config.position.x}px`
  outerContainer.style.top = `${config.position.y}px`
  outerContainer.style.transform = `translate(-50%, -50%) scale(1) rotate(${config.rotation}deg)`

  stickerImage.src = config.logo
  stickerImage.alt = 'Community Logo Sticker'
  stickerImage.classList.add('sticker-image-content')
  stickerImage.onerror = function () {
    this.src = FALLBACK_IMAGE
    console.error('Error cargando logo:', config.logo)
  }

  outerContainer.appendChild(stickerImage)
  return outerContainer
}

export const animateSticker = (
  element: HTMLElement,
  rotation: number
): void => {
  const animation = element.animate(
    [
      {
        transform: `translate(-50%, -50%) scale(0) rotate(${rotation}deg)`
      },
      {
        transform: `translate(-50%, -50%) scale(1) rotate(${rotation}deg)`
      }
    ],
    {
      duration: 200,
      easing: 'ease-out'
    }
  )
  animation.play()
}

export const adjustFollowerPosition = (
  followerX: number,
  followerY: number,
  followerRect: DOMRect
): { x: number; y: number } => {
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight

  let adjustedX = followerX
  let adjustedY = followerY

  if (followerX + followerRect.width > windowWidth) {
    adjustedX = windowWidth - followerRect.width - BORDER_MARGIN
  }

  if (followerX < 0) {
    adjustedX = BORDER_MARGIN
  }

  if (followerY + followerRect.height > windowHeight) {
    adjustedY = windowHeight - followerRect.height - BORDER_MARGIN
  }

  if (followerY < 0) {
    adjustedY = BORDER_MARGIN
  }

  return { x: adjustedX, y: adjustedY }
}

export const checkSpecialButton = (
  target: Element,
  follower: HTMLElement
): boolean => {
  const specialButton = target.closest('[data-cursor-message]')
  const textSpan = follower.querySelector('.cursor-text')

  if (specialButton && textSpan) {
    textSpan.textContent =
      (specialButton as HTMLElement).dataset.cursorMessage || 'click'
    return true
  } else if (textSpan) {
    textSpan.textContent = 'click'
    return false
  }

  return false
}

export const initializeCursorFollower = (communityLogos: string[]): void => {
  const follower = document.getElementById('cursor-follower')
  if (!follower) return

  const state: CursorFollowerState = {
    cursorX: 0,
    cursorY: 0,
    followerX: 0,
    followerY: 0,
    isOverSlider: false,
    isOverSpecialButton: false
  }

  document.addEventListener('clear-stickers', () => {
    const stickers = document.querySelectorAll('.click-sticker')
    stickers.forEach(sticker => sticker.remove())
  })

  const handleMouseMove = (e: MouseEvent) => {
    state.cursorX = e.clientX
    state.cursorY = e.clientY

    const target = e.target as Element
    state.isOverSlider = !!target.closest('.events-section')
    state.isOverSpecialButton = checkSpecialButton(target, follower)

    follower.style.opacity = state.isOverSlider ? '0' : '1'
  }

  const updateFollowerPosition = () => {
    state.followerX += (state.cursorX - state.followerX) * ANIMATION_SPEED
    state.followerY += (state.cursorY - state.followerY) * ANIMATION_SPEED

    const followerRect = follower.getBoundingClientRect()
    const adjustedPosition = adjustFollowerPosition(
      state.followerX,
      state.followerY,
      followerRect
    )

    follower.style.left = `${adjustedPosition.x}px`
    follower.style.top = `${adjustedPosition.y}px`

    requestAnimationFrame(updateFollowerPosition)
  }

  const handleClick = (e: MouseEvent) => {
    const target = e.target as Element
    const textSpan = follower.querySelector('.cursor-text')

    if (textSpan && !state.isOverSlider) {
      textSpan.textContent = 'click!'
      setTimeout(() => {
        textSpan.textContent = 'click'
      }, 1000)
    }

    if (target.closest('a, button') || state.isOverSlider) {
      return
    }

    const randomLogo = getRandomElement(communityLogos)
    const randomRotation = getRandomRotation()

    const stickerConfig: StickerConfig = {
      logo: randomLogo,
      position: { x: e.pageX, y: e.pageY },
      rotation: randomRotation
    }

    const stickerElement = createStickerElement(stickerConfig)
    animateSticker(stickerElement, randomRotation)
    document.body.appendChild(stickerElement)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('click', handleClick)
  updateFollowerPosition()
}
