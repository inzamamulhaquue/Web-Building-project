const { createLogger, format, transports } = require("winston");
const { DATABASE_URL } = process.env;
const logger = createLogger({
    transports: [
        new transports.MongoDB({
            db: `${DATABASE_URL}`,
            options: {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            },
            collection: 'api-log',
            level: 'info',
            storeHost: true,
            decolorize: false,
            metaKey: 'meta',
        }),
    ],
    format: format.combine(
        format.timestamp(),
        format.json()
    )
})

module.exports = logger