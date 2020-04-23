import Twit from 'twit';
import Discord from 'discord.js';
import dateFormat from 'dateformat';
import Settings from './settings.js';
import Helper from './helper.js';
import Config from './../../config.json';

const streams = [];

export default class Streams {
    constructor(bot) {
        const T = new Twit({
            consumer_key: Config.twitter.key,
            consumer_secret: Config.twitter.secret,
            access_token: Config.twitter.access_token,
            access_token_secret: Config.twitter.access_token_secret,
            strictSSL: true
        });
        const allSettings = Settings.getAll();
        this.setStream(T, 'wolcen', allSettings, bot);
        this.setStream(T, 'warzone', allSettings, bot);
    }

    setStream(T, game, allSettings, bot) {
        let followObj = game === 'wolcen' ? Config.twitter.wolcen : Config.twitter.warzone;
        streams.push(T.stream('statuses/filter', { follow: followObj.id, tweet_mode: 'extended' }));
        streams[streams.length - 1].on('tweet', tweet => {
            if (tweet.user.id_str === followObj.id) {
                this.sendReceivedTweet(game, allSettings, bot, tweet, followObj);
            }
        });
    }

    sendReceivedTweet(game, allSettings, bot, tweet, followObj) {
        Object.values(allSettings).map((set, index) => {
            if (set.twitter && (set.twitter.wolcen.status === 'on' || set.twitter.warzone.status === 'on')) {
                const channel = bot.channels.cache.get(game === 'wolcen' ? set.twitter.wolcen.channelID : set.twitter.warzone.channelID);
                if (channel) {
                    const authorImg = tweet.user.profile_image_url_https ? tweet.user.profile_image_url_https : tweet.user.profile_image_url;
                    // #44A2FF | Bleu clair
                    const color = '#44A2FF';
                    const text = tweet.truncated ? tweet.extended_tweet.full_text : tweet.text;
                    const embed = new Discord.MessageEmbed()
                        .setAuthor(followObj.name, authorImg)
                        .setColor(color)
                        .setThumbnail('https://syxbot.com/assets/img/twitter.png')
                        .setFooter('📅' + dateFormat(Date(tweet.timestamp_ms), 'dd/mm/yyyy - HH:MM:ss'))
                        .setDescription(text);
                    channel.send({ embed });
                }
                else {
                    const message = {
                        guild: { id: Object.keys(allSettings)[index] },
                        channel: Helper.getFirstAuthorizedChannel(bot.guilds.cache.get(Object.keys(allSettings)[index]))
                    }
                    Settings.setStreamsParams(message, 'twitter', game, 'off')
                }
            }
        });
    }
}
