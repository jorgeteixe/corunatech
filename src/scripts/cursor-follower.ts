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
] as const

const STICKER_BORDERS = [
  'border-simple',
  'border-double',
  'border-dotted',
  'border-dashed'
] as const

const STICKER_COLORS = [
  'border-color-1',
  'border-color-2',
  'border-color-3',
  'border-color-4',
  'border-color-5'
] as const

const ANIMATION_SPEED = 0.1
const BORDER_MARGIN = 10
const FALLBACK_IMAGE = '/placeholder.png'

const getRandomElement = <T>(array: readonly T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

const getRandomRotation = (): number => {
  return Math.random() * 30 - 15
}

const createStickerElement = (config: StickerConfig): HTMLElement => {
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
  stickerImage.onerror = function (this: HTMLImageElement) {
    this.src = FALLBACK_IMAGE
    console.error('Error cargando logo:', config.logo)
  }

  outerContainer.appendChild(stickerImage)
  return outerContainer
}

const animateSticker = (element: HTMLElement, rotation: number): void => {
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

const adjustFollowerPosition = (
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

const checkSpecialButton = (
  target: EventTarget | null,
  follower: HTMLElement
): boolean => {
  if (!(target instanceof Element)) return false

  const specialButton = target.closest(
    '[data-cursor-message]'
  ) as HTMLElement | null
  const textSpan = follower.querySelector('.cursor-text') as HTMLElement | null

  if (specialButton && textSpan) {
    textSpan.textContent = specialButton.dataset.cursorMessage || 'click'
    return true
  } else if (textSpan) {
    textSpan.textContent = 'click'
    return false
  }

  return false
}

const initializeCursorFollower = (communityLogos: string[]): void => {
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

  const handleMouseMove = (e: MouseEvent): void => {
    state.cursorX = e.clientX
    state.cursorY = e.clientY

    const target = e.target
    state.isOverSlider = !!(
      target instanceof Element && target.closest('.events-section')
    )
    state.isOverSpecialButton = checkSpecialButton(target, follower)

    follower.style.opacity = state.isOverSlider ? '0' : '1'
  }

  const updateFollowerPosition = (): void => {
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

  const handleClick = (e: MouseEvent): void => {
    const target = e.target
    const textSpan = follower.querySelector(
      '.cursor-text'
    ) as HTMLElement | null

    if (textSpan && !state.isOverSlider) {
      textSpan.textContent = 'click!'
      setTimeout(() => {
        textSpan.textContent = 'click'
      }, 1000)
    }

    if (
      target instanceof Element &&
      (target.closest('a, button') || state.isOverSlider)
    ) {
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

// Extend Window interface
declare global {
  interface Window {
    initializeCursorFollower: (communityLogos: string[]) => void
  }
}

// Make function available globally with proper typing
;(window as any).initializeCursorFollower = initializeCursorFollower

// Export to make this a module
export {}
