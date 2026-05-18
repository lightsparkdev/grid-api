import { randomUUID } from './uuid'

const KEY = 'grid-sample-session-id'

export function getSessionId(): string {
  let id = sessionStorage.getItem(KEY)
  if (!id) {
    id = randomUUID()
    sessionStorage.setItem(KEY, id)
  }
  return id
}
