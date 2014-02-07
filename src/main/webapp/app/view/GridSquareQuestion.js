/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/view/FreetextQuestion.js
 - Beschreibung: Template für Freitext-Fragen.
 - Version:      1.0, 22/05/12
 - Autor(en):    Christoph Thelen <christoph.thelen@mni.thm.de>
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
Ext
		.define(
				'ARSnova.view.GridSquareQuestion',
				{
					extend : 'Ext.Panel',

					config : {
						viewOnly : false,
						scrollable : {
							direction : 'vertical',
							directionLock : true
						}
					},

					constructor: function(args) {
						this.callParent(args);
						
						var self = this;
						var questionobj = args.questionObj;
						this.questionObj = args.questionObj;
						this.viewOnly = typeof args.viewOnly === "undefined" ? false : args.viewOnly;
						var gridSquareID = Ext.util.Format.htmlEncode(this.questionObj.subject); 

						this.gridsquare = Ext.create('Ext.form.FieldSet', {
							   html: "<div align='center'><canvas width='80%' height='60%' id='"+gridSquareID+"'></canvas></div>",
							   listeners: {
						            painted: function() {
						            	/* currently just the md5 hashed string */
						            	var test = questionobj.image;
						            	
						            	var image = new Image();
								    	
								    	// Get base64
								    	image.src = questionobj.image;
								    	
						            	// Draw grid
								    	createGridSquare(gridSquareID, gridSquareID, parseInt((Fensterweite() * 80) / 100), parseInt((Fensterhoehe() * 60) / 100), questionobj.gridsize, questionobj.gridsize, 100);
								    	getGridSquare(gridSquareID).loadImage(image.src);
						            }
						        }
						});
						
						this.questionTitle = Ext.create('Ext.Component', {
							cls: 'roundedBox',
							html:
								'<p class="title">' + Ext.util.Format.htmlEncode(this.questionObj.subject) + '<p/>' +
								'<p>' + Ext.util.Format.htmlEncode(this.questionObj.text) + '</p>'
						});
						
						this.add([Ext.create('Ext.Panel', {
							items: [this.questionTitle, this.viewOnly ? {} : {
									xtype: 'formpanel',
									scrollable: null,
									submitOnAction: false,
									items: [{
										xtype: 'fieldset',
										items: [this.gridsquare]
									}, {
										xtype: 'container',
										layout: {
											type: 'hbox',
											align: 'stretch'
										},
										defaults: {
											style: {
												margin: '10px'
											}
										},
										items: [{
											flex: 1,
											xtype	: 'button',
											ui: 'confirm',
											cls: 'login-button noMargin',
											text: Messages.SAVE,
											handler: this.saveHandler,
											scope: this
										}, !!!this.questionObj.abstention ? { hidden: true } : {
											flex: 1,
											xtype: 'button',
											cls: 'login-button noMargin',
											text: Messages.ABSTENTION,
											handler: this.abstentionHandler,
											scope: this
										}]
									}]
								}
							]
						})]);
						
						this.on('activate', function(){
							/*
							 * Bugfix, because panel is normally disabled (isDisabled == true),
							 * but is not rendered as 'disabled'
							 */
							if(this.isDisabled()) this.disableQuestion();	
						});
					}
				});
