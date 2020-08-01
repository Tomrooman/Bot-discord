import { Item } from 'ytsr';

export type searchVideoType = {
    infos?: searchVideosInfosType,
    array?: searchVideoArrayType[],
    last?: Item[],
    old?: searchVideoArrayType[]
}

export type searchVideoArrayType = {
    nextpage?: string | boolean,
    url: string,
    title: string,
    plLength?: number
}

export type searchVideosInfosType = {
    title: string,
    count: number
}

export type musicParamsType = {
    cancel: boolean[],
    loop: boolean[],
    tryToNext: boolean[],
    wait: boolean[],
    nextSetLoop: boolean[]
}

export type playlistArrayType = {
    url: string[]
    newPlaylistDuration?: number,
    currentDuration?: number
}

export type playlistInfosType = {
    title: string,
    id: string,
    thumbnail: string,
    duration: string
}

export type embedObjType = {
    title: string;
    id: string;
    duration: string;
    thumbnail: string;
}