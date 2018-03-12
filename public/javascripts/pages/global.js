function getLocationForm() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPositionForm);
        return 'Processing...';
    } else {
        return "Geo-location is not supported by this browser.";
    }
}
function showPositionForm(position) {
    var posString = 'Latitude: ' + position.coords.latitude + ' - Longitude: ' + position.coords.longitude; 
    $('#GeoLocationObject').val(posString);
}