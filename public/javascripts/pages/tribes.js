function initialisePageView() {
    $('body').pleaseWait();
    $.ajax({
        url: "/api/tribes"
    }).done(function (data) {
        $('#tribeList').html('<span>No Tribes Found!</span>');
        var fullHtml = '';
        $.each(data.tribeList, function(index, value) {
            fullHtml += '<div class="row 50%" id="TribeID-' + value.tribeID + ' rel="tribeList"><div class="6u 12u(mobile)">Tribe name</div><div class="6u 12u(mobile)"><input type="text" id="tribeName-' + value.tribeID + '" value="' + value.tribeName + '" readonly /></div></div>';
        });
        if(fullHtml.length >0)
            $('#tribeList').html(fullHtml);
    }).fail(function() {
        console.log('FAILED [GET]: /api/tribes failed!');
    }).always(function () {
        $('body').pleaseWait('stop');
    });
}

function createTribe(e) {
    $('body').pleaseWait();
    $.ajax({
        method: "POST",
        url: "/api/tribes",
        data: {tribeName: $('#newTribeName').val() }
    }).done(function (data) {
        $('#tribeList').html('<span>No Tribes Found!</span>');
        var fullHtml = '';
        $.each(data.tribeList, function(index, value) {
            fullHtml += '<div class="row 50%" id="TribeID-' + value.tribeID + ' rel="tribeList"><div class="6u 12u(mobile)">Tribe name</div><div class="6u 12u(mobile)"><input type="text" id="tribeName-' + value.tribeID + '" value="' + value.tribeName + '" readonly /></div></div>';
        });
        if(fullHtml.length >0)
            $('#tribeList').html(fullHtml);
    }).fail(function() {
        console.log('FAILED [POST]: /api/tribes failed!');
    }).always(function () {
        $('body').pleaseWait('stop');
    });
}

$(function () {
    $('#createTribe').click(createTribe);
    initialisePageView();
});