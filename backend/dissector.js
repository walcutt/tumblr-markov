import { DEFAULT_CHARACTER } from '../domain/distribution.js';
import { MarkovMatrix, MarkovMatrixSerialization } from '../domain/matrix.js';

export class Dissector {
    //MarkovMatrix
    matrix;

    //int
    prefixDepth;

    constructor(prefixDepth, markovMatrixSerialization = null) {
        this.matrix = (markovMatrixSerialization ?? new MarkovMatrixSerialization()).deserialize();
        this.prefixDepth = prefixDepth;
    }

    dissectText(text) {
        // First, generate using prefixes that are smaller than @prefixDepth
        for(let i = 0; i < this.prefixDepth && i < text.length; i++) {
            let prefix = text.substring(0, i);
            this.matrix.registerPair(prefix, text.charAt(i));
        }

        // Then, generate using remaining prefixes of length prefixDepth.
        for(let k = 0; k < text.length - this.prefixDepth; k++) {
            let prefix = text.substring(k, k + this.prefixDepth);
            this.matrix.registerPair(prefix, text.charAt(k + this.prefixDepth));
        }

        // Finally, register last prefix.
        let prefix = text.substring(
            Math.max(text.length - this.prefixDepth, 0),
            text.length
        );
        this.matrix.registerPair(prefix, DEFAULT_CHARACTER);
    }
}