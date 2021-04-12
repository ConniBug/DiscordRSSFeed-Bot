require("colors");
const sendMail = require("./mailer").sendMail;

logLevel = "LEGITALL";
function getLogLevelNum(level) {
  if (level == "TESTING") return 0;
  if (level == "GENERIC") return 1;
  if (level == "ERROR") return 2;
  if (level == "DEBUG") return 3;
  if (level == "ALL") return 4;

  // Debugging stuff.
  if (level == "TIMINGS") return 5;

  if (level == "LEGITALL") return 100;

  log("Unsure what log level " + level.red + " belongs to.", "GENERIC");
  return 4;
}
exports.getLogLevelNum = (level) => {
  return getLogLevelNum(level);
};
async function log(message, type = "DEBUG") {
  if (getLogLevelNum(type) > getLogLevelNum(logLevel)) {
    return;
  }

  maxSize = 45;

  time = getDateTime().yellow;

  StartMessage = "";
  if (type == "ERROR") {
    StartMessage = `[${time}] - [` + type.red + `]`;
    var build = `
    Time: ${getDateTime()}
    <br>
    <br>
    <div>
    ${message}
    </div>
    `;
    sendMail(process.env.ADMIN_EMAIL, build,"RSSFeed-Bot - Server Error");
    if(process.env.ADMIN_EMAIL_2) {
        sendMail(process.env.ADMIN_EMAIL_2, build,"RSSFeed-Bot - Server Error");
    }
  } else if (type == "GENERIC")
    StartMessage = `[${time}] - [` + type.green + `]`;
  else if (type == "DEBUG") StartMessage = `[${time}] - [` + type.gray + `]`;
  else if (type == "TESTING")
    StartMessage = `[${time}] - [` + type.magenta + `]`;
  else StartMessage = `[${time}] - [` + type.blue + `]`;

  left = maxSize - StartMessage.length;
  function balence() {
    tmp = "";
    space = " ";
    while (left >= 0) {
      left = left - 1;
      tmp = tmp + space;
    }
    return tmp;
  }
  console.log(StartMessage + balence() + "-> " + message);
}
exports.log = async (message, type = "DEBUG") => {
  log(message, type);
};
function char_count(str, letter) {
  var letter_Count = 0;
  for (var position = 0; position < str.length; position++) {
    if (str.charAt(position) == letter) {
      letter_Count += 1;
    }
  }
  return letter_Count;
}
exports.char_count = (str, letter) => {
  return char_count(str, letter);
};
function getDateTime() {
  var date = new Date();

  var hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;

  var min = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;

  var sec = date.getSeconds();
  sec = (sec < 10 ? "0" : "") + sec;

  var year = date.getFullYear();

  var month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;

  var day = date.getDate();
  day = (day < 10 ? "0" : "") + day;

  return year + ":" + month + ":" + day + " - " + hour + ":" + min + ":" + sec;
}
exports.getDateTime = () => {
  return getDateTime();
};
