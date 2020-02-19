export default class Custom {
    static pioupiou(message) {
        message.member.guild.members.cache.map(member => {
            if (member.user.username + member.user.discriminator === 'Tam3534') {
                message.channel.send('<@' + member.user.id + '> pas cher pas cher !');
            }
        });
    }
}
