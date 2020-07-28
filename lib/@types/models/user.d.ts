import { Document, Model } from 'mongoose';

export interface userType extends Document {
    userId: string;
    serverId: string;
    grade: number;
    xp: number;
}

export interface userStatic extends Model<userType> {
    get(userId: string, serverId: string): Promise<userType> | false;

    create(userId: string, serverId: string): Promise<userType> | false;

    updateExp(user: userType): Promise<userType> | false;
}
