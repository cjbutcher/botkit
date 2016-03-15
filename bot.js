var charlie = require("./charlie.js");

if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('./lib/Botkit.js');
var os = require('os');

var controller = Botkit.slackbot({
    debug: true,
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();

controller.hears(['whoami'], 'direct_message,direct_mention,mention', function(bot, message) {
  charlie.get(bot, message, 'whoami')
});

controller.hears(['how much holiday have i used?'], 'direct_message', function(bot, message) {
  charlie.get(bot, message, 'leave_requests/days_used')
});

controller.hears(['who is off right now?'], 'direct_message', function(bot, message) {
  charlie.get(bot, message, 'leave_requests/away_now')
});

controller.hears(['sick today'], 'direct_message', function(bot,message) {
  charlie.bookSickDay(bot, message, 'sick_days/create')
});

controller.hears(['book time off'], 'direct_message', function(bot,message) {
  bot.startConversation(message, askStartDate)
});

askStartDate = function(response, convo) {

  convo.ask("Ok cool. What is the start date of this time off?", function(response, convo) {
    askDuration(response, convo);
    convo.next();
  }, 
  { key: 'start_date'});
}

askDuration = function(response, convo) {
  convo.ask("Great. Is this just for the 'morning', 'afternoon' or 'one day'? If longer, just tell me the end date.", function(response, convo) {
    askDetails(response, convo);
    convo.next();
  },
  { key: 'end_date'});
}

askDetails = function(response, convo) { 
  convo.ask("Would you like to include some details with this request? If so, type it here. Otherwise just say 'no'!", function(response, convo) {
    charlie.bookLeave(convo);
  },
  { key: 'details'});
}
