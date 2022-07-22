import { Dissector } from '../../backend/dissector.js';
import { Distribution, DistributionSerialization } from '../../domain/distribution';
import { DEFAULT_CHARACTER, MIN_PREFIX_DEPTH, MAX_PREFIX_DEPTH } from '../../domain/constants.js';
import { MarkovMatrix, MarkovMatrixSerialization } from '../../domain/matrix.js';

test('Test default parameters', () => {
    let dissector = new Dissector();

    let matrix = new MarkovMatrix();

    expect(dissector.matrix).toEqual(matrix);
    expect(dissector.minDepth).toEqual(MIN_PREFIX_DEPTH);
    expect(dissector.maxDepth).toEqual(MAX_PREFIX_DEPTH);
});

test('Non-null parameters', () => {
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

    let dissector = new Dissector(1, 2, matrixSerialization);

    expect(dissector.matrix.serialize()).toEqual(matrixSerialization);
    expect(dissector.minDepth).toEqual(1);
    expect(dissector.maxDepth).toEqual(2);
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
    let dissector = new Dissector(1, 1);

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

    let dissector = new Dissector(2, 2);
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

    let dissector = new Dissector(2, 2);
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

    let dissector = new Dissector(2, 2);
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

    let dissector = new Dissector(4, 4);
    dissector.dissectText('abc');

    expect(dissector.matrix.serialize()).toEqual(mms);
});

test('Range of prefix depths', () => {
    let mms = new MarkovMatrixSerialization(
        [
            {
                prefix: '',
                dist: new DistributionSerialization(
                    [
                        {
                            char: 'a',
                            count: 3
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
                            count: 4
                        },
                        {
                            char: 'b',
                            count: 1
                        },
                        {
                            char: DEFAULT_CHARACTER,
                            count: 1
                        }
                    ]
                )
            },
            {
                prefix: 'b',
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
                prefix: 'c',
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
                            char: 'b',
                            count: 2
                        },
                        {
                            char: DEFAULT_CHARACTER,
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
                            char: 'a',
                            count: 1
                        }
                    ]
                )
            },
            {
                prefix: 'ca',
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
                prefix: 'aab',
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
                            char: 'a',
                            count: 1
                        }
                    ]
                )
            },
            {
                prefix: 'bca',
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
                prefix: 'caa',
                dist: new DistributionSerialization(
                    [
                        {
                            'char': DEFAULT_CHARACTER,
                            count: 1
                        }
                    ]
                )
            }
        ]
    );

    let dissector = new Dissector(1, 3);
    dissector.dissectText('aabcaa');

    expect(dissector.matrix.serialize()).toEqual(mms);
});