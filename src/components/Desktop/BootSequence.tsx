import React, { useEffect, useRef } from 'react'
import type { StartupPhase } from './startup'
import { BootLogo } from './BootLogo'
import './boot-sequence.css'

interface CharacterStyle extends React.CSSProperties {
  '--char-start': string
  '--char-span': string
}
interface StepStyle extends React.CSSProperties {
  '--step-start': string
  '--step-span': string
  '--step-done': string
  '--ready-span'?: string
}

function typingStep(
  text: string,
  start: number,
  duration: number,
  pending: number,
) {
  return {
    text,
    start,
    interval: duration / Array.from(text).length,
    done: start + duration + pending,
  }
}
type TypingStep = ReturnType<typeof typingStep>

function TypedText({
  text,
  start,
  interval,
}: Pick<TypingStep, 'text' | 'start' | 'interval'>) {
  let index = 0
  const words: string[] = text.match(/\S+|\s+/g) || []
  return (
    <>
      {words.map((word, wordIndex) => {
        if (/^\s+$/.test(word)) {
          index += Array.from(word).length
          return word
        }
        return (
          <span className="os-boot-word" key={wordIndex}>
            {Array.from(word).map(character => {
              const characterIndex = index
              index += 1
              const style: CharacterStyle = {
                '--char-start': `${start + characterIndex * interval}ms`,
                '--char-span': `${interval}ms`,
              }
              return (
                <span
                  className="os-boot-char"
                  data-startup-clock=""
                  style={style}
                  key={characterIndex}
                >
                  {character}
                </span>
              )
            })}
          </span>
        )
      })}
    </>
  )
}

function BootStep({
  className,
  step,
  paragraphRef,
  finalHold,
}: {
  className: string
  step: TypingStep
  paragraphRef?: React.Ref<HTMLParagraphElement>
  finalHold?: number
}) {
  const style: StepStyle = {
    '--step-start': `${step.start}ms`,
    '--step-span': `${step.done - step.start}ms`,
    '--step-done': `${step.done}ms`,
    ...(finalHold === undefined
      ? {}
      : { '--ready-span': `${step.done - step.start + finalHold}ms` }),
  }
  return (
    <p
      className={className}
      style={style}
      ref={paragraphRef}
      data-startup-clock={finalHold === undefined ? undefined : ''}
    >
      <span className="os-boot-marker">
        <span className="os-boot-pending" data-startup-clock="">
          [ .. ]
        </span>
        <span className="os-boot-done" data-startup-clock="">
          [ ok ]
        </span>
      </span>
      <strong>
        <TypedText {...step} />
      </strong>
    </p>
  )
}

interface BootSequenceProps {
  phase: StartupPhase
  ready: boolean
  workspace: string
  destination: string
  restored: boolean
  onReveal: () => void
  onComplete: () => void
}

export function BootSequence({
  phase,
  ready,
  workspace,
  destination,
  restored,
  onReveal,
  onComplete,
}: BootSequenceProps) {
  const status = useRef<HTMLDivElement>(null)
  const readyLine = useRef<HTMLParagraphElement>(null)
  const command = typingStep('open steve.portfolio', 600, 300, 0)
  const starting = typingStep('start SPDEV OS', command.done + 50, 160, 130)
  const workspaceStep = typingStep(
    `${restored ? 'restore' : 'load'} workspace: ${workspace}`,
    starting.done + 50,
    220,
    130,
  )
  const destinationStep = typingStep(
    `open ${destination}`,
    workspaceStep.done + 50,
    340,
    130,
  )
  const readyStep = typingStep(
    'session ready',
    destinationStep.done + 50,
    150,
    130,
  )
  useEffect(() => {
    if (ready && phase === 'presenting')
      status.current?.focus({ preventScroll: true })
  }, [ready, phase])
  if (phase === 'complete') return null
  return (
    <div
      className="os-boot"
      data-startup-clock=""
      ref={status}
      role="status"
      tabIndex={-1}
      aria-live="polite"
      aria-atomic="true"
      aria-label="Opening Steve's portfolio"
      onAnimationEnd={event => {
        if (
          event.animationName === 'os-boot-ready' &&
          event.target === readyLine.current
        )
          onReveal()
        if (
          event.animationName === 'os-cover-out' &&
          event.target === event.currentTarget
        )
          onComplete()
      }}
    >
      <div className="os-boot-power" data-startup-clock="" aria-hidden="true" />
      <div className="os-boot-console" data-startup-clock="">
        <div className="os-boot-identity" aria-hidden="true">
          <BootLogo />
          <h1 data-startup-clock="">
            SPDEV<span>OS</span>
          </h1>
        </div>
        <div className="os-boot-transcript" aria-hidden="true">
          <p className="os-boot-prompt" data-startup-clock="">
            <span className="os-boot-marker" />
            <strong>steve@spdev:~/portfolio</strong>
          </p>
          <p className="os-boot-command">
            <span className="os-boot-marker" data-startup-clock="">
              $
            </span>
            <strong>
              <TypedText {...command} />
            </strong>
          </p>
          <BootStep className="os-boot-starting" step={starting} />
          <BootStep className="os-boot-workspace" step={workspaceStep} />
          <BootStep className="os-boot-destination" step={destinationStep} />
          <BootStep
            className="os-boot-ready"
            step={readyStep}
            paragraphRef={readyLine}
            finalHold={210}
          />
        </div>
        <p className="os-sr-only">
          Opening {destination} in the {workspace} workspace.
        </p>
      </div>
    </div>
  )
}
