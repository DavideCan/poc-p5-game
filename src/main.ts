import p5 from 'p5'
import Character from './character'
import GameScene from './game-scene'
import Point, { ActivePoint, IPoint } from './point'

export class Game {
    character!: Character
    scene!: GameScene
    cursor!: p5.Image

    offset: number = 0
    scale = 1

    getAdjustedMousePosition(): IPoint {
        return { x: p.mouseX / this.scale + this.offset, y: p.mouseY / this.scale }
    }

    readonly pGame = (p: p5) => {
        p.preload = () => {
            // read game.json
            const gameJson = require('./assets/game.json')

            let cursorImage = gameJson.cursor
            this.cursor = p.loadImage(cursorImage)

            this.scene = new GameScene(
                // [new ActivePoint(120, 120, 30, p.color(255, 0, 0)), new ActivePoint(200, 200, 30, p.color(0, 255, 0))],
                // [
                //     { x: 250, y: 0 }, // Top point
                //     { x: 354, y: 146 }, // Upper right point
                //     { x: 500, y: 178 }, // Right point
                //     { x: 395, y: 290 }, // Lower right point
                //     { x: 417, y: 438 }, // Bottom point
                //     { x: 250, y: 375 }, // Center left point
                //     { x: 83, y: 438 }, // Bottom left point
                //     { x: 105, y: 290 }, // Lower left point
                //     { x: 0, y: 178 }, // Left point
                //     { x: 146, y: 146 }, // Upper left point
                // ].map(p => new Point(p.x, p.y)),

                // numbers are based on the original size of the image
                [new ActivePoint(405, 680, 130, p.color(255, 0, 0)), new ActivePoint(445, 410, 140, p.color(0, 255, 0))],
                [
                    { x: 10, y: 1010 },
                    { x: 10, y: 1536 },
                    { x: 3638, y: 1536 },
                    { x: 3638, y: 1010 },
                ].map(p => new Point(p.x, p.y)),
            )
            this.scene.preload()
        }

        p.setup = () => {
            this.scene.setup()

            // p.createCanvas(window.innerWidth, window.innerHeight)
            p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL)
            addEventListener('resize', event => {
                p.resizeCanvas(window.innerWidth, window.innerHeight)
                this.scale = window.innerHeight / this.scene.originalBackgroundHeight
            })
            this.scale = p.height / this.scene.originalBackgroundHeight
            console.log('setup', this.scale)

            const characterInitialPosition = this.scene.findClosestPointInside(new Point(p.width / 2, p.height / 2))
            this.character = new Character(characterInitialPosition.x, characterInitialPosition.y)
            this.scene.character = this.character
        }
        p.draw = () => {
            this.offset += this.character.x - this.offset - p.width / 2 / this.scale
            const offsetMax = this.scene.background.width - p.width / this.scale
            if (this.offset > offsetMax) {
                this.offset = offsetMax
            }
            if (this.offset < 0) {
                this.offset = 0
            }
            p.translate(-document.body.clientWidth / 2, -document.body.clientHeight / 2)
            p.scale(this.scale)
            p.translate(-this.offset, 0)
            // console.log('draw')
            this.scene.draw()

            // draw cursor
            const adjustedMousePosition = this.getAdjustedMousePosition()
            p.image(this.cursor, adjustedMousePosition.x, adjustedMousePosition.y)
        }
        p.mousePressed = () => {
            console.log('mouse pressed', p.mouseX * this.scale + this.offset, p.mouseY * this.scale)

            this.scene.checkForPointActivation()
        }
    }
}

export const game = new Game()

export const p = new p5(game.pGame, document.body)
