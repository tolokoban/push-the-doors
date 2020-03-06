import React from "react"
import FlatLand from 'flat-land-gl'
import Level from '../logic/level'
import Levels from '../data/level'
import Util from '../util'

import LevelAtlas from '../gfx/atlas-level.png'
import "./App.css"

interface IAppProps {
    className?: string[]
}
interface IAppState {}

export default class App extends React.Component<IAppProps, IAppState> {
    private refCanvas1 = React.createRef<HTMLCanvasElement>()
    state = {}

    async componentDidMount() {
        const canvas = this.refCanvas1.current
        if (!canvas) return

        const scene = new FlatLand.Scene(canvas)
        const atlas = await scene.createAtlasAsync({
            image: LevelAtlas
        })
        console.log("LevelAtlas:", LevelAtlas)
        const camera = new FlatLand.Camera.Cover2D({ size: 1024 })
        console.log("camera:", camera)
        const painter = new FlatLand.Painter.Sprites({ atlas, camera })
        const level = new Level(Levels.Introduction, painter)
        let col = Util.rnd(level.cols)
        let row = Util.rnd(level.rows)
        let [colV, rowV] = Util.rndVector2D()
        const speed = 0.05
        scene.onAnimation = (time: number) => {
            const coords = level.getIsometricCoords(row, col)
            camera.x = coords.x
            camera.y = coords.y

            row += rowV * speed
            col += colV * speed
            if (row < 0) {
                rowV = -rowV
                row = 0
            }
            else if (row > level.rows - 1) {
                rowV = -rowV
                row = level.rows - 1
            }
            if (col < 0) {
                colV = -colV
                col = 0
            }
            else if (col > level.cols - 1) {
                colV = -colV
                col = level.cols - 1
            }
        }
        scene.use([painter])
        scene.start()
    }

    render() {
        return (<div className='App'>
            <canvas ref={this.refCanvas1}></canvas>
        </div>)
    }
}
