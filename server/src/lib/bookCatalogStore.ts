// Deliberate, scoped deviation from repo convention: every other lab is one
// in-memory array with a single implementation. This lab needs a real
// Azure SQL-backed store *and* an in-memory fallback so CI stays hermetic
// without cloud credentials or a DB service container — see SPEC.md's
// Resolved Decisions table (#5) for the rationale. Do not treat this as a
// pattern to copy for future labs without the same tradeoff.
import sql from 'mssql';
import { ensureBookCatalogSchema, getPool } from './db';

export type SortDirection = 'asc' | 'desc';
export type AuthorSort = 'name' | 'birthYear';
export type BookSort = 'title' | 'publishedYear' | 'rating';

export interface AuthorRow {
  id: number;
  name: string;
  country: string;
  birthYear: number;
}

export interface BookRow {
  id: number;
  title: string;
  authorId: number;
  genre: string;
  publishedYear: number;
  rating: number;
}

export interface CatalogRow {
  id: number;
  title: string;
  genre: string;
  publishedYear: number;
  rating: number;
  authorName: string;
  authorCountry: string;
}

export interface AuthorQuery {
  page: number;
  pageSize: number;
  search?: string | undefined;
  country?: string | undefined;
  sort: AuthorSort;
  direction: SortDirection;
}

export interface BookQuery {
  page: number;
  pageSize: number;
  search?: string | undefined;
  genre?: string | undefined;
  sort: BookSort;
  direction: SortDirection;
}

export interface CatalogQuery {
  page: number;
  pageSize: number;
  genre?: string | undefined;
  country?: string | undefined;
  sort: BookSort;
  direction: SortDirection;
}

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  /** The literal query text executed (parameter values filled in), for the UI to display. Never used for execution. */
  sql: string;
}

export interface BookCatalogStore {
  listAuthors(params: AuthorQuery): Promise<Page<AuthorRow>>;
  listBooks(params: BookQuery): Promise<Page<BookRow>>;
  listCatalog(params: CatalogQuery): Promise<Page<CatalogRow>>;
  reseed(): Promise<{ ok: true; seededAuthors: number; seededBooks: number }>;
}

interface SeedAuthor {
  name: string;
  country: string;
  birthYear: number;
}

interface SeedBook {
  title: string;
  authorIndex: number;
  genre: string;
  publishedYear: number;
  rating: number;
}

// Deterministic, hand-authored fixture data (no randomness) so both store
// implementations produce identical results. authorIndex is a 0-based index
// into SEED_AUTHORS; both stores assign AuthorId = authorIndex + 1, relying
// on Authors being (re)seeded in this same order every time.
const SEED_AUTHORS: SeedAuthor[] = [
  { name: 'Jane Austen', country: 'United Kingdom', birthYear: 1775 },
  { name: 'George Orwell', country: 'United Kingdom', birthYear: 1903 },
  { name: 'Gabriel Garcia Marquez', country: 'Colombia', birthYear: 1927 },
  { name: 'Isabel Allende', country: 'Chile', birthYear: 1942 },
  { name: 'Haruki Murakami', country: 'Japan', birthYear: 1949 },
  { name: 'Banana Yoshimoto', country: 'Japan', birthYear: 1964 },
  { name: 'Chinua Achebe', country: 'Nigeria', birthYear: 1930 },
  { name: 'Chimamanda Ngozi Adichie', country: 'Nigeria', birthYear: 1977 },
  { name: 'Toni Morrison', country: 'United States', birthYear: 1931 },
  { name: 'Mark Twain', country: 'United States', birthYear: 1835 },
  { name: 'Kazuo Ishiguro', country: 'United Kingdom', birthYear: 1954 },
  { name: 'Margaret Atwood', country: 'Canada', birthYear: 1939 },
];

