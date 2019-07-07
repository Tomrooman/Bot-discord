const { convertFile } = require('convert-svg-to-png')
const fs = require('fs')
var alreadyFound = []

function addXp(message) {
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
        userId: user[0].userId,
        serverId: user[0].serverId
    },
        { $set: { xp: user[0].xp + 5 } },
        { upsert: true }
    )
}

function rank(message) {
    let usersCollection = dbConnection.collection('users')
    usersCollection.find({
        userId: message.author.id,
        serverId: message.guild.id
    }).toArray(function (err, users) {
        if (users.length > 0) {
            console.log('users found : ', users)
            var svg = []
            svg[0] = `<text x="512" y="95" fill="#dfdfdf" font-family="Cooper Std" font-size="72" alignment-baseline="middle" text-anchor="middle">Stalyr</text>`
            svg[1] = `<text x="864" y="345" fill="#dfdfdf" font-family="Cooper Std" font-size="72" alignment-baseline="middle" text-anchor="middle">${users[0].grade}</text>`
            svg[2] = `<text x="160" y="290" fill="#dfdfdf" font-family="Cooper Std" font-size="42" alignment-baseline="middle" text-anchor="middle">${users[0].xp + '/' + '50'}</text>`
            svg[3] = `<rect x="94" y="321" width=${'583'} height="50" rx="15" ry="15" id="xp_rect" />`
            svg[4] = '</svg>'
            fs.copyFileSync('./personnal/Bot.svg', './personnal/Bot_copy.svg')
            fs.appendFile('./personnal/Bot_copy.svg', svg.join(''), () => {
                convertFile("./personnal/Bot_copy.svg").then(() => {
                    message.reply('Grade : ' + users[0].grade + '\nXp : ' + users[0].xp, { files: ["./personnal/Bot_copy.png"] })
                    // fs.unlinkSync('./personnal/Bot_copy.svg')
                    // fs.unlinkSync('./personnal/Bot_copy.png')
                })
            })

        }
        else {
            message.reply("Vous n'avez pas encore envoyé de message !")
        }
    })
}

exports.addXp = addXp
exports.rank = rank