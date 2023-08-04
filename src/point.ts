import p5 from 'p5'
import { p } from './main'

export interface IPoint {
    x: number
    y: number
}

export interface IPointP5 extends IPoint {
    distance(point: IPoint): number
    draw(): void
}

export default class Point implements IPointP5 {
    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    distance(point: IPoint): number {
        return p.dist(this.x, this.y, point.x, point.y)
    }

    draw(): void {
        p.ellipse(this.x, this.y, 5, 5)
    }
}

export class ActivePoint implements IPointP5 {
    x: number
    y: number
    diameter: number
    color: p5.Color

    constructor(x: number, y: number, diameter: number, color: p5.Color) {
        this.x = x
        this.y = y
        this.diameter = diameter
        this.color = color
    }

    distance(point: IPoint): number {
        return p.dist(this.x, this.y, point.x, point.y)
    }

    draw() {
        p.fill(this.color)
        p.ellipse(this.x, this.y, this.diameter, this.diameter)
    }

    isActivated(mousePosition: IPoint): boolean {
        let d = p.dist(mousePosition.x, mousePosition.y, this.x, this.y)
        return d < this.diameter / 2
    }
}
