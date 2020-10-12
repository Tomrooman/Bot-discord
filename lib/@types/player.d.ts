import { Item } from 'ytsr';

export interface searchVideoType {
    infos?: searchVideosInfosType,
    array?: searchVideoArrayType[],
    last?: Item[],
    old?: searchVideoArrayType[]
}

export interface searchVideoArrayType {
    nextpage?: string | boolean,
    url: string,
    title: string,
    plLength?: number
}

export interface searchVideosInfosType {
    title: string,
    count: number
}

export interface musicParamsType {
    cancel: boolean[],
    loop: boolean[],
    tryToNext: boolean[],
    wait: boolean[],
    nextSetLoop: boolean[]
}

export interface playlistArrayType {
    url: string[]
    newPlaylistDuration?: number,
    currentDuration?: number
}

export interface playlistInfosType {
    title: string,
    id: string,
    thumbnail: string,
    duration: string
}

export interface embedObjType {
    title: string;
    id: string;
    duration: string;
    thumbnail: string;
}