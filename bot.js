/**

WELCOME TO KERBEBOT DEVELOPMENT

CURRENT VERSION: 0.4.5b
->echoDance and >hiddenEchoDance
->giveExp completed

NEXT MAJOR VERSION: 0.5b

Whats planned to be done by then?
-Gambling exp with >slots
-Work on implementing cross-server settings/support (partially done)
-Add >mute
-Modify >getExp so that you can specify a certain user

**/

var alphabetEmoji = ["<a:danceA:435191352133812227>", "<a:danceB:435191352217567233>", "<a:danceC:435191351936679948>", 
		     "<a:danceD:435191354121912342>", "<a:danceE:435191355279540225>", "<a:danceF:435191355401043968>", 
		     "<a:danceG:435191355359363095>", "<a:danceH:435191355787051008>", "<a:dancel:435191355598176256>", 
		     "<a:danceJ:435191355065630727>", "<a:danceK:435191355346649089>", "<a:danceL:435191355212431370>", 
		     "<a:danceM:435191355724005376>", "<a:danceN:435191355485192203>", "<a:danceO:435191355892039701>", 
		     "<a:danceP:435191355556495370>", "<a:danceQ:435191353597755392>", "<a:danceR:435191355472347137>", 
		     "<a:danceS:435191355837382686>", "<a:danceT:435191355535392780>", "<a:danceU:435191355598438400>", 
		     "<a:danceV:435191355803959306>", "<a:danceW:435191355808153601>", "<a:danceX:435191355556233227>", 
		     "<a:danceY:435191355145191436>", "<a:danceZ:435191355753496587>"];

var alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

//Initialization of things
const Discord = require("discord.js");
const client = new Discord.Client();
var fs = require("fs");

const info = require('./info.json');

client.on("ready", () => {
    console.log("I am ready!");
    var keys = Object.keys(images);
    
    var avatarNum = Math.floor(random(0, keys.length));
    var avatar = keys[avatarNum];
    
    client.user.setActivity(avatar + " (type >help)", {type: "PLAYING"});
    client.user.setAvatar(images[avatar]);
    
});

//Help for all the commands
const help = {
    ">ping": "pong!",
    ">help": "KerbeBot lists all the commands.",
    ">echo": "KerbeBot will repeat what you say.",
    ">hiddenEcho": "KerbeBot will delete your message before repeating what you say.",
    ">echoDance": "KerbeBot will repeat what you say but with fancy dancing letters.",
    ">hiddenEchoDance": "KerbeBot will repeat what you say but with fancy dancing letters and it deletes the command usage.",
    ">getColor": "KerbeBot will give you a color role. Options are `red`, `orange`, `yellow`, `green`, `blue`, or `purple`.",
    ">getExp": "KerbeBot tells you how much exp you have.",
    ">giveExp": "KerbeBot will give exp to any specified user.",
    ">mods": "KerbeBot lists all the people who can use mod commands.",
    ">setExpChannel": "`MOD ONLY` KerbeBot will specify which channel to have the leaderboard on.",
    ">delete": "`MOD ONLY` KerbeBot will delete messages for you.",
    ">addMod": "`OWNER ONLY` KerbeBot will add a mod to the KerbeBot's mod list",
    ">removeMod": "`OWNER ONLY` KerbeBot will remove a mod from the KerbeBot's mod list",
    ">createGame": "`WIP` KerbeBot will create a game of the type specified.",
    ">join": "`WIP` KerbeBot will add you into the currently running game.",
}

const emojiHelp = [">thinkFall", ">thinkSpin", ">kerbeANGERY", ">kerbeDance", ">h"];

//Object with names of games as well as min number of players
const gameTypes = {
    "battleship": 2
}

//Members or bots blacklisted from using commands
const commandBlacklist = ["321097604131717120", "319643595852349440", "402014584317149184"];

//In order, stargazer, stickles, kk, liam, blaze
const mods = ["202997568886538241", "215507031375740928", "210202479164522496", "212690078881808394", "198942810571931649"];

//The current game being played by the bot
var currentGame = "";

//Indicates whether a game is going on or not
var gameStarted = false;

//Channel IDs for the game channels
const player1 = "402670595268935680";
const player2 = "402670620493611008";

//All of the member IDs of people playing the game
var gameMembers = [];


//Create an object that will be set to the json's data
var obj = require('./data.json');

