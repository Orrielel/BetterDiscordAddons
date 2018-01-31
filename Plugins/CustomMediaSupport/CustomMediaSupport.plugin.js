//META{"name":"CustomMediaSupport", "pname":"Custom Media Support"}*//

/* global bdPluginStorage, BdApi, BDfunctionsDevilBro */

const CustomMediaSupport = (function() {
	// plugin settings
	const script = {
		name: "Custom Media Support",
		file: "CustomMediaSupport",
		version: "1.9.5",
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
				mp3: "audio", ogg: "audio", oga: "audio", wav: "audio", wma: "audio", m4a: "audio", aac: "audio", flac: "audio"
			},
			sites: {
				"vocaroo.com":      ["audio",  4, "https://vocaroo.com/media_command.php?media=*ID*&command=download_webm", "\/i\/",        false],
				"pastebin.com":     ["iframe", 3, "https://pastebin.com/embed_iframe/*ID*",                                 "[\\w\\d]{8}$", true ],
				"wotlabs.net":      ["img",    5, "https://wotlabs.net/sig_dark/eu/*ID*/signature.png",                     "/player/",     false],
				"giant.gfycat.com": ["video",  3, "https://giant.gfycat.com/*ID*.webm",                                     "gfycat.",      true ],
				"gfycat.com":       ["video",  3, "https://thumbs.gfycat.com/*ID*-mobile.mp4",                              "gfycat.",      true ]
			},
			replace: ["i.imgur.com", "giant.gfycat.com", "gfycat.com"]
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
		settings: {embedding: true, loop: true, volume: 0.25, autoplay: false, hoverPlay: false, board: true, sadpanda: true, greentext: true, imagePop: true, debug: false},
		settingsMenu: {
			//          localized                 type     description
			embedding: ["Media Embedding",        "check", "Embeds supported elements"],
			loop:      ["Loop",                   "check", "Loops media"],
			volume:    ["Volume",                 "range", "Default volume &#8213; 25%"],
			autoplay:  ["Autoplay Media",         "check", "Not recommended &#8213; RIP CPU"],
			hoverPlay: ["Play on Hover",          "check", "Play media on mouse hover"],
			board:     ["4chan",                  "check", "Embed 4chan thread links"],
			sadpanda:  ["Sadpanda",               "check", "Embed Sadpanda galleries"],
			greentext: ["Greentext",              "check", "<span class='greentext'>&gt;ISHYGDDT</span>"],
			imagePop:  ["Full Resolution Images", "check", "Replaces images with full resolution ones whilst in popup mode.<br>Images larger than the visible screen will be clickable for pure native previews with scrolling"],
			debug:     ["Debug",                  "check", "Displays verbose stuff into the console"]
		},
		css: {
			script: `
/* custom embeds */
.customMedia .embed-2diOCQ {max-width: unset;}
.customMedia.media-video video {cursor: pointer; border-radius: 2px 2px 0 0; padding-bottom: 32px; width: 25vw; max-height: 25vh;}
.customMedia.media-video.media-large video {width: 50vw; max-height: 50vh;}
.customMedia.media-video video::-webkit-media-controls {padding-top: 32px;}
.customMedia.media-video video::-webkit-media-controls-panel {display: flex !important; opacity: 1 !important;}
.customMedia.media-video .embed-zoom {color: #202225; cursor: pointer; font-size: 30px; font-weight: bold; mix-blend-mode: difference; opacity: 0.15; position: absolute; right: 11px; top: 0;}
.customMedia.media-video:hover .embed-zoom {opacity: 0.80;}
.customMedia.media-video .embed-zoom:hover {opacity: 1;}
.customMedia.media-audio audio {width: 400px;}
.customMedia iframe {max-width: 100%; min-width: 500px; min-height: 300px; max-height: 600px; resize: both; overflow: auto;}
.customMedia table td {color: #FFFFFF; font-size: 0.875rem; padding: 0 2px; vertical-align: top;}
/* exhentai previews */
.customMedia.sadpanda .gallery_info {background-color: #2E3033; border-radius: 5px; padding: 5px 5px 10px;}
.customMedia.sadpanda .gallery_info .desc {color: hsla(0,0%,100%,.7);}
.customMedia.sadpanda .gallery_info .tags span {display: inline-block; margin: 0 3px;}
.customMedia.sadpanda .gallery_preview {padding: 0; width: 1px;}
.customMedia.sadpanda .gallery_preview img {max-height: 250px;}
.customMedia.sadpanda .embed-2diOCQ {max-width: 600px;}
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
.customMedia.knittingboard .embed-2diOCQ {max-width: 600px; min-width: 520px;}
.customMedia.knittingboard .embed-2diOCQ .board-sfw {background-color: #9099D0;}
.customMedia.knittingboard .embed-2diOCQ .board-nsfw {background-color: #FFBEAF;}
.customMedia.knittingboard .embedInner-t4ag7g {width: 100%;}
.customMedia.knittingboard .embedInner-t4ag7g > table {width: 100%;}
.customMedia.knittingboard .thread_head {position: relative;}
.customMedia.knittingboard .thread_head .thread_posttype {font-weight: bold; line-height: 30px;}
.customMedia.knittingboard .thread_head .thread_data {display: inline; position: absolute; right: -5px;}
.customMedia.knittingboard .thread_head .thread_data td:last-of-type {text-align: right;}
.customMedia.knittingboard .thread_link {font-weight: 500; white-space: nowrap;}
.customMedia.knittingboard .thread_link span {display: inline; margin: 0 5px;}
.customMedia.knittingboard .thread_info {white-space: nowrap;}
.customMedia.knittingboard .thread_info .thread_title {display: inline-block; font-weight: bold; max-width: 278px; overflow: hidden; text-overflow: ellipsis; vertical-align: bottom;}
.customMedia.knittingboard .thread_info .thread_creator {color: #30A75C;}
.customMedia.knittingboard .thread_preview {padding: 0; width: 1px;}
.customMedia.knittingboard .thread_preview img {border-radius: 5px; display: inline-block; height: unset; max-height: 200px; max-width: 200px;}
.customMedia.knittingboard .thread_comment {background-color: #2E3033; border-radius: 5px; padding: 5px 5px 10px;}
.customMedia.knittingboard .thread_foot {padding: 10px 2px 0;}
.custom_warning {color: #F32323;}
.greentext {color: #709900;}
/* BetterImagePopups */
.bip-container .scrollerWrap-2uBjct {display: unset; position: unset; height: unset; min-height: unset; flex: unset;}
.bip-container .imageWrapper-38T7d9 {display: table; margin: 0 auto;}
.bip-container .bip-scroller {display: inline-block; max-height: calc(100vh - 140px); max-width: calc(100vw - 160px); overflow: auto;}
.bip-container .bip-scroller img {margin-bottom: -5px;}
.bip-container .bip-scroller::-webkit-scrollbar-corner {background: rgba(0,0,0,0);}
.bip-container .bip-center {max-height: calc(100vh - 140px); max-width: calc(100vw - 160px);}
.bip-container .bip-actions {display: table; margin: 0 auto; user-select: auto;}
.bip-container .downloadLink-wANcd8 {text-transform: capitalize;}
/* Archive */
.cms-menuIcon {background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAASCAYAAABrXO8xAAABfElEQVR42rWSu4rCQBiF51n2VVJsZSVEkWjjXQOCooUajeJdtLNR8QJaKYiCl85SEDvxCbb3BbY4y5nCDSiSxoGTGf7/fJOTnwguj8fz5XK5rtFoFKFQ6KXYc7vdV3olpKrqdzwevw8GA3S7XXQ6nZdibzgcQtf1OxkRDAZ/1+s1NpsNuL/Rw0NGRCIRtNttZLNZGIbxVrlcDq1WS8aWYLPZRLlcZqS3qlQqqNfrHwALhcIjHs+feSOHw8Z0OkWv1+P5Sfl8/h/ko9FoIBAIyOJiscB+v8dut8N4PJZJEokEwuHwwxOLxSBY5G2KomA0GklwuVxiu93ifD7jdrvJfT6fw+fzoVQqgYxIp9MoFotwOp0S7Pf7mEwmmM1mWK1WOBwOOB6PuFwujCoHRkbw21KpFGFbopc/gjBNE5lMhlOzJXoZV9RqNSvI349Ttoo1KygHJFhk9mq1SslzMpm06qnPC4SmaSe/3//Dm+yIXjKCy+FwmF6vF3ZEL5k/rZRshi+9vygAAAAASUVORK5CYII=) no-repeat center; opacity: 0.6;}
.cms-menuIcon:hover {opacity: 1;}
.cms-archive_container {margin: 10px 0;}
.cms-archive_container .customMedia {margin: 5px;}
.cms-archive_container .customMedia.sadpanda .embed-2diOCQ, .cms-archive_container .customMedia.knittingboard .embed-2diOCQ {max-width: unset;}
.cms-archive_container .embedInner-t4ag7g, .cms-archive_container .embedInner-t4ag7g > table {width: 100%;}
			`,
			shared: `
.orrie-plugin .buttonBrandFilled-3Mv0Ra a {color: #FFFFFF !important;}
.orrie-buttonRed, .bda-slist .orrie-buttonRed {background-color: #F04747 !important;}
.orrie-buttonRed:hover, .bda-slist .orrie-buttonRed:hover {background-color: #FD5D5D !important;}
.orrie-toggled {display: none !important;}
.orrie-centerText {text-align: center;}
.orrie-inputRequired::before {color: #F04747; content: "*"; font-size: 20px; font-weight: 700; margin-left: 2px; position: absolute; z-index: 1;}
.theme-dark .orrie-plugin {color: #B0B6B9;}
			`
		},
		db: {}
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
	settingsAnimate = function(elem, type, data) {
		// animate settings changes
		switch(type) {
			case "check":
				elem.nextElementSibling.classList.toggle("checked");
				break;
			case "range":
				const value = `${(data*100).toFixed(0)}%`;
				elem.previousElementSibling.textContent = value;
				elem.style.background = `linear-gradient(to right, rgb(114, 137, 218), rgb(114, 137, 218) ${value}, rgb(114, 118, 125) ${value})`;
				break;
			case "text":
				break;
			default:
				break;
		}
	},
	cleanDB = function(elem) {
		// clean database
		script.db = {};
		bdPluginStorage.set(script.file, "db", {});
		elem.innerHTML = "Clean Database (0)";
	},
	log = function(method, title, data) {
		// logging function
		if (script.settings.debug) {
			console[method](`%c[${script.file}]%c ${title}`, "color: purple; font-weight: bold;", "", new Date().toLocaleTimeString("en-GB"), data ? data : "");
		}
	},
	forceScrolling = function(elemHeight, parentClass) {
		// force board scrolling
		const parent = document.getElementsByClassName(parentClass)[0];
		parent.scrollTop += elemHeight;
	},
	removeMedia = function() {
		// remove media
		const customMedia = document.getElementsByClassName("customMedia");
		if (customMedia[0]) {
			while(customMedia[0]) {
				const ignoredLinks = customMedia[0].getElementsByClassName("linkIgnore");
				for (let _l=0, _l_len=ignoredLinks.length; _l<_l_len; _l++) {
					if (ignoredLinks[_l]) {
						ignoredLinks[_l].classList.remove("linkIgnore");
					}
				}
				customMedia[0].remove();
			}
		}
	},
	mediaConvert = function(reCheck) {
		// main media function -- checks every anchor element in messages
		if (!script.check.media) {
			script.check.media = true;
			const gallery = {
				"method":"gdata",
				"gidlist":[]
			},
			links = reCheck ? document.getElementsByClassName("messages")[0].querySelectorAll("a:not([class]), a.customMediaLink") : document.getElementsByClassName("messages")[0].querySelectorAll("a:not(.linkIgnore)");
			log("info", "mediaConvert", links);
			for (let _l=0, _l_len=links.length; _l<_l_len; _l++) {
				const link = links[_l];
				if (link.getAttribute("href")) {
					let href = decodeURI(encodeURI(link.getAttribute("href").replace("http:", "https:").replace(".gifv", ".mp4")));
					const hrefCheck = href.match(/\.(\w+)$|4chan.org|exhentai.org\/g\/|gfycat.com|vocaroo.com|pastebin.com|wotlabs.net/),
					message = link.closest(".message");
					if (hrefCheck && message) {
						const message_body = message.firstElementChild,
						hrefSplit = href.split("/");
						let container;
						switch(hrefSplit[2]) {
							case "exhentai.org":
								const gallery_id = `${hrefSplit[4]}_${hrefSplit[5]}`;
								if (script.settings.sadpanda && !link.classList.contains("fetchingMedia") && message.querySelectorAll(`#gallery_${gallery_id}`).length === 0) {
									link.classList.add("customMediaLink",`anchor_${gallery_id}`);
									if (script.db[gallery_id]) {
										container = _createElement("div", {className: "accessory customMedia sadpanda", id: `gallery_${gallery_id}`, innerHTML: script.db[gallery_id]});
										message_body.parentNode.insertBefore(container, message_body.nextSibling);
										forceScrolling(container.scrollHeight, "messages");
									}
									else {
										link.classList.add("fetchingMedia");
										gallery.gidlist.push([hrefSplit[4], hrefSplit[5]]);
									}
								}
								break;
							case "boards.4chan.org":
								if (!hrefSplit[5]) {
									break;
								}
								const postnumber = hrefSplit[5].match(/\d+/g),
								thread_id = `${hrefSplit[3]}_${postnumber[1] ? hrefSplit[5].replace("#","_") : hrefSplit[5]}`;
								if (script.settings.board && !link.classList.contains("fetchingMedia") && message.querySelectorAll(`#post_${thread_id}`).length === 0) {
									link.classList.add("customMediaLink",`anchor_${thread_id}`);
									if (script.db[thread_id]) {
										container = _createElement("div", {className: "accessory customMedia knittingboard", id: `post_${thread_id}`, innerHTML: script.db[thread_id]});
										message_body.parentNode.insertBefore(container, message_body.nextSibling);
										forceScrolling(container.scrollHeight, "messages");
									}
									else {
										link.classList.add("fetchingMedia");
										if (!script.check.chan) {
											script.check.chan = true;
											const archive = (function(archives) {
												for (let _a_k = Object.keys(archives), _a=0, _a_len=_a_k.length; _a<_a_len; _a++) {
													if (archives[_a_k[_a]].includes(hrefSplit[3])) {
														return _a_k[_a];
													}
												}
												return false;
											})(script.chan.archives);
											if (archive) {
												request("4chan", `https://cors-anywhere.herokuapp.com/${archive}/_/api/chan/thread/?board=${hrefSplit[3]}&num=${postnumber[0]}`, chanHandler, "GET", {href, hrefSplit, archive});
											}
										}
									}
								}
								break;
							default:
								if (script.settings.embedding) {
									let fileMedia = false,
									fileSite = script.media.sites[hrefSplit[2]];
									if (fileSite && new RegExp(fileSite[3], "g").test(href)) {
										href = fileSite[2].replace("*ID*", hrefSplit[fileSite[1]].match(/\w+/)[0]);
										fileMedia = fileSite[0];
									}
									else {
										fileMedia = hrefCheck && hrefCheck[1] ? script.media.types[hrefCheck[1].toLowerCase()] : false;
										fileSite = false;
									}
									// only continues if mediaCheck is true -- as in, the embedding doesn't already exist
									if ((fileMedia || fileSite) && mediaCheck(message, href)) {
										link.classList.add("customMediaLink");
										mediaEmbedding(fileMedia, fileSite, href, hrefSplit, message, message_body);
									}
								}
								break;
						}
					}
				}
				link.classList.add("linkIgnore");
			}
			// fetch Sadpanda data if gallery links where found
			if (gallery.gidlist.length > 0 && !script.check.sadpanda) {
				script.check.sadpanda = true;
				request("sadpanda", "https://e-hentai.org/api.php", sadpandaHandler, "POST", gallery);
			}
			script.check.media = false;
		}
	},
	mediaEmbedding = function(fileMedia, fileSite, href, hrefSplit, message, message_body) {
		// embed supported media
		log("info", "mediaEmbedding", {fileMedia, fileSite, href, hrefSplit, message, message_body});
		const container = _createElement("div", {className: `accessory customMedia media-${fileMedia}`, check: href}, [
			_createElement("div", {className: "embed-2diOCQ flex-3B1Tl4 embed"}, [
				_createElement("div", {className: "embedPill-3sYS1X", style: `background-color:#${Math.random().toString(16).substr(2,6)};`}),
				_createElement("div", {className: "embedInner-t4ag7g"}, [
					_createElement(fileMedia, (function() {
						switch(fileMedia) {
							case "video":
							case "audio":
								return {check: href, controls: true, preload: "metadata", loop: script.settings.loop, autoplay: script.settings.autoplay,
									onclick(){if (this.paused) {this.play();}else {this.pause();}},
									onloadedmetadata() {
										if (fileMedia == "video") {
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
											this.parentNode.appendChild(_createElement("div", {className: "embed-zoom", innerHTML: "❐",
												onclick() {container.classList.toggle("media-large");}
											}));
										}
										this.volume = script.settings.volume;
										forceScrolling(this.scrollHeight, "messages");
										// remove original accessory previews if they exist
										if (fileSite && fileSite[4] || script.media.replace.includes(hrefSplit[2])) {
											const replaceMedia = message.querySelectorAll(".accessory:not(.customMedia)");
											if (replaceMedia[0].firstElementChild) {
												replaceMedia[0].firstElementChild.remove();
											}
										}
									}
								};
							case "img":
							case "iframe":
								return {"className": fileMedia, src: href, check: href, allowFullscreen: true};
							default:
								log("error", "mediaEmbed", href);
						}
					})(),
					[
						_createElement("source", {src: href,
							onerror() {
								container.classList.remove(`media-${fileMedia}`);
								this.parentNode.parentNode.innerHTML = "Error 403/404 - Media unavailable";
							}
						})
					])
				])
			])
		]);
		message_body.parentNode.insertBefore(container, message_body.nextSibling);
		// remove original accessory previews if they exist
		if (fileSite && fileSite[4] || script.media.replace.includes(hrefSplit[2])) {
			const replaceMedia = message.querySelectorAll(".accessory:not(.customMedia)");
			if (replaceMedia[0].firstElementChild) {
				replaceMedia[0].firstElementChild.remove();
			}
		}
	},
	mediaCheck = function(message, href) {
		const media_elements = message.getElementsByClassName("customMedia");
		if (media_elements.length !== 0) {
			for (let _cm=0, _cm_len=media_elements.length; _cm<_cm_len; _cm++) {
				if (media_elements[_cm].check == href) {
					return false;
				}
				else if (_cm == _cm_len) {
					return true;
				}
			}
		}
		else {
			return true;
		}
	},
	sadpandaHandler = function(resp) {
		// fetch sadpanda gallery information
		const galleries = resp.gmetadata;
		if (galleries) {
			const messages = document.getElementsByClassName("messages")[0];
			for (let _g=0, _g_len=galleries.length; _g<_g_len; _g++) {
				let container;
				const gallery = galleries[_g],
				gallery_id = `${gallery.gid}_${gallery.token}`,
				gallery_tags = (function(tags) {
					let tagsString = "";
					for (let _t=0, _t_len=tags.length; _t<_t_len; _t++) {
						tagsString += `<span><a class='linkIgnore' href='https://exhentai.org/tag/${tags[_t].replace(/\s/g, "+")}' target='_blank' rel='noreferrer'>${tags[_t]}</a></span>`;
					}
					return tagsString;
				})(gallery.tags),
				gallery_size = (function(filesize) {
					let l = 0;
					while(filesize >= 1024) {
						filesize = filesize/1024;
						l++;
					}
					return `${filesize.toFixed(3)} ${["Bytes","KB","MB","GB"][l]}`;
				})(gallery.filesize),
				gallery_anchors = messages.getElementsByClassName(`anchor_${gallery_id}`);
				for (let _a=0, _a_len=gallery_anchors.length; _a<_a_len; _a++) {
					const element_message = gallery_anchors[_a].closest(".message");
					if (element_message.querySelectorAll(`#gallery_${gallery_id}`).length === 0) {
						container = _createElement("div", {className: "accessory customMedia sadpanda", id: `gallery_${gallery_id}`, innerHTML: `<div class='embed-2diOCQ flex-3B1Tl4 embed'><div class='embedPill-3sYS1X cat-${gallery.category}'></div><div class='embedInner-t4ag7g'><table><tr><td colspan='2'><div class='marginTop4-2rEBfJ'><a class='embedProvider-1KNREX size12-1IGJl9 weightNormal-3gw0Lm linkIgnore' href='https://exhentai.org/' target='_blank' rel='noreferrer'>ExHentai</a></div><div class='marginTop4-2rEBfJ marginBottom4-_yArcI'><a class='embedTitleLink-1IGDvg embedLink-2Cft4i embedTitle-2e667Z size14-1wjlWP weightMedium-13x9Y8 linkIgnore' href='https://exhentai.org/g/${gallery.gid}/${gallery.token}/' target='_blank' rel='noreferrer'>${gallery.title}</a>${gallery.expunged ? " <span class='custom_warning'>(Expunged)</span>": ""}</div></td></tr><tr><td class='gallery_preview'><img class='image' src='${gallery.thumb}'></td><td class='gallery_info'><table><tr><td>Category:</td><td class='desc cat-${gallery.category}'>${gallery.category}</td></tr><tr><td>Rating:</td><td class='desc'>${gallery.rating}</td></tr><tr><td>Images:</td><td class='desc'>${gallery.filecount}</td></tr><tr><td>Uploaded:</td><td class='desc'>${new Date(gallery.posted*1000).toLocaleString('en-GB')}</td></tr><tr><td>Tags:</td><td class='tags'>${gallery_tags}</td></tr><tr><td>Size:</td><td class='desc'>${gallery_size}</td></tr><tr><td>Torrent:</td><td class='desc'><a class='linkIgnore' href='https://exhentai.org/gallerytorrents.php?gid=${gallery.gid}&t=${gallery.token}' target='_blank' rel='noreferrer'>Search</a></td></tr></table></td></tr></table></div></div>`});
						element_message.insertBefore(container, element_message.firstElementChild.nextSibling);
						forceScrolling(container.scrollHeight, "messages");
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
	chanHandler = function(resp, {href, hrefSplit, archive}) {
		// fetch knitting image board information
		let container;
		const postnumber = hrefSplit[5].match(/\d+/g),
		thread = resp[postnumber[0]],
		post = thread.posts[postnumber[1]] ? thread.posts[postnumber[1]] : thread.op,
		thread_id = `${post.board.shortname}_${postnumber[1] ? `${postnumber[0]}_p${postnumber[1]}` : postnumber[0]}`,
		is_reply = thread.posts[postnumber[1]] ? true : false,
		counts = (function(posts) {
			let reply = 0, media = 0;
			for (let _p_k = Object.keys(posts), _p=0, _p_len=_p_k.length; _p<_p_len; _p++) {
				reply++;
				if (posts[_p_k[_p]].media) {
					media++;
				}
			}
			return [reply, media];
		})(thread.posts),
		chan_anchors = document.getElementsByClassName("messages")[0].getElementsByClassName(`anchor_${thread_id}`);
		for (let _a=0, _a_len=chan_anchors.length; _a<_a_len; _a++) {
			const element_message = chan_anchors[_a].closest(".message");
			if (element_message.querySelectorAll(`#post_${thread_id}`).length === 0) {
				container = _createElement("div", {className: "accessory customMedia knittingboard", id: `post_${thread_id}`, innerHTML: `<div class='embed-2diOCQ flex-3B1Tl4 embed'><div class='embedPill-3sYS1X ${script.chan.nsfw.includes(hrefSplit[3]) ? "board-nsfw" : "board-sfw"}'></div><div class='embedInner-t4ag7g'><table cellspacing='0'><tr><td colspan='4'><div class='thread_head'><a class='embedProvider-1KNREX size12-1IGJl9 weightNormal-3gw0Lm linkIgnore' href='http://boards.4chan.org/${post.board.shortname}/' target='_blank' rel='noreferrer'>4chan /${post.board.shortname}/ - ${post.board.name}</a><table class='thread_data'><tr><td rowspan='2'><span class='thread_posttype'>${is_reply ? "Reply" : "OP"}</span></td><td>Replies:</td><td>${counts[0]}</td></tr><tr><td>Images:</td><td>${counts[1]}</td></tr></table></div><div class='thread_link marginTop4-2rEBfJ '>Thread: <a class='linkIgnore' href='https://boards.4chan.org/${post.board.shortname}/thread/${postnumber[0]}' target='_blank' rel='noreferrer'>https://boards.4chan.org/${post.board.shortname}/thread/${postnumber[0]}</a><span class='embedTitleLink-1IGDvg embedLink-2Cft4i embedTitle-2e667Z size14-1wjlWP weightMedium-13x9Y8 custom_warning'>${post.deleted == "1" ? "(Deleted)" : post.locked == "1" ? "(Locked)" : ""}</span></div><div class='thread_info marginTop4-2rEBfJ marginBottom4-_yArcI'><span class='thread_title' title='${post.title_processed ? post.title_processed : ""}'>${post.title_processed ? post.title_processed : ""}</span> <span class='thread_creator'>${post.name_processed}</span> <span class='thread_time'>${new Date(post.timestamp*1000).toLocaleString("en-GB")}</span> <span class='thread_postid'><a class='linkIgnore' href='${href}' target='_blank' rel='noreferrer'>No.${post.num}</a></span></div></td></tr><tr><td class='thread_preview'>${post.media && post.media.thumb_link ? `<a class='linkIgnore' href='${post.media.remote_media_link}' target='_blank' rel='noreferrer'><img class='image' src='${post.media.thumb_link}'></a>` : ""}</td><td class='thread_comment' colspan='3'>${post.comment_processed}</td></tr><tr><td class='thread_foot' colspan='4'>Data from <a class='linkIgnore' href='${archive}' target='_blank' rel='noreferrer'>${archive}</a></td></tr></table></div></div>`});
				element_message.insertBefore(container, element_message.firstElementChild.nextSibling);
				forceScrolling(container.scrollHeight, "messages");
				chan_anchors[_a].classList.remove("fetchingMedia");
			}
		}
		// cache embed html in database and remove fetching tag
		script.db[thread_id] = container.innerHTML;
		bdPluginStorage.set(script.file, "db", script.db);
		script.check.chan = false;
	},
	archiveHandler = function() {
		// displays the archived links in a modal
		return _createElement("span", {className: `${script.file}Modal orriePluginModal DevilBro-modal`, innerHTML: "<div class='backdrop-2ohBEd'></div>"}, [
			_createElement("div", {className: "modal-2LIEKY"}, [
				_createElement("div", {className: "inner-1_1f7b"}, [
					_createElement("div", {className: "modal-3HOjGZ sizeMedium-1-2BNS", innerHTML: "<div class='flex-3B1Tl4 flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE' style='flex: 0 0 auto;'><div class='flexChild-1KGW5q' style='flex: 1 1 auto;'><h4 class='h4-2IXpeI title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 defaultMarginh4-jAopYe marginReset-3hwONl'>Archive</h4></div><svg class='btn-cancel close-3ejNTg flexChild-1KGW5q' xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 12 12'><g fill='none' fill-rule='evenodd'><path d='M0 0h12v12H0'></path><path class='fill' fill='currentColor' d='M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6'></path></g></svg></div>"}, [
						_createElement("div", {className: "scrollerWrap-2uBjct content-1Cut5s scrollerThemed-19vinI themeGhostHairline-2H8SiW"}, [
							_createElement("div", {className: "scroller-fzNley inner-tqJwAU container-RYiLUQ border-39Cu-M cms-content"}, (function(database) {
								const sadpandaFragment = document.createDocumentFragment(),
								chanFragment = document.createDocumentFragment();
								for (let _db_k = Object.keys(database), _db=0, _db_len = _db_k.length; _db<_db_len; _db++) {
									const key = _db_k[_db];
									if (Number.isInteger(parseFloat(key[0]))) {
										sadpandaFragment.appendChild(_createElement("div", {className: "customMedia sadpanda", innerHTML: database[key]}));
									}
									else {
										chanFragment.appendChild(_createElement("div", {className: "customMedia knittingboard", innerHTML: database[key]}));
									}
								}
								return [
									_createElement("div", {className: "cms-archive_container"}, [
										_createElement("div", {className: "defaultColor-v22dK1 app-XZYfmp cursorPointer-3oKATS orrie-centerText", innerHTML: `<svg class='iconDefault-xzclSQ iconTransition-VhWJ85$ closed-2Hef-I' width='18' height='18' viewBox='0 0 24 24'><path fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M7 10L12 15 17 10'></path></svg><div class='size18-ZM4Qv-'>ExHentai</div><div class='divider-1G01Z9 marginTop8-2gOa2N marginBottom8-1mABJ4'></div>`, onclick() {this.nextElementSibling.classList.toggle("orrie-toggled"); this.firstElementChild.classList.toggle("closed-2Hef-I");}}),
										_createElement("div", {className: "orrie-toggled flex-3B1Tl4 directionColumn-2h-LPR"}, sadpandaFragment)
									]),
									_createElement("div", {className: "cms-archive_container"}, [
										_createElement("div", {className: "defaultColor-v22dK1 app-XZYfmp cursorPointer-3oKATS orrie-centerText", innerHTML: `<svg class='iconDefault-xzclSQ iconTransition-VhWJ85$ closed-2Hef-I' width='18' height='18' viewBox='0 0 24 24'><path fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M7 10L12 15 17 10'></path></svg><div class='size18-ZM4Qv-'>4chan</div><div class='divider-1G01Z9 marginTop8-2gOa2N marginBottom8-1mABJ4'></div>`, onclick() {this.nextElementSibling.classList.toggle("orrie-toggled"); this.firstElementChild.classList.toggle("closed-2Hef-I");}}),
										_createElement("div", {className: "orrie-toggled flex-3B1Tl4 directionColumn-2h-LPR"}, chanFragment)
									])
								];
							})(script.db))
						]),
						_createElement("div", {className: "contentsDefault-nt2Ym5 contents-4L4hQM contentsFilled-3M8HCx contents-4L4hQM", innerHTML: "<div class='contentsDefault-nt2Ym5 contents-4L4hQM contentsFilled-3M8HCx contents-4L4hQM'><h3 class='titleDefault-1CWM9y buttonBrandLink-3csEAP marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q' style='flex: 1 1 auto;' id='cms-stream_status'></h3></div>", style: "flex: 0 0 auto;"})
					])
				])
			])
		]);
	},
	textParser = function() {
		// parse messages for text conversion
		if (!script.check.textParser) {
			log("info", "greenText", "checking");
			script.check.textParser = true;
			const messages = document.getElementsByClassName("messages")[0].querySelectorAll(".markup:not(.textParserProcessed)");
			for (let _m=0, _m_len=messages.length; _m<_m_len; _m++) {
				const elem = messages[_m];
				if (elem.firstElementChild && elem.firstElementChild.tagName == "PRE") {
					continue;
				}
				let elemHtml = elem.innerHTML;
				if (elemHtml.match(/&gt;|magnet:\?/)) {
					const textSplit = elemHtml.replace(/<!--[\s\w\/\-:]+>/g, "").split("\n");
					for (let _t=0, _t_len=textSplit.length; _t<_t_len; _t++) {
						const line = textSplit[_t];
						switch(true) {
							case /^&gt;/.test(line):
								// greentext for the cool kids on the block
								if (script.settings.greentext) {
									elemHtml = elemHtml.replace(new RegExp(line.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"),"g"), `<span class='greentext'>${line}</span>`);
								}
								break;
							case /magnet:\?/.test(line):
								// parse magnet links
								elemHtml = elemHtml.replace(/(magnet:\?[\w=:%&\-.;/]+)/g, "<a class='linkIgnore' href='$1' target='_blank' rel='noreferrer'>$1</a> (Click to Open in Torrent Client)");
								break;
							default:
								break;
						}
					}
					elem.innerHTML = elemHtml;
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
					return _createElement("div", {className: "plugin-setting-input-container", innerHTML: `<span class='plugin-setting-label'>${value}</span>`}, [
						_createElement("input", {className: "plugin-input plugin-input-range", type: "range", max: "1", min: "0", step: "0.01", value: script.settings[key], style: `background: linear-gradient(to right, rgb(114, 137, 218), rgb(114, 137, 218) ${value}, rgb(114, 118, 125) ${value}); margin-left: 10px; float: right;`,
							onchange() {settingsSave(key, this.value);},
							oninput() {settingsAnimate(this, "range", this.value);}
						})
					]);
				case "text":
					return _createElement("input", {className: "plugin-input plugin-input-text", placeholder: script.settings[key], type: "text", value: script.settings[key],
						onchange() {settingsSave(key, this.value);}
					});
				default:
					return "";
			}
		};
		for (let _s_k = Object.keys(script.settingsMenu), _s=0, _s_len=_s_k.length; _s<_s_len; _s++) {
			const setting = script.settingsMenu[_s_k[_s]];
			settingsFragment.appendChild(_createElement("div", {className: "ui-flex flex-vertical flex-justify-start flex-align-stretch flex-nowrap ui-switch-item", style: "margin-top: 0px;"}, [
				_createElement("div", {className: "ui-flex flex-horizontal flex-justify-start flex-align-stretch flex-nowrap plugin-setting-input-row", innerHTML: `<h3 class='ui-form-title h3 marginReset-3hwONl ui-flex-child'>${setting[0]}</h3>`}, [
					_createElement("div", {className: "input-wrapper"}, settingType(_s_k[_s], setting))
				]),
				_createElement("div", {className: "ui-form-text style-description marginTop4-2rEBfJ", innerHTML: setting[2]})
			]));
		}
		return _createElement("div", {className: `${script.file} orrie-plugin`}, [
			_createElement("div", {className: "ops-plugin_wrapper"}, [
				_createElement("h2", {className: "h5-3KssQU title-1pmpPr marginReset-3hwONl height16-1qXrGy weightSemiBold-T8sxWH defaultMarginh5-2UwwFY marginBottom8-1mABJ4", innerHTML: "Settings"}),
				_createElement("div", {className: "plugin-controls"}, settingsFragment)
			]),
			_createElement("div", {className: "flex-3B1Tl4 justifyAround-1CVbTI"}, [
				_createElement("a", {href: script.discord, target: "_blank", rel:"noreferrer", innerHTML: "<button type='button' class='button-2t3of8 smallGrow-2_7ZaC buttonBrandFilled-3Mv0Ra'>Support (Discord)</button>"}),
				_createElement("a", {href: script.url, target: "_blank", rel:"noreferrer", innerHTML: "<button type='button' class='button-2t3of8 smallGrow-2_7ZaC buttonBrandFilled-3Mv0Ra'>Updates</button>"}),
				_createElement("button", {type: "button", className: "button-2t3of8 smallGrow-2_7ZaC buttonBrandFilled-3Mv0Ra orrie-buttonRed", innerHTML: `Clean Database (${Object.keys(script.db).length || 0})`, onclick() {cleanDB(this);}})
			]),
			_createElement("div", {className: "orrie-centerText marginTop8-2gOa2N", innerHTML: "It's recommended to clean the database on a regular basis"}),
		]);
	},
	_createElement = function(tag, attributes, children) {
		// element creation
		const element = document.createElement(tag);
		if (attributes) {
			for (let _e_k = Object.keys(attributes), _e=_e_k.length; _e>0; _e--) {
				element[_e_k[_e-1]] = attributes[_e_k[_e-1]];
			}
		}
		if (children) {
			if (children.nodeType) {
				element.appendChild(children);
			}
			else {
				for (let _c=0, _c_len=children.length; _c<_c_len; _c++) {
					element.appendChild(children[_c]);
				}
			}
		}
		return element;
	},
	request = function (name, api, handler, method, data) {
		// request handler
		fetch(api, {
			method,
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json"
			},
			body: (name == "sadpanda") ? JSON.stringify(data) : null
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
		// load, start and observer
		load() {
			console.info(`${script.name} v${script.version} loaded.`);
			BdApi.clearCSS("orrie-plugin");
			BdApi.injectCSS("orrie-plugin", script.css.shared);
		}
		start() {
			settingsLoad();
			script.db = bdPluginStorage.get(script.file, "db") || {};
			BdApi.injectCSS(script.file, script.css.script);
			if (typeof BDfunctionsDevilBro !== "object") {
				document.head.appendChild(_createElement("script", {type: "text/javascript", src: "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"}));
			}
			if (document.getElementsByClassName("messages")[0]) {
				mediaConvert(true);
				textParser();
				const archiveIcon = document.getElementsByClassName("cms-menuIcon")[0],
				menuAnchor = document.getElementsByClassName("topic-1KFf6J")[0].nextElementSibling;
				if (archiveIcon) {
					archiveIcon.remove(); 
				}
				menuAnchor.insertBefore(_createElement("div", {className: "cms-menuIcon iconMargin-2Js7V9 icon-mr9wAc", title: "Custom Media Support Archive",
					onclick() {BDfunctionsDevilBro.appendModal(archiveHandler());}
				}), menuAnchor.firstChild);
			}
		}
		observer({addedNodes}) {
			if (addedNodes.length > 0 && document.getElementsByClassName("messages")) {
				const node = addedNodes[0];
				switch(node.className) {
					case "messages-wrapper":
						const archiveIcon = document.getElementsByClassName("cms-menuIcon")[0];
						if (!archiveIcon) {
							const menuAnchor = document.getElementsByClassName("topic-1KFf6J")[0].nextElementSibling;
							menuAnchor.insertBefore(_createElement("div", {className: "cms-menuIcon iconMargin-2Js7V9 icon-mr9wAc", title: "Custom Media Support Archive",
								onclick() {BDfunctionsDevilBro.appendModal(archiveHandler());}
							}), menuAnchor.firstChild);
						}
						mediaConvert(false);
						textParser();
						break;
					case "message-group hide-overflow":
					case "message":
						mediaConvert(false);
						textParser();
						break;
					case "message-text":
						setTimeout(function() {
							textParser();
						}, 250);
						break;
					case "modal-2LIEKY":
					case "imageWrapper-38T7d9":
						if (script.settings.imagePop) {
							const img = node.getElementsByClassName("imageWrapper-38T7d9")[0] && !node.getElementsByClassName("uploadModal-2KN6Mm")[0] ? node.getElementsByClassName("imageWrapper-38T7d9")[0].lastElementChild : (node.className == "imageWrapper-38T7d9" ? node.lastElementChild : false);
							if (img.src && !img.classList.contains("imagePlaceholder-jWw28v")) {
								log("info", "imagePop", node);
								const fullSrc = img.src.split("?")[0],
								wrapper = img.parentNode;
								wrapper.href = fullSrc;
								wrapper.style.cssText = "";
								wrapper.removeAttribute("target");
								wrapper.nextElementSibling.classList.add("bip-actions");
								img.classList.add("bip-center");
								img.src = fullSrc;
								img.style.cssText = "";
								img.onload = function(){
									wrapper.insertAdjacentHTML("afterend", `<div class='bip-actions description-3MVziF'>${img.naturalWidth}px × ${img.naturalHeight}px${this.naturalHeight > window.innerHeight*1.25 ? ` (scaled to ${img.width}px × ${img.height}px)</div>` : ""}`);
									if (this.naturalHeight > window.innerHeight*1.25) {
										this.addEventListener("click", function() {
											this.classList.toggle("bip-center");
											wrapper.classList.toggle("bip-scroller");
											wrapper.classList.toggle("scroller-fzNley");
											wrapper.parentNode.classList.toggle("scrollerWrap-2uBjct");
										}, false);
									}
								};
								if (node.className == "imageWrapper-38T7d9") {
									node.closest(".modal-2LIEKY").classList.add("bip-container");
								}
								else {
									node.classList.add("bip-container");
								}
							}
						}
						break;
					default:
				}
			}
		}
		// stop script
		stop() {
			BdApi.clearCSS(script.file);
			removeMedia();
		}
	};
})();
