import { Exploration } from './exploration';
import * as Comlink from 'comlink'
window.Comlink = Comlink


let _useWorker

export const setWorkerUsage = (shouldUse) => {
    _useWorker = shouldUse?
        checkSupport().worker :
        false
}

export const useWorker = () => {
    // if _useWorker was not set yet, provide a sensible default
    if (_useWorker === undefined) {
        const {webgl, worker, offscreen} = checkSupport()
        _useWorker = worker && (!webgl || (webgl && offscreen))
    }

    return _useWorker
}


export const explore = async options => {
    if (useWorker()) {
        console.log('using worker')
        const explorer = Comlink.wrap(new Worker('dist/exploration-worker.js'))

        // proxy should ideally be released at some point
        const onUpdate = Comlink.proxy(options.onUpdate)
        delete options.onUpdate
        await explorer.init(options)

        explorer.onUpdate = onUpdate
        return explorer
    }
    else {
        console.log('not using worker')
        const explorer = new Exploration()
        await explorer.init(options)
        return explorer
    }
}

export const proxy = cb => {
    return useWorker()?
        Comlink.proxy(cb) :
        cb
}
