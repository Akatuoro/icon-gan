import { Exploration } from './exploration';
import * as Comlink from 'comlink'


export const explore = async options => {
    const {webgl, worker, offscreen} = checkSupport()
    const useWorker = worker && (!webgl || (webgl && offscreen))

    console.log(useWorker? 'using worker' : 'not using worker')

    if (useWorker) {
        const explorer = Comlink.wrap(new Worker('dist/exploration-worker.js'))

        // proxy should ideally be released at some point
        const onUpdate = Comlink.proxy(options.onUpdate)
        delete options.onUpdate
        await explorer.init()

        explorer.onUpdate = onUpdate
        return explorer
    }
    else {
        const explorer = new Exploration()
        await explorer.init({n, scale, onUpdate})
        return explorer
    }
}
