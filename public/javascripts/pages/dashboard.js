function initialiseTable() {
    $('body').pleaseWait();

    var ajaxUrl = '/api/data';
    $.ajax({
        url: ajaxUrl
    }).done(function (data) {
        var fullHTML = '';
        $.each(data.objectList, function(index, value) {
            fullHTML += '<tr>';
            fullHTML += '<td>' + value.userID + '</td>';
            fullHTML += '<td>' + 'ROLE' + '</td>';
            fullHTML += '<td>' + 'TRIBE' + '</td>';
            fullHTML += '<td>' + 'EAC TYPE' + '</td>';
            fullHTML += '<td>' + 'Date' + '</td>';
            fullHTML += '<td>' + 'Location' + '</td>';
            fullHTML += '<td>' + 'Details' + '</td>';
            fullHTML += '</tr>';
        });
        if(fullHTML.length > 0) {
            $('#tableContent').html(fullHTML);
        }
        $('#transactionHash').val(data.transactionHash);
        $('#gasPrice').val(data.gasPrice);
    }).fail(function() {
        console.log('FAILED [GET]: ' + ajaxUrl + ' failed!');
        $('#transactionHash').val('ERROR');
        $('#gasPrice').val('ERROR');
    }).always(function () {
        $('body').pleaseWait('stop');
    });
}

$(function() {
    initialiseTable();
    $('#bcData').DataTable();
    $(window).scrollTo($('#objectContainer'), 300);
});