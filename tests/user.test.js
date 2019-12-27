import assert from 'assert'
import mongoose from 'mongoose'
import userSchema from '../models/user.js'

describe('User', function () {
    it('Users should be empty', function (done) {
        userSchema.find()
            .then(users => {
                assert.equal(users.length, 0)
                done()
            })
    });
    it('CheckExist() - Check if the user exist', function (done) {
        userSchema.checkExist('different userid', 'different serverid')
            .then(user => {
                assert.equal(user, false)
                done()
            })
    });
    it('Add user', function (done) {
        const promise = userSchema.create('test userid', 'test serverid')
        assert.ok(promise instanceof Promise);
        promise.then(function (user) {
            userSchema.find()
                .then(users => {
                    assert.equal(users.length, 1)
                    assert.equal(users[0].userId, 'test userid')
                    assert.equal(users[0].serverId, 'test serverid')
                    assert.equal(users[0].grade, 0)
                    assert.equal(users[0].xp, 5)
                    done()
                })
        });
    });
    it('Update user', function (done) {
        userSchema.findOneAndUpdate({
            userId: 'test userid',
            serverId: 'test serverid'
        }, {
            userId: 'different userid',
            serverId: 'different serverid',
            grade: 3,
            xp: 45
        }, {
            returnOriginal: false,
            upsert: true
        }, (err, user) => {
            assert.equal(user.userId, 'different userid')
            assert.equal(user.serverId, 'different serverid')
            assert.equal(user.grade, 3)
            assert.equal(user.xp, 45)
            done()
        })
    });
    it('CheckExist() - Check if the user exist', function (done) {
        userSchema.checkExist('different userid', 'different serverid')
            .then(user => {
                assert.equal(user.userId, 'different userid')
                done()
            })
    });
    it('UpdateExp() - Update grade and exp for the user', function (done) {
        userSchema.findOne({ userId: 'different userid', serverId: 'different serverid' })
            .then(user => {
                assert.equal(user.userId, 'different userid')
                assert.equal(user.serverId, 'different serverid')
                assert.equal(user.xp, 45)
                assert.equal(user.grade, 3)
                const promise = user.updateExp(user)
                assert.ok(promise instanceof Promise);
                promise.then(updatedUser => {
                    assert.equal(updatedUser.userId, 'different userid')
                    assert.equal(updatedUser.serverId, 'different serverid')
                    assert.equal(updatedUser.grade, 4)
                    assert.equal(updatedUser.xp, 0)
                    done()
                })
            })
    });
    it('GetGradeAndExp() - Get grade and exp for user', function (done) {
        userSchema.getGradeAndExp('different userid', 'different serverid')
            .then(user => {
                assert.equal(user.xp, 0)
                assert.equal(user.grade, 4)
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