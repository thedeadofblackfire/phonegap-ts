
// ---------------------
// AUTH
// ---------------------          
app.auth = {};
app.auth.debug = true;
app.auth.maxReconnectAllowed = 5;
app.auth.currentReconnection = app.auth.maxReconnectAllowed;
app.auth.autoLoginAfterRegister = false;
app.auth.inappbrowser_ref = null;

app.auth.checkPreAuth = function(login, resolve) {
	console.log('AUTH - checkPreAuth');

    var result = false;
	if(Object.keys(objUser).length == 0 && (window.localStorage["auth_provider"] == undefined || window.localStorage["auth_provider"] == '') && window.localStorage["auth_username"] != undefined && window.localStorage["auth_password"] != undefined) {
		app.auth.handleLoginJwt(window.localStorage["auth_username"], window.localStorage["auth_password"], false);
	} else if (Object.keys(objUser).length == 0 && (window.localStorage["auth_provider"] != undefined && window.localStorage["auth_provider"] != '') && (window.localStorage["auth_provider_uid"] != undefined && window.localStorage["auth_provider_uid"] != '')) {
		console.log('autologin social');
		app.auth.handleLoginSocial(window.localStorage["auth_provider"], false);
	} else if (Object.keys(objUser).length == 0) {
        console.log('AUTH - checkPreAuth no user');
        if (login === false) {
            if (resolve) resolve({ componentUrl: './frames/login.html' });
            else fwk.mofChangePage('/login', {animate: false, reloadCurrent: true});
        }
    } else {
        result = true;
    }

    return result;
};

app.auth.handleLoginForm = function() {
	console.log('AUTH - handleLoginForm');				
	var u = $$("#loginForm #username").val();
	var p = $$("#loginForm #password").val();

	app.auth.handleLoginJwt(u, p, true); 	 
};
        
app.auth.handleLoginJwt = function(u,p,fromform) {
	console.log('AUTH - handleLoginJwt fromform='+fromform);		
	console.log('u='+u);

    if (fromform === true) fwk.mofProcessBtn("#btnLogin", true);

	if(u != '' && p != '') {  
		// get jwt token for user
		app.auth.remoteAjax({
						url: app_settings.api_url+"/auth/authenticate", 
						method: 'POST',
						jwt: false,
						data: {username: u, password: p, type: 'patient', app_version: app_settings.version},
						cbWin: function(d) {	
							if (app.auth.debug) console.log(d);
							
							if (d.data) {
								if (d.data.token) {
									window.localStorage["auth_token"] = d.data.token;
								}
								
								window.localStorage["auth_provider"] = '';
								window.localStorage["auth_username"] = u;
								window.localStorage["auth_password"] = p; 
								
								// include user info
								if (d.data.user) {									
									objUser = d.data.user;
									
									// save user full object in cache  with a timestamp cache
									window.localStorage.setItem('user', JSON.stringify(objUser));
									window.localStorage['user_last_update'] = new Date().getTime(); //new Date().toISOString()									
									//if (objUser.patient && objUser.patient.total_healthy) $$('.total_healthy').html(objUser.patient.total_healthy);
																				
									// launch the push notification center because it's required objUser
									try {
										if (ENV == 'production' || ENV == 'staging') {
											setTimeout(function(){ 	
												app.push.init(); //push_onDeviceReady();		
											}, 100); 
										}
									} catch(err) {
										console.log('Error loading push');
									}
									
									if (fromform === true) {
										fwk.mofProcessBtn("#btnLogin", false);	
									} else {
										console.log('auto login success');     																                          
									}
									
									app.auth.initAfterLogin();	
								}
								
							} else {
								// display error type
								if (d.code == 101) fwk.mofAlert('Veuillez renseigner toutes les informations du formulaire !');	
								else if (d.code == 102) {
									// auto login
									// fwk.mofAlert('L\'adresse email est incorrecte !');
									if (fromform === true) fwk.mofAlert('Votre compte n’est pas reconnu. Veuillez saisir à nouveau votre identifiant et votre mot de passe.');	
									else fwk.mofChangePage('/login');
								} else if (d.code == 103) fwk.mofAlert('Le mot de passe est incorrect !');	
								else if (d.code == 104) fwk.mofAlert('Votre compte a été désactivé !');
								else if (d.code == 105) fwk.mofAlert('Votre compte n\'a pas été activé !<br/>Veuillez vérifier vos e-mails et vos courriers indésirables. Merci.');
								else if (d.code == 106) fwk.mofAlert('Vous n\'avez pas l\'autorisation de faire cette action !');
								else if (d.code == 107) {									
                                    fwk.mofAlert('Vous devez obligatoirement mettre à jour l\'application pour vous connecter de nouveau.', 'Mise à jour', null, [
                                        {
                                            text: 'Mettre à jour',
                                            bold: true,
                                            onClick: function () {
                                                if (app_settings.platform == 'Android') {  //Android
                                                    window.location.replace("market://details?id="+app_settings.package_id);
                                                } else if (app_settings.platform == 'iOS') { //iOS
                                                    window.location.replace("itms-apps://itunes.apple.com/app/dynamoove/id1102406679?mt=8");
                                                } else {
                                                    console.log('no update on browser, refresh cache');
                                                }
                                            }
                                        }, {
                                            text: 'Ok',
                                            bold: true
                                        },
                                    ]);
                                } else {
									fwk.mofAlert('Une erreur est survenue!');	
								}
					 
								if (fromform === true) fwk.mofProcessBtn("#btnLogin", false)								
							}							
						},
						cbFail: function(xhr) {
							console.log('error '+xhr.status);
							if (xhr.status != 403) {
								if (app.checkConnection()) fwk.mofAlert('Veuillez renseigner toutes les informations du formulaire !');  			
								else fwk.mofAlert('Une connexion Internet est indispensable pour continuer !'); 
							}
							if (fromform === true) fwk.mofProcessBtn("#btnLogin", false);
							else fwk.mofChangePage('/login');
						}
		});			
		
	} else {        
		if (app.checkConnection()) fwk.mofAlert('Veuillez renseigner toutes les informations du formulaire !');                		
		else fwk.mofAlert('Une connexion Internet est indispensable pour continuer !'); 
		if (fromform === true) fwk.mofProcessBtn("#btnLogin", false);
	}
	return false;
};

