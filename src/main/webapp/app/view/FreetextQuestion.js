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
Ext.define('ARSnova.view.FreetextQuestion', {
	extend: 'Ext.Panel',
	
	config: {
		viewOnly: false,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},
		previewController: Ext.create('ARSnova.utils.PreviewController')
	},
	
	constructor: function(args) {
		this.callParent(args);

		this.previewController = this.getPreviewController();
		
		var self = this;
		this.questionObj = args.questionObj;
		this.viewOnly = typeof args.viewOnly === "undefined" ? false : args.viewOnly;
		
		this.on('preparestatisticsbutton', function(button) {
			button.scope = this;
			button.setHandler(function() {
				var p = Ext.create('ARSnova.view.FreetextAnswerPanel', {
					question: self.questionObj,
					lastPanel: self
				});
				ARSnova.app.mainTabPanel.animateActiveItem(p, 'slide');
			});
		});
		
		this.answerSubject = Ext.create('Ext.form.Text', {
			name: "answerSubject",
			placeHolder: Messages.QUESTION_SUBJECT_PLACEHOLDER,
			label: Messages.QUESTION_SUBJECT,
			maxLength: 140
		});
		
		this.answerText = Ext.create('Ext.form.TextArea', {
			placeHolder	: Messages.QUESTION_TEXT_PLACEHOLDER,
			label: Messages.FREETEXT_ANSWER_TEXT,
			name: 'text',
			maxLength: 2500,
			maxRows: 7
		});

		this.questionTitle = Ext.create('Ext.Component', {
			cls: 'roundedBox',
			styleHtmlContent: true,
			html:
				'<p class="title">' + mathJaxConvert(this.questionObj.subject) + '<p/>' +
				'<p>' + mathJaxConvert(this.questionObj.text) + '</p>'
		});
		
		this.add([Ext.create('Ext.Panel', {
			items: [this.questionTitle, this.viewOnly ? {} : {
					xtype: 'formpanel',
					scrollable: null,
					submitOnAction: false,
					items: [{
						xtype: 'fieldset',
						items: [this.answerSubject, this.answerText]
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

		this.previewController.registerForPreview(this.answerSubject);
		this.previewController.registerForPreview(this.answerText);
		
		this.on('activate', function(){
			/*
			 * Bugfix, because panel is normally disabled (isDisabled == true),
			 * but is not rendered as 'disabled'
			 */
			if(this.isDisabled()) this.disableQuestion();
		});
	},
	
	saveHandler: function(button, event) {
		if (this.isEmptyAnswer()) {
			Ext.Msg.alert(Messages.NOTIFICATION, Messages.MISSING_INPUT);
			return;
		}
		
		Ext.Msg.confirm('', Messages.SUBMIT_ANSWER, function (button) {
			if (button === "yes") {
				this.storeAnswer();
			}
		}, this);
	},
	
	abstentionHandler: function(button, event) {
		Ext.Msg.confirm('', Messages.SUBMIT_ANSWER, function (button) {
			if (button === "yes") {
				this.storeAbstention();
			}
		}, this);
	},
	
	selectAbstentionAnswer: function() {},
	
	isEmptyAnswer: function() {
		return this.answerSubject.getValue().trim() === "" || this.answerText.getValue().trim() === "";
	},
	
	saveAnswer: function(answer) {
		var self = this;
		
		answer.saveAnswer({
			success: function() {
				var questionsArr = Ext.decode(localStorage.getItem('questionIds'));
				if (questionsArr.indexOf(self.questionObj._id) == -1) {
					questionsArr.push(self.questionObj._id);
				}
				localStorage.setItem('questionIds', Ext.encode(questionsArr));

				self.disableQuestion();
				ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.showNextUnanswered();
				ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.checkIfLastAnswer();
			},
			failure: function(response, opts) {
				console.log('server-side error');
				Ext.Msg.alert(Messages.NOTIFICATION, Messages.ANSWER_CREATION_ERROR);
				Ext.Msg.doComponentLayout();
			}
		});
	},
	
	storeAnswer: function () {
		var self = this;
		
		ARSnova.app.answerModel.getUserAnswer(this.questionObj._id, {
			empty: function() {
				var answer = Ext.create('ARSnova.model.Answer', {
					type	 		: "skill_question_answer",
					sessionId		: localStorage.getItem("sessionId"),
					questionId		: self.questionObj._id,
					answerSubject	: self.answerSubject.getValue(),
					answerText		: self.answerText.getValue(),
					timestamp		: Date.now(),
					user			: localStorage.getItem("login")
				});
				
				self.saveAnswer(answer);
			},
			success: function(response) {
				var theAnswer = Ext.decode(response.responseText);
				
				var answer = Ext.create('ARSnova.model.Answer', theAnswer);
				answer.set('answerSubject', self.answerSubject.getValue());
				answer.set('answerText', self.answerText.getValue());
				answer.set('timestamp', Date.now());
				answer.set('abstention', false);
				
				self.saveAnswer(answer);
			},
			failure: function(){
				console.log('server-side error');
			}
		});
	},
	
	storeAbstention: function() {
		var self = this;
		
		ARSnova.app.answerModel.getUserAnswer(this.questionObj._id, {
			empty: function() {
				var answer = Ext.create('ARSnova.model.Answer', {
					type	 		: "skill_question_answer",
					sessionId		: localStorage.getItem("sessionId"),
					questionId		: self.questionObj._id,
					timestamp		: Date.now(),
					user			: localStorage.getItem("login"),
					abstention		: true
				});
				
				self.saveAnswer(answer);
			},
			success: function(response) {
				var theAnswer = Ext.decode(response.responseText);
				
				var answer = Ext.create('ARSnova.model.Answer', theAnswer);
				answer.set('timestamp', Date.now());
				answer.set('abstention', true);
				
				self.saveAnswer(answer);
			},
			failure: function(){
				console.log('server-side error');
			}
		});
	},
	
	disableQuestion: function() {		
		this.setDisabled(true);
		this.mask(Ext.create('ARSnova.view.CustomMask'));
	},
	
	setAnswerText: function(subject, answer) {
		this.answerSubject.setValue(subject);
		this.answerText.setValue(answer);
	},
	
	doTypeset: function(parent) {
		if (typeof this.questionTitle.element !== "undefined") {
			MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.questionTitle.element.dom]);
		} else {
			// If the element has not been drawn yet, we need to retry later
			Ext.defer(Ext.bind(this.doTypeset, this), 100);
		}
	}
});