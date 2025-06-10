const { Author, Book, User } = require("../../models/postgresql");
const BookMetadata = require("../../models/mongodb/BookMetadata");
const AuthorMetadata = require("../../models/mongodb/AuthorMetadata");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const resolvers = {
  Query: {
    // Book queries
    books: async (_, { page = 1, limit = 10, filter = {} }) => {
      const where = {};

      if (filter.title) {
        where.title = { [Op.iLike]: `%${filter.title}%` };
      }
      if (filter.author_id) {
        where.author_id = filter.author_id;
      }
      if (filter.published_after) {
        where.published_date = { [Op.gte]: filter.published_after };
      }
      if (filter.published_before) {
        where.published_date = {
          ...where.published_date,
          [Op.lte]: filter.published_before,
        };
      }

      const offset = (page - 1) * limit;
      const { count, rows } = await Book.findAndCountAll({
        where,
        limit,
        offset,
        include: ["author"],
        order: [["created_at", "DESC"]],
      });

      return {
        books: rows,
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
      };
    },

    book: async (_, { id }) => {
      const book = await Book.findByPk(id, { include: ["author"] });
      if (book) {
        // Increment view count
        await BookMetadata.findOneAndUpdate(
          { book_id: id },
          { $inc: { view_count: 1 } },
          { upsert: true }
        );
      }
      return book;
    },

    // Author queries
    authors: async (_, { page = 1, limit = 10, filter = {} }) => {
      const where = {};

      if (filter.name) {
        where.name = { [Op.iLike]: `%${filter.name}%` };
      }
      if (filter.born_after) {
        where.born_date = { [Op.gte]: filter.born_after };
      }
      if (filter.born_before) {
        where.born_date = { ...where.born_date, [Op.lte]: filter.born_before };
      }

      const offset = (page - 1) * limit;
      const { count, rows } = await Author.findAndCountAll({
        where,
        limit,
        offset,
        order: [["created_at", "DESC"]],
      });

      return {
        authors: rows,
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
      };
    },

    author: async (_, { id }) => {
      return Author.findByPk(id, { include: ["books"] });
    },

    // User queries
    me: async (_, __, { user }) => {
      if (!user) return null;
      return User.findByPk(user.id);
    },
  },

  Mutation: {
    // Auth mutations
    signup: async (_, { email, password }) => {
      try {
        const user = await User.create({ email, password });
        const token = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET
        );
        return { token, user };
      } catch (error) {
        throw new Error("Email already exists");
      }
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ where: { email } });
      if (!user || !(await user.comparePassword(password))) {
        throw new Error("Invalid credentials");
      }
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET
      );
      return { token, user };
    },

    // Book mutations
    createBook: async (_, { input }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const author = await Author.findByPk(input.author_id);

      // Check if published_date is after author's born_date and not in the future
      if (author.born_date && input.published_date) {
        const publishedDate = new Date(input.published_date);
        const bornDate = new Date(author.born_date);
        const currentDate = new Date();

        if (publishedDate <= bornDate) {
          throw new Error(
            "Book cannot be published before the author was born."
          );
        }

        if (publishedDate > currentDate) {
          throw new Error("Book cannot be published in the future.");
        }
      }

      if (!author) throw new Error("Author not found");

      return Book.create(input);
    },

    updateBook: async (_, { id, input }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const book = await Book.findByPk(id);
      if (!book) throw new Error("Book not found");

      const author = await Author.findByPk(input.author_id);
      if (!author) throw new Error("Author not found");

      // Check if published_date is after author's born_date and not in the future
      if (author.born_date && input.published_date) {
        const publishedDate = new Date(input.published_date);
        const bornDate = new Date(author.born_date);
        const currentDate = new Date();

        if (publishedDate <= bornDate) {
          throw new Error(
            "Book cannot be published before the author was born."
          );
        }

        if (publishedDate > currentDate) {
          throw new Error("Book cannot be published in the future.");
        }
      }

      await book.update(input);
      return book;
    },

    deleteBook: async (_, { id }, { user }) => {
      const userDetails = await User.findByPk(user.id);
      if (!user || userDetails.role !== "admin") {
        throw new Error("Not authorized");
      }

      const book = await Book.findByPk(id);
      if (!book) throw new Error("Book not found");

      await book.destroy();
      await BookMetadata.findOneAndDelete({ book_id: id });

      return true;
    },

    // Author mutations
    createAuthor: async (_, { input }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      if (input.born_date) {
        const bornDate = new Date(input.born_date);
        const currentDate = new Date();

        if (bornDate > currentDate) {
          throw new Error("Author cannot be born in the future.");
        }
      }

      return Author.create(input);
    },

    updateAuthor: async (_, { id, input }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const author = await Author.findByPk(id);
      if (!author) throw new Error("Author not found");

      if (input.born_date) {
        const bornDate = new Date(input.born_date);
        const currentDate = new Date();

        if (bornDate > currentDate) {
          throw new Error("Author cannot be born in the future.");
        }
      }
      await author.update(input);
      return author;
    },

    deleteAuthor: async (_, { id }, { user }) => {
      const userDetails = await User.findByPk(user.id);
      if (!user || userDetails.role !== "admin") {
        throw new Error("Not authorized");
      }

      const author = await Author.findByPk(id);
      if (!author) throw new Error("Author not found");

      // Check if author has books
      const bookCount = await Book.count({ where: { author_id: id } });
      if (bookCount > 0) {
        throw new Error("Cannot delete author with existing books");
      }

      await author.destroy();
      await AuthorMetadata.findOneAndDelete({ author_id: id });

      return true;
    },

    // Review mutations
    addReview: async (_, { input }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const book = await Book.findByPk(input.book_id);
      if (!book) throw new Error("Book not found");

      const review = {
        user_id: user.id,
        user_email: user.email,
        rating: input.rating,
        comment: input.comment,
      };

      const metadata = await BookMetadata.findOneAndUpdate(
        { book_id: input.book_id },
        { $push: { reviews: review } },
        { new: true, upsert: true }
      );

      await metadata.save(); // Trigger pre-save hook to recalculate average

      return metadata;
    },

    addAuthorReview: async (_, { input }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const author = await Author.findByPk(input.author_id);
      if (!author) throw new Error("Book not found");

      const review = {
        user_id: user.id,
        user_email: user.email,
        rating: input.rating,
        comment: input.comment,
      };

      const metadata = await AuthorMetadata.findOneAndUpdate(
        { author_id: input.author_id },
        { $push: { reviews: review } },
        { new: true, upsert: true }
      );

      await metadata.save(); // Trigger pre-save hook to recalculate average

      return metadata;
    },
  },

  // Field resolvers
  Book: {
    metadata: async (book) => {
      return BookMetadata.findOne({ book_id: book.id });
    },
    author: async (book) => {
      return Author.findByPk(book.author_id);
    },
  },

  Author: {
    metadata: async (author) => {
      return AuthorMetadata.findOne({ author_id: author.id });
    },
  },
};

module.exports = resolvers;
