var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('techinfo', {
    title: 'Technical Information',
    bodyStyle: 'index'
  });
});

module.exports = router;