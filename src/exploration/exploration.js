import * as tf from '@tensorflow/tfjs';

import {getModel} from './model'
import {ImageNoise, Style} from './input'
import {exposed} from './exposed'
import { DirectionExplorer } from './direction-explorer';
import { PlaneExplorer } from './plane-exporer';
import { transferBay } from './transfer';
import { InterpolationExplorer } from './interpolation-explorer';


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
        this.central = new SharedState({
            style: new Style([
                {generationType: 'randomNormal', shape: [512]},
                {generationType: 'randomNormal', shape: [512]},
                {generationType: 'randomUniform', shape: [64, 64, 1], locked: true},
                {generationType: 'randomNormal', shape: [512]},
                {generationType: 'randomNormal', shape: [512]},
                {generationType: 'randomNormal', shape: [512]},
            ])
        })
        this.central.onUpdate = () => this.update()

        this.explorers = []
    }

    /**
     * @param {number} scale
     */
    set scale(scale) {
        this.central.scale = scale
    }

    createExplorer(cls, options) {
        const explorer = new cls()

        this.explorers.push(explorer)
        explorer.onRelease(() => this.explorers.splice(this.explorers.indexOf(explorer), 1))

        explorer.init(options, this.central)

        const proxy = exposed.proxy(explorer)
        explorer.onRelease(() => proxy[exposed.release]?.())
        return proxy;
    }

    createPlaneExplorer(options) {
        return this.createExplorer(PlaneExplorer, options);
    }

    createDirectionExplorer(options) {
        return this.createExplorer(DirectionExplorer, options);
    }

    createInterpolationExplorer(options) {
        return this.createExplorer(InterpolationExplorer, options);
    }

    reset() {
        this.central.imageNoise.random()
        this.central.style.generateAll()

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
