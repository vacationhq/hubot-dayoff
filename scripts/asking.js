var DataSource = require('../libs/datasource');

module.exports = function(robot) {
  robot.respond(/.*剩.+假.*/, function(res) {
    res.reply('等等，我找一下⋯⋯');

    var source = new DataSource();
    var email = res.envelope.user.email_address;
    source.asking(email, function(err, info) {
      if (err) {
        throw err;
      }

      if (!info) {
        return res.reply('找不到捏');
      }
      else {
        var message = '你還有' +
                      ' 特休 ' + info.annual +
                      ' 事假 ' + info.personal +
                      ' 有薪病假 ' + info.sick +
                      ' 彈性休假 ' + info.flexibletimeoff +
                      '，快休完他們！';
        return res.reply(message);
      }
    });
  });
};
