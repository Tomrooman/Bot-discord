const MongoClient = require('mongodb').MongoClient
global.dbConnection = false

describe('Index', function () {
    it('Connect to database', function (done) {
        const url = 'mongodb://localhost:27017/syxbot-database'
        MongoClient.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, function (err, db) {
            if (err) throw err;
            global.dbConnection = db.db('syxbot-database')
            done()
        });
    });
});

require('./user.test.js')