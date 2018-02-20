var express = require('express');
var blockchain = require('../blockchain');
var router = express.Router();

router.get('/info', function (req, res, next) {
  var info = blockchain.GetInformation();
  res.json(info);
});
router.get('/deploy', function (req, res, next) {
  var deployResults = blockchain.DeployContracts();
  res.json(deployResults);
});

module.exports = router;