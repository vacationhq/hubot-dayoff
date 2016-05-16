var DataSource = require('../libs/datasource');
var moment = require('moment');
moment.locale('zh-TW');

module.exports = function(robot) {
  var types;
  var source = new DataSource();

  function first(res, match) {
    var date = moment(match[1], 'YYYY/MM/DD');
    if (date.isValid()) {
      var username = res.envelope.user.name;
      var ticket = {
        slackUsername: res.envelope.user.name,
        email: res.envelope.user.email_address,
        date: date,
        state: 'asking type'
      };

      source.getTypes(function(err, ts) {
        types = ts;
        var message = '你想要請 ' + date.format('YYYY MMMM Do (dddd)') +
                      ' 嗎？是什麼假呢？（輸入編號如 1, 2, 3 等）\n';
        message += types.map(function(type, i) {
          return (i+1) + '. ' + type;
        }).join('\n');
        robot.brain.set(username, ticket);
        res.reply(message);
      });


    }
    else {
      res.reply('無法辨識你請假的日期喔⋯');
    }
  }

  function second(res, ticket) {
    var username = res.envelope.user.name;
    var index = parseInt(res.match[1]);

    ticket.type = types[index-1];
    ticket.state = 'getting approval';
    ticket.begin = ticket.date.format('YYYY/MM/DD');
    ticket.days = '1';
    source.takeDayoff(ticket, function(err) {
      if (err) {
        res.reply('出錯囉 ' + err);
        return console.error(err);
      }
      robot.brain.remove(username);
      res.reply('好的，請假已經完成囉。已經幫你填到 Google spreadsheet 囉');
    });
  }

  robot.respond(/(.+)/, function(res) {
    var username = res.envelope.user.name;
    var ticket = robot.brain.get(username);
    var match = res.message.text.match(/(.+)請假/);

    if (match) {
      first(res, match);
    }
    else if (ticket && ticket.state === 'asking type') {
      second(res, ticket);
    }
  });
};
