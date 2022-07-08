import { MarkovMatrix, MarkovMatrixSerialization } from '../../domain/matrix.js';
import { Distribution, DistributionSerialization } from '../../domain/distribution.js';

test('Default Params', () => {
    let mm = new MarkovMatrix();
    let mms = new MarkovMatrixSerialization();

    expect(mm.prefixList).toEqual([]);
    expect(mm.prefixMap).toEqual({});

    expect(mms.matrix).toEqual([]);
});

test('Null retrieval', () => {
    let nullDist = new Distribution();
    let nullMatrix = new MarkovMatrix();

    expect(nullMatrix.getDistribution('a')).toEqual(nullDist);
});

test('Preservation of data structure through conversions', () => {
    let mms = new MarkovMatrixSerialization(
        {
            'a': new Distribution(),
            'aa': new Distribution(),
            'xyz': new Distribution()
        },
        [
            'a',
            'aa',
            'xyz'
        ]
    );
    let mm = new MarkovMatrix(mms);
    let mms2 = mm.serialize();
    let mm2 = new MarkovMatrix(mms2);

    expect(mms).toEqual(mms2);
    expect(mm).toEqual(mm2);
});

test('Valid prefix distribution retrieval', () => {
    let aDist = new Distribution(
        [ { char: 'a', count: 1 } ]
    );
    let bDist = new Distribution(
        [ { char: 'b', count: 1 } ]
    );
    let mms = new MarkovMatrixSerialization(
        {
            'a': aDist,
            'b': bDist
        },
        [ 'a', 'b' ]
    );

    let mm = new MarkovMatrix(mms);

    expect(mm.getDistribution('a')).toEqual(aDist);
    expect(mm.getDistribution('b')).toEqual(bDist);
});

test('Invalid prefix distribution retrieval', () => {
    let nullDist = new Distribution();
    let aDist = new Distribution(
        [ { char: 'a', count: 1 } ]
    );
    let bDist = new Distribution(
        [ { char: 'b', count: 1 } ]
    );
    let mms = new MarkovMatrixSerialization(
        {
            'a': aDist,
            'b': bDist
        },
        [ 'a', 'b' ]
    );

    let mm = new MarkovMatrix(mms);

    expect(mm.getDistribution('c')).toEqual(nullDist);
});

test('Registering existing prefix pair', () => {
    let aDist = new Distribution(
        [ { char: 'b', count: 1 } ]
    );
    let aDist2 = new Distribution(
        [ { char: 'b', count: 2 } ]
    );
    let mms = new MarkovMatrixSerialization(
        {
            'a': aDist
        },
        [ 'a' ]
    );
    let mms2 = new MarkovMatrixSerialization(
        {
            'a': aDist2
        },
        [ 'a' ]
    );

    let mm = new MarkovMatrix(mms);
    let mm2 = new MarkovMatrix(mms2);

    mm.registerPair('a', 'b');

    expect(mm).toEqual(mm2);
});

test('Registering new prefix pair', () => {
    let aDist = new Distribution(
        [ { char: 'x', count: 1 } ]
    );
    let bDist = new Distribution(
        [ { char: 'y', count: 1 } ]
    );
    let mms = new MarkovMatrixSerialization(
        {
            'a': aDist
        },
        [ 'a' ]
    );
    let mms2 = new MarkovMatrixSerialization(
        {
            'a': aDist,
            'b': bDist
        },
        [ 'a', 'b' ]
    );
    
    let mm = new MarkovMatrix(mms);
    let mm2 = new MarkovMatrix(mms2);
    
    mm.registerPair('b', 'y');

    expect(mm).toEqual(mm2);
});