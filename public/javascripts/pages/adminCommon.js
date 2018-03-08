var entityName = '';
var entityNamePlural = '';

function setEntityNames(name, namePlural) {
    entityName = name;
    entityNamePlural = namePlural;
}

function getApiUrl() {
    return '/api/' + entityNamePlural;
}

function populateDropDown(data) {
    $('#objectSelection').html('<option id="0">No ' + entityName + ' Found!</option>');
    $('#deleteObject').hide();
    var fullHtml = '';
    var isFirst = true;
    $.each(data.objectList, function(index, value) {
        if(isFirst) {
            fullHtml += '<option id="' + value.objectID + '" selected>' + value.objectName + '</option>';
            isFirst = false;
        } else
            fullHtml += '<option id="' + value.objectID + '">' + value.objectName + '</option>';
    });
    if(fullHtml.length > 0) {
        $('#objectSelection').html(fullHtml);
        $('#objectSelection :nth-child(1)').prop('selected', true);
        changeSelectedObject();
        $('#deleteObject').show();
    }
    $('#transactionHash').val(data.transactionHash);
    $('#gasPrice').val(data.gasPrice);

    if(populateDropDownExt != undefined) populateDropDownExt(data);
}

function initialisePageData() {
    $('body').pleaseWait();
    var ajaxUrl = getApiUrl();
    $.ajax({
        url: ajaxUrl
    }).done(function (data) {
        populateDropDown(data);

        if(initialisePageDataExt != undefined)  initialisePageDataExt(data);

    }).fail(function() {
        console.log('FAILED [GET]: ' + ajaxUrl + ' failed!');
        $('#objectSelection').html('<option id="-1">ERROR</option>');
        $('#transactionHash').val('ERROR');
        $('#gasPrice').val('ERROR');   
    }).always(function () {
        $('body').pleaseWait('stop');
    });
}

function displayNewObject(e) {
    $('#newObjectSection').show();
    $('#newObjectName').val('');
    $('#createNewObject').show();
    $('#updateObject').hide();

    if(displayNewObjectExt != undefined) displayNewObjectExt(e);
}

function cancelNewObject(e) {
    $('#newObjectSection').hide();
    $('#newObjectName').val('');
    $('#createNewObject').hide();
    $('#updateObject').hide();

    if(cancelNewObjectExt != undefined) cancelNewObjectExt(e);
}

function createNewObject(e) {
    $('body').pleaseWait();
    var ajaxUrl = getApiUrl();
    var objData = { objectName: $('#newObjectName').val() };

    if(createNewObjectExt != undefined) objData = createNewObjectExt(objData);

    $.ajax({
        method: "POST",
        url: ajaxUrl,
        data: objData
    }).done(function (data) {
        populateDropDown(data);
        cancelNewObject(undefined);
        $('#objectSelection :nth-child(' + data.objectList.length + ')').prop('selected', true);
        changeSelectedObject();
    }).fail(function() {
        console.log('FAILED [POST]: ' + ajaxUrl + ' failed!');
        $('#transactionHash').val('ERROR');
        $('#gasPrice').val('ERROR');
    }).always(function () {
        $('body').pleaseWait('stop');
    });
}

function updateObject(e) {
    $('body').pleaseWait();
    var ajaxUrl = getApiUrl();
    var selectedObjectID = '';
    $( "#objectSelection option:selected" ).each(function() {
        selectedObjectID += $(this).attr('id');
    });
    ajaxUrl = ajaxUrl + '/' + selectedObjectID;

    var objData = {
        objectID: selectedObjectID,
        objectName: $('#newObjectName').val()
     };

     if(updateObjectExt != undefined) objData = updateObjectExt(objData);

    $.ajax({
        method: "PUT",
        url: ajaxUrl,
        data: objData
    }).done(function (data) {
        populateDropDown(data);
        cancelNewObject(undefined);
        changeSelectedObject();
    }).fail(function() {
        console.log('FAILED [PUT]: ' + ajaxUrl + ' failed!');
        $('#transactionHash').val('ERROR');
        $('#gasPrice').val('ERROR');
    }).always(function () {
        $('body').pleaseWait('stop');
    });
}

function deleteObject(e) {
    $('body').pleaseWait();
    var ajaxUrl = getApiUrl();
    var selectedObjectID = '';
    $( "#objectSelection option:selected" ).each(function() {
        selectedObjectID += $(this).attr('id');
    });
    ajaxUrl = ajaxUrl + '/' + selectedObjectID;
    $.ajax({
        method: "DELETE",
        url: ajaxUrl
    }).done(function (data) {
        populateDropDown(data);
        cancelNewObject(undefined);
        changeSelectedObject();
    }).fail(function() {
        console.log('FAILED [DELETE]: ' + ajaxUrl + ' failed!');
        $('#transactionHash').val('ERROR');
        $('#gasPrice').val('ERROR');
    }).always(function () {
        $('body').pleaseWait('stop');
    });
}

function changeSelectedObject() {
     $('body').pleaseWait();
    var ajaxUrl = getApiUrl();
    var selectedObjectID = '';
    $( "#objectSelection option:selected" ).each(function() {
        selectedObjectID += $(this).attr('id');
    });
    ajaxUrl = ajaxUrl + '/' + selectedObjectID;
    $.ajax({
         url: ajaxUrl
    }).done(function (data) {
        var selObject = data.objectList[0];
        if((selObject != undefined) && (selObject != null)) {
            $('#newObjectName').val(selObject.objectName);
            if(changeSelectedObjectExt != undefined) changeSelectedObjectExt(selObject);
        }
        $('#newObjectSection').show();
        $('#objectListSection').show();
        $('#createNewObject').hide();
        $('#updateObject').show();
    }).fail(function() {
        console.log('FAILED [GET]: ' + ajaxUrl + ' failed!');
        $('#transactionHash').val('ERROR');
        $('#gasPrice').val('ERROR');
    }).always(function () {
        $('body').pleaseWait('stop');
    });
}

$(function () {
    $('#newObjectSection').hide();
    $('#deleteObject').hide();
    $('#newObject').click(displayNewObject);
    $('#cancelCreateObject').click(cancelNewObject);
    $('#createNewObject').click(createNewObject);
    $('#objectSelection').change(changeSelectedObject)
    $('#deleteObject').click(deleteObject);
    $('#updateObject').click(updateObject);
    initialisePageData();
});