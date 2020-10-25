/**
 * Basic explorer class with common methods.
 */
export class Explorer {
    constructor() {
        this.onReleaseCallbacks = []
    }

    onRelease(cb) {
        this.onReleaseCallbacks.push(cb)
    }

    release() {
        this.onReleaseCallbacks.forEach(cb => cb(this))
    }

    reset() { }

    update() { }
}
