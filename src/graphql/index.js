const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const http = require('http');
var grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const axios = require('axios');
const winston = require('winston');

const HTTP_PORT = 3000;
const LOG_LEVEL = 'silly';
const LOG_SERVICE_NAME = 'graphql-api';
const AUTH_SERVICE_TIMEOUT = 10000;

const {
  BOOKING_SERVICE_URI,
  AUTH_SERVICE_URI,
} = process.env;

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.json(),
  defaultMeta: { service: LOG_SERVICE_NAME },
  transports: [
    new winston.transports.Console(),
  ],
});

const app = express();

const presets = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

const PROTO_PATH = `${__dirname}/../proto/booking.proto`;

const packageDefinition = protoLoader.loadSync(PROTO_PATH, presets);

const { BookingService } = grpc.loadPackageDefinition(packageDefinition);

const bookingService = new BookingService(BOOKING_SERVICE_URI, grpc.credentials.createInsecure());

const authService =  axios.create({
  baseURL: AUTH_SERVICE_URI,
  timeout: AUTH_SERVICE_TIMEOUT,
});

const typeDefs = gql`
  type UserSession {
    id: ID!
    name: String!
    email: String!
    restaurant: String!
    token: String!
  }

  type Booking {
    id: ID!
    status: String!
    arrivalTime: String!
    guestName: String!
    guestEmail: String!
    guestsCount: Int!
    restaurant: String!
  }

  type PaginatedBookingMeta {
    total: Int!
  }

  type PaginatedBooking {
    meta: PaginatedBookingMeta
    data: [Booking]
  }

  type Query {
    bookings(page: Int, limit: Int, status: String): PaginatedBooking
    booking(id: ID!): Booking
    currentSession: UserSession
  }

  input CreateBookingInput {
    arrivalTime: String!
    guestName: String!
    guestEmail: String!
    guestsCount: Int!
    restaurant: String!
  }

  input SignupInput {
    name: String!
    email: String!
    password: String!
    restaurant: String!
  }

  type Mutation {
    createBooking(input: CreateBookingInput!): Booking!
    confirmBooking(id: ID!): Booking!
    cancelBooking(id: ID!): Booking!
    signin(email: String!, password: String!): UserSession
    signup(input: SignupInput!): UserSession
  }
`;

const resolvers = {
  Query: {
    bookings: (parent, args, context, info) => {

    },

    booking: (parent, args, context, info) => {

    },
    currentSession: () => {

    },
  },

  Mutation: {
    createBooking: (parent, args, context, info) => {

    },
    confirmBooking: (parent, args, context, info) => {

    },
    cancelBooking: (parent, args, context, info) => {

    },
    signin: (parent, args, context, info) => {

    },
    signup: (parent, args, context, info) => {

    },
  },
};

app.get('/healthz', (_, res) => {
  res.json({ ok: 1 });
});

async function main() {
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const token = req.headers.authorization || '';
  
      if (!token) {

      }

      const { data: user } = await authService.get('/sessions/current', {
        headers: {
          Authorization: token,
        },
      });
  
      return { user };
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  server.applyMiddleware({ app });

  app.listen(HTTP_PORT, () => {
    logger.info(`Start server on port ${HTTP_PORT}`);
  });
}

main().catch((e) => {
  logger.error(e.message, { type: e.name || 'UnknownError', stack: e.stack });
});
