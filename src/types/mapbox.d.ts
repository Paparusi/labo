// Fix for @types/mapbox__point-geometry missing index.d.ts
declare module '@mapbox/point-geometry' {
  export default class Point {
    x: number
    y: number
    constructor(x: number, y: number)
  }
}
