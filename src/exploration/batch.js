
/**
 * Executes a callback `cb` asynchronously using `setTimeout`
 * for every value in an [iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol).
 * 
 * The iterable can be replaced at any time, making the executor switch to the new iterable.
 * 
 * This is useful for long blocking operations being split into batches, executed with `cb`.
 * The execution of events coming in from the event loop is not blocked,
 * making it possible to stop the execution or change the batch configuration.
 * 
 * @example
 * const executor = new BatchExecutor([0, 1, 2])
 * const cb = (i) => console.log(i)
 * 
 * executor.start(cb)
 * 
 * setTimeout(() => setTimeout(() => {
 *     executor.iterable = ['a', 'b', 'c']
 *     setTimeout(() => executor.stop())
 * }))
 * 
 * // expected output sequence:
 * // 0, 1, a
 */
export class BatchExecutor {
    /**
     * Initializes the batch executor with an iterable.
     * @param {Iterable} iterable 
     */
    constructor(iterable) {
        this.iterable = iterable
        this._stepTS = undefined
        this._stepCb = undefined
    }

    /**
     * Sets a new iterable, replacing the old one.
     * @param {Iterable} iterable
     */
    set iterable(iterable) {
        this._iterator = iterable?.[Symbol.iterator]()
    }

    /**
     * Start executing the given `cb` function with values of the current iterator.
     * Will continue executing until
     * - the iterator is done or
     * - `stop()` is called.
     * 
     * Execution will continue with new iterator when `iterable` is set,
     * but only if execution is not done/stopped.
     * @param {(value: any) => void} cb callback that takes a single iterator value as argument on each iteration.
     */
    start(cb) {
        this._stepCb = cb

        if (!this._stepTS) {
            this._stepTS = setTimeout(() => this._step())
        }
    }

    /**
     * Stops execution. Does not reset the iterator.
     */
    stop() {
        clearTimeout(this._stepTS)
        this._stepTS = undefined
    }

    _step() {
        const {done, value} = this._iterator.next()

        if (done) {
            this._stepTS = undefined
        }
        else {
            this._stepCb(value)
            this._stepTS = setTimeout(() => this._step())
        }
    }
}


/**
 * Abstract BatchGenerator class. Implements the
 * [iterable protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol).
 * 
 * Derived classes must implement
 * - `next() : {done: boolean, value: <batch>}`
 * - `reset() : void`
 * 
 * @see BatchGenerator2DAIO for an example implemenation
 */
export class BatchGenerator {
    [Symbol.iterator]() {
        this.reset()
        return this
    }

    /**
     * Resets the batch generator.
     * It is also called when a new iterator is requested.
     * 
     * **Implemented by derived classes.**
     */
    reset() { }

    /**
     * `next` function according to the
     * [iterator protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol).
     * 
     * **Implemented by derived classes.**
     * 
     * @returns {{done: boolean, value: any}}
     */
    next() {
        return {
            done: true,
            value: undefined,
        }
    }
}

export class BatchGenerator2DAIO extends BatchGenerator {
    constructor(w=3, h=3) {
        super()
        this.w = w
        this.h = h
        this.done = false
    }

    reset() {
        this.done = false
    }

    next() {
        if (this.done) return {done: true, value: undefined}
        this.done = true

        const positions = []

        for (let x = 0; x < this.w; x++) {
            for (let y = 0; y < this.h; y++) {
                positions.push([x, y])
            }
        }

        return {
            done: false,
            value: positions,
        }
    }
}

export class BatchGenerator2D extends BatchGenerator {
    /** Only works with uneven w and h */
    constructor(w=3, h=3) {
        super()
        this.w = 3
        this.h = 3
        this.i = 0
    }

    reset() {
        this.i = 0
    }

    next() {
        const i = this.i
        if (i > 1) return {done: true, value: undefined}
        this.i++

        if (i === 0) {
            const maxX = this.w - 1
            const maxY = this.h - 1
            return {
                done: false,
                value: [[maxX / 2, maxY / 2], [0, 0], [0, maxY], [maxX, 0], [maxX, maxY]],
            }
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

            return {
                done: false,
                value: positions,
            }
        }
    }
}
