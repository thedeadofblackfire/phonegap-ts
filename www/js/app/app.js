var ENV = app_settings.env || 'production';
var ENV_TARGET = 'phonegap'; // html5, phonegap
var ENV_PWA = false;
if (ENV == 'staging') {
	app_settings.api_url = app_settings.api_url_staging;
} else if (ENV == 'remote' || window.location.hostname == 'localhands-mobile.petimelo.com') {
	ENV = 'remote';
	ENV_TARGET = 'html5';
	app_settings.api_url = app_settings.api_url_remote;
} else if (window.location.hostname == 'xxx.phonegap.local' || window.location.port == '3000' || window.location.port == '3001') {
    ENV = 'dev';
	ENV_TARGET = 'html5';	
	app_settings.api_url = app_settings.api_url_dev;
} else if (window.location.hostname == 'm.localhands.com') {
	ENV_TARGET = 'html5';  
}

var objUser = {};
var objUserLastPosition = {};
var isLogin = false;

var app = {
    // Application Constructor
    initialize: function() { 		
        this.bindEvents();
		
        if (ENV_TARGET == 'html5' && this.hasOwnProperty("cordova")) this.onDeviceReady();
    },    
    // Bind any events that are required on startup. Common events are: 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);							
    }, 
	// deviceready Event Handler
    onDeviceReady: function() {	
		console.log('onDeviceReady ENV='+ENV+' API='+app_settings.api_url);     
		//if (window.StatusBar) window.StatusBar.hide();
		
		// init - get user from local storage
        // objUser = window.localStorage.getItem('user');
		
        //if (objUser) {
		if (Object.keys(objUser).length > 0) {
            objUser = JSON.parse(objUser);	
            console.log('retrieved user: ', objUser);         				

        } else {
            objUser = {};
        }        
							
		// init - db engine
		app.geo.init();		
		app.task.init();
		//app.timeline.init();
		//app.report.init();
		
		/*
		var date = new Date("10/11/2009"),
		locale = "fr-fr",
		month = date.toLocaleString(locale, { month: "long" });
		*/
		Date.prototype.monthNames = [
			"Janvier", "Février", "Mars",
			"Avril", "Mai", "Juin",
			"Juillet", "Août", "Septembre",
			"Octobre", "Novembre", "Décembre"
		];
		//Date.prototype.dayNames = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
		Date.prototype.dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
		Date.prototype.getShortDayName = function() {
			return this.getDayName().substr(0, 3);
		};
		Date.prototype.getDayName = function() {
			//var inc = this.getDay(); // Dimanche=0, Lundi=1
			//if (inc == 0) inc = 7; 
			//return this.dayNames[this.getDay() - 1];
			return this.dayNames[this.getDay()];
		};
		Date.prototype.getMonthName = function() {
			return this.monthNames[this.getMonth()];
		};
		Date.prototype.getShortMonthName = function() {
			return this.getMonthName().substr(0, 3);
		};
		// gmt date : 2017-02-17T10:35:36
		Date.prototype.convertToISO = function() {			
			return this.toISOString().substr(0,19);
		};
		// french date : 2017-02-17T11:35:36
		Date.prototype.convertToISOLocale = function() {			
			return this.toISOString().substr(0,11)+this.toLocaleTimeString();
		};
		Date.prototype.removeDay = function(days) {
			return new Date(new Date().getTime() - days * 86400000);
		};
		// get utc timestamp (php format) Date.getTimestamp();		
		Date.prototype.getTimestamp = function() {
			//return (new Date().getTime() / 1000);
			return Math.floor(Date.now() / 1000);
		};
		// calcul age with dob=YYYY-MM-DD
		Date.prototype.getAge = function(dob) {			
			// for compatibility with safari ios embed
			var dateOfBirth = new Date(parseInt(dob.substr(0,4)), (parseInt(dob.substr(5,2)) - 1), parseInt(dob.substr(8,2)), 0, 0, 0);				
			//var dateOfBirth = new Date(dob+' 00:00:00'); // no work on safari apple
			var now = new Date();
			var age = now.getFullYear() - dateOfBirth.getFullYear();
			return age;
		};
				
		// for decimal calcul on instance preview		
		Number.prototype.round = function(places) {
		  return +(Math.round(this + "e+" + places)  + "e-" + places);
		}
		
		// nl2br on description field
		String.prototype.nl2br = function()	{
			return this.replace(/\n/g, "<br />");
		}
				
        if (ENV == 'production' || ENV == 'staging') {
   
            if (window.device && window.device.platform) app_settings.platform = device.platform;
            
			if (window.device && window.device.platform && window.device.platform.toLowerCase() == 'ios') {
				StatusBar.backgroundColorByHexString("#2FAAAF");
			}
			
			// only if user preloading
			if (Object.keys(objUser).length > 0) {
				//push_onDeviceReady(); // maybe a bug here with $$.ajax define with initFramework
			}				
      
		} 
		
		initFramework();
		
		// force refresh enfants + structures (after initFramework to have $$.ajax) during beta			
		if (Object.keys(objUser).length > 0) {
			//app.auth.refreshProfile();
		}
		
			
		/*
		if (Object.keys(objUser).length == 0) {                           
		  	// detect login
			//$$('.login-screen').addClass('modal-in');
			//isLogin = true;			
			var result = app.auth.checkPreAuth(false); 
            if (!result) return;
		} 	
		*/
		document.addEventListener('backbutton', app.onBackKeyDown, false);
        //document.addEventListener("offline", app.onOffline, false);
        //document.addEventListener("online", app.onOnline, false);			
		//document.addEventListener("menubutton", app.onMenuKeyDown, false);
    },
	onMenuKeyDown: function() {
		console.log('listen onMenuKeyDown');
	},
	onBackKeyDown: function() {
		console.log('listen onBackKeyDown');
		//F12 chrome simulate event backbutton : cordova.fireDocumentEvent('backbutton');
		//fw7.views.main.router.history
		
		var current_url = fw7.views.main.router.url;
		if (current_url.indexOf('/') != -1) current_url = current_url.replace('/','');
		console.log('listen onBackKeyDown current_url='+current_url);
		
		if(current_url === 'index' || current_url === 'home'){ 
			//if we're on index page and we click on native back touch, do nothing
		} else if (current_url === "inscription") {
		//} else if ($$('#content-survey').length > 0) {
			console.log('onBackKeyDown survey');
			// @todo call function to back to previous question
			$$('.back_extend').click();
		} else if (current_url === "login") {
			console.log('no back history');
			fw7.panel.close(true);
		} else {
			console.log('onBackKeyDown other');
									
			fw7.panel.close(true);
			//mainView.router.back({animatePages: false});
			fw7.router.back();
		}						  
	},		
	onPause: function() {
		// Handle the pause event
		console.log('listen pause');
	},
    onResume: function() {
		// Handle the resume event
		console.log('listen resume');
    },
    onOffline: function() {
        // Handle the offline event
		console.log('listen offline');
    },
    onOnline: function() {
        // Handle the online event
		console.log('listen online');		
    },	
	checkConnection: function() {	
		return navigator.onLine;	
	},
    getPhoneGapPath: function () {
        'use strict';
        var path = window.location.pathname;
        var phoneGapPath = path.substring(0, path.lastIndexOf('/') + 1);
        return phoneGapPath;        	
        // iOS: /var/mobile/Applications/{GUID}/{appName}/www/
        // Android: /android_asset/www/
    }
};
	
