const express = require('express');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const winston = require('winston');

const GRPC_PORT = 3000;
const HTTP_PORT = 3001;
const LOG_LEVEL = 'silly';
const LOG_SERVICE_NAME = 'booking-api';

const {
  MONGODB_URL,
} = process.env;

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.json(),
  defaultMeta: { service: LOG_SERVICE_NAME },
  transports: [
    new winston.transports.Console(),
  ],
});

const Booking = mongoose.model('Booking', {
  status: String,
  arrivalTime: Date,
  guestName: String,
  guestEmail: String,
  guestsCount: String,
  restaurant: String,
});

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

const bookingMapper = (record) => ({
  id: record._id.toString(),
  status: record.status,
  arrivalTime: record.arrivalTime.toString(),
  guestName: record.guestName,
  guestEmail: record.guestEmail,
  guestsCount: record.guestsCount,
  restaurant: record.restaurant,
});

const statuses = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELED: 'CANCELED',
}

const bookingImpl = {
  async list({ page, limit, status }, callback) {
    const skip = (page - 1) * limit;
    const query = status ? { status } : {};

    try {
      let aggregate = Booking.aggregate();

      if (status) {
        aggregate = aggregate.match(query);
      }

      const { total } = await aggregate.count('total').exec();

      const results = await Booking.find(query, {}, { limit, skip }).exec();

      const data = results.map((record) => bookingMapper(record));

      callback(null, { meta: { total }, data });

    } catch (e) {
      logger.error(e.message, { type: e.name || 'UnknownError' });

      callback({error: 'ListBookingError'});
    }
  },

  async getById({ id }, callback) {
    try {
      const record = await Booking.findById(id).exec();

      const data = bookingMapper(record);

      callback(null, data);
    } catch (e) {
      logger.error(e.message, { type: e.name || 'UnknownError' });

      callback({error: 'GetBookingByIdError'});
    }
  },

  async create({ arrivalTime, guestName, guestEmail, guestsCount, restaurant }, callback) {
    try {
      const record = await Booking.create({
        status: statuses.PENDING,
        arrivalTime: new Date(arrivalTime),
        guestName,
        guestEmail,
        guestsCount,
        restaurant,
      });

      const data = bookingMapper(record);

      callback(null, data);
    } catch (e) {
      logger.error(e.message, { type: e.name || 'UnknownError' });

      callback({error: 'CreateBookingError'});
    }
  },

  async cancel({ id }, callback) {
    try {
      const record = await Booking.findById(id).exec();

      record.status = statuses.CANCELED;

      const data = bookingMapper(record);

      callback(null, data);
    } catch (e) {
      logger.error(e.message, { type: e.name || 'UnknownError' });

      callback({error: 'CancelBookingError'});
    }
  },

  async confirm({ id }, callback) {
    try {
      const record = await Booking.findById(id).exec();

      record.status = statuses.CONFIRMED;

      const data = bookingMapper(record);

      callback(null, data);
    } catch (e) {
      logger.error(e.message, { type: e.name || 'UnknownError' });

      callback({error: 'CancelBookingError'});
    }
  },
};

const app = express();

app.get('/healthz', (_, res) => {
  res.json({ ok: 1 });
});

async function main() {
  await mongoose.connect(MONGODB_URL);

  const server = new grpc.Server();

  server.bindAsync(`0.0.0.0:${GRPC_PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    logger.info(`gRPC server start listen on ${GRPC_PORT}`);

    server.start();
  });

  server.addService(BookingService.service, bookingImpl);

  app.listen(HTTP_PORT, () => {
    logger.info(`start http server on port ${HTTP_PORT}`);
  });
}

main().catch((e) => {
  logger.error(e.message, { type: e.name || 'UnknownError' });
});
