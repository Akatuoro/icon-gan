import * as tf from '@tensorflow/tfjs';

import {getModel} from './model'
import {ImageNoise, Style} from './input'
import {exposed} from './exposed'
import { DirectionExplorer } from './direction-explorer';
import { PlaneExplorer } from './plane-exporer';
import { transferBay } from './transfer';


class SharedState {
    constructor({imageNoise, style, scale = 0.5} = {}) {
        this.imageNoise = imageNoise || new ImageNoise()
        this.style = style || new Style()
        this.scale = scale
    }

    get imageNoise() {
        return this._imageNoise
    }

    /**
     * Sets imageNoise and disposes of old imageNoise.
     * @param {ImageNoise || Array} noise
     */
    set imageNoise(noise) {
        this._imageNoise && tf.dispose(this._imageNoise)
        this._imageNoise = noise instanceof ImageNoise?
            noise :
            ImageNoise.fromData(noise)

        this.onUpdate?.()
    }

    get style() {
        return this._style
    }

    /**
     * Sets style and disposes of old style.
     * @param {Style || Array} style
     */
    set style(style) {
        this._style && tf.dispose(this._style)
        this._style = style instanceof Style?
            style :
            Style.fromData(style)

        this.onUpdate?.()
    }

    get scale() {
        return this._scale
    }

    set scale(scale) {
        this._scale = scale
        this.onUpdate?.()
    }
}

export class Exploration {
    constructor() {
        this.central = new SharedState()
        this.central.onUpdate = () => this.update()

        this.explorers = []
    }

    /**
     * @param {number} scale
     */
    set scale(scale) {
        this.central.scale = scale
    }

    createPlaneExplorer(options) {
        const planeExplorer = new PlaneExplorer()

        this.explorers.push(planeExplorer)
        planeExplorer.onRelease(() => this.explorers.splice(this.explorers.indexOf(planeExplorer), 1))

        planeExplorer.init(options, this.central)

        return exposed.proxy(planeExplorer)
    }

    createDirectionExplorer(options) {
        const directionExplorer = new DirectionExplorer()

        this.explorers.push(directionExplorer)
        directionExplorer.onRelease(() => this.explorers.splice(this.explorers.indexOf(directionExplorer), 1))

        directionExplorer.init(options, this.central)

        return exposed.proxy(directionExplorer)
    }

    reset() {
        this.central.imageNoise.random()
        this.central.style.random()

        //scale = 0.5
        this.explorers.forEach(explorer => explorer.reset())

        this.update()
    }


    /** Initiates model (otherwise lazy loaded in update fn) */
    async preLoad() {
        await getModel()
        return true
    }

    update() {
        this.explorers.forEach(explorer => explorer.update())
    }

    resolveTransfer(i) {
        return tf.tidy(() => transferBay[i].evaluate())
    }
}
