const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
const Parser = require('rss-parser');
const cron = require("node-cron");
const path = require('path');
const sendMail = require("./Utils/mailer").sendMail;

require("dotenv").config();

const logging = require("./Utils/logging");

BOT = false;

// Vars
var GUIDs  = [];
var obects = [];

fs.readFile('sent.json', (err, data) => {
    if (err) throw err;
    let dat = JSON.parse(data);
    dat.guids.forEach(e => {
      GUIDs.push(e);
      console.log("Already sent guid:",e);
    });
});

console.log('This is after the read call');

cron.schedule('* * * * * *', () => {
  let parser = new Parser();

  try {
    const directoryPath = path.join(__dirname, './feeds/');
    fs.readdir(directoryPath, function (err, files) {
        if (err) return console.log('Unable to scan directory: ' + err);
        files.forEach(function (file) {
            let rawdata = fs.readFileSync(`./feeds/${file}`);
            let obj = JSON.parse(rawdata);

            var FEED_LIST = [
              obj.rssURL
            ];
            
            var titleKeyName = obj.titleKey;
            var date  = obj.publishDateKey;

            const feedRequests = FEED_LIST.map(feed => {
              return parser.parseURL(feed);
            });
      
            Promise.all(feedRequests).then(response => {
              var KeyInfo = response[0].items[0];
              //console.log("KeyInfo", KeyInfo);
              // if(times.includes(KeyInfo[date])) {
              //   return;
              // }

              // var Embed = new Discord.MessageEmbed()
              //     .setTitle(`RSS - ${KeyInfo[titleKeyName]}`)
              //     .setURL(obj[0])
              //     .setColor("#00FF00"); 

              var exists = false;
              GUIDs.forEach(e => {
                if(e == KeyInfo[obj.guid]) {
                  exists = true;
                };
              });
              if(exists) {
                //console.log("Already sent.");
                return;
              }
              
              GUIDs.push(KeyInfo[obj.guid]);

              fs.writeFileSync('sent.json', JSON.stringify({ "guids": GUIDs }));

              // if(obects.includes(obj.guid))
              // {
              //   if(KeyInfo[date] === GUIDs[obects.indexOf(obj.guid)]) 
              //     return;
              // }
              // else
              // {
              //   obects.push(obj.rssURL);
              //   times.push(KeyInfo[date]);
              // }

              var build = `Date: ${KeyInfo[date]}<br><br>`;

              console.log("Title:", `RSS - ${KeyInfo[titleKeyName]}`);

              // console.log("-------------------");
              // console.log("obj.otherKeys");
              // console.log(obj.otherKeys);
              // console.log("-------------------");
              // console.log("KeyInfo");
              // console.log(KeyInfo);

              obj.otherKeys.forEach(KeyTitle =>
              {
                console.log(KeyTitle, " - " + KeyInfo[KeyTitle] + "");

                build += `${KeyTitle}<br>${KeyInfo[KeyTitle]}<br><br>`;
                // Embed.addField(KeyTitle, " - " + KeyInfo[KeyTitle] + "");
              });

              console.log("SENDING:", build);
              sendMail(process.env.ADMIN_EMAIL  , build,`RSS - ${KeyInfo[titleKeyName]}`);
              sendMail(process.env.ADMIN_EMAIL_2, build,`RSS - ${KeyInfo[titleKeyName]}`);



              // let channel1 = client.guilds.cache.find(c => c.id == guildID).channels.cache.find(c => c.id == channelID)
              //   .send(Embed);     

            });
        });
    });
 
  } catch (error) {
    // console.error("ERROR", error);
    logging.log(error, "ERROR");
  }
});

