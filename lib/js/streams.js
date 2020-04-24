import Twit from 'twit';
import Discord from 'discord.js';
import dateFormat from 'dateformat';
import Settings from './settings.js';
import Helper from './helper.js';
import Config from './../../config.json';

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
        const ids = Config.twitter.games.map(tw => tw.id);
        this.setStream(T, allSettings, ids, bot);
    }

    setStream(T, allSettings, ids, bot) {
        const stream = T.stream('statuses/filter', { follow: ids, tweet_mode: 'extended' });
        stream.on('tweet', tweet => {
            if (ids.includes(tweet.user.id_str)) {
                console.log('Received tweet: ', tweet);
                console.log('Text: ', tweet.text);
                console.log('Truncated: ', tweet.truncated);
                if (tweet.extended_tweet) {
                    console.log('Full text: ', tweet.extended_tweet.full_text);
                }
                console.log('url entities: ', tweet.entities.urls);
                const game = tweet.user.id_str === ids[0] ? 'wolcen' : 'warzone';
                this.sendReceivedTweet(game, allSettings, bot, tweet);
            }
        });
    }

    sendReceivedTweet(game, allSettings, bot, tweet) {
        Object.values(allSettings).map((set, index) => {
            if (set.twitter && (set.twitter.wolcen.status === 'on' || set.twitter.warzone.status === 'on')) {
                const channel = bot.channels.cache.get(game === 'wolcen' ? set.twitter.wolcen.channelID : set.twitter.warzone.channelID);
                if (channel) {
                    const authorImg = tweet.user.profile_image_url_https ? tweet.user.profile_image_url_https : tweet.user.profile_image_url;
                    // #44A2FF | Bleu clair
                    const color = '#44A2FF';
                    const text = tweet.truncated ? tweet.extended_tweet.full_text : tweet.text;
                    const embed = new Discord.MessageEmbed()
                        .setAuthor(tweet.user.name, authorImg)
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