var profileChangeCountDown = 900;
var leaderboardChangeCountDown = 300;

var images = {
    "hungry": "Profile pics/hungry.gif",
    "satanic": "Profile pics/satanic.png",
    "angry": "Profile pics/angerful.jpg",
    "disappointed": "Profile pics/disappointed.jpg",
    "oatmeal": "Profile pics/oatmeal.jpg",
    "painful": "Profile pics/pained.png",
    "angerful": "Profile pics/timetostop.png"
}

function random(min, max) {
	var w = max-min;
	return Math.random()*w+min;
}

//When a message is sent...
client.on("message", (message) => {
    
    try {
        
        //Take a message and parse it into an array of every word
        var msg = message.content.split(" ");
        //Command name will always be the first "word"
        var command = msg[0];
        
        //Indicates whether to disallow actions involving commands
        var disallow = false;
        
        var memberID = message.member.id;
        var guildID = message.guild.id;
        
        //Checks to see if the server is in the database and if not it adds an empty object to the json
        var serverIsInDatabase = false;
        
        for (var key in obj) {
            if (guildID == key) {
                serverIsInDatabase = true;
            }
        }
        
        var serverOwner = message.guild.ownerID;
        
        if (!serverIsInDatabase) {
            obj[guildID] = {"inactivity": 0, "leaderboardChannel": "undefined", "mutedRole": "undefined", "mods": [serverOwner], "users": {}};
        }
        
        //If a member is part of the blacklist disable them from using commands
        for (var i in commandBlacklist) {
            if (memberID == commandBlacklist[i]) {
                disallow = true;
            }
        }
        
        //Indicates whether the user should use mod commands
        var isMod = false;
        
        //Checks to see if the user is a mod
        for (var i in obj[guildID]["mods"]) {
            if (memberID == mods[i]) {
                isMod = true;
            }
        }
        
        var isOwner = false;
        if (memberID == message.guild.ownerID) {
            isOwner = true;
        }
        
        //If user is not blacklisted...
        if (!disallow) {
            
            //Checks to see if user is in the database and if not it adds an object to the servers object
            var userIsInDatabase = false;
            
            for (var key in obj[guildID]["users"]) {
                if (memberID == key) {
                    userIsInDatabase = true;
                }
            }
            
            if (!userIsInDatabase) {
                obj[guildID]["users"][memberID] = {exp: 0, wins: 0, losses: 0, cooldown: 0};
            }
            
            //Add a random amount of xp to the user
            if (obj[guildID]["users"][memberID]["cooldown"] < 1) {
                
                obj[guildID]["users"][memberID]["exp"] += Math.floor(Math.random()*3 + 3);
                obj[guildID]["users"][memberID]["cooldown"] = 60;
                
                if (-obj[guildID]["inactivity"] > 3600) {
                    console.log("Bonus EXP awarded to: "+memberID);
                    console.log("before bonus: "+obj[guildID]["users"][memberID]["exp"]);
                    obj[guildID]["users"][memberID]["exp"]+=20;
                    console.log("after bonus: "+obj[guildID]["users"][memberID]["exp"]);
                }
                
                //Resets inactivity counter
                obj[guildID]["inactivity"] = 0;
            }
            
            //Send the data back to the json
            fs.writeFileSync('data.json', JSON.stringify(obj, null, 2));
            
            //Test command I guess
            if (command == ">ping") {

                message.channel.send("you thought");
                message.channel.send("wahahahhaahaaaaaa");
                
            }
            //Echo every word they say
            else if (command == ">echo") {

                var finalMessage = "";

                for (var i = 1 ; i < msg.length ; i++) {
                    finalMessage += msg[i] + " ";
                }
		
                message.channel.send(finalMessage);

            }
            //Echo every word they say in DANCING EMOJI LETTER
            else if (command == ">echoDance") {

                var finalMessage = "";

                for (var i = 1 ; i < msg.length ; i++) {
                    var letters = msg[i].split('');
                    for (var w = 0; w < letters.length; w++) {
                        var letter = letters[w];
                        for (var s = 0; s < alphabet.length; s++) {
                            if (alphabet.indexOf(letter.toLowerCase()) == s ) {
                                letter = alphabetEmoji[s];
                                break;
                            }
                        } 
                        finalMessage += letter + " ";
                    }
                }

                message.channel.send(finalMessage);
            }
	       //Echo every word they say in DANCING EMOJI LETTER (and deletes OG message)
            else if (command == ">hiddenEchoDance") {

                var finalMessage = "";

                for (var i = 1 ; i < msg.length ; i++) {
                    var letters = msg[i].split('');
                    for (var w = 0; w < letters.length; w++) {
                        var letter = letters[w];
                        for (var s = 0; s < alphabet.length; s++) {
                            if (alphabet.indexOf(letter.toLowerCase()) == s ) {
                                letter = alphabetEmoji[s];
                                break;
                            }
                        } 
                        finalMessage += letter + " ";
                    }
                }

                message.channel.send(finalMessage);

                message.delete();
            }
            //Help command
            else if (command == ">help") {
                //The message that kerbebot will send
                var finalMessage = "**```MAIN COMMANDS```**\n";
                
                //Loop through the help object and for every command add it to the message
                for (var key in help) {
                    if (help.hasOwnProperty(key)) {
                        finalMessage += "`" + key + "` " + "- " + help[key] + "\n";
                    }
                }
                
                finalMessage += "\n **```EMOJI COMMANDS```**\n";
                
                for (var i in emojiHelp) {
                    finalMessage += "`" + emojiHelp[i] + "` "
                }
                
                finalMessage += "\n **```OTHER INFO```**\n`Github Repo` - https://github.com/Stargazer-KA/kerbebot\n`Discord Invite` - https://discord.gg/PWRNymR/ \n\n**Please note that Kerbebot is still in beta and is very unstable.**"
                
                //Send the message
                message.channel.send(finalMessage);
            }
            //Echo but it deletes message
            else if (command == ">hiddenEcho") {

                var finalMessage = "";

                for (var i = 1 ; i < msg.length ; i++) {
                    finalMessage += msg[i] + " ";
                }
                message.channel.send(finalMessage);

                message.delete();

            }
            //Creates a game of some type
            else if (command == ">createGame") {
                
                //If there is no current game running
                if (currentGame == "") {
                    
                    //If the game type specified is battleship
                    if (msg[1] == "battleship") {
                        
                        //Set currentGame to battlsehip
                        currentGame = msg[1];
                        
                        //Add memberId to game members
                        gameMembers.push(memberID);
                        
                        //Send message to channel
                        message.channel.send("Game of battleship initialized, waiting for another player!")
                        
                    }
                    else {
                        //If game name isn't any of the correct ones, send message
                        message.channel.send("Invalid game name!")
                    }
                    
                }
                //If there is a game running
                else {
                    message.channel.send("A game is already going on! Use `>join` to join the current game!");
                }
                
            }
            //Lets the user join a game
            else if (command == ">join") {
                
                //If there is no current game running
                if (currentGame == "") {
                    message.channel.send("No game is initialized! Use `>createGame` to create a new game!")
                }
                //If there is a game running
                else {
                    //Add member to the game members
                    gameMembers.push(memberID);
                    //Loop through the game types to access maximum number of players
                    for (var key in gameTypes) {
                        //Search for the correct game running
                        if (gameTypes.hasOwnProperty(key) && currentGame == key) {
                            //If the specified maximum is equal to the number of members...
                            if (gameTypes[key] == gameMembers.length) {
                                //Start the game
                                message.channel.send("Join succeeded! Game start!");
                                gameStarted = true;
                            }
                            //If specified maximum is not equal to number of members
                            else {
                                //Calculates the members needed to start the game
                                var membersNeeded = gameTypes[key] - gameMembers.length;
                                //If the game is full
                                if (membersNeeded <= 0) {
                                    message.channel.send("Game is already full!")
                                }
                                //If there are members left
                                else {
                                    message.channel.send("Join succeeded! Waiting for " + membersNeeded + " more member(s)");
                                }
                            }
                        }
                    }
                }
                
            }
            //Gets exp
            else if (command == ">getExp") {
                message.channel.send("Your exp: " + obj[guildID]["users"][memberID]["exp"]);
            }
            //Gets color
            else if (command == ">getColor") {
                if (message.member.highestRole.id == "322560405375549440" || message.member.highestRole.id == "322561688627052544" || message.member.highestRole.id == "322560477265788929" || message.member.highestRole.id == "322560960592216074" || message.member.highestRole.id == "322560304246685696" || message.member.highestRole.id == "322561573405327360") {
                    message.member.removeRole(message.member.highestRole.id);
                }
                switch(msg[1].toLowerCase()) {
                    case "red":
                        message.member.addRole("322560405375549440");
                        break;
                    case "orange":
                        message.member.addRole("322561688627052544");
                        break;
                    case "yellow":
                        message.member.addRole("322560477265788929");
                        break;
                    case "green":
                        message.member.addrole("322560960592216074");
                        break;
                    case "blue":
                        message.member.addRole("322560304246685696");
                        break;
                    case "purple":
                        message.member.addrole("322561573405327360");
                        break;
                }
                message.channel.send("Color role successfully added!");
            }
            else if (command == ">mods") {
                var finalMessage = "**```SERVER MODS```**\n\n";
                for (var i in obj[guildID]["mods"]) {
                    var nickname = message.guild.members.get(obj[guildID]["mods"][i]).displayName;
                    finalMessage+="`"+nickname+"`\n"
                }
                message.channel.send(finalMessage);
            }
            else if (command == ">giveExp") {
                var user = message.guild.members.get(msg[1]);
                if (user === undefined) {
                    message.channel.send("User is undefined!");
                } else {
                    var userIsInDatabase = false;
            
                    for (var key in obj[guildID]["users"]) {
                        if (msg[1] == key) {
                            userIsInDatabase = true;
                        }
                    }
                    
                    if (userIsInDatabase) {
                        var giversExp = obj[guildID]["users"][memberID]["exp"];
                        var expGiven = msg[2]*1;
                        
                        console.log(expGiven);
                        
                        if (expGiven > giversExp) {
                            message.channel.send("You cannot give away more exp than you own!");
                        }
                        else if (isNaN(expGiven)) {
                            message.channel.send("No amount specified or not a number!");
                        }
                        else {
                            obj[guildID]["users"][memberID]["exp"]-=expGiven;
                            obj[guildID]["users"][msg[1]]["exp"]+=expGiven;
                            message.channel.send("Transaction successful!");
                        }
                        
                    }
                    else {
                        message.channel.send("User is not in database as they have never talked on this server!");
                    }
                    
                }
            }
            //Useless emoji commands
            else if (command == ">thinkSpin") {
                message.channel.send("<a:test:402211306746282004>");
                message.delete();
            }
            else if (command == ">thinkFall") {
                message.channel.send("<a:rip:406855187676790787>");
                message.delete();
            }
            else if (command == ">kerbeANGERY") {
                message.channel.send("<:kerb:409122100201390111>");
                message.delete();
            }
            else if (command == ">kerbeDance") {
                message.channel.send("<a:kerbeDance:409790450799476737>");
                message.delete();
            }
            else if (command == ">h") {
                message.channel.send("<a:danceH:435191355787051008>");
                message.delete();
            }
        }
        
        /**MODERATOR COMMANDS**/
        if (isMod) {
            //Clear command
            if (command == ">clear") {
                message.channel.bulkDelete(msg[1]*1 + 1);
            }
            //Set exp channel command
            else if (command == ">setExpChannel") {
                var channel = message.guild.channels.get(msg[1]);
                if (channel === undefined) {
                    message.channel.send("Channel is undefined!")
                }
                else {
                    obj[guildID]["leaderboardChannel"] = msg[1];
                    message.channel.send("Channel successfully set!");
                }
            }
            else if (command == ">mute") {
                var mutedUser = message.guild.members.get(msg[1]);
                mutedUser.addRole("322843018094837760");
            }
        }
        
        if (isOwner) {
            if (command == ">addMod") {
                var user = message.guild.members.get(msg[1]);
                if (user === undefined) {
                    message.channel.send("User is undefined!");
                }
                else {
                    var userIsMod = false;
                    for (var i in obj[guildID]["mods"]) {
                        if (obj[guildID]["mods"][i] == msg[1]) {
                            userIsMod = true;
                        }
                    }
                    if (userIsMod) {
                        message.channel.send("User is already a mod!");
                    }
                    else {
                        obj[guildID]["mods"].push(msg[1]);
                        message.channel.send("User can now use mod commands!");
                    }
                }
            }
            else if (command == ">removeMod") {
                var user = message.guild.members.get(msg[1]);
                if (user === undefined) {
                    message.channel.send("User is undefined!");
                }
                else {
                    var userIsMod = false;
                    var index;
                    for (var i in obj[guildID]["mods"]) {
                        if (obj[guildID]["mods"][i] == msg[1]) {
                            userIsMod = true;
                            index = i;
                        }
                    }
                    if (userIsMod) {
                        obj[guildID]["mods"].splice(index, 1);
                        message.channel.send("User successfully removed!");
                    }
                    else {
                        message.channel.send("User is already unmodded!");
                    }
                }
            }
        }
    }
    //Failsafe
    catch(e) {
        console.log(e);
    }
});

