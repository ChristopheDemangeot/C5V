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
    $('#showStatistics').pleaseWait();
    $.ajax({
        url: "/api/test",
    }).done(function (data) {
        if(data.TestResult) {
            $('#testContract').css('background-color:green;');
            $('#testContract').val('OK!');
        } else {
            $('#testContract').css('background-color:red;');
            $('#testContract').val('ERROR!');
        }
    }).fail(function() {
        console.log('FAILED [GET]: /api/test');
    }).always(function () {
        $('#showStatistics').pleaseWait('stop');
        setTimeout(resetTestContractButton, 2000);
    });
}

$(function () {
    $('#bcDeployContract').click(deployContract);
    $('#testContract').click(testContract);
    initialisePageView();
    resetTestContractButton();
});