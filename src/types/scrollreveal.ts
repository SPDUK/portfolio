// for some reason the @types package is wrong? so putting slightly custom types here
interface ScrollRevealRotateObject {
  x?: number
  y?: number
  z?: number
}

interface ScrollRevealPositionObject {
  top?: number
  right?: number
  bottom?: number
  left?: number
}

interface ScrollRevealObjectOptions {
  origin?: string
  distance?: string
  duration?: number
  delay?: number
  interval?: number
  rotate?: ScrollRevealRotateObject
  opacity?: number
  scale?: number
  easing?: string
  container?: any
  mobile?: boolean
  reset?: boolean
  useDelay?: string
  viewFactor?: number
  viewOffset?: ScrollRevealPositionObject
  beforeReveal?(domEl: HTMLElement | NodeListOf<Element>): void
  afterReveal?(domEl: HTMLElement | NodeListOf<Element>): void
  beforeReset?(domEl: HTMLElement | NodeListOf<Element>): void
  afterReset?(domEl: HTMLElement | NodeListOf<Element>): void
}

export interface ScrollRevealObject {
  (): ScrollRevealObject
  (options: ScrollRevealObjectOptions): ScrollRevealObject
  reveal(
    selector: string | HTMLElement | NodeListOf<Element>
  ): ScrollRevealObject
  reveal(
    selector: string | HTMLElement | NodeListOf<Element>,
    interval: number
  ): ScrollRevealObject
  reveal(
    selector: string | HTMLElement | NodeListOf<Element>,
    options: ScrollRevealObjectOptions
  ): ScrollRevealObject
  reveal(
    selector: string | HTMLElement | NodeListOf<Element>,
    options: ScrollRevealObjectOptions,
    interval: number
  ): ScrollRevealObject

  sync(): void
  destroy: () => void
}
