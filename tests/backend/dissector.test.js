import { Dissector } from '../../backend/dissector.js';
import { Distribution, DistributionSerialization } from '../../domain/distribution';
import { DEFAULT_CHARACTER } from '../../domain/constants.js';
import { MarkovMatrix, MarkovMatrixSerialization } from '../../domain/matrix.js';

test('Test default parameters', () => {
    let dissector = new Dissector(1);

    let matrix = new MarkovMatrix();

    expect(dissector.matrix).toEqual(matrix);
});

test('Non-null matrix parameter', () => {
    let dist = new DistributionSerialization(
        [
            {
                char: 'a',
                count: 1
            }
        ]
    );
    let matrixSerialization = new MarkovMatrixSerialization(
        [
            {
                prefix: 'a',
                dist: dist
            }
        ]
    );

    let dissector = new Dissector(1, matrixSerialization);

    expect(dissector.matrix.serialize()).toEqual(matrixSerialization);
});

test('Empty string dissection', () => {
    let dist = new DistributionSerialization(
        [
            {
                char: DEFAULT_CHARACTER,
                count: 1
            }
        ]
    );
    let mms = new MarkovMatrixSerialization(
        [
            {
                prefix: '',
                dist: dist
            }
        ]
    );
    let dissector = new Dissector(1);

    dissector.dissectText('');

    expect(dissector.matrix.serialize()).toEqual(mms);
});

test('Nominal string dissection', () => {
    let mms = new MarkovMatrixSerialization(
        [
            {
                prefix: '',
                dist: new DistributionSerialization(
                    [
                        {
                            char: 'a',
                            count: 1
                        }
                    ]
                )
            },
            {
                prefix: 'a',
                dist: new DistributionSerialization(
                    [
                        {
                            char: 'b',
                            count: 1
                        }
                    ]
                )
            },
            {
                prefix: 'ab',
                dist: new DistributionSerialization(
                    [
                        {
                            char: 'c',
                            count: 1
                        }
                    ]
                )
            },
            {
                prefix: 'bc',
                dist: new DistributionSerialization(
                    [
                        {
                            char: DEFAULT_CHARACTER,
                            count: 1
                        }
                    ]
                )
            }
        ]
    );

    let dissector = new Dissector(2);
    dissector.dissectText('abc');

    expect(dissector.matrix.serialize()).toEqual(mms);
});

test('Repeating prefix string dissection', () => {
    let mms = new MarkovMatrixSerialization(
        [
            {
                prefix: '',
                dist: new DistributionSerialization(
                    [
                        {
                            char: 'a',
                            count: 1
                        }
                    ]
                )
            },
            {
                prefix: 'a',
                dist: new DistributionSerialization(
                    [
                        {
                            char: 'a',
                            count: 1
                        }
                    ]
                )
            },
            {
                prefix: 'aa',
                dist: new DistributionSerialization(
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
                )
            },
            {
                prefix: 'ab',
                dist: new DistributionSerialization(
                    [
                        {
                            char: 'c',
                            count: 1
                        }
                    ]
                )
            },
            {
                prefix: 'bc',
                dist: new DistributionSerialization(
                    [
                        {
                            char: DEFAULT_CHARACTER,
                            count: 1
                        }
                    ]
                )
            }
        ]
    );

    let dissector = new Dissector(2);
    dissector.dissectText('aaabc');

    expect(dissector.matrix.serialize()).toEqual(mms);
});

test('Dissecting multiple strings', () => {
    let mms = new MarkovMatrixSerialization(
        [
            {
                prefix: '',
                dist: new DistributionSerialization(
                    [
                        {
                            char: 'a',
                            count: 2
                        }
                    ]
                )
            },
            {
                prefix: 'a',
                dist: new DistributionSerialization(
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
                )
            },
            {
                prefix: 'aa',
                dist: new DistributionSerialization(
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
                )
            },
            {
                prefix: 'ab',
                dist: new DistributionSerialization(
                    [
                        {
                            char:'c',
                            count: 2
                        }
                    ]
                )
            },
            {
                prefix: 'bc',
                dist: new DistributionSerialization(
                    [
                        {
                            char: DEFAULT_CHARACTER,
                            count: 2
                        }
                    ]
                )
            }
        ]
    );

    let dissector = new Dissector(2);
    dissector.dissectText('aaabc');
    dissector.dissectText('abc');

    expect(dissector.matrix.serialize()).toEqual(mms);
});

test('Prefix longer than string', () => {
    let mms = new MarkovMatrixSerialization(
        [
            {
                prefix: '',
                dist: new DistributionSerialization(
                    [
                        {
                            char: 'a',
                            count: 1
                        }
                    ]
                )
            },
            {
                prefix: 'a',
                dist: new DistributionSerialization(
                    [
                        {
                            char: 'b',
                            count: 1
                        }
                    ]
                )
            },
            {
                prefix: 'ab',
                dist: new DistributionSerialization(
                    [
                        {
                            char: 'c',
                            count: 1
                        }
                    ]
                )
            },
            {
                prefix: 'abc',
                dist: new DistributionSerialization(
                    [
                        {
                            char: DEFAULT_CHARACTER,
                            count: 1
                        }
                    ]
                )
            }
        ]
    );

    let dissector = new Dissector(4);
    dissector.dissectText('abc');

    expect(dissector.matrix.serialize()).toEqual(mms);
});