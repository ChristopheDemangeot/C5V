function populateDropDownExt(data) {
}

function initialisePageDataExt(data) {
}

function displayNewObjectExt(e) {
    $('#newUserEmail').val('');
    $('#newUserMobile').val('');
}

function cancelNewObjectExt(e) {
    $('#newUserEmail').val('');
    $('#newUserMobile').val('');
}

function createNewObjectExt(data) {
    data.userEmail = $('#newUserEmail').val();
    data.userMobile = $('#newUserMobile').val();
    return data;
}

function updateObjectExt(data) {
    data.userEmail = $('#newUserEmail').val();
    data.userMobile = $('#newUserMobile').val();
    return data;
}

function changeSelectedObjectExt(data) {
    $('#newUserEmail').val(data.userEmail);
    $('#newUserMobile').val(data.userMobile);
}