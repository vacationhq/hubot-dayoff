var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');
var path = require('path');
var moment = require('moment');
moment.locale('zh-TW');

// spreadsheet key is the long id in the sheets URL
var doc = new GoogleSpreadsheet(process.env.SPREADSHEET_KEY);
var sheet;

module.exports = function(ticket, cb) {
  async.series([
    function setAuth(step) {
      var creds = JSON.parse(process.env.GOOGLE_DRIVE_JSON);
      doc.useServiceAccountAuth(creds, step);
    },
    function getInfoAndWorksheets(step) {
      doc.getInfo(function(err, info) {
        sheet = info.worksheets[0];
        step();
      });
    },
    function appendRow(step) {
      var headers = {
        'timestamp': '時間戳記',
        'email': '你的 Email',
        'type': '假別 Vacation Type',
        'begin': '開始日期 Multi-date: Begin Date',
        'days': '請假天數 How many days'
      };

      Object.keys(headers).forEach(function(key) {
        headers[key] = headers[key].replace(/[\s:]/g, '').toLowerCase();
      });

      var row = {};
      row[headers['timestamp']] = moment().format('YYYY/MM/DD A h:mm:ss')
      row[headers['email']] = ticket.email;
      row[headers['type']] = ticket.type;
      row[headers['begin']] = ticket.begin;
      row[headers['days']] = ticket.days;

      sheet.addRow(row, step)
    }
  ], cb);
}
