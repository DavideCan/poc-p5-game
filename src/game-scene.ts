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

    findClosestPointInside(point: IPointP5): IPoint {
        if (this.isPointInsideWalkableArea(point)) {
            console.log('point is inside walkable area')
            return point // The given point is already inside the area
        }

        const vertexes = this.walkableArea
            .map((walkableAreaPoint, i) => {
                return { point: walkableAreaPoint, distance: point.distance(walkableAreaPoint), index: i }
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
        console.log(closestPoint)

        return closestPoint || point
    }

    preload() {
        this.background = p.loadImage('assets/img/DALL·E 2023-08-03 03.25.41 - a pixel art background of an adventure game.png')
    }

    setup() {}

    draw() {
        this.background?.resize(0, p.height)

        const offsetMax = this.background.width - p.width
        const characterPercentage = this.character.x / p.width
        this.offset = characterPercentage * offsetMax

        p.translate(-this.offset, 0)
        p.image(this.background!, 0, 0)
        p.fill(255, 255, 255, 125)
        p.beginShape()
        for (let point of this.walkableArea) {
            point.draw()
            p.vertex(point.x, point.y)
        }
        p.endShape(p.CLOSE)
        for (let point of this.activePoints) {
            point.draw()
        }

        this.character.draw()
    }

    getDestination(): IPoint {
        const position = this.findClosestPointInside(new Point(p.mouseX + this.offset, p.mouseY))
        return position
    }

    checkForPointActivation() {
        this.character.destination = this.getDestination()
        for (let point of this.activePoints) {
            if (point.isActivated()) {
                point.color = p.color(0, 0, 255)
            }
        }
    }
}
