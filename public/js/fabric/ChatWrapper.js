var ChatWrapper = function(context){

    // this.chat = new fabric.LabeledChat(id, context);
    this.socket = context.socket;
    
    // how to handle listeners for multiple pages??? removing these potentially dangerous 
    this.socket.removeAllListeners();

    // workaround b/c we lose our reference to 'this' with our listeners 
    var self = this;

    /**
     * listens for changing events, these are scaling, moving, color change, etc
     */

    this.socket.on('newMessage', function(msg){
        console.log(msg);
    });

};

var chats = angular.module('chats', []);

ChatWrapper.prototype.newMessage= function(msg){
	console.log(msg);
}