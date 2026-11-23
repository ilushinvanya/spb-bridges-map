declare global {
  interface Window {
    map: any
    bridges_map_layer: any
    ym: (counterId: number, method: string, ...args: any[]) => void
  }
}

export {}
