var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');
var path = require('path');
var moment = require('moment');
moment.locale('zh-TW');

// spreadsheet key is the long id in the sheets URL
var doc = new GoogleSpreadsheet(process.env.SPREADSHEET_KEY);
var sheet;
var types;

module.exports = DataSource;

function DataSource() {
  var worksheets;

  function getSheets(cb) {
    async.series([
      function setAuth(step) {
        var creds = JSON.parse(process.env.GOOGLE_DRIVE_JSON);
        doc.useServiceAccountAuth(creds, step);
      },
      function getInfoAndWorksheets(step) {
        doc.getInfo(function(err, info) {
          worksheets = info.worksheets;
          step(err);
        });
      }
    ], function(err, result) {
      cb(err);
    });
  }

  this.getTypes = function(cb) {
    if (types) {
      return cb(null, types);
    }

    async.waterfall([
      function init(step) {
        if (!worksheets) {
          getSheets(step);
        }
      },
      function getRows(step) {
        var sheet = worksheets[7];
        sheet.getRows({
          offset: 0,
          limit: 100,
          orderby: 'col1'
        }, step);
      },
      function normalize(rows, step) {
        types = rows.map(function(row) {
          return row.type;
        });
        step(null, types);
      }
    ], cb);
  };

  this.takeDayoff = function(ticket, cb) {
    async.series([
      function init(step) {
        if (!worksheets) {
          getSheets(step);
        }
        else {
          step();
        }
      },
      function appendRow(step) {
        var sheet = worksheets[0];
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
        row[headers['timestamp']] = moment().format('YYYY/MM/DD A h:mm:ss');
        row[headers['email']] = ticket.email;
        row[headers['type']] = ticket.type;
        row[headers['begin']] = ticket.begin;
        row[headers['days']] = ticket.days;

        sheet.addRow(row, step);
      }
    ], cb);
  };

  this.asking = function(email, cb) {
    async.waterfall([
      function init(step) {
        if (!worksheets) {
          getSheets(step);
        }
      },
      function getRows(step) {
        var sheet = worksheets[5];
        sheet.getRows({
          offset: 0,
          limit: 100,
          orderby: 'col1'
        }, step);
      },
      function find(rows, step) {
        for (var i = 0, l = rows.length; i < l; i++) {
          if (rows[i]['fixeddata'] === email) {
            var info = {
              annual: rows[i]['特休annual'],
              personal: rows[i]['事假personal'],
              sick: rows[i]['有薪病假sick'],
              flexibletimeoff: rows[i]['彈性休假flexibletimeoff']
            };
            return step(null, info);
          }
        }
        return step(null, null);
      }
    ], cb);
  };
}
