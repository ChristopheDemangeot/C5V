var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('tribes', { title: 'Tribes Management', bodyStyle: 'contact' });
});

module.exports = router;
