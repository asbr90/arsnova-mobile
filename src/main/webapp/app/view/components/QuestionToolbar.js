/*--------------------------------------------------------------------------+
This file is part of ARSnova.
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
Ext.define('ARSnova.view.components.QuestionToolbar', {
	extend: 'Ext.Toolbar',

	config: {
		title: Messages.QUESTION,
		docked: 'top',
		ui: 'light',

		firstCounter: 0,
		secondCounter: 0,
		statisticsEnabled: true,
		backButtonHandler: Ext.emptyFn,
		statisticsButtonHandler: Ext.emptyFn
	},

	constructor: function() {
		this.callParent(arguments);

		this.backButton = Ext.create('Ext.Button', {
			ui		: 'back',
			text	: Messages.BACK,
			scope	: this,
			handler	: function() {
				var animation = {
					type: 'slide',
					direction: 'right',
					duration: 700
				};
				var callback = this.getBackButtonHandler();
				callback(animation);
			}
		});

		this.questionCounter = Ext.create('Ext.Component', {
			cls: "x-toolbar-title alignRight counterText",
			html: '0/0'
		});

		this.statisticsButton = Ext.create('Ext.Button', {
			text: ' ',
			cls: 'statisticIconSmall',
			handler: this.getStatisticsButtonHandler(),
			hidden: !this.getStatisticsEnabled()
		});

		this.add([
			this.backButton,
			{ xtype: 'spacer' },
			this.questionCounter,
			this.statisticsButton
		]);
	},

	setQuestionTitle: function(question) {
		var label = Ext.bind(function(longv, shortv) {
			var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
			return (screenWidth > 320 || this.backButton.isHidden()) ? longv : shortv;
		}, this);

		var title = '';
    var questionType = question ? question.questionType : "";

		if (questionType === 'abcd') {
			title = label(Messages.QUESTION_SINGLE_CHOICE, Messages.QUESTION_SINGLE_CHOICE_SHORT);
		} else if (questionType === 'freetext') {
			title = label(Messages.QUESTION_FREETEXT, Messages.QUESTION_FREETEXT_SHORT);
		} else if (questionType === 'mc') {
			title = label(Messages.QUESTION_MC, Messages.QUESTION_MC_SHORT);
		} else if (questionType === 'vote') {
			title = label(Messages.QUESTION_RATING, Messages.QUESTION_RATING_SHORT);
		} else if (questionType === 'yesno') {
			title = label(Messages.QUESTION_YESNO, Messages.QUESTION_YESNO);
		} else if (questionType === 'school') {
			title = label(Messages.QUESTION_GRADE, Messages.QUESTION_GRADE_SHORT);
		} else if (questionType === 'flashcard') {
			title = label(Messages.FLASHCARD, Messages.FLASHCARD);
		} else if(questionType == 'grid') {
			title =  label(Messages.QUESTION_GRID, Messages.GRID);
		}

		this.setTitle(title);
		return title;
	},

	incrementQuestionCounter: function(activeIndex) {
		this.setFirstCounterElement(activeIndex + 1);
	},

	resetQuestionCounter: function(maxValue) {
		this.setQuestionCounter(1, maxValue);
	},

	setQuestionCounter: function(min, max) {
		this.setFirstCounter(min);
		this.setSecondCounter(max);
		this.updateQuestionCounter();
	},

	setFirstCounterElement: function(min) {
		this.setFirstCounter(min);
		this.updateQuestionCounter();
	},

	setSecondCounterElement: function(max) {
		this.setSecondCounter(max);
		this.updateQuestionCounter();
	},

	updateQuestionCounter: function() {
		var counter = this.questionCounter.getHtml().split("/");
		counter[0] = this.getFirstCounter();
		counter[1] = this.getSecondCounter();
		this.questionCounter.setHtml(counter.join("/"));
	},

  checkStatistics: function(question, isDisabled) {
    if (typeof question !== 'undefined' && !!question.showStatistic && isDisabled) {
      this.statisticsButton.show();
    } else {
      this.statisticsButton.hide();
    }
  }
});
