var alreadyFound = []

function addXp(message) {
    // plus tard rajouter les infos du user dans un tableau
    // et faire un cron pour mettre à jour la database en fonction
    // de ce tableau
    if (!!!alreadyFound[message.guild.id] ||
        (!!alreadyFound[message.guild.id] && !!!alreadyFound[message.guild.id][message.author.id])) {
        let usersCollection = dbConnection.collection('users')
        console.log('Try to find user')
        usersCollection.find({
            userId: message.author.id,
            serverId: message.guild.id
        }).toArray(function (err, user) {
            if (!!!alreadyFound[message.guild.id]) {
                alreadyFound[message.guild.id] = []
            }
            alreadyFound[message.guild.id][message.author.id] = "yes"
            if (user.length === 0) {
                console.log('insert user')
                usersCollection.insertOne({
                    userId: message.author.id,
                    serverId: message.guild.id,
                    grade: 0,
                    xp: 5
                })
            }
            else {
                updateXp(user)
            }
        })
    }
    else {
        let usersCollection = dbConnection.collection('users')
        usersCollection.find({
            userId: message.author.id,
            serverId: message.guild.id
        }).toArray(function (err, user) {
            updateXp(user)
        })
    }
}

function updateXp(user) {
    console.log('update xp')
    let usersCollection = dbConnection.collection('users')
    usersCollection.updateOne({
        userId : user[0].userId,
        serverId : user[0].serverId
    },
    { $set : {xp : user[0].xp + 5 } },
    { upsert : true }
    )
}

function rank(message) {
    // plus tard prendre infos du tableau
    let usersCollection = dbConnection.collection('users')
    usersCollection.find({
        userId: message.author.id,
        serverId: message.guild.id
    }).toArray(function (err, users) {
        if (users.length > 0) {
            console.log('users found : ', users)
            console.log('and show him his card')
            message.reply('Grade : ' + users[0].grade + '\nXp : ' + users[0].xp)
        }
        else {
            message.reply("Vous n'avez pas encore envoyé de message !")
        }
    })
}

exports.addXp = addXp
exports.rank = rank