export const DEFAULT_CHARACTER = '';

export class Distribution {
    //Array<Pair<string, int>>
    frequencyPDF;

    //Array<Pair<string, int>>
    frequencyCDF;

    //int
    cdfMax;

    constructor(distSerialization = null) {
        if(distSerialization === null || distSerialization.frequencies.length === 0) {
            this.frequencyPDF = [];
            this.frequencyCDF = [];
            this.cdfMax = 0;
            return;
        }

        this.frequencyPDF = distSerialization.frequencies.map(
            e => {
                return {
                    char: e.char,
                    count: e.count
                };
            }
        );

        this.recalculateCDF();
    }

    recalculateCDF() {
        let accumulator = 0;
        this.frequencyCDF = [];
        for(let i = 0; i < this.frequencyPDF.length; i++) {
            accumulator += this.frequencyPDF[i].count;
            this.frequencyCDF[i] = {
                char: this.frequencyPDF[i].char,
                count: accumulator
            };
        }
        this.cdfMax = accumulator;
    }

    getValFromCDF(linearParam) {
        let totalParam = linearParam * this.cdfMax;
        if(totalParam < 0) totalParam = 0;
        if(totalParam > this.cdfMax) totalParam = this.cdfMax;

        for(let i = 0; i < this.frequencyCDF.length; i++) {
            if(this.frequencyCDF[i].count >= totalParam) {
                return this.frequencyCDF[i].char;
            }
        }

        //In null dist case (pdf = cdf = []), should pass over loop to here
        return DEFAULT_CHARACTER;
    }

    addCharacterCount(char) {
        let hasChar = this.frequencyPDF.some(
            (entry) => entry.char === char
        );

        if(!hasChar) {
            this.frequencyPDF.push({
                char: char,
                count: 1
            });
        } else {
            for(let i = 0; i < this.frequencyPDF.length; i++) {
                if(this.frequencyPDF[i].char === char) {
                    this.frequencyPDF[i].count++;
                    break;
                }
            }
        }

        this.recalculateCDF();
    }

    serialize() {
        return new DistributionSerialization(this.frequencyPDF);
    }
}

export class DistributionSerialization {
    //Array<Pair<string, int>>
    frequencies;

    constructor(frequencyDist = []) {
        this.frequencies = frequencyDist.map(
            e => {
                return {
                    char: e.char,
                    count: e.count
                };
            }
        );
    }
}