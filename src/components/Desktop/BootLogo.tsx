import React, { useId } from 'react'

const logoClips = {
  sweep:
    '90,30 375,30 375,117 178,117 178,139 204,173 271,203 342,235 374,267 371,280 367,290 362,298 355,306 346,312 336,317 316,320 308,300 277,277 204,247 140,224 90,185',
  cap: '178,117 334,117 334,139 309,160 271,160 271,203 204,173 204,146 178,139',
  bowl: '271,160 444,160 444,356 271,356 271,317 316,317 336,317 346,312 355,306 362,298 367,290 371,280 374,267 366,220 334,200 271,200',
  heel: '65,280 174,280 174,318 200,382 205,382 205,431 65,431',
  base: '205,247 277,277 271,280 271,356 383,356 383,479 168,479 168,431 205,431',
}
const pieces = ['spine', 'heel', 'bowl', 'sweep']

export function BootLogo() {
  const id = useId().replace(/:/g, '')
  return (
    <svg className="os-boot-logo" viewBox="0 0 512 512" aria-hidden="true">
      <defs>
        <clipPath id={`${id}-spine`} clipPathUnits="userSpaceOnUse">
          <polygon points={logoClips.cap} />
          <polygon points={logoClips.base} />
        </clipPath>
        <clipPath id={`${id}-heel`} clipPathUnits="userSpaceOnUse">
          <polygon points={logoClips.heel} />
        </clipPath>
        <clipPath id={`${id}-bowl`} clipPathUnits="userSpaceOnUse">
          <polygon points={logoClips.bowl} />
        </clipPath>
        <clipPath id={`${id}-sweep`} clipPathUnits="userSpaceOnUse">
          <polygon points={logoClips.sweep} />
        </clipPath>
      </defs>
      <g className="os-boot-logo-pieces" data-startup-clock="">
        {pieces.map(piece => (
          <g
            key={piece}
            className={`os-boot-logo-piece os-boot-logo-piece--${piece}`}
            data-startup-clock=""
          >
            <image
              href="/brand/sp-monogram.png"
              width="512"
              height="512"
              clipPath={`url(#${id}-${piece})`}
            />
          </g>
        ))}
      </g>
      <image
        className="os-boot-logo-whole"
        data-startup-clock=""
        href="/brand/sp-monogram.png"
        width="512"
        height="512"
      />
    </svg>
  )
}
