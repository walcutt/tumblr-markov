import { Distribution, DistributionSerialization, DEFAULT_CHARACTER } from '../../domain/distribution.js';

test('Default Params', () => {
    let dist = new Distribution();
    let distSer = new DistributionSerialization();

    expect(dist.frequencyPDF).toEqual([]);
    expect(dist.frequencyCDF).toEqual([]);
    expect(dist.cdfMax).toBe(0);

    expect(distSer.frequencies).toEqual([]);
});

test('Null distribution generator', () => {
    let dist = new Distribution();

    expect(dist.getValFromCDF(0)).toEqual(DEFAULT_CHARACTER);
    expect(dist.getValFromCDF(0.5)).toEqual(DEFAULT_CHARACTER);
    expect(dist.getValFromCDF(1)).toEqual(DEFAULT_CHARACTER);
});

test('Preservation of data structure through conversions', () => {
    let distributionSer = new DistributionSerialization([
        {
            char: 'a',
            count: 1
        },
        {
            char: 'b',
            count: 2
        },
        {
            char: 'c',
            count: 3
        }
    ]);
    let distribution = new Distribution(distributionSer);
    let ds2 = distribution.serialize();
    let d2 = new Distribution(ds2);

    expect(distributionSer).toEqual(ds2);
    expect(distribution).toEqual(d2);
});

test('Non-null random generation within bounds', () => {
    let distributionSer = new DistributionSerialization([
        {
            char: 'a',
            count: 1
        },
        {
            char: 'b',
            count: 2
        },
        {
            char: 'c',
            count: 3
        }
    ]);
    let dist = new Distribution(distributionSer);

    expect(dist.getValFromCDF(0)).toEqual('a');
    expect(dist.getValFromCDF(0.5 / 6)).toEqual('a');
    expect(dist.getValFromCDF(2 / 6)).toEqual('b');
    expect(dist.getValFromCDF(4 / 6)).toEqual('c');
});

test('Non-null random generation out of bounds', () => {
    let distributionSer = new DistributionSerialization([
        {
            char: 'a',
            count: 1
        },
        {
            char: 'b',
            count: 2
        },
        {
            char: 'c',
            count: 3
        }
    ]);
    let dist = new Distribution(distributionSer);

    expect(dist.getValFromCDF(-1)).toEqual('a');
    expect(dist.getValFromCDF(2)).toEqual('c');
});

test('Adding character counts', () => {
    let distributionSer = new DistributionSerialization([
        {
            char: 'a',
            count: 1
        },
        {
            char: 'b',
            count: 2
        },
        {
            char: 'c',
            count: 3
        }
    ]);
    let dist = new Distribution(distributionSer);
    let distributionSer2 = new DistributionSerialization([
        {
            char: 'a',
            count: 1
        },
        {
            char: 'b',
            count: 2
        },
        {
            char: 'c',
            count: 4
        },
        {
            char: 'd',
            count: 1
        }
    ]);
    let dist2 = new Distribution(distributionSer2);

    dist.addCharacterCount('c');
    dist.addCharacterCount('d');

    expect(dist).toEqual(dist2);
});