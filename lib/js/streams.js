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
            const userId = tweet.user.id_str;
            if (ids.includes(userId)) {
                console.log('Received tweet: ', tweet);
                console.log('url entities: ', tweet.entities.urls);
                if (tweet.retweeted_status) {
                    console.log('Retweeted entities url: ', tweet.retweeted_status.entities.urls);
                }
                const game = userId === ids[0] ? 'wolcen' : 'warzone';
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
                    const embed = new Discord.MessageEmbed()
                        .setAuthor(tweet.user.name, authorImg)
                        .setColor(color)
                        .setThumbnail('https://syxbot.com/assets/img/twitter.png')
                        .setFooter('📅' + dateFormat(Date(tweet.timestamp_ms), 'dd/mm/yyyy - HH:MM:ss'))
                        .setDescription(this.getText(tweet));
                    channel.send({ embed });
                }
                else {
                    const message = {
                        guild: { id: Object.keys(allSettings)[index] },
                        channel: Helper.getFirstAuthorizedChannel(bot.guilds.cache.get(Object.keys(allSettings)[index]))
                    };
                    Settings.setStreamsParams(message, 'twitter', game, 'off');
                }
            }
        });
    }

    getText(tweet) {
        if (tweet.truncated) return tweet.extended_tweet.full_text;
        else if (tweet.retweeted_status && tweet.retweeted_status.extended_tweet) return tweet.retweeted_status.extended_tweet.full_text;
        else if (tweet.retweeted_status) return tweet.retweeted_status.text;
        else return tweet.text;
    }
}
