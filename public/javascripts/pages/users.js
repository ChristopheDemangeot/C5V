function getUserTypeList() {
    var ajaxUrl = '/api/UserTypes';
    $.ajax({
        url: ajaxUrl
    }).done(function (data) {
        var emptyOption = '<option id="0">No User Roles Found!</option>';
        var fullHtml = '';
    
        $.each(data.objectList, function(index, value) {
            fullHtml += '<option id="' + value.objectID + '">' + value.objectName + '</option>';
        });
    
        if(fullHtml.length > 0) {
            $('#newUserRole').html(fullHtml);
        } else {
            $('#newUserRole').html(emptyOption);
        }
    }).fail(function() {
        console.log('FAILED [GET]: ' + ajaxUrl + ' failed!');
        $('#newUserRole').html('<option id="-1">ERROR</option>');
    }).always(function () {
    });
}

function getTribeList() {
    var ajaxUrl = '/api/Tribes';
    $.ajax({
        url: ajaxUrl
    }).done(function (data) {
        var emptyOption = '<option id="0">No Tribes Found!</option>';
        var fullHtml = '';
    
        $.each(data.objectList, function(index, value) {
            fullHtml += '<option id="' + value.objectID + '">' + value.objectName + '</option>';
        });
    
        if(fullHtml.length > 0) {
            $('#newUserTribe').html(fullHtml);
        } else {
            $('#newUserTribe').html(emptyOption);
        }
    }).fail(function() {
        console.log('FAILED [GET]: ' + ajaxUrl + ' failed!');
        $('#newUserTribe').html('<option id="-1">ERROR</option>');
    }).always(function () {
    });
}

function populateDropDownExt(data) {
    getUserTypeList();
    getTribeList();
}

function initialisePageDataExt(data) {
}

function displayNewObjectExt(e) {
    $('#newUserEmail').val('');
    $('#newUserPassword').val('');
    $('#newUserMobile').val('');
    $('#newUserRole :nth-child(1)').prop('selected', true);
    $('#newUserTribe :nth-child(1)').prop('selected', true);
}

function cancelNewObjectExt(e) {
    $('#newUserEmail').val('');
    $('#newUserPassword').val('');
    $('#newUserMobile').val('');
    $('#newUserRole :nth-child(1)').prop('selected', true);
    $('#newUserTribe :nth-child(1)').prop('selected', true);
}

function createNewObjectExt(data) {
    data.userEmail = $('#newUserEmail').val();
    data.userPassword = $('#newUserPassword').val();
    data.userMobile = $('#newUserMobile').val();

    var selectedUserTypeID = '';
    $("#newUserRole option:selected" ).each(function() {
        selectedUserTypeID += $(this).attr('id');
    });
    data.userTypeID = selectedUserTypeID;

    var selectedTribeID = '';
    $("#newUserTribe option:selected" ).each(function() {
        selectedTribeID += $(this).attr('id');
    });
    data.tribeID = selectedTribeID;

    return data;
}

function updateObjectExt(data) {
    data.userEmail = $('#newUserEmail').val();
    data.userPassword = $('#newUserPassword').val();
    data.userMobile = $('#newUserMobile').val();

    var selectedUserTypeID = '';
    $("#newUserRole option:selected" ).each(function() {
        selectedUserTypeID += $(this).attr('id');
    });
    data.userTypeID = selectedUserTypeID;

    var selectedTribeID = '';
    $("#newUserTribe option:selected" ).each(function() {
        selectedTribeID += $(this).attr('id');
    });
    data.tribeID = selectedTribeID;

    return data;
}

function changeSelectedObjectExt(data) {
    $('#newUserEmail').val(data.userEmail);
    $('#newUserPassword').val(data.userPassword);
    $('#newUserMobile').val(data.userMobile);

    var selectedObjectPosition = -1;
    $.each($('#newUserRole option'), function(index, value) {
         if($(value).attr('id') == data.userTypeID) {
            selectedObjectPosition = index + 1;
        }
    });
    if(selectedObjectPosition > 0)
        $('#newUserRole :nth-child(' + selectedObjectPosition + ')').prop('selected', true);

    var selectedObjectPosition = -1;
    $.each($('#newUserTribe option'), function(index, value) {
            if($(value).attr('id') == data.tribeID) {
            selectedObjectPosition = index + 1;
        }
    });
    if(selectedObjectPosition > 0)
        $('#newUserTribe :nth-child(' + selectedObjectPosition + ')').prop('selected', true);        
}