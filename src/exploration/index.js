import { getBrowserSupport } from '$lib/browser-support';
import { Exploration } from './exploration';
import workerURL from './worker?url';
import * as Comlink from 'comlink'
// window.Comlink = Comlink


let _useWorker

export const setWorkerUsage = (shouldUse) => {
    _useWorker = shouldUse?
        getBrowserSupport().worker :
        false
}

export const useWorker = () => {
    // if _useWorker was not set yet, provide a sensible default
    if (_useWorker === undefined) {
        const {webgl, worker, offscreen} = getBrowserSupport()
        _useWorker = worker && (!webgl || (webgl && offscreen))
    }

    return _useWorker
}

/**
 * 
 * @returns {Promise<Exploration | Comlink.Remote<Exploration>>}
 */
export const explore = async () => {
    if (useWorker()) {
        console.info('using worker')
        const exploration = Comlink.wrap(new Worker(workerURL, {type: 'module'}))
        return exploration
    }
    else {
        console.info('not using worker')
        const exploration = new Exploration()
        return exploration
    }
}

export const proxy = cb => {
    return useWorker()?
        Comlink.proxy(cb) :
        cb
}
