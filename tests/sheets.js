var test = require('tape')
var level = require('level')
var each = require('each-async')
var JSONStream = require('JSONStream')

var db = level(__dirname + '/../tmp/sheets', { valueEncoding: 'json' })
var sheets = require('../models/sheets')(db)

test('create sheets', function (t) {
  var data = require('./data/sample.js')
  each(data, iterator, end)

  function iterator (sheet, i, done) {
    sheets.create(sheet, function (err, sheet) {
      t.notOk(err)
      t.ok(sheet)
      done()
    })
  }

  function end () {
    t.end()
  }
})

test('get list of sheets', function (t) {
  sheets.list(function (err, list) {
    t.notOk(err)
    t.ok(list)
    t.end()
  })
})

test('get sheets by owners index', function (t) {
  sheets.list({filter: {owners: 'pizzamaker'}}, function (err, list) {
    t.notOk(err)
    t.ok(list)
    t.equal(1, list.length)
    t.end()
  })
})

test('get sheets by editors index', function (t) {
  sheets.list({filter: {editors: 'eater'}}, function (err, list) {
    t.notOk(err)
    t.ok(list)
    t.equal(list.length, 4)
    t.end()
  })
})

test('get sheets by categories index', function (t) {
  sheets.list({filter: {categories: 'drink'}}, function (err, list) {
    t.notOk(err)
    t.ok(list)
    t.equal(list.length, 1)
    t.end()
  })
})

test('get sheets by project index', function (t) {
  sheets.list({filter: {project: 'awesome'}}, function (err, list) {
    t.notOk(err)
    t.ok(list)
    t.equal(list.length, 3)
    t.end()
  })
})

test('get sheets by private index', function (t) {
  sheets.list({filter: {private: true}}, function (err, list) {
    t.notOk(err)
    t.ok(list)
    t.equal(list.length, 4)
    t.end()
  })
})

test('get sheets by accessible index', function (t) {
  sheets.list({filter: {accessible: 'pizzamaker'}}, function (err, list) {
    t.notOk(err)
    t.ok(list)
    t.equal(list.length, 2)
    t.end()
  })
})

test('sheet.dat can store data', function (t) {
  sheets.list(function (err, list) {
    sheets.get(list[0].key, function (err, sheet) {
      sheet.dat.put('hello', { message: 'world' }, function (err) {
        t.notOk(err)
        sheet.dat.get('hello', function (err, row) {
          t.notOk(err)
          t.equal(row.value.message, 'world')
          t.end();
        })
      })
    })
  })
})

test('sheet.createReadStream', function (t) {
  sheets.list(function (err, list) {
    sheets.get(list[0].key, function (err, sheet) {
      sheet.createReadStream({ keys: false, values: true }).pipe(JSONStream.parse())
        .on('data', function (data) {
          console.log(data)
        })
        .on('end', function () {
          t.end()
        })
    })
  })
})

test('teardown', function (t) {
  sheets.list(function (err, list) {
    t.notOk(err)
    t.ok(list)

    function iterator (sheet, i, next) {
      sheets.destroy(sheet.key, function (err) {
        t.notOk(err)
        next()
      })
    }

    function end () {
      t.end()
    }

    each(list, iterator, end)
  })
})