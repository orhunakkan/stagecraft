export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Stagecraft API',
    version: '1.0.0',
    description:
      'Fixture HTTP APIs for the Stagecraft Playwright practice application. Data is in-memory and resets when the server restarts.',
  },
  servers: [{ url: '/' }],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Passkey' },
    { name: 'Notes' },
    { name: 'Tasks' },
    { name: 'Products' },
    { name: 'Service Workers' },
    { name: 'Feed' },
    { name: 'SSE' },
    { name: 'Book Catalog' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Check server health',
        operationId: 'getHealth',
        responses: {
          '200': {
            description: 'Server is healthy.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' },
              },
            },
          },
        },
      },
    },
    '/ready': {
      get: {
        tags: ['Health'],
        summary: 'Check server readiness',
        operationId: 'getReady',
        responses: {
          '200': {
            description: 'Server is ready to accept traffic.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReadyResponse' },
              },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Create a fake session',
        operationId: 'login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login succeeded.',
            headers: {
              'Set-Cookie': {
                description: 'Session cookie named connect.sid.',
                schema: { type: 'string' },
              },
            },
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Return the current session user',
        operationId: 'getCurrentUser',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Current user.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Destroy the current session',
        operationId: 'logout',
        security: [{ cookieAuth: [] }],
        responses: {
          '204': { description: 'Logout succeeded.' },
        },
      },
    },
    '/api/auth/admin/stats': {
      get: {
        tags: ['Auth'],
        summary: 'Return admin-only fixture stats',
        operationId: 'getAdminStats',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Admin stats.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AdminStats' },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/passkey/register/challenge': {
      get: {
        tags: ['Passkey'],
        summary: 'Issue a WebAuthn registration challenge for the demo user',
        operationId: 'getPasskeyRegistrationChallenge',
        responses: {
          '200': {
            description: 'Registration options.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PasskeyRegistrationOptions' },
              },
            },
          },
        },
      },
    },
    '/api/passkey/register': {
      post: {
        tags: ['Passkey'],
        summary: 'Store a newly created passkey credential in the current session',
        operationId: 'registerPasskey',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PasskeyCredentialRequest' },
            },
          },
        },
        responses: {
          '201': { description: 'Credential registered.' },
          '400': { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/api/passkey/login/challenge': {
      get: {
        tags: ['Passkey'],
        summary: 'Issue a WebAuthn sign-in challenge listing known credential ids',
        operationId: 'getPasskeyLoginChallenge',
        responses: {
          '200': {
            description: 'Sign-in options.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PasskeyLoginOptions' },
              },
            },
          },
        },
      },
    },
    '/api/passkey/login': {
      post: {
        tags: ['Passkey'],
        summary: 'Sign in with a previously registered passkey credential id',
        operationId: 'loginWithPasskey',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PasskeyCredentialRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Sign-in succeeded.',
            headers: {
              'Set-Cookie': {
                description: 'Session cookie named connect.sid.',
                schema: { type: 'string' },
              },
            },
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PasskeyUser' },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/passkey/me': {
      get: {
        tags: ['Passkey'],
        summary: 'Return the current passkey session user',
        operationId: 'getPasskeyCurrentUser',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Current user.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PasskeyUser' },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/passkey/logout': {
      post: {
        tags: ['Passkey'],
        summary: 'Destroy the current passkey session',
        operationId: 'logoutPasskey',
        security: [{ cookieAuth: [] }],
        responses: {
          '204': { description: 'Logout succeeded.' },
        },
      },
    },
    '/api/notes': {
      get: {
        tags: ['Notes'],
        summary: 'List notes',
        operationId: 'listNotes',
        responses: {
          '200': {
            description: 'Notes.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Note' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Notes'],
        summary: 'Create a note',
        operationId: 'createNote',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateNoteRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Created note.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Note' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/api/notes/{id}': {
      delete: {
        tags: ['Notes'],
        summary: 'Delete a note',
        operationId: 'deleteNote',
        parameters: [{ $ref: '#/components/parameters/NumericId' }],
        responses: {
          '204': { description: 'Note deleted.' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'List tasks',
        operationId: 'listTasks',
        responses: {
          '200': {
            description: 'Tasks.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Task' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Tasks'],
        summary: 'Create a task',
        operationId: 'createTask',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateTaskRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Created task.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Task' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/api/tasks/{id}': {
      put: {
        tags: ['Tasks'],
        summary: 'Update a task',
        operationId: 'updateTask',
        parameters: [{ $ref: '#/components/parameters/NumericId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateTaskRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Updated task.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Task' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Delete a task',
        operationId: 'deleteTask',
        parameters: [{ $ref: '#/components/parameters/NumericId' }],
        responses: {
          '204': { description: 'Task deleted.' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'List products',
        operationId: 'listProducts',
        responses: {
          '200': {
            description: 'Products.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Product' },
                },
              },
            },
          },
        },
      },
    },
    '/api/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get a product',
        operationId: 'getProduct',
        parameters: [{ $ref: '#/components/parameters/NumericId' }],
        responses: {
          '200': {
            description: 'Product.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/sw-items': {
      get: {
        tags: ['Service Workers'],
        summary: 'List fresh service worker lab items',
        operationId: 'listServiceWorkerItems',
        responses: {
          '200': {
            description: 'Fresh server data used by the service worker lab.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/ServiceWorkerItem' },
                },
              },
            },
          },
        },
      },
    },
    '/api/feed': {
      get: {
        tags: ['Feed'],
        summary: 'Paginated activity feed',
        operationId: 'getFeed',
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: '1-based page number.',
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'pageSize',
            in: 'query',
            description: 'Number of items per page (1–100).',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
        ],
        responses: {
          '200': {
            description: 'A page of feed items.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/FeedPage' },
              },
            },
          },
        },
      },
    },
    '/api/sse': {
      get: {
        tags: ['SSE'],
        summary: 'Stream build/deploy status events',
        operationId: 'getSseStream',
        description:
          'Opens a Server-Sent Events stream that emits `log` events (info / warn / error) at 600 ms intervals, followed by a `done` event when the sequence is complete.',
        responses: {
          '200': {
            description: 'SSE stream of build events.',
            content: {
              'text/event-stream': {
                schema: { type: 'string' },
              },
            },
          },
        },
      },
    },
    '/api/book-catalog/authors': {
      get: {
        tags: ['Book Catalog'],
        summary: 'Run a SELECT query against the Authors table',
        operationId: 'getBookCatalogAuthors',
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: '1-based page number.',
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'pageSize',
            in: 'query',
            description: 'Number of items per page (1–100).',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
          {
            name: 'search',
            in: 'query',
            description: 'Case-insensitive substring match against author name.',
            schema: { type: 'string' },
          },
          {
            name: 'country',
            in: 'query',
            description: 'Exact match against author country.',
            schema: { type: 'string' },
          },
          {
            name: 'sort',
            in: 'query',
            schema: { type: 'string', enum: ['name', 'birthYear'], default: 'name' },
          },
          {
            name: 'direction',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
          },
        ],
        responses: {
          '200': {
            description: 'A page of authors, plus the literal SQL that was executed.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthorPage' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/api/book-catalog/books': {
      get: {
        tags: ['Book Catalog'],
        summary: 'Run a SELECT query against the Books table',
        operationId: 'getBookCatalogBooks',
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: '1-based page number.',
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'pageSize',
            in: 'query',
            description: 'Number of items per page (1–100).',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
          {
            name: 'search',
            in: 'query',
            description: 'Case-insensitive substring match against book title.',
            schema: { type: 'string' },
          },
          {
            name: 'genre',
            in: 'query',
            description: 'Exact match against book genre.',
            schema: { type: 'string' },
          },
          {
            name: 'sort',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['title', 'publishedYear', 'rating'],
              default: 'title',
            },
          },
          {
            name: 'direction',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
          },
        ],
        responses: {
          '200': {
            description: 'A page of books, plus the literal SQL that was executed.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BookPage' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/api/book-catalog/catalog': {
      get: {
        tags: ['Book Catalog'],
        summary: 'Run a JOIN query between Books and Authors',
        operationId: 'getBookCatalogCatalog',
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: '1-based page number.',
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'pageSize',
            in: 'query',
            description: 'Number of items per page (1–100).',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
          {
            name: 'genre',
            in: 'query',
            description: 'Exact match against book genre.',
            schema: { type: 'string' },
          },
          {
            name: 'country',
            in: 'query',
            description: 'Exact match against the joined author country.',
            schema: { type: 'string' },
          },
          {
            name: 'sort',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['title', 'publishedYear', 'rating'],
              default: 'title',
            },
          },
          {
            name: 'direction',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
          },
        ],
        responses: {
          '200': {
            description:
              'A page of books joined with their author, plus the literal SQL that was executed.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CatalogPage' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/api/book-catalog/reseed': {
      post: {
        tags: ['Book Catalog'],
        summary: 'Reset Authors and Books to their deterministic fixture data',
        operationId: 'reseedBookCatalog',
        responses: {
          '200': {
            description: 'Reseed completed.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BookCatalogReseedResponse' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'connect.sid',
      },
    },
    parameters: {
      NumericId: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer', minimum: 1 },
      },
    },
    responses: {
      BadRequest: {
        description: 'Bad request.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      Unauthorized: {
        description: 'Not authenticated or invalid credentials.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      Forbidden: {
        description: 'Authenticated but not authorized.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      NotFound: {
        description: 'Resource not found.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
    },
    schemas: {
      HealthResponse: {
        type: 'object',
        required: ['ok'],
        properties: {
          ok: { type: 'boolean', example: true },
        },
      },
      ReadyResponse: {
        type: 'object',
        required: ['ready'],
        properties: {
          ready: { type: 'boolean', example: true },
        },
      },
      ErrorResponse: {
        type: 'object',
        required: ['error'],
        properties: {
          error: { type: 'string' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', example: 'alice' },
          password: { type: 'string', example: 'password123' },
        },
      },
      User: {
        type: 'object',
        required: ['id', 'username', 'displayName', 'role'],
        properties: {
          id: { type: 'integer', example: 1 },
          username: { type: 'string', example: 'alice' },
          displayName: { type: 'string', example: 'Alice Chen' },
          role: { type: 'string', enum: ['admin', 'user'], example: 'admin' },
        },
      },
      AdminStats: {
        type: 'object',
        required: ['totalUsers', 'pendingReviews'],
        properties: {
          totalUsers: { type: 'integer', example: 2 },
          pendingReviews: { type: 'integer', example: 3 },
        },
      },
      PasskeyRegistrationOptions: {
        type: 'object',
        required: ['challenge', 'rpId', 'rpName', 'userId', 'userName', 'userDisplayName'],
        properties: {
          challenge: { type: 'string', example: 'Y2hhbGxlbmdl' },
          rpId: { type: 'string', example: 'localhost' },
          rpName: { type: 'string', example: 'Stagecraft Labs' },
          userId: { type: 'string', example: 'MQ' },
          userName: { type: 'string', example: 'alice' },
          userDisplayName: { type: 'string', example: 'Alice Chen' },
        },
      },
      PasskeyLoginOptions: {
        type: 'object',
        required: ['challenge', 'allowCredentialIds'],
        properties: {
          challenge: { type: 'string', example: 'Y2hhbGxlbmdl' },
          allowCredentialIds: { type: 'array', items: { type: 'string' } },
        },
      },
      PasskeyCredentialRequest: {
        type: 'object',
        required: ['credentialId'],
        properties: {
          credentialId: { type: 'string', example: 'test-credential-id' },
          publicKey: {
            type: 'string',
            description: 'Optional base64url-encoded credential public key from registration.',
          },
        },
      },
      PasskeyUser: {
        type: 'object',
        required: ['id', 'username', 'displayName'],
        properties: {
          id: { type: 'integer', example: 1 },
          username: { type: 'string', example: 'alice' },
          displayName: { type: 'string', example: 'Alice Chen' },
        },
      },
      Note: {
        type: 'object',
        required: ['id', 'text', 'createdAt'],
        properties: {
          id: { type: 'integer', example: 1 },
          text: { type: 'string', example: 'Intercept network requests with page.route()' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateNoteRequest: {
        type: 'object',
        required: ['text'],
        properties: {
          text: { type: 'string', example: 'Use waitForResponse() to synchronize on API calls' },
        },
      },
      Task: {
        type: 'object',
        required: ['id', 'title', 'done', 'createdAt'],
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Write a Playwright test' },
          done: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateTaskRequest: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', example: 'Seed data via API before UI test' },
        },
      },
      UpdateTaskRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', example: 'Updated task title' },
          done: { type: 'boolean', example: true },
        },
        minProperties: 1,
      },
      Product: {
        type: 'object',
        required: ['id', 'name', 'category', 'price', 'inStock'],
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Mechanical Keyboard' },
          category: { type: 'string', example: 'Peripherals' },
          price: { type: 'number', example: 149.99 },
          inStock: { type: 'boolean', example: true },
        },
      },
      ServiceWorkerItem: {
        type: 'object',
        required: ['id', 'name', 'source'],
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Fresh Widget' },
          source: { type: 'string', enum: ['network'], example: 'network' },
        },
      },
      FeedItem: {
        type: 'object',
        required: ['id', 'title', 'body', 'createdAt'],
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Deployed new feature' },
          body: { type: 'string', example: 'Rolled out dark mode to all users.' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-05-01T08:00:00Z' },
        },
      },
      FeedPage: {
        type: 'object',
        required: ['items', 'page', 'pageSize', 'total', 'hasMore'],
        properties: {
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/FeedItem' },
          },
          page: { type: 'integer', example: 1 },
          pageSize: { type: 'integer', example: 8 },
          total: { type: 'integer', example: 42 },
          hasMore: { type: 'boolean', example: true },
        },
      },
      Author: {
        type: 'object',
        required: ['id', 'name', 'country', 'birthYear'],
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Jane Austen' },
          country: { type: 'string', example: 'United Kingdom' },
          birthYear: { type: 'integer', example: 1775 },
        },
      },
      Book: {
        type: 'object',
        required: ['id', 'title', 'authorId', 'genre', 'publishedYear', 'rating'],
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Pride and Prejudice' },
          authorId: { type: 'integer', example: 1 },
          genre: { type: 'string', example: 'Classic' },
          publishedYear: { type: 'integer', example: 1813 },
          rating: { type: 'number', example: 4.7 },
        },
      },
      CatalogEntry: {
        type: 'object',
        required: [
          'id',
          'title',
          'genre',
          'publishedYear',
          'rating',
          'authorName',
          'authorCountry',
        ],
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Pride and Prejudice' },
          genre: { type: 'string', example: 'Classic' },
          publishedYear: { type: 'integer', example: 1813 },
          rating: { type: 'number', example: 4.7 },
          authorName: { type: 'string', example: 'Jane Austen' },
          authorCountry: { type: 'string', example: 'United Kingdom' },
        },
      },
      AuthorPage: {
        type: 'object',
        required: ['items', 'page', 'pageSize', 'total', 'hasMore', 'sql'],
        properties: {
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/Author' },
          },
          page: { type: 'integer', example: 1 },
          pageSize: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 12 },
          hasMore: { type: 'boolean', example: true },
          sql: {
            type: 'string',
            example: 'SELECT Id, Name, Country, BirthYear FROM Authors ORDER BY Name ASC',
          },
        },
      },
      BookPage: {
        type: 'object',
        required: ['items', 'page', 'pageSize', 'total', 'hasMore', 'sql'],
        properties: {
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/Book' },
          },
          page: { type: 'integer', example: 1 },
          pageSize: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 30 },
          hasMore: { type: 'boolean', example: true },
          sql: {
            type: 'string',
            example:
              'SELECT Id, Title, AuthorId, Genre, PublishedYear, Rating FROM Books ORDER BY Title ASC',
          },
        },
      },
      CatalogPage: {
        type: 'object',
        required: ['items', 'page', 'pageSize', 'total', 'hasMore', 'sql'],
        properties: {
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/CatalogEntry' },
          },
          page: { type: 'integer', example: 1 },
          pageSize: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 30 },
          hasMore: { type: 'boolean', example: true },
          sql: {
            type: 'string',
            example:
              'SELECT b.Id, b.Title, b.Genre, b.PublishedYear, b.Rating, a.Name AS AuthorName, a.Country AS AuthorCountry FROM Books b JOIN Authors a ON b.AuthorId = a.Id ORDER BY Title ASC',
          },
        },
      },
      BookCatalogReseedResponse: {
        type: 'object',
        required: ['ok', 'seededAuthors', 'seededBooks'],
        properties: {
          ok: { type: 'boolean', example: true },
          seededAuthors: { type: 'integer', example: 12 },
          seededBooks: { type: 'integer', example: 30 },
        },
      },
    },
  },
} as const;