/* ---------------------- */
// FRAMEWORK 7 
/* ---------------------- */

// Determine theme depending on device
//var isAndroid = Framework7.prototype.device.android === true;
var isIos = Framework7.prototype.device.ios === true;
var isAndroid = isIos !== true;

// we force android material also on ios
//isAndroid = true;

// global variables	
var fw7;
var $$;
var mainView;
var router = {};

    
function initFramework() {

    //app.date.initTranslate();

	// Set Template7 global devices flags
	Template7.global = {
		android: isAndroid,
		ios: isIos
	};

    // Export selectors engine
    $$ = Dom7;
		
	// Theme
	var theme = 'auto';
	if (document.location.search.indexOf('theme=') >= 0) {
	  theme = document.location.search.split('theme=')[1].split('&')[0];
	}

	// Initialize css engine
  fw7 = new Framework7({
		theme: theme,
		routes: routes,		
		view: {
			//pushStateAnimate: false
			//cache: false
		},
		init: false //Disable App's automatic initialization
    });
		
	//fw7.router.animate = false;
	
	
	// add view
	/*
    mainView = fw7.addView('.view-main', {
        // Because we use fixed-through navbar we can enable dynamic navbar
        dynamicNavbar: isIos ? true : false, // it should be true for ios and false for android
		//domCache: true
    });
	*/
	/*
	mainView = fw7.views.create('.view-main', {
        // Because we use fixed-through navbar we can enable dynamic navbar
        //dynamicNavbar: isIos ? true : false, // it should be true for ios and false for android
		//domCache: true
    });
	*/
	
    $$(document).on('page:init', function (e) {		
        var page = e.detail.page;
        //console.log('PAGE '+page.name);
      
		var page_id = e.target.id;
		console.log('PAGE '+page_id);
		
		if (!page) page = {name: page_id.replace('page-', '')};
		
		
        if (page_id === 'page-index' || page.name === 'index' || page.name === 'index.html') {			
            // to prevent back url on login  
			
			// detect if display onboarding
			/*
			if (window.localStorage["tutorial_onboarding"] == undefined || window.localStorage["tutorial_onboarding"] === false) {
				fwk.mofChangePage('frames/onboarding.html');
				return;
			}
			*/				
				
			//return;
			//fwk.mofChangePage('frames/signup-registration.html', {animatePages: false});
			//fwk.mofChangePage('frames/signup-pin.html', {animatePages: false});
			//fwk.mofChangePage('frames/signup-profile.html', {animatePages: false});
			//fwk.mofChangePage('frames/debug_map.html');	
			//fwk.mofChangePage('frames/task-post.html', {animatePages: false});
			//fwk.mofChangePage('frames/task-list.html', {animatePages: false});
			//fwk.mofChangePage('frames/task-map.html', {animatePages: false});
			//return;
			
			var current_url = fw7.views.main.router.url;
			//fw7.views.main.router.currentRoute
			if (current_url.indexOf('/') != -1) current_url = current_url.replace('/','');
			console.log('activePage current_url='+current_url);
		
		
			// issue with smart-select back
			if (current_url != 'task-post') {
				// animation
				setTimeout(function(){				
					if (Object.keys(objUser).length == 0) {        
					   var result = app.auth.checkPreAuth(false);
					   console.log(result);
					   if (!result) return;
					} else {
						// @todo if user connected, go to dashboard or continue last question
						//fwk.mofChangePage('frames/onboarding.html');
						//console.log(mainView.activePage.name);
						app.auth.initAfterLogin();  	
						return;
					}					
				
				}, 100);
				
				if (Object.keys(objUser).length == 0) {        
				   //var result = app.auth.checkPreAuth(false);
				   //console.log(result);
				   //if (!result) return;
				}                 
			   
				//app.auth.initAfterLogin();  	
			}
        }
         
		if (page.name === 'debug_map') {
			/*
			navigator.geolocation.getCurrentPosition(onSuccess, onError, { enableHighAccuracy: true, timeout: 30000 });
			function onSuccess(position) {
				console.log(position);
			}
			*/
			navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 30000 });
			function onSuccess(position) {
				console.log(position);
				//var lat=position.coords.latitude;
				//var lang=position.coords.longitude;
				initMap(position.coords);
			}
			
			function onError(error) {
				console.log('MAP code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
				$$.getJSON('https://ipinfo.io/geo', function(response) { 
					console.log('MAP onError',response);
					var loc = response.loc.split(',');
					var coords = {
						latitude: loc[0],
						longitude: loc[1]
					};
					initMap(coords); 
				}
				);
			}
			
			function initMap(coords) {
				//Google Maps
				var myLatlng = new google.maps.LatLng(coords.latitude,coords.longitude);
				var mapOptions = {zoom: 16,center: myLatlng}
				var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
				var marker = new google.maps.Marker({position: myLatlng,map: map});
				
				/*
				 losangeles: {
				  center: {lat: 34.052, lng: -118.243},
				  population: 3857799
				},
				*/
		
				var cityCircle = new google.maps.Circle({
					strokeColor: '#FF0000',
					strokeOpacity: 0.8,
					strokeWeight: 2,
					fillColor: '#FF0000',
					fillOpacity: 0.35,
					map: map,
					center: myLatlng, //{lat: 34.052, lng: -118.243},
					radius: Math.sqrt(150) * 100
				  });
		  
			}
		
			/*
			var map;
			function initMap() {
				map = new google.maps.Map(document.getElementById('map-canvas'), {
				  center: {lat: 33.621, lng: -117.9321},
				  zoom: 16
				});
			}
			initMap();
			*/
		}

        if (page.name === 'login') {  
			if (window.localStorage["auth_username"])  $$('#username').val(window.localStorage["auth_username"]);							
        }

    });
	    
    // Required for demo popover
	/*
    $$('.popover a').on('click', function () {
        fw7.closeModal('.popover');
    });

    // Change statusbar bg when panel opened/closed
    $$('.panel-left').on('open', function () {
		console.log('.panel-left');
        $$('.statusbar-overlay').addClass('with-panel-left');
		if (cordova.platformId == 'android' && StatusBar) StatusBar.backgroundColorByHexString("#2FAAAF");
    });
    $$('.panel-right').on('open', function () {
		console.log('.panel-right');
        $$('.statusbar-overlay').addClass('with-panel-right');
		if (cordova.platformId == 'android' && StatusBar) StatusBar.backgroundColorByHexString("#1470AF");
    });
	$$('.panel-left, .panel-right').on('close', function () {	
		//panel:close
		console.log('close panel');	
        $$('.statusbar-overlay').removeClass('with-panel-left with-panel-right');
		if (cordova.platformId == 'android' && StatusBar) {
			if(mainView.activePage.name === "dashboard" || mainView.activePage.name === "timeline" || mainView.activePage.name === "report" || mainView.activePage.name === "social") StatusBar.backgroundColorByHexString("#026069");	
			else StatusBar.backgroundColorByHexString("#2FAAAF");		
		}
				
    });
	*/

    $$(document).on('click', '#btnLogin', function(e) {
		app.auth.handleLoginForm();
    });
	
	$$(document).on('click', '#btnRegister', function(e) {
		app.auth.handleRegisterForm();
    });
	
	$$(document).on('click', '#btnLicence', function(e) {
		app.auth.handleLicenceForm();
    });
	
	$$(document).on('click', '.btn-logout', function(e) {
		app.auth.handleLogout();
    });
	
	$$(document).on('click', '#btnPost', function(e) {
		app.task.postTask();
    });
	
	// And now we initialize app
	fw7.init();
}
