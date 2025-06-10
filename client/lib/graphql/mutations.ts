import { gql } from "@apollo/client";

export const SIGNUP = gql`
  mutation Signup($email: String!, $password: String!) {
    signup(email: $email, password: $password) {
      token
      user {
        id
        email
        role
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        role
      }
    }
  }
`;

export const CREATE_BOOK = gql`
  mutation CreateBook($input: CreateBookInput!) {
    createBook(input: $input) {
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
  }
`;

export const UPDATE_BOOK = gql`
  mutation UpdateBook($id: ID!, $input: UpdateBookInput!) {
    updateBook(id: $id, input: $input) {
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
  }
`;

export const DELETE_BOOK = gql`
  mutation DeleteBook($id: ID!) {
    deleteBook(id: $id)
  }
`;

export const CREATE_AUTHOR = gql`
  mutation CreateAuthor($input: CreateAuthorInput!) {
    createAuthor(input: $input) {
      id
      name
      biography
      born_date
      photo_url
    }
  }
`;

export const UPDATE_AUTHOR = gql`
  mutation UpdateAuthor($id: ID!, $input: UpdateAuthorInput!) {
    updateAuthor(id: $id, input: $input) {
      id
      name
      biography
      born_date
      photo_url
    }
  }
`;

export const DELETE_AUTHOR = gql`
  mutation DeleteAuthor($id: ID!) {
    deleteAuthor(id: $id)
  }
`;

export const ADD_REVIEW = gql`
  mutation AddReview($input: CreateReviewInput!) {
    addReview(input: $input) {
      book_id
      reviews {
        user_email
        rating
        comment
        created_at
      }
      average_rating
      total_reviews
    }
  }
`;

export const ADD_AUTHOR_REVIEW = gql`
  mutation AddAuthorReview($input: CreateAuthorReviewInput!) {
    addAuthorReview(input: $input) {
      author_id
      reviews {
        user_email
        rating
        comment
        created_at
      }
      average_rating
      total_reviews
    }
  }
`;
