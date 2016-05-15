var moment = require('moment');
moment.locale('zh-TW');

module.exports = function(robot) {
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

      robot.brain.set(username, ticket);
      res.reply('你想要請 ' + date.format('YYYY MMMM Do (dddd)') + ' 嗎？是什麼假呢？');
    }
    else {
      res.reply('無法辨識你請假的日期喔⋯')
    }
  }

  function second(res, ticket) {
    var username = res.envelope.user.name;

    ticket.type = res.match[1];
    ticket.state = 'getting approval'
    robot.brain.set(username, ticket);
    res.reply('好的，請假已經完成囉。已經幫你告知主管（還沒實作）');
  }

  robot.respond(/(.+)/, function(res) {
    var username = res.envelope.user.name;
    var ticket = robot.brain.get(username);
    var match = res.message.text.match(/(.+)請假/);

    if (match) {
      first(res, match)
    }
    else if (ticket && ticket.state === 'asking type') {
      second(res, ticket);
    }
  });
}
