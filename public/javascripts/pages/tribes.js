function populateDropDownExt(data) {
}

function initialisePageDataExt(data) {
}

function displayNewObjectExt(e) {
    $('#newTribeLocation').val('');
    $('#newTribePopulation').val('');
    $('#newTribeArea').val('');
}

function cancelNewObjectExt(e) {
    $('#newTribeLocation').val('');
    $('#newTribePopulation').val('');
    $('#newTribeArea').val('');
}

function createNewObjectExt(data) {
    data.tribeLocation = $('#newTribeLocation').val();
    data.tribePopulation = $('#newTribePopulation').val();
    data.tribeArea = $('#newTribeArea').val();
    return data;
}

function updateObjectExt(data) {
    data.tribeLocation = $('#newTribeLocation').val();
    data.tribePopulation = $('#newTribePopulation').val();
    data.tribeArea = $('#newTribeArea').val();
    return data;
}

function changeSelectedObjectExt(data) {
    $('#newTribeLocation').val(data.tribeLocation);
    $('#newTribePopulation').val(data.tribePopulation);
    $('#newTribeArea').val(data.tribeArea);
}