//Login to the bot account
client.login(info.token);

//Every second...
setInterval(function() {
    //Loop through the object and subtract all cooldowns
    for (var serverID in obj) {
        //Lowers the inactivity counter
        obj[serverID]["inactivity"]--;
        for (var userID in obj[serverID]["users"]) {
            //Lowers exp cooldown
            if (obj[serverID]["users"][userID]["cooldown"] > -1) {
                obj[serverID]["users"][userID]["cooldown"] -= 1;
            }
        }
    }
    //Write data to the json
    fs.writeFileSync('data.json', JSON.stringify(obj, null, 2));
    
    //Count down to the profile picture change
    profileChangeCountDown--;
    leaderboardChangeCountDown--;
    
    //If its time to change the picture
    if (profileChangeCountDown == 0) {
        //Gets the names of all the images and stores them in an array
        var keys = Object.keys(images);
        
        //Rolls a dice and sets the avatar based off the number
        var avatarNum = Math.floor(random(0, keys.length));
        var avatar = keys[avatarNum];
        
        client.user.setActivity(avatar + " (type >help)", {type: "PLAYING"})
        client.user.setAvatar(images[avatar]);
        //Reset the timer
        profileChangeCountDown = 900;
    }
    
    if (leaderboardChangeCountDown == 0) {
        for (var serverID in obj) {
            updateLeaderboard(serverID);
        }
        leaderboardChangeCountDown = 300;
    }
    
}, 1000);

