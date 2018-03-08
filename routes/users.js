var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('users', { title: 'Users Management', entityName: 'User', entityNamePlural: 'Users', partialView: 'users' });
});

module.exports = router;