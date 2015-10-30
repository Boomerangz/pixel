//Эти значения подставляем на сервере
var currentSessionID_AdvertNetwork = '{0}';
var publisherPageID_AdvertNetwork = '{1}'; //Это значение будет само передано из тега скрипт, самим паблишером. На сервере его надо будет забрать из гета и воткнуть сюда.

//Индивидуальные опциональные параметры. Будем дописывать код на сервере при необходимости.
var currentURL_AdvertNetwork;
var contentKeywords_AdvertNetwork;
var contentTitle_AdvertNetwork;
var searchQuery_AdvertNetwork;
var extraData_AdvertNetwork;
var pageLanguage_AdvertNetwork;

//Счётчик активности
var focusTimer_AdvertNetwork = 0;
var userFocusTimer_AdvertNetwork = 0; //Для отправки

//Флаг, показывающий потенциальному рекламному блоку наличие трекинга
var hasTracking_AdvertNetwork = true;

//Ссылка на скрипт, для его удаления.
var scipt_AdvertNetwork;

//Утилс
var utils_AdvertNetwork;

// Create Base64 Object
var Base64_AdvertNetwork={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64_AdvertNetwork._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64_AdvertNetwork._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}

//Запуск таймера для подсчёта активности
TimerUtil_AdvertNetwork(0);

if (document.body) {
	try {
		startTracking_AdvertNetwork();
	} catch(e){}
} else {
	document.addEventListener("DOMContentLoaded", startTracking_AdvertNetwork);
}

//Трекинг
function startTracking_AdvertNetwork() {
	
	var timeDiap = [10000, 20000, 30000, 40000, 50000, 60000, 90000, 120000, 150000, 300000, 900000, 1800000, 3600000, 5400000, 7200000]; //Промежутки времени для отправки идентификатора сессии. Позволит примерно понимать длительность пребывания на сайте.
	
	utils_AdvertNetwork = new AdvertStatUtils();

	var advertStatCookie = utils_AdvertNetwork.getCookie("userID_AdvertNetwork"); //Получаем идентифицирующие куки с сайта паблишера
	var timeDiapIndex = 0;
	var that = this;
	
	try {
		

		/*
		 *
		 *	Достаём данные для таргетинга
		 *  BORJIM PIDOR
		 *
		 */
		//URL
		currentURL_AdvertNetwork = window.location.toString();
		//Кейворды
		var keywords = document.getElementsByName("keywords");
		if (keywords.length > 0) {
			contentKeywords_AdvertNetwork = keywords[0].content;
		}
		//Тайтл
		contentTitle_AdvertNetwork = document.title;
		//Язык
		pageLanguage_AdvertNetwork = utils_AdvertNetwork.getPageLanguage();
		/*
		 * Остальное
		 *
		searchQuery_AdvertNetwork = ...; //При неожиданно возникшей возможности получения поисковый строки её можно будет поместить сюда. Или можно сюда положить поисковы запрос пользователя на самом сайте паблишера.
		extraData_AdvertNetwork = ...; //Сюда можно поместить особенные данные, приспособленные к конкретному сайту. Например, с колёс можно брать цену текущей машины на странице.
		*/


		//ЗАПУСКАЕМ ШАРМАНКУ!
		init();


	} catch(e) {}

	
	// -||--||--||-
	function init() {
		if (advertStatCookie == undefined) {
			//На сайте паблишера куков нет.
			//Запрашиваем идентификатор пользователя для сайта паблишера
			var dataToSend

			try {
				dataToSend = JSON.stringify({
					"siteID": publisherPageID_AdvertNetwork,
					"sessionID": currentSessionID_AdvertNetwork
				});
				//console.log(dataToSend);
				dataToSend = Base64_AdvertNetwork.encode(dataToSend);
			} catch(e) {
				dataToSend = e.toString();
				dataToSend = Base64_AdvertNetwork.encode(dataToSend);
			}

			utils_AdvertNetwork.sendRequest("http://px.adbox.kz/t/get_id/" + publisherPageID_AdvertNetwork + ".js?data=" + dataToSend);
		} else {
			//Идентификатор уже есть и скорее всего связан с идентификатором iFrame'а
			createIFrame_AdvertNetwork(advertStatCookie);
		}
		
		//Отправка по временным интервалам.
		setTimeout(sendDiapStat, timeDiap[timeDiapIndex]);

		//Будем пытаться отправить по закрытию.
		window.addEventListener("beforeunload", sendDiapStat);
		
		
		//Считаем время проведённое на сайте в активном состоянии
		window.addEventListener("focus", function() {
			if (focusTimer_AdvertNetwork == undefined) {
				focusTimer_AdvertNetwork = TimerUtil_AdvertNetwork.timer;
			}
		});
		
		window.addEventListener("blur", function() {
			if (focusTimer_AdvertNetwork != undefined) {
				userFocusTimer_AdvertNetwork += TimerUtil_AdvertNetwork.timer - focusTimer_AdvertNetwork;
				focusTimer_AdvertNetwork = undefined;
			}
		});
		
	}
	
	function calcUserTimer() {
		if (focusTimer_AdvertNetwork != undefined) {
			userFocusTimer_AdvertNetwork += TimerUtil_AdvertNetwork.timer - focusTimer_AdvertNetwork;
			focusTimer_AdvertNetwork = TimerUtil_AdvertNetwork.timer;
		}
	}
	
	//Статистика по timeDiap (статистика сессии)
	function sendDiapStat() {
		var dataToSend;
		var timeActive;

		calcUserTimer();
		timeActive = Math.floor(userFocusTimer_AdvertNetwork / 1000);

		try {
			dataToSend = JSON.stringify({
				"siteID": publisherPageID_AdvertNetwork,
				"sessionID": currentSessionID_AdvertNetwork,
				"timeActive": timeActive,
				"extraData": extraData_AdvertNetwork
			});
			//console.log(dataToSend);
			dataToSend = Base64_AdvertNetwork.encode(dataToSend);
		} catch(e) {
			dataToSend = JSON.stringify({
				"siteID": publisherPageID_AdvertNetwork,
				"sessionID": currentSessionID_AdvertNetwork,
				"timeActive": timeActive,
				"error": e.toString()
			});
			//console.log(dataToSend);
			dataToSend = Base64_AdvertNetwork.encode(dataToSend);
		}

		utils_AdvertNetwork.sendRequest("http://px.adbox.kz/t/session?data=" + dataToSend);

		if (timeDiapIndex + 1 < timeDiap.length) {
			timeDiapIndex ++;
			var delay = timeDiap[timeDiapIndex] - timeDiap[timeDiapIndex - 1];
			setTimeout(sendDiapStat, delay);
		}
	}
	
	function AdvertStatUtils() {
		
		//JSONP отправлятор
		this.sendRequest = function(requestURL, queryString) {
		
			var tempURL = requestURL;
			var script = document.createElement("script");
			scipt_AdvertNetwork = script;
			
			if (queryString) {
				tempURL += "?" + queryString;
			}
			
			try {
				script.setAttribute("src", tempURL);
				script.onerror = function() {
					utils_AdvertNetwork.removeScript();
				};
				document.body.appendChild(script);
				this.removeScript();
			} catch(e) {
				this.removeScript();
			}
		};

		this.removeScript = function() {
			try {
				if (scipt_AdvertNetwork) {
					document.body.removeChild(scipt_AdvertNetwork);
				}
				scipt_AdvertNetwork = undefined;
			} catch(e) {}
		}
		
		//Куки забиратор
		this.getCookie = function(name) {
			var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
			return matches ? decodeURIComponent(matches[1]) : undefined;
		}

		//Язык страницы определятоор
		this.getPageLanguage = function() {
			return "RU";
		}
		
	}

};