function updateLeaderboard(guildID) {
    
    //Create empty list of exp numbers and users
    var userList = [];
    
    //Loop through all the users in specified server and keep track of the number
    var num = 0;
    for (var userID in obj[guildID]["users"]) {
        //Add an object to the userList of the exp and userID
        userList[num] = {"exp": obj[guildID]["users"][userID]["exp"], "userID": userID};
        num++;
    }
    
    //List that will be parsed and posted to channel description
    //var finalList = [];
    
    //Variable to hold the maximum exp seen by the for loop
    var maxExp = userList[0]["exp"];
    //Selection sort algorithm
    for (var i = 0 ; i < userList.length ; i++) {
        var maxIndex = indexOfMax(userList, i);
        var temp = userList[i];
        userList[i] = userList[maxIndex];
        userList[maxIndex] = temp;
    }
    
    //Get the channel specified by the json for which channel to store the leaderboard in
    var channel = client.guilds.get(guildID).channels.get(obj[guildID]["leaderboardChannel"]);
    
    var channelDefined = true;
    
    if (channel === undefined) {
        channelDefined = false;
    }
    
    if (channelDefined) {
        //Parse the data and turn it into a string
        var finalString = "EXP LEADERBOARD:\n";
        //If the server has 5 or more users in its database
        if (Object.keys(obj[guildID]["users"]).length > 4) {
            //Loop through the top five users and add them to the leaderboard
            for (var i = 0 ; i < 5 ; i++) {

                var userObject = client.guilds.get(guildID).members.get(userList[i]["userID"])

                finalString+= i+1 + ". " + userObject.user.username + ": " + userList[i]["exp"] + " exp\n";
            }
        }
        //Less than 5 people stored in database
        else {
            //Loop through that many times
            for (var i = 0 ; i < Object.keys(obj[guildID]["users"]).length ; i++) {

                var userObject = client.guilds.get(guildID).members.get(userList[i]["userID"])

                finalString+= i+1 + ". " + userObject.user.username + ": " + userList[i]["exp"] + " exp\n";
            }
        }

        //Edit the channel with the final string
        channel.edit({"topic": finalString})
    }
    
}

//Finds the index of the maximum value
function indexOfMax(array, startIndex) {
    var maxValue = array[startIndex]["exp"];
    var maxIndex = startIndex;

    for(var i = maxIndex + 1; i < array.length; i++) {
        if(array[i]["exp"] > maxValue) {
            maxIndex = i;
            maxValue = array[i]["exp"];
        }
    } 
    return maxIndex;
}
