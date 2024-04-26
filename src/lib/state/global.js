import { explore } from "../../exploration/index.js";

export class ExplorationManager {
    static #instance
    static async explore() {
        if (!this.#instance) {
            this.#instance = await explore();

            console.info('loading model')
        }
        await this.#instance.preLoad()
        return this.#instance
    }
}
