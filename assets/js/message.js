function remove(message, howMany) {
    if (howMany > 99) {
        message.channel.send('> Écrivez un chiffre inférieur ou égal à 99')
    }
    else {
        let limit = {}
        if (howMany !== 'all') {
            limit = {
                limit: parseInt(howMany) + 1
            }
        }
        message.channel.fetchMessages(limit)
            .then(messages => {
                message.channel.bulkDelete(messages)
                    .catch(() => messages.map(oneMessage => {
                        oneMessage.delete()
                            .catch(() => {
                                console.log('Erreur de suppression du message')
                            })
                    }))
            })
            .catch(console.error);
    }
}

exports.remove = remove