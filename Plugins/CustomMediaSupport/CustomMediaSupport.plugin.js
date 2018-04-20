//META{"name":"CustomMediaSupport", "pname":"Custom Media Support"}*//

/* global bdPluginStorage, BdApi */

const CustomMediaSupport = (function() {
	// plugin settings
	const script = {
		name: "Custom Media Support",
		file: "CustomMediaSupport",
		version: "2.5.0",
		author: "Orrie",
		desc: "Makes Discord better for shitlords, entities, genderfluids and otherkin, by adding extensive support for media embedding and previews of popular sites with pictures",
		url: "https://github.com/Orrielel/BetterDiscordAddons/tree/master/Plugins/CustomMediaSupport",
		raw: "https://raw.githubusercontent.com/Orrielel/BetterDiscordAddons/master/Plugins/CustomMediaSupport/CustomMediaSupport.plugin.js",
		discord: "https://discord.gg/YEZkpkj",
		check: {
			version: false,
			media: false,
			sadpanda: false,
			chan: false,
			textParser: false
		},
		media: {
			types: {
				mp4: "video", m4v: "video", ogv: "video", ogm: "video", webm: "video", mov: "video",
				mp3: "audio", ogg: "audio", oga: "audio", wav: "audio", wma: "audio", m4a: "audio", aac: "audio", flac: "audio",
				pdf: "iframe"
			},
			sites: {
				"vocaroo.com": {
					data({href, hrefSplit}) {
						return {fileMedia: "audio", fileReplace: false, href: /\/i\//.test(href) ? `https://vocaroo.com/media_command.php?media=${hrefSplit[4]}&command=download_webm` : false};
					}
				},
				"pastebin.com": {
					data({href, hrefSplit}) {
						return {fileMedia: "iframe", fileReplace: true, href:  /[\w\d]{8}$/.test(href) ? `https://pastebin.com/embed_iframe/${hrefSplit[3]}` : false};
					}
				},
				"wotlabs.net": {
					data({href, hrefSplit}) {
						return {fileMedia: "img", fileReplace: false, href: /\/player\//.test(href) ? `https://wotlabs.net/sig_dark/eu/${hrefSplit[5]}/signature.png` : false};
					}
				},
				"imgur.com": {
					data({href, message, fileMedia}) {
						const check = message.querySelector(`a.embedTitleLink-1IGDvg[href='${href.replace("//m.","//")}']`);
						if (check && check.closest(".embedContent-AqkoYv").nextElementSibling && /\.jpg|\.jpeg|\.png|\.gif$/.test(check.closest(".embedContent-AqkoYv").nextElementSibling.getAttribute("href"))) {
							return {fileMedia: "ignore", fileReplace: false, href};
						}
						else {
							const video = message.getElementsByTagName("video")[0];
							if (video) {
								const source = video.firstElementChild ? video.firstElementChild.src : video.src,
								hrefSplit = source.split("/");
								return {
									fileMedia: script.media.types[source.match(/\w+$/)[0].toLowerCase()],
									fileTitle: hrefSplit[hrefSplit.length-1],
									fileReplace: true, href: source, hrefSplit
								};
							}
						}
						return {fileMedia, fileReplace: false, href};
					},
					api(data) {
						request("imgur", `https://cors-anywhere.herokuapp.com/https://api.imgur.com/3/image/${data.fileTitle.match(/(\w+)/)[0]}`, function(resp, data) {
							const item = resp.success ? resp.data : false;
							if (item) {
								data.href = item.mp4;
								data.media = "video";
								data.fileTitle = item.title ? item.title : "No Title";
								data.fileFilter = data.href.split("/").slice(-2).join("/");
								data.fileSize = mediaSize(item.mp4_size);
								mediaEmbedding(data);
								// store in database to prevent api spam
								if (data.fileSize !== "ERROR") {
									script.db_url[data.fileId] = {href: data.href, fileTitle: data.fileTitle, fileSize: data.fileSize};
								}
								else {
									log("error", "imgur", item);
								}
							}
						}, "GET", data);
					}
				},
				"gfycat.com": {
					data({href}) {
						return {fileMedia: "video", fileReplace: true, href};
					},
					api(data) {
						request("gfycat", `https://cors-anywhere.herokuapp.com/https://api.gfycat.com/v1/gfycats/${data.fileTitle.match(/(\w+)/)[0]}`, function({gfyItem}, data) {
							if (gfyItem) {
								data.href = gfyItem.mp4Url;
								data.fileTitle = gfyItem.gfyName;
								data.fileFilter = data.href.split("/").slice(-2).join("/");
								data.fileSize = mediaSize(gfyItem.mp4Size);
								mediaEmbedding(data);
								// store in database to prevent api spam
								if (data.fileSize !== "ERROR") {
									script.db_url[data.fileId] = {href: data.href, fileTitle: data.fileTitle, fileSize: data.fileSize};
								}
								else {
									log("error", "imgur", gfyItem);
								}
							}
						}, "GET", data);
					}
				},
				"instagram.com": {
					data({message}) {
						if (message) {
							return {
								fileMedia: "video",
								fileReplace: true,
								href: message.getElementsByTagName("source")[0] ? message.getElementsByTagName("source")[0].src : false
							};
						}
					}
				},
				"streamable.com": {
					data({message}) {
						if (message) {
							return {
								fileMedia: "video",
								href: message.getElementsByTagName("source")[0] ? message.getElementsByTagName("source")[0].src : false
							};
						}
					}
				},
				"steampowered.com": {
					data({message}) {
						if (message) {
							return {
								fileMedia: "video",
								filePoster: message.getElementsByTagName("video")[0] ? message.getElementsByTagName("video")[0].poster : "",
								href: message.getElementsByTagName("source")[0] ? `https://${message.getElementsByTagName("source")[0].src.match(/(steamcdn[\w\-\.\/]+)/)[0]}` : false
							};
						}
					}
				},
				"ifunny.co": {
					data({message}) {
						if (message) {
							return {
								fileMedia: "video",
								filePoster: message.getElementsByTagName("video")[0] ? message.getElementsByTagName("video")[0].poster : "",
								href: message.getElementsByTagName("source")[0] ? message.getElementsByTagName("source")[0].src : false
							};
						}
					}
				}
			},
			replace: ["store.steampowered.com"]
		},
		chan: {
			nsfw: ["aco","b","bant","d","e","gif","h","hc","hm","hr","pol","r","r9k","s","s4s","soc","t","u","y"],
			archives: {
				"https://archived.moe": ["3","a","aco","adv","an","asp","b","biz","c","cgl","ck","cm","co","con","d","diy","e","f","fa","fit","g","gd","gif","h","hc","his","hm","hr","i","ic","int","jp","k","lgbt","lit","m","mlp","mu","n","news","o","out","p","po","pol","q","qa","qst","r","r9k","s","s4s","sci","soc","sp","t","tg","toy","trash","trv","tv","u","v","vg","vip","vp","vr","w","wg","wsg","wsr","x","y"],
				"https://archive.4plebs.org": ["adv","f","hr","o","pol","s4s","sp","tg","trv","tv","x"],
				"https://desuarchive.org": ["a","aco","an","c","co","d","fit","gif","his","int","k","m","mlp","qa","r9k","tg","trash","vr","wsg"],
				"https://boards.fireden.net": ["a","cm","ic","sci","tg","v","vg","y"],
				"https://archiveofsins.com": ["h","hc","hm","r","s","soc"],
				"https://archive.nyafuu.org": ["bant","asp","c","e","n","news","out","p","toy","vip","vp","w","wg","wsr"],
				"https://archive.loveisover.me": ["c","d","e","i","lgbt","t","u"]
			}
		},
		settings: {embedding: true, api: true, loop: true, volume: 0.25, preload: true, autoplay: false, hoverPlay: false, board: true, sadpanda: true, greentext: true, imagePop: true, debug: false},
		settingsMenu: {
			//          localized                 type     description
			embedding: ["Media Embedding",        "check", "Embeds or replaces supported elements:<br>mp4, m4v, ogv, ogm, webm, mov; mp3, ogg, oga, wav, wma, m4a, aac, flac; pdf"],
			api:       ["Embedding API",          "check", "Use APIs for embedding when possible -- data will be stored per session"],
			loop:      ["Loop",                   "check", "Loops media"],
			volume:    ["Volume",                 "range", "Default volume &#8213; 25%"],
			preload:   ["Preload",                "check", "Preload media"],
			autoplay:  ["Autoplay",               "check", "Not recommended &#8213; RIP CPU"],
			hoverPlay: ["Play on Hover",          "check", "Play media on mouse hover"],
			board:     ["4chan",                  "check", "Embed 4chan thread links -- data will be stored indefinitely"],
			sadpanda:  ["Sadpanda",               "check", "Embed Sadpanda galleries -- data will be stored indefinitely"],
			greentext: ["Greentext",              "check", "<span class='greentext'>&gt;ISHYGDDT</span>"],
			imagePop:  ["Full Resolution Images", "check", "Replaces images with full resolution ones whilst in popup mode.<br>Images larger than the visible screen will be clickable for pure native previews with scrolling.<br>Disables itself if you're using <a href='https://github.com/Orrielel/BetterDiscordAddons/tree/master/Plugins/BetterImagePopups' target='_blank'>BetterImagePopups</a>"],
			debug:     ["Debug",                  "check", "Displays verbose stuff into the console"]
		},
		css: {
			script: `
/* custom embeds */
.customMedia {color: hsla(0,0%,100%,0.7);}
.message-group .customMedia {display: inline-flex; margin-top: 8px; padding: 0; position: relative;}
.customMedia table {border-spacing: 0;}
.customMedia table td {font-size: 0.875rem; vertical-align: top;}
.customMedia .embed-2diOCQ {max-width: unset;}
.customMedia .media-error-message {color: #F04747; margin: 0; max-width: 75vh; padding: 5px 10px;}
.customMedia .metadata-35KiYB {border-radius: 3px; display: flex; height: auto; margin: 0; padding: 10px 12px 35px; top: 0; z-index: auto;}
.customMedia .metadataContent-3HYqEq {overflow: hidden;}
.customMedia .metadataName-CJWo1Z a {color: #FFFFFF; opacity: 0.6;}
.customMedia .metadataName-CJWo1Z:hover a {opacity: 1;}
.customMedia .metadataButton {cursor: pointer; font-size: 22px; font-weight: bold; margin-top: -2px; opacity: 0.6;}
.customMedia .metadataButton:hover {opacity: 1;}
.customMedia.media-audio .metadataButton {display: none;}
.customMedia.media-audio audio {margin-top: 40px; vertical-align: middle; width: 25vw; min-width: 400px;}
.customMedia.media-img .imageWrapper-38T7d9 img {position: static;}
.customMedia.media-video video {cursor: pointer; border-radius: 3px 3px 0 0; margin: 0; padding-bottom: 32px; vertical-align: middle; width: auto; max-width: 25vw; max-height: 50vh; min-width: 225px;}
.customMedia.media-video video::-webkit-media-controls {padding-top: 32px;}
.customMedia.media-video.media-large-horizontal video {max-width: calc(100vw - 740px); height: 50vh;}
.customMedia.media-video.media-large-vertical video {height: 60vh; max-width: unset; max-height: unset;}
.customMedia.media-video .metadata-35KiYB {display: none; z-index: 1;}
.customMedia.media-video:hover .metadata-35KiYB {display: flex;}
.customMedia.media-iframe iframe {margin-top: 40px; max-width: 100%; min-width: 500px; min-height: 300px; max-height: 600px; resize: both; overflow: auto; vertical-align: middle; z-index: 1;}
.theme-dark .customMedia.media-iframe iframe {background-color: rgba(46,48,54,.3); border: 1px solid rgba(46,48,54,.6);}
.theme-light .customMedia.media-iframe iframe {background: hsla(0,0%,98%,.3); border: 1px solid hsla(0,0%,80%,.3);}
.CustomMediaSupportModal .customMedia.media-video video {max-height: 80vh; min-height: 50vh; max-width: 90vw;}
.CustomMediaSupportModal .customMedia.media-iframe iframe {height: 80vh !important; width: 90vw !important; max-height: unset; max-width: unset; resize: none;}
.accessory.media-replace .customMedia.media-video video {object-fit: fill; width: 100%;}
.accessory.media-replace .metadataButton-expand {display: none;}
.customMedia ::-webkit-media-controls-current-time-display, .customMedia ::-webkit-media-controls-time-remaining-display {color: #BEBEBE}
.customMedia ::-webkit-media-controls-panel {background-color: #202225; border-radius: 0 0 3px 3px; display: flex !important; opacity: 1 !important;}
.customMedia ::-webkit-media-controls-play-button, .customMedia ::-webkit-media-controls-fullscreen-button, .customMedia ::-webkit-media-controls-mute-button, .customMedia ::-internal-media-controls-download-button {cursor: pointer; filter: brightness(1.5);}
.customMedia ::-webkit-media-controls-play-button:hover, .customMedia ::-webkit-media-controls-fullscreen-button:hover, .customMedia ::-webkit-media-controls-mute-button:hover, .customMedia ::-internal-media-controls-download-button:hover {cursor: pointer; filter: brightness(2.5);}
.customMedia ::-webkit-media-controls-timeline, .customMedia ::-webkit-media-controls-volume-slider {cursor: pointer; margin: 0 10px; padding: 3px 0;}
::-webkit-media-controls-fullscreen-button {display: none;}
.media-toggled {display: none !important;}
/* exhentai previews */
.customMedia.sadpanda .gallery_info {background-color: #2E3033; border-radius: 5px; padding: 5px 5px 10px; width: 100%;}
.customMedia.sadpanda .gallery_info .desc {color: #FFFFFF;}
.customMedia.sadpanda .gallery_info .tag {display: inline-block; margin: 0 3px;}
.customMedia.sadpanda .gallery_info .tag:after{content: ',';}
.customMedia.sadpanda .gallery_info .tag:last-child:after {content: '';}
.customMedia.sadpanda .gallery_preview {padding: 0; width: 1px;}
.customMedia.sadpanda .gallery_preview img {max-height: 250px;}
.customMedia.sadpanda .embed-2diOCQ {max-width: 750px;}
.customMedia.sadpanda .embedPill-3sYS1X.cat-Doujinshi {background-color: #FF2525;}
.customMedia.sadpanda .embedPill-3sYS1X.cat-Manga {background-color: #FFB225;}
.customMedia.sadpanda .embedPill-3sYS1X.cat-Artistcg {background-color: #E8D825;}
.customMedia.sadpanda .embedPill-3sYS1X.cat-Gamecg {background-color: #259225;}
.customMedia.sadpanda .embedPill-3sYS1X.cat-Western {background-color: #9AFF38;}
.customMedia.sadpanda .embedPill-3sYS1X.cat-Non-H {background-color: #38ACFF;}
.customMedia.sadpanda .embedPill-3sYS1X.cat-Imageset {background-color: #2525FF;}
.customMedia.sadpanda .embedPill-3sYS1X.cat-Cosplay {background-color: #652594;}
.customMedia.sadpanda .embedPill-3sYS1X.cat-Asianporn {background-color: #F2A7F2;}
.customMedia.sadpanda .embedPill-3sYS1X.cat-Misc {background-colorcolor: #D3D3D3;}
.customMedia.sadpanda .gallery_info .cat-Doujinshi {color: #FF2525;}
.customMedia.sadpanda .gallery_info .cat-Manga {color: #FFB225;}
.customMedia.sadpanda .gallery_info .cat-Artistcg {color: #E8D825;}
.customMedia.sadpanda .gallery_info .cat-Gamecg {color: #259225;}
.customMedia.sadpanda .gallery_info .cat-Western {color: #9AFF38;}
.customMedia.sadpanda .gallery_info .cat-Non-H {color: #38ACFF;}
.customMedia.sadpanda .gallery_info .cat-Imageset {color: #2525FF;}
.customMedia.sadpanda .gallery_info .cat-Cosplay {color: #652594;}
.customMedia.sadpanda .gallery_info .cat-Asianporn {color: #F2A7F2;}
.customMedia.sadpanda .gallery_info .cat-Misc {color: #D3D3D3;}
/* 4chan previews */
.customMedia.knittingboard {color: #AAAAAA;}
.customMedia.knittingboard .embed-2diOCQ {max-width: 640px; min-width: 520px;}
.customMedia.knittingboard .embed-2diOCQ .board-sfw {background-color: #9099D0;}
.customMedia.knittingboard .embed-2diOCQ .board-nsfw {background-color: #FFBEAF;}
.customMedia.knittingboard .thread_head {position: relative;}
.customMedia.knittingboard .thread_head .thread_posttype {font-weight: bold; line-height: 30px; margin: 0 5px;}
.customMedia.knittingboard .thread_head .thread_data {display: inline; position: absolute; right: 0;}
.customMedia.knittingboard .thread_head .thread_data td:last-of-type {text-align: right;}
.customMedia.knittingboard .thread_link {font-weight: 500; white-space: nowrap;}
.customMedia.knittingboard .thread_link span {display: inline; margin: 0 5px;}
.customMedia.knittingboard .thread_info {white-space: nowrap;}
.customMedia.knittingboard .thread_info .thread_title {display: inline-block; font-weight: bold; max-width: 278px; overflow: hidden; text-overflow: ellipsis; vertical-align: bottom;}
.customMedia.knittingboard .thread_info .thread_creator {color: #30A75C;}
.customMedia.knittingboard .thread_preview {padding: 0; width: 1px;}
.customMedia.knittingboard .thread_preview img {border-radius: 5px; display: inline-block; height: unset; max-height: 200px; max-width: 200px;}
.customMedia.knittingboard .thread_comment {background-color: #2E3033; border-radius: 5px; padding: 5px 5px 10px; width: 100%; word-break: break-word;}
.customMedia.knittingboard .thread_comment a {word-break: break-word;}
.customMedia.knittingboard .thread_foot {padding: 10px 2px 0;}
.custom_warning {color: #F32323;}
/* greentext */
.greentext {color: #709900;}
/* spoiler */
.customMedia .spoiler {background: #1D1D1D;}
.customMedia .spoiler:hover {background-color: unset; color: #ADADAD !important;}
.customMedia .spoiler::before {display: inline; content: "Spoiler:"; font-family: inherit; padding: 0 2px;}
/* BetterImagePopups */
.bip-container .scrollerWrap-2uBjct {display: unset; position: unset; height: unset; min-height: unset; flex: unset;}
.bip-container .imageWrapper-38T7d9 {display: table; margin: 0 auto;}
.bip-container .imageWrapper-38T7d9 img {position: static;}
.bip-container .bip-scroller {display: inline-block; max-height: calc(100vh - 140px); max-width: calc(100vw - 160px); overflow: auto;}
.bip-container .bip-scroller img {margin-bottom: -5px;}
.bip-container .bip-scroller::-webkit-scrollbar-corner {background: rgba(0,0,0,0);}
.bip-container .bip-center {max-height: calc(100vh - 140px); max-width: calc(100vw - 160px);}
.bip-container .bip-actions, .bip-container .bip-description {display: table; margin: 0 auto;}
.bip-container .downloadLink-wANcd8 {text-transform: capitalize;}
/* archive manager */
.cms-menuIcon {background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAASCAYAAABrXO8xAAABfElEQVR42rWSu4rCQBiF51n2VVJsZSVEkWjjXQOCooUajeJdtLNR8QJaKYiCl85SEDvxCbb3BbY4y5nCDSiSxoGTGf7/fJOTnwguj8fz5XK5rtFoFKFQ6KXYc7vdV3olpKrqdzwevw8GA3S7XXQ6nZdibzgcQtf1OxkRDAZ/1+s1NpsNuL/Rw0NGRCIRtNttZLNZGIbxVrlcDq1WS8aWYLPZRLlcZqS3qlQqqNfrHwALhcIjHs+feSOHw8Z0OkWv1+P5Sfl8/h/ko9FoIBAIyOJiscB+v8dut8N4PJZJEokEwuHwwxOLxSBY5G2KomA0GklwuVxiu93ifD7jdrvJfT6fw+fzoVQqgYxIp9MoFotwOp0S7Pf7mEwmmM1mWK1WOBwOOB6PuFwujCoHRkbw21KpFGFbopc/gjBNE5lMhlOzJXoZV9RqNSvI349Ttoo1KygHJFhk9mq1SslzMpm06qnPC4SmaSe/3//Dm+yIXjKCy+FwmF6vF3ZEL5k/rZRshi+9vygAAAAASUVORK5CYII=) no-repeat center; opacity: 0.6;}
.cms-menuIcon:hover {opacity: 1;}
.cms-content {background-color: unset;}
.cms-archive_header > div {margin: 0 5px; width: 195px;}
.cms-archive_filter {padding-bottom: 8px;}
.cms-archive_filter .input-2YozMi {padding: 0 10px; width: 250px;}
.cms-archive_active .divider-1G01Z9 {background-color: #a5a5a5;}
.cms-archive_container .customMedia {margin: 5px; position: relative;}
.cms-archive_container .customMedia .embed-2diOCQ {max-width: unset;}
.cms-archive_delete {position: absolute; top: 3px; right: 3px;}
.cms-archive_delete:hover .close-3ejNTg, .cms-archive_clean:hover .close-3ejNTg {background-color: rgba(240, 71, 71, 0.5);}
.cms-info-header {height: 24px; padding: 8px;}
.cms-archive_container .customMedia.knittingboard .thread_head .thread_data {right: 30px;}
			`,
			shared: `
.orriePluginModal .backdrop-2ohBEd {background-color: #000000; opacity: 0.85;}
.orriePluginModal .modal-2LIEKY {opacity: 1;}
.orriePluginModal .modal-3HOjGZ {padding: 0 20px; width: 800px;}
.orriePluginModal .description-3MVziF {font-size: 16px; line-height: 24px;}
.orrie-plugin .buttonBrandFilled-3Mv0Ra a {color: #FFFFFF !important;}
.orrie-buttonRed, .bda-slist .orrie-buttonRed {background-color: #F04747 !important;}
.orrie-buttonRed:hover, .bda-slist .orrie-buttonRed:hover {background-color: #FD5D5D !important;}
.orrie-toggled {display: none !important;}
.orrie-overflow {overflow: visible;}
.orrie-relative {position: relative;}
.orrie-centerText {text-align: center;}
.orrie-inputRequired::before {color: #F04747; content: "*"; font-size: 20px; font-weight: 700; margin-left: 2px; position: absolute; z-index: 1;}
.theme-dark .orrie-plugin {color: #B0B6B9;}
/* tooltips */
.orrie-tooltip_text {background-color: #3A71C1; border-radius: 6px; box-shadow: 0 2px 10px 0 rgba(0, 0, 0, .2); color: #DCDDDE; font-size: 14px; font-weight: 500; opacity: 0; padding: 8px 12px; position: absolute; text-align: center; transition: opacity 0.3s; visibility: hidden; width: max-content; max-width: 160px; z-index: 1002;}
.orrie-tooltip:hover .orrie-tooltip_text {opacity: 1; visibility: visible;}
.orrie-tooltip_top {bottom: 135%; left: 50%; transform: translateX(-50%);}
.orrie-tooltip_bottom {left: 50%; top: 135%; transform: translateX(-50%);}
.orrie-tooltip_right {top: 50%; transform: translateY(-50%);}
.orrie-tooltip_left {right: 135%; top: 50%; transform: translateY(-50%);}
.orrie-tooltip_text::after {border-color: transparent; border-style: solid; border-width: 5px; content: ""; position: absolute;}
.orrie-tooltip_top::after {border-top-color: #3A71C1; left: 50%; margin-left: -5px; top: 100%;}
.orrie-tooltip_bottom::after {border-bottom-color: #3A71C1; bottom: 100%; left: 50%; margin-left: -5px;}
.orrie-tooltip_right::after {border-right-color: #3A71C1; margin-top: -5px; right: 100%; top: 50%;}
.orrie-tooltip_left::after {border-left-color: #3A71C1; left: 100%; margin-top: -5px; top: 50%;}
.orrie-tooltip_text:hover {opacity: 0 !important; visibility: hidden !important;}
			`
		},
		db: {},
		db_url: {},
		db_filter: [],
		db_proxy: {}
	},
	settingsLoad = function() {
		// load settings
		const storage = bdPluginStorage.get(script.file, "settings");
		if (storage) {
			script.settings = storage;
		}
		else {
			bdPluginStorage.set(script.file, "settings", script.settings);
		}
		script.db = bdPluginStorage.get(script.file, "db") || {};
		if (typeof window.PluginUpdates !== "object" || !window.PluginUpdates) {
			window.PluginUpdates = {plugins:{}};
		}
		window.PluginUpdates.plugins[script.raw] = {name:script.name, raw:script.raw, version:script.version};
		log("info", "Settings Loaded");
	},
	settingsSave = function(key, data) {
		// save settings
		script.settings[key] = data;
		bdPluginStorage.set(script.file, "settings", script.settings);
		log("info", "Settings Saved", [key, data]);
	},
	settingsAnimate = function({nextElementSibling, previousElementSibling, style}, type, data) {
		// animate settings changes
		switch(type) {
			case "check":
				nextElementSibling.classList.toggle("checked");
				break;
			case "range":
				const value = `${(data*100).toFixed(0)}%`;
				previousElementSibling.textContent = value;
				style.background = `linear-gradient(to right, rgb(114, 137, 218), rgb(114, 137, 218) ${value}, rgb(114, 118, 125) ${value})`;
				break;
			// case "text":
		}
	},
	log = function(method, title, data) {
		// logging function
		if (script.settings.debug || method == "error") {
			console[method](`%c[${script.file}]%c ${title}`, "color: purple; font-weight: bold;", "", new Date().toLocaleTimeString("en-GB"), data ? data : "");
		}
	},
	scrollElement = function(scrollDistance, parentClass, forceScroll) {
		// scroll element
		const parent = document.getElementsByClassName(parentClass)[0];
		if (forceScroll || (parent.scrollHeight - parent.scrollTop - parent.clientHeight - scrollDistance <= 10)) {
			parent.scrollTop += scrollDistance;
		}
	},
	modalHandler = function(modalContent, data) {
		if (data) {
			modalContent.appendChild(_createElement("div", {className: "description-3MVziF textCenter-1t1XXw userSelectText-wz4t4g", innerHTML: `${data.fileTitle}${data.fileSize ? ` - ${data.fileSize}` : ""}${data.fileRes ? ` - ${data.fileRes}` : ""}`}));
		}
		const modal = _createElement("span", {className: `${script.file}Modal orriePluginModal`}, [
			_createElement("div", {className: "backdrop-2ohBEd", onclick() {modal.remove();}}),
			_createElement("div", {className: "modal-2LIEKY"},
				_createElement("div", {className: "inner-1_1f7b"}, modalContent)
			)
		]),
		button = modal.getElementsByClassName("orrie-button-cancel")[0];
		if (button) {
			button.addEventListener('click', function() {modal.remove();}, false);
		}
		document.getElementById("app-mount").lastElementChild.appendChild(modal);
	},
	mediaCheck = function(message, fileFilter) {
		const media_elements = message.getElementsByClassName("customMedia");
		if (media_elements.length) {
			for (let _cm=media_elements.length; _cm--;) {
				if (media_elements[_cm].check == fileFilter) {
					if (!script.db_filter.includes(fileFilter)) {
						script.db_filter.push(fileFilter);
					}
					return false;
				}
			}
		}
		return true;
	},
	mediaReplace  = function(message) {
		const mediaAll = message.querySelectorAll(`.accessory:not(.customMedia) video[src]:not([src=""]), .accessory:not(.customMedia) source, .accessory:not(.customMedia) a:not(.imageWrapper-38T7d9)`);
		for (let _rm=mediaAll.length; _rm--;) {
			const media = mediaAll[_rm],
			url = media.tagName == "VIDEO" || media.tagName == "SOURCE" ? media.getAttribute("src") : media.getAttribute("href"),
			fileFilter = url.split("/").slice(-2).join("/");
			if (media && script.db_filter.includes(fileFilter)) {
				let wrapper = media.classList.contains("fileNameLink-342ZEF") ? media.closest(".attachment-1Vom9D") : media.closest(".imageWrapper-38T7d9");
				if (wrapper && wrapper.parentNode.classList.contains("accessory")) {
					wrapper.classList.add("media-toggled");
				}
				else {
					wrapper = media.closest(".embed");
					if (wrapper) {
						wrapper.classList.add("media-toggled");
					}
				}
				if (script.db_proxy[fileFilter] == "ERROR") {
					const source = document.getElementById(`error_${fileFilter}`);
					if (source) {
						source.id = "";
						source.src = url;
						source.parentNode.load();
						source.parentNode.classList.remove("media-toggled");
						source.parentNode.nextElementSibling.classList.add("media-toggled");
					}
					delete script.db_proxy[fileFilter];
				}
				else {
					script.db_proxy[fileFilter] = url;
				}
			}
		}
	},
	mediaSize = function(fileSize) {
		let l = 0;
		while(fileSize >= 1024) {
			fileSize = fileSize/1024;
			l++;
		}
		return fileSize ? `${fileSize.toFixed(3)} ${["Bytes","KB","MB","GB"][l]}` : "ERROR";
	},
	archiveCheck = function(archive) {
		for (let _a_k = Object.keys(script.chan.archives), _a=_a_k.length; _a--;) {
			if (script.chan.archives[_a_k[_a]].includes(archive)) {
				return _a_k[_a];
			}
		}
		return false;
	},
	mediaConvert = function(type, node) {
		// main media function -- checks every anchor element in messages
		if (!script.check.media) {
			script.check.media = true;
			const types = {
				messages: ".markup > a:not(.cms-ignore), .metadataDownload-1eyTml:not(.cms-ignore), .fileNameLink-342ZEF:not(.cms-ignore)",
				message: ".accessory:not(.media-replace) .embedTitleLink-1IGDvg, .accessory:not(.media-replace) .metadataDownload-1eyTml"
			},
			gallery = {"method": "gdata", "gidlist": [], "namespace": 1},
			links = (type !== "messages" ? node.closest(".message") : node).querySelectorAll(types[type]);
			log("info", `mediaConvert ${type}`, links);
			for (let _l=links.length; _l--;) {
				const link = links[_l];
				if (link.getAttribute("href") || link.getAttribute("src")) {
					const fileId = link.tagName == "VIDEO" || link.tagName == "SOURCE" ? link.getAttribute("src") : link.getAttribute("href"),
					href = decodeURI(encodeURI(fileId.replace("http:", "https:").replace("www.","").replace(".gifv", ".mp4"))),
					fileType = href.match(/\.(\w+$)/) ? href.match(/\.(\w+$)/)[1] : false,
					message = link.closest(".message");
					if (message && fileType || /4chan.org|exhentai.org\/g\/|gfycat.com|vocaroo.com|pastebin.com|wotlabs.net|instagram.com|imgur.com|streamable.com|steampowered.com|ifunny.co/.test(href)) {
						const message_body = message.firstElementChild,
						hrefSplit = href.split("/");
						let container;
						switch(hrefSplit[2]) {
							case "exhentai.org":
								const gallery_id = `${hrefSplit[4]}_${hrefSplit[5]}`;
								if (script.settings.sadpanda && !link.classList.contains("fetchingMedia") && !message.getElementsByClassName(`gallery_${gallery_id}`).length) {
									link.classList.add("customMediaLink",`anchor_${gallery_id}`);
									if (script.db[gallery_id]) {
										container = _createElement("div", {className: `accessory customMedia sadpanda gallery_${gallery_id}`, innerHTML: script.db[gallery_id]});
										message.insertBefore(container, message_body.nextSibling);
										scrollElement(container.parentNode.scrollHeight, "messages");
									}
									else {
										link.classList.add("fetchingMedia");
										gallery.gidlist.push([hrefSplit[4], hrefSplit[5]]);
									}
									if (!script.db_filter.includes(gallery_id)) {
										script.db_filter.push(gallery_id);
									}
								}
								break;
							case "boards.4chan.org":
								if (!hrefSplit[5]) {
									break;
								}
								const postnumber = hrefSplit[5].match(/\d+/g),
								thread_id = `${hrefSplit[3]}_${postnumber[1] ? hrefSplit[5].replace("#","_") : hrefSplit[5]}`;
								if (script.settings.board && !link.classList.contains("fetchingMedia") && !message.getElementsByClassName(`post_${thread_id}`).length) {
									link.classList.add("customMediaLink",`anchor_${thread_id}`);
									if (script.db[thread_id]) {
										container = _createElement("div", {className: `accessory customMedia knittingboard post_${thread_id}`, innerHTML: script.db[thread_id]});
										message.insertBefore(container, message_body.nextSibling);
										scrollElement(container.parentNode.scrollHeight, "messages");
									}
									else {
										link.classList.add("fetchingMedia");
										if (!script.check.chan) {
											script.check.chan = true;
											const archive = archiveCheck(hrefSplit[3]);
											if (archive) {
												request("4chan", `https://cors-anywhere.herokuapp.com/${archive}/_/api/chan/thread/?board=${hrefSplit[3]}&num=${postnumber[0]}`, chanHandler, "GET", {href, hrefSplit, archive, postnumber});
											}
										}
									}
									if (!script.db_filter.includes(`thread/${postnumber[0]}`)) {
										script.db_filter.push(`thread/${postnumber[0]}`);
									}
									mediaReplace(message);
								}
								break;
							default:
								if (script.settings.embedding) {
									const fileFilter = hrefSplit.slice(-2).join("/");
									let data = {
										fileMedia: fileType ? script.media.types[fileType.toLowerCase()] : false,
										fileTitle: message.getElementsByClassName("embedTitleLink-1IGDvg")[0] ? message.getElementsByClassName("embedTitleLink-1IGDvg")[0].innerHTML : decodeURIComponent(hrefSplit[hrefSplit.length-1]),
										fileSize: message.getElementsByClassName("metadataSize-L0PFDT")[0] ? message.getElementsByClassName("metadataSize-L0PFDT")[0].textContent : "",
										fileReplace: false,
										filePoster: "",
										fileId, fileType, fileFilter, href, hrefSplit, message, message_body
									};
									if (data.fileMedia == "ignore") {break;}
									const fileSite = script.media.sites[hrefSplit[2].match(/(\w+.\w+)$/)[0]] || false;
									if (fileSite) {
										data = Object.assign(data, fileSite.data(data));
									}
									// only continues if mediaCheck is true -- as in, the embedding doesn't already exist
									if (data.href && data.fileMedia  && data.fileMedia !== "ignore" && mediaCheck(message, fileFilter)) {
										link.classList.add("customMediaLink");
										if (script.db_url[data.fileId]) {
											mediaEmbedding(Object.assign(data, script.db_url[data.fileId]));
										}
										else if (script.settings.api && fileSite && fileSite.api) {
											fileSite.api(data);
										}
										else {
											mediaEmbedding(data);
										}
										message.classList.add("customEmbedded");
									}
								}
								break;
						}
					}
				}
				link.classList.add("cms-ignore");
			}
			// fetch Sadpanda data if gallery links where found
			if (gallery.gidlist.length > 0 && !script.check.sadpanda) {
				script.check.sadpanda = true;
				request("sadpanda", "https://e-hentai.org/api.php", sadpandaHandler, "POST", gallery);
			}
			script.check.media = false;
		}
	},
	mediaEmbedding = function(data, mode) {
		log("info", "mediaEmbedding", data);
		const {fileId, fileMedia, fileTitle, fileType, fileSize, filePoster, fileReplace, fileFilter, href, hrefSplit, message, message_body} = data,
		previewReplace = script.media.replace.includes(hrefSplit[2]),
		container = _createElement("div", {className: `accessory customMedia media-${fileMedia}`, check: fileFilter}, [
			mode == "return" ? false : _createElement("div", {className: "metadata-35KiYB", innerHTML: `<div class='metadataContent-3HYqEq userSelectText-wz4t4g'><div class='metadataName-CJWo1Z'><a class='white-1yVmLu' href='${href}'>${fileTitle}</a></div><div class='metadataSize-L0PFDT'>${fileSize}</div></div>`}, [
				_createElement("div", {className: "metadataButton metadataButton-popout orrie-tooltip orrie-relative", innerHTML: `&#128471;<div class='orrie-tooltip_text orrie-tooltip_${previewReplace ? "left" : "top"}'>Popout Media</div>`,
					onclick() {
						if (fileMedia == "video") {
							const video = this.parentNode.nextElementSibling;
							data.currentTime = video.currentTime;
							data.playing = !video.paused;
							video.pause();
						}
						modalHandler(mediaEmbedding(data, "return"), data);
					}
				}),
				fileMedia == "video" ? _createElement("div", {className: "metadataButton metadataButton-expand orrie-tooltip orrie-relative", innerHTML: "&#128470<div class='orrie-tooltip_text orrie-tooltip_top'>Expand Media</div>",
					onclick() {
						const video = this.parentNode.nextElementSibling;
						container.classList.toggle(video.videoWidth/video.videoHeight > 1.25 ? "media-large-horizontal" : "media-large-vertical");
						if (container.getBoundingClientRect().bottom > document.getElementsByClassName("messages")[0].clientHeight) {
							container.parentNode.scrollIntoView(false);
						}
					}
				}) : false
			]),
			_createElement(fileMedia, (function() {
				switch(fileMedia) {
					case "video":
					case "audio":
						return {check: href, controls: true, preload: script.settings.preload ? "metadata" : "none", loop: script.settings.loop, autoplay: script.settings.autoplay, poster: filePoster,
							onclick() {if (this.paused) {this.play();} else {this.pause();}},
							onloadedmetadata() {
								if (fileMedia == "video") {
									data.fileRes = `${this.videoWidth}px × ${this.videoHeight}px`;
									if (script.settings.hoverPlay) {
										this.onmouseover = function() {
											if (this.paused) {
												this.play();
											}
										};
										this.onmouseout = function() {
											this.pause();
										};
									}
									if (data.currentTime) {
										this.currentTime = data.currentTime;
										if (data.playing) {
											this.play();
										}
									}
								}
								this.volume = script.settings.volume;
								scrollElement(container.parentNode.scrollHeight, "messages");
								// replace original accessory previews if they exist
								if (!script.media.replace.includes(hrefSplit[2])) {
									if (!script.db_filter.includes(fileFilter)) {
										script.db_filter.push(fileFilter);
									}
									mediaReplace(message);
								}
							}
						};
					case "img":
					case "iframe":
						return {"className": fileMedia, src: fileType == "pdf" ? `https://docs.google.com/gview?url=${href}&embedded=true` : href, check: href, allowFullscreen: true};
					default:
						log("error", "mediaEmbed", href);
				}
			})(),
				_createElement("source", {src: href,
					onerror() {
						const proxy = script.db_proxy[fileFilter];
						if (proxy) {
							this.src = proxy;
							this.parentNode.load();
							delete script.db_proxy[fileFilter];
						}
						else {
							script.db_proxy[fileFilter] = "ERROR";
							this.id = `error_${fileFilter}`;
							this.parentNode.classList.add("media-toggled");
							this.parentNode.nextElementSibling.classList.remove("media-toggled");
						}
					}
				})
			),
			_createElement("div", {className: "media-error-message userSelectText-wz4t4g media-toggled", innerHTML: `Unable to embed link - ${href}`})
		]);
		if (mode == "return") {
			return container;
		}
		if (previewReplace) {
			const anchor = message.querySelector(`.accessory a[href*='${fileFilter}']`),
			embed = anchor ? anchor.closest(".embedContent-AqkoYv").nextElementSibling : false;
			if (embed) {
				anchor.closest(".accessory").classList.add("media-replace");
				embed.firstElementChild.classList.add("media-toggled");
				embed.appendChild(container);
				embed.style.height = "auto";
			}
		}
		else {
			message.insertBefore(container, message_body.nextSibling);
		}
		// replace original accessory previews if they exist
		if ((fileReplace || (fileMedia == "video" || fileMedia == "audio")) && !previewReplace) {
			if (!script.db_filter.includes(fileFilter)) {
				script.db_filter.push(fileFilter);
			}
			mediaReplace(message);
		}
		scrollElement(container.parentNode.scrollHeight, "messages");
	},
	sadpandaHandler = function(resp) {
		// fetch sadpanda gallery information
		const galleries = resp.gmetadata;
		if (galleries) {
			const messages = document.getElementsByClassName("messages")[0],
			tagsParser = function(tags) {
				const tagsOutput = {language: "", parody: "", character: "", group: "", artist: "", male: "", female: "", misc: ""};
				let tagsString = "";
				for (let _t=0, _t_len=tags.length; _t<_t_len; _t++) {
					const tag = tags[_t].match(/([\w\s\.\-]+)/g),
					tagOutput = `<div class='tag'><a class='cms-ignore' href='https://exhentai.org/tag/${tag.length == 2? `${tag[0]}:${tag[1].replace(/\s/g, "+")}` : tag[0].replace(/\s/g, "+")}' target='_blank' rel='noreferrer'>${tag[tag.length-1]}</a></div>`;
					if (tag.length == 2) {
						tagsOutput[tag[0]] += tagOutput;
					}
					else {
						tagsOutput.misc += tagOutput;
					}
				}
				for (let _to_k=Object.keys(tagsOutput), _to=0, _to_len=_to_k.length; _to<_to_len; _to++) {
					const key = _to_k[_to],
					tagOutput = tagsOutput[key];
					if (tagOutput) {
						tagsString += `<tr><td class='desc'>${key}:</td><td>${tagOutput}</td></tr>`;
					}
				}
				return tagsString;
			};
			for (let _g=galleries.length; _g--;) {
				let container;
				const gallery = galleries[_g],
				gallery_id = `${gallery.gid}_${gallery.token}`,
				gallery_anchors = messages.getElementsByClassName(`anchor_${gallery_id}`);
				for (let _a=gallery_anchors.length; _a--;) {
					const element_message = gallery_anchors[_a].closest(".message");
					if (!element_message.getElementsByClassName(`gallery_${gallery_id}`).length) {
						container = _createElement("div", {className: `accessory customMedia sadpanda gallery_${gallery_id}`, innerHTML: `<div class='embed-2diOCQ flex-3B1Tl4 embed'><div class='embedPill-3sYS1X cat-${gallery.category}'></div><div class='embedInner-t4ag7g'><table><tr><td colspan='2'><div><a class='embedProvider-1KNREX size12-1IGJl9 weightNormal-3gw0Lm cms-ignore' href='https://exhentai.org/' target='_blank' rel='noreferrer'>ExHentai</a></div><div class='marginTop4-2rEBfJ marginBottom4-_yArcI'><a class='embedTitleLink-1IGDvg embedLink-2Cft4i embedTitle-2e667Z size14-1wjlWP weightMedium-13x9Y8 cms-ignore' href='https://exhentai.org/g/${gallery.gid}/${gallery.token}/' target='_blank' rel='noreferrer'>${gallery.title}</a>${gallery.expunged ? " <span class='custom_warning'>(Expunged)</span>" : ""}</div></td></tr><tr><td class='gallery_preview'><img class='image' src='${gallery.thumb}'></td><td class='gallery_info'><table><tr><td>Category:</td><td class='desc cat-${gallery.category}'>${gallery.category}</td></tr><tr><td>Rating:</td><td class='desc'>${gallery.rating}</td></tr><tr><td>Images:</td><td class='desc'>${gallery.filecount}</td></tr><tr><td>Uploaded:</td><td class='desc'>${new Date(gallery.posted*1000).toLocaleString('en-GB')}</td></tr><tr><td>Tags:</td><td><table>${tagsParser(gallery.tags)}</table></td></tr><tr><td>Size:</td><td class='desc'>${mediaSize(gallery.filesize)}</td></tr><tr><td>Torrent:</td><td class='desc'><a class='cms-ignore' href='https://exhentai.org/gallerytorrents.php?gid=${gallery.gid}&t=${gallery.token}' target='_blank' rel='noreferrer'>Search</a></td></tr></table></td></tr></table></div></div>`});
						element_message.insertBefore(container, element_message.firstElementChild.nextSibling);
						scrollElement(container.parentNode.scrollHeight, "messages");
						gallery_anchors[_a].classList.remove("fetchingMedia");
					}
				}
				// cache embed html in database and remove fetching tag
				script.db[gallery_id] = container.innerHTML;
				bdPluginStorage.set(script.file, "db", script.db);
			}
			// remove sadpanda images
			const sadpandas = messages.querySelectorAll("img[href*='exhentai.org']");
			if (sadpandas[0]) {
				while(sadpandas[0]) {
					sadpandas[0].remove();
				}
			}
		}
		else {
			log("error", "sadpandaFetch - galleries returns empty?", resp);
		}
		script.check.sadpanda = false;
	},
	chanHandler = function(resp, {href, hrefSplit, archive, postnumber}) {
		// fetch knitting image board information
		let container;
		const thread = resp[postnumber[0]],
		post = thread.posts && thread.posts[postnumber[1]] ? thread.posts[postnumber[1]] : thread.op,
		thread_id = `${post.board.shortname}_${postnumber[1] ? `${postnumber[0]}_p${postnumber[1]}` : postnumber[0]}`,
		is_reply = thread.posts && thread.posts[postnumber[1]] ? true : false,
		counts = thread.posts ? (function(posts) {
			let reply = 0, media = 1;
			for (let _p_k=Object.keys(posts), _p=_p_k.length; _p--;) {
				reply++;
				if (posts[_p_k[_p]].media) {
					media++;
				}
			}
			return [reply, media];
		})(thread.posts) : [0,1],
		chan_anchors = document.getElementsByClassName("messages")[0].getElementsByClassName(`anchor_${thread_id}`);
		for (let _a=chan_anchors.length; _a--;) {
			const element_message = chan_anchors[_a].closest(".message");
			if (!element_message.getElementsByClassName(`post_${thread_id}`).length) {
				container = _createElement("div", {className: `accessory customMedia knittingboard post_${thread_id}`, innerHTML: `<div class='embed-2diOCQ flex-3B1Tl4 embed'><div class='embedPill-3sYS1X ${script.chan.nsfw.includes(hrefSplit[3]) ? "board-nsfw" : "board-sfw"}'></div><div class='embedInner-t4ag7g'><table><tr><td colspan='4'><div class='thread_head'><a class='embedProvider-1KNREX size12-1IGJl9 weightNormal-3gw0Lm cms-ignore' href='http://boards.4chan.org/${post.board.shortname}/' target='_blank' rel='noreferrer'>4chan /${post.board.shortname}/ - ${post.board.name}</a><table class='thread_data'><tr><td rowspan='2'><span class='thread_posttype'>${is_reply ? "Reply" : "OP"}</span></td><td>Replies:</td><td>${counts[0]}</td></tr><tr><td>Images:</td><td>${counts[1]}</td></tr></table></div><div class='thread_link marginTop4-2rEBfJ '>Thread: <a class='cms-ignore' href='https://boards.4chan.org/${post.board.shortname}/thread/${postnumber[0]}' target='_blank' rel='noreferrer'>https://boards.4chan.org/${post.board.shortname}/thread/${postnumber[0]}</a><span class='size14-1wjlWP weightMedium-13x9Y8 custom_warning'>${post.deleted == "1" ? "(Deleted)" : post.locked == "1" ? "(Locked)" : ""}</span></div><div class='thread_info marginTop4-2rEBfJ marginBottom4-_yArcI'>${post.title_processed ? `<span class='thread_title' title='${post.title_processed}'>${post.title_processed}</span>` : ""}<span class='thread_creator'>${post.name_processed}</span> <span class='thread_time'>${new Date(post.timestamp*1000).toLocaleString("en-GB")}</span> <span class='thread_postid'><a class='cms-ignore' href='${href}' target='_blank' rel='noreferrer'>No.${post.num}</a></span></div></td></tr><tr><td class='thread_preview'>${post.media && post.media.thumb_link ? `<a class='cms-ignore' href='${post.media.remote_media_link}' target='_blank' rel='noreferrer'><img class='image' src='${post.media.thumb_link}'></a>` : ""}</td><td class='thread_comment' colspan='3'>${post.comment_processed}</td></tr><tr><td class='thread_foot' colspan='4'>Data from <a class='cms-ignore' href='${archive}' target='_blank' rel='noreferrer'>${archive}</a></td></tr></table></div></div>`});
				element_message.insertBefore(container, element_message.firstElementChild.nextSibling);
				scrollElement(container.parentNode.scrollHeight, "messages");
				chan_anchors[_a].classList.remove("fetchingMedia");
				mediaReplace(element_message);
			}
		}
		// cache embed html in database and remove fetching tag
		script.db[thread_id] = container.innerHTML;
		bdPluginStorage.set(script.file, "db", script.db);
		script.check.chan = false;
	},
	archiveHandler = function() {
		// displays the archived links in a modal
		const sadpandaFragment = document.createDocumentFragment(),
		chanFragment = document.createDocumentFragment(),
		deletePreview = function(elem, key, counter) {
			if (elem && key) {
				delete script.db[key];
				bdPluginStorage.set(script.file, "db", script.db);
				elem.parentNode.remove();
				document.getElementById(counter).textContent--;
			}
		};
		BdApi.clearCSS("cms-filters");
		for (let _db_k = Object.keys(script.db), _db=_db_k.length; _db--;) {
			const key = _db_k[_db];
			if (Number.isInteger(parseFloat(key[0]))) {
				const container = _createElement("div", {className: "customMedia sadpanda cms-filter", innerHTML: script.db[key]},
					_createElement("div", {className: "flex-3B1Tl4 cms-archive_delete orrie-tooltip", innerHTML: "<svg class='close-3ejNTg flexChild-1KGW5q' xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 12 12'><g fill='none' fill-rule='evenodd'><path d='M0 0h12v12H0'></path><path class='fill' fill='currentColor' d='M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6'></path></g></svg><div class='orrie-tooltip_text orrie-tooltip_bottom'>Delete</div>", onclick() {deletePreview(this, key, "cms-archive_sadpanda-counter");}})
				);
				container.className += (function(tags) {
					let tagsString = "";
					for (let _t=tags.length; _t--;) {
						tagsString += ` ${tags[_t].textContent}`;
					}
					return tagsString;
				})(container.getElementsByClassName("tag"));
				sadpandaFragment.appendChild(container);
			}
			else {
				chanFragment.appendChild(_createElement("div", {className: `customMedia knittingboard cms-filter ${key.split("_")[0]}`, innerHTML: script.db[key]},
					_createElement("div", {className: "flex-3B1Tl4 cms-archive_delete orrie-tooltip", innerHTML: "<svg class='close-3ejNTg flexChild-1KGW5q' xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 12 12'><g fill='none' fill-rule='evenodd'><path d='M0 0h12v12H0'></path><path class='fill' fill='currentColor' d='M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6'></path></g></svg><div class='orrie-tooltip_text orrie-tooltip_bottom'>Delete</div>", onclick() {deletePreview(this, key, "cms-archive_chan-counter");}})
				));
			}
		}
		return _createElement("div", {className: "modal-3HOjGZ userSelectText-wz4t4g sizeMedium-1-2BNS", innerHTML: "<div class='flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE' style='flex: 0 0 auto;'><div class='flexChild-1KGW5q' style='flex: 1 1 auto;'><h4 class='h4-2IXpeI title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 defaultMarginh4-jAopYe marginReset-3hwONl'>Archive Manager</h4></div><svg class='orrie-button-cancel close-3ejNTg flexChild-1KGW5q' xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 12 12'><g fill='none' fill-rule='evenodd'><path d='M0 0h12v12H0'></path><path class='fill' fill='currentColor' d='M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6'></path></g></svg></div>"}, [
			_createElement("div", {className: "flex-3B1Tl4 directionRow-yNbSvJ justifyCenter-29N31w inner-tqJwAU cms-archive_header", style: "flex: 0 0 auto;"}, [
				_createElement("div", {className: "defaultColor-v22dK1 cursorPointer-3oKATS orrie-centerText", innerHTML: `<div class='size18-ZM4Qv-'>ExHentai (<span id='cms-archive_sadpanda-counter'>${sadpandaFragment.children.length}</span>)</div><div class='divider-1G01Z9 marginTop8-2gOa2N marginBottom8-1mABJ4'></div>`,
					onclick() {
						document.getElementById("cms-archive_sadpanda").classList.toggle("orrie-toggled");
						document.getElementById("cms-archive_chan").classList.add("orrie-toggled");
						this.classList.toggle("cms-archive_active");
						this.nextElementSibling.classList.remove("cms-archive_active");
					}
				}),
				_createElement("div", {className: "defaultColor-v22dK1 cursorPointer-3oKATS orrie-centerText", innerHTML: `<div class='size18-ZM4Qv-'>4chan (<span id='cms-archive_chan-counter'>${chanFragment.children.length}</span>)</div><div class='divider-1G01Z9 marginTop8-2gOa2N marginBottom8-1mABJ4'></div>`,
					onclick() {
						document.getElementById("cms-archive_sadpanda").classList.add("orrie-toggled");
						document.getElementById("cms-archive_chan").classList.toggle("orrie-toggled");
						this.classList.toggle("cms-archive_active");
						this.previousElementSibling.classList.remove("cms-archive_active");
					}
				})
			]),
			_createElement("div", {className: "flex-3B1Tl4 directionRow-yNbSvJ justifyCenter-29N31w inner-tqJwAU border-39Cu-M cms-archive_filter orrie-overflow", style: "flex: 0 0 auto;"},
				_createElement("div", {className: "flex-3B1Tl4 directionRow-yNbSvJ"}, [
					_createElement("input", {className: "input-2YozMi size16-3IvaX_", placeholder: "Filter Content (tags or board)", type: "text", value: "",
						onchange() {
							BdApi.clearCSS("cms-filters");
							BdApi.injectCSS("cms-filters", `.cms-filter:not(.${this.value.replace(/\s+/g,"").split(",").join(", .")}) {display:none;}`);
						}
					}),
					_createElement("div", {className: "flex-3B1Tl4 cms-archive_clean orrie-tooltip orrie-relative", innerHTML: "<svg class='close-3ejNTg flexChild-1KGW5q' xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 12 12'><g fill='none' fill-rule='evenodd'><path d='M0 0h12v12H0'></path><path class='fill' fill='currentColor' d='M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6'></path></g></svg><div class='orrie-tooltip_text orrie-tooltip_bottom'>Clean Filters</div>",
						onclick() {
							this.previousElementSibling.value = "";
							BdApi.clearCSS("cms-filters");
						}
					})
				])
			),
			_createElement("div", {className: "scrollerWrap-2uBjct content-1Cut5s scrollerThemed-19vinI themeGhostHairline-2H8SiW border-39Cu-M"},
				_createElement("div", {className: "scroller-fzNley inner-tqJwAU container-RYiLUQ cms-content"},
					_createElement("div", {className: "cms-archive_container"}, [
						_createElement("div", {className: "orrie-toggled flex-3B1Tl4 directionColumn-2h-LPR", id: "cms-archive_sadpanda"}, sadpandaFragment.children.length ? sadpandaFragment : _createElement("div", {className: "contents-4L4hQM", innerHTML: "<h3 class='titleDefault-1CWM9y buttonBrandLink-3csEAP marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q cms-info-header' style='flex: 1 1 auto;'>Shits Empty Bro</h3>"})),
						_createElement("div", {className: "orrie-toggled flex-3B1Tl4 directionColumn-2h-LPR", id: "cms-archive_chan"}, chanFragment.children.length ? chanFragment : _createElement("div", {className: "contents-4L4hQM", innerHTML: "<h3 class='titleDefault-1CWM9y buttonBrandLink-3csEAP marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q cms-info-header' style='flex: 1 1 auto;'>Shits Empty Bro</h3>"}))
					])
				)
			),
			_createElement("div", {className: "contents-4L4hQM", innerHTML: "<h3 class='titleDefault-1CWM9y buttonBrandLink-3csEAP marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q cms-info-header' style='flex: 1 1 auto;'></h3>", style: "flex: 0 0 auto;"})
		]);
	},
	imagePopHandler = function(wrapper) {
		log("info", "imagePop", wrapper);
		const img = wrapper.lastElementChild;
		if (img.src) {
			const proxy = img.src.split("?")[0];
			if (!/\.gif$/.test(proxy)) {
				const fullSrc = /\/external\//.test(proxy) ? proxy.match(/http[s\/\.][\w\.\-\/]+/g)[0].replace(/https\/|http\//,"https://") : proxy;
				wrapper.href = fullSrc;
				wrapper.style.cssText = "";
				wrapper.removeAttribute("target");
				wrapper.nextElementSibling.classList.add("bip-actions");
				img.classList.add("bip-center");
				img.src = fullSrc;
				img.style.cssText = "";
				img.onload = function() {
					const scaling = this.naturalHeight > window.innerHeight*1.15 || this.naturalWidth > window.innerWidth*1.15,
					html = `${img.naturalWidth}px × ${img.naturalHeight}px${scaling ? ` (scaled to ${img.width}px × ${img.height}px)` : ""}`,
					next = wrapper.nextElementSibling;
					if (!next.classList.contains("bip-description")) {
						wrapper.insertAdjacentHTML("afterend", `<div class='bip-description description-3MVziF userSelectText-wz4t4g'>${html}</div>`);
					}
					else {
						next.innerHTML = html;
					}
					if (scaling) {
						this.addEventListener("click", function() {
							this.classList.toggle("bip-center");
							wrapper.classList.toggle("bip-scroller");
							wrapper.classList.toggle("scroller-fzNley");
							wrapper.parentNode.classList.toggle("scrollerWrap-2uBjct");
						}, false);
					}
				};
				img.onerror = function() {
					this.src = proxy;
					this.onerror = undefined;
				};
			}
		}
	},
	insertCustomMenu = function(className, tooltip) {
		const menuAnchor = document.getElementsByClassName("titleText-2IfpkV")[0] ? document.getElementsByClassName("titleText-2IfpkV")[0].nextElementSibling.nextElementSibling : false;
		if (menuAnchor) {
			const menuIcon = menuAnchor.getElementsByClassName(className)[0];
			if (menuIcon) {
				menuIcon.remove();
			}
			menuAnchor.insertBefore(_createElement("div", {className: `${className} iconMargin-2Js7V9 icon-mr9wAc orrie-relative orrie-tooltip`, innerHTML: `<div class='orrie-tooltip_text orrie-tooltip_bottom'>${tooltip}</div>`,
				onclick() {modalHandler(archiveHandler());}
			}), menuAnchor.firstChild);
		}
	},
	textParser = function(node) {
		// parse messages for text conversion
		if (!script.check.textParser) {
			log("info", "textParser");
			script.check.textParser = true;
			const messages = node.querySelectorAll(".markup:not(.textParserProcessed)");
			for (let _m=messages.length; _m--;) {
				const elem = messages[_m];
				if (elem.firstElementChild && elem.firstElementChild.tagName == "PRE") {
					continue;
				}
				if (elem.innerHTML.match(/&gt;|magnet:\?/)) {
					const textSplit = elem.innerHTML.split("\n");
					for (let _t=textSplit.length; _t--;) {
						let line = textSplit[_t];
						if (/^&gt;/.test(line)) {
							// greentext for the cool kids on the block
							if (script.settings.greentext) {
								textSplit[_t] = `<span class='greentext'>${line}</span>`;
							}
						}
						if (/magnet:\?/.test(line)) {
							// parse magnet links
							textSplit[_t] = line.replace(/(magnet:\?[\w=:%&\-.;/]+)/g, "<a class='cms-ignore' href='$1' target='_blank' rel='noreferrer'>$1</a> (Click to Open in Torrent Client)");
							break;
						}
					}
					elem.innerHTML = textSplit.join("\n");
				}
				elem.classList.add("textParserProcessed");
			}
			script.check.textParser = false;
		}
	},
	createSettingsPanel = function() {
		// settings panel creation
		const settingsFragment = document.createDocumentFragment(),
		settingType = function(key, props) {
			switch(props[1]) {
				case "check":
					const checked = script.settings[key] ? "checked" : "";
					return _createElement("label", {className: "ui-switch-wrapper ui-flex-child", style: "flex: 0 0 auto; right: 0px;"}, [
						_createElement("input", {type: "checkbox", className: "plugin-input ui-switch-checkbox plugin-input-checkbox", checked,
							onchange() {
								settingsSave(key, this.checked);
								settingsAnimate(this, "check", this.checked);
							}
						}),
						_createElement("div", {className: `ui-switch ${checked}`})
					]);
				case "range":
					const value = `${(script.settings[key]*100).toFixed(0)}%`;
					return _createElement("div", {className: "plugin-setting-input-container", innerHTML: `<span class='plugin-setting-label'>${value}</span>`},
						_createElement("input", {className: "plugin-input plugin-input-range", type: "range", max: "1", min: "0", step: "0.01", value: script.settings[key], style: `background: linear-gradient(to right, rgb(114, 137, 218), rgb(114, 137, 218) ${value}, rgb(114, 118, 125) ${value}); margin-left: 10px; float: right;`,
							onchange() {settingsSave(key, this.value);},
							oninput() {settingsAnimate(this, "range", this.value);}
						})
					);
				case "text":
					return _createElement("input", {className: "plugin-input plugin-input-text", placeholder: script.settings[key], type: "text", value: script.settings[key],
						onchange() {settingsSave(key, this.value);}
					});
			}
		};
		for (let _s_k = Object.keys(script.settingsMenu), _s=0, _s_len=_s_k.length; _s<_s_len; _s++) {
			const setting = script.settingsMenu[_s_k[_s]];
			settingsFragment.appendChild(_createElement("div", {className: "ui-flex flex-vertical flex-justify-start flex-align-stretch flex-nowrap ui-switch-item", style: "margin-top: 0px;"}, [
				_createElement("div", {className: "ui-flex flex-horizontal flex-justify-start flex-align-stretch flex-nowrap plugin-setting-input-row", innerHTML: `<h3 class='ui-form-title h3 marginReset-3hwONl ui-flex-child'>${setting[0]}</h3>`},
					_createElement("div", {className: "input-wrapper"}, settingType(_s_k[_s], setting))
				),
				_createElement("div", {className: "ui-form-text style-description marginTop4-2rEBfJ", innerHTML: setting[2]})
			]));
		}
		return _createElement("div", {className: `${script.file} orrie-plugin`}, [
			_createElement("div", {className: "ops-plugin_wrapper"}, [
				_createElement("h2", {className: "h5-3KssQU title-1pmpPr marginReset-3hwONl height16-1qXrGy weightSemiBold-T8sxWH defaultMarginh5-2UwwFY marginBottom8-1mABJ4", innerHTML: "Settings"}),
				_createElement("div", {className: "plugin-controls"}, settingsFragment)
			]),
			_createElement("div", {className: "flex-3B1Tl4 justifyAround-1CVbTI"}, [
				_createElement("a", {href: script.discord, target: "_blank", rel:"noreferrer", innerHTML: "<button type='button' class='button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeSmall-3g6RX8 grow-25YQ8u'>Support (Discord)</button>"}),
				_createElement("a", {href: script.url, target: "_blank", rel:"noreferrer", innerHTML: "<button type='button' class='button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeSmall-3g6RX8 grow-25YQ8u'>Updates</button>"}),
				_createElement("button", {type: "button", className: "button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeSmall-3g6RX8 grow-25YQ8u orrie-buttonRed", innerHTML: `Clean Database (${Object.keys(script.db).length || 0})`,
					onclick() {
						// clean database
						script.db = {};
						bdPluginStorage.set(script.file, "db", {});
						this.innerHTML = "Clean Database (0)";
					}
				})
			]),
			_createElement("div", {className: "orrie-centerText marginTop8-2gOa2N", innerHTML: "Use the Archive Manager to tidy up the database, or clean it alltogether"}),
		]);
	},
	_createElement = function(tag, attributes, children) {
		// element creation
		const element = Object.assign(document.createElement(tag), attributes);
		if (children) {
			if (children.nodeType) {
				element.appendChild(children);
			}
			else {
				for (let _c=0, _c_len=children.length; _c<_c_len; _c++) {
					if (children[_c].nodeType) {
						element.appendChild(children[_c]);
					}
				}
			}
		}
		return element;
	},
	request = function(name, api, handler, method, data) {
		// request handler
		const headers = {
			"Accept": "application/json",
			"Content-Type": "application/json"
		};
		if (name == "imgur") {
			headers.Authorization = "Client-ID b975f50eb16a396";
		}
		fetch(api, {
			method,
			headers,
			body: name == "sadpanda" ? JSON.stringify(data) : null
		}).then(function(resp) {
			if (resp.status >= 200 && resp.status < 300) {
				return resp.json();
			}
			throw new Error(resp.statusText);
		}).then(function(resp) {
			log("info", name, [api, resp, data]);
			handler(resp, data);
		});
	};
	// return class construction
	return class CustomMediaSupport {
		getName() {return script.name;}
		getVersion() {return script.version;}
		getAuthor() {return script.author;}
		getDescription() {return script.desc;}
		// create settings panel
		getSettingsPanel() {
			return createSettingsPanel();
		}
		// start and observer
		load() {}
		start() {
			console.info(`${script.name} v${script.version} started.`);
			settingsLoad();
			BdApi.clearCSS("orrie-plugin");
			BdApi.injectCSS("orrie-plugin", script.css.shared);
			BdApi.injectCSS(script.file, script.css.script);
			insertCustomMenu("cms-menuIcon", `${script.name} Archive`);
			const messages = document.getElementsByClassName("messages")[0];
			if (messages) {
				mediaConvert("messages", messages);
				textParser(messages);
			}
		}
		observer({addedNodes}) {
			const messages = document.getElementsByClassName("messages");
			if (addedNodes.length > 0 && messages.length) {
				const node = addedNodes[0];
				if (node.className) {
					switch(node.className) {
						case "messages-wrapper":
						case "content flex-spacer flex-horizontal":
							if (!document.getElementsByClassName("cms-menuIcon")[0]) {
								insertCustomMenu("cms-menuIcon", `${script.name} Archive`);
							}
							/* falls through */
						case "message-group hide-overflow":
						case "message":
							mediaConvert("messages", node);
							textParser(node);
							break;
						case "embed-2diOCQ flex-3B1Tl4 embed":
						case "wrapperPaused-3y2mev wrapper-GhVnpx":
							mediaConvert("message", node);
							mediaReplace(node);
							break;
						case "message-text":
						case "edited":
							textParser(node);
							break;
						case "modal-2LIEKY":
							if (script.settings.imagePop && !(BdApi.getPlugin('Better Image Popups') && BdApi.getPlugin('Better Image Popups').active)) {
								const wrapper = node.getElementsByClassName("imageWrapper-38T7d9")[0];
								if (wrapper && !node.getElementsByClassName("uploadModal-2KN6Mm")[0]) {
									const wrapperObserver = new MutationObserver(function(mutations) {
										if (mutations[1].addedNodes.length) {
											imagePopHandler(wrapper);
											wrapperObserver.disconnect();
										}
									});
									if (node.getElementsByClassName("imageWrapperInner-BRGZ7A")[0]) {
										wrapperObserver.observe(wrapper,{childList: true});
									}
									else {
										imagePopHandler(wrapper);
									}
									node.classList.add("bip-container");
								}
							}
							break;
					}
				}
			}
		}
		// stop script
		stop() {
			BdApi.clearCSS(script.file);
			BdApi.clearCSS("cms-filters");
			// remove media
			const customMedia = document.getElementsByClassName("customMedia"),
			ignoredLinks = document.getElementsByClassName("cms-ignore"),
			defaultMedia = document.getElementsByClassName("media-toggled"),
			menuIcon = document.getElementsByClassName("cms-menuIcon")[0];
			if (menuIcon) {
				menuIcon.remove();
			}
			if (customMedia[0]) {
				while(customMedia[0]) {
					customMedia[0].remove();
				}
			}
			for (let _l=ignoredLinks.length; _l--;) {
				if (ignoredLinks[_l]) {
					ignoredLinks[_l].classList.remove("cms-ignore");
				}
			}
			for (let _d=defaultMedia.length; _d--;) {
				if (defaultMedia[_d]) {
					defaultMedia[_d].classList.remove("media-toggled");
				}
			}
		}
	};
})();