const SEED_BOOKS: SeedBook[] = [
  {
    title: 'Pride and Prejudice',
    authorIndex: 0,
    genre: 'Classic',
    publishedYear: 1813,
    rating: 4.7,
  },
  {
    title: 'Sense and Sensibility',
    authorIndex: 0,
    genre: 'Classic',
    publishedYear: 1811,
    rating: 4.4,
  },
  {
    title: 'Nineteen Eighty-Four',
    authorIndex: 1,
    genre: 'Dystopian',
    publishedYear: 1949,
    rating: 4.8,
  },
  { title: 'Animal Farm', authorIndex: 1, genre: 'Dystopian', publishedYear: 1945, rating: 4.5 },
  {
    title: 'Homage to Catalonia',
    authorIndex: 1,
    genre: 'Nonfiction',
    publishedYear: 1938,
    rating: 4.3,
  },
  {
    title: 'One Hundred Years of Solitude',
    authorIndex: 2,
    genre: 'Fiction',
    publishedYear: 1967,
    rating: 4.6,
  },
  {
    title: 'Love in the Time of Cholera',
    authorIndex: 2,
    genre: 'Romance',
    publishedYear: 1985,
    rating: 4.4,
  },
  {
    title: 'The House of the Spirits',
    authorIndex: 3,
    genre: 'Fiction',
    publishedYear: 1982,
    rating: 4.5,
  },
  { title: 'Eva Luna', authorIndex: 3, genre: 'Fiction', publishedYear: 1987, rating: 4.1 },
  { title: 'Norwegian Wood', authorIndex: 4, genre: 'Fiction', publishedYear: 1987, rating: 4.2 },
  {
    title: 'Kafka on the Shore',
    authorIndex: 4,
    genre: 'Fiction',
    publishedYear: 2002,
    rating: 4.5,
  },
  { title: '1Q84', authorIndex: 4, genre: 'Fiction', publishedYear: 2009, rating: 4.3 },
  { title: 'Kitchen', authorIndex: 5, genre: 'Fiction', publishedYear: 1988, rating: 4.0 },
  { title: 'Goodbye Tsugumi', authorIndex: 5, genre: 'Fiction', publishedYear: 1989, rating: 3.9 },
  {
    title: 'Things Fall Apart',
    authorIndex: 6,
    genre: 'Classic',
    publishedYear: 1958,
    rating: 4.5,
  },
  {
    title: 'No Longer at Ease',
    authorIndex: 6,
    genre: 'Fiction',
    publishedYear: 1960,
    rating: 4.0,
  },
  {
    title: 'Half of a Yellow Sun',
    authorIndex: 7,
    genre: 'Fiction',
    publishedYear: 2006,
    rating: 4.6,
  },
  { title: 'Americanah', authorIndex: 7, genre: 'Fiction', publishedYear: 2013, rating: 4.5 },
  { title: 'Purple Hibiscus', authorIndex: 7, genre: 'Fiction', publishedYear: 2003, rating: 4.3 },
  { title: 'Beloved', authorIndex: 8, genre: 'Classic', publishedYear: 1987, rating: 4.5 },
  { title: 'Song of Solomon', authorIndex: 8, genre: 'Fiction', publishedYear: 1977, rating: 4.4 },
  {
    title: 'The Adventures of Huckleberry Finn',
    authorIndex: 9,
    genre: 'Classic',
    publishedYear: 1884,
    rating: 4.3,
  },
  {
    title: 'The Adventures of Tom Sawyer',
    authorIndex: 9,
    genre: 'Classic',
    publishedYear: 1876,
    rating: 4.1,
  },
  {
    title: "A Connecticut Yankee in King Arthur's Court",
    authorIndex: 9,
    genre: 'Fantasy',
    publishedYear: 1889,
    rating: 3.9,
  },
  {
    title: 'The Remains of the Day',
    authorIndex: 10,
    genre: 'Fiction',
    publishedYear: 1989,
    rating: 4.6,
  },
  { title: 'Never Let Me Go', authorIndex: 10, genre: 'Sci-Fi', publishedYear: 2005, rating: 4.5 },
  {
    title: 'Klara and the Sun',
    authorIndex: 10,
    genre: 'Sci-Fi',
    publishedYear: 2021,
    rating: 4.2,
  },
  {
    title: "The Handmaid's Tale",
    authorIndex: 11,
    genre: 'Dystopian',
    publishedYear: 1985,
    rating: 4.7,
  },
  { title: 'Oryx and Crake', authorIndex: 11, genre: 'Sci-Fi', publishedYear: 2003, rating: 4.3 },
  { title: 'Alias Grace', authorIndex: 11, genre: 'Historical', publishedYear: 1996, rating: 4.2 },
];

