
export class BatchGenerator {
    constructor(...args) {
        this.reset(...args)

        this.resetQueue()
        this.queueTS = undefined
        this.queueCb = undefined
    }

    reset() { }

    resetQueue() { }

    queue(cb) {
        this.resetQueue()

        this.queueCb = cb

        if (!this.queueTS) {
            this.queueTS = setTimeout(() => this.queueStep())
        }
    }

    queueStep() {
        this.queueCb(this.next())

        if (this.done) {
            this.queueTS = undefined
        }
        else {
            this.queueTS = setTimeout(() => this.queueStep())
        }
    }

    get done() {
        return true
    }

    next() { }
}

export class BatchGenerator2DAIO extends BatchGenerator {
    reset(w=3, h=3) {
        this.w = w
        this.h = h
    }

    resetQueue() {
        this.i = 0
    }

    get done() {
        return this.i >= 1
    }

    next() {
        this.i++

        const positions = []

        for (let x = 0; x < this.w; x++) {
            for (let y = 0; y < this.h; y++) {
                positions.push([x, y])
            }
        }

        return positions
    }
}

export class BatchGenerator2D extends BatchGenerator {
    /** Only works with uneven w and h */
    reset(w=3, h=3) {
        this.w = 3
        this.h = 3
    }

    resetQueue() {
        this.i = 0
    }

    get done() {
        return this.i >= 2
    }

    next() {
        const i = this.i
        this.i++
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
