import Point, { IPoint, IPointP5 } from './point'
import { p } from './main'

export default class Character implements IPoint {
    x: number
    y: number
    destination: IPoint
    speed: number
    isMoving: boolean

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.destination = new Point(x, y)
        this.speed = 0
        this.isMoving = false
    }

    distance(point: IPoint): number {
        return p.dist(this.x, this.y, point.x, point.y)
    }

    draw() {
        p.fill(255)
        let characterDistance = p.dist(this.x, this.y, this.destination.x, this.destination.y)
        if (characterDistance > 2) {
            this.isMoving = true

            let dirX = this.destination.x - this.x
            let dirY = this.destination.y - this.y
            dirX = dirX / characterDistance
            dirY = dirY / characterDistance
            const displaySize = Math.max(p.displayWidth, p.displayHeight)
            this.speed = (this.distance(this.destination) / displaySize) * 100

            this.x += dirX * this.speed
            this.y += dirY * this.speed
        } else if (this.isMoving) {
            this.isMoving = false
            // this.hasStoppedCallback()
        }

        p.ellipse(this.x, this.y, 50, 50)
    }
}
