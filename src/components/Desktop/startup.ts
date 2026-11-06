export type StartupPhase = 'presenting' | 'revealing' | 'complete'

export const startupTiming = {
  watchdog: 20000,
}

export const startupPrepaintScript = `(() => {
  const root = document.documentElement;
  root.dataset.spdevStartup = 'active';
  window.__spdevStartupTimer = window.setTimeout(() => {
    root.dataset.spdevStartup = 'complete';
    document.querySelectorAll('[data-startup-inert]').forEach(element => {
      element.removeAttribute('inert');
      element.removeAttribute('data-startup-inert');
    });
    window.dispatchEvent(new Event('spdev:startup-watchdog'));
  }, ${startupTiming.watchdog});
})();`

export const startupCriticalCss = `
.os-boot { display: none; }
html:is([data-spdev-startup="active"], [data-spdev-startup="running"]) .os-boot {
  display: flex; position: fixed; inset: 0; z-index: 150; background: #080809;
}
`

declare global {
  interface Window {
    __spdevStartupTimer?: number
  }
}

export function releaseStartupDocument() {
  document.documentElement.dataset.spdevStartup = 'complete'
  window.clearTimeout(window.__spdevStartupTimer)
  window.__spdevStartupTimer = undefined
  document
    .querySelectorAll<HTMLElement>('[data-startup-inert]')
    .forEach(node => {
      node.inert = false
      delete node.dataset.startupInert
    })
}

export function armStartupWatchdog() {
  if (window.__spdevStartupTimer !== undefined) return
  window.__spdevStartupTimer = window.setTimeout(() => {
    releaseStartupDocument()
    window.dispatchEvent(new Event('spdev:startup-watchdog'))
  }, startupTiming.watchdog)
}
