import { Distribution, DistributionSerialization } from './distribution.js';

export class MarkovMatrix {
    //Array<string>
    prefixList;

    //Dictionary<string, Distribution>
    prefixMap;
    
    constructor(prefixMap = {}, prefixList = []) {
        this.prefixMap = prefixMap;
        this.prefixList = prefixList;
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
        let prefixMap = this.prefixMap;
        let matrixArray = this.prefixList.map(
            (prefix) => {
                return {
                    prefix: prefix,
                    dist: prefixMap[prefix].serialize()
                }
            }
        )
        return new MarkovMatrixSerialization(matrixArray);
    }
}

export class MarkovMatrixSerialization {
    //Array<Pair<string, DistributionSerialization>>
    matrix;

    constructor(matrixArray = []) {
        this.matrix = matrixArray;
    }

    deserialize() {
        let prefixList = this.matrix.map(
            pair => pair.prefix
        );

        let prefixMap = {};
        for(let i = 0; i < this.matrix.length; i++) {
            prefixMap[this.matrix[i].prefix] = this.matrix[i].dist.deserialize();
        }

        return new MarkovMatrix(prefixMap, prefixList);
    }
}