const { gql } = require("graphql-tag");

const typeDefs = gql`
  scalar Date

  type Author {
    id: ID!
    name: String!
    biography: String
    born_date: Date
    photo_url: String
    books: [Book!]!
    metadata: AuthorMetadata
  }

  type Book {
    id: ID!
    title: String!
    description: String
    published_date: Date
    cover_url: String
    author_id: ID!
    author: Author!
    metadata: BookMetadata
  }

  type User {
    id: ID!
    email: String!
    role: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Review {
    user_id: ID!
    user_email: String
    rating: Int!
    comment: String
    created_at: Date!
  }

  type BookMetadata {
    book_id: ID!
    reviews: [Review!]!
    average_rating: Float!
    total_reviews: Int!
    tags: [String!]!
    view_count: Int!
  }

  type AuthorMetadata {
    author_id: ID!
    reviews: [Review!]!
    average_rating: Float!
    total_reviews: Int!
    tags: [String!]!
    view_count: Int!
  }

  type SocialLinks {
    twitter: String
    website: String
    goodreads: String
  }

  type PaginatedBooks {
    books: [Book!]!
    total: Int!
    page: Int!
    totalPages: Int!
  }

  type PaginatedAuthors {
    authors: [Author!]!
    total: Int!
    page: Int!
    totalPages: Int!
  }

  input BookFilter {
    title: String
    author_id: ID
    published_after: Date
    published_before: Date
  }

  input AuthorFilter {
    name: String
    born_after: Date
    born_before: Date
  }

  input CreateBookInput {
    title: String!
    description: String
    published_date: Date
    author_id: ID!
    cover_url: String
  }

  input UpdateBookInput {
    title: String
    description: String
    published_date: Date
    author_id: ID
    cover_url: String
  }

  input CreateAuthorInput {
    name: String!
    biography: String
    born_date: Date
    photo_url: String
  }

  input UpdateAuthorInput {
    name: String
    biography: String
    born_date: Date
    photo_url: String
  }

  input CreateReviewInput {
    book_id: ID!
    rating: Int!
    comment: String
  }

  input CreateAuthorReviewInput {
    author_id: ID!
    rating: Int!
    comment: String
  }

  type Query {
    # Book queries
    books(page: Int, limit: Int, filter: BookFilter): PaginatedBooks!
    book(id: ID!): Book

    # Author queries
    authors(page: Int, limit: Int, filter: AuthorFilter): PaginatedAuthors!
    author(id: ID!): Author

    # User queries
    me: User
  }

  type Mutation {
    # Auth mutations
    signup(email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    # Book mutations
    createBook(input: CreateBookInput!): Book!
    updateBook(id: ID!, input: UpdateBookInput!): Book!
    deleteBook(id: ID!): Boolean!

    # Author mutations
    createAuthor(input: CreateAuthorInput!): Author!
    updateAuthor(id: ID!, input: UpdateAuthorInput!): Author!
    deleteAuthor(id: ID!): Boolean!

    # Review mutations
    addReview(input: CreateReviewInput!): BookMetadata!
    addAuthorReview(input: CreateAuthorReviewInput!): AuthorMetadata!
  }
`;

module.exports = typeDefs;
