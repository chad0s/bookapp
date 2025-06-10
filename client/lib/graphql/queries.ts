import { gql } from "@apollo/client";

export const ME = gql`
  query Me {
    me {
      id
      email
      role
    }
  }
`;

export const GET_BOOKS = gql`
  query GetBooks($page: Int, $limit: Int, $filter: BookFilter) {
    books(page: $page, limit: $limit, filter: $filter) {
      books {
        id
        title
        description
        published_date
        cover_url
        author {
          id
          name
        }
      }
      total
      page
      totalPages
    }
  }
`;

export const GET_BOOK = gql`
  query GetBook($id: ID!) {
    book(id: $id) {
      id
      title
      description
      published_date
      cover_url
      author {
        id
        name
        biography
      }
      metadata {
        reviews {
          user_email
          rating
          comment
          created_at
        }
        average_rating
        total_reviews
        view_count
      }
    }
  }
`;

export const GET_AUTHORS = gql`
  query GetAuthors($page: Int, $limit: Int, $filter: AuthorFilter) {
    authors(page: $page, limit: $limit, filter: $filter) {
      authors {
        id
        name
        biography
        born_date
        photo_url
      }
      total
      page
      totalPages
    }
  }
`;

export const GET_AUTHOR = gql`
  query GetAuthor($id: ID!) {
    author(id: $id) {
      id
      name
      biography
      born_date
      photo_url
      books {
        id
        title
        description
        published_date
        cover_url
      }
      metadata {
        reviews {
          user_email
          rating
          comment
          created_at
        }
        average_rating
        total_reviews
        view_count
      }
    }
  }
`;
