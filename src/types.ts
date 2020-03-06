import FlatLand from 'flat-land-gl'

export class ISpritesPainter extends FlatLand.Painter.Sprites {}

export interface IDataLevel {
    name: string,
    data: string[]
}
