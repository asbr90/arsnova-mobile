/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/feedback/statisticPanel.js
 - Beschreibung: Panel zum Anzeigen der Feedback-Statistik.
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
feedbackChartColors = ['url(#v-3)', 'url(#v-2)', 'url(#v-1)', 'url(#v-4)'],

Ext.define('ARSnova.view.feedback.StatisticPanel', {
	extend: 'Ext.Panel',
	
	config: {
		title: 'StatisticPanel',
		style: 'background-color: black',
		layout: 'fit',
	},
	
	feedbackChart: null,
	
	/* toolbar items */
	toolbar: null,
	
	renewChartDataTask: {
		name: 'renew chart data at feedback panel',
		run: function(){
			ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel.statisticPanel.renewChartData();
		},
		interval: 10000 //10 seconds
	},
	
	initialize: function() {
		this.callParent(arguments);
		
		this.backButton = Ext.create('Ext.Button', {
			text	: Messages.HOME,
			ui		: 'back',
			hidden	: true,
			handler : function(){
				ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.userTabPanel, {
		    		type		: 'slide',
		    		direction	: 'right',
		    		duration	: 700,
		    		scope		: this,
		    		listeners: { animationend: function() { 
						this.hide();
		    		}, scope: this }
		    	});
			}
		});
		
		this.feedbackVoteButton = Ext.create('Ext.Button', {
			text	: Messages.FEEDBACK_VOTE,
			ui		: 'confirm',
			scope	: this,
			hidden	: true,
			handler	: function() {
				var fP = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel;
				fP.animateActiveItem(fP.votePanel, {
						type: 'slide',
						direction: 'down',
						duration: 700
					}
				);
			}
		});
		
		this.feedbackCounter = Ext.create('Ext.Container', {
			cls: "x-toolbar-title alignRight",
			html: '0/0',
			getText: function(){
				if(this.rendered)
					return this.element.dom.innerText;
				else
					return this.html;
			}
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: '0/0',
			docked: 'top',
			items: [
		        this.backButton,
		        {xtype: 'spacer'},
		        this.feedbackVoteButton,
		        {xtype: 'spacer'},
		        this.feedbackCounter
			]
		});
		
		this.feedbackChart = Ext.create('Ext.chart.Chart', {
		    theme: 'Demo',
			themeCls: 'column1',
		    store: Ext.create('Ext.data.JsonStore', {
		    	fields: ['name', 'displayName', 'value', 'percent'],
		    	data: [
				  {name: 'Kann folgen', 	 displayName: Messages.FEEDBACK_OKAY, value: 0, percent: 0.0},
		          {name: 'Bitte schneller',  displayName: Messages.FEEDBACK_GOOD,  value: 0, percent: 0.0},
		          {name: 'Zu schnell', 		 displayName: Messages.FEEDBACK_BAD, value: 0, percent: 0.0},
		          {name: 'Nicht mehr dabei', displayName: Messages.FEEDBACK_NONE, value: 0, percent: 0.0}
		        ]
		    }),

		    animate: {
		        easing: 'bounceOut',
		        duration: 750
		    },
		    
		    interactions: [{
		        type: 'reset'
		    }, {
		        type: 'panzoom'
		    }],
		    
		    gradients: [{
		    	'id': 'v-1',
		        'angle': 0,
		        stops: {
		            0:   { color: 'rgb(237, 96, 28)' },
		            100: { color: 'rgb(197, 56, 0)' }
		        }
		    },
		    {
		        'id': 'v-2',
		        'angle': 0,
		        stops: {
		            0:   { color: 'rgb(254, 201, 41)'},
		            100: { color: 'rgb(214, 161, 0)' }
		        }
		    },
		    {
		        'id': 'v-3',
		        'angle': 0,
		        stops: {
		            0:   { color: 'rgb(122, 184, 68)' },
		            100: { color: 'rgb(82, 144, 28)' }
		        }
		    },
		    {
		        'id': 'v-4',
		        'angle': 0,
		        stops: {
		            0:   { color: 'rgb(235, 235, 235)' },
		            100: { color: 'rgb(195,195,195)' }
		        }
		    }],
		    
		    axes: [{
		        type: 'Numeric',
		        position: 'left',
		        fields: ['value'],
		        minimum: 0,
		        label: {
		            renderer: function(v) {
		                return v.toFixed(0);
		            }
		        }
		    },
		    {
		        type: 'Category',
		        position: 'bottom',
		        fields: ['displayName'],
		        label: {
		        	rotate: {
		        		degrees: 315
		        	}
		        }
		    }],
		    series: [{
		        type: 'column',
		        axis: 'left',
		        highlight: true,
		        renderer: function(sprite, storeItem, barAttr, i, store) {
		            barAttr.fill = feedbackChartColors[i % feedbackChartColors.length];
		            return barAttr;
		        },
		        label: {
		          field: ['percent'],
		          renderer: function(v) {
		        	  return Math.round(v * 100) + "%";
		          }
		        },
		        xField: 'name',
		        yField: 'value'
		    }]
		});
		
		this.add([this.toolbar, this.feedbackChart]);
	},
	
	/**
	 * this function does three things
	 * 1. Adapt the chart data
	 * 2. Adapt the feedback-badge in tab bar
	 * 3. Adapt the feedback icon in tab bar depending on average of feedback
	 */
	renewChartData: function() {
		ARSnova.app.feedbackModel.getSessionFeedback(localStorage.getItem("keyword"), {
			success: function(response){
				var panel = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel.statisticPanel;
				var chart = panel.feedbackChart;
				var store = chart.getStore();
				
				var values = Ext.decode(response.responseText).values;
				/* Swap values for "can follow" and "faster, please" feedback
				 * TODO: improve implementation, this is a quick hack for MoodleMoot 2013 */
				tmpValue = values[0];
				values[0] = values[1];
				values[1] = tmpValue;
				if (!Ext.isArray(values) || values.length != store.getCount()) return;
				
				var initialMaximum = 10;
				var maximum = Math.max.apply(null, values.concat(initialMaximum));

				// Set chart data
				store.each(function(record, index) {
					record.data.value = values[index];
				});
				// Calculate percentages
				var sum = store.sum('value');
				store.each(function(record) {
					record.data.percent = sum > 0 ? (record.data.value / sum) : 0.0;
				});
				chart._axes.items[0]._maximum = maximum;
				chart.redraw();
				
				//update feedback-badge in tab bar 
				ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel.tab.setBadgeText(sum);
				
				//update feedback counter
				var counterEl = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel.statisticPanel.feedbackCounter;
				var title = counterEl.config.getText().split("/");
				title[0] = sum;
				title = title.join("/");
				counterEl.setHtml(title);
				
				//change the feedback tab bar icon
				var tab = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel.tab;
				ARSnova.app.feedbackModel.getAverageSessionFeedback(localStorage.getItem("keyword"), {
					success: function(response) {
						var avg = parseInt(response.responseText);
						switch (avg){
							case 0:
								tab.setIconCls("feedbackMedium");
								break;
							case 1:
								tab.setIconCls("feedbackGood");
								break;
							case 2:
								tab.setIconCls("feedbackBad");
								break;
							case 3:
								tab.setIconCls("feedbackNone");
								break;	
							default:
								tab.setIconCls("feedbackARSnova");
								break;
						}
					},
					failure: function() {
						tab.setIconCls("feedbackARSnova");
					}
				});
			},
			failure: function() {
				console.log('server-side error feedbackModel.getSessionFeedback');
			}
		});
	},
	
	checkVoteButton: function(){
		if (!ARSnova.app.isSessionOwner) this.feedbackVoteButton.show();
		else this.feedbackVoteButton.hide();
	},
	
	checkTitle: function(){
		var title = "";
		if (ARSnova.app.isSessionOwner) title = localStorage.getItem('shortName');
		this.toolbar.setTitle(title);
	}
});
