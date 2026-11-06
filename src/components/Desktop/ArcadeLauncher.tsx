import React, { useEffect, useRef } from 'react'
import { ArrowDown, ArrowUp, CornerDownLeft, Triangle } from 'lucide-react'
import { games } from './arcadeCatalog'
import type { GameId } from './arcadeCatalog'
import './arcade-launcher.css'

interface ArcadeLauncherProps {
  active: boolean
  selected: GameId
  onSelect: (game: GameId) => void
  onLaunch: () => void
  onExit?: () => void
}

export default function ArcadeLauncher({
  active,
  selected,
  onSelect,
  onLaunch,
  onExit,
}: ArcadeLauncherProps) {
  const root = useRef<HTMLElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const options = useRef(new Map<GameId, HTMLButtonElement>())
  const wheelState = useRef({ amount: 0, last: -Infinity })
  const selectedIndex = games.findIndex(game => game.id === selected)
  const game = games.find(item => item.id === selected) ?? games[0]

  useEffect(() => {
    const element = root.current
    if (!element || !active) return undefined
    const keydown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return
      let index = selectedIndex
      if (event.key === 'ArrowUp') index -= 1
      else if (event.key === 'ArrowDown') index += 1
      else if (event.key === 'Home') index = 0
      else if (event.key === 'End') index = games.length - 1
      else if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onExit?.()
        return
      } else if (event.key === 'Enter') {
        if (
          event.target instanceof Element &&
          event.target.closest('.os-crt-start')
        )
          return
        event.preventDefault()
        onLaunch()
        return
      } else return
      event.preventDefault()
      event.stopPropagation()
      const next = games[(index + games.length) % games.length]
      if (!next) return
      onSelect(next.id)
      options.current.get(next.id)?.focus({ preventScroll: true })
    }
    element.addEventListener('keydown', keydown)
    return () => element.removeEventListener('keydown', keydown)
  }, [active, selectedIndex, onSelect, onLaunch, onExit])

  useEffect(() => {
    const list = menu.current
    if (!list || !active) return undefined
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY))
        return
      event.preventDefault()
      const state = wheelState.current
      if (event.timeStamp - state.last < 180) return
      let delta = event.deltaY
      if (event.deltaMode === 1) delta *= 16
      else if (event.deltaMode === 2) delta *= list.clientHeight
      if (Math.sign(delta) !== Math.sign(state.amount)) state.amount = 0
      state.amount += delta
      if (Math.abs(state.amount) < 36) return
      const next =
        games[
          (selectedIndex + Math.sign(state.amount) + games.length) %
            games.length
        ]
      if (next) onSelect(next.id)
      state.amount = 0
      state.last = event.timeStamp
    }
    list.addEventListener('wheel', wheel, { passive: false })
    return () => list.removeEventListener('wheel', wheel)
  }, [active, selectedIndex, onSelect])

  useEffect(() => {
    const list = menu.current
    const option = options.current.get(selected)
    if (!list || !option) return
    const revealSelection = () => {
      const listBounds = list.getBoundingClientRect()
      const optionBounds = option.getBoundingClientRect()
      if (optionBounds.top < listBounds.top)
        list.scrollTop -= listBounds.top - optionBounds.top
      else if (optionBounds.bottom > listBounds.bottom)
        list.scrollTop += optionBounds.bottom - listBounds.bottom
    }
    revealSelection()
    const observer = new ResizeObserver(revealSelection)
    observer.observe(list)
    return () => observer.disconnect()
  }, [selected])

  return (
    <section ref={root} className="os-crt" aria-label="Game select">
      <img
        className="os-crt-bezel"
        src="/arcade/crt-bezel.png"
        alt=""
        aria-hidden="true"
        width="1586"
        height="992"
        draggable={false}
      />
      <div className="os-crt-screen">
        <header className="os-crt-header">
          <div className="os-crt-brand">
            <span aria-hidden="true" />
            <h1>SPDEV ARCADE</h1>
            <span aria-hidden="true" />
          </div>
          <p>Select your game</p>
        </header>

        <div className="os-crt-main">
          <div
            ref={menu}
            className="os-crt-menu"
            role="radiogroup"
            tabIndex={-1}
            aria-label="Choose a game"
            aria-orientation="vertical"
          >
            {games.map(item => (
              <button
                key={item.id}
                ref={element => {
                  if (element) options.current.set(item.id, element)
                  else options.current.delete(item.id)
                }}
                type="button"
                role="radio"
                aria-checked={selected === item.id}
                tabIndex={selected === item.id ? 0 : -1}
                onClick={() => onSelect(item.id)}
              >
                <Triangle
                  className="os-crt-pointer"
                  size={16}
                  aria-hidden="true"
                />
                {item.label}
              </button>
            ))}
          </div>

          <div className="os-crt-detail" aria-live="polite" aria-atomic="true">
            <figure className="os-crt-preview">
              <figcaption>Preview</figcaption>
              <img
                key={game.id}
                src={`/arcade/${game.id}.png`}
                alt={`${game.label} pixel artwork`}
                width="543"
                height="362"
                draggable={false}
              />
            </figure>
            <div className="os-crt-description">
              <h2>{game.label}</h2>
              <p>{game.description}</p>
            </div>
            <button className="os-crt-start" type="button" onClick={onLaunch}>
              Start game
            </button>
          </div>
        </div>

        <footer className="os-crt-footer">
          <div className="os-crt-legend" aria-hidden="true">
            <span>
              <kbd>
                <ArrowUp size={16} />
              </kbd>
              <kbd>
                <ArrowDown size={16} />
              </kbd>{' '}
              Select
            </span>
            <span>
              <kbd>
                <CornerDownLeft size={17} />
              </kbd>{' '}
              Start
            </span>
            <span>
              <kbd>ESC</kbd> Back
            </span>
          </div>
          <span
            className="os-crt-index"
            aria-label={`Game ${selectedIndex + 1} of ${games.length}`}
          >
            {String(selectedIndex + 1).padStart(2, '0')} /{' '}
            {String(games.length).padStart(2, '0')}
          </span>
        </footer>
      </div>
    </section>
  )
}
