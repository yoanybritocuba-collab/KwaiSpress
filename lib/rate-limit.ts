/**
 * Limitador de intentos en memoria (por instancia del servidor).
 * Es una defensa adicional; el bloqueo "fuerte" del código del panel se
 * guarda en la base de datos (admin_settings).
 */
type Entry = { count: number; lockedUntil: number }

const store = new Map<string, Entry>()

export const MAX_ATTEMPTS = 5
export const LOCK_MS = 15 * 60 * 1000

export function checkLock(key: string): { locked: boolean; minutesLeft: number } {
  const entry = store.get(key)
  if (!entry || entry.lockedUntil <= Date.now()) {
    return { locked: false, minutesLeft: 0 }
  }
  return {
    locked: true,
    minutesLeft: Math.ceil((entry.lockedUntil - Date.now()) / 60000),
  }
}

export function registerFailure(key: string): { locked: boolean; remaining: number } {
  const now = Date.now()
  const prev = store.get(key)
  const base = prev && prev.lockedUntil > now ? prev : { count: prev?.count ?? 0, lockedUntil: 0 }
  const count = base.count + 1

  if (count >= MAX_ATTEMPTS) {
    store.set(key, { count: 0, lockedUntil: now + LOCK_MS })
    return { locked: true, remaining: 0 }
  }

  store.set(key, { count, lockedUntil: 0 })
  return { locked: false, remaining: MAX_ATTEMPTS - count }
}

export function registerSuccess(key: string) {
  store.delete(key)
}
