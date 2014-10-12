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
Ext.define('ARSnova.view.speaker.ShowcaseQuestionPanel', {
	extend: 'Ext.Carousel',

	requires: [
		'ARSnova.view.Question',
		'ARSnova.view.speaker.QuestionStatisticChart',
		'ARSnova.view.components.QuestionToolbar'
	],

	config: {
		fullscreen: true,
		title: Messages.QUESTIONS,
		iconCls: 'tabBarIconQuestion',

		controller: null,
		questionTitleLong: Messages.LECTURE_QUESTIONS_LONG,
		questionTitleShort: Messages.LECTURE_QUESTIONS
	},

	initialize: function () {
		this.callParent(arguments);

		this.on('activeitemchange', function (panel, newCard, oldCard) {
			this.toolbar.setTitleOptions(this.getQuestionTitleLong(), this.getQuestionTitleShort());
			this.toolbar.incrementQuestionCounter(panel.activeIndex);

			newCard.fireEvent('preparestatisticsbutton', this.toolbar.statisticsButton);
		}, this);

		this.toolbar = Ext.create('ARSnova.view.components.QuestionToolbar', {
			backButtonHandler: function (animation) {
			var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
			sTP.animateActiveItem(sTP.audienceQuestionPanel, animation);
		},
		statisticsButtonHandler: function () {
			var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
			sTP.questionStatisticChart = Ext.create('ARSnova.view.speaker.QuestionStatisticChart', {
				question: ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel._activeItem._activeItem.questionObj,
				lastPanel: this
			});
			ARSnova.app.mainTabPanel.animateActiveItem(sTP.questionStatisticChart, 'slide');
		}
	});

		this.add([this.toolbar]);

		this.on('activate', this.beforeActivate, this, null, 'before');
		this.on('activate', this.onActivate);
		this.on('add', function (panel, component, index) {
			component.doTypeset && component.doTypeset(panel);
		});
	},

	beforeActivate: function () {
		this.removeAll();
		this._indicator.show();
		this.toolbar.setTitle(Messages.QUESTION);
	},

	onActivate: function () {
		this.getAllSkillQuestions();
	},

	getAllSkillQuestions: function () {
		var hideIndicator = ARSnova.app.showLoadMask(Messages.LOAD_MASK_SEARCH_QUESTIONS);

		this.getController().getQuestions(localStorage.getItem("keyword"), {
			success: function (response) {
				var questions = Ext.decode(response.responseText);
				var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.showcaseQuestionPanel;

				panel.toolbar.resetQuestionCounter(questions.length);

				if (questions.length == 1) {
					panel._indicator.hide();
				}

				var questionsArr = [];
				var questionIds = [];
				questions.forEach(function (question) {
					questionsArr[question._id] = question;
					questionIds.push(question._id);
				});
				questionIds.forEach(function (questionId) {
					panel.addQuestion(questionsArr[questionId]);
				});

				// bugfix (workaround): after removing all items from carousel the active index
				// is set to -1. To fix that you have manually  set the activeItem on the first
				// question.
				panel.setActiveItem(0);
				panel.checkFirstQuestion();
				hideIndicator();
			},
			failure: function (response) {
				console.log('error');
				hideIndicator();
			}
		});
	},

	addQuestion: function (question) {
		var questionPanel;
		if (question.questionType === 'freetext') {
			questionPanel = Ext.create('ARSnova.view.FreetextQuestion', {
				questionObj: question,
				viewOnly: true
			});
		} else {
			questionPanel = Ext.create('ARSnova.view.Question', {
				questionObj: question,
				viewOnly: true
			});
		}
		this.add(questionPanel);
	},

	checkFirstQuestion: function () {
		var firstQuestionView = this.items.items[0];

		firstQuestionView.fireEvent('preparestatisticsbutton', this.toolbar.statisticsButton);
	},

	setLectureMode: function () {
		this.setQuestionTitleLong(Messages.LECTURE_QUESTIONS_LONG);
		this.setQuestionTitleShort(Messages.LECTURE_QUESTIONS);
	},

	setPreparationMode: function () {
		this.setQuestionTitleLong(Messages.PREPARATION_QUESTION_LONG);
		this.setQuestionTitleShort(Messages.PREPARATION_QUESTION_SHORT);
	}
});
