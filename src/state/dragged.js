export const dragged = {
    valuePromise: null,
    imageData: null,
    isTransfer: false,
    clear() {
        this.valuePromise = null
        this.imageData = null
        this.isTransfer = false
    }
}
