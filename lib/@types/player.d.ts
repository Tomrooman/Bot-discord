import { Item } from 'ytsr';

export type searchVideoType = {
    infos: searchVideosInfos[],
    array: searchVideoArray[],
    last: Item[],
    old: searchVideoArray[]
} | []

export type searchPlaylistType = {
    infos: searchVideosInfos[],
    array: searchPlaylistArray[],
    last: Item[],
    old: searchVideoArray[]
} | []

export type searchVideoArrayType = {
    nextpage?: string,
    url: string,
    title: string
}

export type searchVideosInfosType = {
    title: string,
    count: number
}

export type searchPlaylistArrayType = {
    nextpage?: string,
    url: string,
    title: string,
    plLength: number
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