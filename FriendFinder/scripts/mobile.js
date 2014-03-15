$(document).ready(function () {
    lat = 54;
    lon = -1;
    deviceposition = new google.maps.LatLng(lat, lon);
    var t = setInterval(function () {
        navigator.geolocation.getCurrentPosition(useposition);
    }, 10000);

    function useposition(position) {
        lat = position.coords.latitude;
        lon = position.coords.longitude;

        deviceposition = new google.maps.LatLng(lat, lon);

        var marker = $('#map').gmap('get', 'markers > client');
        if (!marker) {
            $('#map').gmap('addMarker', { 'id': 'client', 'position': deviceposition, 'bounds': true });
        } else {
            marker.setPosition(deviceposition);
        }

        themap.panTo(deviceposition);

        //-- Update the server with your location
        //$.post("http://yourserver.com/setlocation.php", { userid: localStorage.getItem("userid"), latitude: lat, longitude: lon });
        $.post("/api/setlocation", {
            userId: localStorage.getItem("userId"),
            latitude: lat,
            longitude: lon
        });

        //-- Get your friends' locations
        //$.post("http://yourserver.com/getfriendlocations.php", { userid: localStorage.getItem("userid") }, function (data) {
        $.post("/api/getfriendlocations", { userid: localStorage.getItem("userId") }, function (data) {
            if (data != undefined && data.length) {
                $.each(data, function (i, friend) {
                    tmplat = friend.Latitude;
                    tmplon = friend.Longitude;
                    tmppos = new google.maps.LatLng(tmplat, tmplon);
                    friendname = friend.Forename;

                    $('#map').gmap('addMarker', { 'id': friendname, 'position': tmppos, 'bounds': true }).click(function(){
                        $('#map').gmap('openInfoWindow', {'content': friendname}, this);
                    });
                });
            }
        }, "json");
    }

    //-- Create the map
    $("#map").gmap({ 'center': deviceposition, 'zoom': 12, 'disableDefaultUI': false }).bind('init', function (ev, map) { themap = map; });
    $('#map').gmap('addMarker', { 'id': 'client', 'position': deviceposition, 'bounds': true }).click(function(){
        $('#map').gmap('openInfoWindow', {'content': 'You'}, this);
    });

    $('#login').on('click', function (e) {
        e.preventDefault();

        $.post('/api/login', { email: $('#email').val(), password: $('#password').val() }, function (data) {
            if (data != undefined) {
                if (data.status === true) {
                    localStorage.setItem('userId', data.userId);
                    $.mobile.changePage($('#mappage'), 'slide', true, true);
                } else {
                    console.log(data)
                }
            }
        }, "json");
    });
});