if(BOT) {
  // Config
  var botStatus = "Rawr!~";
  var prefix = "-";
  var guildID = "";
  var channelID = "";

  client.on("ready", async () => {   
      console.log(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);  
      client.user.setActivity(botStatus);
  });
  
  client.on("message", async message => {
      if (message.author.bot) return;  
  
      const args = message.content.slice(prefix.length).trim().split(/ +/g);
      const command = args.shift().toLowerCase();
     
      if(command === `setup`)
      {
        let parser = new Parser();
  
        var FEED_LIST = [
          args[0]
        ];
       
        console.log(args[0]);
        const feedRequests = FEED_LIST.map(feed => {
          return parser.parseURL(feed);
        })
       
        Promise.all(feedRequests).then(response => {
          var recent = response[0].items[0];
          // Debugging // console.log(recent);
          var Embed = new Discord.MessageEmbed();
          Embed.setTitle("Keys");
          Embed.setColor("#00FF00");
  
          var i = 0;
          Object.keys(recent).forEach(t => {
            // Debugging // console.log(t);
  
            // 2 Varients of displaying the keys data
            // banForm.setDescription(banForm.description + ": " + recent[t] + "\n" + t)
            Embed.addField(t, "```" + recent[t] + "```");
            i++;
          });
          message.reply(Embed);
  
  
        })
      }
  
      if(command === `save`)
      {
        let p2 = args.slice(3);
        console.log(args);
        console.log(p2);
        
        var Embed = new Discord.MessageEmbed();
        Embed.setTitle(`Saved - ${args[1]}` || "Saved - RSS Feed");
        Embed.setDescription(args[0])
        Embed.setColor("#00FF00");  
  
        var j = "";
        p2.forEach(r => j = j + r + ",");
        j = j.substring(0, j.length - 1);
  
        Embed.addField("Keys", j);
  
        message.channel.send(Embed);
  
        require('fs').writeFile(
  
          `./feeds/${args[1]}.json`,
      
          JSON.stringify(args),
      
          function (err) {
              if (err) {
                  console.error(err);
              }
          }
        );
  
      }
  
      if(command === `onload`)
      {
        let parser = new Parser();
  
        const path = require('path');
        const directoryPath = path.join(__dirname, './feeds/');
        fs.readdir(directoryPath, function (err, files) {
            if (err) return console.log('Unable to scan directory: ' + err);
  
            files.forEach(function (file) {
                // Do whatever you want to do with the file
                console.log(file); 
  
  
                let rawdata = fs.readFileSync(`./feeds/${file}`);
                let obj = JSON.parse(rawdata);
  
                var FEED_LIST = [
                  obj[0]
                ];
                
                var title = obj[1];
                var date  = obj[2];
                
                if(obects.includes(obj[0]))
                {
                  if(times[obects.indexOf(obj[0])] != date)
                  {
                    console.log("-Not Same----------");
                    console.log(times[obects.indexOf(obj[0])]);
                    console.log(date);
                    console.log("-----------");
                  }
                  else
                  {
                    console.log("-Same----------");
                    console.log(times[obects.indexOf(obj[0])]);
                    console.log(date);
                    console.log("-----------");
                    return;
                  }
                  
                }
                else
                {
                  obects.push(obj[0]);
                  times.push(date);
  
                }
  
                obj = obj.splice(3);
          
  
                const feedRequests = FEED_LIST.map(feed => {
                  return parser.parseURL(feed);
                });
          
                Promise.all(feedRequests).then(response => {
                  var KeyInfo = response[0].items[0];
                  // Debugging // console.log(recent);
          
                  var Embed = new Discord.MessageEmbed();
                  Embed.setTitle(`RSS - ${title}`);
                  Embed.setColor("#00FF00");  
          
                  obj.forEach(KeyTitle =>
                    {
                      Embed.addField(KeyTitle, "" + "-" + KeyInfo[KeyTitle] + "-" + "");
                      // Debugging // console.log(KeyTitle);
          
                    
                    });
                  
                  Embed.setTimestamp();
                  message.reply(Embed);
          
                });
            });
        });
      }
  
      if(command === `remove`)
      {
        const path = `./feeds/${args[0]}.json`
  
        fs.unlink(path, (err) => {
          if (err) {
            console.error(err)
            return
          }              
          var Embed = new Discord.MessageEmbed()
              .setTitle(`Removed - ${args[0]}`);
          message.reply(Embed);
  
          //file removed
        })
      }
  
      if(command === `ttt`)
      {
        let parser = new Parser();
  
        obects.forEach(obj =>
          {
  
            console.log(obj);
  
            var FEED_LIST = [
              obj[0]
            ];
  
            obj = obj.splice(3);
  
  
            const feedRequests = FEED_LIST.map(feed => {
              return parser.parseURL(feed);
            });
  
            Promise.all(feedRequests).then(response => {
                var KeyInfo = response[0].items[0];
  
                var Embed = new Discord.MessageEmbed()
                  .setTitle(`RSS - ${obj[1]}`)
                  .setColor("#00FF00")
                  .setTimestamp();
  
                obj.forEach(KeyTitle =>
                  {
                    Embed.addField(KeyTitle, "" + "-" + KeyInfo[KeyTitle] + "-" + "");
                    console.log(KeyTitle);
                  });
                
                message.reply(Embed);
              }
            )
        })
      }
  
  });
  
  client.on("error", (e) => console.error(e));
  client.on("warn", (e) => console.warn(e));
  client.on("debug", (e) => console.info(e));
  
  client.login("Bot id here!!!!");
}
