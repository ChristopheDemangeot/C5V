var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('dataentry', { title: 'Enter Data', entityName: 'User', entityNamePlural: 'Users', partialView: 'dataentry' });
});

module.exports = router;
