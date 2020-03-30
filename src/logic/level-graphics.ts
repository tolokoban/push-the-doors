import { IDataLevel, ISpritesPainter } from '../types'
import Util from '../util'

const ROMBUS_WIDTH = 64
const ROMBUS_HEIGHT = 21

/**
 * In a level like the following, the top left corner is at R=o (row) and C=0 (col).
 * The X is at R=3 and C=9.
 *
 * ##########
 * #      | #
 * # #### + #
 * #k     | X
 * ######-+-#
 *
 *
 */
export default class Level {
    readonly rows: number
    readonly cols: number

    constructor(private dataLevel: IDataLevel, private painter: ISpritesPainter) {
        const data = dataLevel.data
        this.rows = data.length
        this.cols = data.reduce(
            (prv: string, cur: string) => cur.length > prv.length ? cur : prv,
            ""
        ).length
        this.createFixedSprites()
    }

    get name() { return this.dataLevel.name }

    public getIsometricCoords(row: number, col: number) {
        const x = (col - row) * ROMBUS_WIDTH
        const y = (col + row) * ROMBUS_HEIGHT
        const z = (col + row) / 1024
        return { x, y, z }
    }

    /**
     * All the sprites for elements of the level that don't move.
     * For instance walls and center of doors.
     */
    private createFixedSprites() {
        this.forEachCell((row: number, col: number, type: string) => {
            switch(type) {
                case WALL: return this.addWallSprite(row, col)
            }
        })
    }

    /**
     * Create a sprite for a wall and add it to the painter.
     */
    private addWallSprite(row: number, col: number) {
        const { painter } = this
        // Walls are the most displayed cells.
        // We want to add diversity.
        // That's why we have 8 models of walls.
        const model = Util.rnd(8) / 8
        const sprite = {
            ...this.getIsometricCoords(row, col),
            width: 128,
            height: 128,
            originX: 64,
            originY: 64 + 32,
            u0: model,
            u1: model + 1/8,
            v0: 0,
            v1: 1/8,
            angle: 0,
            scale: 1
        }
        painter.createSprite(sprite)
    }

    /**
     * For each cell of this level, call function action(row, col, type).
     */
    private forEachCell(action: ICellAction) {
        const { data } = this.dataLevel
        for (let row = 0 ; row < data.length ; row++) {
            const line = data[row]
            for (let col = 0 ; col < line.length ; col++) {
                action(row, col, line.charAt(col))
            }
        }
    }
}


const WALL = '#'
const TURN = 'O'
const TURN_KEY = '+'

type ICellAction = (row: number, col: number, type: string) => void

interface ISprite {
  x: number
  y: number
  z: number
  width: number
  height: number
  originX: number
  originY: number
  u0: number
  v0: number
  u1: number
  v1: number
  scale: number
  angle: number
}
