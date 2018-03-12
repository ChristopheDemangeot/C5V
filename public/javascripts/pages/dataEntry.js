function getUserTypeByID(userTypeID) {
    var result = 'Data NOT found!';
    var ajaxUrl = '/api/UserTypes/' + userTypeID;
    $.ajax({
        url: ajaxUrl
    }).done(function (data) {
        var selObject = data.objectList[0];
        if((selObject != undefined) && (selObject != null)) {
            result = selObject.objectName;
        }
    }).fail(function() {
        console.log('FAILED [GET]: ' + ajaxUrl + ' failed!');
    }).always(function () {
        $('#userType').val(result);
        return result;
    });
}

function getTribeByID(tribeID) {
    var result = 'Data NOT found!';
    var ajaxUrl = '/api/Tribes/' + tribeID;
    $.ajax({
        url: ajaxUrl
    }).done(function (data) {
        var selObject = data.objectList[0];
        if((selObject != undefined) && (selObject != null)) {
            result = selObject.objectName;
        }
    }).fail(function() {
        console.log('FAILED [GET]: ' + ajaxUrl + ' failed!');
    }).always(function () {
        $('#userTribe').val(result);
        return result;
    });
}

function populateDropDownExt(data) {
}

function initialisePageDataExt(data) {
    $('#objectContainer span').removeClass('fa-users').addClass('fa-database');
    $('#objectContainer h2').text('Data Entry Management');
    $('#objectContainer p').text('Please enter the data associated to a Tribe');
    $('#actionTopRow').hide();
    $('#actionBottomRow').hide();
    $('#objectNameRow').hide();

    var newButtonHTML = '<div class="12u"><ul class="buttons"><li><input type="button" class="special pull-right" value="Submit Data" /></li></ul></div>';
    $('#actionBottomRow').html(newButtonHTML);
    $('#actionBottomRow').show();
}

function displayNewObjectExt(e) {
}

function cancelNewObjectExt(e) {
}

function createNewObjectExt(data) {
    return data;
}

function updateObjectExt(data) {
    return data;
}

function changeSelectedObjectExt(data) {
    getUserTypeByID(data.userTypeID);
    getTribeByID(data.tribeID);
}