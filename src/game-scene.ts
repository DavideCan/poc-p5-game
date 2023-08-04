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

        const vertex2 = vertexes.find(vertex => vertex.index === index2_1 || vertex.index === index2_2) || vertex1
        const point2 = vertex2.point

        const distancePercentage = vertex1.distance / (vertex1.distance + vertex2.distance)
        const closestPoint = { x: point1.x + distancePercentage * (point2.x - point1.x), y: point1.y + distancePercentage * (point2.y - point1.y) }
        return closestPoint || point
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
        // this.background?.resize(0, p.height)
        p.scale(this.scale)

        const offsetMax = this.background.width * this.scale - p.width
        const characterPercentage = (this.character.x * this.scale) / p.width
        this.offset = characterPercentage * offsetMax
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
