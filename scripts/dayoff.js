module.exports = function(robot) {
  robot.respond(/(.+)請假/, function(res) {
    res.reply(res.match[1]);
  });
}
