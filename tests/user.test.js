const assert = require('assert');
const mongoose = require('mongoose')
const userSchema = mongoose.model('User', require('../models/user.js'));

describe('User', function () {
    it('Users should be empty', function (done) {
        userSchema.find()
            .then(users => {
                assert.equal(users.length, 0)
                done()
            })
    });
    it('Should add a user', function (done) {
        const newUser = new userSchema({
            userId: 'test userid',
            serverId: 'test serverid',
            grade: 1,
            xp: 5
        });
        const promise = newUser.save();
        assert.ok(promise instanceof Promise);
        promise.then(function (user) {
            assert.equal(user.userId, 'test userid')
            assert.equal(user.serverId, 'test serverid')
            assert.equal(user.grade, 1)
            assert.equal(user.xp, 5)
            userSchema.find()
                .then(users => {
                    assert.equal(users.length, 1)
                    assert.equal(users[0].userId, 'test userid')
                    assert.equal(users[0].serverId, 'test serverid')
                    assert.equal(users[0].grade, 1)
                    assert.equal(users[0].xp, 5)
                    done()
                })
        });
    });
    it('Should update the user', function (done) {
        userSchema.findOneAndUpdate({
            userId: 'test userid',
            serverId: 'test serverid',
            grade: 1,
            xp: 5
        }, {
            userId: 'different userid',
            serverId: 'different serverid',
            grade: 6,
            xp: 28
        }, {
            returnOriginal: false,
            upsert: true
        }, (err, user) => {
            assert.equal(user.userId, 'different userid')
            assert.equal(user.serverId, 'different serverid')
            assert.equal(user.grade, 6)
            assert.equal(user.xp, 28)
            done()
        })
    });
    it('Should drop test database', function (done) {
        mongoose.connection.db.dropDatabase()
        userSchema.find()
            .then(users => {
                assert.equal(users.length, 0)
                done()
            })
    });
});