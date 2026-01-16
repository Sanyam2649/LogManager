# LogManager Integration

## 1. Create Account & Login
- Sign up on the LogManager dashboard.
- Log in to access your projects.

## 2. Create Project & Get API Key
- Create a project.
- Generate the unique `API_KEY` for the project.
- Make sure `isAllowed` is set to `true`.

## 3. Install Dependencies
```bash
npm install winston winston-daily-rotate-file


##Example in Node express using winston: 

## 4. Create BcubeTransport file :

const Transport = require('winston-transport');

class BcubeTransport extends Transport {
  constructor({ logFunction }) {
    super();
    this.logFunction = logFunction;
  }

  async log(info, callback) {
    setImmediate(() => this.emit('logged', info));
    const { level, message } = info;
    try { await this.logFunction(level, message); } 
    catch (err) { console.error('Bcube log failed:', err); }
    callback();
  }
}

module.exports = BcubeTransport;



## 4.setup logger: 

const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { createBcubeLogger } = require('./bcubeLogger');
const BcubeTransport = require('./BcubeTransport');

const bcubeLog = createBcubeLogger({
  apiKey: "YOUR_API_KEY",
  service: "my-app",
  baseUrl: "http://127.0.0.1:8000",
  environment: "development",
});

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
  ),
  transports: [
    new transports.Console(),
    new BcubeTransport({ logFunction: bcubeLog }),
    new DailyRotateFile({ filename: 'logs/info-%DATE%.log', datePattern: 'YYYY-MM-DD', level: 'info', maxFiles: '30d', zippedArchive: true }),
    new DailyRotateFile({ filename: 'logs/warn-%DATE%.log', datePattern: 'YYYY-MM-DD', level: 'warn', maxFiles: '30d', zippedArchive: true }),
    new DailyRotateFile({ filename: 'logs/error-%DATE%.log', datePattern: 'YYYY-MM-DD', level: 'error', maxFiles: '30d', zippedArchive: true }),
  ],
});

module.exports = logger;
