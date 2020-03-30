export const DIR_RIGHT = [0, 1]
export const DIR_LEFT = [0, -1]
export const DIR_UP = [1, 0]
export const DIR_DOWN = [-1, 0]

export type IDirection = [
    0 | 1 | -1,
    0 | 1 | -1
]

export enum EnumCellType {
    EMPTY,
    WALL,
    KEY,
    DOOR,
    EXIT
}

export interface IGenericCell {
    type: EnumCellType
}

export type IEmptyCell = IGenericCell
export type IKeyCell = IGenericCell
export type IExitCell = IGenericCell

export interface IWallCell extends IGenericCell {
    // Walls can be drawns in different shapes,
    // but there are still walls.
    instance: number
}

export interface IDoorCell extends IGenericCell {
    // Extends on row - 1 and row + 1 if vertical is true.
    vertical: boolean,
    keyIsNeeded: boolean
}

export type ICell = IEmptyCell | IWallCell | IDoorCell | IKeyCell | IExitCell


export default class Level {
    private _keysCount = 0
    private _cols = 0
    private _rows = 0
    private grid: Array<null | ICell> = []

    constructor(rows: number, cols: number, keysCount: number = 0) {
        this.reset(rows, cols, keysCount)
    }

    reset(rows: number, cols: number, keysCount: number = 0) {
        this._keysCount = keysCount
        this._cols = cols
        this._rows = rows
        this.grid = new Array(cols * rows)
        for (let index = 0; index < this.grid.length; index++) {
            this.grid[index] = { type: EnumCellType.EMPTY }
        }
    }

    get keysCount() { return this._keysCount }
    get cols() { return this._cols }
    get rows() { return this._rows }

    /**
     * Return grid's index for (row,col).
     * If out of the grid, return -1.
     */
    getIndex(row: number, col: number): number {
        if (row < 0 || row >= this.rows) return -1
        if (col < 0 || col >= this.cols) return -1
        return row * this.cols + col
    }

    getCell(row: number, col: number): ICell | null {
        const index = this.getIndex(row, col)
        if (index === -1) return null
        return this.grid[index]
    }

    setEmptyCell(row: number, col: number): boolean {
        const index = this.getIndex(row, col)
        if (index === -1) return false
        this.grid[index] = {
            type: EnumCellType.EMPTY
        }
        return true
    }

    setWallCell(row: number, col: number, instance: number): boolean {
        const index = this.getIndex(row, col)
        if (index === -1) return false
        this.grid[index] = {
            type: EnumCellType.WALL,
            instance
        }
        return true
    }

    setDoorCell(row: number, col: number, vertical: boolean, keyIsNeeded: boolean): boolean {
        const index = this.getIndex(row, col)
        if (index === -1) return false
        this.grid[index] = {
            type: EnumCellType.DOOR,
            vertical,
            keyIsNeeded
        }
        return true
    }

    setKeyCell(row: number, col: number): boolean {
        const index = this.getIndex(row, col)
        if (index === -1) return false
        this.grid[index] = {
            type: EnumCellType.KEY
        }
        return true
    }

    setExitCell(row: number, col: number): boolean {
        const index = this.getIndex(row, col)
        if (index === -1) return false
        this.grid[index] = {
            type: EnumCellType.EXIT
        }
        return true
    }

    /**
     * Normal moves are stopped by walls and doors.
     */
    canMove(row: number, col: number, dir: IDirection): boolean {
        const [vecRow, vecCol] = dir
        const nxtCell = this.getCell(row + vecRow, col + vecCol)
        if (!nxtCell) return false
        switch (nxtCell.type) {
            case EnumCellType.EMPTY:
            case EnumCellType.KEY:
            case EnumCellType.EXIT:
                return true
            default:
                return false
        }
    }

    /**
     * Push moves are stopped by walls, but not always by doors.
     * A door can prevent you from passing only if it needs a key
     * and you have no more key.
     */
    canPush(row: number, col: number, dir: IDirection): boolean {
        if (!this.canMove(row, col, dir)) return false

        const [vecRow, vecCol] = dir
        const nxtRow = row + vecRow
        const nxtCol = col + vecCol
        const nxtCell = this.getCell(nxtRow, nxtCol)
        if (!nxtCell || nxtCell.type !== EnumCellType.DOOR) return false
        if (vecRow === 0) {
            // Moving horizontally.
            //  >|     |
            //   O     O
            //   |    >|
            const upCell = this.getCell(nxtRow + 1, nxtCol)
            if (upCell && upCell.type === EnumCellType.DOOR) {
                return this.canOpenThisDoor(upCell, nxtRow, nxtCol, dir)
            }
            const downCell = this.getCell(nxtRow - 1, nxtCol)
            if (downCell && downCell.type === EnumCellType.DOOR) {
                return this.canOpenThisDoor(downCell, nxtRow, nxtCol, dir)
            }
        }
        else {
            // Moving vertically.
            // -O-    -O-
            // ^        ^
            const rightCell = this.getCell(nxtRow, nxtCol + 1)
            if (rightCell && rightCell.type === EnumCellType.DOOR) {
                return this.canOpenThisDoor(rightCell, nxtRow, nxtCol, dir)
            }
            const leftCell = this.getCell(nxtRow, nxtCol - 1)
            if (leftCell && leftCell.type === EnumCellType.DOOR) {
                return this.canOpenThisDoor(leftCell, nxtRow, nxtCol, dir)
            }
        }
        return true
    }

    canOpenThisDoor(cell: ICell, armRow: number, armCol: number, dir: IDirection): boolean {
        if (cell.type !== EnumCellType.DOOR) return false
        const rowA = armRow
        const colA = armCol
        const [row00, col00] = dir
        const dirTurned90 = this.rotate90(dir)
        const [row90, col90] = dirTurned90
        const rowB = rowA + 2 * row90
        const colB = colA + 2 * col90
        if (!this.isEmpty(rowA + row00, colA + col00)) return false
        if (!this.isEmpty(rowA + row00 + row90, colA + col00 + row90)) return false
        if (!this.isEmpty(rowB - row00, colB - col00)) return false
        if (!this.isEmpty(rowB - row00 - row90, colB - col00 - row90)) return false
        return true
    }

    isEmpty(row: number, col: number): boolean {
        const cell = this.getCell(row, col)
        if (!cell) return false
        if (cell.type !== EnumCellType.EMPTY) return false
        // @TODO: Test position of monsters and players.
        return true
    }

    rotate90(dir: IDirection): IDirection {
        // @TODO: Rotate the vector of 90 degrees.
    }
}
