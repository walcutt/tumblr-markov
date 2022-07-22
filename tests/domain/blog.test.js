import { Blog } from '../../domain/blog.js';
import { DEFAULT_POST_DATE } from '../../domain/constants.js';
import { Distribution, DistributionSerialization } from '../../domain/distribution.js';
import { MarkovMatrix, MarkovMatrixSerialization } from '../../domain/matrix.js';

test('Null Parameters', () => {
    let blog = new Blog();

    expect(blog.url).toEqual('');
    expect(blog.latestAccessedPostDate).toEqual(DEFAULT_POST_DATE);
    expect(blog.matrix).toEqual(new MarkovMatrix());
});

test('Preservation through serialization', () => {
    let mm = new MarkovMatrix(
        {
            'a': new Distribution(
                [
                    {
                        char: 'a',
                        count: 1
                        }
                ]
            )
        },
        [ 'a' ]
    );

    let date = new Date();
    let blog = new Blog('test', date, mm);

    let blogS = blog.serialize();
    let blog2 = blogS.deserialize();
    let blogS2 = blog2.serialize();

    expect(blog).toEqual(blog2);
    expect(blogS).toEqual(blogS2);
});