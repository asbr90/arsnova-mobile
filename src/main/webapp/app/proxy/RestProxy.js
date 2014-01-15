/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/proxy/RestProxy.js
 - Beschreibung: Proxy für die Verbindung zur CouchDB
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
Ext.define('ARSnova.proxy.RestProxy', {
	extend: 'Ext.data.proxy.Rest',
	alias: 'proxy.restProxy',
	
	requires: ['ARSnova.proxy.ARSJax'],
	
	config: {
		url : '/couchdb/arsnova',
		
		appendId: true,
		noCache: false
	},
	
	arsjax: null,
	
	constructor: function() {
		this.callParent(arguments);
		
		this.arsjax = Ext.create('ARSnova.proxy.ARSJax');
		this.arsjax.on("arsnova/arsjax/status/401", function() {
			// I know it's bad, but I was not able to relay this event to other objects that would be better
			// places to display an error message. Feel free to refactor this. ;-)
			Ext.Msg.confirm(Messages.BROWSER_SESSION_EXPIRED, Messages.BROWSER_SESSION_EXPIRED_MSG, function(button) {
				if (button == 'yes') {
					window.location.reload();
				}
			});
		}, this, { single: true });
	},
	
	/**
	 * Search for a session with specified keyword
	 * @param keyword of session
	 * @param object with success- and failure-callbacks
	 * @return session-object, if found
	 * @return false, if nothing found 
	 */
	checkSessionLogin: function(keyword, callbacks){
		this.arsjax.request({
			url: "session/" + keyword,
			success: callbacks.success,
			failure: function(response) {
				if (response.status === 404) {
					callbacks.notFound.apply(this, arguments);
				} else if (response.status = 403) {
					callbacks.forbidden.apply(this, arguments);
				} else {
					callbacks.failure.apply(this, arguments);
				}
			}
		});
	},
	
	/**
	 * Get the sessions where user is creator
	 * @param login from user
	 * @param object with success-, failure-, unauthenticated and empty-callbacks
	 * @return session-objects, if found
	 * @return false, if nothing found 
	 */
	getMySessions: function(callbacks, sortby) {
		this.arsjax.request({
			url: "session/",
			method: "GET",
			params: {
				ownedonly: true,
				sortby: sortby
			},
			
			success: callbacks.success,
			204: callbacks.empty,
			
			401: callbacks.unauthenticated,
			404: callbacks.empty,
			failure: callbacks.failure
		});
	},
	
	/**
	 * Get the sessions where user is visitor
	 * @param login from user
	 * @param object with success-, unauthenticated- and failure-callbacks
	 * @return session-objects, if found
	 * @return false, if nothing found 
	 */
	getMyVisitedSessions: function(callbacks, sortby){
		this.arsjax.request({
			url: "session/?visitedonly=true",
			method: "GET",
			params: {
				sortby: sortby
			},
			success: function(response) {
				if (response.status === 204) {
					callbacks.success.call(this, []);
				} else {
					callbacks.success.call(this, Ext.decode(response.responseText));
				}
			},
			failure: function(response) {
				if (response.status === 401) {
					callbacks.unauthenticated.apply(this, arguments);
				} else {
					callbacks.failure.apply(this, arguments);
				}
			}
		});
	},
	
	/**
	 * Get the courses where user is enlisted in
	 * @param sortby sortby
	 * @param callbacks with success-, failure-, unauthenticated and empty-callbacks
	 * @return session-objects, if found
	 * @return false, if nothing found
	 */
	getMyCourses: function(callbacks, sortby) {
		this.arsjax.request({
			url: "mycourses",
			method: "GET",
			params: {
				sortby: sortby
			},
			success: callbacks.success,
			failure: function(response) {
				if (response.status === 401) {
					callbacks.unauthenticated.apply(this, arguments);
				} else if (response.status === 404) {
					callbacks.empty.apply(this, arguments);
				} else {
					callbacks.failure.apply(this, arguments);
				}
			}
		});
	},

	getQuestionById: function(id, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + id,
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	getSkillQuestion: function(id, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + id,
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	/**
	 * Get lecture questions for this session, sorted by subject and text
	 * @param sessionKeyword
	 * @param object with success-, failure- and empty-callbacks
	 */
	getLectureQuestions: function(sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/?lecturequestionsonly=true&sessionkey=" + encodeURIComponent(sessionKeyword),
			success: callbacks.success,
			204: callbacks.empty,
			
			failure: callbacks.failure
		});
	},
	
	getFlashcards: function(sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/?sessionkey=" + encodeURIComponent(sessionKeyword) + "&flashcardsonly=true",
			success: callbacks.success,
			204: callbacks.empty,
			
			failure: callbacks.failure
		});
	},
	
	getPreparationQuestions: function(sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/?sessionkey=" + encodeURIComponent(sessionKeyword) + "&preparationquestionsonly=true",
			success: callbacks.success,
			204: callbacks.empty,
			
			failure: callbacks.failure
		});
	},
	
	countSkillQuestions: function(sessionKeyword, callbacks){
		this.arsjax.request({
			url: "session/" + sessionKeyword + "/skillquestioncount",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	countPreparationQuestions: function(sessionKeyword, callbacks){
		this.arsjax.request({
			url: "lecturerquestion/count?preparationquestionsonly=true&sessionkey=" + encodeURIComponent(sessionKeyword),
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	countFlashcards: function(sessionKeyword, callbacks){
		this.arsjax.request({
			url: "lecturerquestion/count?flashcardsonly=true&sessionkey=" + encodeURIComponent(sessionKeyword),
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	countLectureQuestions: function(sessionKeyword, callbacks){
		this.arsjax.request({
			url: "lecturerquestion/count?lecturequestionsonly=true&sessionkey=" + encodeURIComponent(sessionKeyword),
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	countTotalAnswers: function(sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "session/" + sessionKeyword + "/answercount",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	countPreparationQuestionAnswers: function(sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/answercount?preparationquestionsonly=true&sessionkey=" + encodeURIComponent(sessionKeyword),
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	countLectureQuestionAnswers: function(sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/answercount?lecturequestionsonly=true&sessionkey=" + encodeURIComponent(sessionKeyword),
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	/**
	 * Get interposed questions for this session
	 * @param sessionKeyword
	 * @param object with success- and failure-callbacks
	 * @return session-objects, if found
	 * @return false, if nothing found 
	 */
	getInterposedQuestions: function(sessionKeyword, callbacks){
		this.arsjax.request({
			url: "session/" + sessionKeyword + "/interposed",
			method: "GET",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	getInterposedQuestion: function(question, callbacks) {
		this.arsjax.request({
			url: "session/" + question.get('sessionId') + "/interposed/" + question.data._id,
			method: "GET",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	saveInterposedQuestion: function(subject, text, sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "session/" + sessionKeyword + "/interposed",
			method: "POST",
			jsonData: { subject: subject, text: text, sessionId: sessionKeyword },
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	deleteInterposedQuestion: function(question, callbacks) {
		this.arsjax.request({
			url: "session/" + question.sessionId + "/interposed/" + question._id,
			method: "DELETE",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	deleteAllInterposedQuestions: function(sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "session/" + encodeURIComponent(sessionKeyword) + "/interposed/",
			method: "DELETE",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	countFeedbackQuestions: function(sessionKeyword, callbacks){
		this.arsjax.request({
			url: "session/" + sessionKeyword + "/interposedreadingcount",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	saveSkillQuestion: function(question, callbacks) {
		this.arsjax.request({
			url: "session/" + question.get('sessionKeyword') + "/question",
			method: "POST",
			jsonData: question.raw,
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	updateSkillQuestion: function(question, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + question.get('_id'),
			method: "PUT",
			jsonData: question.raw,
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	publishSkillQuestion: function(question, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + question.get('_id') + "/publish",
			method: "POST",
			jsonData: question.raw,
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	publishSkillQuestionStatistics: function(question, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + question.get('_id') + "/publishstatistics",
			method: "POST",
			jsonData: question.raw,
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	publishCorrectSkillQuestionAnswer: function(question, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + question.get('_id') + "/publishcorrectanswer",
			method: "POST",
			jsonData: question.raw,
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	createSession: function(session, callbacks) {
		this.arsjax.request({
			url: "session/",
			method: "POST",
			jsonData: {
				"name": session.get("name"),
				"shortName": session.get("shortName"),
				"courseId":  session.get("courseId") ? session.get("courseId") : null,
				"courseType": session.get("courseType") ? session.get("courseType") : null
			},
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	delQuestion: function(queObj, callbacks){
		this.arsjax.request({
			url: "lecturerquestion/" + queObj._id,
			method: "DELETE",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	delAllQuestions: function(sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/?sessionkey=" + sessionKeyword,
			method: "DELETE",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	delAllPreparationQuestions: function(sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/?sessionkey=" + sessionKeyword + "&preparationquestionsonly=true",
			method: "DELETE",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	delAllFlashcards: function(sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/?sessionkey=" + sessionKeyword + "&flashcardsonly=true",
			method: "DELETE",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	delAllLectureQuestions: function(sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/?sessionkey=" + sessionKeyword + "&lecturequestionsonly=true",
			method: "DELETE",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	delAnswers: function(questionId, callbacks){
		this.arsjax.request({
			url: "lecturerquestion/" + questionId + "/answer/",
			method: "DELETE",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	delSession: function(sessionKeyword, callbacks){
		this.arsjax.request({
			url: "session/" + sessionKeyword,
			method: "DELETE",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	getAnswerByUserAndSession: function(sessionKeyword, callbacks){
		this.arsjax.request({
			url: "session/" + sessionKeyword + "/myanswers",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	getUnansweredSkillQuestions: function(sessionKeyword, callbacks){
		this.getUnansweredQuestions(sessionKeyword, "", callbacks);
	},

	getUnansweredLectureQuestions: function(sessionKeyword, callbacks){
		this.getUnansweredQuestions(sessionKeyword, "&lecturequestionsonly=true", callbacks);
	},

	getUnansweredPreparationQuestions: function(sessionKeyword, callbacks){
		this.getUnansweredQuestions(sessionKeyword, "&preparationquestionsonly=true", callbacks);
	},

	getUnansweredQuestions: function(sessionKeyword, query, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/unanswered?sessionkey=" + sessionKeyword + query,
			204: function() {
				callbacks.success.call(this, []);
			},
			success: function(response) {
				callbacks.success.call(this, Ext.decode(response.responseText));
			},
			failure: callbacks.failure
		});
	},

	getUserAnswer: function(questionId, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + questionId + "/myanswer",
			success: function(response) {
				if (response.status === 204) {
					callbacks.empty.apply(this, arguments);
				} else {
					callbacks.success.apply(this, arguments);
				}
			},
			failure: callbacks.failure
		});
	},
	
	saveAnswer: function(answer, callbacks) {
		var data = answer.getData();
		// drop sencha touch internal record id
		delete data.id;
		
		this.arsjax.request({
			url: "lecturerquestion/" + answer.get('questionId') + "/answer/",
			method: "POST",
			jsonData: data,
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	updateAnswer: function(answer, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + answer.get('questionId') + "/answer/" + answer.get('_id'),
			method: "PUT",
			jsonData: answer.raw,
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	deleteAnswer: function(questionId, answerId, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + questionId + "/answer/" + answerId,
			method: "DELETE",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	countAnswers: function(sessionKeyword, questionId, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + questionId + "/answer/",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	countAnswersByQuestion: function(sessionKeyword, questionId, callbacks) {
		this.arsjax.request({
			url: "session/" + sessionKeyword + "/question/" + questionId + "/answercount",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},

	getAnsweredFreetextQuestions: function(sessionKeyword, questionId, callbacks) {
		this.arsjax.request({
			url: "lecturerquestion/" + questionId + "/freetextanswer/",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	getUserFeedback: function(sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "session/" + sessionKeyword + "/myfeedback",
			success: callbacks.success,
			failure: function(response) {
				if (response.status === 404) {
					callbacks.empty.apply(this, arguments);
				} else {
					callbacks.failure.apply(this, arguments);
				}
			}
		});
	},
	
	postFeedback: function(sessionKeyword, feedbackValue, callbacks) {
		this.arsjax.request({
			url: "session/" + sessionKeyword + "/feedback",
			method: "POST",
			jsonData: feedbackValue + "", // A string ensures that even zero gets submitted to the server!
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	isActive: function(sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "session/" + sessionKeyword,
			success: function(response) {
				var session = Ext.decode(response.responseText);
				callbacks.success(session.active);
			},
			failure: function(response) {
				if (response.status === 403) {
					callbacks.success(false);
				} else {
					callbacks.failure.apply(this, arguments);
				}
			}
		});
	},
	
	lock: function(sessionKeyword, theLock, callbacks) {
		this.arsjax.request({
			url: "session/" + sessionKeyword + "/lock?lock=" + !!theLock,
			method: "POST",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	/**
	 * save every minute that i'm online
	 */
	loggedInTask: function() {
		this.arsjax.request({
			url: "session/" + localStorage.getItem("keyword") + "/online",
			method: "POST",
			failure: function() {
				console.log('server-side error loggedIn.save');
			}
		});
	},
	
	/**
	 * if user is session owner update that owner of session is logged in
	 * every 3 minutes
	 */
	updateSessionActivityTask: function() {
		this.loggedInTask();
	},
	
	countActiveUsersBySession: function(sessionKeyword, callbacks) {
		this.arsjax.request({
			url: "session/" + sessionKeyword + "/activeusercount",
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	getStatistics: function(callbacks) {
		this.arsjax.request({
			url: "statistics/",
			method: 'GET',
	
			success: callbacks.success,
			failure: callbacks.failure
		});
	},
	
	getSkillQuestionsForUser: function(sessionKeyword, callbacks){
		this.arsjax.request({
			url: "session/" + sessionKeyword + "/skillquestions",
			success: function(response) {
				var json = response.responseText || "[]";
				callbacks.success(Ext.decode(json));
			},
			failure: callbacks.failure
		});
	},
	
	getLectureQuestionsForUser: function(sessionKeyword, callbacks){
		this.arsjax.request({
			url: "lecturerquestion/",
			method: "GET",
			params: {
				sessionkey: sessionKeyword,
				lecturequestionsonly: true
			},
			success: function(response) {
				var json = response.responseText || "[]";
				callbacks.success(Ext.decode(json));
			},
			failure: callbacks.failure
		});
	},
	
	getPreparationQuestionsForUser: function(sessionKeyword, callbacks){
		this.arsjax.request({
			url: "lecturerquestion/",
			method: "GET",
			params: {
				sessionkey: sessionKeyword,
				preparationquestionsonly: true
			},
			success: function(response) {
				var json = response.responseText || "[]";
				callbacks.success(Ext.decode(json));
			},
			failure: callbacks.failure
		});
	}
});