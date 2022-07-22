import { DEFAULT_CHARACTER } from '../domain/constants.js';
import { MarkovMatrix } from '../domain/matrix.js';

export class Assembler {
    //int
    prefixLength;

    //MarkovMatrix
    matrix;

    constructor(prefixLength, matrix) {
        this.prefixLength = prefixLength;
        this.matrix = matrix;
    }

    generate(maxLength = -1) {
        let accumulator = '';

        //first, generate up to prefix length.
        for(let i = 0; i < this.prefixLength; i++) {
            let dist = this.matrix.getDistribution(accumulator);
            let nextChar = dist.getNext();

            if(nextChar === DEFAULT_CHARACTER) {
                return accumulator;
            }

            accumulator += nextChar;
        }

        //then, continue generating until max length or terminating character is reached.
        //if max length === -1, generate until terminating character.
        while(maxLength === -1 || accumulator.length < maxLength) {
            let prefix = accumulator.substring(accumulator.length - this.prefixLength);
            let dist = this.matrix.getDistribution(prefix);
            let nextChar = dist.getNext();

            if(nextChar === DEFAULT_CHARACTER) {
                return accumulator;
            }

            accumulator += nextChar;
        }

        return accumulator;
    }
}