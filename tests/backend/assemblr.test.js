import { Assembler } from '../../backend/assembler.js';
import { DEFAULT_CHARACTER, Distribution, DistributionSerialization } from '../../domain/distribution.js';
import { MarkovMatrix, MarkovMatrixSerialization } from '../../domain/matrix.js';

test('Null matrix generation', () => {
    let assembler = new Assembler(1, new MarkovMatrix());

    let generatedString = assembler.generate();

    expect(generatedString).toEqual('');
});

test('Deterministic matrix generation', () => {
    let matrix = new MarkovMatrix(
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
            'b': new Distribution(
                [
                    {
                        char: 'c',
                        count: 1
                    }
                ]
            ),
            'c': new Distribution(
                [
                    {
                        char: DEFAULT_CHARACTER,
                        count: 1
                    }
                ]
            )
        },
        [ '', 'a', 'b', 'c' ]
    );

    let assembler = new Assembler(1, matrix);
    let generatedString = assembler.generate();

    expect(generatedString).toEqual('abc');
});

test('Deterministic matrix generation with cutoff', () => {
    let matrix = new MarkovMatrix(
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
            'b': new Distribution(
                [
                    {
                        char: 'c',
                        count: 1
                    }
                ]
            ),
            'c': new Distribution(
                [
                    {
                        char: DEFAULT_CHARACTER,
                        count: 1
                    }
                ]
            )
        },
        [ '', 'a', 'b', 'c' ]
    );

    let assembler = new Assembler(1, matrix);
    let generatedString = assembler.generate(2);

    expect(generatedString).toEqual('ab');
});

test('Deterministic indefinite matrix generation with cutoff', () => {
    let matrix = new MarkovMatrix(
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
            )
        },
        [ '', 'a' ]
    );

    let assembler = new Assembler(1, matrix);
    let generatedString = assembler.generate(8);

    expect(generatedString).toEqual('aaaaaaaa');
});

test('Deterministic matrix generation with longer prefix', () => {
    let matrix = new MarkovMatrix(
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
                        char: 'd',
                        count: 1
                    }
                ]
            ),
            'cd': new Distribution(
                [
                    {
                        char: DEFAULT_CHARACTER,
                        count: 1
                    }
                ]
            )
        },
        [ '', 'a', 'ab', 'bc', 'cd' ]
    );

    let assembler = new Assembler(2, matrix);
    let generatedString = assembler.generate();

    expect(generatedString).toEqual('abcd');
});

test('Non-Deterministic matrix generation', () => {
    let matrix = new MarkovMatrix(
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
            'b': new Distribution(
                [
                    {
                        char: 'c',
                        count: 1
                    },
                    {
                        char: 'b',
                        count: 2
                    }
                ]
            ),
            'c': new Distribution(
                [
                    {
                        char: DEFAULT_CHARACTER,
                        count: 1
                    }
                ]
            )
        },
        [ '', 'a', 'b', 'c' ]
    );

    let assembler = new Assembler(1, matrix);
    let generatedString = assembler.generate();

    expect(generatedString).toMatch(/ab+c/);
});