// https://firebase.google.com/docs/auth/web/cordova
app.auth.handleLoginSocial = function(provider, fromform) {
	console.log('AUTH - handleLoginSocial provider='+provider+' fromform='+fromform);		
	
    if (fromform === true) fwk.mofProcessBtn("#btnLogin"+provider, true);

	if (provider) {  
	
		var baseUrl = app_settings.api_url;
		var url = baseUrl+'/auth/sociallogin/'+provider;
		if (window.localStorage["auth_provider_uid"] != undefined && window.localStorage["auth_provider_uid"] != '') url += '/'+window.localStorage["auth_provider_uid"];

		if (cordova.InAppBrowser) {
			console.log('InAppBrowser open '+url);
			//app.auth.inappbrowser_ref = cordova.InAppBrowser.open(url, '_system', 'location=yes,clearcache=yes,hardwareback=yes');
			app.auth.inappbrowser_ref = cordova.InAppBrowser.open(url, '_blank', 'location=no,hidden=yes,clearcache=no,hardwareback=yes,closebuttoncaption=Fermer');
			
			var loadStartCallBack = function(event) {
				//console.log('InAppBrowser loadstart '+event.url); 
				if (event.url.indexOf("auth/sociallogin") > -1 && event.url.indexOf("auth/sociallogin") < 60) {
					app.auth.inappbrowser_ref.hide();
					console.log('InAppBrowser loadstart hide '+event.url); 
				} else {
					app.auth.inappbrowser_ref.show();
					console.log('InAppBrowser loadstart show '+event.url); 
				}
			};
			
			var loadStopCallBack = function(event) { 
				console.log('InAppBrowser loadstop '+event.url); 
				if (event.url.indexOf("auth/sociallogin") > -1 && event.url.indexOf("auth/sociallogin") < 60) {
					// we exclude auth/sociallogin in google parameter
					console.log('AUTH - handleLoginSocial process back api');
					
					//fw7.dialog.preloader('Chargement...');
					
					//document.body.innerHTML
					try {
						app.auth.inappbrowser_ref.executeScript({code: "document.body.innerText"},  function( values ) {			
							console.log(values[0]);
							
							try {
								var d = JSON.parse(values[0]);
							} catch (e) {
								console.log('InAppBrowser error in parsing json');
								if (fromform === true) fwk.mofProcessBtn("#btnLogin"+provider, false);

								if (fw7.views.main.router.url.indexOf('/login') === -1) fwk.mofChangePage('/login');	
							}
							if (app.auth.debug) console.log(d);
							
							if (app.auth.inappbrowser_ref) {
								app.auth.inappbrowser_ref.close();
								app.auth.inappbrowser_ref = null;	
							}
								
							if (d.data) {
								console.log('InAppBrowser parsing provider');
														
								// include user info
								if (d.data.user) {									
									objUser = d.data.user;
									
									// set localstorage only if user success
									window.localStorage["auth_provider"] = provider;
									window.localStorage["auth_provider_uid"] = (objUser.provider_uid) ? objUser.provider_uid : null;
									window.localStorage["auth_username"] = (objUser.username) ? objUser.username : '';
									window.localStorage["auth_password"] = null; 								
									
									if (objUser.jwt && objUser.jwt.token) {
										window.localStorage["auth_token"] = objUser.jwt.token;
									}
									
									// save user full object in cache  with a timestamp cache
									window.localStorage.setItem('user', JSON.stringify(objUser));
									window.localStorage['user_last_update'] = new Date().getTime(); //new Date().toISOString()							
									
									// init messaging
									setTimeout(function(){ 	
										app.messaging.initSocket();									
									}, 100); 
										
									// launch the push notification center because it's required objUser
									try {
										//if (ENV == 'production' || ENV == 'staging') {
											setTimeout(function(){ 	
												app.push.init(); //push_onDeviceReady();		
											}, 100); 
										//}
									} catch(err) {
										console.log('Error loading push');
									}
									
									if (fromform === true) {
										fwk.mofProcessBtn("#btnLogin"+provider, false);	
									} else {										
										console.log('auto login social success');     																                          
									}
									
									//fw7.dialog.close();
									
									app.auth.initAfterLogin();	
								}																
								
							} else {
							
								//fw7.dialog.close();
							
								if (d.message_translation) {
									fwk.mofAlert(d.message_translation);
								} else {
									fwk.mofAlert('Une erreur est survenue !')
								}
								
								// display error type
								/*
								if (d.code == 101) fwk.mofAlert('Veuillez renseigner toutes les informations du formulaire !');	
								else if (d.code == 102) {
									// auto login
									if (fromform === true) fwk.mofAlert('L\'adresse email est incorrecte !');	
									else fwk.mofChangePage('/login');
								} else if (d.code == 103) fwk.mofAlert('Le mot de passe est incorrecte !');	
								else if (d.code == 104) fwk.mofAlert('Votre compte a été désactivé !');
								else if (d.code == 105) fwk.mofAlert('Votre compe n\'a pas été activé!<br/>Veuillez vérifier votre boîte aux lettres dont les courriers indésirables !<br/>Merci');
								else if (d.code == 106) fwk.mofAlert('Vous n\'avez pas l\'autorisation de faire cette action !');
								else fwk.mofAlert('Une erreur est survenue !');	
								*/
								if (fromform === true) fwk.mofProcessBtn("#btnLogin"+provider, false);

								if (fw7.views.main.router.url.indexOf('/login') === -1) fwk.mofChangePage('/login');	
																							
							}
							/*
							if (values[0] == 'ok')  {
								// @todo display a success message on settings page
								app.auth.inappbrowser_ref.close();
								
							} else if (values[0] == 'ko') {
								// @todo display a success message on settings page
								app.auth.inappbrowser_ref.close();
								app.auth.inappbrowser_ref = null;
							}
							*/
						});
					} catch(err) {
						console.log('InAppBrowser Error callback');
													
						if (fromform === true) fwk.mofProcessBtn("#btnLogin"+provider, false);
					}
				}				
			};
			
			app.auth.inappbrowser_ref.addEventListener('loadstart', loadStartCallBack);	
			app.auth.inappbrowser_ref.addEventListener('loadstop', loadStopCallBack);		
			app.auth.inappbrowser_ref.addEventListener('exit', function(event) {
				console.log('InAppBrowser exit');
				if (app.auth.inappbrowser_ref != undefined) {
					app.auth.inappbrowser_ref.close();
					app.auth.inappbrowser_ref = null;	
				}						
							
				if (fromform === true) fwk.mofProcessBtn("#btnLogin"+provider, false);
			});	
		
		} else {
			// for dev env
			//app.auth.inappbrowser_ref = window.open(url, '_self', 'location=no');
			app.auth.inappbrowser_ref = window.open(url, '_system', 'location=no');
		}	
				
	} else {        
		fwk.mofAlert('Non autorisé');                		
		if (fromform === true) fwk.mofProcessBtn("#btnLogin"+provider, false);
	}
	
	return false;
};

