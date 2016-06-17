// ==UserScript==
// @name         Pikabu helper
// @namespace    https://github.com/thomas-ashcraft
// @version      0.1
// @description  Улучшайзер маффинов 3000
// @author       Thomas Ashcraft
// @match        *://pikabu.ru/*
// @match        *://pikabu.ru//*
// @icon         http://cs.pikabu.ru/favicon2x.ico
// @grant        none
// @noframes
// ==/UserScript==

(function() {
	var version = "0.1"

	var console_info=["%c pikabu🍩 %chelper v"+version+" %c http://pikabu.ru ","background: #79c36c;color: #FFFFFF", "background: #79c36c;color: #ffffff",""];
	console.log.apply(console,console_info);
	
	var DEBUG = false;

	var url = window.location.href;
	if(DEBUG) console.log("🐾 url: " + url);

	var path = window.location.pathname;
	path = path.replace(/\/+/g, "/");
	//if (path.startsWith("/api")) return;
	if(DEBUG) console.log("🐾 path: " + path);

	var referrer = document.referrer;
	if(DEBUG) console.log("🐾 referrer: " + referrer);

	// Embed style
	var pikabu_helper_style = `
		.ph_user_carma_ratio {border-color: #606050; border-radius: 20px; border-style: solid; border-width: 0 2px; display: inline-block; text-align: center; text-shadow: -1px -1px 2px #ffffff, 1px 1px 2px #ffffff; vertical-align: middle; white-space: nowrap;}
		.ph_fixed_link_check{}
		`;
	document.head.appendChild(document.createElement('style')).innerHTML=pikabu_helper_style.replace(/([\s\S]*?return;){2}([\s\S]*)}/,'$2');

	// TODO: update scrolling to pointing on element itself
	function scrl (target) {
		$('html, body').animate({scrollTop: target.offset().top-100}, 800);
		//target.effect("highlight", "800");
	}

	function add_user_carma_ratio_counter() {
		user_info = $("div.profile_wrap div:contains('пикабушни')").text();
		pm_counter = /(\d+) плюс.{0,2}\s*(\d+) минус.{0,2}/.exec(user_info);
		pluses = parseInt(pm_counter[1], 10);
		minuses = parseInt(pm_counter[2], 10);
		//pluses = 0; //DEBUG
		//minuses = 2; //DEBUG
		var user_carma_ratio_percent = 0;
		$("div.profile_wrap div:contains('пикабушни') br:last").before("&nbsp;&nbsp;<span class='ph_user_carma_ratio'></span>");
		var ph_user_carma_ratio_borders_width = parseInt($(".ph_user_carma_ratio").css("borderRightWidth"), 10) + parseInt($(".ph_user_carma_ratio").css("borderLeftWidth"), 10);
		$(".ph_user_carma_ratio").width($(".b-user-profile__label:contains('поставил')").width() + $(".b-user-profile__label:contains('поставил')").next().width() - ph_user_carma_ratio_borders_width);
		
		if (pluses!=0 && minuses!=0) {
			user_carma_ratio_percent = parseFloat((pluses / (pluses+minuses) * 100).toFixed(2), 10);
		}
		
		if (pluses==0 && minuses==0) {
			$(".ph_user_carma_ratio").text("нейтрал");
			$(".ph_user_carma_ratio").css("background-color", "#c0c0c0");
		} else if (pluses==0 && minuses>0) {
			$(".ph_user_carma_ratio").text("абсолютное зло");
			$(".ph_user_carma_ratio").css("background-color", "#e89e36");
			$(".ph_user_carma_ratio").css("box-shadow", "0 0 8px 4px #efd244, 0 0 2px 1px #efd244 inset");
		} else if (pluses>0 && minuses==0) {
			$(".ph_user_carma_ratio").text("длань богов");
			$(".ph_user_carma_ratio").css("background-color", "#a7d437");
			$(".ph_user_carma_ratio").css("box-shadow", "0 0 8px 4px #beee44, 0 0 2px 1px #beee44 inset");
		} else if (pluses!=0 && minuses!=0) {
			if(DEBUG) console.log("user_carma_ratio_percent: " + user_carma_ratio_percent);
			$(".ph_user_carma_ratio").text("коэффициент: " + (pluses/minuses).toFixed(2));
			$(".ph_user_carma_ratio").css("background-image", "linear-gradient(90deg, #a7d437 " + user_carma_ratio_percent + "%, #606050 " + user_carma_ratio_percent + "%, #606050 " + (user_carma_ratio_percent+0.6) + "%, #e89e36 0%)");
		}
	}
	
	function fix_gleam_url() {
		var gleam_regex_full_link = /(href=")?(http[s]?:\/\/[gг].?[lл].?[eе]?.?[и]?.?[aа]?.?[mм].?.?[iи].?[oо])(\/[\w]{1,7}\/[\w-]+)/i;
		var ph_fixed_link_check = ' <span class="ph_fixed_link_check" title="Исправлено">☑️</span>';

		$("div.b-story__content p").filter(function () {
			return gleam_regex_full_link.test($(this).text()); 
		}).each(function() {
			if(DEBUG) console.log("gleam TXT link detected here:");
			if(DEBUG) console.log($(this));
			
			gleam_link = gleam_regex_full_link.exec($(this).html());
			if(DEBUG) console.log(gleam_link);
			
			if (gleam_link[1] == null) { // if gleam link not clickable (just text)
				$(this).html( $(this).html().replace(gleam_link[0], '<noindex><a target="_blank" href="https://gleam.io' + gleam_link[3] + '" rel="nofollow">https://gleam.io' + gleam_link[3] + '</a>' + ph_fixed_link_check + '</noindex>') );
			} else { // if gleam link clickable (already html tag)
				var gleam_regex_address = new RegExp ('http[s]?:\/\/[gг].?[lл].?[eе]?.?[и]?.?[aа]?.?[mм].?.?[iи].?[oо]\/', 'ig');
				$(this).html( $(this).html().replace(gleam_regex_address, 'https://gleam.io/') );
				$(this).find("a:contains('gleam')").after(ph_fixed_link_check);
			}
		});
	}
	
	function move_user_profile_tools() {
		$(".button_subscribe").parent("div").parent("div").append( $(".user-profile-tools"));
	}

	function all_feeds_functions() {
		fix_gleam_url();
	}

	switch (true) {
		case /^\/story\/.*/.test(path):
			if(DEBUG) console.log("SWITCH: 🐈 Time to fucking awesome stories");
			fix_gleam_url();
			break;
		case /^\/profile\/.*/.test(path):
			if(DEBUG) console.log("SWITCH: 👤 Someone's profile");
			add_user_carma_ratio_counter();
			move_user_profile_tools();
			break;
		case /^\/best.*/.test(path):
			if(DEBUG) console.log("SWITCH: 😎 the best of the best of the best of the...");
			all_feeds_functions();
			break;
		case /^\/new.*/.test(path):
			if(DEBUG) console.log("SWITCH: 🌱 fresh");
			all_feeds_functions();
			break;
		case /^\/communities.*/.test(path):
			if(DEBUG) console.log("SWITCH: 🖐 leagues ALL");
			all_feeds_functions();
			break;
		case /^\/community\/.*/.test(path):
			if(DEBUG) console.log("SWITCH: 🖐 league");
			all_feeds_functions();
			break;
		case /^\/hot.*/.test(path):
			if(DEBUG) console.log("SWITCH: 📰 main page (HOT)");
			//break;
		case /\/$/.test(url):
			if(DEBUG) console.log("SWITCH: 📰 main page");
			all_feeds_functions();
			break;
	}

	// Embed functions to be called directly from the UI in *-monkey installations
	function embedFunction(s) {
		if(DEBUG) console.log('🔀 embedding: ' + s.name);
		document.body.appendChild(document.createElement('script')).innerHTML=s.toString().replace(/([\s\S]*?return;){2}([\s\S]*)}/,'$2');
	}

// embed other functions used by UI after loading
	embedFunction(scrl);

}(window));