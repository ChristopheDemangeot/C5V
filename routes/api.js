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
router.get('/tribes/:objectID', function (req, res, next)  {
  console.log('REST[GET]: Enter /api/tribes/' + req.params.objectID);
  var result = blockchain.GetTribeByID(req.params.objectID);
  res.json(result);
  console.log('REST[GET]: Leave /api/tribes/' + req.params.objectID);
});
router.post('/tribes', function (req, res, next) {
  console.log('REST[POST]: Enter /api/tribes');
  listResults = blockchain.CreateNewTribe(req.body);
  res.json(listResults);
  console.log('REST[POST]: Leave /api/tribes');
});
router.put('/tribes/:objectID', function (req, res, next) {
  console.log('REST[PUT]: Enter /api/tribes/' + req.params.objectID);
  listResults = blockchain.UpdateTribe(req.body);
  res.json(listResults);
  console.log('REST[PUT]: Leave /api/tribes/' + req.params.objectID);
});
router.delete('/tribes/:objectID', function (req, res, next) {
  console.log('REST[DELETE]: Enter /api/tribes/' + req.params.objectID);
  listResults = blockchain.DeleteTribe(req.params.objectID);
  res.json(listResults);
  console.log('REST[DELETE]: Leave /api/tribes/' + req.params.objectID);
});

/* USERTYPES Management*/
router.get('/usertypes', function (req, res, next) {
  console.log('REST[GET]: Enter /api/usertypes');
  var listResults = blockchain.GetUserTypeList();
  res.json(listResults);
  console.log('REST[GET]: Leave /api/usertypes');
});
router.get('/usertypes/:objectID', function (req, res, next)  {
  console.log('REST[GET]: Enter /api/usertypes/' + req.params.objectID);
  var result = blockchain.GetUserTypeByID(req.params.objectID);
  res.json(result);
  console.log('REST[GET]: Leave /api/usertypes/' + req.params.objectID);
});

/* USERS Management*/
router.get('/users', function (req, res, next) {
  console.log('REST[GET]: Enter /api/users');
  var listResults = blockchain.GetUserList();
  res.json(listResults);
  console.log('REST[GET]: Leave /api/users');
});
router.get('/users/:objectID', function (req, res, next)  {
  console.log('REST[GET]: Enter /api/users/' + req.params.objectID);
  var result = blockchain.GetUserByID(req.params.objectID);
  res.json(result);
  console.log('REST[GET]: Leave /api/users/' + req.params.objectID);
});
router.post('/users', function (req, res, next) {
  console.log('REST[POST]: Enter /api/users');
  listResults = blockchain.CreateNewUser(req.body);
  res.json(listResults);
  console.log('REST[POST]: Leave /api/users');
});
router.put('/users/:objectID', function (req, res, next) {
  console.log('REST[PUT]: Enter /api/users/' + req.params.objectID);
  listResults = blockchain.UpdateUser(req.body);
  res.json(listResults);
  console.log('REST[PUT]: Leave /api/users/' + req.params.objectID);
});
router.delete('/users/:objectID', function (req, res, next) {
  console.log('REST[DELETE]: Enter /api/users/' + req.params.objectID);
  listResults = blockchain.DeleteUser(req.params.objectID);
  res.json(listResults);
  console.log('REST[DELETE]: Leave /api/users/' + req.params.objectID);
});

/* EAC (Environmental Accounting Collection) Management */
router.get('/eactypes', function (req, res, next) {
  console.log('REST[GET]: Enter /api/eactypes');
  var listResults = blockchain.GetEACTypeList();
  res.json(listResults);
  console.log('REST[GET]: Leave /api/eactypes');
});

/* Router export */
module.exports = router;