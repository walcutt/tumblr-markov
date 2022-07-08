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
    let ds = new DistributionSerialization([
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
    let d = ds.deserialize();
    let ds2 = d.serialize();
    let d2 = ds2.deserialize();

    expect(ds).toEqual(ds2);
    expect(d).toEqual(d2);
});

test('Non-null random generation within bounds', () => {
    let dist = new Distribution([
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

    expect(dist.getValFromCDF(0)).toEqual('a');
    expect(dist.getValFromCDF(0.5 / 6)).toEqual('a');
    expect(dist.getValFromCDF(2 / 6)).toEqual('b');
    expect(dist.getValFromCDF(4 / 6)).toEqual('c');
});

test('Non-null random generation out of bounds', () => {
    let dist = new Distribution([
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

    expect(dist.getValFromCDF(-1)).toEqual('a');
    expect(dist.getValFromCDF(2)).toEqual('c');
});

test('Adding character counts', () => {
    let dist = new Distribution([
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
    let dist2 = new Distribution([
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

    dist.addCharacterCount('c');
    dist.addCharacterCount('d');

    expect(dist).toEqual(dist2);
});