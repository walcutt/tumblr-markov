import { Dissector } from '../../backend/dissector.js';
import { DEFAULT_CHARACTER, Distribution, DistributionSerialization } from '../../domain/distribution';
import { MarkovMatrix, MarkovMatrixSerialization } from '../../domain/matrix.js';

test('Test default parameters', () => {
    let dissector = new Dissector(1);

    let matrix = new MarkovMatrix();

    expect(dissector.matrix).toEqual(matrix);
});

test('Non-null matrix parameter', () => {
    let dist = new Distribution(
        [
            {
                char: 'a',
                count: 1
            }
        ]
    );
    let matrixSerialization = new MarkovMatrixSerialization(
        {
            a: dist
        },
        [ 'a' ]
    );

    let dissector = new Dissector(1, matrixSerialization);

    expect(dissector.matrix.serialize()).toEqual(matrixSerialization);
});

test('Empty string dissection', () => {
    let dist = new Distribution(
        [
            {
                char: DEFAULT_CHARACTER,
                count: 1
            }
        ]
    );
    let mms = new MarkovMatrixSerialization(
        {
            '': dist
        },
        [ '' ]
    );
    let dissector = new Dissector(1);

    dissector.dissectText('');

    expect(dissector.matrix.serialize()).toEqual(mms);
});

test('Nominal string dissection', () => {
    let mms = new MarkovMatrixSerialization(
        {
            '': new Distribution(
                [
                    {
                        char: 'a',
                        count: 1
                    }
                ]
            ),
            'a': new Distribution(
                [
                    {
                        char: 'b',
                        count: 1
                    }
                ]
            ),
            'ab': new Distribution(
                [
                    {
                        char: 'c',
                        count: 1
                    }
                ]
            ),
            'bc': new Distribution(
                [
                    {  
                        char: DEFAULT_CHARACTER,
                        count: 1
                    }
                ]
            )
        },
        [ '', 'a', 'ab', 'bc' ]
    );

    let dissector = new Dissector(2);
    dissector.dissectText('abc');

    expect(dissector.matrix.serialize()).toEqual(mms);
});

test('Repeating prefix string dissection', () => {
    let mms = new MarkovMatrixSerialization(
        {
            '': new Distribution(
                [
                    {
                        char: 'a',
                        count: 1
                    }
                ]
            ),
            'a': new Distribution(
                [
                    {
                        char: 'a',
                        count: 1
                    }
                ]
            ),
            'aa': new Distribution(
                [
                    {
                        char: 'a',
                        count: 1
                    },
                    {
                        char: 'b',
                        count: 1
                    }
                ]
            ),
            'ab': new Distribution(
                [
                    {
                        char: 'c',
                        count: 1
                    }
                ]
            ),
            'bc': new Distribution(
                [
                    {  
                        char: DEFAULT_CHARACTER,
                        count: 1
                    }
                ]
            )
        },
        [ '', 'a', 'aa', 'ab', 'bc' ]
    );

    let dissector = new Dissector(2);
    dissector.dissectText('aaabc');

    expect(dissector.matrix.serialize()).toEqual(mms);
});

test('Dissecting multiple strings', () => {
    let mms = new MarkovMatrixSerialization(
        {
            '': new Distribution(
                [
                    {
                        char: 'a',
                        count: 2
                    }
                ]
            ),
            'a': new Distribution(
                [
                    {
                        char: 'a',
                        count: 1
                    },
                    {
                        char: 'b',
                        count: 1
                    }
                ]
            ),
            'aa': new Distribution(
                [
                    {
                        char: 'a',
                        count: 1
                    },
                    {
                        char: 'b',
                        count: 1
                    }
                ]
            ),
            'ab': new Distribution(
                [
                    {
                        char: 'c',
                        count: 2
                    }
                ]
            ),
            'bc': new Distribution(
                [
                    {  
                        char: DEFAULT_CHARACTER,
                        count: 2
                    }
                ]
            )
        },
        [ '', 'a', 'aa', 'ab', 'bc' ]
    );

    let dissector = new Dissector(2);
    dissector.dissectText('aaabc');
    dissector.dissectText('abc');

    expect(dissector.matrix.serialize()).toEqual(mms);
});

test('Prefix longer than string', () => {
    let mms = new MarkovMatrixSerialization(
        {
            '': new Distribution(
                [
                    {
                        char: 'a',
                        count: 1
                    }
                ]
            ),
            'a': new Distribution(
                [
                    {
                        char: 'b',
                        count: 1
                    }
                ]
            ),
            'ab': new Distribution(
                [
                    {
                        char: 'c',
                        count: 1
                    }
                ]
            ),
            'abc': new Distribution(
                [
                    {  
                        char: DEFAULT_CHARACTER,
                        count: 1
                    }
                ]
            )
        },
        [ '', 'a', 'ab', 'abc' ]
    );

    let dissector = new Dissector(4);
    dissector.dissectText('abc');

    expect(dissector.matrix.serialize()).toEqual(mms);
});