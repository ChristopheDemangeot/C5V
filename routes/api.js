var express = require('express');
var blockchain = require('../blockchain');
var router = express.Router();

router.get('/info', function (req, res, next) {
  console.log('REST[GET]: Enter /api/info');
  var infoResults = blockchain.GetInformation();
  res.json(infoResults);
  console.log('REST[GET]: Leave /api/info');
});
router.get('/deploy', function (req, res, next) {
  console.log('REST[GET]: Enter /api/deploy');
  var deployResults = blockchain.DeployContract();
  res.json(deployResults);
  console.log('REST[GET]: Leave /api/deploy');
});
router.get('/test', function (req, res, next) {
  console.log('REST[GET]: Enter /api/test');
  var testResults = blockchain.TestContract();
  res.json(testResults);
  console.log('REST[GET]: Leave /api/test');
});

/* TRIBES Management*/
router.get('/tribes', function (req, res, next) {
  console.log('REST[GET]: Enter /api/tribes');
  var listResults = blockchain.GetTribeList();
  res.json(listResults);
  console.log('REST[GET]: Leave /api/tribes');
});
router.get('/tribes/:tribeID', function (req, res, next)  {
  console.log('REST[GET]: Enter /api/tribes/' + req.params.tribeID);
  var result = blockchain.GetTribeByID(req.params.tribeID);
  res.json(result);
  console.log('REST[GET]: Leave /api/tribes/' + req.params.tribeID);
});
router.post('/tribes', function (req, res, next) {
  console.log('REST[POST]: Enter /api/tribes');
  listResults = blockchain.CreateNewTribe(req.body);
  res.json(listResults);
  console.log('REST[POST]: Leave /api/tribes');
});
router.put('/tribes/:tribeID', function (req, res, next) {
  console.log('REST[PUT]: Enter /api/tribes/' + req.params.tribeID);
  listResults = blockchain.UpdateTribe(req.body);
  res.json(listResults);
  console.log('REST[PUT]: Leave /api/tribes/' + req.params.tribeID);
});
router.delete('/tribes/:tribeID', function (req, res, next) {
  console.log('REST[DELETE]: Enter /api/tribes/' + req.params.tribeID);
  listResults = blockchain.DeleteTribe(req.params.tribeID);
  res.json(listResults);
  console.log('REST[DELETE]: Leave /api/tribes/' + req.params.tribeID);
});
module.exports = router;