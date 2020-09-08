
export class BatchStrategy2DAIO {
    constructor(w=3, h=3) {
        this.w = w
        this.h = h
    }

    get max() {
        return 1
    }

    batch(i) {
        const positions = []

        for (let x = 0; x < this.w; x++) {
            for (let y = 0; y < this.h; y++) {
                positions.push([x, y])
            }
        }

        return positions
    }
}

export class BatchStrategy2D {
    /** Only works with uneven w and h */
    constructor(w=3, h=3) {
        this.w = 3
        this.h = 3
    }

    get max() {
        return 2
    }

    batch(i) {
        if (i === 0) {
            const maxX = this.w - 1
            const maxY = this.h - 1
            return [[maxX / 2, maxY / 2], [0, 0], [0, maxY], [maxX, 0], [maxX, maxY]]
        }
        else {
            const maxX = this.w - 1
            const maxY = this.h - 1
            const positions = []

            for (let x = 0; x < this.w; x++) {
                for (let y = 0; y < this.h; y++) {
                    if ((x === maxX / 2 && y === maxY / 2) ||
                        (x === 0 && y === 0) ||
                        (x === 0 && y === maxY) ||
                        (x === maxX && y === 0) ||
                        (x === maxX && y === maxY)) {
                        continue
                    }
                    else {
                        positions.push([x, y])
                    }
                }
            }

            return positions
        }
    }
}
