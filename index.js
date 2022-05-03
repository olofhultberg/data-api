const { app, sequelize } = require('./app');
const port = process.env.PORT || 8080

app.listen(port, async () =>{
    try {
       await sequelize.authenticate();
       await sequelize.sync({ alter: true });
       console.log('Connected to database..')
    } catch (error) {
         console.log('Failed to conect to db: ', error)
    }
    console.log('Server started..')
})