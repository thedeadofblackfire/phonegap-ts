app.util = {};

app.util.days = new Array('Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche');

app.util.overridePrototypes = function() {

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
		if ((now.getMonth() < dateOfBirth.getMonth()) || (now.getMonth() == dateOfBirth.getMonth() && now.getDate() < dateOfBirth.getDate())) age -= 1;
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
}

app.util.getHWId = function() {		
	return device.uuid || 'browser';
}

app.util.getDevicePlatform = function() { // Apple = 0, Android = 1, Other = 2
	return device.platform == 'iOS' ? 0 : device.platform == 'android' || device.platform == 'Android' ? 1 : 2;
}

app.util.getLocationLink = function(latitude, longitude) {
	switch(app.util.getDevicePlatform()) {
		case 0: // iOS
			var protocol = device.version[0] >= 6 ? 'maps://' : 'http://';
			return protocol + 'maps.apple.com/maps?q=' + latitude + ',' + longitude;
		break;
		default: // Others device
			return 'http://maps.google.com/maps?q=' + latitude + ',' + longitude;
		break;
	}
}

app.util.validateEmail = function(email) {
    var reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return reg.test(email);
}

app.util.validatePhone = function(telephone) {
    var reg = /^(0|(00|\+)33)([ ]?[1-9])([-. ]?[0-9]{2}){4}$/;
    return reg.test(telephone);
}

app.util.isOnline = function() {
	return 'onLine' in navigator && navigator.onLine;
}

app.util.getCurrentPage = function() {
	var currentUrl = fw7.views.main.router.url;
	if (currentUrl.indexOf('/') != -1) currentUrl = currentUrl.replace(/\//g, '');
	return currentUrl;
}

app.util.getDate = function(date) {
	if (!date) return;
	
	function addZero(str) { return (str < 10) ? '0' + str : str; }
	date = new Date(date);
	return [addZero(date.getDate()), addZero(date.getMonth() + 1), date.getFullYear()].join('/');
}

app.util.getStringDate = function(date1, date2, separator) {
	var date2 = date2 != null ? date2 : null;	
	var separator = separator != null ? separator : true;
	
	if (!date1) return;
		
	date1 = new Date(date1);
	if (date2) date2 = new Date(date2);
	
	var arrayDay = new Array("DIM.", "LUN.", "MAR.", "MER.", "JEU.", "VEN.", "SAM.");
	var arrayMonth = new Array("JANV.", "FÉVR.", "MARS", "AVRIL", "MAI", "JUIN", "JUIL.", "AOÛT", "SEPT.", "OCTO.", "NOVE.", "DÉCE.");
	
	if (!date2 || date1.toDateString() === date2.toDateString()) {
		return (separator === true ? 'LE ' : '') + arrayDay[date1.getDay()] + ' ' + date1.getDate() + ' ' + arrayMonth[date1.getMonth()] + ' ' + date1.getFullYear();
	} else {
		var strDate1 = arrayDay[date1.getDay()] + ' ' + date1.getDate() + ' ' + arrayMonth[date1.getMonth()];
		if (date1.getFullYear() !== date2.getFullYear()) {
			strDate1 += ' ' + date1.getFullYear();
		}
		var strDate2 = arrayDay[date2.getDay()] + ' ' + date2.getDate() + ' ' + arrayMonth[date2.getMonth()] + ' ' + date2.getFullYear();
		return (separator === true ? 'DU ' : '') + strDate1 + ' AU ' + strDate2;
	}
}

app.util.getStringTime = function(time1, time2) {
	var time2 = time2 != null ? time2 : null;	
	
	if (!time1) return;
		
	time1 = new Date(time1);
	if (time2) time2 = new Date(time2);
	
	if (!time2 || time1.toUTCString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1") === time2.toUTCString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1")) {
		var time = time1.toLocaleTimeString('fr', {hour: '2-digit', minute:'2-digit'});
		if (time === '00:00') {
			return '';
		} else {
			return 'À ' + time1.toLocaleTimeString('fr', {hour: '2-digit', minute:'2-digit'});
		}
	} else {
		return 'DE ' + time1.toLocaleTimeString('fr', {hour: '2-digit', minute:'2-digit'}) + ' À ' + time2.toLocaleTimeString('fr', {hour: '2-digit', minute:'2-digit'});
	}
}

