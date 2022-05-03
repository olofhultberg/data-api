const request = require('supertest');
const { app, sequelize } = require('./app');


describe('GET /data', ()=>{
  beforeAll( async ()=>{
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
  })

  it('responds with json with key', (done) => {
    request(app)
      .get('/data?key=12345')
      .set('Accept', 'application/json')
      .set('Contet-Type', 'application/json')
      .expect(200)
      .end((err, resp) => {
        try {
          if(err) return done(err);
          expect(resp.text).toEqual('[]');
            
        } catch (error) {
          return done(error);
        }
        return done();
        
      })
  })

  it('responds with 403 without a key', (done) => {
    request(app)
      .get('/data')
      .set('Accept', 'application/json')
      .set('Contet-Type', 'application/json')
      .expect(403)
      .end((err, resp) => {
        try {
          if(err) return done(err);
          expect(resp.text).toEqual('No API Key');
            
        } catch (error) {
          return done(error);
        }
        return done();
        
      })
  })

  it('responds with 403 with a bad key', (done) => {
    request(app)
      .get('/data?key=12346')
      .set('Accept', 'application/json')
      .set('Contet-Type', 'application/json')
      .expect(403)
      .end((err, resp) => {
        try {
          if(err) return done(err);
          expect(resp.text).toEqual('Bad API Key');
            
        } catch (error) {
          return done(error);
        }
        return done();
        
      })
  })


})

