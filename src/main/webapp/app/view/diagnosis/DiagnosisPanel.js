/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2014 The ARSnova Team
 *
 * ARSnova Mobile is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Mobile is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ARSnova Mobile.  If not, see <http://www.gnu.org/licenses/>.
 */
Ext.define('ARSnova.view.diagnosis.DiagnosisPanel', {
	extend: 'Ext.Container',

	requires: ['ARSnova.view.diagnosis.StatisticsPanel'],

	config: {
		fullscreen: true,
		title: Messages.DIAGNOSIS,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		}
	},

	/* toolbar items */
	toolbar: null,
	backButton: null,

	initialize: function () {
		this.callParent(arguments);
		
		this.on('painted', function() {
			// save last panel for backButton handler
			this.lastActivePanel = ARSnova.app.lastActivePanel;
		});

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.BACK,
			ui: 'back',
			scope: this,
			handler: function () {
				ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(this.lastActivePanel, {
					type: 'slide',
					direction: 'right',
					duration: 700
				});
			}
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.DIAGNOSIS,
			docked: 'top',
			ui: 'light',
			items: [this.backButton]
		});

		this.add([this.toolbar, {
			xtype: 'panel',
			cls: null,
			html: 	"<div class='icon-logo'>" +
					"<span class='icon-logo-radar'>r</span>" +
					"<span class='icon-logo-ars'>a</span>" +
					"<span class='icon-logo-nova'>n</span>" +
					"</div>",
			style: {marginTop: '35px', marginBottom: '35px'}
		},
		{
			xtype: 'formpanel',
			cls: 'standardForm topPadding',
			scrollable: null,

			defaults: {
				xtype: 'button',
				ui: 'normal',
				cls: 'forwardListButton'
			},

			items: [{
				text: Messages.STATISTIC,
				handler: function () {
					var me = ARSnova.app.mainTabPanel.tabPanel.diagnosisPanel;
					me.statisticsPanel = Ext.create('ARSnova.view.diagnosis.StatisticsPanel');
					me.animateActiveItem(me.statisticsPanel, 'slide');
				}
			}, {
				text: Messages.BROWSER_INFO,
				handler: function (b) {
					this.detect = Ext.create("ARSnova.BrowserDetect");
					var browserInfo = new String(
						"<b>Name:</b> " + this.detect.browser + "<br>" +
						"<b>Engine:</b> " + Ext.browser.engineName +
						" " + Ext.browser.engineVersion.version + "<br>" +
						"<b>UA:</b> " + Ext.browser.userAgent + "<br>"
					);
					Ext.Msg.alert('Browser', browserInfo, Ext.emptyFn);
				}
			}, {
				text: Messages.ARSNOVA_RELOAD,
				handler: function (b) {
					Ext.Msg.confirm(Messages.ARSNOVA_RELOAD, Messages.RELOAD_SURE, function (b) {
						if (b == "yes") {
							if (ARSnova.app.checkSessionLogin()) {
								ARSnova.app.getController('Sessions').logout();
							}
							ARSnova.app.getController('Auth').logout();
							window.location.reload(true);
						}
					});
				}
			}]
		},
		{
			xtype: 'panel',
			style: {
				marginTop: (Ext.os.is.Phone && Ext.os.is.iOS) ? '30px': '60px'
			},
			html: "<div class='gravure'><a href='http://www.thm.de/' class='thmlink' target='_blank'>A <span style='color:#699824;'>THM</span> Product</a></div>",
			cls: null
		}]);
	}
});
