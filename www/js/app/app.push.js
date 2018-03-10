
// ---------------------
// PUSH notifications
// ---------------------
app.push = { 
	
	getHWId: function() {		
		return device.uuid || ''; // none for browser
	},
	
	init: function() {
		console.log('PUSH - init');
		
		var push = PushNotification.init({
			android: {
			},
			browser: {
				pushServiceURL: 'http://push.api.phonegap.com/v1/push'
			},
			ios: {
				alert: "true",
				badge: true,
				sound: 'true'
			},
			windows: {}
		});
		
		push.on('error', function(e) {
		  console.log("PUSH - error = " + e.message);
		});
		
		push.on('registration', function(data) {		
			console.log('PUSH - registrationId: '+data.registrationId);
			console.log('PUSH - registrationType: '+data.registrationType);
				
			var oldRegId = localStorage.getItem('registrationId');
			var oldAppVersion = localStorage.getItem('appVersion');
			if (oldRegId !== data.registrationId || oldAppVersion !== app_settings.version) {
						
				// Post registrationId to your app server as the value has changed or to refresh app version										
				app.push.register(data.registrationId, function(d) { 
						console.log("PUSH - api register success: " + JSON.stringify(d));									                                									
					
						// Save new registration ID
						localStorage.setItem('registrationId', data.registrationId);
						localStorage.setItem('appVersion', app_settings.version);
					}, 
					function(xhr) {
						console.log("PUSH - api register fail" +  xhr);
					}
				);		
				
			}			
			
		});

		push.on('notification', function(data) {
			console.log('PUSH - notification event');
			console.log(JSON.stringify(data));
			console.log(data.message);
			console.log(data.title);
			console.log(data.additionalData);

			if (data.additionalData) {
				if (data.additionalData['action'] && data.additionalData['action'] == 'redirection') {
					var redi = data.additionalData['redirection'];
					mofChangePage('/'+redi);		
				} else if (data.additionalData['action'] && data.additionalData['action'] == 'alert') {
					var title = data.title || 'Notification';
					mofAlert(data.message, title);										
				}
			} else {
				// do nothing
			}
		});
	},
	
	register : function(token, lambda, lambdaerror) {
		console.log('PUSH register');			               
		
		var offset = new Date().getTimezoneOffset() * 60;        //in seconds
						
		var language = window.navigator.language;
		var lang = 'en';
		if (language) {
			lang = language.substring(0,2); 
		}				
			
		var devicePlatform = device.platform || '';
		var deviceModel = device.model || '';
		var deviceVersion = device.version || '';

		var params = {	
			user_id : objUser.user_id,
			app_code : app_settings && app_settings.push_app || "app",
			app_version : app_settings && app_settings.version || "x",
			push_token : token,
			language : lang,
			hwid : app.push.getHWId(),
			timezone : offset,
			device_platform : devicePlatform,
			device_model : deviceModel,
			device_version : deviceVersion
		};    
		//console.log(params);				
						
		app.auth.remoteAjax({
				url: app_settings.api_url+"/notification/register", 
				method: 'POST',
				jwt: false,
				data: params,
				cbWin: lambda,
				cbFail: lambdaerror
		});	
	
	},
	
	unregister : function(lambda, lambdaerror) {
		console.log('PUSH unregister');			          
		
		var params = {                                                                                    
			app_code : app_settings && app_settings.push_app || "app",
			hwid : app.push.getHWId()                             
		};

		app.auth.remoteAjax({
				url: app_settings.api_url+"/notification/unregister", 
				method: 'POST',
				jwt: false,
				data: params,
				cbWin: lambda,
				cbFail: lambdaerror
		});	
			
	}          
	
};
					 		