app.util.getDateUTC = function(strDate) {
	var date = new Date(strDate);
	var hourOffset = date.getTimezoneOffset() / 60;
	date.setHours(date.getHours() + hourOffset);
	return new Date(1900 + date.getYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
}



app.util.getTimeFromSeconds = function(seconds) {
   if (seconds == null || seconds == '') return "";

   seconds = parseInt(seconds, 10);
   var hours = Math.floor(seconds / 3600);
   var minutes = Math.floor((seconds - (hours * 3600)) / 60);

   if (hours < 10) hours = "0" + hours;
   if (minutes < 10) minutes = "0" + minutes;
   
   return hours + 'H' + minutes;
}

app.util.getLink = function(type, arrayValues, defaultValue, linkValue, separator1, separator2) {
	var defaultValue = defaultValue != null ? defaultValue : 'Non renseigné';
	var linkValue = linkValue != null ? linkValue : null;
	var separator1 = separator1 != null ? separator1 : '';
	var separator2 = separator2 != null ? separator2 : '';
	
	if (!linkValue) linkValue = type == 'location' ? 'Voir la position' : arrayValues[0];
	switch(type) {
		case 'location':
			if (arrayValues[0]) {
				return '<a href="' + app.util.getLocationLink(arrayValues[0], arrayValues[1]) + '" class="link external" target="_system">' + linkValue + '</a>' + separator1;
			} else {
				return defaultValue + separator2;
			}
		break;
		case 'mailto':
			if (arrayValues[0]) {
				return '<a href="mailto:' + arrayValues[0] + '" class="link external" target="_system">' + linkValue + '</a>' + separator1;
			} else {
				return defaultValue + separator2;
			}
		break;
		case 'tel':
			if (arrayValues[0]) {
				return '<a href="tel:' + arrayValues[0] + '" class="link external" target="_system">' + linkValue + '</a>' + separator1;
			} else {
				return defaultValue + separator2;
			}
		break;
		case 'link':
		default:
			if (arrayValues[0]) {
				return '<a href="' + arrayValues[0] + '" class="link external" target="_system">' + linkValue + '</a>' + separator1;
			} else {
				return defaultValue + separator2;
			}
		break;
	}
}

app.util.getValue = function(value, defaultValue = 'Non renseigné', separator1 = '', separator2 = '') {
	var defaultValue = defaultValue != null ? defaultValue : 'Non renseigné';
	var separator1 = separator1 != null ? separator1 : '';
	var separator2 = separator2 != null ? separator2 : '';
	
	if (value) {
		return value + separator1;
	} else {
		return defaultValue + separator2;
	}
}

app.util.dateIsInTheCurrentWeek = function(dateToCompareStart, dateToCompareStop) {
	var today = new Date();
	today.setHours(0, 0, 0, 0);
	var firstDay = new Date(today.setDate(today.getDate() - today.getDay() + 1));
	var lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 8));
	
	dateToCompareStart = new Date(dateToCompareStart);
	dateToCompareStart.setHours(0, 0, 0, 0);
	
	dateToCompareStop = new Date(dateToCompareStop);
	dateToCompareStop.setHours(0, 0, 0, 0);
	
	if (lastDay.getTime() <= dateToCompareStart.getTime() || firstDay.getTime() > dateToCompareStop.getTime()) {
		return false;
	} else {
		return true;
	}
}

app.util.dateIsInTheCurrentMonth = function(dateToCompareStart, dateToCompareStop) {
	var today = new Date();
	dateToCompareStart = new Date(dateToCompareStart);
	dateToCompareStop = new Date(dateToCompareStop);
	
	return today.getMonth() >= dateToCompareStart.getMonth() && today.getMonth() <= dateToCompareStop.getMonth();
}