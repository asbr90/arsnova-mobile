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
Ext.define('ARSnova.view.speaker.InClass', {
	extend: 'Ext.Panel',

	requires: [
		'ARSnova.view.MultiBadgeButton',
		'ARSnova.view.SessionStatusButton'
	],

	config: {
		fullscreen: true,
		title: Messages.FEEDBACK,
		scrollable: 'vertical'
	},

	inClassItems: null,

	inClassActions: null,
	sessionStatusButton: null,
	createAdHocQuestionButton: null,

	/**
	 * task for speakers in a session
	 * count every x seconds the number of feedback questions
	 */
	countFeedbackQuestionsTask: {
		name: 'count feedback questions',
		run: function () {
			ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.countFeedbackQuestions();
		},
		interval: 15000
	},

	courseLearningProgressTask: {
		name: 'get the students learning progress',
		run: function () {
			ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.courseLearningProgress();
		},
		interval: 15000
	},

	initialize: function () {
		this.callParent(arguments);

		var comingSoon = function (component) {
			var comingSoonPanel = Ext.create('Ext.Panel', {
				top: -1000,
				html: "<div style='padding: 0.5em'>" + Messages.FEATURE_COMING_SOON + "</div>"
			});
			comingSoonPanel.showBy(component, 'tc-bc');
			Ext.defer(function () {
				comingSoonPanel.destroy();
			}, 2000);
		};

		var loggedInCls = '';
		if (ARSnova.app.loginMode == ARSnova.app.LOGIN_THM) {
			loggedInCls = 'thm';
		}

		this.sessionLogoutButton = Ext.create('Ext.Button', {
			text: Messages.SESSIONS,
			ui: 'back',
			cls: loggedInCls,
			handler: function () {
				ARSnova.app.getController('Sessions').logout();
			}
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Ext.util.Format.htmlEncode(localStorage.getItem("shortName")),
			cls: 'speakerTitleText',
			ui: 'light',
			docked: 'top',
			items: [
				this.sessionLogoutButton
			]
		});

		this.preparationQuestionButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			text: Messages.PREPARATION_QUESTIONS_LONG,
			cls: 'forwardListButton',
			controller: 'PreparationQuestions',
			action: 'listQuestions',
			handler: this.buttonClicked
		});

		this.lectureQuestionButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			text: Messages.LECTURE_QUESTIONS_LONG,
			cls: 'forwardListButton',
			controller: 'Questions',
			action: 'listQuestions',
			handler: this.buttonClicked
		});

		this.feedbackQuestionButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			ui: 'normal',
			text: Messages.QUESTIONS_FROM_STUDENTS,
			cls: 'forwardListButton',
			controller: 'Questions',
			action: 'listFeedbackQuestions',
			handler: this.buttonClicked
		});

		this.flashcardsButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			text: Messages.FLASHCARDS,
			cls: 'forwardListButton',
			controller: 'FlashcardQuestions',
			action: 'listQuestions',
			handler: this.buttonClicked
		});

		if (ARSnova.app.globalConfig.features.learningProgress) {
			this.courseLearningProgressButton = Ext.create('ARSnova.view.MultiBadgeButton', {
				text: Messages.COURSES_LEARNING_PROGRESS,
				cls: 'standardListButton'
			});
		}

		var buttons = [
			this.feedbackQuestionButton,
			this.lectureQuestionButton,
			this.preparationQuestionButton
		];
		if (ARSnova.app.globalConfig.features.learningProgress) {
			buttons.push(this.courseLearningProgressButton);
		}

		this.inClassItems = Ext.create('Ext.form.FormPanel', {
			scrollable: null,

			items: [{
				cls: 'gravure',
				style: 'padding:15px 0 0',
				html: Messages.SESSION_ID + ": " + ARSnova.app.formatSessionID(localStorage.getItem("keyword"))
			}, {
				xtype: 'formpanel',
				cls: 'standardForm topPadding',
				scrollable: null,
				items: buttons
			}]
		});

		this.sessionStatusButton = Ext.create('ARSnova.view.SessionStatusButton');

		this.createAdHocQuestionButton = Ext.create('ARSnova.view.MatrixButton', {
			text: Messages.AH_HOC_QUESTION,
			buttonConfig: 'icon',
			imageCls: 'icon-question thm-green',
			imageStyle: {
				'font-size': '70px',
				'margin-top': '4px'
			},
			controller: 'Questions',
			action: 'adHoc',
			handler: this.buttonClicked
		});

		this.deleteSessionButton = Ext.create('ARSnova.view.MatrixButton', {
			text: Messages.DELETE_SESSION,
			buttonConfig: 'icon',
			imageCls: 'icon-close thm-red',
			scope: this,
			handler: function () {
				var msg = Messages.ARE_YOU_SURE +
						"<br>" + Messages.DELETE_SESSION_NOTICE;
				Ext.Msg.confirm(Messages.DELETE_SESSION, msg, function (answer) {
					if (answer == 'yes') {
						ARSnova.app.showLoadMask(Messages.LOAD_MASK_SESSION_DELETE);
						ARSnova.app.sessionModel.destroy(localStorage.getItem('keyword'), {
							success: function () {
								ARSnova.app.removeVisitedSession(localStorage.getItem('sessionId'));
								ARSnova.app.mainTabPanel.tabPanel.on('activeitemchange', function () {
									ARSnova.app.mainTabPanel.tabPanel.homeTabPanel.mySessionsPanel.loadCreatedSessions();
								}, this, {single:true});
								ARSnova.app.getController('Sessions').logout();
							},
							failure: function (response) {
								console.log('server-side error delete session');
							}
						});
					}
				});
			}
		});

		this.inClassActions = Ext.create('Ext.Panel', {
			style: {marginTop: '20px'},
			layout: {
				type: 'hbox',
				pack: 'center'
			},

			items: [
				this.createAdHocQuestionButton,
				this.sessionStatusButton,
				this.deleteSessionButton
			]

		});

		this.add([this.toolbar, this.inClassItems, this.inClassActions]);

		this.on('destroy', this.destroyListeners);

		this.onBefore('painted', function () {
			this.updateBadges();
		});

		this.on('show', this.refreshListeners);
	},

	buttonClicked: function (button) {
		ARSnova.app.getController(button.config.controller)[button.config.action]();
	},

	/* will be called on session login */
	registerListeners: function () {
		var inClassPanel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel;
		ARSnova.app.taskManager.start(inClassPanel.countFeedbackQuestionsTask);
		if (ARSnova.app.globalConfig.features.learningProgress) {
			ARSnova.app.taskManager.start(inClassPanel.courseLearningProgressTask);
		}
	},

	/* will be called whenever panel is shown */
	refreshListeners: function () {
		// tasks should get run immediately
		this.countFeedbackQuestionsTask.taskRunTime = 0;
		if (ARSnova.app.globalConfig.features.learningProgress) {
			this.courseLearningProgressTask.taskRunTime = 0;
		}
	},

	/* will be called on session logout */
	destroyListeners: function () {
		var inClassPanel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel;
		ARSnova.app.taskManager.stop(inClassPanel.countFeedbackQuestionsTask);
		if (ARSnova.app.globalConfig.features.learningProgress) {
			ARSnova.app.taskManager.stop(inClassPanel.courseLearningProgressTask);
		}
	},

	updateBadges: function () {
		var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel;
		panel.updateAudienceQuestionBadge();
	},

	updateAudienceQuestionBadge: function () {
		var failureCallback = function () {
			console.log('server-side error');
		};

		ARSnova.app.questionModel.countLectureQuestions(localStorage.getItem("keyword"), {
			success: function (response) {
				var numQuestions = parseInt(response.responseText);
				ARSnova.app.questionModel.countLectureQuestionAnswers(localStorage.getItem("keyword"), {
					success: function (response) {
						var numAnswers = parseInt(response.responseText);

						var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel;

						panel.lectureQuestionButton.setBadge([
							{badgeText: numQuestions, badgeCls: "questionsBadgeIcon"},
							{badgeText: numAnswers, badgeCls: "answersBadgeIcon"}
						]);
					},
					failure: failureCallback
				});
			},
			failure: failureCallback
		});
		ARSnova.app.questionModel.countPreparationQuestions(localStorage.getItem("keyword"), {
			success: function (response) {
				var numQuestions = parseInt(response.responseText);
				ARSnova.app.questionModel.countPreparationQuestionAnswers(localStorage.getItem("keyword"), {
					success: function (response) {
						var numAnswers = parseInt(response.responseText);

						var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel;

						panel.preparationQuestionButton.setBadge([
							{badgeText: numQuestions, badgeCls: "questionsBadgeIcon"},
							{badgeText: numAnswers, badgeCls: "answersBadgeIcon"}
						]);
					},
					failure: failureCallback
				});
			},
			failure: failureCallback
		});
		ARSnova.app.questionModel.countFlashcards(localStorage.getItem("keyword"), {
			success: function (response) {
				var numQuestions = parseInt(response.responseText);
				var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel;
				panel.flashcardsButton.setBadge([{badgeText: numQuestions, badgeCls: "questionsBadgeIcon"}]);
			},
			failure: failureCallback
		});
	},

	countFeedbackQuestions: function () {
		ARSnova.app.questionModel.countFeedbackQuestions(localStorage.getItem("keyword"), {
			success: function (response) {
				var questionCount = Ext.decode(response.responseText);
				ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.tab.setBadgeText(questionCount.unread);

				var feedbackQButton = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.feedbackQuestionButton;
				feedbackQButton.setBadge([{
					badgeText: questionCount.total, badgeCls: "feedbackQuestionsBadgeIcon"
				}, {
					badgeText: questionCount.unread, badgeCls: "redbadgeicon"
				}]);
			},
			failure: function () {
				console.log('server-side error');
			}
		});
	},

	courseLearningProgress: function () {
		var me = this;
		ARSnova.app.sessionModel.getCourseLearningProgress(localStorage.getItem("keyword"), {
			success: function (response) {
				var p = Ext.decode(response.responseText);
				if (p >= 75) {
					me.courseLearningProgressButton.setBadge([{badgeText: p + "%", badgeCls: "greenbadgeicon"}]);
				} else if (p >= 25) {
					me.courseLearningProgressButton.setBadge([{badgeText: p + "%", badgeCls: "orangebadgeicon"}]);
				} else if (p === 0) {
						me.courseLearningProgressButton.setBadge([{badgeText: "…", badgeCls: "badgeicon"}]);
				} else {
					me.courseLearningProgressButton.setBadge([{badgeText: p + "%", badgeCls: "redbadgeicon"}]);
				}
			},
			failure: function () {
				me.courseLearningProgressButton.setBadge([{badgeText: ""}]);
			}
		});
	}
});
