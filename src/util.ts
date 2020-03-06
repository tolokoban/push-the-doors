export default { rnd, rndVector2D }

/**
 * @return random integer greater or equal to `min` and strictly lower than `max`.
 * If `max` is undefined, the range is considered to be [0, min].
 */
function rnd(min: number, max?: number): number {
    if (typeof max === 'undefined') {
        max = min
        min = 0
    }

    return Math.floor(min + (max - min) * Math.random())
}


function rndVector2D(): [number, number] {
    const angle = 2 * Math.PI * Math.random()
    return [Math.cos(angle), Math.sin(angle)]
}