function buildSeedAuthorRows(): AuthorRow[] {
  return SEED_AUTHORS.map((author, index) => ({ id: index + 1, ...author }));
}

function buildSeedBookRows(): BookRow[] {
  return SEED_BOOKS.map((book, index) => ({
    id: index + 1,
    title: book.title,
    authorId: book.authorIndex + 1,
    genre: book.genre,
    publishedYear: book.publishedYear,
    rating: book.rating,
  }));
}

function paginate<T>(items: T[], page: number, pageSize: number): { items: T[]; hasMore: boolean } {
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), hasMore: start + pageSize < items.length };
}

function displayLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

const AUTHOR_SORT_COLUMN: Record<AuthorSort, string> = { name: 'Name', birthYear: 'BirthYear' };
const BOOK_SORT_COLUMN: Record<BookSort, string> = {
  title: 'Title',
  publishedYear: 'PublishedYear',
  rating: 'Rating',
};

export class InMemoryBookCatalogStore implements BookCatalogStore {
  private authors: AuthorRow[] = buildSeedAuthorRows();
  private books: BookRow[] = buildSeedBookRows();

  listAuthors(params: AuthorQuery): Promise<Page<AuthorRow>> {
    const filtered = this.authors
      .filter(
        (a) =>
          (!params.search || a.name.toLowerCase().includes(params.search.toLowerCase())) &&
          (!params.country || a.country === params.country),
      )
      .sort((a, b) => {
        const diff =
          params.sort === 'name' ? a.name.localeCompare(b.name) : a.birthYear - b.birthYear;
        return params.direction === 'asc' ? diff : -diff;
      });

    const { items, hasMore } = paginate(filtered, params.page, params.pageSize);
    const conditions: string[] = [];
    if (params.search) conditions.push(`Name LIKE ${displayLiteral(`%${params.search}%`)}`);
    if (params.country) conditions.push(`Country = ${displayLiteral(params.country)}`);
    const whereClause = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
    const sqlText = `SELECT Id, Name, Country, BirthYear FROM Authors${whereClause} ORDER BY ${AUTHOR_SORT_COLUMN[params.sort]} ${params.direction.toUpperCase()}`;

    return Promise.resolve({
      items,
      page: params.page,
      pageSize: params.pageSize,
      total: filtered.length,
      hasMore,
      sql: sqlText,
    });
  }

  listBooks(params: BookQuery): Promise<Page<BookRow>> {
    const filtered = this.books
      .filter(
        (b) =>
          (!params.search || b.title.toLowerCase().includes(params.search.toLowerCase())) &&
          (!params.genre || b.genre === params.genre),
      )
      .sort((a, b) => {
        const diff =
          params.sort === 'title'
            ? a.title.localeCompare(b.title)
            : params.sort === 'publishedYear'
              ? a.publishedYear - b.publishedYear
              : a.rating - b.rating;
        return params.direction === 'asc' ? diff : -diff;
      });

    const { items, hasMore } = paginate(filtered, params.page, params.pageSize);
    const conditions: string[] = [];
    if (params.search) conditions.push(`Title LIKE ${displayLiteral(`%${params.search}%`)}`);
    if (params.genre) conditions.push(`Genre = ${displayLiteral(params.genre)}`);
    const whereClause = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
    const sqlText = `SELECT Id, Title, AuthorId, Genre, PublishedYear, Rating FROM Books${whereClause} ORDER BY ${BOOK_SORT_COLUMN[params.sort]} ${params.direction.toUpperCase()}`;

    return Promise.resolve({
      items,
      page: params.page,
      pageSize: params.pageSize,
      total: filtered.length,
      hasMore,
      sql: sqlText,
    });
  }

