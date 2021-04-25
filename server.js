const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} = require("graphql");
const app = express();

// Sample data
const authors = [
  { id: 1, name: "J. K. Rowling" },
  { id: 2, name: "J. R. R. Tolkien" },
  { id: 3, name: "Brent Weeks" },
];

const books = [
  { id: 1, name: "Harry Potter and the Chamber of Secrets", authorId: 1 },
  { id: 2, name: "Harry Potter and the Prisoner of Azkaban", authorId: 1 },
  { id: 3, name: "Harry Potter and the Goblet of Fire", authorId: 1 },
  { id: 4, name: "The Fellowship of the Ring", authorId: 2 },
  { id: 5, name: "The Two Towers", authorId: 2 },
  { id: 6, name: "The Return of the King", authorId: 2 },
  { id: 7, name: "The Way of Shadows", authorId: 3 },
  { id: 8, name: "Beyond the Shadows", authorId: 3 },
];

// GraphQL Types
const BookType = new GraphQLObjectType({
  name: "Book",
  description: "A book written by an author",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLInt) },
    author: {
      type: AuthorType,
      description: "The author of the book",
      resolve: (book) => {
        return authors.find((author) => author.id === book.authorId);
      },
    },
  }),
});

const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "The author of a book",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      type: GraphQLList(BookType),
      description: "All the books written by this author",
      resolve: (author) => {
        return books.filter((book) => author.id === book.authorId);
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    book: {
      type: BookType,
      description: "A single book",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (_, args) => {
        return books.find((book) => book.id === args.id);
      },
    },
    author: {
      type: AuthorType,
      description: "A single author",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (_, args) => {
        return authors.find((author) => author.id === args.id);
      },
    },
    books: {
      type: GraphQLList(BookType),
      description: "List of all books",
      resolve: () => books,
    },
    authors: {
      type: GraphQLList(AuthorType),
      description: "List of all the author",
      resolve: () => authors,
    },
  }),
});

const RootMutation = new GraphQLObjectType({
  name: "Mutation",
  description: "RootMutation",
  fields: () => ({
    addBook: {
      type: BookType,
      description: "Adds a book to the array of books",
      args: {
        authorId: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (_, args) => {
        const newBook = {
          name: args.name,
          authorId: args.id,
          id: books.length + 1,
        };
        books.push(newBook);
        return newBook;
      },
    },
    addAuthor: {
      type: AuthorType,
      description: "Adds an author to the array of authors",
      args: {
        name: { type: GraphQLString },
      },
      resolve: (_, args) => {
        const newAuthor = {
          id: args.length + 1,
          name: args.name,
        };
        authors.push(newAuthor);
        return newAuthor;
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});

// Graph QL Endpoint
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.listen(5000, () => {
  console.log("Server is running");
});
