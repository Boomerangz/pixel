//Эти значения подставляем на сервере
var currentSessionID_AdvertNetwork = '{0}';
var publisherPageID_AdvertNetwork = '{1}'; //Это значение будет само передано из тега скрипт, самим паблишером. На сервере его надо будет забрать из гета и воткнуть сюда.

//Индивидуальные опциональные параметры. Будем дописывать код на сервере при необходимости.
var contentKeywords_AdvertNetwork;
var contentTitle_AdvertNetwork;
var searchQuery_AdvertNetwork;
var extraData_AdvertNetwork;

//Счётчик активности
var focusTimer_AdvertNetwork = 0;
var userFocusTimer_AdvertNetwork = 0; //Для отправки

//Запуск таймера для подсчёта активности
TimerUtil_AdvertNetwork(0);

if (document.body) {
	startTracking_AdvertNetwork();
} else {
	document.addEventListener("DOMContentLoaded", startTracking_AdvertNetwork);
}

startTracking_AdvertNetwork = function () {
	
	var timeDiap = [10000, 30000, 60000, 300000, 900000, 1800000, 3600000, 5400000, 7200000]; //Промежутки времени для отправки идентификатора сессии. Позволит примерно понимать длительность пребывания на сайте.
	
	var utils = new AdvertStatUtils();
	var advertStatCookie = utils.getCookie("userID_AdvertNetwork"); //Получаем идентифицирующие куки с сайта паблишера
	var timeDiapIndex = 0;
	var that = this;
	
	try {
		
		//Достаём данные для таргетинга
		
		//Кейворды
		var keywords = document.getElementsByName("keywords");
		if (keywords.length > 0) {
			contentKeywords_AdvertNetwork = keywords[0].content;
		}
		//Тайтл
		contentTitle_AdvertNetwork = document.title;
		//Остальное
		//searchQuery_AdvertNetwork = ...; //При неожиданно возникшей возможности получения поисковый строки её можно будет поместить сюда. Или можно сюда положить поисковы запрос пользователя на самом сайте паблишера.
		//extraData_AdvertNetwork = ...; //Сюда можно поместить особенные данные, приспособленные к конкретному сайту. Например, с колёс можно брать цену текущей машины на странице.
		
		//ЗАПУСКАЕМ ШАРМАНКУ!
		init();
	} catch(e) {}

	
	// -||--||--||-
	function init() {
		if (advertStatCookie == undefined) {
			//На сайте паблишера куков нет.
			//Запрашиваем идентификатор пользователя для сайта паблишера
			utils.sendRequest("http://px.adbox.kz/t/get_id/"+publisherPageID_AdvertNetwork+".js?site_id=" + publisherPageID_AdvertNetwork + "&session_id=" + currentSessionID_AdvertNetwork);
		} else {
			//Идентификатор уже есть и скорее всего связан с идентификатором iFrame'а
			createIFrame_AdvertNetwork(advertStatCookie, publisherPageID_AdvertNetwork, currentSessionID_AdvertNetwork, contentKeywords_AdvertNetwork, contentTitle_AdvertNetwork, searchQuery_AdvertNetwork, extraData_AdvertNetwork);
		}
		
		//Отправка по временным интервалам.
		setTimeout(sendDiapStat, timeDiap[timeDiapIndex]);
		
		
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
		calcUserTimer();
		utils.sendRequest("http://px.adbox.kz/t/session" +
			"?site_id=" + publisherPageID_AdvertNetwork +
			"&session_id=" + currentSessionID_AdvertNetwork +
			"&time_active=" + Math.floor(userFocusTimer_AdvertNetwork / 1000)
			);
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
			
			if (queryString) {
				tempURL += "?" + queryString;
			}
			
			script.setAttribute("src", tempURL);
			document.body.appendChild(script);
		};
		
		//Куки забиратор
		this.getCookie = function(name) {
			var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
			return matches ? decodeURIComponent(matches[1]) : undefined;
		}
		
	}

};

//iFrame с куками нашей сетки.
function createIFrame_AdvertNetwork(advertStatCookie, publisherPageID_AdvertNetwork, currentSessionID_AdvertNetwork, contentKeywords_AdvertNetwork, contentTitle_AdvertNetwork, searchQuery_AdvertNetwork, extraData_AdvertNetwork) {
	var iframe = document.createElement("iframe");
	
		iframe.id = "advertStatIFrame" + Math.ceil(Math.random() * 1000);
		
		iframe.src = "http://px.adbox.kz/t/ifr/" +publisherPageID_AdvertNetwork+".html"+
			"?local_id=" + advertStatCookie +
			"&site_id=" + publisherPageID_AdvertNetwork +
			"&session_id=" + currentSessionID_AdvertNetwork +
			"&site_keywords=" + contentKeywords_AdvertNetwork +
			"&site_titile=" + contentTitle_AdvertNetwork +
			"&search_query=" + searchQuery_AdvertNetwork +
			"&extra_data=" + extraData_AdvertNetwork;
			
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
		createIFrame_AdvertNetwork(data, publisherPageID_AdvertNetwork, currentSessionID_AdvertNetwork, contentKeywords_AdvertNetwork, contentTitle_AdvertNetwork, searchQuery_AdvertNetwork, extraData_AdvertNetwork);
		
	} catch(e){}
}

function TimerUtil_AdvertNetwork(value) {
	TimerUtil_AdvertNetwork.timer = value;
	setTimeout(TimerUtil_AdvertNetwork, 200, TimerUtil_AdvertNetwork.timer + 200);
}
