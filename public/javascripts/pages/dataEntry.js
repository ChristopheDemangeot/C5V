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
            $('#userTribeID').val(selObject.objectID);
        }
    }).fail(function() {
        console.log('FAILED [GET]: ' + ajaxUrl + ' failed!');
    }).always(function () {
        $('#userTribe').val(result);
        return result;
    });
}

function getUserTypeList() {
    var ajaxUrl = '/api/eactypes';
    $.ajax({
        url: ajaxUrl
    }).done(function (data) {
        var emptyOption = '<option id="0">No EAC Found!</option>';
        var fullHtml = '';
    
        $.each(data.objectList, function(index, value) {
            fullHtml += '<option id="' + value.objectID + '">' + value.objectName + '</option>';
        });
    
        if(fullHtml.length > 0) {
            $('#dataEACList').html(fullHtml);
        } else {
            $('#dataEACList').html(emptyOption);
        }
    }).fail(function() {
        console.log('FAILED [GET]: ' + ajaxUrl + ' failed!');
        $('#dataEACList').html('<option id="-1">ERROR</option>');
    }).always(function () {
    });
}

function displaySuccess() {
    $('#infoSuccess').show();
    $(window).scrollTo($('#objectContainer'), 300);
    setTimeout("$('#infoSuccess').hide();", 2000);

    $('#dataEACList :nth-child(1)').prop('selected', true);
    $('#dataDBH').val('');
    $('#dataTClass').val('');
    $('#dataTCount').val('');
    $('#dataTHeight').val('');
    $('#dataTMorality').val('');
    $('#dataTLoc').val('');
}

function populateDropDownExt(data) {
}

function submitData(e) {
    $('body').pleaseWait();

    var ajaxUrl = '/api/data';
    var objData = {};
    var selectedObjectID = '';

    $("#objectSelection option:selected" ).each(function() {
        selectedObjectID = $(this).attr('id');
    });
    objData.userID = selectedObjectID;

    $("#dataEACList option:selected" ).each(function() {
        selectedObjectID = $(this).attr('id');
    });
    objData.eacTypeID = selectedObjectID;
    
    objData.tribeID = $('#userTribeID').val();
    objData.dataDBH = $('#dataDBH').val();
    objData.dataTClass = $('#dataTClass').val();
    objData.dataTCount = $('#dataTCount').val();
    objData.dataTHeight = $('#dataTHeight').val();
    objData.dataTMorality = $('#dataTMorality').val();
    objData.dataTLoc = $('#dataTLoc').val();
    objData.dataGLoc = $('#GeoLocationObject').val();

    $.ajax({
        method: "POST",
        url: ajaxUrl,
        data: objData
    }).done(function (data) {
        displaySuccess();
    }).fail(function() {
        console.log('FAILED [POST]: ' + ajaxUrl + ' failed!');
        $('#transactionHash').val('ERROR');
        $('#gasPrice').val('ERROR');
    }).always(function () {
        $('body').pleaseWait('stop');
    });
}

function initialisePageDataExt(data) {
    getUserTypeList();
    $('#objectContainer span').removeClass('fa-users').addClass('fa-database');
    $('#objectContainer h2').text('Data Entry Management');
    $('#objectContainer p').text('Please enter the data associated to a Tribe');
    $('#actionTopRow').hide();
    $('#actionBottomRow').hide();
    $('#objectNameRow').hide();

    var newButtonHTML = '<div class="12u"><ul class="buttons"><li><input type="button" class="special pull-right" value="Submit Data" id="SubmitData" /></li></ul></div>';
    $('#actionBottomRow').html(newButtonHTML);
    $('#actionBottomRow').show();
    $('#SubmitData').click(submitData);

    $('#infoSuccess').hide();

    if(getLocationForm != undefined) getLocationForm();
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

/* Google maps */
var map, infoWindow;
function initMap() {
  map = new google.maps.Map(document.getElementById('googleMap'), {
    center: {lat: -35.3075699, lng: 149.1099161},
    zoom: 10
  });
  infoWindow = new google.maps.InfoWindow;

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      infoWindow.open(map);
      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
} 