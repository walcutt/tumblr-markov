import { Distribution, DistributionSerialization } from './distribution.js';

export class MarkovMatrix {
    //Array<string>
    prefixList;

    //Dictionary<string, Distribution>
    prefixMap;
    
    constructor(mmSerialization = null) {
        if(mmSerialization === null) {
            this.prefixList = [];
            this.prefixMap = {};
            return;
        }

        this.prefixList = mmSerialization.matrix.map(
            (pair) => pair.prefix
        );

        this.prefixMap = {};
        for(let i = 0; i < mmSerialization.matrix.length; i++) {
            this.prefixMap[mmSerialization.matrix[i].prefix] = new Distribution(mmSerialization.matrix[i].dist);
        }
    }

    getDistribution(prefix) {
        return this.prefixMap[prefix] ?? new Distribution();
    }

    registerPair(prefix, nextChar) {
        let distribution = this.getDistribution(prefix);
        distribution.addCharacterCount(nextChar);

        if(!this.prefixMap[prefix]) {
            this.prefixList.push(prefix);
            this.prefixMap[prefix] = distribution;
        }
    }

    serialize() {
        return new MarkovMatrixSerialization(this.prefixMap, this.prefixList);
    }
}

export class MarkovMatrixSerialization {
    //Array<Pair<string, DistributionSerialization>>
    matrix;

    constructor(prefixMap = {}, prefixList = []) {
        this.matrix = prefixList.map(
            (prefix) => {
                return {
                    prefix: prefix,
                    dist: prefixMap[prefix].serialize()
                }
            }
        );
    }
}