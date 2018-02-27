function populateDroptDown(data) {
    $('#tribeSelection').html('<option id="0">No Tribes Found!</option>');
    $('#deleteTribe').hide();
    var fullHtml = '';
    var isFirst = true;
    $.each(data.tribeList, function(index, value) {
        if(isFirst) {
            fullHtml += '<option id="' + value.tribeID + '" selected>' + value.tribeName + '</option>';
            isFirst = false;
        } else
            fullHtml += '<option id="' + value.tribeID + '">' + value.tribeName + '</option>';
    });
    if(fullHtml.length >0){
        $('#tribeSelection').html(fullHtml);
        $('#tribeSelection :nth-child(1)').prop('selected', true);
        changeSelectedTribe();
        $('#deleteTribe').show();
    }
    $('#transactionHash').val(data.transactionHash);
    $('#gasPrice').val(data.gasPrice);      
}

function initialisePageData() {
    $('body').pleaseWait();
    $.ajax({
        url: "/api/tribes"
    }).done(function (data) {
        populateDroptDown(data);
    }).fail(function() {
        console.log('FAILED [GET]: /api/tribes failed!');
        $('#tribeSelection').html('<option id="-1">ERROR</option>');
        $('#transactionHash').val('ERROR');
        $('#gasPrice').val('ERROR');   
    }).always(function () {
        $('body').pleaseWait('stop');
    });
}

function displayNewTribe(e) {
    $('#newTribeSection').show();
    $('#newTribeName').val('');
    $('#newTribeLocation').val('');
    $('#newTribePopulation').val('');
    $('#newTribeArea').val('');
    $('#createNewTribe').show();
    $('#updateTribe').hide();
}

function cancelNewTribe(e) {
    $('#newTribeSection').hide();
    $('#newTribeName').val('');
    $('#newTribeLocation').val('');
    $('#newTribePopulation').val('');
    $('#newTribeArea').val('');
    $('#createNewTribe').hide();
    $('#updateTribe').hide();
}

function createNewTribe(e) {
    $('body').pleaseWait();
    $.ajax({
        method: "POST",
        url: "/api/tribes",
        data: {
            tribeName: $('#newTribeName').val(),
            tribeLocation: $('#newTribeLocation').val(),
            tribePopulation: $('#newTribePopulation').val(),
            tribeArea: $('#newTribeArea').val(),
         }
    }).done(function (data) {
        populateDroptDown(data);
        cancelNewTribe(undefined);
        $('#tribeSelection :nth-child(' + data.tribeList.length + ')').prop('selected', true);
        changeSelectedTribe();
    }).fail(function() {
        console.log('FAILED [POST]: /api/tribes failed!');
        $('#transactionHash').val('ERROR');
        $('#gasPrice').val('ERROR');
    }).always(function () {
        $('body').pleaseWait('stop');
    });
}

function updateTribe(e) {
    $('body').pleaseWait();
    var selectedTribeID = '';
    $( "#tribeSelection option:selected" ).each(function() {
        selectedTribeID += $(this).attr('id');
    });
    $.ajax({
        method: "PUT",
        url: "/api/tribes/" + selectedTribeID,
        data: {
            tribeID: selectedTribeID,
            tribeName: $('#newTribeName').val(),
            tribeLocation: $('#newTribeLocation').val(),
            tribePopulation: $('#newTribePopulation').val(),
            tribeArea: $('#newTribeArea').val(),
         }
    }).done(function (data) {
        populateDroptDown(data);
        cancelNewTribe(undefined);
        changeSelectedTribe();
    }).fail(function() {
        console.log('FAILED [PUT]: /api/tribes/' + selectedTribeID + ' failed!');
        $('#transactionHash').val('ERROR');
        $('#gasPrice').val('ERROR');
    }).always(function () {
        $('body').pleaseWait('stop');
    });
}

function deleteTribe(e) {
    $('body').pleaseWait();
    var selectedTribeID = '';
    $( "#tribeSelection option:selected" ).each(function() {
        selectedTribeID += $(this).attr('id');
    });
    $.ajax({
        method: "DELETE",
        url: "/api/tribes/" + selectedTribeID
    }).done(function (data) {
        populateDroptDown(data);
        cancelNewTribe(undefined);
        changeSelectedTribe();
    }).fail(function() {
        console.log('FAILED [DELETE]: /api/tribes/' + selectedTribeID + ' failed!');
        $('#transactionHash').val('ERROR');
        $('#gasPrice').val('ERROR');
    }).always(function () {
        $('body').pleaseWait('stop');
    });
}

function changeSelectedTribe() {
    $('body').pleaseWait();
    var selectedTribeID = '';
    $( "#tribeSelection option:selected" ).each(function() {
        selectedTribeID += $(this).attr('id');
    });
    $.ajax({
         url: "/api/tribes/" + selectedTribeID,
    }).done(function (data) {
        $('#newTribeName').val(data.tribeList[0].tribeName);
        $('#newTribeLocation').val(data.tribeList[0].tribeLocation);
        $('#newTribePopulation').val(data.tribeList[0].tribePopulation);
        $('#newTribeArea').val(data.tribeList[0].tribeArea);
        $('#newTribeSection').show();
        $('#tribeListSection').show();
        $('#createNewTribe').hide();
        $('#updateTribe').show();
    }).fail(function() {
        console.log('FAILED [POST]: /api/tribes/' + selectedTribeID + ' failed!');
        $('#transactionHash').val('ERROR');
        $('#gasPrice').val('ERROR');
    }).always(function () {
        $('body').pleaseWait('stop');
    });
}

$(function () {
    $('#newTribeSection').hide();
    $('#deleteTribe').hide();
    $('#newTribe').click(displayNewTribe);
    $('#cancelCreateTribe').click(cancelNewTribe);
    $('#createNewTribe').click(createNewTribe);
    $('#tribeSelection').change(changeSelectedTribe)
    $('#deleteTribe').click(deleteTribe);
    $('#updateTribe').click(updateTribe);
    initialisePageData();
});