app.auth.initAfterLogin = function(force_reload, options) {
	var force_reload = force_reload || false;
	var options = options || {};
	console.log('initAfterLogin force_reload='+force_reload+' state='+objUser.patient.state+' options='+JSON.stringify(options));
	
	var hasLicense = (objUser.unlicensed == 0 && objUser.license) ? true : false;

	var redirection = '';
	if (!hasLicense && objUser.patient.state == 0) {
		// display marketing page before bilan1
		//redirection = 'frames/license.html';
		redirection = '/signup_invite';
	} else if (hasLicense && objUser.patient.state == 1) {		
		redirection = '/tracker';
	//} else if (!hasLicense && (objUser.patient.state == 10 || objUser.patient.state == 11)) {		
	//	redirection = 'frames/survey.html';
	} else if (hasLicense && (objUser.patient.state == 30) && options.result) {	
		redirection = '/survey?result=1';
	} else if (hasLicense && objUser.patient.state >= 30) {		
		redirection = '/timeline';		
	//} else if (objUser.patient.state == 2 || objUser.patient.state == 10) {		// for payment
	} else if (hasLicense && (objUser.patient.state == 2 || objUser.patient.state == 10)) {	
		redirection = '/survey';
	//} else if (objUser.patient.state == 11) {		// for payment integration
	} else if (hasLicense && (objUser.patient.state == 11)) {
		redirection = '/timeline';	
	//} else if (objUser.patient.state >= 20) { // for payment integration
	} else if (hasLicense && objUser.patient.state >= 20) {			
		redirection = '/timeline'; // we use timeline call before redirection to survey
	} else if (!hasLicense) { // disable for payment integration
		// by default if no licence 
		redirection = '/license';		
	} else {
		// allow to access to dashboard/timeline
		//redirection = 'frames/timeline.html'; // uncomment for payment integration
	} 
	
	//redirection = 'frames/profile.html';
	//redirection = 'frames/tracker.html';
	//redirection = 'frames/timeline.html';
	//redirection = 'frames/survey.html?id=bilan_riskfactors&result=1';		
	//redirection = 'frames/coaching.html';
	
	if (redirection != '') {
		if (force_reload) fwk.mofReloadPage(redirection);
		else fwk.mofChangePage(redirection);
	}
};

