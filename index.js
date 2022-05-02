const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
})

const port = process.env.port || 8080;

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

const app =  express();
app.use(express.json());

app.get('/data', async (req,res)=>{
    const allData = await SensorData.findAll();
    res.status(200).send(allData);
    return;
});

app.post('/data', async (req,res)=>{
    let data = req.body
    const sensorData = await SensorData.create(data);
    res.status(201).send(sensorData);
    return;
});



app.listen({port: port}, ()=>{
    try {
        sequelize.authenticate();
        console.log('Connected to database');
        sequelize.sync({ alter:true });
        console.log('Connected to database');
    } catch (error) {
        console.log('Could not connect to the database', error)
        
    }
    console.log("server is running..")
})