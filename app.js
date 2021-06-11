const express = require("express");
const expressGraphql = require("express-graphql").graphqlHTTP;
const {GraphQLSchema, GraphQLObjectType, GraphQLList, GraphQLString, GraphQLInt, GraphQLNonNull} = require('graphql');

const app = express();
const port = process.env.port || 3000;

// datasets
const authors = [
    {id: 1, name: "Stephen Mathenyu"},
    {id: 2, name: "Allan Muturi"},
    {id: 3, name: "Esbon Mutisya"}
]

const books = [
    {id: 1, name: "Harry potter and the chamber of secrets", authorsId: 1},
    {id: 2, name: "Harry potter and the prisoners of Azkaban", authorsId: 1},
    {id: 3, name: "Harry potter and the Goblet of fire", authorsId: 1},
    {id: 4, name: "The fellowship ring", authorsId: 2},
    {id: 5, name: "The two towers", authorsId: 2},
    {id: 6, name: "Return of the king", authorsId: 2},
    {id: 7, name: "The way shadows", authorsId: 3},
    {id: 8, name: "The beyond shadows", authorsId: 3},
    {id: 9, name: "The king of uzbeki", authorsId: 3}
]

// queries
const AuthorType = new GraphQLObjectType({
    name: "Authors",
    description: "A list of authors to be returned by the books",
    fields: () => ({
        id: {
            type: GraphQLNonNull(GraphQLInt)
        },
        name: {
            type: GraphQLNonNull(GraphQLString)
        },
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorsId === author.id)
            }
        }
    })
})

const BookType = new GraphQLObjectType({
    name: "book",
    description: "this represents the book written by authors",
    fields: () => ({
        id: {
           type: GraphQLNonNull(GraphQLInt)
        },
        name: {
            type: GraphQLNonNull(GraphQLString)
        },
        authorsId: {
            type: GraphQLNonNull(GraphQLInt)
        },
        author: {
            type: AuthorType,
            resolve: (book)=>{
                return authors.find(author => author.id === book.authorsId)
            }
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: "Query",
    description: "the root query",
    fields: () => ({
        book:{
            type: new GraphQLList(BookType),
            description: "A single of books",
            args: {
                id: {
                    type: GraphQLInt
                }
            },
            resolve: (parent, args) => {return books.find(book => book.id === args.id)}
        },
        books: {
            type: new GraphQLList(BookType),
            description: "the list of books",
            resolve: () => books
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: "the list of authours",
            resolve: () => authors
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: "root mutation",
    fields: ()=>({
        addBook:({
            type: BookType,
            description: "add a book",
            args:{
                name: {type: GraphQLNonNull(GraphQLString)},
                authorsId: {type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args)=>{
                const book = {
                    id: books.length + 1, 
                    name: args.name, authorsId: 
                    args.authorsId
                }
                books.push(book)
                return book
            }
        })
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', expressGraphql({
    graphiql: true,
    schema: schema
}))

app.listen(port, ()=>{
    console.log("Server started")
})