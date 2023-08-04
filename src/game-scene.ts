import p5 from 'p5'

import Point, { ActivePoint, IPoint, IPointP5 } from './point'
import { p } from './main'
import Character from './character'

export default class GameScene {
    activePoints: ActivePoint[]
    background!: p5.Image
    walkableArea: Point[]
    offset: number = 0
    character!: Character

    originalHeight = 0
    scale = 1

    constructor(activePoints: ActivePoint[], walkableArea: Point[]) {
        this.activePoints = activePoints
        if (walkableArea.length < 3) {
            throw new Error('walkableArea must contain at least 3 points')
        }
        this.walkableArea = walkableArea
    }

    isPointInsideWalkableArea(point: IPoint): boolean {
        let isInside = false
        const numPoints = this.walkableArea.length
        let j = numPoints - 1

        for (let i = 0; i < numPoints; i++) {
            const vertexI = this.walkableArea[i]
            const vertexJ = this.walkableArea[j]

            if (
                vertexI.y > point.y !== vertexJ.y > point.y && // the point is between the two vertex in the y axis
                point.x < ((vertexJ.x - vertexI.x) * (point.y - vertexI.y)) / (vertexJ.y - vertexI.y) + vertexI.x // the point is on the left of the line
            ) {
                isInside = !isInside
            }

            j = i
        }

        return isInside
    }

    findClosestPointInside(point: IPoint): IPoint {
        if (this.isPointInsideWalkableArea(point)) {
            console.log('point is inside walkable area')
            return point // The given point is already inside the area
        }

        const vertexes = this.walkableArea
            .map((walkableAreaPoint, i) => {
                return { point: walkableAreaPoint, distance: walkableAreaPoint.distance(point), index: i }
            })
            .sort((a, b) => a.distance - b.distance)
        const vertex1 = vertexes[0]
        const point1 = vertex1.point
        const index1 = vertex1.index

        const index2_1 = (index1 + 1) % this.walkableArea.length
        const index2_2 = (index1 - 1 + this.walkableArea.length) % this.walkableArea.length

        const point2_1 = this.walkableArea[index2_1]
        const point2_2 = this.walkableArea[index2_2]

        const distancePercentage_1 = vertex1.distance / (vertex1.distance + point2_1.distance(point))
        const closestPoint_1 = { x: point1.x + distancePercentage_1 * (point2_1.x - point1.x), y: point1.y + distancePercentage_1 * (point2_1.y - point1.y) }

        const distancePercentage_2 = vertex1.distance / (vertex1.distance + point2_2.distance(point))
        const closestPoint_2 = { x: point1.x + distancePercentage_2 * (point2_2.x - point1.x), y: point1.y + distancePercentage_2 * (point2_2.y - point1.y) }

        const distance_1 = p.dist(closestPoint_1.x, closestPoint_1.y, point.x, point.y)
        const distance_2 = p.dist(closestPoint_2.x, closestPoint_2.y, point.x, point.y)
        if (distance_1 < distance_2) {
            return closestPoint_1
        }
        return closestPoint_2
    }

    preload() {
        this.background = p.loadImage('assets/img/DALL·E 2023-08-03 03.25.41 - a pixel art background of an adventure game.png')
    }

    resize() {
        this.scale = window.innerHeight / this.originalHeight
    }

    setup() {
        this.originalHeight = this.background.height
        this.scale = p.height / this.originalHeight
        console.log('setup', this.scale)
    }

    draw() {
        this.offset += this.character.x - this.offset - p.width / 2 / this.scale
        const offsetMax = this.background.width - p.width / this.scale
        if (this.offset > offsetMax) {
            this.offset = offsetMax
        }
        if (this.offset < 0) {
            this.offset = 0
        }
        p.scale(this.scale)
        // p.translate(-document.body.clientWidth / 2, -document.body.clientHeight / 2)
        p.translate(-this.offset, 0)

        p.image(this.background!, 0, 0)

        // draw walkable area
        p.fill(255, 255, 255, 125)
        p.beginShape()
        for (let point of this.walkableArea) {
            point.draw()
            p.vertex(point.x, point.y)
        }
        p.endShape(p.CLOSE)

        // draw active points if the mouse is inside the active point itself
        for (let point of this.activePoints) {
            if (point.isActivated(this.getAdjustedMousePosition())) {
                point.draw()
            }
            // point.draw()
        }

        // draw cursor
        p.fill(255, 0, 0, 255)
        const adjustedMousePosition = this.getAdjustedMousePosition()
        p.ellipse(adjustedMousePosition.x, adjustedMousePosition.y, 10, 10)

        this.character.draw()
    }

    getDestination(): IPoint {
        const position = this.findClosestPointInside(this.getAdjustedMousePosition())
        // this.activePoints.push(new ActivePoint(position.x, position.y, 50, p.color(255, 0, 0, 255)))

        return position
    }

    getAdjustedMousePosition(): IPoint {
        return { x: p.mouseX / this.scale + this.offset, y: p.mouseY / this.scale }
    }

    checkForPointActivation() {
        this.character.destination = this.getDestination()
        for (let point of this.activePoints) {
            if (point.isActivated(this.getAdjustedMousePosition())) {
                point.color = p.color(0, 0, 255)
            }
        }
    }
}
