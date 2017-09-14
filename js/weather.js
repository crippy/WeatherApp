(function(){

    const API_KEY = 'dfb0f82962958bfcee501a3f9b134545';
    const weatherUrl = 'https://api.forecast.io/forecast/';
    var skycons = new Skycons({"color" : "white"});
    var lat, lon, season;
    /**
    * Track Ajax Call
    * @type {boolean}
    */
    var fetchingWeather = false;

    /**
    * Track if data was returned
    * @type {boolean}
    */
    var dataLoaded = false;

    /**
    * HTML5 Navigator Object
    */
    function testNavigator() {
        if(navigator && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
        }   
        else {
            error("Geolocation not provided");
        }
    }

    /**
    * Extract Latitude and Logitude
    * @param position - Position Object
    */
    function geoSuccess(position){
        lat = position.coords.latitude;
        lon = position.coords.longitude;
     
        $("#loading-container").fadeOut();
        getReadableAddress(lat, lon);
        
    }
    
    /**
    * Use Google to get readable address
    * @param int latitude
    * @param int longitude
    */
    function getReadableAddress(latitude, longitude) {
        var geocoder = new google.maps.Geocoder();
        var currentLocation = new google.maps.LatLng(latitude, longitude);
        geocoder.geocode({ 'latLng': currentLocation }, function (results, status){
            if(status == google.maps.GeocoderStatus.OK) {
                document.getElementById('location').innerHTML = results[3].formatted_address; 
                fetchingWeather = true;
                getWeather(latitude, longitude);     
            } else {
                error('Could not find address');
            } 
        });
    }


   /**
   * Get Weather
   * @param int latitude
   * @param int longitude
   */
    function getWeather(latitude, longitude) {
        if(latitude != null && longitude != null) {
            $.ajax({
                type: "GET",
                url: weatherUrl + API_KEY + "/" + latitude + "," + longitude,
                jsonp: 'callback',
                dataType: 'jsonp',
                success: function(data) {
                    dataLoaded = true;
                    fetchingWeather = false;
                    //Temperature Conversion
                    var tempNow = calcTemp(data.currently.temperature);
                    document.getElementById('temp').innerHTML = tempNow + "\&deg;";
                    //Current Condition
                    var condition = data.currently.summary;
                    document.getElementById('condition').innerHTML = data.currently.summary;
                    //use skycons to represent the current icon
                    skycons.set("skycon-img", data.currently.icon);
                    //build daily forecast
                    buildForecast(data.daily.data);
                },
                 error: function(err) {
                    error("Issue with getting daily weather");
                    fetchingWeather = false;
                }
            });
        }
        else {
            geoError(2);
        }
    }

   /**
   * Build Weather Forecast
   * @param object forecast.io
   */
    function buildForecast(data) {
        var template;
        for(var i = 1; i < data.length; i ++) {
            if(i < 5) {
                template = '';
                template = '<div class="forecast-item">' +
                           '<ul>' +
                           '<li>' + moment.unix(data[i].time).format("ddd") + '<span class="minify">' + moment.unix(data[i].time).format("DD/MM") + '</span></li>' +
                           '<li><canvas id="skycon-forecast-'+[i]+'" width="35px" height="35px"></canvas></li>' +
                           '<li class="minify">' + calcTemp(data[i].temperatureMax) + "\&deg; / " + calcTemp(data[i].temperatureMin) + "\&deg;" + '</li>' +
                           '</ul>' +
                           '</div>';

                
                $(".forecast").append(template);

                skycons.set("skycon-forecast-"+[i], data[i].icon);
                
            }
            else {
                break;
            }
        }

        windowSize();

        $("#weather-container").fadeIn(2000);

        //animation of the icon
        skycons.play();

    }

    /**
   * Calculate Temperature
   * @param int 
   */
    function calcTemp(temp) {
        return Math.round((temp - 32) * 5 / 9);
    }


   /**
   * Error Geolocation
   * @param obj error
   */
    function geoError(err) {
        switch(err.code) {
            case 1:
                error('The user defined the request for location information');
                break;
            case 2:
                error('Your location is unavaiable');
                break;
            case 3:
                error('The request to your location timed out');
                break;
            default:
                error('An unknown error occured while requesting your location');
        }
    }

    /**
    * Build Season Finder
    */
    function getSeason() {
        var date = new Date();
        var month = date.getMonth();
        if (month == 12 || month < 3) {
            season = 'winter';
        } else if (month >= 3 && month < 6) {
            season = 'spring';
        } else if (month >=6 && month < 9) {
            season = 'summer';
        } else if (month >= 9  && month < 12) {
            season = 'fall';
        }
        //can add season to class of body for different images
        return season;
    }

    function setBackground() {
        var currentTime = new Date().getHours();
        if(currentTime >= 21 &&  currentTime < 5) {
            document.body.style.backgroundImage = "linear-gradient(to top, #475667 0%, #0b0c0e 100%)";
        } else if( currentTime >= 5  && currentTime < 9) {
            document.body.style.backgroundImage = "linear-gradient(90deg, #FF8E8E, #F5A94C, #E0C15B)";
        } else if( currentTime >= 9 && currentTime < 18) {
            document.body.style.backgroundImage = "linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%)";
        } else if (currentTime >= 18 && currentTime < 21){
            document.body.style.backgroundImage = "linear-gradient(90deg, #fa709a 0%, #fee140 100%)";
        } else {
             document.body.style.backgroundImage = "linear-gradient(90deg, #FF8E8E, #F5A94C, #E0C15B)";
        }
    
        testNavigator();
    }


    function windowSize() {
        $('#weather-container').css({
            position:'absolute',
            left: ($(window).width() - $('#weather-container').outerWidth())/2,
            top: ($(window).height() - $('#weather-container').outerHeight())/2
        });
    };

    /**
    * Build Error
    * @param string msg
    */
    function error(msg){
        $("#loading-container").fadeOut();
        $('#weather-container .error-message').text(msg).fadeIn(500);
    }

    setBackground();

    $(window).resize(function(){
            windowSize();  
    });

  })();