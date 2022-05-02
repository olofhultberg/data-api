const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const helmet = require('helmet');
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const crypto = require('crypto');
const HMAC_KEY = 'cupcakes';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
})

const port = process.env.PORT || 8080;

const SensorData = sequelize.define('sensor-data', {
    serial: {
        type: DataTypes.STRING,
        allownull: false
    },
    name: {
        type: DataTypes.STRING,
        allownull: false
    },
    temperature: {
        type: DataTypes.FLOAT,
        allownull: false
    }
})

const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 15 minutes
	max: 15, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

const app =  express();
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(limiter);

app.get('/', async (req,res)=>{
    try {
        const allData = []
        res.status(200).send(allData);
    } catch (error) {
        res.status(500).send(error.message);
    }
    return;

});

app.use((req, res,next)=>{
    let key = req.query.key;
    if(!key || key !=='12345'){
        res.status(403).send();
        return;
    }
    next();
})

app.get('/data', async (req,res)=>{

    let limit = req.query.limit || 5;
    let offset = req.query.offset || 0;

    try {
        const allData = await SensorData.findAll({ limit, offset });
        res.status(200).send(allData);
    } catch (error) {
        res.status(500).send(error.message);
    }
    return;

});

app.post('/data', async (req,res)=>{
    try {
        
        let data = req.body
        let hmac = req.headers['hmac'];
        let hmacExpected = crypto.createHmac('sha1', HMAC_KEY)
            .update(JSON.stringify(data))
            .digest('hex');

        let hmacEqual = crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(hmacExpected));
       
        if (!hmacEqual) {
            res.status(403).send('Bad HMAC')
            return;
        }

        const sensorData = await SensorData.create(data);
        res.status(201).send(sensorData);
        return;    
    } catch (error) {
        res.status(500).send(error.message);
    }
    return;  
});



app.listen( port, async ()=>{
    try {
        console.log("Starting listening.. (", port , ")" )
        await sequelize.authenticate();
        console.log('Connected to database.');
        await sequelize.sync({ alter:true });
        console.log('Synchronizing database..');
    } catch (error) {
        console.log('Could not connect to the database', error)
        
    }
    console.log("server is running..")
})