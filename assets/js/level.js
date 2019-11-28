// const { convertFile } = require('convert-svg-to-png')
// const fs = require('fs')
const mongoose = require('mongoose');
const userSchema = mongoose.model('User', require('../../models/user.js'));
const alreadyFound = []

function addXp(message) {
    if (!alreadyFound[message.guild.id] ||
        (alreadyFound[message.guild.id] && !alreadyFound[message.guild.id][message.author.id])) {
        console.log('Try to find user')
        userSchema.findOne({ userId: message.author.id, serverId: message.guild.id })
            .then(user => {
                if (!alreadyFound[message.guild.id]) {
                    alreadyFound[message.guild.id] = []
                }
                alreadyFound[message.guild.id][message.author.id] = 'yes'
                if (user) {
                    user.xp = user.xp + 5
                    user.save()
                }
                else {
                    console.log('insert user')
                    const newUser = new userSchema({
                        userId: message.author.id,
                        serverId: message.guild.id,
                        grade: 0,
                        xp: 5
                    });
                    newUser.save();
                }
            })
    }
    else {
        userSchema.findOne({ userId: message.author.id, serverId: message.guild.id })
            .then(user => {
                user.xp = user.xp + 5
                user.save()
            })
    }
}

function rank(message) {
    userSchema.findOne({ userId: message.author.id, serverId: message.guild.id })
        .then(user => {
            if (user) {
                // console.log('users found : ', users)
                // var svg = []
                // svg[0] = `<text x="512" y="95" fill="#dfdfdf" font-family="Cooper Std" font-size="72" alignment-baseline="middle" text-anchor="middle">Stalyr</text>`
                // svg[1] = `<text x="864" y="345" fill="#dfdfdf" font-family="Cooper Std" font-size="72" alignment-baseline="middle" text-anchor="middle">${users[0].grade}</text>`
                // svg[2] = `<text x="160" y="290" fill="#dfdfdf" font-family="Cooper Std" font-size="42" alignment-baseline="middle" text-anchor="middle">${users[0].xp + '/' + '50'}</text>`
                // svg[3] = `<rect x="94" y="321" width=${'583'} height="50" rx="15" ry="15" id="xp_rect" />`
                // svg[4] = '</svg>'
                // fs.copyFileSync('./personnal/Bot.svg', './personnal/Bot_copy.svg')
                // fs.appendFile('./personnal/Bot_copy.svg', svg.join(''), () => {
                //     convertFile("./personnal/Bot_copy.svg").then(() => {
                //         message.reply('Grade : ' + users[0].grade + '\nXp : ' + users[0].xp, { files: ["./personnal/Bot_copy.png"] })
                //         // fs.unlinkSync('./personnal/Bot_copy.svg')
                //         // fs.unlinkSync('./personnal/Bot_copy.png')
                //     })
                // })
                message.reply('votre xp : ' + user.xp)
            }
            else {
                message.reply('Vous n\'avez pas encore envoyé de message !')
            }
        })
}

exports.addXp = addXp
exports.rank = rank