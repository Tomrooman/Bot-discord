function addXp(message) {
    let usersCollection = dbConnection.collection('users')
    usersCollection.find({userId : message.author.id}).toArray(function (err, user) {
        if (user.length === 0) {
            console.log('insert user')
            usersCollection.insertOne({'userId' : message.author.id, 'grade' : 0, 'xp': 5})
        }
        else {
            console.log('user : ', user)
            console.log('update xp')
            message.reply('Votre grade : ' + user[0].grade + '\nVotre xp : ' + user[0].xp)
        }
    })
}

function rank(message) {
    let usersCollection = dbConnection.collection('users')
    usersCollection.find({userId : message.author.id}).toArray(function (err, users) {
        if (users.length > 0) {
            console.log('users found : ', users)
            console.log('and show him his card')
            message.reply('I must send you your card')
        }
        else {
            message.reply("Vous n'avez pas encore envoyé de message !")
        }
    })
}

exports.addXp = addXp
exports.rank = rank