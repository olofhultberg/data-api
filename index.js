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

const app =  express();
app.use(express.json());

app.get('/', async (req,res)=>{
    try {
        const allData = []
        res.status(200).send(allData);
    } catch (error) {
        res.status(500).send(error.message);
    }
    return;

});

app.get('/data', async (req,res)=>{
    try {
        const allData = await SensorData.findAll();
        res.status(200).send(allData);
    } catch (error) {
        res.status(500).send(error.message);
    }
    return;

});

app.post('/data', async (req,res)=>{
    try {
        let data = req.body
        const sensorData = await SensorData.create(data);
        res.status(201).send(sensorData);
        return;    
    } catch (error) {
        res.status(500).send(error.message);
    }
    return;  
});



app.listen(port, ()=>{
    try {
        console.log("Starting listening..")
        // sequelize.authenticate();
        // console.log('Connected to database.');
        // sequelize.sync({ alter:true });
        // console.log('Synchronizing database..');
    } catch (error) {
        console.log('Could not connect to the database', error)
        
    }
    console.log("server is running..")
})