app.auth.initAfterLoginNoneLicense = function(force_reload, options) {
	var force_reload = force_reload || false;
	var options = options || {};
	if(objUser.patient.state == 0 ){
		objUser.patient.state = 1;
	}
	
	console.log('initAfterLogin force_reload='+force_reload+' state='+objUser.patient.state+' options='+JSON.stringify(options));
	var hasNotLicense = (objUser.unlicensed == 0 && objUser.license) ? false : true;

	var redirection = '';
	 if (hasNotLicense && objUser.patient.state == 1) {		
		redirection = '/tracker';
	
	} else {
		redirection = '/timeline';
	}	
	
	if (redirection != '') {
		if (force_reload) fwk.mofReloadPage(redirection);
		else fwk.mofChangePage(redirection);
	}
};

app.auth.openUrl = function(url, target) {
	var target = target || 'external';
	if (app.auth.debug) console.log('AUTH - openUrl - url='+url+' target='+target);
	if (target == 'external') {
		if (cordova.InAppBrowser && ENV_TARGET == 'phonegap') {
			if (app.auth.debug) console.log('AUTH - openUrl - InAppBrowser');
			var ref = cordova.InAppBrowser.open(url, '_blank', 'location=yes');
		} else {
			var ref = window.open(url, '_system', 'location=yes');
		}
	} else if (target == 'system' && url != '#') {
		var ref = window.open(url, '_system', 'location=yes');
	//else if (target == 'function') fwk.mofChangePage('frames/'+url+'.html');
	} else if (target == 'internal' && url != '#') fwk.mofChangePage('frames/'+url);	
};

app.auth.handleRegisterForm = function() {
	console.log('AUTH - handleRegisterForm');					
	var formData = fw7.form.convertToData('#registerForm');	  
	app.auth.handleRegister(formData, true); 	 
};

