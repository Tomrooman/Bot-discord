import Twit from 'twit';
import Discord from 'discord.js';
import dateFormat from 'dateformat';
import Settings from './settings.js';
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
        const stream = T.stream('statuses/filter', { follow: Config.twitter.wolcen.id, tweet_mode: 'extended' });
        stream.on('tweet', tweet => {
            if (tweet.user.id_str === Config.twitter.wolcen.id) {
                const allSettings = Settings.getAll();
                Object.values(allSettings).map(set => {
                    if (set.twitter && set.twitter.wolcen.status === 'on') {
                        const channel = bot.channels.cache.get(set.twitter.wolcen.channelID);
                        const authorImg = tweet.user.profile_image_url_https ? tweet.user.profile_image_url_https : tweet.user.profile_image_url;
                        // #44A2FF | Bleu clair
                        const color = '#44A2FF';
                        const text = tweet.truncated ? tweet.extended_tweet.full_text : tweet.text;
                        const embed = new Discord.MessageEmbed()
                            .setAuthor('@' + tweet.user.screen_name, authorImg)
                            .setColor(color)
                            .setThumbnail('https://syxbot.com/img/twitter.png')
                            .setFooter('📅' + dateFormat(Date(tweet.timestamp_ms), 'dd/mm/yyyy - HH:MM:ss'))
                            .setDescription(text);
                        if (channel) {
                            channel.send({ embed });
                        }
                    }
                });
            }
        });
    }
}
