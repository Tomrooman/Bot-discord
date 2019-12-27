import mongoose from 'mongoose'

describe('Index', function () {
    it('Connect to database', function (done) {
        mongoose.connect('mongodb://localhost/syxbot-database-test', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: false,
            useFindAndModify: false
        })
        mongoose.connection.once('open', () => {
            done()
        })
    });
});

require('./user.test.js')