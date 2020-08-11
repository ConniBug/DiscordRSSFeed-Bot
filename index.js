const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
const Parser = require('rss-parser');

var prefix = "-";
var guildID = "";
var channelID = "";


client.on("ready", async () => {   
    console.log(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);  
    
    client.user.setActivity("Rawr!");

});


var times  = [];
var obects = [];

const cron = require("node-cron");

cron.schedule('* * * * *', () => {
  let parser = new Parser();

  const path = require('path');
  const directoryPath = path.join(__dirname, './feeds/');
  fs.readdir(directoryPath, function (err, files) {
      if (err) return console.log('Unable to scan directory: ' + err);
      files.forEach(function (file) {

          let rawdata = fs.readFileSync(`./feeds/${file}`);
          let obj = JSON.parse(rawdata);

          var FEED_LIST = [
            obj[0]
          ];
          
          var title = obj[1];
          var date  = obj[2];

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
    
            

            if(obects.includes(obj[0]))
            {
              var tmp1 = times[obects.indexOf(obj[0])];

              if(KeyInfo[date] === tmp1)
              {
                return;
              }
              
            }
            else
            {
              obects.push(obj[0]);
              times.push(KeyInfo[date]);
            }

            obj.forEach(KeyTitle =>
              {
                Embed.addField(KeyTitle, "" + KeyInfo[KeyTitle] + "");
              });
            let guild2 = client.guilds.cache.find(c => c.id == guildID);

            let category2 = guild2.channels.cache.find(c => c.id == channelID);
            
            
            category2.send(Embed);
        
          });
      });
  });
});

client.on("message", async message => {
    if (message.author.bot) return;  

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    
    console.log(command);
    console.log(args);


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
        var Embed = new Discord.MessageEmbed();
        Embed.setTitle(`Removed - ${args[0]}`);
        message.reply(Embed);

        //file removed
      })
    }

    if(command === `ttt`)
    {
      let parser = new Parser();

      console.log("obects");
      console.log(obects);
      console.log("--------------------");
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
              // Debugging // console.log(recent);

              var Embed = new Discord.MessageEmbed();
              Embed.setTitle(`RSS - ${obj[1]}`);
              Embed.setColor("#00FF00");  

              obj.forEach(KeyTitle =>
                {
                  Embed.addField(KeyTitle, "" + "-" + KeyInfo[KeyTitle] + "-" + "");
                  console.log(KeyTitle);
                });
              
              Embed.setTimestamp();
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