app.auth.handleRegister = function(formData, fromform) {
	console.log('AUTH - handleRegister fromform='+fromform);	
	formData.legal = (formData.legal && formData.legal.length > 0) ? true : false;
	console.log(JSON.stringify(formData));	

    if (fromform === true) fwk.mofProcessBtn("#btnRegister", true);
	
	var withPassword = true;

	if(formData.email != '' && formData.firstname != '' && formData.lastname != '' && formData.phone != '' && formData.home_zip != '' && formData.legal && (!withPassword || (withPassword && formData.password != '' && formData.password.length >= 8))) {                    			
		app.auth.remoteAjax({
						url: app_settings.api_url+"/auth/register", 
						method: 'POST',
						jwt: false,
						data: formData,
						cbWin: function(d) {	
							if (app.auth.debug) console.log(d);
																				
							if (d.success) {													
								var noti = fw7.notification.create({
									title: 'Inscription réussie !',
									text: d.message_translation,
									closeTimeout: 105000,
									closeButton: true,
									closeOnClick: true,
									cssClass: 'notification-success',
									icon: '<img src="img/picto/picto_good.png" width="24" height="24">'	
								});								
								noti.open();
																
								//  @todo include refresh profile user on data
														
								//app.auth.initAfterLogin(true); 
								//fw7.dialog.close('.popup-register', true);
								fwk.mofChangePage('/login');
									
							} else if (d.code > 0 && d.message_translation) {
								fwk.mofAlert(d.message_translation);
							}
														
							if (fromform === true) {
								fwk.mofProcessBtn("#btnRegister", false);
							} 
															
						},
						cbFail: function(xhr) {
							console.log('error '+xhr.status);
							if (xhr.status == 404) {
								fwk.mofAlert('Clé invalide!');
							} else if (xhr.status != 403) {
								fwk.mofAlert('Veuillez renseigner toutes les informations du formulaire !');  
							}
							if (fromform === true) fwk.mofProcessBtn("#btnRegister", false);							
						}
		});		
		
	} else {      
		if (withPassword && formData.password != '' && formData.password.length < 8) fwk.mofAlert("Votre mot de passe doit avoir un minimum de 8 caractères !"); 
		else if (formData.email != '' && !formData.legal) fwk.mofAlert("Veuillez accepter nos conditions générales d'utilisation pour valider votre inscription !");              
		else fwk.mofAlert('Veuillez renseigner toutes les informations du formulaire !');                		
		if (fromform === true) fwk.mofProcessBtn("#btnRegister", false);
	}
	return false;
};

app.auth.handleForgotPasswordForm = function() {
	console.log('AUTH - handleForgotPasswordForm');	
	var formData = fw7.form.convertToData('#forgotpasswordForm');	  
	app.auth.handleForgotPassword(formData, true); 	 
};

app.auth.handleForgotPassword = function(formData, fromform) {
	console.log('AUTH - handleForgotPassword fromform='+fromform);	
	console.log(JSON.stringify(formData));	

    if (fromform === true) fwk.mofProcessBtn("#btnForgotPassword", true);
	
	if(formData.email != '') {                    			
		app.auth.remoteAjax({
						url: app_settings.api_url+"/auth/forgotpassword", 
						method: 'POST',
						jwt: false,
						data: {email: formData.email},
						cbWin: function(d) {	
							if (app.auth.debug) console.log(d);
																				
							if (d.success) {												
								var noti = fw7.notification.create({
									title: 'Mot de passe oublié',
									text: d.message_translation,
									closeTimeout: 3000,
									closeButton: true,
									closeOnClick: true,
								});								
								noti.open();
																												
								//fw7.dialog.close('.popup-forgot-password', true);
									
							} else if (d.code > 0 && d.message_translation) {
								fwk.mofAlert(d.message_translation);
							}
														
							if (fromform === true) {
								fwk.mofProcessBtn("#btnForgotPassword", false);
							} 
															
						},
						cbFail: function(xhr) {
							console.log('error '+xhr.status);
							if (xhr.status == 404) {
								fwk.mofAlert('Clé invalide!');
							} else if (xhr.status != 403) {
								fwk.mofAlert('Veuillez renseigner toutes les informations du formulaire !');  
							}
							if (fromform === true) fwk.mofProcessBtn("#btnForgotPassword", false);							
						}
		});		
		
	} else {      
		fwk.mofAlert('Veuillez renseigner toutes les informations du formulaire !');                		
		if (fromform === true) fwk.mofProcessBtn("#btnForgotPassword", false);
	}
	return false;
};

