exports.remove = function (message, howMany) {
    let limit = {}
    if (howMany !== "all") {
        limit = {
            limit : parseInt(howMany) + 1
        }
    }
    message.channel.fetchMessages(limit)
        .then(messages => {
            message.channel.bulkDelete(messages)
            .catch(() => messages.map(message => {
                message.delete()
                .catch(() => {
                    console.log('Erreur de suppression du message')
                })
            }))
        })
        .catch(console.error);
}