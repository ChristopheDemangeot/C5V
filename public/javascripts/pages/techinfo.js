function getBlockNumber() {
    $('#currentBlockDiv').pleaseWait();
    $.ajax({
        url: "/api/block",
    }).done(function (data) {
        if(data.BlockNumber != undefined)  {
            $('#currentBlock').text(data.BlockNumber);
        } else {
            $('#currentBlock').text('-1');

        }
    }).fail(function() {
        console.log('FAILED [GET]: /api/block');
    }).always(function () {
        $('#currentBlockDiv').pleaseWait('stop');
        setTimeout(getBlockNumber, 10000);
    });
}

function initialisePageView() {
    $('body').pleaseWait();
    $.ajax({
        url: "/api/info"
    }).done(function (data) {
        $('#bcLocation').val(data.BCUrl);
        if (data.BCIsRunning) {
            $('#onlineOK').show();
            $('#onlineNOK').hide();

            if (data.BCContractDeployed) {
                $('#deployContractRow').hide();
                $('#alreadyDeployedRow').show();
                $('#showStatistics').show();
                getBlockNumber();
            } else {
                $('#deployContractRow').show();
                $('#alreadyDeployedRow').hide();
                $('#showStatistics').hide();
            }
        } else {
            $('#onlineOK').hide();
            $('#onlineNOK').show();
            $('#showStatistics').hide();
            $('#deployContractRow').hide();
            $('#alreadyDeployedRow').hide();
        }
    }).fail(function() {
        console.log('FAILED [GET]: /api/info failed!');
    }).always(function () {
        $('body').pleaseWait('stop');
    });
}

function deployContract() {
    $('#deploySection').pleaseWait();
    $.ajax({
        url: "/api/deploy",
    }).done(function (data) {
        if (data.BCContractDeployed) {
            $('#deployContractRow').hide();
            $('#alreadyDeployedRow').show();
            $('#showStatistics').show();
            getBlockNumber();
        } else {
            $('#deployContractRow').show();
            $('#alreadyDeployedRow').hide();
            $('#showStatistics').hide();
        }
    }).fail(function() {
        console.log('FAILED [GET]: /api/deploy');
    }).always(function () {
        $('#deploySection').pleaseWait('stop');
    });
}

function resetTestContractButton() {
    $('#testContract').css('background-color:white;');
    $('#testContract').val('Click to test');
}

function testContract(){
    $('#testContractDiv').pleaseWait();
    $.ajax({
        url: "/api/test",
    }).done(function (data) {
        if(data.TestResult) {
            $('#testContract').css('color:green;');
            $('#testContract').val('OK!');
        } else {
            $('#testContract').css('color:red;');
            $('#testContract').val('ERROR!');
        }
    }).fail(function() {
        console.log('FAILED [GET]: /api/test');
    }).always(function () {
        $('#testContractDiv').pleaseWait('stop');
        setTimeout(resetTestContractButton, 2000);
    });
}

$(function () {
    $('#bcDeployContract').click(deployContract);
    $('#testContract').click(testContract);
    initialisePageView();
    resetTestContractButton();
});