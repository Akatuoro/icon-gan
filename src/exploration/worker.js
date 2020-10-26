import * as Comlink from 'comlink'
import {Exploration} from './exploration'
import {exposed} from './exposed'

// return a proxy instead of an object
exposed.proxy = val => Comlink.proxy(val)


const explorer = new Exploration()

Comlink.expose(explorer);
