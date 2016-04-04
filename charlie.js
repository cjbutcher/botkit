var request = require('request');
var accessToken = '741a4d49fae74febf12ef756c84b41ffdd51a0645fc88987ca95faea2a5f693d'

exports.get = function(bot, message, endpoint) {

	var url = compileUrl(message.user, endpoint)

  request(url, function(error, response, body) {

	  if (response.statusCode === 401) {
	  	bot.startPrivateConversation(message, function(err,convo) {
		    convo.ask("Hey! :simple_smile: It looks like you are trying to talk to me, but I can't be sure who you are yet. What is your Charliebot password?", function(message, convo) {
		    	authenticate(bot, message, convo);
		    	convo.stop();
		    });
		  });
	    return
	  }
	  
	  if (!error && response.statusCode == 200) {
	    bot.reply(message, formatText(body));
	  }

  });

}

exports.bookLeave = function(convo) {

	var slack_user_id = convo.responses.start_date.user

	var url = compileUrl(slack_user_id, 'leave_requests/create') +
																			'&start_date=' + convo.extractResponse('start_date') +
																			'&end_date=' + convo.extractResponse('end_date') +
																			'&details=' + convo.extractResponse('details')


	request.post(url, function (error, response, body) {
		convo.say(formatText(body));
		convo.next();
  });
}

exports.bookSickDay = function(bot, message, endpoint) {

	var url = compileUrl(message.user, endpoint)

  request.post(url, function (error, response, body) {
	  bot.reply(message, formatText(body));
	});

}

function compileUrl(slack_user_id, endpoint) {
	return 'https://www.charlie.com/api/v1/' + slack_user_id + '/' + endpoint + '?' + 	'access_token=' + accessToken
}

function formatText(body) {
	return JSON.parse(body).replace(/^"(.*)"$/, '$1');
}

function authenticate(bot, message) {
  bot.api.users.info({ 'user' : message.user }, function(err, res) {
    email = res.user.profile.email
    //email = 'chris@theeleven.co.uk'

    var url = compileUrl(message.user, 'authenticate') +
    										"&email=" + email + 
    										"&charliebot_password=" + message.text

    request.post(url, function (error, response, body) {
			bot.reply(message, formatText(body));
    });
  });
}