//iFrame с куками нашей сетки.
function createIFrame_AdvertNetwork(advertStatCookie) {
	var dataToSend;

	try {
		dataToSend = JSON.stringify({
			"localID": advertStatCookie, 
			"siteID": publisherPageID_AdvertNetwork, 
			"sessionID": currentSessionID_AdvertNetwork, 
			"siteKeywords": contentKeywords_AdvertNetwork, 
			"siteURL": currentURL_AdvertNetwork, 
			"siteTitle": contentTitle_AdvertNetwork, 
			"searchQuery": searchQuery_AdvertNetwork, 
			"extraData": extraData_AdvertNetwork, 
			"pageLang": pageLanguage_AdvertNetwork
		});
		//console.log(dataToSend);
		dataToSend = Base64_AdvertNetwork.encode(dataToSend);
	} catch(e) {
		dataToSend = JSON.stringify({
			"localID": advertStatCookie, 
			"siteID": publisherPageID_AdvertNetwork, 
			"sessionID": currentSessionID_AdvertNetwork, 
			"siteKeywords": null, 
			"siteURL": null, 
			"siteTitle": contentTitle_AdvertNetwork, 
			"searchQuery": null, 
			"extraData": null, 
			"pageLang": null,
			"error": e.toString()
		});
		//console.log(dataToSend);
		dataToSend = Base64_AdvertNetwork.encode(dataToSend);
	}

	var iframe = document.createElement("iframe");
		iframe.id = "advertStatIFrame" + Math.ceil(Math.random() * 1000);
		iframe.src = "http://px.adbox.kz/t/ifr/" + publisherPageID_AdvertNetwork + ".html?data=" + dataToSend;
		iframe.style.position = "absolute";
		iframe.style.opacity = 0;
		iframe.width = 1;
		iframe.height = 1;
	
	//Здесь, вместе с кверистрингом уйдут куки айфрейма. Если кук нет (свежак), то мы должны в ответе присвоить пользователю идентификатор.
	document.body.appendChild(iframe);
}

//Коллбек для случая с отсутствием кук на сайте паблишера
//В дата передать только значение кук.
function advertCookieCallback_AdvertNetwork(data) {
	try {
		//Записываем полученный идентификатор в куки
		document.cookie = "userID_AdvertNetwork=" + data + "; max-age=94608000";
		
		//Получили идентификатор пользователя для сайта паблишера и теперь отдадим его в iFrame, где он будет отправлен вместе с куки iFrame'а.
		//Если куков в iFrame нет, то пользователь совсем новый и iFrame'у надо в заголовках отдать новый идентификатор пользователя, связав его с тем, что было получено в запросе.
		createIFrame_AdvertNetwork(data);

		utils_AdvertNetwork.removeScript();
		
	} catch(e){}
}

function TimerUtil_AdvertNetwork(value) {
	TimerUtil_AdvertNetwork.timer = value;
	//console.log(TimerUtil_AdvertNetwork.timer);
	setTimeout(TimerUtil_AdvertNetwork, 500, TimerUtil_AdvertNetwork.timer + 500);
}
