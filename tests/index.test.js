const mongoose = require('mongoose')

describe('Index', function () {
    it('Connect to database', function (done) {
        mongoose.connect('mongodb://localhost/syxbot-database', { useNewUrlParser: true, useUnifiedTopology: true })
        done()
    });
});

require('./user.test.js')