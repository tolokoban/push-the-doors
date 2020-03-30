

export enum EnumCellType {

}

export interface ICell {
    type: EnumCellType
}

export default class Level {
    private readonly _cols: number
    private readonly _rows: number

    constructor(rows: number, cols: number) {
        this._cols = cols
        this._rows = rows
    }

    get cols() { return this._cols }
    get rows() { return this._rows }


}
