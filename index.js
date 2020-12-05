const discord = require("discord.js")
const prefix = "p!";
const client = new discord.Client()
const db = require("quick.db")
require('dotenv').config()

const token = process.env.token


client.on("ready", () => {
    console.log("This bot Is Online");
    client.user.setActivity('People Talking!', { type: 'WATCHING' });


})

client.on("message", (message) => {

    let args = message.content.slice(prefix.length).toLocaleLowerCase().split(" ");
    if(!message.content.startsWith(prefix)) return;
    switch(args[0]){

        case 'eval':
            message.delete();

            try{
            if(message.author.id == "439815568607019009"){
           var eval_code = message.content.slice(5 + 1)
           const eval_embed = new discord.MessageEmbed()
           .addField("Input:", `\`\`\`js\n${eval_code}\`\`\``)
           .addField("Output:", `\`\`\`js\n${eval(eval_code)}\`\`\``)
           .setColor("BLUE")
           message.channel.send(eval_embed)
            }else{
                message.channel.send("Only My Developer Can Use This Command!").then(msg => {
                    msg.delete({timeout: 5000})
                })
            }
              }catch(e){
                      if(message.author.id == "439815568607019009"){
                       var eval_code_err = message.content.slice(5 + 1)
           const eval_embed_err = new discord.MessageEmbed()
           .addField("Input:", `\`\`\`js\n${eval_code_err}\`\`\``)
           .addField("Output:", `\`\`\`js\n${e}\`\`\``)
           .setColor("BLUE")
           message.channel.send(eval_embed_err)
              }
            }
            break; 

        case 'findcall':

        if(db.fetch("call_finder") == null){

            const findingUser = new discord.MessageEmbed()
            .setTitle("Looking For Member")
            .setDescription("Looking for another person to use this command too.")
            .setColor("GREEN")

            message.channel.send(findingUser).then(m => {
                db.set("call_finder", 
                
                    {

                     authorID:  message.member.id,
                     channelID: message.channel.id,
                     serverID: message.guild.id


                    }
                )
                var DotsCounter = 3
                var loopCounter = 0
                
                setInterval(() => {
                    var IsFinishLooping = loopCounter > 6;
                    if(IsFinishLooping) return;
                    var dotsString = ""

                    if(DotsCounter == 3) {
                        DotsCounter = 1
                        dotsString = ".";

                    };
                    if(DotsCounter == 2) {
                        DotsCounter = 3;
                        dotsString = "...";
                    }
                    if(DotsCounter == 1) {
                        DotsCounter = 2;
                        dotsString = "..";
                    }


                    const newEmbed = new discord.MessageEmbed()
                    .setTitle("Looking For Member")
                    .setDescription("Looking for another person to use this command too" + dotsString)
                    .setColor("GREEN")
                    m.edit(newEmbed);

                    




                }, 700)
            })
        }else{
            var otherMemberInfo = db.fetch("call_finder");
            if(otherMemberInfo.authorID == message.member.id){
                message.reply("You cant talk with your self!")
                return;
            }
            console.log(otherMemberInfo)
            var otherUser = client.users.cache.get(otherMemberInfo.authorID)
            var ThisUserUsername = client.users.cache.get(message.member.id).username

            var thisUserInfo = {

                authorID:  message.member.id,
                channelID: message.channel.id,
                serverID: message.guild.id


               }
            const findingUser = new discord.MessageEmbed()
            .setTitle("Found A Member!")
            .setDescription(`Found a member with username of  ${otherUser.username}\nUse the command \`p!talk <content>\` to talk to him!\n\nThe call will end within 5 minutes or by typing \`p!endcall\``)
            .setColor("GREEN")
            message.channel.send(findingUser);


            var otherUserChannel = client.guilds.cache.get(otherMemberInfo.serverID).channels.cache.get(otherMemberInfo.channelID)

            const otherUserEmbed = new discord.MessageEmbed()
            .setTitle("Found A Member!")
            .setDescription(`Found a member with username of  ${ThisUserUsername}\nUse the command \`p!talk <content>\` to talk to him!\nThe call will end within 5 minutes or by typing \`p!endcall\``)
            .setColor("GREEN")
            otherUserChannel.send(otherUserEmbed);

            var firstCallArr = db.fetch("calls")
            var currentCallsArr = db.fetch("calls")
            if(currentCallsArr == null){

                db.set("calls", [
                    [
                        thisUserInfo,
                        otherMemberInfo

                ]
            ])

            }else{

                currentCallsArr.push([
                    thisUserInfo,
                    otherMemberInfo

            ])

            db.set("calls", currentCallsArr)
                

            }

            setTimeout(() => {

                db.set("calls",  firstCallArr)
                
            }, 300000);

            

        }
        break;

        case 'talk':


        var content = "";
        if(!args[1]){
            message.reply("You need to specify what you want to say.\nexample: `p!talk hello, how are you?`")
            return;
        }

        for(var i = 1; i < args.length; i++){

            content += (args[i] + " ")

        }
        
        var callsArr = db.fetch("calls")
        if(callsArr == null) callsArr = [];
        var InfoAboutThisCall;
        var OtherUserInfo;
        var ThisUserInfo;

        for(var i = 0; i < callsArr.length; i++){

            if(callsArr[i][0].authorID == message.member.id){
                InfoAboutThisCall = callsArr[i]
                OtherUserInfo = InfoAboutThisCall[1]
                ThisUserInfo = InfoAboutThisCall[0]
                break
            }

            if(callsArr[i][1].authorID == message.member.id){
                InfoAboutThisCall = callsArr[i]
                OtherUserInfo = InfoAboutThisCall[0]
                ThisUserInfo = InfoAboutThisCall[1]

                break
            }

        }

        if(InfoAboutThisCall == undefined){
            //didn't found this call
            return;
        }

        if(ThisUserInfo.serverID != message.guild.id){
            message.reply("You need use this command only on the same server as you started the call!")
            return;
        }


        var otherUserChannel = client.guilds.cache.get(OtherUserInfo.serverID).channels.cache.get(OtherUserInfo.channelID)
        var otherUser = client.users.cache.get(OtherUserInfo.authorID)

            const toOtherUserEmbed = new discord.MessageEmbed()
            .setTitle("New Message!")
            .setDescription(`You got a new message from ${message.member.user.username}\nMessage: ${content}`)
            .setColor("BLUE")
            otherUserChannel.send(toOtherUserEmbed);

            const messageSuccess = new discord.MessageEmbed()
            .setDescription(`Successfully sent ${content} to ${otherUser.username}`)
            .setColor("BLUE")
            message.channel.send(messageSuccess);



        break;

        case 'endcall':

            var callsArr = db.fetch("calls")
            if(callsArr == null) callsArr = [];
            var InfoAboutThisCall;
            var OtherUserInfo;
            var ThisUserInfo;
            var positionOfTalk;

            for(var i = 0; i < callsArr.length; i++){
    
                if(callsArr[i][0].authorID == message.member.id){
                    InfoAboutThisCall = callsArr[i]
                    OtherUserInfo = InfoAboutThisCall[1]
                    ThisUserInfo = InfoAboutThisCall[0]
                    positionOfTalk = i;
                    break
                }
    
                if(callsArr[i][1].authorID == message.member.id){
                    InfoAboutThisCall = callsArr[i]
                    OtherUserInfo = InfoAboutThisCall[0]
                    ThisUserInfo = InfoAboutThisCall[1]
                    positionOfTalk = i;

                    break
                }
    
            }
    
            if(InfoAboutThisCall == undefined){
                //didn't found this call
                return;
            }
            var filterdArray = []
            var callsArr = db.fetch("calls")
            for(var i = 0; i < callsArr.length; i++){
                if(positionOfTalk != i){
                    filterdArray.push(callsArr[i])
                }
            }
            db.set("calls", filterdArray);

            var otherUserChannel = client.guilds.cache.get(OtherUserInfo.serverID).channels.cache.get(OtherUserInfo.channelID)
            var otherUser = client.users.cache.get(OtherUserInfo.authorID)
    
                const toOtherUserEmbed2 = new discord.MessageEmbed()
                .setTitle("Conversation Ended")
                .setDescription(`The conversation between ${message.member.user.username} and ${otherUser.username} ended! `)
                .setColor("BLUE")
                otherUserChannel.send(toOtherUserEmbed2);
    
                const messageSuccess2 = new discord.MessageEmbed()
                .setTitle("Conversation Ended")
                .setDescription(`The conversation between ${message.member.user.username} and ${otherUser.username} ended! `)
                .setColor("BLUE")
                message.channel.send(messageSuccess2);
    

        break;



        case 'info':



        const info_embed = new discord.MessageEmbed()
        .setTitle("Phone Bot!")
        .setDescription("I am a fun bot that lets you talk with random people! \n you can add me to your server by clicking [here](https://discord.com/api/oauth2/authorize?client_id=784536508384280597&permissions=0&scope=bot) \n If you found any bugs, I would like to hear them in my [support server](https://discord.gg/jYSUjs7)")
        .setColor("BLUE")
        .addField("How To Start", "To start a chat, you need to use the command `" + prefix + "findcall` and it will find to you someone!")
        .addField("How To Talk", "To say things to your conversion buddy you need to use the command `!talk <message>` and it will send to the other person what you said.")
        .addField("How To Stop A Call", "To stop a call, you need to use the command `" + prefix + "`endcall and it will end the call!")

        .setFooter("Created By " + client.guilds.cache.find(g => g.id === "675004894436130816").members.cache.find(m => m.id === "439815568607019009").user.username, client.guilds.cache.find(g => g.id === "675004894436130816").members.cache.find(m => m.id === "439815568607019009").user.displayAvatarURL())
        .setThumbnail(client.user.displayAvatarURL())
        message.channel.send(info_embed)
        break;



    }

})

client.login(token)