import { MarkovMatrix } from "./matrix";

export const DEFAULT_POST_DATE = new Date(0);

export class Blog {
    //string
    url;

    //Date
    latestAccessedPostDate;

    //MarkovMatrix
    matrix;

    constructor(url = '', date = DEFAULT_POST_DATE, matrix = null) {
        this.url = url;
        this.latestAccessedPostDate = date;
        this.matrix = matrix ?? new MarkovMatrix();
    }

    serialize() {
        return new BlogSerialization(
            this.url,
            this.latestAccessedPostDate,
            this.matrix
        );
    }
}

export class BlogSerialization {
    //string
    url;

    //string
    dateString;

    //MarkovMatrixSerialization
    matrix;

    constructor(url = '', date = DEFAULT_POST_DATE, matrix = null) {
        this.url = url;
        this.dateString = date.toISOString();
        this.matrix = (matrix ?? new MarkovMatrix()).serialize();
    }

    deserialize() {
        return new Blog(
            this.url,
            new Date(this.dateString),
            new MarkovMatrix(this.matrix)
        )
    }
}