app.auth.handleLicenceForm = function() {
	console.log('AUTH - handleLicenceForm');		
	var serial = $$("#licenceForm #serial").val();

	app.auth.handleLicence(serial, true); 	 
};

app.auth.handleLicence = function(serial, fromform) {
	console.log('AUTH - handleLicence fromform='+fromform);		
	console.log('serial='+serial);

    if (fromform === true) fwk.mofProcessBtn("#btnLicence", true);

	if(serial != '') {                    		
		app.auth.remoteAjax({
						url: app_settings.api_url+"/auth/activate", 
						method: 'POST',
						data: {code: serial},
						cbWin: function(d) {	
							if (app.auth.debug) console.log(d);
											
							if (d.success) {									
								// include refresh profile user on data
								app.auth.refreshProfile(function(d) {
									bilanResult = (objUser.patient.state >= 10) ? true : false;
																		
									// display popup												
									var popupData = {
										close_url: 'hidden',
										background: '',
										icon: 'card_licence_popup',
										body: '',
										focus: '',
										footer: '<p class="button_serie uppercase"><a href="#" class="close-popup">Continuer</a></p>'
									};
									//popupData.body += '<h3 class="text_color_teal">Merci pour votre inscription !</h3>';
									popupData.body += '<h3 class="text_color_teal">Félicitations !</h3>';
									//popupData.body += '<p class="m-t-10 m-b-10 text_color_green">Félicitations,</p>';
									//popupData.body += '<p class="m-t-20"><img src="https://api.dynamoove.com/assets/uploads/'+objUser.company.company_logo+'" width="192" /></p>';
									popupData.body += '<p class="m-t-20"><img src="https://pro.dynamoove.com/assets/uploads/files/'+objUser.company.company_logo+'" width="192" /></p>';
									if (objUser.company.company_license_text && objUser.company.company_license_text != '') {
										popupData.focus += '<p>'+objUser.company.company_license_text.nl2br()+'</p>';
									} else {
										popupData.focus += '<h3 class="text_color_teal uppercase m-10">'+objUser.company.company_name+' vous offre</h3>';
										if (bilanResult) {
											popupData.focus += '<p>les résultats de votre<br/>Bilan Sport Santé</p>';
											popupData.footer = '<p class="button_serie uppercase"><a href="#" class="close-popup">Voir mes résultats</a></p>';
										} else {
											popupData.focus += '<p>la possibilité de réaliser votre<br/>Bilan Sport Santé</p>';
										}
									}
																		
									fwk.mofPopupCustom(popupData, function() {
										// put js here
										/*
										$$('.popup-custom').on('popup:close', function() {
											console.log('Popup is closing 2')
											
										});
										*/
										
									});
									
									app.auth.initAfterLogin(true, { result: bilanResult}); // true because we can be already on the survey page										
													
								});
							} else if (d.code > 0 && d.message_translation) {
								fwk.mofAlert(d.message_translation);
							}
														
							if (fromform === true) {
								fwk.mofProcessBtn("#btnLicence", false);
							} 
														
						},
						cbFail: function(xhr) {
							console.log('error '+xhr.status);
							if (xhr.status == 404) {
								fwk.mofAlert('Clé invalide!');
							} else if (xhr.status != 403) {
								fwk.mofAlert('Veuillez renseigner toutes les informations du formulaire !');  
							}
							if (fromform === true) fwk.mofProcessBtn("#btnLicence", false);							
						}
		});			
		
	} else {        
		fwk.mofAlert('Veuillez renseigner correctement votre code d\'accès !', null, function(){$$('#serial').focus();});  		
		if (fromform === true) fwk.mofProcessBtn("#btnLicence", false);
	}
	return false;
};

// Test API jwt : app.auth.api('/surveys/1');
app.auth.api = function(url) {	
	app.auth.remoteAjax({
		url: app_settings.api_url+url, 
		method: 'GET',
		cbWin: function(d) {
			console.log(d);
		}
	});
};

/*
 * Generic ajax for jwt or not
 * url is required
 */
