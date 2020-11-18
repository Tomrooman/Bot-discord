export interface notifArrayType {
    userID: string;
    dragodindes: dragodindesType[] | sortedDragoType[];
}

export interface dragodindeType {
    name: string;
    duration: number;
    generation: number;
    used: boolean;
    last: {
        status: boolean;
        date?: number;
    };
    sended: boolean;
}

export interface userNotifInfos {
    userID: string;
    notif: boolean;
}

export interface sortedDragoType {
    name: string;
    duration: number;
    generation: number;
    used: boolean;
    selected?: boolean;
    last: {
        status: boolean;
        date?: number;
    };
    end: {
        time: string;
        date: number;
    };
    sended: boolean;
}