  listCatalog(params: CatalogQuery): Promise<Page<CatalogRow>> {
    const authorsById = new Map(this.authors.map((a) => [a.id, a]));
    const joined = this.books
      .map((b) => {
        const author = authorsById.get(b.authorId);
        return author
          ? ({
              id: b.id,
              title: b.title,
              genre: b.genre,
              publishedYear: b.publishedYear,
              rating: b.rating,
              authorName: author.name,
              authorCountry: author.country,
            } satisfies CatalogRow)
          : undefined;
      })
      .filter((row): row is CatalogRow => row !== undefined)
      .filter(
        (row) =>
          (!params.genre || row.genre === params.genre) &&
          (!params.country || row.authorCountry === params.country),
      )
      .sort((a, b) => {
        const diff =
          params.sort === 'title'
            ? a.title.localeCompare(b.title)
            : params.sort === 'publishedYear'
              ? a.publishedYear - b.publishedYear
              : a.rating - b.rating;
        return params.direction === 'asc' ? diff : -diff;
      });

    const { items, hasMore } = paginate(joined, params.page, params.pageSize);
    const conditions: string[] = [];
    if (params.genre) conditions.push(`b.Genre = ${displayLiteral(params.genre)}`);
    if (params.country) conditions.push(`a.Country = ${displayLiteral(params.country)}`);
    const whereClause = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
    const sqlText =
      'SELECT b.Id, b.Title, b.Genre, b.PublishedYear, b.Rating, a.Name AS AuthorName, a.Country AS AuthorCountry ' +
      `FROM Books b JOIN Authors a ON b.AuthorId = a.Id${whereClause} ORDER BY ${BOOK_SORT_COLUMN[params.sort]} ${params.direction.toUpperCase()}`;

    return Promise.resolve({
      items,
      page: params.page,
      pageSize: params.pageSize,
      total: joined.length,
      hasMore,
      sql: sqlText,
    });
  }

  reseed(): Promise<{ ok: true; seededAuthors: number; seededBooks: number }> {
    this.authors = buildSeedAuthorRows();
    this.books = buildSeedBookRows();
    return Promise.resolve({
      ok: true,
      seededAuthors: this.authors.length,
      seededBooks: this.books.length,
    });
  }
}

// Only exercised against a live Azure SQL connection — covered by the
// guarded, skip-by-default bookCatalogStore.azureSql.test.ts, not the default
// in-memory-store test run. See SPEC.md Resolved Decisions #5.
/* v8 ignore start */
export class SqlBookCatalogStore implements BookCatalogStore {
  private async ready(): Promise<sql.ConnectionPool> {
    const pool = await getPool();
    await ensureBookCatalogSchema(pool);
    return pool;
  }

