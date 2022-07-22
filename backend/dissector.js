import { DEFAULT_CHARACTER, MIN_PREFIX_DEPTH, MAX_PREFIX_DEPTH } from '../domain/constants.js';
import { MarkovMatrix, MarkovMatrixSerialization } from '../domain/matrix.js';

export class Dissector {
    //MarkovMatrix
    matrix;

    //int
    minDepth;
    maxDepth;

    constructor(minDepth = MIN_PREFIX_DEPTH, maxDepth = MAX_PREFIX_DEPTH, markovMatrixSerialization = null) {
        this.matrix = (markovMatrixSerialization ?? new MarkovMatrixSerialization()).deserialize();
        this.minDepth = minDepth;
        this.maxDepth = maxDepth;
    }

    dissectText(text) {
        for(let i = this.minDepth; i <= this.maxDepth; i++) {
            this.dissectTextWithPrefixDepth(text, i);
        }
    }

    dissectTextWithPrefixDepth(text, prefixDepth) {
        // First, generate using prefixes that are smaller than @prefixDepth
        for(let i = 0; i < prefixDepth && i < text.length; i++) {
            let prefix = text.substring(0, i);
            this.matrix.registerPair(prefix, text.charAt(i));
        }

        // Then, generate using remaining prefixes of length prefixDepth.
        for(let k = 0; k < text.length - prefixDepth; k++) {
            let prefix = text.substring(k, k + prefixDepth);
            this.matrix.registerPair(prefix, text.charAt(k + prefixDepth));
        }

        // Finally, register last prefix.
        let prefix = text.substring(
            Math.max(text.length - prefixDepth, 0),
            text.length
        );
        this.matrix.registerPair(prefix, DEFAULT_CHARACTER);
    }
}