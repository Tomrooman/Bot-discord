const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userId: String,
    serverId: String,
    grade: Number,
    xp: Number
}, {
    versionKey: false
});

userSchema.statics.create = (userId, serverId) => {
    const User = mongoose.model('User', userSchema)
    return new User({
        userId: userId.toString(),
        serverId: serverId.toString(),
        grade: 0,
        xp: 5
    })
        .save()
}

userSchema.statics.getGradeAndExp = (userId, serverId) => {
    const User = mongoose.model('User', userSchema)
    return User.findOne({ userId: userId, serverId: serverId })
        .then(user => {
            return {
                grade: user.grade,
                xp: user.xp
            }
        })
}

userSchema.statics.checkExist = (userId, serverId) => {
    const User = mongoose.model('User', userSchema)
    return User.findOne({
        userId: userId,
        serverId: serverId
    })
        .then(user => {
            if (user) {
                return user
            }
            return false
        })
}

userSchema.methods.updateExp = (user) => {
    let xp = user.xp + 5
    let grade = user.grade
    if (xp === 50) {
        xp = 0;
        grade = grade + 1
    }
    user.xp = xp
    user.grade = grade
    return user.save()
}

module.exports = mongoose.model('User', userSchema);