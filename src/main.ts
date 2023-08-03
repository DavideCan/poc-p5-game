import p5 from 'p5'
import Character from './character'
import GameScene from './game-scene'
import Point, { ActivePoint } from './point'

let character: Character
let scene: GameScene

const game = (p: p5) => {
    p.preload = () => {
        scene = new GameScene(
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
            [new ActivePoint(120, 120, 30, p.color(255, 0, 0)), new ActivePoint(200, 200, 30, p.color(0, 255, 0))],
            [
                { x: 0, y: 0 },
                { x: 0, y: document.body.clientHeight },
                { x: document.body.clientWidth, y: document.body.clientHeight },
                { x: document.body.clientWidth, y: 0 },
            ].map(p => new Point(p.x, p.y)),
        )
        scene.preload()
    }

    p.setup = () => {
        p.createCanvas(document.body.clientWidth, document.body.clientHeight)
        addEventListener('resize', event => {
            p.resizeCanvas(document.body.clientWidth, document.body.clientHeight)
        })
        scene.setup()
        const characterInitialPosition = scene.findClosestPointInside(new Point(p.width / 2, p.height / 2))
        character = new Character(characterInitialPosition.x, characterInitialPosition.y)
        scene.character = character
    }
    p.draw = () => {
        // console.log('draw')
        scene.draw()
    }
    p.mousePressed = () => {
        scene.checkForPointActivation()
    }
}

export const p = new p5(game, document.body)
