var fwk = {  

    /* ------------- */   
    /* UUID
    /* ------------- */  

    //Returns a random v4 UUID of the form xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    UUIDv4: function b(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)},
    
    
	generateGUID: function(){
		var d = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (d + Math.random()*16)%16 | 0;
			d = Math.floor(d/16);
			return (c=='x' ? r : (r&0x7|0x8)).toString(16);
		});
		return uuid;
	},

	getRandomInt: function(min, max)
	{
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},
    
	/* ------------- */   
    /* Mobile Framework (require: font-awesome, fw7, mainView)
    /* ------------- */  
		
	mofGetActivePage: function(removeSlash) {
		// older v1: mainView.activePage.name
		var removeSlash = removeSlash || false;
		var current_url = fw7.views.main.router.url;
		if (removeSlash && current_url.indexOf('/') != -1) current_url = current_url.replace('/','');
		return current_url;
	},
	
	/* 
	 * mobile framework - Change Page
	 * url = test.html or #changePage => path
	 * load required page to view. In other word will do the same if you click on some link with this URL
	 * options: animatePages
	 *          allowPageChange = force to change page during the loading on the parent page
	 */
	mofChangePage: function(url, options) {		
		if (url.indexOf('frames') > -1) {
			//url = './'+url;
			var original_url = url;	
			url = url.replace('.html', '').replace('frames', '');
			console.log('mofChangePage '+original_url+' => '+url);
		} else {
			console.log('mofChangePage '+url);
		}
		var options = options || { allowPageChange: true, animate: false};
		//mainView.loadPage(pageid); 
		//if (options && options.allowPageChange) mainView.allowPageChange = true; // force to change page during the loading on the parent page (double mofChangePage)
		//mainView.router.loadPage(pageid);
	
		//console.log(fw7.views);	
		//fw7.views.main.router.navigate(url, options);
		fw7.router.navigate(url, options);
	},

	/* 
	 * mobile framework - Reload Page
	 * pageid = test.html or #changePage
	 * reload required page to the currently active view's page. It will also modify View's history and replace last item in history with the specified url
	 */
	mofReloadPage: function(url) {
		if (url.indexOf('frames') > -1) {			
			var original_url = url;
			url = url.replace('.html', '').replace('frames', '');
			console.log('mofReloadPage '+original_url+' => '+url);	
		} else {
			console.log('mofReloadPage '+url);
		}
		
		var options = options || { reloadCurrent: true, allowPageChange: true, animate: false};
		//mainView.router.reloadPage(url);  	 
		fw7.router.navigate(url, options);		
	},
		
	/* 
	 * mobile framework - Show/hide loading page
	 * show: true/false
	 */
	mofLoading: function(show) {
		console.log('loading '+show); 
		if (show) fw7.preloader.show();
		else fw7.preloader.hide();               
	},

    /* 
	 * mobile framework - Show/hide loading page
	 * show: true/false
	 */
	mofAlert: function(message, title, cbWin, customButtons) {
		if (title == undefined) title = null; //app_settings.package_name || 'Alerte';
		if (customButtons == undefined) {
            customButtons = [
                {
                    text: 'Ok',
                    bold: true
                }
            ];
        }

		fw7.dialog.create({
			title: title,
			text: message,
			buttons: customButtons,
			onClick: function(modal, index) {		
				if (cbWin) cbWin();
			}
		}).open();

		//navigator.notification.alert(res.message, function() {});
	},

	// @todo detect p if after <a> and bug disable on <a><p>	
	mofProcessBtn: function(id, state) {
		var elt = $$(id);
		var label = elt.attr('data-label');
		if (!label) {
			elt.attr('data-label', elt.html());
			label = elt.html();
		}
		if (state) {
			//$(id).addClass("ui-state-disabled");
			elt.attr("disabled", "true");
			if (label.indexOf("<i") > -1) elt.html(elt.html().replace(/<i.*<\/i>/i,'<i class="fa fa-circle-o-notch fa-spin" aria-hidden="true"></i>'));
			else elt.html('<i class="fa fa-circle-o-notch fa-spin" aria-hidden="true"></i> '+label);
			//$(id).html('processing...');
		} else {
			//$(id).removeClass("ui-state-disabled");
			elt.removeAttr("disabled");
			elt.html(label);
		}
	},   
	
	// open focus popup intermede
	mofPopupCustom: function(myData, cbJs) {
		console.log('mofPopupCustom');
		var myData = myData || {class: '', background: '', icon: 'icn_carte_montre', body: '', focus: '', footer: '<p class="button_serie uppercase"><a href="#" class="popup-close">Connecter !</a></p>'};
		if (!myData.close_url) myData.close_url = '#';
		if (!myData.class) myData.class = ''; // to add "overlay"
		if (!myData.background) myData.background = '';
		if (!myData.focus) myData.focus = '';
		if (myData.body == '') myData.body = '<h3 class="text_color_green">Profitez de toutes les fonctionnalités!</h3>'+
										'<h3 class="text_color_white uppercase">Connectez votre montre !</h3>'+
										'<p>Votre montre est en cours de livraison.<br>Dès que vous l\'aurez reçu, connectez-là pour profiter de toutes vos fonctionnalités.</p>';
		
		var popupHTML = '<div class="popup popup-black popup-custom tablet-fullscreen '+myData.class+'">'+
							'<a href="'+myData.close_url+'" class="link popup-close close-popup-icon no-animation" title="Close"><img src="img/menu/close.svg" width="40"></a>'+	
							'<div class="content-block">'+
								'<div class="card '+myData.background+'">'+
									'<div class="card-header no-border"><img src="img/icons/card/'+myData.icon+'.png" width="128" /></div>'+
									'<div class="card-content">'+
									'<div class="card-content-inner">'+
										myData.body+
									'</div>'+
									'<div class="focus '+((myData.focus == '')?'hidden':'')+'">'+
										myData.focus+
									'</div>'+
									'</div>'+
									'<div class="card-footer no-border '+myData.background+'">'+
									myData.footer
									'</div>'+
								'</div>'+
							'</div>'+
						'</div>';
						
		var parameters = {
			content: popupHTML,
			animate: false,
		};
						
		var dynamicPopup = fw7.popup.create(parameters);
		//fw7.popup.create(popupHTML, true, false);
		
		dynamicPopup.open();
		
		if (cbJs) cbJs();
	},
   
    /* ------------- */   
    /* FAST TEMPLATING
    /* ------------- */    
    
    FN: {}, // Precompiled templates (JavaScript functions)
    template_escape: {"\\": "\\\\", "\n": "\\n", "\r": "\\r", "'": "\\'"},
    render_escape:  {'&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;'},

    default_escape_fn: function(str, key) {
      return str == null ? '' : (str+'').replace(/[&\"<>]/g, function(char) {
        return fwk.render_escape[char];
      });
    },

    render: function(tmpl, data, escape_fn) {
      if (escape_fn === true) escape_fn = fwk.default_escape_fn;
      tmpl = tmpl || '';

      return (fwk.FN[tmpl] = fwk.FN[tmpl] || new Function("_", "e", "return '" +
        tmpl.replace(/[\\\n\r']/g, function(char) {
          return fwk.template_escape[char];
        }).replace(/{\s*([\w\.]+)\s*}/g, "' + (e?e(_.$1,'$1'):_.$1||(_.$1==null?'':_.$1)) + '") + "'")
      )(data, escape_fn);
    },
    
    /* ------------- */   
    /* ARRAY [] functions
    /* ------------- */ 
	// http://www.bennadel.com/blog/1796-javascript-array-methods-unshift-shift-push-and-pop.htm
    arrayFindElement: function(array, callback) {        
        for (var i = 0; i < array.length; i++)
            if (callback(array[i])) return array[i];
        return null;
    },
    
    arrayRemoveElement: function(array, callback) {
        for (var i = 0; i < array.length; i++)
            if (callback(array[i])) {
                array.splice(i, 1);
                break;
            }
        return array || [];
    },
	
	//To keep the first x items:
	keepFirstElements: function(array, total) {
		total = total || 10;
		if (array.length > total) return array.splice(total, array.length - total);
		else return array;
		// if (array.length > total) return array = array.slice(0, total);
	},
	
	// To keep the last ten items:
	keepLastElements: function(array, total) {
		total = total || 10;
		console.log('length='+array.length+' total='+total);
		if (array.length > total) array.splice(0, array.length - total);
		return array;
		// if (array.length > total) array = array.slice(-total);
	},

	// $$.each equivalent
	each: function(obj, callback) {
	  // Check it's iterable
	  // TODO: Should probably raise a value error here
	  if (typeof obj !== 'object') { return; }
	  // Don't bother continuing without a callback
	  if (!callback) { return; }
	  if (Array.isArray(obj) || obj instanceof Dom7) {
		// Array
		for (var i = 0; i < obj.length; i += 1) {
		  // If callback returns false
		  if (callback(i, obj[i]) === false) {
			// Break out of the loop
			return;
		  }
		}
	  } else {
		// Object
		for (var prop in obj) {
		  // Check the propertie belongs to the object
		  // not it's prototype
		  if (obj.hasOwnProperty(prop)) {
			// If the callback returns false
			if (callback(prop, obj[prop]) === false) {
			  // Break out of the loop;
			  return;
			}
		  }
		}
	  }
	},

   /* ------------- */   
   /* COLLECTIONS {} functions
   /* ------------- */ 
   // Merge second object into first
   collectionMerge: function (set1, set2){
      for (var key in set2){
        if (set2.hasOwnProperty(key))
          set1[key] = set2[key];
      }
      return set1;
   },
           
};
