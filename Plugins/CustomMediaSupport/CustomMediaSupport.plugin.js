//META{"name":"CustomMediaSupport","website":"https://github.com/Orrielel/BetterDiscordAddons/tree/master/Plugins/CustomMediaSupport","source":"https://raw.githubusercontent.com/Orrielel/BetterDiscordAddons/master/Plugins/CustomMediaSupport/CustomMediaSupport.plugin.js"}*//

/* global bdPluginStorage, BdApi */

const CustomMediaSupport = (function() {
	// plugin settings
	const script = {
		name: "Custom Media Support",
		file: "CustomMediaSupport",
		version: "2.6.6",
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
				"exhentai.org": {
					data({href}) {
						return {fileMedia: /\/g\//.test(href) ? "api" : false};
					},
					api(data) {
						if (script.settings.sadpanda && /\/g\//.test(data.href)) {
							const gallery_id = `${data.hrefSplit[4]}_${data.hrefSplit[5]}`;
							if (!data.message.getElementsByClassName(`gallery_${gallery_id}`).length) {
								if (script.archive.sadpanda[gallery_id]) {
									data.message.insertBefore(_createElement("div", {className: `accessory customMedia sadpanda gallery_${gallery_id}`, innerHTML: script.archive.sadpanda[gallery_id]}), data.message_body.nextSibling);
									scrollElement(data.message.scrollHeight, "messages");
								}
								else {
									script.check.sadpanda = true;
									data.apiData = `{"method":"gdata","gidlist":[["${data.hrefSplit[4]}","${data.hrefSplit[5]}"]],"namespace":1}`;
									request("sadpanda", "https://e-hentai.org/api.php", function(resp, {message, message_body}) {
										// fetch sadpanda gallery information
										const gallery = resp.gmetadata[0];
										if (gallery) {
											const tagsOutput = {},
											tagsFilter = [];
											let tagsString = "";
											for (let _t=0, _t_len=gallery.tags.length; _t<_t_len; _t++) {
												const tag_ns = gallery.tags[_t],
												tagSplit = tag_ns.split(":"),
												tag = tagSplit[tagSplit.length-1],
												cat = tagSplit.length == 2 ? tagSplit[0] : "misc";
												if (!tagsOutput[cat]) {tagsOutput[cat] = [];}
												tagsOutput[cat].push(`<div class='tag'><a class='cms-ignore' href='https://exhentai.org/tag/${tag_ns.replace(/\s/g, "+")}' target='_blank' rel='noreferrer'>${tag}</a></div>`);
												tagsFilter.push(tag);
											}
											for (let _to_k=Object.keys(tagsOutput), _to=0, _to_len=_to_k.length; _to<_to_len; _to++) {
												const key = _to_k[_to],
												tagOutput = tagsOutput[key];
												if (tagOutput) {
													tagsString += `<tr><td class='desc'>${key}:</td><td>${tagOutput.join("")}</td></tr>`;
												}
											}
											const gallery_id = `${gallery.gid}_${gallery.token}`,
											container = _createElement("div", {className: `accessory customMedia sadpanda gallery_${gallery_id}`, innerHTML: `<div class='embed-IeVjo6 flex-1O1GKY embed'><div class='embedPill-1Zntps cat-${gallery.category}'></div><div class='embedInner-1-fpTo'><table><tr><td colspan='2'><div><a class='embedProvider-3k5pfl size12-3R0845 weightNormal-WI4TcG cms-ignore' href='https://exhentai.org/' target='_blank' rel='noreferrer'>ExHentai</a></div><div class='marginTop4-2BNfKC marginBottom4-2qk4Hy'><a class='embedTitleLink-1Zla9e embedLink-1G1K1D embedTitle-3OXDkz size14-3iUx6q weightMedium-2iZe9B cms-ignore' href='https://exhentai.org/g/${gallery.gid}/${gallery.token}/' target='_blank' rel='noreferrer'>${gallery.title}</a>${gallery.expunged ? " <span class='custom_warning'>(Expunged)</span>" : ""}</div></td></tr><tr><td class='gallery_preview'><img class='image' src='${gallery.thumb}'></td><td class='gallery_info'><table><tr><td>Category:</td><td class='desc cat-${gallery.category}'>${gallery.category}</td></tr><tr><td>Rating:</td><td class='desc'>${gallery.rating}</td></tr><tr><td>Images:</td><td class='desc'>${gallery.filecount}</td></tr><tr><td>Uploaded:</td><td class='desc'>${new Date(gallery.posted*1000).toLocaleString('en-GB')}</td></tr><tr><td>Tags:</td><td><table>${tagsString}</table></td></tr><tr><td>Size:</td><td class='desc'>${mediaSize(gallery.filesize)}</td></tr><tr><td>Torrent:</td><td class='desc'><a class='cms-ignore' href='https://exhentai.org/gallerytorrents.php?gid=${gallery.gid}&t=${gallery.token}' target='_blank' rel='noreferrer'>Search</a></td></tr></table></td></tr></table></div></div><div class='cms-filter_container orrie-toggled'>${tagsFilter.join(" ")}</div>`});
											message.insertBefore(container, message_body.nextSibling);
											scrollElement(message.scrollHeight, "messages");
											// cache embed html in database
											script.archive.sadpanda[gallery_id] = container.innerHTML;
											bdPluginStorage.set(script.file, "archive", script.archive);
											// remove sadpanda images
											const sadpandas = document.getElementsByClassName("messages")[0].querySelectorAll("img[href*='exhentai.org']");
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
									}, "POST", data);
								}
								if (!script.archive.filter.includes(gallery_id)) {
									script.archive.filter.push(gallery_id);
								}
							}
						}
					}
				},
				"4chan.org": {
					data({href, fileMedia}) {
						return /thread/.test(href) ? {fileMedia: "api"} : {ignoreApi: true, href: href.replace("is2.4chan","i.4cdn")};
					},
					api(data) {
						if (script.settings.board) {
							data.postnumber = data.hrefSplit[5].match(/\d+/g);
							const thread_id = `${data.hrefSplit[3]}_${data.postnumber[1] ? data.hrefSplit[5].replace("#","_") : data.hrefSplit[5]}`;
							if (!data.message.getElementsByClassName(`post_${thread_id}`).length) {
								if (script.archive.chan[thread_id]) {
									data.message.insertBefore(_createElement("div", {className: `accessory customMedia chan post_${thread_id}`, innerHTML: script.archive.chan[thread_id]}), data.message_body.nextSibling);
									scrollElement(data.message.scrollHeight, "messages");
								}
								else {
									if (!script.check.chan) {
										script.check.chan = true;
										data.archive = archiveCheck(data.hrefSplit[3]);
										if (data.archive) {
										request("4chan", `https://cors-anywhere.herokuapp.com/${data.archive}/_/api/chan/thread/?board=${data.hrefSplit[3]}&num=${data.postnumber[0]}`, function(resp, {archive, message, message_body, href, hrefSplit, postnumber}) {
												// fetch knitting image board information
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
												container = _createElement("div", {className: `accessory customMedia chan post_${thread_id}`, innerHTML: `<div class='embed-IeVjo6 flex-1O1GKY embed'><div class='embedPill-1Zntps ${script.chan.nsfw.includes(hrefSplit[3]) ? "board-nsfw" : "board-sfw"}'></div><div class='embedInner-1-fpTo'><table><tr><td colspan='4'><div class='thread_head'><a class='embedProvider-3k5pfl size12-3R0845 weightNormal-WI4TcG cms-ignore' href='http://boards.4chan.org/${post.board.shortname}/' target='_blank' rel='noreferrer'>4chan /${post.board.shortname}/ - ${post.board.name}</a><table class='thread_data'><tr><td rowspan='2'><span class='thread_posttype'>${is_reply ? "Reply" : "OP"}</span></td><td>Replies:</td><td>${counts[0]}</td></tr><tr><td>Images:</td><td>${counts[1]}</td></tr></table></div><div class='thread_link marginTop4-2BNfKC '>Thread: <a class='cms-ignore' href='https://boards.4chan.org/${post.board.shortname}/thread/${postnumber[0]}' target='_blank' rel='noreferrer'>https://boards.4chan.org/${post.board.shortname}/thread/${postnumber[0]}</a><span class='size14-3iUx6q weightMedium-2iZe9B custom_warning'>${post.deleted == "1" ? "(Deleted)" : post.locked == "1" ? "(Locked)" : ""}</span></div><div class='thread_info marginTop4-2BNfKC marginBottom4-2qk4Hy'>${post.title_processed ? `<span class='thread_title' title='${post.title_processed}'>${post.title_processed}</span>` : ""}<span class='thread_creator'>${post.name_processed}</span> <span class='thread_time'>${new Date(post.timestamp*1000).toLocaleString("en-GB")}</span> <span class='thread_postid'><a class='cms-ignore' href='${href}' target='_blank' rel='noreferrer'>No.${post.num}</a></span></div></td></tr><tr><td class='thread_preview'>${post.media && post.media.thumb_link ? `<a class='cms-ignore' href='${post.media.remote_media_link}' target='_blank' rel='noreferrer'><img class='image' src='${post.media.thumb_link}'></a>` : ""}</td><td class='thread_comment' colspan='3'>${post.comment_processed}</td></tr><tr><td class='thread_foot' colspan='4'>Data from <a class='cms-ignore' href='${archive}' target='_blank' rel='noreferrer'>${archive}</a></td></tr></table></div></div><div class='cms-filter_container orrie-toggled'>${post.board.shortname}</div>`});
												message.insertBefore(container, message_body.nextSibling);
												scrollElement(message.scrollHeight, "messages");
												mediaReplace(message);
												// cache embed html in database
												script.archive.chan[thread_id] = container.innerHTML;
												bdPluginStorage.set(script.file, "archive", script.archive);
												script.check.chan = false;
											}, "GET", data);
										}
									}
								}
								if (!script.archive.filter.includes(`thread/${data.postnumber[0]}`)) {
									script.archive.filter.push(`thread/${data.postnumber[0]}`);
								}
								mediaReplace(data.message);
							}
						}
					}
				},
				"imgur.com": {
					data({href, message, fileMedia, fileLink}) {
						const check = message.querySelector(`a.embedTitleLink-1Zla9e[href='${href.replace("//m.","//")}']`);
						if (check && check.closest(".embedContent-3fnYWm").nextElementSibling && /\.jpg|\.jpeg|\.png|\.gif$/.test(check.closest(".embedContent-3fnYWm").nextElementSibling.getAttribute("href"))) {
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
							// dirty fix for discord previews
							if (/gifv/.test(fileLink)) {
								const parsedLink = fileLink.replace("https://i.","").replace(".gifv","");
								if (!script.archive.filter.includes(parsedLink)) {
									script.archive.filter.push(parsedLink);
								}
							}
						}
						return {fileMedia, fileReplace: false, href};
					},
					api(data) {
						request("imgur", `https://cors-anywhere.herokuapp.com/https://api.imgur.com/3/image/${data.fileName}`, function(resp, data) {
							const item = resp.success ? resp.data : false;
							if (item) {
								data.href = item.mp4;
								data.media = "video";
								data.fileTitle = item.title ? item.title : "No Title";
								data.fileFilter = data.href.split("/").slice(-2).join("/");
								data.fileSize = mediaSize(item.mp4_size);
								// store in database to prevent api spam
								if (data.fileSize !== "ERROR") {
									script.archive.url[data.fileLink] = {href: data.href, fileTitle: data.fileTitle, fileSize: data.fileSize};
									bdPluginStorage.set(script.file, "archive", script.archive);
								}
								else {
									log("error", "imgur", item);
								}
								// dirty fix for discord previews
								const parsedLink = data.href.replace("https://","").replace(".mp4","h.jpg");
								if (!script.archive.filter.includes(parsedLink)) {
									script.archive.filter.push(parsedLink);
								}
								mediaEmbedding(data);
							}
						}, "GET", data);
					}
				},
				"gfycat.com": {
					data({href}) {
						return {fileMedia: "video", fileReplace: true, href};
					},
					api(data) {
						request("gfycat", `https://cors-anywhere.herokuapp.com/https://api.gfycat.com/v1/gfycats/${data.fileName}`, function({gfyItem}, data) {
							if (gfyItem) {
								data.href = gfyItem.mp4Url;
								data.fileTitle = gfyItem.gfyName;
								data.fileFilter = data.href.split("/").slice(-2).join("/");
								data.fileSize = mediaSize(gfyItem.mp4Size);
								mediaEmbedding(data);
								// store in database to prevent api spam
								if (data.fileSize !== "ERROR") {
									script.archive.url[data.fileLink] = {href: data.href, fileTitle: data.fileTitle, fileSize: data.fileSize};
									bdPluginStorage.set(script.file, "archive", script.archive);
								}
								else {
									log("error", "gfycat", gfyItem);
								}
							}
						}, "GET", data);
					}
				},
				"steamcommunity.com": {
					data({href}) {
						return {fileMedia: /filedetails/.test(href) ? "api" : false};
					},
					api(data) {
						const file_id = data.href.match(/\d+/g)[0],
						name_id = `steam_${file_id}`;
						if (script.archive.steam[name_id]) {
							data.message.insertBefore(_createElement("div", {className: `accessory customMedia steam ${name_id}`, innerHTML: script.archive.steam[name_id]}), data.message_body.nextSibling);
							scrollElement(data.message.scrollHeight, "messages");
						}
						else {
							data.apiData = `itemcount=1&publishedfileids[0]=${file_id}&format=json`;
							request("steam", `https://cors-anywhere.herokuapp.com/https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/`, function({response}, {message, message_body}) {
								// fetch knitting image board information
								const file = response.publishedfiledetails[0];
								let container;
								if (file.title) {
									const tags = file.tags.map(e => e.tag);
									container = _createElement("div", {className: `accessory customMedia steam ${name_id}`, innerHTML: `<div class='embed-IeVjo6 flex-1O1GKY embed'><div class='embedPill-1Zntps'></div><div class='embedInner-1-fpTo'><div class='embedContentInner-FBnk7v'><div><a tabindex='0' class='anchor-3Z-8Bb embedProviderLink-2Pq1Uw embedLink-1G1K1D embedProvider-3k5pfl size12-3R0845 weightNormal-WI4TcG' href='https://steamcommunity.com/app/${file.creator_app_id}/workshop/' rel='noreferrer noopener' target='_blank' role='button'>Steam Workshop</a></div><div class='marginTop4-2BNfKC'><a tabindex='0' class='anchor-3Z-8Bb embedTitleLink-1Zla9e embedLink-1G1K1D embedTitle-3OXDkz size14-3iUx6q weightMedium-2iZe9B customMediaLink cms-ignore' href='https://steamcommunity.com/sharedfiles/filedetails/?id=${file.publishedfileid}' rel='noreferrer noopener' target='_blank' role='button'>${file.title}</a></div><div class='scrollerWrap-2lJEkd embedInner-1-fpTo scrollerThemed-2oenus themeGhostHairline-DBD-2d marginTop4-2BNfKC'><div class='scroller-2FKFPG embedDescription-1Cuq9a marginTop4-2BNfKC markup textParserProcessed'>${file.description.replace(/\[[\w=:/.?&+*]+\]/g,"")}</div></div><div class='embedFields-2IPs5Z flex-1O1GKY directionRow-3v3tfG wrap-ZIn9Iy marginTop4-2BNfKC'><div class='embedField-1v-Pnh marginTop4-2BNfKC embedFieldInline-3-e-XX'><div class='embedFieldName-NFrena marginBottom4-2qk4Hy size14-3iUx6q weightMedium-2iZe9B'>Subscriptions</div><div class='embedFieldValue-nELq2s size14-3iUx6q weightNormal-WI4TcG markup textParserProcessed'>${file.subscriptions}</div></div><div class='embedField-1v-Pnh marginTop4-2BNfKC embedFieldInline-3-e-XX'><div class='embedFieldName-NFrena marginBottom4-2qk4Hy size14-3iUx6q weightMedium-2iZe9B'>Size</div><div class='embedFieldValue-nELq2s size14-3iUx6q weightNormal-WI4TcG markup textParserProcessed'>${mediaSize(file.file_size)}</div></div></div><div class='embedFields-2IPs5Z flex-1O1GKY directionRow-3v3tfG wrap-ZIn9Iy marginTop4-2BNfKC'><div class='embedField-1v-Pnh marginTop4-2BNfKC embedFieldInline-3-e-XX'><div class='embedFieldName-NFrena marginBottom4-2qk4Hy size14-3iUx6q weightMedium-2iZe9B'>Time Created</div><div class='embedFieldValue-nELq2s size14-3iUx6q weightNormal-WI4TcG markup textParserProcessed'>${new Date(file.time_created*1000).toLocaleDateString("en-GB")} @ ${new Date(file.time_created*1000).toLocaleTimeString("en-GB")}</div></div><div class='embedField-1v-Pnh marginTop4-2BNfKC embedFieldInline-3-e-XX'><div class='embedFieldName-NFrena marginBottom4-2qk4Hy size14-3iUx6q weightMedium-2iZe9B'>Last Updated</div><div class='embedFieldValue-nELq2s size14-3iUx6q weightNormal-WI4TcG markup textParserProcessed'>${new Date(file.time_updated*1000).toLocaleDateString("en-GB")} @ ${new Date(file.time_updated*1000).toLocaleTimeString("en-GB")}</div></div></div></div><div class='embedImage-2W1cML embedMarginLarge-YZDCEs marginTop8-1DLZ1n'><img class='image' src='${file.preview_url}'></div><div class='embedContentInner-FBnk7v'><div class='embedFields-2IPs5Z flex-1O1GKY directionRow-3v3tfG wrap-ZIn9Iy marginTop4-2BNfKC'><div class='embedFieldName-NFrena size14-3iUx6q weightMedium-2iZe9B'>Tags</div><div class='embedFieldValue-nELq2s size14-3iUx6q weightNormal-WI4TcG marginLeft4-3VaXdt textParserProcessed'>${tags.join(", ")}</div></div></div></div></div><div class='cms-filter_container orrie-toggled'>${tags.join(" ")}</div>`});
									// cache embed html in database
									script.archive.steam[name_id] = container.innerHTML;
									bdPluginStorage.set(script.file, "archive", script.archive);
								}
								else {
									container = _createElement("div", {className: `accessory customMedia steam ${name_id}`, innerHTML: `<div class='embed-IeVjo6 flex-1O1GKY embed'><div class='media-error-message'>That item does not exist. It may have been removed by the author.</div></div>`});
								}
								message.insertBefore(container, message_body.nextSibling);
								scrollElement(message.scrollHeight, "messages");
								mediaReplace(message);
							}, "POST", data);
						}
						if (!script.archive.filter.includes(data.fileFilter)) {
							script.archive.filter.push(data.fileFilter);
						}
						mediaReplace(data.message);
					}
				},
				"facebook.com": {
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
				"pastebin.com": {
					data({href, hrefSplit}) {
						return {fileMedia: "iframe", fileReplace: true, href: /[\w\d]{8}$/.test(href) ? `https://pastebin.com/embed_iframe/${hrefSplit[3]}` : false};
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
				"vocaroo.com": {
					data({href, hrefSplit}) {
						return {fileMedia: "audio", fileReplace: false, href: /\/i\//.test(href) ? `https://vocaroo.com/media_command.php?media=${hrefSplit[4]}&command=download_webm` : false};
					}
				},
				"wotlabs.net": {
					data({href, hrefSplit}) {
						return {fileMedia: "img", fileTitle: "Stats from WoTLabs.net", fileReplace: true, href: /\/player\//.test(href) ? `https://wotlabs.net/sig_dark/${hrefSplit[3]}/${hrefSplit[5]}/signature.png` : false};
					}
				},
				"wot-life.com": {
					data({href, hrefSplit}) {
						return {fileMedia: "img", fileTitle: "Stats from WoTLabs.net", fileReplace: true, href: /\/player\//.test(href) ? `https://wotlabs.net/sig_dark/${hrefSplit[3]}/${hrefSplit[5]}/signature.png` : false};
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
			whitelist: ["4chan.org", "exhentai.org", "gfycat.com", "vocaroo.com", "pastebin.com", "wotlabs.net", "wot-life.com", "facebook.com", "instagram.com", "imgur.com", "streamable.com", "steampowered.com", "steamcommunity.com", "ifunny.co"],
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
		settings: {embedding: true, api: true, loop: true, volume: 0.25, preload: true, autoplay: false, hoverPlay: false, board: true, sadpanda: true, greentext: true, debug: false},
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
			imagePop:  ["Full Resolution Images", "check", "Only in dedicated script: <a href='https://github.com/Orrielel/BetterDiscordAddons/tree/master/Plugins/BetterImagePopups' target='_blank'>BetterImagePopups</a>"],
			debug:     ["Debug",                  "check", "Displays verbose stuff into the console"]
		},
		css: {
			script: `
/* custom embeds */
.customMedia {color: hsla(0,0%,100%,0.7);}
.message-group .customMedia {display: flex; margin-top: 8px; padding: 0; position: relative;}
.customMedia table {border-spacing: 0;}
.customMedia table td {font-size: 0.875rem; vertical-align: top;}
.customMedia .embed-IeVjo6 {max-width: unset;}
.customMedia .media-error-message {color: #F04747; margin: 0; max-width: 75vh; padding: 5px 10px;}
.customMedia .metadata-13NcHb {border-radius: 3px; display: flex; height: auto; margin: 0; padding: 10px 12px 35px; top: 0; z-index: auto;}
.customMedia .metadataContent-3c_ZXw {overflow: hidden;}
.customMedia .metadataName-14STf- a {color: #FFFFFF; opacity: 0.6;}
.customMedia .metadataName-14STf-:hover a {opacity: 1;}
.customMedia .metadataButton {cursor: pointer; height: 22px; opacity: 0.6; width: 22px;} /* font-size: 22px; font-weight: bold; */
.customMedia .metadataButton:hover {opacity: 1;}
.customMedia .metadataButton-popout {background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAVCAYAAABc6S4mAAAAbklEQVR4AWP4//8/dkwdYEIVC0Yt2AjEDiTgWlItmA7ik4AD6W5BBRAfwcAI8BzEJ4C34LOgmgqReWHkWLCERHwPv72YFnCSkmLoYwEiiCqxYEGqWYBLDckWjFqwlUT8lTgLKAaELbhLIT6GywIA5SnsLtcbhqwAAAAASUVORK5CYII=) no-repeat center / 18px;}
.customMedia .metadataButton-expand {background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAVCAYAAABc6S4mAAAAO0lEQVR4AWP4//9/8n/aAR+SLRi1IBKIHSjE2fgsUARiBgqx5WC3YNSCUQtGLRi1YCuVMP3rg7s0wj4AGC3DMn4UuAEAAAAASUVORK5CYII=) no-repeat center / 18px;}
.customMedia.media-audio audio {margin-top: 5px; vertical-align: middle; width: 25vw; min-width: 500px;}
.customMedia.media-img img {margin-top: 40px; min-height: 50px; min-width: 400px;}
.customMedia.media-img .imageWrapper-2p5ogY img {position: static;}
.customMedia.media-video video {cursor: pointer; border-radius: 3px 3px 0 0; margin: 0; padding-bottom: 32px; vertical-align: middle; width: auto; max-width: 25vw; max-height: 50vh; min-width: 225px;}
.customMedia.media-video video::-webkit-media-controls {padding-top: 32px;}
.customMedia.media-video.media-large-horizontal video {max-width: calc(100vw - 740px); min-height: 35vh;}
.customMedia.media-video.media-large-vertical video {height: 60vh; max-width: unset; max-height: unset;}
.customMedia.media-video.media-large-horizontal .metadataButton-expand:after, .customMedia.media-video.media-large-vertical .metadataButton-expand:after {border: 3px solid #3A71C1; content: ''; display: inline-flex; height: 9px; margin-left: 1px; vertical-align: middle; width: 13px;}
.customMedia.media-video .metadata-13NcHb {display: none; z-index: 1;}
.customMedia.media-video .imageWrapper-2p5ogY:hover .metadata-13NcHb {display: flex;}
.customMedia.media-iframe iframe {margin-top: 40px; max-width: 100%; min-width: 500px; min-height: 300px; max-height: 600px; resize: both; overflow: auto; vertical-align: middle; z-index: 1;}
.customMedia.media-iframe .metadata-13NcHb {max-width: 100%; min-width: 500px;}
.theme-dark .customMedia.media-iframe iframe {background-color: rgba(46,48,54,.3); border: 1px solid rgba(46,48,54,.6);}
.theme-light .customMedia.media-iframe iframe {background: hsla(0,0%,98%,.3); border: 1px solid hsla(0,0%,80%,.3);}
.CustomMediaSupportModal .customMedia.media-video video {max-height: 80vh; min-height: 50vh; max-width: 90vw;}
.CustomMediaSupportModal .customMedia.media-iframe iframe {height: 80vh !important; width: 90vw !important; max-height: unset; max-width: unset; resize: none;}
.accessory.media-replace .customMedia.media-video video {object-fit: fill; width: 100%;}
.accessory.media-replace .metadataButton-expand {display: none;}
/* player style */
.customMedia ::-webkit-media-controls-current-time-display, .customMedia ::-webkit-media-controls-time-remaining-display {color: #BEBEBE}
.customMedia ::-webkit-media-controls-panel {background-color: #202225; border-radius: 0 0 3px 3px; display: flex !important; opacity: 1 !important;}
.customMedia ::-webkit-media-controls-play-button, .customMedia ::-webkit-media-controls-fullscreen-button, .customMedia ::-webkit-media-controls-mute-button, .customMedia ::-internal-media-controls-download-button {cursor: pointer; filter: brightness(1.5);}
.customMedia ::-webkit-media-controls-play-button:hover, .customMedia ::-webkit-media-controls-fullscreen-button:hover, .customMedia ::-webkit-media-controls-mute-button:hover, .customMedia ::-internal-media-controls-download-button:hover {cursor: pointer; filter: brightness(2.5);}
.customMedia ::-webkit-media-controls-timeline, .customMedia ::-webkit-media-controls-volume-slider {cursor: pointer; margin: 0 10px; padding: 3px 0;}
::-webkit-media-controls-fullscreen-button {display: none;}
.media-toggled {display: none !important;}
/* hide download button */
.customMedia ::-webkit-media-controls {overflow: hidden !important}
.customMedia ::-webkit-media-controls-enclosure {width: calc(100% + 32px);margin-left: auto;}
/* exhentai previews */
.customMedia.sadpanda .gallery_info {background-color: #2E3033; border-radius: 5px; padding: 5px 5px 10px; width: 100%;}
.customMedia.sadpanda .gallery_info .desc {color: #FFFFFF;}
.customMedia.sadpanda .gallery_info .tag {display: inline-block; margin: 0 3px;}
.customMedia.sadpanda .gallery_info .tag:after{content: ',';}
.customMedia.sadpanda .gallery_info .tag:last-child:after {content: '';}
.customMedia.sadpanda .gallery_preview {padding: 0; width: 1px;}
.customMedia.sadpanda .gallery_preview img {max-height: 250px;}
.customMedia.sadpanda .embed-IeVjo6 {max-width: 750px;}
.customMedia.sadpanda .embedPill-1Zntps.cat-Doujinshi {background-color: #FF2525;}
.customMedia.sadpanda .embedPill-1Zntps.cat-Manga {background-color: #FFB225;}
.customMedia.sadpanda .embedPill-1Zntps.cat-Artistcg {background-color: #E8D825;}
.customMedia.sadpanda .embedPill-1Zntps.cat-Gamecg {background-color: #259225;}
.customMedia.sadpanda .embedPill-1Zntps.cat-Western {background-color: #9AFF38;}
.customMedia.sadpanda .embedPill-1Zntps.cat-Non-H {background-color: #38ACFF;}
.customMedia.sadpanda .embedPill-1Zntps.cat-Imageset {background-color: #2525FF;}
.customMedia.sadpanda .embedPill-1Zntps.cat-Cosplay {background-color: #652594;}
.customMedia.sadpanda .embedPill-1Zntps.cat-Asianporn {background-color: #F2A7F2;}
.customMedia.sadpanda .embedPill-1Zntps.cat-Misc {background-colorcolor: #D3D3D3;}
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
.customMedia.chan {color: #AAAAAA;}
.customMedia.chan .embed-IeVjo6 {max-width: 640px; min-width: 520px;}
.customMedia.chan .embed-IeVjo6 .board-sfw {background-color: #9099D0;}
.customMedia.chan .embed-IeVjo6 .board-nsfw {background-color: #FFBEAF;}
.customMedia.chan .thread_head {position: relative;}
.customMedia.chan .thread_head .thread_posttype {font-weight: bold; line-height: 30px; margin: 0 5px;}
.customMedia.chan .thread_head .thread_data {display: inline; position: absolute; right: 0;}
.customMedia.chan .thread_head .thread_data td:last-of-type {text-align: right;}
.customMedia.chan .thread_link {font-weight: 500; white-space: nowrap;}
.customMedia.chan .thread_link span {display: inline; margin: 0 5px;}
.customMedia.chan .thread_info {white-space: nowrap;}
.customMedia.chan .thread_info .thread_title {display: inline-block; font-weight: bold; max-width: 278px; overflow: hidden; text-overflow: ellipsis; vertical-align: bottom;}
.customMedia.chan .thread_info .thread_creator {color: #30A75C;}
.customMedia.chan .thread_preview {padding: 0; width: 1px;}
.customMedia.chan .thread_preview img {border-radius: 5px; display: inline-block; height: unset; max-height: 200px; max-width: 200px;}
.customMedia.chan .thread_comment {background-color: #2E3033; border-radius: 5px; padding: 5px 5px 10px; width: 100%; word-break: break-word;}
.customMedia.chan .thread_comment a {word-break: break-word;}
.customMedia.chan .thread_foot {padding: 10px 2px 0;}
.custom_warning {color: #F32323;}
/* steam workshop previews */
.customMedia.steam .embed-IeVjo6 {max-width: 426px}
.customMedia.steam .embedInner-1-fpTo {flex-grow: 1;}
.customMedia.steam .embedPill-1Zntps {background-color: #1B2838;}
.customMedia.steam img.image {max-height: 250px; max-width: 330px; margin: 0 auto;}
.customMedia.steam .scrollerWrap-2lJEkd {height: 100px;}
.customMedia.steam .embedDescription-1Cuq9a {white-space: pre-line; word-wrap: break-word;}
/* greentext */
.greentext {color: #709900;}
/* spoiler */
.customMedia .spoiler {background: #1D1D1D;}
.customMedia .spoiler:hover {background-color: unset; color: #ADADAD !important;}
.customMedia .spoiler::before {display: inline; content: "Spoiler:"; font-family: inherit; padding: 0 2px;}
/* archive manager */
.cms-menuIcon {background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAASCAYAAABrXO8xAAABfElEQVR42rWSu4rCQBiF51n2VVJsZSVEkWjjXQOCooUajeJdtLNR8QJaKYiCl85SEDvxCbb3BbY4y5nCDSiSxoGTGf7/fJOTnwguj8fz5XK5rtFoFKFQ6KXYc7vdV3olpKrqdzwevw8GA3S7XXQ6nZdibzgcQtf1OxkRDAZ/1+s1NpsNuL/Rw0NGRCIRtNttZLNZGIbxVrlcDq1WS8aWYLPZRLlcZqS3qlQqqNfrHwALhcIjHs+feSOHw8Z0OkWv1+P5Sfl8/h/ko9FoIBAIyOJiscB+v8dut8N4PJZJEokEwuHwwxOLxSBY5G2KomA0GklwuVxiu93ifD7jdrvJfT6fw+fzoVQqgYxIp9MoFotwOp0S7Pf7mEwmmM1mWK1WOBwOOB6PuFwujCoHRkbw21KpFGFbopc/gjBNE5lMhlOzJXoZV9RqNSvI349Ttoo1KygHJFhk9mq1SslzMpm06qnPC4SmaSe/3//Dm+yIXjKCy+FwmF6vF3ZEL5k/rZRshi+9vygAAAAASUVORK5CYII=) no-repeat center; opacity: 0.6;}
.cms-menuIcon:hover {opacity: 1;}
.cms-content {background-color: unset;}
.cms-archive_header > div {margin: 0 5px; width: 195px;}
.cms-archive_filter {padding-bottom: 8px;}
.cms-archive_filter .input-cIJ7To {padding: 0 10px; width: 250px;}
.cms-archive_clean_menu {align-self: center; position: absolute; right: 25px; z-index: 10;}
.cms-archive_clean_menu .cms-archive_clean_menu-buttons {display: none; position: absolute; right: -10px;}
.cms-archive_clean_menu:hover .cms-archive_clean_menu-buttons {display: block;}
.cms-archive_clean_menu .cms-archive_clean_menu-button {margin-bottom: 0;}
.cms-archive_active_button .divider-3573oO {background-color: #a5a5a5;}
.cms-archive_container > div {display: none;}
.cms-archive_container .cms-archive_active {display: flex;}
.cms-archive_container .customMedia {margin: 5px; position: relative;}
.cms-archive_container .customMedia .embed-IeVjo6 {max-width: unset;}
.cms-archive_delete {position: absolute; top: 3px; right: 3px;}
.cms-archive_delete:hover .close-18n9bP, .cms-archive_clean:hover .close-18n9bP {background-color: rgba(240, 71, 71, 0.5);}
.cms-info-header {height: 24px; text-align: center; padding: 8px;}
#cms-archive_chan .thread_head .thread_data {right: 30px;}
#cms-archive_steam .steam {margin: 5px auto; width: 370px;}
			`,
			shared: `
.orriePluginModal .backdrop-1ocfXc {background-color: #000000; opacity: 0.85;}
.orriePluginModal .modal-1UGdnR {opacity: 1;}
.orriePluginModal .modal-3HD5ck {padding: 0 20px; width: 800px;}
.orriePluginModal .description-3_Ncsb {font-size: 16px; line-height: 24px;}
.orrie-plugin .buttonBrandFilled-3Mv0Ra a {color: #FFFFFF !important;}
.orrie-buttonRed, .bda-slist .orrie-buttonRed {background-color: #F04747 !important;}
.orrie-buttonRed:hover, .bda-slist .orrie-buttonRed:hover {background-color: #FD5D5D !important;}
.orrie-toggled {display: none !important;}
.orrie-relative {position: relative;}
.orrie-centerText {text-align: center;}
.orrie-inputRequired::before {color: #F04747; content: "*"; font-size: 20px; font-weight: 700; margin-left: 2px; position: absolute; z-index: 1;}
.theme-dark .orrie-plugin {color: #B0B6B9;}
/* tooltips */
.orrie-tooltip:hover .tooltip {display: initial;}
.orrie-tooltip .tooltip {display: none; margin: 0; text-align: center; width: max-content;}
.orrie-tooltip .tooltip-top {bottom: 135%; left: 50%; transform: translateX(-50%);}
.orrie-tooltip .tooltip-bottom {top: 135%; left: 50%; transform: translateX(-50%);}
.orrie-tooltip .tooltip-right {left: 135%; top: 50%; transform: translateY(-50%);}
.orrie-tooltip .tooltip-left {right: 135%; top: 50%; transform: translateY(-50%);}
.orrie-tooltip .tooltip:hover {display: none;}
			`
		},
		archive: {
			chan: {},
			filter: [],
			proxy: {},
			sadpanda: {},
			steam: {},
			url: {}
		}
	},
	settingsLoad = function() {
		// load settings
		const storage = bdPluginStorage.get(script.file, "settings"),
		archive = bdPluginStorage.get(script.file, "archive");
		if (storage) {
			script.settings = storage;
		}
		else {
			bdPluginStorage.set(script.file, "settings", script.settings);
		}
		if (archive) {
			script.archive = archive;
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
	cleanArchive = function(key) {
		if (key) {
			const wrapper = document.getElementById(`cms-archive_${key}`),
			counter = document.getElementById(`cms-archive_chan${key}-counter`);
			if (Array.isArray(script.archive[key])) {
				script.archive[key] = [];
			}
			else {
				script.archive[key] = {};
			}
			if (wrapper) {
				wrapper.innerHTML = "<h3 class='titleDefault-a8-ZSr buttonBrandLink-3csEAP marginReset-236NPn weightMedium-2iZe9B size16-14cGz5 height24-3XzeJx flexChild-faoVW3 defaultColor-1_ajX0 cms-info-header' style='flex: 1 1 auto;'>Shits Empty Bro</h3>";
			}
			if (counter) {
				counter.textContent = "0";
			}
		}
		else {
			script.archive = {chan:{},filter:[],proxy:{},sadpanda:{},steam:{},url:{}};
		}
		bdPluginStorage.set(script.file, "archive", script.archive);
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
			modalContent.appendChild(_createElement("div", {className: "description-3_Ncsb orrie-centerText userSelectText-1o1dQ7", textContent: `${data.fileTitle}${data.fileSize ? ` - ${data.fileSize}` : ""}${data.fileRes ? ` - ${data.fileRes}` : ""}`}));
		}
		const modal = _createElement("span", {className: `${script.file}Modal orriePluginModal`}, [
			_createElement("div", {className: "backdrop-1ocfXc", onclick() {modal.remove();}}),
			_createElement("div", {className: "modal-1UGdnR"},
				_createElement("div", {className: "inner-1JeGVc"}, modalContent)
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
					if (!script.archive.filter.includes(fileFilter)) {
						script.archive.filter.push(fileFilter);
					}
					return false;
				}
			}
		}
		return true;
	},
	mediaReplace = function(message) {
		const mediaAll = message.querySelectorAll(`.accessory:not(.customMedia) video[src]:not([src=""]), .accessory:not(.customMedia) source, .accessory:not(.customMedia) a`);
		for (let _rm=mediaAll.length; _rm--;) {
			const media = mediaAll[_rm],
			url = decodeURI(encodeURI(media.tagName == "VIDEO" || media.tagName == "SOURCE" ? media.getAttribute("src") : media.getAttribute("href"))),
			fileFilter = url.split("/").slice(-2).join("/");
			if (media && script.archive.filter.includes(fileFilter)) {
				let wrapper = media.closest(".accessory > div");
				if (wrapper) {
					wrapper.classList.add("media-toggled");
				}
				if (script.archive.proxy[fileFilter] == "ERROR") {
					const source = document.getElementById(`error_${fileFilter}`);
					if (source) {
						const source_parent = source.parentNode;
						source.id = "";
						source.src = url;
						if (source_parent) {
							source_parent.load();
							source_parent.classList.remove("media-toggled");
							source_parent.nextElementSibling.classList.add("media-toggled");
						}
					}
					delete script.archive.proxy[fileFilter];
				}
				else {
					script.archive.proxy[fileFilter] = url;
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
				messages: ".markup > a:not(.cms-ignore), .metadataDownload-1fk90V:not(.cms-ignore), .fileNameLink-9GuxCo:not(.cms-ignore)",
				message: ".accessory:not(.media-replace) .embedTitleLink-1Zla9e, .accessory:not(.media-replace) .metadataDownload-1fk90V"
			},
			links = (type !== "messages" ? node.closest(".message") : node).querySelectorAll(types[type]);
			log("info", `mediaConvert ${type}`, links);
			for (let _l=links.length; _l--;) {
				const link = links[_l];
				if (link.getAttribute("href") || link.getAttribute("src")) {
					const fileLink = link.tagName == "VIDEO" || link.tagName == "SOURCE" ? link.getAttribute("src") : link.getAttribute("href"),
					href = decodeURI(encodeURI(fileLink.replace("http:", "https:").replace("www.","").replace(".gifv", ".mp4"))),
					fileType = href.match(/\.(\w+$)/) ? href.match(/\.(\w+$)/)[1] : false,
					message = link.closest(".message"),
					hrefSplit = href.split("/"),
					hostName = hrefSplit[2].match(/([\w\-]+\.\w+)$/)[0];
					if (script.settings.embedding && message && fileType || script.media.whitelist.includes(hostName)) {
						const message_body = message.firstElementChild,
						fileFilter = fileLink.split("/").slice(-2).join("/"),
						fileSite = script.media.sites[hostName] || false;
						let data = {
							fileMedia: fileType ? script.media.types[fileType.toLowerCase()] : false,
							fileName: hrefSplit[hrefSplit.length-1] ? hrefSplit[hrefSplit.length-1].match(/[\w\s]+/)[0] : "",
							filePoster: "",
							fileReplace: false,
							fileSize: message.getElementsByClassName("metadataSize-2UOOLK")[0] ? message.getElementsByClassName("metadataSize-2UOOLK")[0].textContent : "",
							fileTitle: message.getElementsByClassName("embedTitleLink-1Zla9e")[0] ? message.getElementsByClassName("embedTitleLink-1Zla9e")[0].innerHTML : decodeURIComponent(hrefSplit[hrefSplit.length-1]),
							fileLink, fileType, fileFilter, href, hrefSplit, link, message, message_body
						};
						if (fileSite && fileSite.data) {
							data = Object.assign(data, fileSite.data(data));
						}
						// only continues if mediaCheck is true -- as in, the embedding doesn't already exist
						if (data.href && data.fileMedia && data.fileMedia !== "ignore" && mediaCheck(message, fileFilter)) {
							link.classList.add("customMediaLink");
							if (script.archive.url[data.fileLink]) {
								mediaEmbedding(Object.assign(data, script.archive.url[data.fileLink]));
							}
							else if (script.settings.api && fileSite && fileSite.api && !data.ignoreApi) {
								fileSite.api(data);
							}
							else if (data.fileMedia !== "api") {
								mediaEmbedding(data);
							}
							message.classList.add("customEmbedded");
						}
					}
				}
				link.classList.add("cms-ignore");
			}
			script.check.media = false;
		}
	},
	mediaEmbedding = function(data, mode) {
		log("info", "mediaEmbedding", data);
		const {fileMedia, fileTitle, fileType, fileSize, filePoster, fileReplace, fileFilter, href, hrefSplit, message, message_body} = data,
		wrapperName = {
			video: "imageWrapper-2p5ogY noScroll-1Ep7Tu",
			audio: "wrapperAudio-1jDe0Q wrapper-2TxpI8",
			img: "imageWrapper-2p5ogY noScroll-1Ep7Tu",
			iframe: "imageWrapper-2p5ogY noScroll-1Ep7Tu"
		},
		previewReplace = script.media.replace.includes(hrefSplit[2]),
		container = _createElement("div", {className: `accessory customMedia media-${fileMedia}`, check: fileFilter}, [
			_createElement("div", {className: wrapperName[fileMedia], check: fileFilter}, [
				mode == "return" ? false : (function() {
					switch(fileMedia) {
						case "video":
							return _createElement("div", {className: "metadata-13NcHb", innerHTML: `<div class='metadataContent-3c_ZXw userSelectText-1o1dQ7'><div class='metadataName-14STf-'><a class='white-2qwKC7 cms-ignore' href='${href}' target='_blank'>${fileTitle}</a></div><div class='metadataSize-2UOOLK'>${fileSize}</div></div>`}, [
								_createElement("a", {className: "metadataDownload-1fk90V orrie-tooltip orrie-relative cms-ignore", href, target: "_blank", innerHTML: `<svg viewBox='0 0 24 24' name='Download' class='metadataIcon-2FyCKU' width='24' height='24'><g fill='none' fill-rule='evenodd'><path d='M0 0h24v24H0z'></path><path class='fill' fill='currentColor' d='M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z'></path></g></svg><div class='tooltip tooltip-brand tooltip-${previewReplace ? "left" : "top"}'>Download Video</div>`}),
								_createElement("div", {className: "metadataButton metadataButton-popout orrie-tooltip orrie-relative", innerHTML: `<div class='tooltip tooltip-brand tooltip-${previewReplace ? "left" : "top"}'>Popout Video</div>`, // &#128471;
									onclick() {
										const video = this.parentNode.nextElementSibling;
										data.currentTime = video.currentTime;
										data.playing = !video.paused;
										video.pause();
										modalHandler(mediaEmbedding(data, "return"), data);
									}
								}),
								_createElement("div", {className: "metadataButton metadataButton-expand orrie-tooltip orrie-relative", innerHTML: "<div class='tooltip tooltip-brand tooltip-top'>Expand Video</div>", // &#128470
									onclick() {
										const video = this.parentNode.nextElementSibling;
										container.classList.toggle(video.videoWidth/video.videoHeight > 1.25 ? "media-large-horizontal" : "media-large-vertical");
										if (container.getBoundingClientRect().bottom > document.getElementsByClassName("messages")[0].clientHeight) {
											message.scrollIntoView(false);
										}
									}
								})
							]);
						case "audio":
							return _createElement("div", {className: "audioMetadata-3zOuGv", innerHTML: `<div class='metadataContent-3c_ZXw userSelectText-1o1dQ7'><a class='metadataName-14STf- cms-ignore' href='${href}' target='_blank'>${fileTitle}</a><div class='metadataSize-2UOOLK'>${fileSize}</div></div><a class='metadataDownload-1fk90V orrie-tooltip orrie-relative cms-ignore' href='${href}' target='_blank'><svg viewBox='0 0 24 24' name='Download' class='metadataIcon-2FyCKU' width='24' height='24'><g fill='none' fill-rule='evenodd'><path d='M0 0h24v24H0z'></path><path class='fill' fill='currentColor' d='M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z'></path></g></svg><div class='tooltip tooltip-brand tooltip-top'>Download Audio</div></a>`});
						case "img":
						case "iframe":
							return _createElement("div", {className: "metadata-13NcHb", innerHTML: `<div class='metadataContent-3c_ZXw userSelectText-1o1dQ7'><div class='metadataName-14STf-'><a class='white-2qwKC7' href='${href}'>${fileTitle}</a></div><div class='metadataSize-2UOOLK'>${fileSize}</div></div>`}, [
								_createElement("div", {className: "metadataButton metadataButton-popout orrie-tooltip orrie-relative", innerHTML: `<div class='tooltip tooltip-brand tooltip-top'>Popout Media</div>`, // &#128471;
									onclick() {
										modalHandler(mediaEmbedding(data, "return"), data);
									}
								})
							]);
						default:
							log("error", "mediaEmbed", href);
					}
				})(),
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
									scrollElement(message.scrollHeight, "messages");
									// replace original accessory previews if they exist
									if (!script.media.replace.includes(hrefSplit[2])) {
										if (!script.archive.filter.includes(fileFilter)) {
											script.archive.filter.push(fileFilter);
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
							const proxy = script.archive.proxy[fileFilter];
							if (proxy) {
								this.src = proxy;
								this.parentNode.load();
								delete script.archive.proxy[fileFilter];
							}
							else {
								script.archive.proxy[fileFilter] = "ERROR";
								this.id = `error_${fileFilter}`;
								this.parentNode.classList.add("media-toggled");
								this.parentNode.parentNode.nextElementSibling.classList.remove("media-toggled");
							}
						}
					})
				)
			]),
			_createElement("div", {className: "media-error-message userSelectText-1o1dQ7 media-toggled", textContent: `Unable to embed link - ${href}`})
		]);
		if (mode == "return") {
			return container;
		}
		if (previewReplace) {
			const anchor = message.querySelector(`.accessory a[href*='${fileFilter}']`),
			embed = anchor ? anchor.closest(".embedContent-3fnYWm").nextElementSibling : false;
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
			if (!script.archive.filter.includes(fileFilter)) {
				script.archive.filter.push(fileFilter);
			}
			mediaReplace(message);
		}
		scrollElement(message.scrollHeight, "messages");
	},
	archiveHandler = function() {
		// displays the archived links in a modal
		const deletePreview = function(elem, key, archive, counter) {
			if (elem && key) {
				delete script.archive[archive][key];
				bdPluginStorage.set(script.file, "archive", script.archive);
				elem.parentNode.remove();
				document.getElementById(counter).textContent--;
			}
		},
		activeArchive = function({classList}, archive) {
			const active_archive = document.getElementsByClassName("cms-archive_active")[0],
			active_button = document.getElementsByClassName("cms-archive_active_button")[0];
			if (active_archive) {
				active_archive.classList.toggle("cms-archive_active");
			}
			if (active_button) {
				active_button.classList.toggle("cms-archive_active_button");
			}
			classList.toggle("cms-archive_active_button");
			document.getElementById(`cms-archive_${archive}`).classList.toggle("cms-archive_active");
		},
		archives = {
			sadpanda: {
				name: "sadpanda",
				count: 0,
				fragment: document.createDocumentFragment(),
				tags(tags) {
					let tagsString = "";
					for (let _t=tags.length; _t--;) {
						tagsString += ` ${tags[_t].textContent}`;
					}
					return tagsString;
				}
			},
			chan: {name: "chan", count: 0, fragment: document.createDocumentFragment()},
			steam: {name: "steam", count: 0, fragment: document.createDocumentFragment()}
		},
		archiveEmpty = "<h3 class='titleDefault-a8-ZSr buttonBrandLink-3csEAP marginReset-236NPn weightMedium-2iZe9B size16-14cGz5 height24-3XzeJx flexChild-faoVW3 defaultColor-1_ajX0 cms-info-header' style='flex: 1 1 auto;'>Shits Empty Bro</h3>";
		BdApi.clearCSS("cms-filters");
		for (let _db_k = Object.keys(archives), _db=0, _db_len=_db_k.length; _db<_db_len; _db++) {
			const archive = archives[_db_k[_db]];
			for (let _db_k = Object.keys(script.archive[archive.name]), _db=_db_k.length; _db--;) {
				const key = _db_k[_db],
				container = _createElement("div", {className: `customMedia ${archive.name} cms-filter`, innerHTML: script.archive[archive.name][key]},
					_createElement("div", {className: "flex-1O1GKY cms-archive_delete orrie-tooltip", innerHTML: "<svg class='close-18n9bP flexChild-faoVW3' xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 12 12'><g fill='none' fill-rule='evenodd'><path d='M0 0h12v12H0'></path><path class='fill' fill='currentColor' d='M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6'></path></g></svg><div class='tooltip tooltip-brand tooltip-bottom'>Delete</div>", onclick() {deletePreview(this, key, archive.name, `cms-archive_${archive.name}-counter`);}})
				),
				filter_container = container.getElementsByClassName("cms-filter_container")[0];
				if (filter_container) {
					container.classList.add(...filter_container.innerHTML.split(" "));
				}
				else {
					if (archive.tags) {
						container.className += archive.tags(container.getElementsByClassName("tag"));
					}
				}
				archive.fragment.appendChild(container);
				archive.count++;
			}
		}
		return _createElement("div", {className: "modal-3HD5ck userSelectText-1o1dQ7 sizeMedium-1fwIF2", innerHTML: "<div class='flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6 header-1R_AjF' style='flex: 0 0 auto;'><div class='flexChild-faoVW3' style='flex: 1 1 auto;'><h4 class='h4-AQvcAz title-3sZWYQ size16-14cGz5 height20-mO2eIN weightSemiBold-NJexzi defaultColor-1_ajX0 defaultMarginh4-2vWMG5 marginReset-236NPn'>Archive Manager</h4></div><svg class='orrie-button-cancel close-18n9bP flexChild-faoVW3' xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 12 12'><g fill='none' fill-rule='evenodd'><path d='M0 0h12v12H0'></path><path class='fill' fill='currentColor' d='M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6'></path></g></svg></div>"}, [
			_createElement("div", {className: "flex-1O1GKY directionRow-3v3tfG justifyCenter-3D2jYp inner-3wn6Q5 cms-archive_header", style: "flex: 0 0 auto;"}, [
				_createElement("div", {className: "defaultColor-1_ajX0 cursorPointer-1ajlYk orrie-centerText", innerHTML: `<div class='size18-3EXdSj'>ExHentai (<span id='cms-archive_sadpanda-counter'>${archives.sadpanda.count}</span>)</div><div class='divider-3573oO marginTop8-1DLZ1n marginBottom8-AtZOdT'></div>`, onclick() {activeArchive(this, "sadpanda");}}),
				_createElement("div", {className: "defaultColor-1_ajX0 cursorPointer-1ajlYk orrie-centerText", innerHTML: `<div class='size18-3EXdSj'>4chan (<span id='cms-archive_chan-counter'>${archives.chan.count}</span>)</div><div class='divider-3573oO marginTop8-1DLZ1n marginBottom8-AtZOdT'></div>`, onclick() {activeArchive(this, "chan");}}),
				_createElement("div", {className: "defaultColor-1_ajX0 cursorPointer-1ajlYk orrie-centerText", innerHTML: `<div class='size18-3EXdSj'>Steam Workshop (<span id='cms-archive_steam-counter'>${archives.steam.count}</span>)</div><div class='divider-3573oO marginTop8-1DLZ1n marginBottom8-AtZOdT'></div>`, onclick() {activeArchive(this, "steam");}})
			]),
			_createElement("div", {className: "flex-1O1GKY directionRow-3v3tfG justifyCenter-3D2jYp inner-3wn6Q5 border-2AhmKo cms-archive_filter noScroll-1Ep7Tu", style: "flex: 0 0 auto;"}, [
				_createElement("div", {className: "flex-1O1GKY directionRow-3v3tfG"}, [
					_createElement("input", {className: "input-cIJ7To size16-14cGz5", placeholder: "Filter Content (tags or board)", type: "text", value: "",
						onchange() {
							BdApi.clearCSS("cms-filters");
							BdApi.injectCSS("cms-filters", `.cms-filter:not(.${this.value.replace(/\s+/g,"").split(",").join(", .")}) {display:none;}`);
						}
					}),
					_createElement("div", {className: "flex-1O1GKY cms-archive_clean orrie-tooltip orrie-relative", innerHTML: "<svg class='close-18n9bP flexChild-faoVW3' xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 12 12'><g fill='none' fill-rule='evenodd'><path d='M0 0h12v12H0'></path><path class='fill' fill='currentColor' d='M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6'></path></g></svg><div class='tooltip tooltip-brand tooltip-bottom'>Clean Filters</div>",
						onclick() {
							this.previousElementSibling.value = "";
							BdApi.clearCSS("cms-filters");
						}
					})
				]),
				_createElement("div", {className: "cms-archive_clean_menu"},
					_createElement("div", {className: "cms-archive_clean_menu-wrapper orrie-tooltip orrie-relative", innerHTML: "<button type='button' class='userInfoViewingButton-2-jbH9 button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeSmall-2cSMqn grow-q77ONN'><div class='contents-18-Yxp'>Cleaning Menu</div></button><div class='tooltip tooltip-brand tooltip-top'>Be very, very careful now!</div>"},
						_createElement("div", {className: "cms-archive_clean_menu-buttons cardPrimary-1Hv-to card-3Qj_Yx side-8zPYf6"}, [
							_createElement("div", {className: "cms-archive_clean_menu-button itemDefault-3Jdr52 item-PXvHYJ", innerHTML: "ExHentai", onclick() {cleanArchive("sadpanda");}}),
							_createElement("div", {className: "cms-archive_clean_menu-button itemDefault-3Jdr52 item-PXvHYJ", innerHTML: "4chan", onclick() {cleanArchive("chan");}}),
							_createElement("div", {className: "cms-archive_clean_menu-button itemDefault-3Jdr52 item-PXvHYJ", innerHTML: "Steam Workshop", onclick() {cleanArchive("steam");}}),
							_createElement("div", {className: "cms-archive_clean_menu-button itemDefault-3Jdr52 item-PXvHYJ", innerHTML: "Small APIs", onclick() {cleanArchive("url");}}),
							_createElement("div", {className: "cms-archive_clean_menu-button itemDefault-3Jdr52 item-PXvHYJ", innerHTML: "Everything", onclick() {cleanArchive("");}})
						])
					)
				)
			]),
			_createElement("div", {className: "scrollerWrap-2lJEkd content-2BXhLs scrollerThemed-2oenus themeGhostHairline-DBD-2d border-2AhmKo"},
				_createElement("div", {className: "scroller-2FKFPG inner-3wn6Q5 container-PNkimc cms-content"},
					_createElement("div", {className: "cms-archive_container"}, [
						_createElement("div", {className: "flex-1O1GKY directionColumn-35P_nr", id: "cms-archive_sadpanda"}, archives.sadpanda.count ? archives.sadpanda.fragment : _createElement("div", {className: "contents-18-Yxp", innerHTML: archiveEmpty})),
						_createElement("div", {className: "flex-1O1GKY directionColumn-35P_nr", id: "cms-archive_chan"}, archives.chan.count ? archives.chan.fragment : _createElement("div", {className: "contents-18-Yxp", innerHTML: archiveEmpty})),
						_createElement("div", {className: "flex-1O1GKY directionRow-3v3tfG justifyAround-1n1pnI wrap-ZIn9Iy", id: "cms-archive_steam"}, archives.steam.count ? archives.steam.fragment : _createElement("div", {className: "contents-18-Yxp", innerHTML: archiveEmpty}))
					])
				)
			)
		]);
	},
	insertCustomMenu = function(className, tooltip) {
		const menuAnchor = document.getElementsByClassName("titleText-3X-zRE")[0] ? document.getElementsByClassName("titleText-3X-zRE")[0].nextElementSibling.nextElementSibling : false;
		if (menuAnchor) {
			const menuIcon = menuAnchor.getElementsByClassName(className)[0];
			if (menuIcon) {
				menuIcon.remove();
			}
			menuAnchor.insertBefore(_createElement("div", {className: `${className} iconMargin-2YXk4F icon-1R19_H orrie-relative orrie-tooltip`, innerHTML: `<div class='tooltip tooltip-black tooltip-bottom'>${tooltip}</div>`,
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
				_createElement("div", {className: "ui-flex flex-horizontal flex-justify-start flex-align-stretch flex-nowrap plugin-setting-input-row", innerHTML: `<h3 class='ui-form-title h3 marginReset-236NPn ui-flex-child'>${setting[0]}</h3>`},
					_createElement("div", {className: "input-wrapper"}, settingType(_s_k[_s], setting))
				),
				_createElement("div", {className: "ui-form-text style-description marginTop4-2BNfKC", innerHTML: setting[2]})
			]));
		}
		return _createElement("div", {className: `${script.file} orrie-plugin`}, [
			_createElement("div", {className: "plugin_wrapper"}, [
				_createElement("h2", {className: "h5-18_1nd title-3sZWYQ marginReset-236NPn height16-2Lv3qA weightSemiBold-NJexzi defaultMarginh5-2mL-bP marginBottom8-AtZOdT", textContent: "Settings"}),
				_createElement("div", {className: "plugin-controls"}, settingsFragment)
			]),
			_createElement("div", {className: "flex-1O1GKY justifyAround-1n1pnI"}, [
				_createElement("a", {href: script.discord, target: "_blank", rel:"noreferrer", innerHTML: "<button type='button' class='button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeSmall-2cSMqn grow-q77ONN'>Support (Discord)</button>"}),
				_createElement("a", {href: script.url, target: "_blank", rel:"noreferrer", innerHTML: "<button type='button' class='button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeSmall-2cSMqn grow-q77ONN'>Source (GitHub)</button>"}),
				_createElement("button", {type: "button", className: "button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeSmall-2cSMqn grow-q77ONN orrie-buttonRed", textContent: `Clean Database`,
					onclick() {cleanArchive();}
				})
			]),
			_createElement("div", {className: "orrie-centerText marginTop8-1DLZ1n", textContent: "Use the Archive Manager to tidy up the database, or clean it alltogether"}),
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
		if (name == "steam") {
			headers["Content-Type"] = "application/x-www-form-urlencoded";
		}
		fetch(api, {
			method,
			headers,
			body: data.apiData ? data.apiData : null
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
		constructor() {
			this.script = script;
		}
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
			if (addedNodes.length > 0 && document.getElementsByClassName("messages").length) {
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
						case "embed-IeVjo6 flex-1O1GKY embed":
						case "wrapperPaused-19pWuK wrapper-2TxpI8":
							mediaConvert("message", node);
							mediaReplace(node);
							break;
						case "message-text":
						case "edited":
							setTimeout(textParser(node), 2500);
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
