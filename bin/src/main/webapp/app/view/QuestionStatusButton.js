/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/view/QuestionStatusButton.js
 - Beschreibung: Button zum Starten/Stoppen einer Frage.
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
Ext.define('ARSnova.view.QuestionStatusButton', {
	extend: 'Ext.Panel',
	
	config: {
		cls	: 'threeButtons left',
		wording: {
			stop: Messages.STOP_QUESTION,
			release: Messages.RELEASE_QUESTION,
			confirm: Messages.CONFIRM_CLOSE_QUESTION,
			confirmMessage: Messages.CONFIRM_CLOSE_QUESTION_MESSAGE
		}
	},
	
	handler: null,
	isOpen: false,
	
	questionObj: null,
	
	questionIsOpenButton: null,
	questionIsClosedButton: null,
	
	constructor: function(args) {
		this.callParent(arguments);
		
		this.questionObj = args.questionObj;
		
		this.questionIsClosedButton = Ext.create('Ext.Button', {
			cls		: 'closedSession',
			scope	: this,
			handler	: function() {
				this.changeStatus();
			}
		});
		
		this.questionIsClosedText = Ext.create('Ext.Panel', {
			cls	: 'centerTextSmall',
			html: this.getWording().release
		});
		
		this.questionIsOpenButton = Ext.create('Ext.Button', {
			cls		: 'openSession',
			scope	: this,
			handler	: function() {
				this.changeStatus();
			}
		});
		
		this.questionIsOpenText = Ext.create('Ext.Panel', {
			cls	: 'centerTextSmall',
			html: this.getWording().stop
		});

		this.add([this.questionIsClosedButton, this.questionIsClosedText, this.questionIsOpenButton, this.questionIsOpenText]);

		if (this.questionObj && this.questionObj.active == 1) {
			this.isOpen = true;
			this.questionIsClosedButton.hide();
			this.questionIsClosedText.hide();
		} else {
			this.isOpen = false;
			this.questionIsOpenButton.hide();
			this.questionIsOpenText.hide();
		}
	},
	
	changeStatus: function(){
		var id = this.questionObj._id;
		
		if (this.isOpen) {
			Ext.Msg.confirm(this.getWording().confirm, this.getWording().confirmMessage, function (buttonId) {
				if (buttonId != "no") {
					/* close this question */
					ARSnova.app.getController('Questions').setActive({
						questionId	: id, 
						active		: 0,
						callback	: this.questionClosedSuccessfully
					});
				}
			}, this);
		} else {
			/* open this question */
			ARSnova.app.getController('Questions').setActive({
				questionId	: id,
				active		: 1,
				callback	: this.questionOpenedSuccessfully
			});
		}
	},
	
	checkInitialStatus: function(){
		if(this.isRendered) return;
		
		if(localStorage.getItem('active') == 1){
			this.isOpen = true;
		} else {
			this.isOpen = false;
		}
		this.isRendered = true;
	},
	
	questionClosedSuccessfully: function(){
		this.isOpen = false;
		this.questionIsClosedButton.show();
		this.questionIsClosedText.show();
		this.questionIsOpenButton.hide();
		this.questionIsOpenText.hide();
	},
	
	questionOpenedSuccessfully: function(){
		this.isOpen = true;
		this.questionIsOpenButton.show();
		this.questionIsOpenText.show();
		this.questionIsClosedButton.hide();
		this.questionIsClosedText.hide();
	}
}); 