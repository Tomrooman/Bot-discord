exports.take_user_voiceChannel = function(message) {
    let voiceChannel = false
    message.guild.channels.map(channel => {
        if (channel.type === "voice") {
            if (channel.members) {
                channel.members.map(member => {
                    if (member.user.id ===  message.author.id) {
                        voiceChannel = channel
                    }
                })
            }
        }
    })
    return voiceChannel
}