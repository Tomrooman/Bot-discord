import Player from './player.js';
import Helper from './helper.js';
import Config from './../../config.json';
import path from 'path';
import wav from 'wav';
import { Readable, Transform } from 'stream';
import googleSpeech from '@google-cloud/speech';

const intervals = { data: [], date: [] };
const streams = { user: [], recognition: [], writer: [] };
// const activate = [];

// const googleSpeechClient = new googleSpeech.SpeechClient();

class Silence extends Readable {
    _read() {
        this.push(Buffer.from([0xF8, 0xFF, 0xFE]));
    }
}

class ConvertTo1ChannelStream extends Transform {
    constructor(source, options) {
        super(options);
    }

    _transform(data, encoding, next) {
        next(null, this.convertBufferTo1Channel(data));
    }

    convertBufferTo1Channel(buffer) {
        const convertedBuffer = Buffer.alloc(buffer.length / 2);

        for (let i = 0; i < convertedBuffer.length / 2; i++) {
            const uint16 = buffer.readUInt16LE(i * 4);
            convertedBuffer.writeUInt16LE(uint16, i * 2);
        }

        return convertedBuffer;
    }
}

export default class Speech {
    constructor(user) {
        intervals.date[user.id] = Date.now();
        let connection = Player.getArray(user, 'connections');
        while (!connection) {
            connection = Player.getArray(user, 'connections');
        }
        connection.play(new Silence());
        streams.user[user.id] = connection.receiver.createStream(user, { mode: 'pcm', end: 'silence' });
        // this.googleRecognition(user);
        const convertTo1ChannelStream = new ConvertTo1ChannelStream();
        // streams.user[user.id].pipe(convertTo1ChannelStream).pipe(streams.recognition[user.id]);
        streams.writer[user.id] = new wav.FileWriter(`audio/${user.id}.wav`, {
            channels: 1,
            sampleRate: 48000,
            bitDepth: 16
        });
        streams.user[user.id].pipe(convertTo1ChannelStream).pipe(streams.writer[user.id]);
        streams.user[user.id].on('data', () => {
            console.log('data');
            intervals.data[user.id] = true;
            intervals.date[user.id] = Date.now();
        });
        streams.user[user.id].on('debug', info => {
            console.log('DEBUG : ', info);
        });
        const interv = setInterval(() => {
            const diff = Date.now() - intervals.date[user.id];
            console.log('diff: ', diff);
            if (intervals.data[user.id] && diff >= 400 || (!intervals.data[user.id] && diff >= 1700)) {
                console.log('Stream destroyed');
                // streams.user[user.id].end();
                streams.writer[user.id].end();
                // streams.recognition[user.id].end();
                clearInterval(interv);
                delete intervals.date[user.id];
                delete intervals.data[user.id];
                delete streams.writer[user.id];
                // bot.emit('guildMemberSpeaking', user, false);
                // delete streams.recognition;
            }
        }, 200);
    }

    googleRecognition(user) {
        const request = {
            config: {
                encoding: 'LINEAR16',
                sampleRateHertz: 48000,
                languageCode: 'en-US'
            },
            interimResults: false,
            single_utterance: true
        };
        const jsonPath = path.join(__dirname, '..', '..', 'config.json');
        streams.recognition[user.id] = new googleSpeech.SpeechClient({
            projectId: 'syxbot',
            keyFilename: jsonPath
        })
            .streamingRecognize(request)
            .on('error', console.error)
            .on('data', response => {
                const transcription = response.results
                    .map(result => result.alternatives[0].transcript)
                    .join('\n')
                    .toLowerCase();
                console.log(`Transcription: ${transcription}`);
                delete streams.recognition[user.id];
                const channel = Helper.getFirstAuthorizedChannel(user.guild);
                channel.send(`${Config.prefix}${transcription}`);
            });
    }
}