  async listAuthors(params: AuthorQuery): Promise<Page<AuthorRow>> {
    const pool = await this.ready();

    const conditions: string[] = [];
    if (params.search) conditions.push('Name LIKE @search');
    if (params.country) conditions.push('Country = @country');
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderClause = `ORDER BY ${AUTHOR_SORT_COLUMN[params.sort]} ${params.direction.toUpperCase()}`;

    const bindFilters = (request: sql.Request): void => {
      if (params.search) request.input('search', sql.NVarChar(100), `%${params.search}%`);
      if (params.country) request.input('country', sql.NVarChar(60), params.country);
    };

    const countRequest = pool.request();
    bindFilters(countRequest);
    const countResult = await countRequest.query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM Authors ${whereClause}`,
    );
    const total = Number(countResult.recordset[0]?.total ?? 0);

    const offset = (params.page - 1) * params.pageSize;
    const itemsRequest = pool.request();
    bindFilters(itemsRequest);
    itemsRequest.input('offset', sql.Int, offset);
    itemsRequest.input('pageSize', sql.Int, params.pageSize);
    const itemsResult = await itemsRequest.query<{
      Id: number;
      Name: string;
      Country: string;
      BirthYear: number;
    }>(
      `SELECT Id, Name, Country, BirthYear FROM Authors ${whereClause} ${orderClause} OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`,
    );

    const items: AuthorRow[] = itemsResult.recordset.map((row) => ({
      id: row.Id,
      name: row.Name,
      country: row.Country,
      birthYear: row.BirthYear,
    }));

    const displayConditions: string[] = [];
    if (params.search) displayConditions.push(`Name LIKE ${displayLiteral(`%${params.search}%`)}`);
    if (params.country) displayConditions.push(`Country = ${displayLiteral(params.country)}`);
    const displayWhere = displayConditions.length
      ? ` WHERE ${displayConditions.join(' AND ')}`
      : '';

    return {
      items,
      page: params.page,
      pageSize: params.pageSize,
      total,
      hasMore: offset + params.pageSize < total,
      sql: `SELECT Id, Name, Country, BirthYear FROM Authors${displayWhere} ${orderClause}`,
    };
  }

  async listBooks(params: BookQuery): Promise<Page<BookRow>> {
    const pool = await this.ready();

    const conditions: string[] = [];
    if (params.search) conditions.push('Title LIKE @search');
    if (params.genre) conditions.push('Genre = @genre');
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderClause = `ORDER BY ${BOOK_SORT_COLUMN[params.sort]} ${params.direction.toUpperCase()}`;

    const bindFilters = (request: sql.Request): void => {
      if (params.search) request.input('search', sql.NVarChar(200), `%${params.search}%`);
      if (params.genre) request.input('genre', sql.NVarChar(40), params.genre);
    };

    const countRequest = pool.request();
    bindFilters(countRequest);
    const countResult = await countRequest.query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM Books ${whereClause}`,
    );
    const total = Number(countResult.recordset[0]?.total ?? 0);

    const offset = (params.page - 1) * params.pageSize;
    const itemsRequest = pool.request();
    bindFilters(itemsRequest);
    itemsRequest.input('offset', sql.Int, offset);
    itemsRequest.input('pageSize', sql.Int, params.pageSize);
    const itemsResult = await itemsRequest.query<{
      Id: number;
      Title: string;
      AuthorId: number;
      Genre: string;
      PublishedYear: number;
      Rating: number;
    }>(
      `SELECT Id, Title, AuthorId, Genre, PublishedYear, Rating FROM Books ${whereClause} ${orderClause} OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`,
    );

    const items: BookRow[] = itemsResult.recordset.map((row) => ({
      id: row.Id,
      title: row.Title,
      authorId: row.AuthorId,
      genre: row.Genre,
      publishedYear: row.PublishedYear,
      rating: row.Rating,
    }));

    const displayConditions: string[] = [];
    if (params.search) displayConditions.push(`Title LIKE ${displayLiteral(`%${params.search}%`)}`);
    if (params.genre) displayConditions.push(`Genre = ${displayLiteral(params.genre)}`);
    const displayWhere = displayConditions.length
      ? ` WHERE ${displayConditions.join(' AND ')}`
      : '';

