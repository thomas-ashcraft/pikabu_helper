// ==UserScript==
// @name         Pikabu helper
// @namespace    https://github.com/thomas-ashcraft
// @version      0.2.0
// @description  Улучшайзер маффинов 3000
// @author       Thomas Ashcraft
// @match        *://pikabu.ru/*
// @match        *://pikabu.ru//*
// @icon         http://cs.pikabu.ru/favicon2x.ico
// @grant        none
// @noframes
// ==/UserScript==

(function() {
	var version = "0.2.0";

	var console_info=["%c pikabu🍩 %chelper v"+version+" %c http://pikabu.ru ","background: #79c36c;color: #FFFFFF", "background: #79c36c;color: #ffffff",""];
	console.log.apply(console,console_info);
	
	var DEBUG = false;
	
	var broken_domains_list = [
	"digitalhomicide.ninja",
	"failmid.com",
	"hrkgame.com"
	];

	var url = window.location.href;
	if(DEBUG) console.log("🐾 url: " + url);

	var path = window.location.pathname;
	path = path.replace(/\/+/g, "/");
	if(DEBUG) console.log("🐾 path: " + path);

	var referrer = document.referrer;
	if(DEBUG) console.log("🐾 referrer: " + referrer);

	// Embed style
	var pikabu_helper_style = `
		.ph_user_karma_bar {border-color: #606050; border-radius: 20px; border-style: solid; border-width: 0 2px; box-shadow: 0 0 1px 0 #000000 inset; display: inline-block; text-align: center; text-shadow: -1px -1px 2px #ffffff, 1px 1px 2px #ffffff; vertical-align: middle; white-space: nowrap;}
		.ph_fixed_link_check{}
		`;
	document.head.appendChild(document.createElement('style')).innerHTML=pikabu_helper_style.replace(/([\s\S]*?return;){2}([\s\S]*)}/,'$2');

	// TODO: update scrolling to pointing on element itself
	function scrl (target) {
		$('html, body').animate({scrollTop: target.offset().top-100}, 800);
		//target.effect("highlight", "800");
	}

	function add_user_karma_bar() {
		user_info = $("div.profile_wrap div:contains('пикабушни')").text();
		pm_counter = /(\d+) плюс.{0,2}\s*(\d+) минус.{0,2}/.exec(user_info);
		pluses = parseInt(pm_counter[1], 10);
		minuses = parseInt(pm_counter[2], 10);
		//pluses = 0; //DEBUG
		//minuses = 2; //DEBUG
		var user_karma_ratio_percent = 0;
		$("div.profile_wrap div:contains('пикабушни') br:last").before("&nbsp;&nbsp;<br><span class='ph_user_karma_bar'></span>");
		var ph_user_karma_bar_borders_width = parseInt($(".ph_user_karma_bar").css("borderRightWidth"), 10) + parseInt($(".ph_user_karma_bar").css("borderLeftWidth"), 10);
		$(".ph_user_karma_bar").width($(".b-user-profile__label:contains('поставил')").width() + $(".b-user-profile__label:contains('поставил')").next().width() - ph_user_karma_bar_borders_width);
		
		if (pluses!=0 && minuses!=0) {
			user_karma_ratio_percent = parseFloat((pluses / (pluses+minuses) * 100).toFixed(2), 10);
		}
		
		if (pluses==0 && minuses==0) {
			$(".ph_user_karma_bar").text("нейтрал");
			$(".ph_user_karma_bar").css("background-color", "#c0c0c0");
		} else if (pluses==0 && minuses>0) {
			$(".ph_user_karma_bar").text("абсолютное зло");
			$(".ph_user_karma_bar").css("background-color", "#e89e36");
			$(".ph_user_karma_bar").css("box-shadow", "0 0 8px 4px #efd244, 0 0 2px 1px #efd244 inset");
		} else if (pluses>0 && minuses==0) {
			$(".ph_user_karma_bar").text("длань богов");
			$(".ph_user_karma_bar").css("background-color", "#a7d437");
			$(".ph_user_karma_bar").css("box-shadow", "0 0 8px 4px #beee44, 0 0 2px 1px #beee44 inset");
		} else if (pluses!=0 && minuses!=0) {
			if(DEBUG) console.log("user_karma_ratio_percent: " + user_karma_ratio_percent);
			$(".ph_user_karma_bar").text("коэффициент: " + (pluses/minuses).toFixed(2));
			$(".ph_user_karma_bar").css("background-image", "linear-gradient(90deg, #a7d437 " + user_karma_ratio_percent + "%, #606050 " + user_karma_ratio_percent + "%, #606050 " + (user_karma_ratio_percent+0.6) + "%, #e89e36 0%)");
		}
	}
	
	function fix_gleam_url() {
		var gleam_regex_full_link = /(href=")?(http[s]?:\/\/[gг].?[lл].?[eе]?.?[и]?.?[aа]?.?[mм].{0,3}[iи].?[oо])(\/[\w]{1,7}\/[\w-]+)/i;
		var ph_fixed_link_check = ' <span class="ph_fixed_link_check" title="Исправлено">☑️</span>';

		$("div.b-story__content p").filter(function () {
			return gleam_regex_full_link.test($(this).text()); 
		}).filter(function () {
			return !/ph_fixed_link_check/m.test($(this).html()); 
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
	
	function fix_links() {
		if(DEBUG) console.log(broken_domains_list);
		all_broken_domains_pattern = "";
		$.each(broken_domains_list, function( index, value ) {
			if (index != 0) {
				all_broken_domains_pattern = all_broken_domains_pattern + '|';
			}
			all_broken_domains_pattern = all_broken_domains_pattern + '\(' + value.replace(/(?!\w$)[\w]/gi, function(x) {
				return x + '.?';
			}).replace(/\.\?\./g, function(y) {
				return '.{0,3}';
			}) + '\)';
		});
		//if(DEBUG) console.log(all_broken_domains_pattern);
		generated_broken_domains_regex = new RegExp (all_broken_domains_pattern, 'i');
		if(DEBUG) console.log(generated_broken_domains_regex);

		//var all_broken_domains_regex = /(digitalhomicide.{0,3}ninja)|(failmid.{0,3}com)|(hrkgame.{0,3}com)/i;
		var ph_fixed_link_check = ' <span class="ph_fixed_link_check" title="Исправлено">☑️</span>';
		
		$("div.b-story__content p").filter(function () {
			return generated_broken_domains_regex.test($(this).text()); 
		}).filter(function () {
			return !/ph_fixed_link_check/m.test($(this).html()); 
		}).each(function() {
			if(DEBUG) console.log("filtered link detected here:");
			if(DEBUG) console.log($(this));
			
			broken_domain_detected = generated_broken_domains_regex.exec($(this).html());
			if(DEBUG) console.log(broken_domain_detected);
			fixed_domain = broken_domain_detected[0].replace(/[^\w\.]/gi, '');
			if(DEBUG) console.log(fixed_domain);
			
			if (fixed_domain == broken_domain_detected[0]) {
				if(DEBUG) console.log("nuff to do here");
			} else {
				if(DEBUG) console.log("lets do this");
				
				broken_domain_pattern = broken_domain_detected[0].replace(/[^\w]/gi, function(y) {
					return "\\" + y;
				});
				broken_link_regex = new RegExp ('\(href="\)?\([\\w-\\/\\.:]+\)\(' + broken_domain_pattern + '\)\([\\w-\\/?=&#]*\)', 'i');
				if(DEBUG) console.log(broken_link_regex);
				
				broken_link_detected = broken_link_regex.exec($(this).html());
				if(DEBUG) console.log(broken_link_detected);
				
				if (broken_link_detected[1] == null) { // if detected link not clickable (just text)
					if(DEBUG) console.log("non-click");
					$(this).html( $(this).html().replace(broken_link_detected[0], '<noindex><a target="_blank" href="' + broken_link_detected[2] + fixed_domain + broken_link_detected[4] + '" rel="nofollow">' + broken_link_detected[2] + fixed_domain + broken_link_detected[4] + '</a>' + ph_fixed_link_check + '</noindex>') );
				} else { // if detected link clickable (already html tag)
					if(DEBUG) console.log("already tag");
					$(this).html( $(this).html().replace(new RegExp (broken_domain_pattern, 'ig'), fixed_domain) );
					$(this).find("a:contains('" + fixed_domain + "')").after(ph_fixed_link_check);
				}
			}
		});
	}
	
	function move_user_profile_tools() {
		$(".sub_init").parent("div").parent("div").append( $(".user-profile-tools"));
		$(".user-profile-tools").css("width", $(".sub_init").css("width"));
		$(".user-profile-tools").css("text-align", "center");
		
		$(".user-profile-tools a[data-action='ignore+']").css("color", "#f75c48").text("в игнор-лист");
		$(".user-profile-tools a[data-action='ignore-']").css("color", "#78c062").text("из игнор-листа");
	}

	function all_feeds_functions() {
		//fix_gleam_url();
		fix_links();
	}

	switch (true) {
		case /^\/story\/.*/.test(path):
			if(DEBUG) console.log("SWITCH: 🐈 Time to fucking awesome stories");
			//fix_gleam_url();
			fix_links();
			break;
		case /^\/profile\/.*/.test(path):
			if(DEBUG) console.log("SWITCH: 👤 Someone's profile");
			add_user_karma_bar();
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
