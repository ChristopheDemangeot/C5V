function initialisePageView() {
    $('body').pleaseWait();
    $.ajax({
        url: "/api/info"
    }).done(function (data) {
        $('#bcLocation').val(data.BCUrl);
        if (data.BCIsRunning) {
            $('#onlineOK').show();
            $('#onlineNOK').hide();
            $('#showStatistics').show();
            if (data.BCContractDeployed) {
                $('#deployContractRow').hide();
                $('#alreadyDeployedRow').show();
                $('#testContract').prop('disabled', false);
            } else {
                $('#deployContractRow').show();
                $('#alreadyDeployedRow').hide();
                $('#testContract').prop('disabled', true);
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
    $('body').pleaseWait();
    $.ajax({
        url: "/api/deploy",
    }).done(function (data) {
        if (data.BCContractDeployed) {
            $('#deployContractRow').hide();
            $('#alreadyDeployedRow').show();
        } else {
            $('#deployContractRow').show();
            $('#alreadyDeployedRow').hide();
        }
    }).fail(function() {
        console.log('FAILED [GET]: /api/deploy');
    }).always(function () {
        $('body').pleaseWait('stop');
    });
}

function testContract(){
    $('body').pleaseWait();
    $.ajax({
        url: "/api/test",
    }).done(function (data) {
        alert(data.TestResult);
    }).fail(function() {
        console.log('FAILED [GET]: /api/test');
    }).always(function () {
        $('body').pleaseWait('stop');
    });
}

$(function () {
    $('#bcDeployContract').click(deployContract);
    $('#testContract').prop('disabled', true);
    $('#testContract').click(testContract);
    initialisePageView();
});