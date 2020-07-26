import { Item } from 'ytsr';

export type searchVideo = {
    infos: searchVideosInfos[],
    array: searchVideoArray[],
    last: Item[],
    old: searchVideoArray[]
} | []

export type searchPlaylist = {
    infos: searchVideosInfos[],
    array: searchPlaylistArray[],
    last: Item[],
    old: searchVideoArray[]
} | []

export type searchVideoArray = {
    nextpage?: string,
    url: string,
    title: string
}

export type searchVideosInfos = {
    title: string,
    count: number
}

export type searchPlaylistArray = {
    nextpage?: string,
    url: string,
    title: string,
    plLength: number
}

export type musicParams = {
    cancel: boolean[],
    loop: boolean[],
    tryToNext: boolean[],
    wait: boolean[],
    nextSetLoop: boolean[]
}

export type playlistArray = {
    url: string[]
    newPlaylistDuration?: number,
    currentDuration?: number
}

export type playlistInfos = {
    title: string,
    id: string,
    thumbnail: string,
    duration: string
}