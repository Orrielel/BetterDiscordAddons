//META{"name":"CustomMediaSupport", "pname":"Custom Media Support"}*//

/* global bdPluginStorage, BdApi, PluginUtilities */

const CustomMediaSupport = (function(){
	// plugin settings
	const script = {
		name: "Custom Media Support",
		file: "CustomMediaSupport",
		version: "1.7.5",
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
				svg: "iframe"
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
				"https://archive.4plebs.org": ["adv","f","hr","o","pol","s4s","sp","tg","trv","tv","x"],
				"https://desuarchive.org": ["a","aco","an","c","co","d","fit","gif","his","int","k","m","mlp","qa","r9k","tg","trash","vr","wsg"],
				"https://boards.fireden.net": ["a","cm","ic","sci","tg","v","vg","y"],
				"https://archiveofsins.com": ["h","hc","hm","r","s","soc"],
				"https://archive.nyafuu.org": ["bant","asp","c","e","n","news","out","p","toy","vip","vp","w","wg","wsr"],
				"https://archive.loveisover.me": ["c","d","e","i","lgbt","t","u"],
				"https://archived.moe": ["3","a","aco","adv","an","asp","b","biz","c","cgl","ck","cm","co","con","d","diy","e","f","fa","fit","g","gd","gif","h","hc","his","hm","hr","i","ic","int","jp","k","lgbt","lit","m","mlp","mu","n","news","o","out","p","po","pol","q","qa","qst","r","r9k","s","s4s","sci","soc","sp","t","tg","toy","trash","trv","tv","u","v","vg","vip","vp","vr","w","wg","wsg","wsr","x","y"]
			}
		},
		settings: {embedding: true, loop: true, volume: 0.25, autoplay: false, hoverPlay: false, board: true, sadpanda: true, greentext: true, pinktext: false, debug: false},
		settingsMenu: {
			//          localized           type     description
			embedding: ["Media Embedding",  "check", "Embeds supported elements"],
			loop:      ["Loop",             "check", "Loops media, requires media embedding on"],
			volume:    ["Volume",           "range", "Default volume -- 25%"],
			autoplay:  ["Autoplay Media",   "check", "Not recommended"],
			hoverPlay: ["Play on Hover",    "check", "Play media on mouse hover"],
			board:     ["4chan",            "check", "Embed 4chan thread links"],
			sadpanda:  ["Sadpanda",         "check", "Embed Sadpanda galleries"],
			greentext: ["Greentext",        "check", "<span class='greentext'>&gt;ISHYGDDT</span>"],
			pinktext:  ["Pinktext",         "check", "<span class='pinktext'>&lt;Traps are..?</span>"],
			debug:     ["Debug",            "check", "Displays verbose stuff into the console"]
		},
		css: {
			script: `
.customMedia .embed-wrapper {max-width: unset;}
.customMedia.media-video video {cursor: pointer; width: 400px; max-height: 576px;}
.customMedia.media-video.media-large video {width: 1024px; max-height: 720px;}
.customMedia.media-video .embed-zoom {color: #202225; cursor: pointer; font-size: 30px; font-weight: bold; opacity: 0.15; position: absolute; right: 11px;}
.customMedia.media-video:hover .embed-zoom {opacity: 0.80;}
.customMedia.media-video .embed-zoom:hover {opacity: 1;}
.customMedia video {border-radius: 2px 2px 0 0; padding-bottom: 32px;}
.customMedia video::-webkit-media-controls {padding-top: 32px;}
.customMedia video::-webkit-media-controls-panel {display: flex !important; opacity: 1 !important;}
.customMedia iframe {max-width: 100%; min-width: 500px; min-height: 300px; max-height: 600px; resize: both; overflow: auto;}
.customMedia table td {font-size: 0.875rem; padding: 0 2px; vertical-align: top;}
.customMedia .gallery_info .desc {color: hsla(0,0%,100%,.7);}
.customMedia .gallery_info .tags span {display: inline-block; margin: 0 3px;}
.customMedia .gallery_preview {max-height: 250px;}
.customMedia.sadpanda .embed-wrapper {max-width: 600px;}
.customMedia.sadpanda .embed-wrapper .embed-color-pill.cat-Doujinshi {background-color: #FF2525;}
.customMedia.sadpanda .embed-wrapper .embed-color-pill.cat-Manga {background-color: #FFB225;}
.customMedia.sadpanda .embed-wrapper .embed-color-pill.cat-Artistcg {background-color: #E8D825;}
.customMedia.sadpanda .embed-wrapper .embed-color-pill.cat-Gamecg {background-color: #259225;}
.customMedia.sadpanda .embed-wrapper .embed-color-pill.cat-Western {background-color: #9AFF38;}
.customMedia.sadpanda .embed-wrapper .embed-color-pill.cat-Non-H {background-color: #38ACFF;}
.customMedia.sadpanda .embed-wrapper .embed-color-pill.cat-Imageset {background-color: #2525FF;}
.customMedia.sadpanda .embed-wrapper .embed-color-pill.cat-Cosplay {background-color: #652594;}
.customMedia.sadpanda .embed-wrapper .embed-color-pill.cat-Asianporn {background-color: #F2A7F2;}
.customMedia.sadpanda .embed-wrapper .embed-color-pill.cat-Misc {background-colorcolor: #D3D3D3;}
.customMedia.sadpanda .embed-wrapper .gallery_info .cat-Doujinshi {color: #FF2525;}
.customMedia.sadpanda .embed-wrapper .gallery_info .cat-Manga {color: #FFB225;}
.customMedia.sadpanda .embed-wrapper .gallery_info .cat-Artistcg {color: #E8D825;}
.customMedia.sadpanda .embed-wrapper .gallery_info .cat-Gamecg {color: #259225;}
.customMedia.sadpanda .embed-wrapper .gallery_info .cat-Western {color: #9AFF38;}
.customMedia.sadpanda .embed-wrapper .gallery_info .cat-Non-H {color: #38ACFF;}
.customMedia.sadpanda .embed-wrapper .gallery_info .cat-Imageset {color: #2525FF;}
.customMedia.sadpanda .embed-wrapper .gallery_info .cat-Cosplay {color: #652594;}
.customMedia.sadpanda .embed-wrapper .gallery_info .cat-Asianporn {color: #F2A7F2;}
.customMedia.sadpanda .embed-wrapper .gallery_info .cat-Misc {color: #D3D3D3;}
.customMedia.knittingboard {color: #AAAAAA;}
.customMedia.knittingboard .embed-wrapper {max-width: 600px; min-width: 520px;}
.customMedia.knittingboard .embed-wrapper .board-sfw {background-color: #9099D0;}
.customMedia.knittingboard .embed-wrapper .board-nsfw {background-color: #FFBEAF;}
.customMedia.knittingboard .embed > table {width: 100%;}
.customMedia.knittingboard .thread_head {position: relative;}
.customMedia.knittingboard .thread_head .thread_posttype {font-weight: bold; line-height: 30px;}
.customMedia.knittingboard .thread_head .thread_data {display: inline; position: absolute; right: -5px;}
.customMedia.knittingboard .thread_head .thread_data td:last-of-type {text-align: right;}
.customMedia.knittingboard .thread_link {font-weight: 500; margin-bottom: 5px; white-space: nowrap;}
.customMedia.knittingboard .thread_link span {display: inline; margin: 0 5px;}
.customMedia.knittingboard .thread_info {margin-bottom: 5px; white-space: nowrap;}
.customMedia.knittingboard .thread_info .thread_title {display: inline-block; font-weight: bold; max-width: 278px; overflow: hidden; text-overflow: ellipsis; vertical-align: bottom;}
.customMedia.knittingboard .thread_info .thread_creator {color: #30A75C;}
.customMedia.knittingboard .thread_preview {padding: 0; width: 1px;}
.customMedia.knittingboard .thread_preview img {border-radius: 5px; display: inline-block; height: unset; max-height: 200px; max-width: 200px;}
.customMedia.knittingboard .thread_comment {background-color: #2E3033; border-radius: 5px; padding: 5px 5px 10px;}
.customMedia.knittingboard .thread_foot {padding: 10px 2px 0;}
.custom_warning {color: #F32323;}
.greentext {color: #709900;}
.pinktext {color: #F25E83;}
.CustomMediaSupport.orriePluginSettings .orriePluginFooter button {width: 26%; margin: 0 3.6%;}
			`,
			shared: `
.orriePluginSettings {margin-top: -30px;}
.orriePluginSettings .orriePluginHeader {border-bottom: 1px solid #3f4146; margin-bottom: 5px; padding-bottom: 5px;}
.orriePluginSettings .orriePluginTable {margin: 0 !important;}
.orriePluginSettings .orriePluginTable table {width: 100%;}
.orriePluginSettings .orriePluginTable td {vertical-align: middle;}
.orriePluginSettings .orriePluginTable input[type=checkbox] {-webkit-appearance: none; border: 2px solid #CDCDCD; border-color: hsla(0,0%,100%,.2); border-radius: 3px; cursor: pointer; height: 18px; width: 18px; position: relative; -webkit-transition: .15s;}
.orriePluginSettings .orriePluginTable input[type=checkbox]:checked {background-color: #3A71C1; border: none;}
.orriePluginSettings .orriePluginTable input[type=checkbox]:before, .orriePluginSettings .orriePluginTable input[type=checkbox]:checked:before {color: #FFFFFF; position: absolute; top: 0; left: 0; height: 100%; width: 100%; line-height: 100%; text-align: center;}
.orriePluginSettings .orriePluginTable input[type=checkbox]:checked:before {content: '✔'; line-height: unset;}
.orriePluginSettings .orriePluginTable input[type=range]:focus {outline: none;}
.orriePluginSettings .orriePluginTable input[type=range] {-webkit-appearance: none; margin: 0;}
.orriePluginSettings .orriePluginTable input[type=range]::-webkit-slider-runnable-track {border: 2px solid #CFD8DC; cursor: pointer; height: 8px;}
.orriePluginSettings .orriePluginTable input[type=range]:focus::-webkit-slider-runnable-track {background: #787C84;}
.orriePluginSettings .orriePluginTable input[type=range]::-webkit-slider-thumb {-webkit-appearance: none; background: #45484E; border: 2px solid #CFD8DC; border-radius: 3px; cursor: pointer; height: 16px; margin-top: -6px; width: 8px;}
.orriePluginSettings .orriePluginTable input[type=text] {color: #B0B6B9; background: inherit; border: 2px solid #CDCDCD; border-color: hsla(0,0%,100%,.2); border-radius: 3px; padding: 0 2px;}
.orriePluginSettings .orriePluginFooter {border-top: 1px solid #3f4146; font-size: 12px; font-weight: 700; margin-bottom: 5px; padding-top: 5px;}
.orriePluginSettings .orriePluginFooter button a {color: #FFFFFF;}
.orriePluginSettings .orriePluginNotice {text-align: center;}
.orriePluginSettings .orriePluginFooter button {background: #3A71C1; color: #FFFFFF; border-radius: 5px; height: 20px; margin: 2px 8%;}
.theme-dark .orriePluginSettings {color: #B0B6B9;}
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
		log("info", "Settings Loaded");
	},
	checkForUpdate = function() {
		var libraryScript = document.getElementById('zeresLibraryScript');
		if (!libraryScript) {
			libraryScript = _createElement("script", "", "", {id: "zeresLibraryScript", type: "text/javascript", src: "https://rauenzi.github.io/BetterDiscordAddons/Plugins/PluginLibrary.js"});
			document.head.appendChild(libraryScript);
		}
		if (typeof window.ZeresLibrary !== "undefined") {
			PluginUtilities.checkForUpdate(script.name, script.version, script.raw);
			PluginUtilities.showToast(`${script.name} ${script.version} has started.`);
		}
		else {
			libraryScript.addEventListener("load", function() {
				PluginUtilities.checkForUpdate(script.name, script.version, script.raw);
				PluginUtilities.showToast(`${script.name} ${script.version} has started.`);
			});
		}
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
					const hrefCheck = href.match(/\.(\w+)$|4chan.org|exhentai.org\/g\/|gfycat.com|vocaroo.com|pastebin.com|wotlabs.net/);
					if (hrefCheck) {
						const message = link.closest('.message'),
						message_body = message.getElementsByClassName("body")[0],
						hrefSplit = href.split("/");
						let container;
						switch(hrefSplit[2]) {
							case "exhentai.org":
								const gallery_id = `${hrefSplit[4]}_${hrefSplit[5]}`;
								if (script.settings.sadpanda && !link.classList.contains("fetchingMedia") && message.querySelectorAll(`#gallery_${gallery_id}`).length === 0) {
									link.classList.add("customMediaLink",`anchor_${gallery_id}`);
									if (script.db[gallery_id]) {
										container = _createElement("div", "accessory customMedia sadpanda", script.db[gallery_id], {id: `gallery_${gallery_id}`});
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
								const thread_id = `${hrefSplit[3]}_${/#/.test(hrefSplit[5]) ? hrefSplit[5].replace("#","_") : hrefSplit[5]}`;
								if (script.settings.board && !link.classList.contains("fetchingMedia") && message.querySelectorAll(`#post_${thread_id}`).length === 0) {
									link.classList.add("customMediaLink",`anchor_${thread_id}`);
									if (script.db[thread_id]) {
										container = _createElement("div", "accessory customMedia knittingboard", script.db[thread_id], {id: `post_${thread_id}`});
										message_body.parentNode.insertBefore(container, message_body.nextSibling);
										forceScrolling(container.scrollHeight, "messages");
									}
									else {
										link.classList.add("fetchingMedia");
										chanFetch({api: `/_/api/chan/thread/?board=${hrefSplit[3]}&num=${hrefSplit[5]}`, href, hrefSplit, message, message_body, link});
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
										mediaEmbedding({fileMedia, fileSite, href, hrefSplit, message, message_body});
									}
								}
								break;
						}
					}
				}
				link.classList.add("linkIgnore");
			}
			// fetch Sadpanda data if gallery links where found
			if (gallery.gidlist.length > 0) {
				sadpandaFetch(gallery);
			}
			script.check.media = false;
		}
	},
	mediaEmbedding = function(data) {
		// embed supported media
		log("info", "mediaEmbedding", data);
		const container = _createElement("div", `accessory customMedia media-${data.fileMedia}`, `<div class='embed-wrapper'><div class='embed-color-pill' style='background-color:#${Math.random().toString(16).substr(2,6)};'></div><div class='embed'></div></div>`, {"check": data.href}),
		mediaEmbed = (function(fileMedia) {
			switch(fileMedia) {
				case "video":
				case "audio":
					return _createElement(fileMedia, fileMedia, `<source src='${data.href}'>`, {controls: true, preload: "metadata", loop: script.settings.loop, autoplay: script.settings.autoplay, check: data.href, html: `<source src='${data.href}'>`, onclick() {if (this.paused) {this.play();} else {this.pause();}}});
				case "img":
				case "iframe":
					return _createElement(fileMedia, fileMedia, "", {src: data.href, check: data.href, allowFullscreen: true});
				default:
					log("error", "mediaEmbed", data);
			}
		})(data.fileMedia);
		container.firstElementChild.firstElementChild.nextElementSibling.appendChild(mediaEmbed);
		data.message_body.parentNode.insertBefore(container, data.message_body.nextSibling);

		// scrolling, volume reduction and checking for 404
		forceScrolling(mediaEmbed.scrollHeight, "messages");
		const delayInterval = setInterval(function() {
			let endInterval = false;
			switch(data.fileMedia) {
				case "video":
				case "audio":
					if (mediaEmbed.readyState === 4 || mediaEmbed.networkState == 3) {
						if (mediaEmbed.networkState == 3) {
							container.classList.remove(`media-${data.fileMedia}`);
							mediaEmbed.parentNode.innerHTML = "Error 403/404 - Media unavailable";
						}
						else {
							if (data.fileMedia == "video") {
								if (script.settings.hoverPlay) {
									mediaEmbed.onmouseover = function() {
										if (this.paused) {
											this.play();
										}
									};
									mediaEmbed.onmouseout = function() {
										this.pause();
									};
								}
								mediaEmbed.parentNode.appendChild(_createElement("div", "embed-zoom", "❐", {onclick() {container.classList.toggle("media-large");}}));
							}
							mediaEmbed.volume = script.settings.volume;
						}
						endInterval = true;
					}
					break;
				default:
					endInterval = true;
					break;
			}
			if (endInterval) {
				// remove original accessory previews if they exist
				if (data.fileSite && data.fileSite[4] || script.media.replace.indexOf(data.hrefSplit[2]) !== -1) {
					const replaceMedia = data.message.querySelectorAll(".accessory:not(.customMedia)");
					if (replaceMedia[0].firstElementChild) {
						replaceMedia[0].firstElementChild.remove();
					}
				}
				forceScrolling(mediaEmbed.scrollHeight, "messages");
				clearInterval(delayInterval);
			}
		}, 50);
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
	sadpandaFetch = function(data) {
		// fetch sadpanda gallery information
		if (!script.check.sadpanda) {
			script.check.sadpanda = true;
			fetch('https://e-hentai.org/api.php', {
				method: "POST",
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			}).then(function(resp) {
				if (resp.status >= 200 && resp.status < 300) {
					return resp.json();
				}
				throw new Error(resp.statusText);
			}).then(function(resp) {
				log("info", "sadpandaFetch", [data, resp]);
				const galleries = resp.gmetadata;
				if (galleries) {
					const messages = document.getElementsByClassName("messages")[0];
					for (let _g=0, _g_len=galleries.length; _g<_g_len; _g++) {
						const gallery = galleries[_g],
						gallery_id = `${gallery.gid}_${gallery.token}`,
						gallery_anchors = messages.getElementsByClassName(`anchor_${gallery_id}`);
						for (let _a=0, _a_len=gallery_anchors.length; _a<_a_len; _a++) {
							const element_message = gallery_anchors[_a].closest(".message");
							if (element_message.querySelectorAll(`#gallery_${gallery_id}`).length === 0) {
								const gallery_tags = (function(tags) {
									let tagsString = "";
									for (let _t=0, _t_len=tags.length; _t<_t_len; _t++) {
										tagsString += `<span><a class='linkIgnore' href='https://exhentai.org/tag/${tags[_t].replace(/\s/g, "+")}' target='_blank' rel='noreferrer'>${tags[_t]}</a></span>`;
									}
									return tagsString;
								})(gallery.tags),
								gallery_size = (function(filesize) {
									let l = 0;
									while(filesize >= 1024){
										filesize = filesize/1024;
										l++;
									}
									return `${filesize.toFixed(3)} ${["Bytes","KB","MB","GB"][l]}`;
								})(gallery.filesize),
								container = _createElement("div", "accessory customMedia sadpanda", `<div class='embed-wrapper'><div class='embed-color-pill cat-${gallery.category}'></div><div class='embed'><table><tr><td colspan='2'><div><a class='embed-provider linkIgnore' href='https://exhentai.org/' target='_blank' rel='noreferrer'>ExHentai</a></div><div><a class='embed-title linkIgnore' href='https://exhentai.org/g/${gallery.gid}/${gallery.token}/' target='_blank' rel='noreferrer'>${gallery.title}</a>${gallery.expunged ? " <span class='custom_warning'>(Expunged)</span>": ""}</div></td></tr><tr><td><div><img class='image gallery_preview' src='${gallery.thumb}'></div></td><td><table class='gallery_info'><tr><td>Category:</td><td class='desc cat-${gallery.category}'>${gallery.category}</td></tr><tr><td>Rating:</td><td class='desc'>${gallery.rating}</td></tr><tr><td>Images:</td><td class='desc'>${gallery.filecount}</td></tr><tr><td>Uploaded:</td><td class='desc'>${new Date(gallery.posted*1000).toLocaleString('en-GB')}</td></tr><tr><td>Tags:</td><td class='tags'>${gallery_tags}</td></tr><tr><td>Size:</td><td class='desc'>${gallery_size}</td></tr><tr><td>Torrent:</td><td class='desc'><a class='linkIgnore' href='https://exhentai.org/gallerytorrents.php?gid=${gallery.gid}&t=${gallery.token}' target='_blank' rel='noreferrer'>Search</a></td></tr></table></td></tr></table></div></div>`, {id: `gallery_${gallery_id}`});
								element_message.getElementsByClassName("body")[0].parentNode.insertBefore(container, element_message.getElementsByClassName("body")[0].nextSibling);
								forceScrolling(container.scrollHeight, "messages");
								// cache embed html in database and remove fetching tag
								script.db[gallery_id] = container.innerHTML;
								bdPluginStorage.set(script.file, "db", script.db);
								gallery_anchors[_a].classList.remove("fetchingMedia");
							}
						}
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
			});
			script.check.sadpanda = false;
		}
	},
	chanFetch = function(data) {
		// fetch knitting image board information
		if (!script.check.chan) {
			script.check.chan = true;
			const archive = (function(archives) {
				for (let _a_k = Object.keys(archives), _a=0, _a_len=_a_k.length; _a<_a_len; _a++) {
					if (archives[_a_k[_a]].indexOf(data.hrefSplit[3]) !== -1) {
						return _a_k[_a];
					}
				}
				return false;
			})(script.chan.archives);
			if (archive) {
				const container = _createElement("div", "accessory customMedia knittingboard", `<div class='embed-wrapper'><div class='embed-color-pill'></div><div class='embed'>Fetching Data from <a class='linkIgnore' href='${archive}' target='_blank' rel='noreferrer'>${archive}</a>...</div></div>`);
				data.message_body.parentNode.insertBefore(container, data.message_body.nextSibling);
				forceScrolling(container.scrollHeight, "messages");
				fetch(`https://cors-anywhere.herokuapp.com/${archive}${data.api}`, {
					method: "GET",
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					}
				}).then(function(resp) {
					if (resp.status >= 200 && resp.status < 300) {
						return resp.json();
					}
					throw new Error(resp.statusText);
				}).then(function(resp) {
					log("info", "chanFetch", [data, resp]);
					const postnumber = data.hrefSplit[5].match(/\d+/g),
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
					})(thread.posts);
					container.id = `post_${thread_id}`;
					container.innerHTML = `<div class='embed-wrapper'><div class='embed-color-pill ${script.chan.nsfw.indexOf(data.hrefSplit[3]) !== -1 ? "board-nsfw" : "board-sfw"}'></div><div class='embed'><table cellspacing='0'><tr><td colspan='4'><div class='thread_head'><a class='embed-provider linkIgnore' href='http://boards.4chan.org/${post.board.shortname}/' target='_blank' rel='noreferrer'>4chan /${post.board.shortname}/ - ${post.board.name}</a><table class='thread_data'><tr><td rowspan='2'><span class='thread_posttype'>${is_reply ? "Reply" : "OP"}</span></td><td>Replies:</td><td>${counts[0]}</td></tr><tr><td>Images:</td><td>${counts[1]}</td></tr></table></div><div class='thread_link'>Thread: <a class='linkIgnore' href='https://boards.4chan.org/${post.board.shortname}/thread/${postnumber[0]}' target='_blank' rel='noreferrer'>https://boards.4chan.org/${post.board.shortname}/thread/${postnumber[0]}</a><span class='embed-title custom_warning'>${post.deleted == "1" ? "(Deleted)" : post.locked == "1" ? "(Locked)" : ""}</span></div><div class='thread_info'><span class='thread_title' title='${post.title_processed ? post.title_processed : ""}'>${post.title_processed ? post.title_processed : ""}</span> <span class='thread_creator'>${post.name_processed}</span> <span class='thread_time'>${new Date(post.timestamp*1000).toLocaleString("en-GB")}</span> <span class='thread_postid'><a class='linkIgnore' href='${data.href}' target='_blank' rel='noreferrer'>No.${post.num}</a></span></div></td></tr><tr><td class='thread_preview'>${post.media && post.media.thumb_link ? `<a class='linkIgnore' href='${post.media.remote_media_link}' target='_blank' rel='noreferrer'><img class='image' src='${post.media.thumb_link}'></a>` : ""}</td><td class='thread_comment' colspan='3'>${post.comment_processed}</td></tr><tr><td class='thread_foot' colspan='4'>Data from <a class='linkIgnore' href='${archive}' target='_blank' rel='noreferrer'>${archive}</a></td></tr></table></div></div>`;
					forceScrolling(container.scrollHeight, "messages");
					// cache embed html in database and remove fetching tag
					script.db[thread_id] = container.innerHTML;
					bdPluginStorage.set(script.file, "db", script.db);
					data.link.classList.remove("fetchingMedia");
				});
			}
			else {
				log("error", "chanFetch - no archives support this board", data);
			}
			script.check.chan = false;
		}
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
							case /^&lt;/.test(line):
								// pinktext for the gay kids on the block
								if (script.settings.pinktext) {
									elemHtml = elemHtml.replace(new RegExp(line.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"),"g"), `<span class='pinktext'>${line}</span>`);
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
	_createElement = function(tag, className, html, extra) { // element creation
		const element = document.createElement(tag);
		if (className) {
			element.className = className;
		}
		if (html) {
			element.innerHTML = html;
		}
		if (extra) {
			for (let _e_k = Object.keys(extra), _e=_e_k.length; _e>0; _e--) {
				element[_e_k[_e-1]] = extra[_e_k[_e-1]];
			}
		}
		return element;
	};
	// return class construction
	return class CustomMediaSupport {
		getName() {return script.name;}
		getVersion() {return script.version;}
		getAuthor() {return script.author;}
		getDescription() {return script.desc;}
		// create settings panel
		getSettingsPanel() {
			let settingsOptions = "";
			const settingType = function(key, props) {
				switch(props[1]) {
					case "check":
						return `<tr><td><label for='id_${key}'>${props[0]}</label></td><td><input id='id_${key}' name='${key}' type='checkbox'${script.settings[key] ? " checked=checked" : ""} onchange='BdApi.getPlugin("${script.name}").settingsSave("${key}", this.checked)'/></td><td>${props[2]}</td></tr>`;
					case "range":
						return `<tr><td><label for='id_${key}'>${props[0]}</label></td><td><input id='id_${key}' name='${key}' value='${script.settings[key]}' type='range' min='0' max='1' step='0.05' onchange='BdApi.getPlugin("${script.name}").settingsSave("${key}", this.value)'/></td><td>${props[2]}</td></tr>`;
					case "text":
						return `<tr><td><label for='id_${key}'>${props[0]}</label></td><td><input id='id_${key}' name='${key}' value='${script.settings[key]}' type='text' onchange='BdApi.getPlugin("${script.name}").settingsSave("${key}", this.value)'/></td><td>${props[2]}</td></tr>`;
					default:
						return "";
				}
			};
			for (let _s_k = Object.keys(script.settingsMenu), _s=0, _s_len=_s_k.length; _s<_s_len; _s++) {
				settingsOptions += settingType(_s_k[_s], script.settingsMenu[_s_k[_s]]);
			}
			return `<div class='${script.file} orriePluginSettings'><div class='orriePluginHeader'><span class='bda-name'>${script.name} v${script.version} by ${script.author}</span></div><div class='orriePluginTable'><table>${settingsOptions}</table></div><div class='orriePluginFooter'><button><a href='${script.discord}' target='_blank' rel='noreferrer'>Support (Discord)</a></button><button><a href='${script.url}' target='_blank' rel='noreferrer'>Updates</a></button><button onclick='BdApi.getPlugin(\"${script.name}\").cleanDB(this)'>Clean Database (${Object.keys(script.db).length || 0})</button></div><div class='orriePluginNotice'>It's recommended to clean the database on a regular basis</div></div>`;
		}
		// save settings
		settingsSave(key, value) {
			script.settings[key] = value;
			bdPluginStorage.set(script.file, "settings", script.settings);
			log("info", "Settings Saved", [key, value]);
		}
		// clean database
		cleanDB(elem) {
			script.db = {};
			bdPluginStorage.set(script.file, "db", {});
			elem.innerHTML = "Clean Database (0)";
		}
		// load, start and observer
		load() {
			console.info(`${script.name} v${script.version} loaded.`);
			BdApi.clearCSS("orriePluginSettings");
			BdApi.injectCSS("orriePluginSettings", script.css.shared);
		}
		start() {
			checkForUpdate();
			settingsLoad();
			script.db = bdPluginStorage.get(script.file, "db") || {};
			BdApi.injectCSS(script.file, script.css.script);
			if (document.getElementsByClassName("messages")[0]) {
				mediaConvert(true);
				textParser();
			}
		}
		observer(mutation) {
			if (mutation.addedNodes.length > 0 && document.getElementsByClassName("messages")) {
				switch(mutation.target.className) {
					case "flex-spacer flex-vertical":
						mediaConvert(true);
						textParser();
						break;
					case "messages scroller":
					case "comment":
						mediaConvert(false);
						textParser();
						break;
					case "body":
						setTimeout(function(){
							textParser();
						}, 250);
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
