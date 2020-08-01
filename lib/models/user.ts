import mongoose from 'mongoose';
import { userType, userStatic } from 'lib/@types/models/user';

const Schema = mongoose.Schema;

const userSchema = new Schema({
    userId: String,
    serverId: String,
    grade: Number,
    xp: Number
}, {
    versionKey: false
});

userSchema.statics.get = async (userId: string, serverId: string) => {
    if (userId && serverId) {
        const User = mongoose.model<userType>('User');
        const user = await User.findOne({
            userId: userId,
            serverId: serverId
        });
        if (user) {
            return user;
        }
    }
    return false;
};

userSchema.statics.create = async (userId: string, serverId: string) => {
    if (userId && serverId) {
        const User = mongoose.model<userType>('User');
        const user = await new User({
            userId: userId.toString(),
            serverId: serverId.toString(),
            grade: 0,
            xp: 5
        }).save();
        return user;
    }
    return false;
};

userSchema.methods.updateExp = async (user: userType) => {
    if (user) {
        let xp = user.xp + 5;
        let grade = user.grade;
        if (xp === 50) {
            xp = 0;
            grade = grade + 1;
        }
        user.xp = xp;
        user.grade = grade;
        user.markModified('xp');
        user.markModified('grade');
        await user.save();
        return user;
    }
    return false;
};

export default mongoose.model<userType>('User', userSchema);
