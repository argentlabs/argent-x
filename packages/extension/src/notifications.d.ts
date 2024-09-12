declare namespace chrome.notifications {
  export function getAll(): Promise<Record<string, boolean>>
}
