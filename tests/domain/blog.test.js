import { Blog, DEFAULT_POST_DATE } from "../../domain/blog";
import { Distribution, DistributionSerialization } from "../../domain/distribution";
import { MarkovMatrix, MarkovMatrixSerialization } from "../../domain/matrix";

test('Null Parameters', () => {
    let blog = new Blog();

    expect(blog.url).toEqual('');
    expect(blog.latestAccessedPostDate).toEqual(DEFAULT_POST_DATE);
    expect(blog.matrix).toEqual(new MarkovMatrix());
});

test('Preservation through serialization', () => {
    let mms = new MarkovMatrixSerialization(
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
    let mm = new MarkovMatrix(mms);

    let date = new Date();
    let blog = new Blog('test', date, mm);

    let blogS = blog.serialize();
    let blog2 = blogS.deserialize();
    let blogS2 = blog2.serialize();

    expect(blog).toEqual(blog2);
    expect(blogS).toEqual(blogS2);
});