/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/controllers/auth.js
 - Beschreibung: Auth-Controller
 - Version:      1.0, 01/05/12
 - Autor(en):    Christian Thomas Weber <christian.t.weber@gmail.com>
 +---------------------------------------------------------------------------+
 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or any later version.
 +---------------------------------------------------------------------------+
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 +--------------------------------------------------------------------------*/
Ext.define("ARSnova.controller.Auth", {
	extend: 'Ext.app.Controller',
	
	config: {
		routes: {
			'id/:sessionkey': 'qr',
			'id/:sessionkey/:role': 'qr',
			'auth/checkLogin': 'checkLogin'
		}
	},
	
	qr: function(sessionkey, role) {
		ARSnova.app.loggedIn = true;
		if (localStorage.getItem('login') === null) {
			localStorage.setItem('login', ARSnova.app.authModel.generateGuestName());
		}
		ARSnova.app.userRole = "lecturer" === role ? ARSnova.app.USER_ROLE_SPEAKER : ARSnova.app.USER_ROLE_STUDENT;
		localStorage.setItem('role', ARSnova.app.userRole);
		ARSnova.app.setWindowTitle();
		if (!ARSnova.app.loginMode) {
			ARSnova.app.loginMode = ARSnova.app.LOGIN_GUEST;
			localStorage.setItem('loginMode', ARSnova.app.loginMode);
		}
		localStorage.setItem('keyword', sessionkey);
		ARSnova.app.afterLogin();

		window.location = window.location.pathname + "#";
		ARSnova.app.getController('Sessions').login({
			keyword: sessionkey
		});
	},
	
	con: function(options) {
		ARSnova.loggedIn = true;
		ARSnova.loginMode = ARSnova.LOGIN_GUEST;
		ARSnova.userRole = ARSnova.USER_ROLE_STUDENT;

		if (localStorage.getItem('login') === null) {
			localStorage.setItem('login', ARSnova.models.Auth.generateGuestName());
		}
		localStorage.setItem('loginMode', ARSnova.loginMode);
		localStorage.setItem('role', ARSnova.userRole);
		localStorage.setItem('ARSnovaCon', true);
		localStorage.setItem('keyword', options.sessionid);
		
		ARSnova.afterLogin();

		window.location = window.location.pathname + "#";
		Ext.dispatch({controller:'sessions', action:'login', keyword: options.sessionid});
	},
	
	roleSelect: function(options){
		ARSnova.app.userRole = options.mode;
		localStorage.setItem('role', options.mode);
		
		ARSnova.app.setWindowTitle();
		ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.loginPanel, 'slide');
	},

	login: function(options) {
		ARSnova.app.loginMode = options.mode;
		localStorage.setItem('loginMode', options.mode);
		var type = "", role = "STUDENT";
		
		switch(options.mode){
			case ARSnova.app.LOGIN_GUEST:
				if (localStorage.getItem('login') === null) {
					localStorage.setItem('login', ARSnova.app.authModel.generateGuestName());
					type = "guest";
				} else {
					type = "guest&user=" + localStorage.getItem('login');
				}
				break;
			case ARSnova.app.LOGIN_THM:
				type = "cas";
				break;
			case ARSnova.app.LOGIN_TWITTER:
				type = "twitter";
				break;
			case ARSnova.app.LOGIN_FACEBOOK:
				type = "facebook";
				break;
			case ARSnova.app.LOGIN_GOOGLE:
				type = "google";
				break;
			case ARSnova.app.LOGIN_OPENID:
				Ext.Msg.alert("Hinweis", "OpenID ist noch nicht freigeschaltet.");
				return;
				break;
			default:
				Ext.Msg.alert("Hinweis", options.mode + " wurde nicht gefunden.");
				return;
				break;
		}
		if (type != "") {
			if (ARSnova.app.userRole == ARSnova.app.USER_ROLE_SPEAKER) {
				role = "SPEAKER";
			}
			return window.location = "auth/login?type=" + type + "&role=" + role;
		}

		/* actions to perform after login */
		ARSnova.app.afterLogin();
	},
	
	checkLogin: function(){
		Ext.Ajax.request({
			url: 'whoami.json',
			method: 'GET',
			success: function(response){
				var obj = Ext.decode(response.responseText);
				ARSnova.app.loggedIn = true;
				localStorage.setItem('login', obj.username);
				window.location = window.location.pathname + "#";
				ARSnova.app.checkPreviousLogin();
			}
		});
	},

    logout: function(){
		/* hide diagnosis panel */
		ARSnova.app.mainTabPanel.tabPanel.diagnosisPanel.tab.hide();
    	
    	/* stop task to save user is logged in */
    	taskManager.stop(ARSnova.app.loggedInTask);
    	
    	/* clear local storage */
    	localStorage.removeItem('sessions');
    	localStorage.removeItem('role');
    	localStorage.removeItem('loginMode');
    	
    	/* check if new version available */
    	var appCache = window.applicationCache;
    	if (appCache.status !== appCache.UNCACHED) {
    		appCache.update();
    	}
    	
    	ARSnova.app.userRole = "";
		ARSnova.app.setWindowTitle();
    	
		/* redirect user:
		 * a: to CAS if user is authorized 
		 * b: to rolePanel if user was guest
		 * */
    	if (ARSnova.app.loginMode == ARSnova.app.LOGIN_THM) {
    		/* update will be done when returning from CAS */
    		localStorage.removeItem('login');
    		window.location = "https://cas.thm.de/cas/logout?url=http://" + window.location.hostname + window.location.pathname + "#auth/doLogout";
    	} else {
    		Ext.Ajax.request({
    			url: 'auth/logout',
    			method: 'GET',
    			success: function(response){}
    		});
    		ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.rolePanel, {
    			type: 'slide',
    			direction: 'right'
    		});
    		/* update manifest cache of new version is loaded */
    		if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
				window.applicationCache.swapCache();
				Console.log('reload');
				window.location.reload();
			}
    	}
    }
});