    return {
      items,
      page: params.page,
      pageSize: params.pageSize,
      total,
      hasMore: offset + params.pageSize < total,
      sql: `SELECT Id, Title, AuthorId, Genre, PublishedYear, Rating FROM Books${displayWhere} ${orderClause}`,
    };
  }

  async listCatalog(params: CatalogQuery): Promise<Page<CatalogRow>> {
    const pool = await this.ready();

    const conditions: string[] = [];
    if (params.genre) conditions.push('b.Genre = @genre');
    if (params.country) conditions.push('a.Country = @country');
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderClause = `ORDER BY ${BOOK_SORT_COLUMN[params.sort]} ${params.direction.toUpperCase()}`;
    const fromClause = 'FROM Books b JOIN Authors a ON b.AuthorId = a.Id';

    const bindFilters = (request: sql.Request): void => {
      if (params.genre) request.input('genre', sql.NVarChar(40), params.genre);
      if (params.country) request.input('country', sql.NVarChar(60), params.country);
    };

    const countRequest = pool.request();
    bindFilters(countRequest);
    const countResult = await countRequest.query<{ total: number }>(
      `SELECT COUNT(*) AS total ${fromClause} ${whereClause}`,
    );
    const total = Number(countResult.recordset[0]?.total ?? 0);

    const offset = (params.page - 1) * params.pageSize;
    const itemsRequest = pool.request();
    bindFilters(itemsRequest);
    itemsRequest.input('offset', sql.Int, offset);
    itemsRequest.input('pageSize', sql.Int, params.pageSize);
    const itemsResult = await itemsRequest.query<{
      Id: number;
      Title: string;
      Genre: string;
      PublishedYear: number;
      Rating: number;
      AuthorName: string;
      AuthorCountry: string;
    }>(
      `SELECT b.Id, b.Title, b.Genre, b.PublishedYear, b.Rating, a.Name AS AuthorName, a.Country AS AuthorCountry ${fromClause} ${whereClause} ${orderClause} OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`,
    );

    const items: CatalogRow[] = itemsResult.recordset.map((row) => ({
      id: row.Id,
      title: row.Title,
      genre: row.Genre,
      publishedYear: row.PublishedYear,
      rating: row.Rating,
      authorName: row.AuthorName,
      authorCountry: row.AuthorCountry,
    }));

    const displayConditions: string[] = [];
    if (params.genre) displayConditions.push(`b.Genre = ${displayLiteral(params.genre)}`);
    if (params.country) displayConditions.push(`a.Country = ${displayLiteral(params.country)}`);
    const displayWhere = displayConditions.length
      ? ` WHERE ${displayConditions.join(' AND ')}`
      : '';

    return {
      items,
      page: params.page,
      pageSize: params.pageSize,
      total,
      hasMore: offset + params.pageSize < total,
      sql:
        'SELECT b.Id, b.Title, b.Genre, b.PublishedYear, b.Rating, a.Name AS AuthorName, a.Country AS AuthorCountry ' +
        `${fromClause}${displayWhere} ${orderClause}`,
    };
  }

  async reseed(): Promise<{ ok: true; seededAuthors: number; seededBooks: number }> {
    const pool = await this.ready();

    // Books has a FK to Authors, so TRUNCATE (disallowed on a referenced
    // parent table) is replaced with DELETE + an explicit identity reseed —
    // this keeps generated ids deterministic across reseeds, same as TRUNCATE
    // would, while respecting the FK relationship the JOIN depends on.
    await pool.request().batch(`
      DELETE FROM Books;
      DELETE FROM Authors;
      DBCC CHECKIDENT ('Authors', RESEED, 0);
      DBCC CHECKIDENT ('Books', RESEED, 0);
    `);

    for (const author of SEED_AUTHORS) {
      const request = pool.request();
      request.input('name', sql.NVarChar(100), author.name);
      request.input('country', sql.NVarChar(60), author.country);
      request.input('birthYear', sql.Int, author.birthYear);
      await request.query(
        'INSERT INTO Authors (Name, Country, BirthYear) VALUES (@name, @country, @birthYear)',
      );
    }

    for (const book of SEED_BOOKS) {
      const request = pool.request();
      request.input('title', sql.NVarChar(200), book.title);
      request.input('authorId', sql.Int, book.authorIndex + 1);
      request.input('genre', sql.NVarChar(40), book.genre);
      request.input('publishedYear', sql.Int, book.publishedYear);
      request.input('rating', sql.Decimal(3, 1), book.rating);
      await request.query(
        'INSERT INTO Books (Title, AuthorId, Genre, PublishedYear, Rating) VALUES (@title, @authorId, @genre, @publishedYear, @rating)',
      );
    }

    return { ok: true, seededAuthors: SEED_AUTHORS.length, seededBooks: SEED_BOOKS.length };
  }
}
/* v8 ignore stop */

let storeInstance: BookCatalogStore | undefined;

export function getBookCatalogStore(): BookCatalogStore {
  if (!storeInstance) {
    // The SQL branch is only reachable with a real Azure SQL connection string —
    // not exercised by the default in-memory-store test run.
    /* v8 ignore next 3 */
    storeInstance = process.env.AZURE_SQL_CONNECTION_STRING
      ? new SqlBookCatalogStore()
      : new InMemoryBookCatalogStore();
  }
  return storeInstance;
}
