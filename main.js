exports.dispatcher = function(message) {
    console.log('here 1')
    console.log('here 2')
    message.channel.send('Dispatcher')
};
    
exports.other = function() {
    console.log('other 1')
    console.log('other 2')
};