app.auth.remoteAjax = function(options) {
	console.log('remoteAjax url='+options.url);
	
	var defaults = {
        method: 'GET',
        data: {},
        async: true,
		noBlockUiDelay: false, // active with 0 or 100 ms
        cache: false,
        headers: {},
        dataType: 'json',
		jwt: true,
		cbWin: false,
		cbFail: false
    };
			
	// Merge options and defaults
	options = Framework7.utils.extend(defaults, options);

	// Default URL
    if (!options.url) {
        options.url = window.location.toString();
    }
	
	if (options.jwt) {
		token = window.localStorage["auth_token"];
		options.headers = {'Authorization': 'Bearer '+token};
	}
	
	var strReturn = '';
		
	options.success = function(d, status, xhr) {	
		app.auth.currentReconnection = app.auth.maxReconnectAllowed;
		//if (options.cbWin) options.cbWin(d);
		
		if (options.async) {
			if (options.cbWin) options.cbWin(d);
		
		} else {
			// sync
			console.log('sync');
			var my_data = d.data || d;
			if (options.cbWin) strReturn = options.cbWin(my_data);
			else strReturn = my_data;
		}
	};
	
	options.error = function(xhr, status) {
		//console.log(xhr);
		if (xhr.status == 403) {
			if (app.checkConnection()) console.log('Oups, vous n\'êtes pas autorisé !');
			else console.log('Oups, une connexion internet est requise !');
		}

		if (options.cbFail) options.cbFail(xhr);
	};
	
	if (options.noBlockUiDelay !== false && !options.async) {
		setTimeout(function(){	
			console.log('remoteAjax noBlockUiDelay='+options.noBlockUiDelay);
			Framework7.request(options);
		}, options.noBlockUiDelay);
	} else {	
		Framework7.request(options);
	}
	
	if (!options.async) return strReturn;
};

app.auth.handleLogout =	function() {
	console.log('AUTH - handleLogout');	

	var tutorial_onboarding = false;
	if (window.localStorage["tutorial_onboarding"] != undefined) {
		tutorial_onboarding = window.localStorage["tutorial_onboarding"];
	}
	
	window.localStorage.clear();  
	window.sessionStorage.clear();	

	objUser = {};	
	
	app.survey.clean();
	
	window.localStorage['tutorial_onboarding'] = tutorial_onboarding;

    fwk.mofChangePage('/login');
};
   
// force refresh user profile info inside code  
app.auth.refreshProfile = function(cb) {
    console.log('AUTH - refreshProfile');	
	
	try {
		app.auth.remoteAjax({
			url: app_settings.api_url+"/auth/profile", 
			method: 'GET',
			cbWin: function(d) {		
				console.log(d);
				
				objUser = d; 
							
				// save user full object in cache  with a timestamp cache
				window.localStorage.setItem('user', JSON.stringify(objUser));
				window.localStorage['user_last_update'] = new Date().getTime(); //new Date().toISOString()										
				
				if (cb) cb(d);
			}
		});
	
	} catch(err) {
		console.log('Error '+JSON.stringify(err));
	}
	
	return true;
};   

app.auth.handleChangePasswordForm = function() {
	console.log('AUTH - handleChangePasswordForm');				
	var formData = fw7.form.convertToData('#changePasswordForm');	  
	app.auth.handleChangePassword(formData, true); 	 
};

app.auth.handleChangePassword = function(formData, fromform) {
	console.log('AUTH - handleChangePassword fromform='+fromform);	
	console.log(JSON.stringify(formData));	
 		
	if (fromform === true) fwk.mofProcessBtn(".save-profile-password-data", true);

	if (formData.password != '' && formData.confirm_password != '') {
		if (formData.password == formData.confirm_password) {
					
			app.auth.remoteAjax({
				url: app_settings.api_url+"/auth/profile", 
				method: 'POST',
				data: { password: formData.password, confirm_password: formData.confirm_password },
				cbWin: function(d) {
					console.log('PROFILE - change password');
					console.log(d);
						
					if (d.patient) {		
						window.localStorage["auth_password"] = formData.password;					
						
						noti = fw7.notification.create({
							title: 'Mot de passe',
							//titleRightText: 'now',
							//subtitle: 'This is a subtitle',
							text: 'Votre mot de passe a bien été modifié',
							closeTimeout: 3000,
							closeButton: true,
						});
						noti.open();
								
						/*
						objUser = d;
						
						// save user full object in cache  with a timestamp cache
						window.localStorage.setItem('user', JSON.stringify(objUser));
						window.localStorage['user_last_update'] = new Date().getTime();													
						*/
					}
									
					if (fromform === true) fwk.mofProcessBtn(".save-profile-password-data", false);
					
					fwk.mofChangePage('/profile');
												
				},						
				cbFail: function(xhr) {
					console.log('error '+xhr.status);
					if (xhr.status != 403) {
						if (app.checkConnection()) fwk.mofAlert('Veuillez renseigner toutes les informations du formulaire !');  			
						else fwk.mofAlert('Une connexion Internet est indispensable pour continuer !'); 
					}
					if (fromform === true) fwk.mofProcessBtn(".save-profile-password-data", false);
					else fwk.mofChangePage('/login');
				}
			});
			
			return;	
		} else {			
			fwk.mofAlert('La confirmation de votre mot de passe est erronée !'); 
			if (fromform === true) fwk.mofProcessBtn(".save-profile-password-data", false);
		}
	} else {		
		fwk.mofAlert('Veuillez renseigner toutes les informations du formulaire !'); 
		if (fromform === true) fwk.mofProcessBtn(".save-profile-password-data", false);
	}					
	return false;
};

