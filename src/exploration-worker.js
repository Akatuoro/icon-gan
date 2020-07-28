import * as Comlink from 'comlink'
import {Exploration} from './exploration'

const explorer = new Exploration()

Comlink.expose(explorer);
