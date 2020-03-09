import React from 'react'
import Tfw from 'tfw'

import FileSystemService from './service/file-system'

import './App.css'

const Path = window.require("path")


Tfw.Theme.register("default", {
    bg0: '#bcd',
    bg3: '#fff',
    bgP: '#0f71b7'
})
Tfw.Theme.apply("default")


interface IState { }

class App extends React.Component<{}, IState> {
    private refCanvas = React.createRef<HTMLCanvasElement>()

    async componentDidMount() {
        const canvas = this.refCanvas.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        for (let index = 1 ; index < 9 ; index++) {
            //const filename = `../sprites/000${index}.png`
            const filename = Path.resolve(`../blender/sprites/000${index}.png`)
            const img = await FileSystemService.createImageFromFile(filename)
            ctx.drawImage(img, Math.floor(canvas.width * (index - 1) / 8), 0)
        }

        const dataURL = canvas.toDataURL("image/png")
        const commaPosition = dataURL.indexOf(',')
        const base64 = dataURL.substr(commaPosition + 1)
        const data = atob(base64)
        const len = data.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = data.charCodeAt(i);
        }
        const filename = Path.resolve("../../src/gfx/atlas-level.png")
        await FileSystemService.save(filename, bytes)

        Tfw.Factory.Dialog.alert(<div>
            Files generated:
            <ul>
                <li>{filename}</li>
            </ul>
        </div>)
    }

    render() {
        console.log(Path.resolve("."))

        return (
            <div className="App thm-bg0">
                <canvas className="thm-ele-nav"
                    ref={this.refCanvas}
                    width={2048} height={2048}></canvas>
            </div>
        )
    }
}

export default App
