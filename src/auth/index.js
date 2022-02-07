const express = require('express');
const mongoose = require('mongoose');
const winston = require('winston');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const BCRYPT_SALT = 10;
const HTTP_PORT = 3000;
const SESSION_DURATION = '20m';
const JWT_SECRET = '8QJMWznE7l1eL{5}yo$%Ytnn%-r(0{E:U(WEa@~$kCu8xhk_oNl[}PPC,=MME';
const LOG_LEVEL = 'silly';
const LOG_SERVICE_NAME = 'auth-api';

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

const User = mongoose.model('User', {
  name: String,
  email: Date,
  passwordHash: String,
  restaurant: String,
});

const app = express();

app.use(express.json());

app.get('/healthz', (_, res) => {
  res.json({ ok: 1 });
});

app.post('/users', async (req, res) => {
  const { name, email, password, restaurant } = req.body;

  try {
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT);

    const record = await User.create({
      name,
      email,
      passwordHash,
      restaurant,
    });

    const token = jwt.sign({
      data: record._id.toString(),
    }, JWT_SECRET, { expiresIn: SESSION_DURATION });

    res.status(201).json({
      id: record._id.toString(),
      name,
      email,
      token,
    });
    
  } catch (e) {
    logger.error(e.message, { type: e.name || 'UnknownError', stack: e.stack });
  }
});

app.post('/sessions', async (req, res) => {
  const { email, password } = req.body;

  try {
    const record = await User.findOne({ email }).exec();

    if (!record) {
      res.status(401).json({ error: 'InvalidUserCredential' });
      return;
    }

    const valid = await bcrypt.compare(password, record.passwordHash);

    if (!valid) {
      res.status(401).json({ error: 'InvalidUserCredential' });
      return;
    }

    const token = jwt.sign({
      data: record._id.toString(),
    }, JWT_SECRET, { expiresIn: SESSION_DURATION });

    res.status(201).json({
      id: record._id.toString(),
      name: record.name,
      email: record.email,
      token,
    });
  } catch (e) {
    logger.error(e.message, { type: e.name || 'UnknownError', stack: e.stack });
    res.status(500).json({ error: 'CreateSessionError' });
  }
});

app.get('/sessions/current', async (req, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');

  try {
    const { data: userId } = jwt.verify(token, JWT_SECRET);

    const record = await User.findById(userId).exec();

    if (!valid) {
      res.status(401).json({ error: 'InvalidSession' });
      return;
    }

    res.json({
      id: record._id.toString(),
      name: record.name,
      email: record.email,
      token,
    });
  } catch (e) {
    logger.error(e.message, { type: e.name || 'UnknownError', stack: e.stack });
    res.status(401).json({ error: 'InvalidSession' });
  }
});

async function main() {
  await mongoose.connect(MONGODB_URL);

  app.listen(HTTP_PORT, () => {
    logger.info(`Start server listen on 0.0.0.0:${HTTP_PORT}`);
  })
}

main().catch((e) => {
  logger.error(e.message, { type: e.name || 'UnknownError' });
});
