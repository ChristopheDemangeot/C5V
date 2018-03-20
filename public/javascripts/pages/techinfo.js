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
    $('body').pleaseWait();
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