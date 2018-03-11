var entityName = '';
var entityNamePlural = '';
var defaultScrollTime = 300;
var initialLoad = true;

function setEntityNames(name, namePlural) {
    entityName = name;
    entityNamePlural = namePlural;
}

function getApiUrl() {
    return '/api/' + entityNamePlural;
}

function sortObjectList() { 
    var selectedObjectID = '';
    $("#objectSelection option:selected" ).each(function() {
        selectedObjectID = $(this).attr('id');
    });

    var opts_list = $('#objectSelection').find('option');
    opts_list.sort(function(a, b) { return $(a).text() > $(b).text() ? 1 : -1; });
    $('#objectSelection').html('').append(opts_list);

    var selectedObjectPosition = 1;
    $.each($('#objectSelection option'), function(index, value) {
        if($(value).attr('id') == selectedObjectID) {
            selectedObjectPosition = index + 1;
        }
    });
    $('#objectSelection :nth-child(' + selectedObjectPosition + ')').prop('selected', true);
}

function populateDropDown(data) {
    var emptyOption = '<option id="0">No ' + entityName + ' Found!</option>';
    $('#deleteObject').hide();
    var fullHtml = '';

    var curObjectName = $('#newObjectName').val();
    var selectedObjectPosition = -1;

    $.each(data.objectList, function(index, value) {
        fullHtml += '<option id="' + value.objectID + '">' + value.objectName + '</option>';
        if(curObjectName == value.objectName) {
            selectedObjectPosition = index + 1;
        }
    });

    if(fullHtml.length > 0) {
        $('#objectSelection').html(fullHtml);
        if(selectedObjectPosition > 0){
            $('#objectSelection :nth-child(' + selectedObjectPosition + ')').prop('selected', true);
            sortObjectList();
        } else {
            sortObjectList();
            $('#objectSelection :nth-child(1)').prop('selected', true);
        }

        changeSelectedObject();
        $('#deleteObject').show();
    } else {
        $('#objectSelection').html(emptyOption);
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

    $(window).scrollTo($('#newObjectSection'), defaultScrollTime);
}

function cancelNewObject(e) {
    $('#newObjectSection').hide();
    $('#newObjectName').val('');
    $('#createNewObject').hide();
    $('#updateObject').hide();

    if(cancelNewObjectExt != undefined) cancelNewObjectExt(e);

    $(window).scrollTo($('#objectContainer'), defaultScrollTime);
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
        changeSelectedObject();
        $(window).scrollTo($('#newObjectSection'), defaultScrollTime);
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
        $(window).scrollTo($('#newObjectSection'), defaultScrollTime);
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
        $(window).scrollTo($('#objectContainer'), defaultScrollTime);
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
        if(!initialLoad){
            $(window).scrollTo($('#newObjectSection'), defaultScrollTime);
            initialLoad = false;
        } else {
            $(window).scrollTo($('#objectContainer'), defaultScrollTime);
            initialLoad = false;
        }
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