app.auth.detectLicense = function(cbWin) {    
	try {	
		if (app.auth.debug) console.log('AUTH - detectLicense');	
		app.auth.remoteAjax({
			url: app_settings.api_url+"/auth/detectlicense", 
			jwt: true,
			data: {},
			method: 'POST',
			cbWin: function(d) {				
				console.log(d);
															
				if (cbWin) cbWin(d);									
			}
		});	
	
	} catch(err) {
		console.log('Error '+JSON.stringify(err));
	}
	
	return true;
};

app.auth.loadCities = function(code, cbWin) {    
	try {	
		if (app.auth.debug) console.log('AUTH - loadCities');	
		app.auth.remoteAjax({
			url: app_settings.api_url+"/resources/cities", 
			jwt: false,
			data: {code: code},
			method: 'GET',
			cbWin: function(d) {				
				console.log(d);
															
				if (cbWin) cbWin(d);									
			}
		});	
	
	} catch(err) {
		console.log('Error '+JSON.stringify(err));
	}
	
	return true;
};

app.auth.handleCompleteRegistrationForm = function() {
	console.log('AUTH - handleCompleteRegistrationForm');					
	var formData = fw7.form.convertToData('#detailForm');  
	app.auth.handleCompleteRegistration(formData, true); 	 
};

app.auth.handleCompleteRegistration = function(formData, fromform) {
	console.log('AUTH - handleCompleteRegistration fromform='+fromform);	
	console.log(JSON.stringify(formData));	

    if (fromform === true) fwk.mofProcessBtn("#btnCompleteRegistration", true);
	
	if(formData.type != '' && ((formData.type == 'insurance' && formData.input_insurance != '' && formData.input_insurance_number != '') || (formData.type != 'insurance' ))) {                    			
		app.auth.remoteAjax({
						url: app_settings.api_url+"/auth/completeregistration", 
						method: 'POST',
						jwt: true,
						data: formData,
						cbWin: function(d) {	
							if (app.auth.debug) console.log(d);
																				
							if (d.success) {	
								if (d.message_translation != '') {							
									noti = fw7.notification.create({
										title: 'Inscription',
										text: d.message_translation,
										closeTimeout: 3000,
										closeButton: true,
									});
									noti.open();						
								}
				
								if (d.data.user) {
									objUser = d.data.user; 
							
									// save user full object in cache  with a timestamp cache
									window.localStorage.setItem('user', JSON.stringify(objUser));
									window.localStorage['user_last_update'] = new Date().getTime(); //new Date().toISOString()										
								}
												
								fwk.mofChangePage('/license');
							
							} else if (d.code > 0 && d.message_translation) {
								fwk.mofAlert(d.message_translation);
							}
														
							if (fromform === true) {
								fwk.mofProcessBtn("#btnCompleteRegistration", false);
							} 
															
						},
						cbFail: function(xhr) {
							console.log('error '+xhr.status);
							if (xhr.status == 404) {
								fwk.mofAlert('Clé invalide!');
							} else if (xhr.status != 403) {
								fwk.mofAlert('Veuillez renseigner toutes les informations du formulaire !');  
							}
							if (fromform === true) fwk.mofProcessBtn("#btnCompleteRegistration", false);							
						}
		});		
		
	} else {      
		fwk.mofAlert('Veuillez renseigner toutes les informations du formulaire !');                		
		if (fromform === true) fwk.mofProcessBtn("#btnCompleteRegistration", false);
	}
	return false;
};
