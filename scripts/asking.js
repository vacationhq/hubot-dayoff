var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');

// spreadsheet key is the long id in the sheets URL
var doc = new GoogleSpreadsheet(process.env.SPREADSHEET_KEY);
var sheet;

module.exports = function(robot) {

    robot.respond(/.*剩.+假.*/, function(res) {

        res.reply('等等，我找一下⋯⋯');

        async.series([
            function setAuth(step) {
              var creds = JSON.parse(process.env.GOOGLE_DRIVE_JSON);
              doc.useServiceAccountAuth(creds, step);
            },
            function getInfoAndWorksheets(step) {
              doc.getInfo(function(err, info) {
                sheet = info.worksheets[5];
                step();
              });
            },
            function appendRow(step) {
                sheet.getRows({
                    offset: 0,
                    limit: 100,
                    orderby: 'col1'
                }, function(err, rows) {

                    var userEmail = res.envelope.user.email_address;
                    for (var i = 0, l = rows.length; i < l; i++) {
                        if (rows[i]['fixeddata'] === userEmail) {
                            res.reply(
                                '你還有'+
                                ' 特休 '+rows[i]['特休annual']+
                                ' 事假 '+rows[i]['事假personal']+
                                ' 有薪病假 '+rows[i]['有薪病假sick']+
                                ' 彈性休假 '+rows[i]['彈性休假flexibletimeoff']+
                                '，快休完他們！'
                             );
                            return;
                        }
                    }

                    res.reply('找不到捏');
                    return;

                });
            }
        ]);

    });

}
