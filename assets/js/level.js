// const { convertFile } = require('convert-svg-to-png')
// const fs = require('fs')
const mongoose = require('mongoose');
const userSchema = mongoose.model('User', require('../../models/user.js'));

function addXp(message) {
    userSchema.findOne({
        userId: message.author.id,
        serverId: message.guild.id
    })
        .then(user => {
            let grade = 0;
            let xp = 5;
            if (user) {
                xp = user.xp + 5
                if (xp === 50) {
                    xp = 0;
                    grade = user.grade + 1
                }
                user.xp = xp
                user.grade = grade
                user.save()
            }
            else {
                const newUser = new userSchema({
                    userId: message.author.id,
                    serverId: message.guild.id,
                    grade: grade,
                    xp: xp
                })
                newUser.save()
            }
        })
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
                message.channel.send('grade : ' + user.grade + ' ---> xp : ' + user.xp)
            }
            else {
                message.channel.send('Vous n\'avez pas encore envoyé de message !')
            }
        })
}

exports.addXp = addXp
exports.rank = rank