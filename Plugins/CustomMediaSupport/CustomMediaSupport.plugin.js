//META{"name":"CustomMediaSupport","website":"https://github.com/Orrielel/BetterDiscordAddons/tree/master/Plugins/CustomMediaSupport","source":"https://raw.githubusercontent.com/Orrielel/BetterDiscordAddons/master/Plugins/CustomMediaSupport/CustomMediaSupport.plugin.js"}*//

/* global BdApi */

const CustomMediaSupport = (function() {
	// plugin settings
	const script = {
		name: "Custom Media Support",
		file: "CustomMediaSupport",
		version: "3.2.8",
		author: "Orrie",
		desc: "Makes Discord better for shitlords, entities, genderfluids and otherkin, by adding extensive support for media embedding and previews of popular sites with pictures",
		url: "https://github.com/Orrielel/BetterDiscordAddons/tree/master/Plugins/CustomMediaSupport",
		raw: "https://raw.githubusercontent.com/Orrielel/BetterDiscordAddons/master/Plugins/CustomMediaSupport/CustomMediaSupport.plugin.js",
		check: {
			media: false,
			replace: false,
			textParser: false,
			version: false
		},
		classes: {
			video:  "imageWrapper-2p5ogY noScroll-3xWe_g",
			audio:  "wrapperAudio-1jDe0Q wrapper-2TxpI8",
			img:    "imageWrapper-2p5ogY noScroll-3xWe_g",
			iframe: "imageWrapper-2p5ogY noScroll-3xWe_g",
			messages: ".da-markup > a:not(.customIgnore), .da-container:not(.media-replace) .da-metadataDownload",
			metadata: ".da-container:not(.media-replace) .da-metadataDownload:not(.customIgnore), .da-container:not(.media-replace) .embedVideo-3nf0O9:not(.customIgnore)"
		},
		headers: {
			imgur: {"Authorization": "Client-ID b975f50eb16a396"},
			steam: {"Content-Type": "application/x-www-form-urlencoded"}
		},
		media: {
			types: {
				mp4: "video", m4v: "video", ogv: "video", ogm: "video", webm: "video", mov: "video",
				mp3: "audio", ogg: "audio", oga: "audio", wav: "audio", wma: "audio", m4a: "audio", aac: "audio", flac: "audio",
				pdf: "iframe",
				jfif: "img"
			},
			sites: {
				"exhentai.org": {
					data({href}) {
						return {fileMedia: /\/g\//.test(href) ? "api" : false};
					},
					api(data) {
						if (script.settings.sadpanda && /\/g\//.test(data.href)) {
							const galleryKey = `${data.hrefSplit[4]}_${data.hrefSplit[5]}`;
							if (!data.message.getElementsByClassName(`gallery${galleryKey}`).length) {
								const entry = script.archive.sadpanda[galleryKey];
								if (entry && entry.html) {
									data.message.insertBefore(_createElement("div", {className: `container-1ov-mD container-1e22Ot customMedia customSadpanda gallery${galleryKey}`, innerHTML: entry.html}), data.media_container);
									scrollElement(data.message.scrollHeight);
								}
								else {
									data.apiData = `{"method":"gdata","gidlist":[["${data.hrefSplit[4]}","${data.hrefSplit[5]}"]],"namespace":1}`;
									request({name: "sadpanda", api: "https://e-hentai.org/api.php", method: "POST", data}, function(resp, {message, media_container}) {
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
												tagsOutput[cat].push(`<div class='tag'><a class='customIgnore' href='https://exhentai.org/tag/${tag_ns.replace(/\s/g, "+")}' target='_blank' rel='noreferrer'>${tag}</a></div>`);
												tagsFilter.push(tag);
											}
											for (let _to_k=Object.keys(tagsOutput), _to=0, _to_len=_to_k.length; _to<_to_len; _to++) {
												const key = _to_k[_to],
												tagOutput = tagsOutput[key];
												if (tagOutput) {
													tagsString += `<tr><td class='desc'>${key}:</td><td>${tagOutput.join("")}</td></tr>`;
												}
											}
											const galleryKey = `${gallery.gid}_${gallery.token}`,
											container = _createElement("div", {className: `container-1ov-mD container-1e22Ot customMedia customSadpanda gallery${galleryKey}`, innerHTML: `<div class='embedWrapper-3AbfJJ embedFull-2tM8-- embed-IeVjo6 markup-2BOw-j embed cat-${gallery.category.toLowerCase().replace(" ","")}'><div class='grid-1nZz7S'/><table><tr><td colspan='2'><div><a class='embedProvider-3k5pfl size12-3R0845 weightNormal-WI4TcG customIgnore' href='https://exhentai.org/' target='_blank' rel='noreferrer'>ExHentai</a></div><div class='marginTop4-2BNfKC marginBottom4-2qk4Hy'><a class='embedTitleLink-1Zla9e embedLink-1G1K1D embedTitle-3OXDkz size14-3iUx6q weightMedium-2iZe9B customIgnore' href='https://exhentai.org/g/${gallery.gid}/${gallery.token}/' target='_blank' rel='noreferrer'>${gallery.title}</a>${gallery.expunged ? " <span class='custom_warning'>(Expunged)</span>" : ""}</div></td></tr><tr><td class='gallery_preview'><img class='image' src='${gallery.thumb}'></td><td class='gallery_info'><table><tr><td>Category:</td><td class='desc cat-${gallery.category.toLowerCase().replace(" ","")}'>${gallery.category}</td></tr><tr><td>Rating:</td><td class='desc'>${gallery.rating}</td></tr><tr><td>Images:</td><td class='desc'>${gallery.filecount}</td></tr><tr><td>Uploaded:</td><td class='desc'>${new Date(gallery.posted*1000).toLocaleString('en-GB')}</td></tr><tr><td>Tags:</td><td><table>${tagsString}</table></td></tr><tr><td>Size:</td><td class='desc'>${mediaSize(gallery.filesize)}</td></tr><tr><td>Torrent:</td><td class='desc'><a class='customIgnore' href='https://exhentai.org/gallerytorrents.php?gid=${gallery.gid}&t=${gallery.token}' target='_blank' rel='noreferrer'>Search</a></td></tr></table></td></tr></table></div></div>`});
											message.insertBefore(container, media_container);
											// cache embed html in database
											script.archive.sadpanda[galleryKey] = {html: container.innerHTML, tags: tagsFilter.join(" ")};
											BdApi.saveData(script.file, "archive", script.archive);
											// remove sadpanda images
											const sadpandas = document.getElementsByClassName("messages-3amgkR")[0].querySelectorAll("img[href*='exhentai.org']");
											if (sadpandas[0]) {
												while(sadpandas[0]) {
													sadpandas[0].remove();
												}
											}
											scrollElement(message.scrollHeight);
										}
										else {
											log("error", "sadpandaFetch - galleries returns empty?", resp);
										}
									});
								}
								if (!script.archive.filter.includes(galleryKey)) {
									script.archive.filter.push(galleryKey);
								}
							}
						}
					}
				},
				"4chan.org": {
					data({href, fileMedia}) {
						return /thread/.test(href) ? {fileMedia: "api"} : {ignoreApi: true, href: href.replace(/is\d\.4chan/g,"i.4cdn")};
					},
					api(data) {
						if (script.settings.board) {
							data.postnumber = data.hrefSplit[5].match(/\d+/g);
							const threadKey = `${data.hrefSplit[3]}_${data.postnumber[1] ? data.hrefSplit[5].replace("#","_") : data.hrefSplit[5]}`;
							if (!data.message.getElementsByClassName(`post${threadKey}`).length) {
								const entry = script.archive.chan[threadKey];
								if (entry && entry.html) {
									data.message.insertBefore(_createElement("div", {className: `container-1ov-mD container-1e22Ot customMedia customChan post${threadKey}`, innerHTML: entry.html}), data.media_container);
									scrollElement(data.message.scrollHeight);
								}
								else {
									data.archive = archiveCheck(data.hrefSplit[3]);
									if (data.archive) {
										request({name: "4chan", api: `${data.archive}/_/api/chan/thread/?board=${data.hrefSplit[3]}&num=${data.postnumber[0]}`, method: "GET", cors: true, data}, function(resp, {archive, message, media_container, href, hrefSplit, postnumber}) {
											// fetch knitting image board information
											if (!resp.error) {
												const thread = resp[postnumber[0]],
												post = thread.posts && thread.posts[postnumber[1]] ? thread.posts[postnumber[1]] : thread.op,
												threadKey = `${post.board.shortname}_${postnumber[1] ? `${postnumber[0]}_p${postnumber[1]}` : postnumber[0]}`,
												isReply = thread.posts && thread.posts[postnumber[1]] ? true : false,
												isNotSafe = script.chan.nsfw.includes(hrefSplit[3]),
												boardUrl = `https://boards.${isNotSafe ? "4chan" : "4channel"}.org/${post.board.shortname}/`,
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
												container = _createElement("div", {className: `container-1ov-mD container-1e22Ot customMedia customChan post${threadKey}`, innerHTML: `<div class='embedWrapper-3AbfJJ embedFull-2tM8-- embed-IeVjo6 markup-2BOw-j ${isNotSafe ? "board-nsfw" : "board-sfw"} embed'><div class='grid-1nZz7S'><table><tr><td colspan='4'><div class='thread_head'><a class='embedProvider-3k5pfl size12-3R0845 weightNormal-WI4TcG customIgnore' href='${boardUrl}' target='_blank' rel='noreferrer'>4chan /${post.board.shortname}/ - ${post.board.name}</a><table class='thread_data'><tr><td rowspan='2'><span class='thread_posttype'>${isReply ? "Reply" : "OP"}</span></td><td>Replies:</td><td>${counts[0]}</td></tr><tr><td>Images:</td><td>${counts[1]}</td></tr></table></div><div class='thread_link marginTop4-2BNfKC '>Thread: <a class='customIgnore' href='${boardUrl}thread/${postnumber[0]}' target='_blank' rel='noreferrer'>${boardUrl}thread/${postnumber[0]}</a><span class='size14-3iUx6q weightMedium-2iZe9B custom_warning'>${post.deleted == "1" ? "(Deleted)" : post.locked == "1" ? "(Locked)" : ""}</span></div><div class='thread_info marginTop4-2BNfKC marginBottom4-2qk4Hy'>${post.title_processed ? `<span class='thread_title' title='${post.title_processed}'>${post.title_processed}</span>` : ""}<span class='thread_creator'>${post.name_processed}</span><span class='thread_time'>${new Date(post.timestamp*1000).toLocaleString("en-GB")}</span><span class='thread_postid'><a class='customIgnore' href='${href}' target='_blank' rel='noreferrer'>No.${post.num}</a></span></div></td></tr><tr><td class='thread_preview'>${post.media && post.media.thumb_link ? `<a class='customIgnore' href='${post.media.remote_media_link}' target='_blank' rel='noreferrer'><img class='image' src='${post.media.thumb_link}'></a>` : ""}</td><td class='thread_comment' colspan='3'><div class='thread_comment_scroller scrollerWrap-2lJEkd scrollerThemed-2oenus themeGhostHairline-DBD-2d scrollerFade-1Ijw5y'><div class='scroller-3sQKXg scroller-2FKFPG'>${post.comment_processed}</div></div></td></tr><tr><td class='thread_foot' colspan='4'>Data from <a class='customIgnore' href='${archive}' target='_blank' rel='noreferrer'>${archive}</a></td></tr></table></div></div>`});
												message.insertBefore(container, media_container);
												mediaReplace(message);
												// cache embed html in database
												script.archive.chan[threadKey] = {html: container.innerHTML, tags: post.board.shortname};
												BdApi.saveData(script.file, "archive", script.archive);
												scrollElement(message.scrollHeight);
											}
										});
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
						return {fileMedia, fileReplace: false, href};
					},
					api(data) {
						request({name: "imgur", api: `https://api.imgur.com/3/image/${data.fileName}`, method: "GET", cors: true, fallback: true, data}, function(resp, data) {
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
									BdApi.saveData(script.file, "archive", script.archive);
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
						});
					}
				},
				"gfycat.com": {
					data({fileLink, fileName}) {
						return {fileMedia: "video", fileLink: fileLink.replace(/-[\w-]+$/m,""), fileName: fileName.replace(/-[\w-]+$/m,""), fileReplace: true};
					},
					api(data) {
						request({name: "gfycat", api: `https://api.gfycat.com/v1/gfycats/${data.fileName}`, method: "GET", cors: true, fallback: true, data}, function({gfyItem}, data) {
							if (gfyItem) {
								data.href = gfyItem.mp4Url;
								data.fileTitle = gfyItem.gfyName;
								data.fileFilter = data.href.split("/").slice(-2).join("/");
								data.fileSize = mediaSize(gfyItem.mp4Size);
								mediaEmbedding(data);
								// store in database to prevent api spam
								if (data.fileSize !== "ERROR") {
									script.archive.url[data.fileLink] = {href: data.href, fileTitle: data.fileTitle, fileSize: data.fileSize};
									BdApi.saveData(script.file, "archive", script.archive);
								}
								else {
									log("error", "gfycat", gfyItem);
								}
							}
						});
					}
				},
				"steamcommunity.com": {
					data({href}) {
						return {fileMedia: /filedetails/.test(href) ? "api" : false};
					},
					api(data) {
						const fileKey = data.href.match(/\d+/g)[0],
						nameKey = `steam${fileKey}`;
						if (!data.message.getElementsByClassName(nameKey).length) {
							const entry = script.archive.steam[nameKey];
							if (entry && entry.html) {
								data.message.insertBefore(_createElement("div", {className: `container-1ov-mD container-1e22Ot customMedia customSteam ${nameKey}`, innerHTML: entry.html}), data.media_container);
								scrollElement(data.message.scrollHeight);
								mediaReplace(data.message);
							}
							else {
								data.apiData = `itemcount=1&publishedfileids[0]=${fileKey}&format=json`;
								request({name: "steam", api: `https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/`, method: "POST", cors: true, data}, function({response}, {message, media_container}) {
									// fetch knitting image board information
									const file = response.publishedfiledetails[0];
									let container;
									if (file.result == 1 && file.consumer_app_id) {
										const tags = file.tags.map(({tag}) => tag),
										game = script.workshop[file.consumer_app_id] ? script.workshop[file.consumer_app_id] : "Unspecified Game";
										tags.unshift(game);
										container = _createElement("div", {className: `container-1ov-mD container-1e22Ot customMedia customSteam ${nameKey}`, innerHTML: `<div class='embedWrapper-3AbfJJ embedFull-2tM8-- embed-IeVjo6 markup-2BOw-j embed'><div class='grid-1nZz7S'><div><a tabindex='0' class='anchor-3Z-8Bb embedProviderLink-2Pq1Uw embedLink-1G1K1D embedProvider-3k5pfl size12-3R0845 weightNormal-WI4TcG' href='https://steamcommunity.com/app/${file.consumer_app_id}/workshop/' rel='noreferrer noopener' target='_blank' role='button'>Steam Workshop - ${game}</a></div><div class='marginTop4-2BNfKC'><a tabindex='0' class='anchor-3Z-8Bb embedTitleLink-1Zla9e embedLink-1G1K1D embedTitle-3OXDkz size14-3iUx6q weightMedium-2iZe9B customMediaLink customIgnore' href='https://steamcommunity.com/sharedfiles/filedetails/?id=${file.publishedfileid}' rel='noreferrer noopener' target='_blank' role='button'>${file.title}</a></div><div class='scrollerWrap-2lJEkd embedInner-1-fpTo scrollerThemed-2oenus themeGhostHairline-DBD-2d marginTop4-2BNfKC'><div class='scroller-2FKFPG embedDescription-1Cuq9a marginTop4-2BNfKC markup-2BOw-j textParserProcessed'>${file.description.replace(/\[[\w=:/.?&+*]+\]/g,"")}</div></div><div class='embedFields-2IPs5Z embedFields-even marginTop4-2BNfKC'><div class='embedField-1v-Pnh marginTop4-2BNfKC embedFieldInline-3-e-XX'><div class='embedFieldName-NFrena marginBottom4-2qk4Hy size14-3iUx6q weightMedium-2iZe9B'>Subscriptions</div><div class='embedFieldValue-nELq2s textParserProcessed'>${file.subscriptions}</div></div><div class='embedField-1v-Pnh marginTop4-2BNfKC embedFieldInline-3-e-XX'><div class='embedFieldName-NFrena marginBottom4-2qk4Hy size14-3iUx6q weightMedium-2iZe9B'>Size</div><div class='embedFieldValue-nELq2s textParserProcessed'>${mediaSize(file.file_size)}</div></div></div><div class='embedFields-2IPs5Z embedFields-even marginTop4-2BNfKC'><div class='embedField-1v-Pnh marginTop4-2BNfKC embedFieldInline-3-e-XX'><div class='embedFieldName-NFrena marginBottom4-2qk4Hy size14-3iUx6q weightMedium-2iZe9B'>Time Created</div><div class='embedFieldValue-nELq2s textParserProcessed'>${new Date(file.time_created*1000).toLocaleDateString("en-GB")} @ ${new Date(file.time_created*1000).toLocaleTimeString("en-GB")}</div></div><div class='embedField-1v-Pnh marginTop4-2BNfKC embedFieldInline-3-e-XX'><div class='embedFieldName-NFrena marginBottom4-2qk4Hy size14-3iUx6q weightMedium-2iZe9B'>Last Updated</div><div class='embedFieldValue-nELq2s textParserProcessed'>${new Date(file.time_updated*1000).toLocaleDateString("en-GB")} @ ${new Date(file.time_updated*1000).toLocaleTimeString("en-GB")}</div></div></div><div class="embedWrapper-3AbfJJ embedMedia-1guQoW embedImage-2W1cML"><img class='image' src='${file.preview_url}'></div><div class='embedFields-2IPs5Z embedFields-minMax marginTop4-2BNfKC'><div class='embedFieldName-NFrena size14-3iUx6q weightMedium-2iZe9B'>Tags</div><div class='embedFieldValue-nELq2s size14-3iUx6q weightNormal-WI4TcG marginLeft4-3VaXdt textParserProcessed'>${tags.join(", ")}</div></div></div></div>`});
										// cache embed html in database
										script.archive.steam[nameKey] = {html: container.innerHTML, tags: tags.join(" ")};
										BdApi.saveData(script.file, "archive", script.archive);
										message.insertBefore(container, media_container);
										mediaReplace(message);
										scrollElement(message.scrollHeight);
									}
									//else if (!message.getElementsByClassName("customMediaError").length) {
									//	container = _createElement("div", {className: `container-1ov-mD container-1e22Ot customMedia steam ${nameKey}`, innerHTML: `<div class='embed-IeVjo6 flex-1O1GKY embed'><div class='customMediaError'>That item does not exist. It may have been removed by the author.</div></div>`});
									//}
								});
							}
							if (!script.archive.filter.includes(data.fileFilter)) {
								script.archive.filter.push(data.fileFilter);
							}
						}
					}
				},
				"facebook.com": {
					data({message}) {
						if (message) {
							return {fileMedia: "video", fileReplace: true, href: message.getElementsByTagName("source").length ? message.getElementsByTagName("source")[0].src : false};
						}
					}
				},
				"instagram.com": {
					data({message}) {
						if (message) {
							return {fileMedia: "video", fileReplace: true, href: message.getElementsByTagName("source").length ? message.getElementsByTagName("source")[0].src : false};
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
							return {fileMedia: "video", href: message.getElementsByTagName("source").length ? message.getElementsByTagName("source")[0].src : false};
						}
					}
				},
				"steampowered.com": {
					data({message}) {
						if (message) {
							return {fileMedia: "video", filePoster: message.getElementsByTagName("video").length && message.getElementsByTagName("video")[0].poster ? message.getElementsByTagName("video")[0].poster : "", href: message.getElementsByTagName("source").length ? `https://${message.getElementsByTagName("source")[0].src.match(/(steamcdn[\w\-\.\/]+)/)[0]}` : false};
						}
					}
				},
				"voca.ro": {
					data({href, hrefSplit}) {
						return {fileMedia: "audio", fileReplace: false, href: `https://media.vocaroo.com/mp3/${hrefSplit[3]}`};
					}
				},
				"vocaroo.com": {
					data({href, hrefSplit}) {
						return {fileMedia: "audio", fileReplace: false, href: /\/i\//.test(href) ? `https://old.vocaroo.com/media_command.php?media=${hrefSplit[4]}&command=download_mp3` : false};
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
							return {fileMedia: "video", filePoster: message.getElementsByTagName("video").length && message.getElementsByTagName("video")[0].poster ? message.getElementsByTagName("video")[0].poster : "", href: message.getElementsByTagName("source").length ? message.getElementsByTagName("source")[0].src : false};
						}
					}
				}
			},
			whitelist: ["4chan.org", "exhentai.org", "gfycat.com", "voca.ro", "vocaroo.com", "pastebin.com", "wotlabs.net", "wot-life.com", "facebook.com", "instagram.com", "imgur.com", "streamable.com", "steampowered.com", "steamcommunity.com", "ifunny.co"],
			blacklist: [], // "archive.org"
			replace: ["steampowered.com"],
			clone: {
				"akamaihd.net": "steampowered.com",
				"e-hentai.org": "exhentai.org",
				"4channel.org": "4chan.org"
			}
		},
		workshop: {
			"550": "Left 4 Dead 2",
			"203770": "Crusader Kings II",
			"236850": "Europa Universalis IV",
			"281990": "Stellaris",
			"394360": "Hearts of Iron IV",
			"859580": "Imperator Rome"
		},
		chan: {
			nsfw: ["aco","b","bant","d","e","gif","h","hc","hm","hr","pol","r","r9k","s","s4s","soc","t","u","y"],
			archives: {
				"https://archived.moe": ["bant", "3","a","aco","adv","an","asp","b","biz","c","cgl","ck","cm","co","con","d","diy","e","f","fa","fit","g","gd","gif","h","hc","his","hm","hr","i","ic","int","jp","k","lgbt","lit","m","mlp","mu","n","news","o","out","p","po","pol","q","qa","qst","r","r9k","s","s4s","sci","soc","sp","t","tg","toy","trash","trv","tv","u","v","vg","vip","vp","vr","w","wg","wsg","wsr","x","y"],
				"https://desuarchive.org": ["a","aco","an","c","co","d","fit","gif","his","int","k","m","mlp","qa","r9k","tg","trash","vr","wsg"],
				"https://boards.fireden.net": ["cm","ic","sci","tg","y"],
				"https://archiveofsins.com": ["h","hc","hm","r","s","soc"],
				"https://archive.nyafuu.org": ["bant","asp","c","e","n","news","out","p","toy","vip","vp","w","wg","wsr"],
				"https://archive.loveisover.me": ["c","d","e","i","lgbt","t","u"]
			}
		},
		settings: {embedding: true, api: true, loop: true, volume: 0.25, preload: true, autoplay: false, hoverPlay: false, controls: true, board: true, sadpanda: true, greentext: true, debug: false},
		settingsMenu: {
			//          localized                  type     description
			embedding: ["Media Embedding",         "check", "Embeds or replaces supported elements:<br>mp4, m4v, ogv, ogm, webm, mov; mp3, ogg, oga, wav, wma, m4a, aac, flac; pdf"],
			api:       ["Embedding API",           "check", "Use APIs for embedding when possible -- data will be stored per session"],
			loop:      ["Loop",                    "check", "Loops media"],
			volume:    ["Volume",                  "range", "Default volume &#8213; 25%"],
			preload:   ["Preload",                 "check", "Preload media"],
			autoplay:  ["Autoplay",                "check", "Not recommended &#8213; RIP CPU"],
			hoverPlay: ["Play on Hover",           "check", "Play media on mouse hover"],
			controls:  ["Media Controls Position", "check", "Position of media controls. On = Hovering at bottom, Off = Below player"],
			board:     ["4chan",                   "check", "Embed 4chan thread links -- data will be stored indefinitely"],
			sadpanda:  ["Sadpanda",                "check", "Embed Sadpanda galleries -- data will be stored indefinitely"],
			greentext: ["Greentext",               "check", "<span class='greentext'>&gt;ISHYGDDT</span>"],
			imagePop:  ["Full Resolution Images",  "check", "Only in dedicated script: <a href='https://github.com/Orrielel/BetterDiscordAddons/tree/master/Plugins/BetterImagePopups' target='_blank'>BetterImagePopups</a>"],
			debug:     ["Debug",                   "check", "Displays verbose stuff into the console"]
		},
		css: {
			script: `
/* custom embeds */
.customMedia {color: hsla(0,0%,100%,0.7);}
.messageCozy-2JPAPA .customMedia {padding: 0; position: relative; margin-bottom: 0;}
.customMedia .grid-1nZz7S {grid-auto-rows: min-content; grid-template-rows: unset;}
.customMedia table {border-spacing: 0;}
.customMedia table td {font-size: 0.875rem; vertical-align: top;}
.customMedia .embedFields-even {grid-template-columns: 50% 50%;}
.customMedia .embedFields-minMax {grid-template-columns: min-content auto;}
.customMedia .embed-IeVjo6 {max-width: unset;}
.customMedia .customMediaError {color: #F04747; margin: 0; max-width: 75vh; padding: 5px 10px;}
.customMedia .metadata-13NcHb {border-radius: 3px; display: flex; height: auto; margin: 0; padding: 10px 12px 35px; top: -1px;}
.customMedia .metadata-13NcHb > *:not(.metadataContent-3c_ZXw) {background-color: rgba(0, 0, 0, 0.25); border: 1px solid rgba(0, 0, 0, 0.50); border-radius: 5px; margin: 0 1px; z-index: 1;}
.customMedia .metadata-13NcHb .metadataIcon-2FyCKU {height: 24px;}
.customMedia .metadata-13NcHb .metadataDownload-1fk90V {height: 22px; width: 24px;}
.customMedia .metadataContent-3c_ZXw {overflow: hidden;}
.customMedia .metadataName-14STf- a {color: #FFFFFF; opacity: 0.6; z-index: 1;}
.customMedia .metadataName-14STf- a:hover {opacity: 1;}
.customMedia .metadataSize-2UOOLK {z-index: 1;}
.customMedia .metadataButton {cursor: pointer; height: 22px; opacity: 0.6; min-width: 22px;} /* font-size: 22px; font-weight: bold; */
.customMedia .metadataButton:hover {opacity: 1;}
.customMedia .metadataButtonPopout {background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAVCAYAAABc6S4mAAAAbklEQVR4AWP4//8/dkwdYEIVC0Yt2AjEDiTgWlItmA7ik4AD6W5BBRAfwcAI8BzEJ4C34LOgmgqReWHkWLCERHwPv72YFnCSkmLoYwEiiCqxYEGqWYBLDckWjFqwlUT8lTgLKAaELbhLIT6GywIA5SnsLtcbhqwAAAAASUVORK5CYII=) no-repeat center / 18px;}
.customMedia .metadataButtonExpand {background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAVCAYAAABc6S4mAAAAO0lEQVR4AWP4//9/8n/aAR+SLRi1IBKIHSjE2fgsUARiBgqx5WC3YNSCUQtGLRi1YCuVMP3rg7s0wj4AGC3DMn4UuAEAAAAASUVORK5CYII=) no-repeat center / 18px;}
.customMedia.customAudio .audioControls-2HsaU6 {vertical-align: middle; width: 25vw; min-width: 500px;}
.customMedia.customImg img {cursor: pointer; min-height: 50px; max-width: 400px; max-height: 300px;}
.customMedia.customImg .imageWrapper-2p5ogY img {position: static;}
.customMedia.customVideo video {align-self: center; cursor: pointer; border-radius: 3px 3px 0 0; margin: 0; vertical-align: middle; width: auto; max-width: 20vw; max-height: 25vh; min-width: 300px;}
.customMedia.customVideo video::-webkit-media-controls {padding-top: 32px;}
.customMedia.customVideo.customMediaHorizontal video {max-width: calc(100vw - 740px); min-height: 35vh;}
.customMedia.customVideo.customMediaVertical video {height: 60vh; max-width: 100%; max-height: unset;}
.customMedia.customVideo.customMediaHorizontal .metadataButtonExpand::after, .customMedia.customVideo.customMediaVertical .metadataButtonExpand::after {border: 3px solid #3A71C1; content: ''; display: inline-flex; height: 10px; margin-left: 2px; vertical-align: middle; width: 12px;}
.customMedia.customVideo .metadata-13NcHb {background: none; display: none; padding: 10px 10px 0;}
.customMedia.customVideo .imageWrapper-2p5ogY {display: flex; flex-direction: column; min-width: 400px; overflow: visible;}
.customMedia.customVideo .imageWrapper-2p5ogY:hover .metadata-13NcHb {display: flex;}
.customMedia.customIframe iframe {margin-top: 40px; max-width: 100%; min-width: 500px; min-height: 300px; max-height: 600px; resize: both; overflow: auto; vertical-align: middle; z-index: 1;}
.customMedia.customIframe .metadata-13NcHb {max-width: 100%; min-width: 500px;}
.theme-dark .customMedia.customIframe iframe {background-color: rgba(46,48,54,.3); border: 1px solid rgba(46,48,54,.6);}
.theme-light .customMedia.customIframe iframe {background: hsla(0,0%,98%,.3); border: 1px solid hsla(0,0%,80%,.3);}
.CustomMediaSupportModal.orriePluginModal .modal-yWgWj- {overflow: auto; resize: both; width: 2270px; max-width: 95vw; max-height: 95vh; min-height: 820px; backface-visibility: hidden;}
.CustomMediaSupportModal .customMedia.customVideo video {max-height: 80vh; min-height: 50vh; max-width: 90vw;}
.CustomMediaSupportModal .customMedia.customIframe iframe {height: 80vh !important; width: 90vw !important; max-height: unset; max-width: unset; resize: none;}
.CustomMediaSupportModal .customMedia.customImg img {cursor: unset;}
.CustomMediaSupportModal .customModalText {margin: 8px auto 0;}
.container-1ov-mD.media-replace .customMedia.customVideo video {object-fit: fill; width: 100%;}
.container-1ov-mD.media-replace .metadataButtonExpand {display: none;}
.customMediaToggled {display: none !important;}
/* player style */
.customMedia .audioVolumeWrapper-2t9juP, .customMedia .videoVolumeWrapper-3syuC- {align-self: stretch; display: flex; bottom: unset; position: unset; right: unset; transform: unset;}
.customMedia .mediaBarInteractionVolume-3QZqYd {background-color: unset; width: 90px;}
.customMedia .mediaBarWrapper-3D7r67 {width: 90px;}
.customMedia .videoControls-2kcYic {bottom: 0px; display: flex; padding-bottom: 0px; position: initial;}
.customMedia.customVideo .customMediaHover .videoControls-2kcYic {display: none; margin-top: -32px; z-index: 1;}
.customMedia.customVideo .customMediaHover:hover .videoControls-2kcYic {display: flex;}
.customMedia .customMediaNoSound path {fill: #FF0404;}
/*
.customMedia ::-webkit-media-controls-current-time-display, .customMedia ::-webkit-media-controls-time-remaining-display {color: #BEBEBE}
.customMedia ::-webkit-media-controls-panel {background-color: #202225; border-radius: 0 0 3px 3px; display: flex !important; opacity: 1 !important;}
.customMedia ::-webkit-media-controls-play-button, .customMedia ::-webkit-media-controls-fullscreen-button, .customMedia ::-webkit-media-controls-mute-button, .customMedia ::-internal-media-controls-download-button {cursor: pointer; filter: brightness(1.5);}
.customMedia ::-webkit-media-controls-play-button:hover, .customMedia ::-webkit-media-controls-fullscreen-button:hover, .customMedia ::-webkit-media-controls-mute-button:hover, .customMedia ::-internal-media-controls-download-button:hover {cursor: pointer; filter: brightness(2.5);}
.customMedia ::-webkit-media-controls-timeline, .customMedia ::-webkit-media-controls-volume-slider {cursor: pointer; margin: 0 10px; padding: 3px 0;}
::-webkit-media-controls-fullscreen-button {display: none;}
*/
/* hide download button */
/*
.customMedia.customVideo ::-webkit-media-controls {overflow: hidden !important}
.customMedia.customVideo ::-webkit-media-controls-enclosure {width: calc(100% + 32px);margin-left: auto;}
*/
/* exhentai previews */
.customSadpanda {}
.customSadpanda .embedTitle-3OXDkz {max-width: 694px; overflow: hidden; text-overflow: ellipsis; vertical-align: bottom; white-space: nowrap;}
.customSadpanda .gallery_info {background-color: hsla(0,0%,0%,0.15); border-radius: 5px; padding: 5px 5px 10px; width: 100%;}
.customSadpanda .gallery_info .desc {color: #FFFFFF;}
.customSadpanda .gallery_info .tag {display: inline-block; margin: 0 3px;}
.customSadpanda .gallery_info .tag::after{content: ',';}
.customSadpanda .gallery_info .tag:last-child::after {content: '';}
.customSadpanda .gallery_preview {padding: 0; width: 1px;}
.customSadpanda .gallery_preview img {max-height: 300px;}
.customSadpanda .embed-IeVjo6 {max-width: 750px;}
.customSadpanda .embedInner-1-fpTo {flex-grow: 1;}
.customSadpanda .embedFull-2tM8--.cat-doujinshi {border-color: #FF2525;}
.customSadpanda .embedFull-2tM8--.cat-manga {border-color: #FFB225;}
.customSadpanda .embedFull-2tM8--.cat-artistcg {border-color: #E8D825;}
.customSadpanda .embedFull-2tM8--.cat-aamecg {border-color: #259225;}
.customSadpanda .embedFull-2tM8--.cat-western {border-color: #9AFF38;}
.customSadpanda .embedFull-2tM8--.cat-non-h {border-color: #38ACFF;}
.customSadpanda .embedFull-2tM8--.cat-imageset {border-color: #2525FF;}
.customSadpanda .embedFull-2tM8--.cat-cosplay {border-color: #652594;}
.customSadpanda .embedFull-2tM8--.cat-asianporn {border-color #F2A7F2;}
.customSadpanda .embedFull-2tM8--.cat-misc {border-color: #D3D3D3;}
.customSadpanda .gallery_info .cat-doujinshi {color: #FF2525;}
.customSadpanda .gallery_info .cat-manga {color: #FFB225;}
.customSadpanda .gallery_info .cat-artistcg {color: #E8D825;}
.customSadpanda .gallery_info .cat-gamecg {color: #259225;}
.customSadpanda .gallery_info .cat-western {color: #9AFF38;}
.customSadpanda .gallery_info .cat-non-h {color: #38ACFF;}
.customSadpanda .gallery_info .cat-imageset {color: #2525FF;}
.customSadpanda .gallery_info .cat-cosplay {color: #652594;}
.customSadpanda .gallery_info .cat-asianporn {color: #F2A7F2;}
.customSadpanda .gallery_info .cat-misc {color: #D3D3D3;}
/* 4chan previews */
.customChan {color: #AAAAAA; display: inline-flex;}
.customChan .embed-IeVjo6 {max-width: 640px; min-width: 520px;}
.customChan .embedFull-2tM8--.board-sfw {border-color: #9099D0;}
.customChan .embedFull-2tM8--.board-nsfw {border-color: #FFBEAF;}
.customChan .embedInner-1-fpTo {flex-grow: 1;}
.customChan .thread_head {position: relative;}
.customChan .thread_head .thread_posttype {font-weight: bold; line-height: 30px; margin: 0 5px;}
.customChan .thread_head .thread_data {display: inline; position: absolute; right: 0;}
.customChan .thread_head .thread_data td:last-of-type {text-align: right;}
.customChan .thread_link {font-weight: 500; white-space: nowrap;}
.customChan .thread_link span {display: inline; margin: 0 5px;}
.customChan .thread_info {white-space: nowrap;}
.customChan .thread_info span {margin-right: 3px;}
.customChan .thread_info .thread_title {display: inline-block; font-weight: bold; max-width: 278px; overflow: hidden; text-overflow: ellipsis; vertical-align: bottom;}
.customChan .thread_info .thread_creator {color: #30A75C;}
.customChan .thread_preview {padding: 0; width: 1px;}
.customChan .thread_preview img {border-radius: 5px; display: inline-block; height: unset; max-height: 200px; max-width: 200px;}
.customChan .thread_comment {background-color: hsla(0,0%,0%,0.15); border-radius: 5px; padding: 5px 5px 10px; width: 100%; word-break: break-word;}
.customChan .thread_comment a {word-break: break-word;}
.customChan .thread_comment br {display: none;}
.customChan .thread_comment .thread_comment_scroller {max-height: 280px;}
.customChan .thread_comment .thread_comment_scroller .scroller-2FKFPG {overflow-y: auto;}
.customChan .thread_foot {padding: 10px 2px 0;}
.custom_warning {color: #F32323;}
/* steam workshop previews */
.customSteam {display: inline-flex;}
.customSteam .embed-IeVjo6 {max-width: 426px}
.customSteam .grid-1nZz7S {grid-auto-columns: 390px; grid-template-columns: unset;}
.customSteam .embedInner-1-fpTo {flex-grow: 1;}
.customSteam .embedFull-2tM8-- {border-color: #1B2838;}
.customSteam img.image {max-height: 250px; max-width: 330px; margin: 0 auto;}
.customSteam .scrollerWrap-2lJEkd {background-color: hsla(0,0%,0%,0.15); height: 100px; padding-left: 4px;}
.customSteam .embedDescription-1Cuq9a {white-space: pre-line; word-wrap: break-word;}
/* greentext */
.greentext {color: #709900;}
/* spoiler */
.customMedia .spoiler {background: #1D1D1D;}
.customMedia .spoiler:hover {background-color: unset; color: #ADADAD !important;}
.customMedia .spoiler::before {display: inline; content: "Spoiler:"; font-family: inherit; padding: 0 2px;}
/* archive manager */
.container-1r6BKw {overflow: initial;}
.customMenuIcon {background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAASCAYAAABrXO8xAAABfElEQVR42rWSu4rCQBiF51n2VVJsZSVEkWjjXQOCooUajeJdtLNR8QJaKYiCl85SEDvxCbb3BbY4y5nCDSiSxoGTGf7/fJOTnwguj8fz5XK5rtFoFKFQ6KXYc7vdV3olpKrqdzwevw8GA3S7XXQ6nZdibzgcQtf1OxkRDAZ/1+s1NpsNuL/Rw0NGRCIRtNttZLNZGIbxVrlcDq1WS8aWYLPZRLlcZqS3qlQqqNfrHwALhcIjHs+feSOHw8Z0OkWv1+P5Sfl8/h/ko9FoIBAIyOJiscB+v8dut8N4PJZJEokEwuHwwxOLxSBY5G2KomA0GklwuVxiu93ifD7jdrvJfT6fw+fzoVQqgYxIp9MoFotwOp0S7Pf7mEwmmM1mWK1WOBwOOB6PuFwujCoHRkbw21KpFGFbopc/gjBNE5lMhlOzJXoZV9RqNSvI349Ttoo1KygHJFhk9mq1SslzMpm06qnPC4SmaSe/3//Dm+yIXjKCy+FwmF6vF3ZEL5k/rZRshi+9vygAAAAASUVORK5CYII=) no-repeat center; opacity: 0.6; width: 24px;}
.customMenuIcon:hover {opacity: 1;}
.customArchiveContent {background-color: unset;}
.customArchiveHeader > div {margin: 0 5px; width: 195px;}
.customArchiveHeader > div:hover {color: var(--text-normal);}
.customArchiveFilter {padding-bottom: 8px;}
.customArchiveFilter .input-cIJ7To {padding: 0 10px; width: 250px;}
.customArchiveFilter .customArchiveClean {align-items: center; color: hsla(0,0%,100%,0.7);}
.customArchiveCleanMenu {align-self: center; position: absolute; right: 30px; z-index: 10;}
.customArchiveCleanMenu .customArchiveCleanMenuButtons {display: none; position: absolute; right: -10px;}
.customArchiveCleanMenu:hover .customArchiveCleanMenuButtons {display: block;}
.customArchiveCleanMenu .orrie-tooltip .tooltipLeft-3EDOk1 {right: calc(100% + 10px);}
.customArchiveCleanMenu .orrie-tooltip .tooltipRight-2JM5PQ {left: calc(100% + 10px);}
.customArchiveActiveButton .divider-3573oO {background-color: #a5a5a5;}
.customArchiveContainer > div {display: none;}
.customArchiveContainer .customArchiveActive {display: flex}
.customArchiveContainer .customMedia {margin: 5px 10px; position: relative;}
.customArchiveContainer .customMedia .embed-IeVjo6 {flex-grow: 1; height: 100%; max-width: unset; width: inherit;}
.customArchiveContainer .customMedia.customSteam .embed-IeVjo6 {max-width: 400px;}
.customArchiveDelete {position: absolute; top: 3px; right: 3px;}
.customArchiveDelete:hover .close-hhyjWJ, .customArchiveClean:hover .close-hhyjWJ {background-color: rgba(240, 71, 71, 0.5);}
.customArchiveDelete .close-hhyjWJ {height: 18px;}
.customArchiveEmpty {height: 24px; text-align: center; padding: 8px;}
#customArchiveSadpanda .customSadpanda {width: 730px;}
#customArchiveChan .customChan {width: 620px;}
#customArchiveChan .thread_head .thread_data {right: 30px;}
#customArchiveSteam .customSteam {width: 400px;}
#customArchiveSteam .customSteam .grid-1nZz7S {grid-auto-columns: 368px; grid-template-columns: unset;}
			`,
			shared: `
.orriePluginModal .backdrop-1wrmKB {background-color: #000000; opacity: 0.85;}
.orriePluginModal .modal-3c3bKg {opacity: 1;}
.orriePluginModal .modal-yWgWj- {padding: 0 20px; width: 800px;}
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
.orrie-tooltip {overflow: initial;}
.orrie-tooltip:hover > .tooltip-2QfLtc {display: block; position: absolute;}
.orrie-tooltip .tooltip-2QfLtc {display: none; margin: 0; text-align: center; width: max-content;}
.orrie-tooltip .tooltipTop-XDDSxx {bottom: 135%; left: 50%; transform: translateX(-50%); top: unset;}
.orrie-tooltip .tooltipBottom-3ARrEK {top: 135%; left: 50%; transform: translateX(-50%); bottom: unset;}
.orrie-tooltip .tooltipRight-2JM5PQ {left: 135%; top: 50%; transform: translateY(-50%); right: unset;}
.orrie-tooltip .tooltipLeft-3EDOk1 {right: 135%; top: 50%; transform: translateY(-50%); left: unset;}
.orrie-tooltip .tooltip-2QfLtc:hover {display: none;}
			`
		},
		icons: {
			"play": `<svg name="Play" class="controlIcon-3cRbti" width="16" height="16" viewBox="0 0 24 24"><polygon fill="currentColor" points="0 0 0 14 11 7" transform="translate(7 5)"></path></svg>`,
			"pause": `<svg name="Pause" class="controlIcon-3cRbti" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M0,14 L4,14 L4,0 L0,0 L0,14 L0,14 Z M8,0 L8,14 L12,14 L12,0 L8,0 L8,0 Z" transform="translate(6 5)"></path></svg>`,
			"replay": `<svg name="Replay" class="controlIcon-3cRbti" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12,5 L12,1 L7,6 L12,11 L12,7 C15.31,7 18,9.69 18,13 C18,16.31 15.31,19 12,19 C8.69,19 6,16.31 6,13 L4,13 C4,17.42 7.58,21 12,21 C16.42,21 20,17.42 20,13 C20,8.58 16.42,5 12,5 L12,5 Z"></path></svg>`,
			"speaker": `<svg name="Speaker" class="controlIcon-3cRbti" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M9.33333333,2 L9.33333333,3.37333333 C11.26,3.94666667 12.6666667,5.73333333 12.6666667,7.84666667 C12.6666667,9.96 11.26,11.74 9.33333333,12.3133333 L9.33333333,13.6933333 C12,13.0866667 14,10.7 14,7.84666667 C14,4.99333333 12,2.60666667 9.33333333,2 L9.33333333,2 Z M11,7.84666667 C11,6.66666667 10.3333333,5.65333333 9.33333333,5.16 L9.33333333,10.5133333 C10.3333333,10.04 11,9.02 11,7.84666667 L11,7.84666667 Z M2,5.84666667 L2,9.84666667 L4.66666667,9.84666667 L8,13.18 L8,2.51333333 L4.66666667,5.84666667 L2,5.84666667 L2,5.84666667 Z"></path></svg>`,
			"muted": `<svg name="SpeakerOff" class="controlIcon-3cRbti" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M13.5,9 C13.5,7.23 12.48,5.71 11,4.97 L11,7.18 L13.45,9.63 C13.48,9.43 13.5,9.22 13.5,9 L13.5,9 Z M16,9 C16,9.94 15.8,10.82 15.46,11.64 L16.97,13.15 C17.63,11.91 18,10.5 18,9 C18,4.72 15.01,1.14 11,0.23 L11,2.29 C13.89,3.15 16,5.83 16,9 L16,9 Z M1.27,0 L0,1.27 L4.73,6 L0,6 L0,12 L4,12 L9,17 L9,10.27 L13.25,14.52 C12.58,15.04 11.83,15.45 11,15.7 L11,17.76 C12.38,17.45 13.63,16.81 14.69,15.95 L16.73,18 L18,16.73 L9,7.73 L1.27,0 L1.27,0 Z M9,1 L6.91,3.09 L9,5.18 L9,1 L9,1 Z" transform="translate(3 3)"></path></svg>`
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
		const storage = BdApi.loadData(script.file, "settings"),
		archive = BdApi.loadData(script.file, "archive");
		if (storage) {
			script.settings = storage;
		}
		else {
			BdApi.saveData(script.file, "settings", script.settings);
		}
		if (archive) {
			archive.filter = [];
			archive.proxy = {};
			script.archive = archive;
			BdApi.saveData(script.file, "archive", script.archive);
		}
		if (typeof window.PluginUpdates !== "object" || !window.PluginUpdates) {
			window.PluginUpdates = {plugins:{}};
		}
		window.PluginUpdates.plugins[script.raw] = {name:script.name, raw:script.raw, version:script.version};
		log("info", "Settings Loaded");
	},
	log = function(method, title, data) {
		// logging function
		if (script.settings.debug || method == "error") {
			console[method](`%c[${script.file}]%c ${new Date().toLocaleTimeString("en-GB")}: ${title}`, "color: purple; font-weight: bold;", "", data ? data : "");
		}
	},
	scrollElement = function(scrollDistance = 0, parentClass = "messages-3amgkR", forceScroll = false) {
		// scroll element
		const parent = document.getElementsByClassName(parentClass)[0];
		if (forceScroll || (parent.scrollHeight - parent.scrollTop - parent.clientHeight - scrollDistance <= 10)) {
			parent.scrollTop += scrollDistance;
		}
	},
	modalHandler = function(modalContent, data) {
		const removeModal = function(modal) {
			if (data && data.videoElement) {
				const video = modal.getElementsByTagName("video")[0];
				data.videoElement.currentTime = video.currentTime;
				if (!video.paused) {
					data.videoElement.play();
					data.videoElement.nextElementSibling.firstElementChild.innerHTML = script.icons.pause;
				}
			}
			modal.remove();
		},
		modalParent = document.getElementsByClassName("popouts-2bnG9Z")[0].nextElementSibling;
		// modify modalContent if there's relevant data
		if (data) {
			modalContent.appendChild(_createElement("div", {className: "description-3_Ncsb userSelectText-1o1dQ7 customModalText", textContent: `${data.fileTitle}${data.fileSize ? ` - ${data.fileSize}` : ""}${data.fileRes ? ` - ${data.fileRes}` : ""}`}));
		}
		// create modal structure
		const modal = _createElement("span", {className: `${script.file}Modal orriePluginModal`}, [
			_createElement("div", {className: "backdrop-1wrmKB", onclick() {removeModal(modal);}}),
			_createElement("div", {className: "modal-3c3bKg"},
				_createElement("div", {className: "inner-1ilYF7"}, modalContent)
			)
		]),
		button = modal.getElementsByClassName("customModalCancel")[0];
		if (button) {
			button.addEventListener('click', function() {removeModal(modal);}, false);
		}
		if (modalParent) {
			modalParent.appendChild(modal);
		}
		else {
			log("error", "modal insertion", modalContent);
		}
	},
	mediaCheck = function(message, fileFilter) {
		const mediaElements = message.getElementsByClassName("customMedia");
		if (mediaElements.length) {
			for (let _cm=mediaElements.length; _cm--;) {
				if (mediaElements[_cm].fileFilter == fileFilter) {
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
		if (!script.check.replace) {
			script.check.replace = true;
			const mediaAll = message.querySelectorAll(`.container-1ov-mD:not(.customMedia) video[src]:not([src=""]), .container-1ov-mD:not(.customMedia) source, .container-1ov-mD:not(.customMedia) a`);
			for (let _rm=mediaAll.length; _rm--;) {
				const media = mediaAll[_rm],
				url = decodeURI(encodeURI((media.tagName == "VIDEO" || media.tagName == "SOURCE" ? media.getAttribute("src") : media.getAttribute("href")).replace("%2B","+"))),
				fileFilter = url.split("/").slice(-2).join("/");
				if (media && script.archive.filter.includes(fileFilter)) {
					let wrapper = media.closest(".container-1ov-mD > div");
					if (wrapper) {
						wrapper.classList.add("customMediaToggled");
					}
					if (script.archive.proxy[fileFilter] == "ERROR") {
						const source = document.getElementById(`error_${fileFilter}`);
						if (source) {
							const sourceParent = source.parentNode;
							source.id = "";
							source.src = url;
							if (sourceParent) {
								sourceParent.load();
								sourceParent.classList.remove("customMediaToggled");
								if (sourceParent.closest(".imageWrapper-2p5ogY")) {
									sourceParent.closest(".imageWrapper-2p5ogY").nextElementSibling.classList.add("customMediaToggled");
								}
							}
						}
						delete script.archive.proxy[fileFilter];
					}
					else {
						script.archive.proxy[fileFilter] = url;
					}
				}
			}
			script.check.replace = false;
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
	mediaConvert = function(type, node, name) {
		// main media function -- checks every anchor element in messages
		if (!script.check.media) {
			script.check.media = true;
			let parent = type == "metadata" ? node.closest(".da-message") : node;
			const links = parent ? parent.querySelectorAll(script.classes[type]) : false;
			log("info", `mediaConvert - ${type} - ${name}`, {parent, links});
			for (let _l=links.length; _l--;) {
				const link = links[_l];
				if (link.tagName == "VIDEO" && !link.getAttribute("src") && link.getElementsByTagName("SOURCE").length) {
					link = link.getElementsByTagName("SOURCE")[0];
				}
				if (link.getAttribute("href") || link.getAttribute("src")) {
					const fileLink = link.tagName == "VIDEO" || link.tagName == "SOURCE" ? link.getAttribute("src") : link.getAttribute("href"),
					href = decodeURI(encodeURI((/\/external\//.test(fileLink) && fileLink.match(/(https\/[\w-./\\_]+)/g) ? fileLink.match(/(https\/[\w-./\\_]+)/g)[0].replace("https/","https://") : fileLink).replace("http:", "https:").replace("www.","").replace(".gifv", ".mp4"))),
					hrefSplit = href.split("/"),
					message = link.closest(".da-message"),
					fileType = href.match(/\.(\w+$)/) ? href.match(/\.(\w+$)/)[1] : false;
					let hostName = hrefSplit[2].match(/([\w\-]+\.\w+)$/) ? hrefSplit[2].match(/([\w\-]+\.\w+)$/)[0] : false;
					if (hostName && script.media.clone[hostName]) {
						hostName = script.media.clone[hostName];
					}
					if (!script.media.blacklist.includes(hostName) && script.settings.embedding && message && fileType || script.media.whitelist.includes(hostName)) {
						const media_container = message.getElementsByClassName("container-1ov-mD").length ? message.getElementsByClassName("container-1ov-mD")[0] : false,
						media = media_container.getElementsByTagName("video"),
						fileSite = script.media.sites[hostName] || false;
						let media_length = media.length,
						data = {
							fileMedia: fileType ? script.media.types[fileType.toLowerCase()] : false,
							fileName: hrefSplit[hrefSplit.length-1] ? hrefSplit[hrefSplit.length-1].match(/[^\.]*/)[0] : "",
							fileFilter: hrefSplit.slice(-2).join("/"),
							filePoster: message.getElementsByClassName("embedVideo-3nf0O9").length && message.getElementsByClassName("embedVideo-3nf0O9")[0].poster ? message.getElementsByClassName("embedVideo-3nf0O9")[0].poster : "",
							fileReplace: false,
							fileSize: message.getElementsByClassName("metadataSize-2UOOLK").length ? message.getElementsByClassName("metadataSize-2UOOLK")[0].textContent : "",
							fileTitle: message.getElementsByClassName("embedTitleLink-1Zla9e").length ? message.getElementsByClassName("embedTitleLink-1Zla9e")[0].innerHTML : decodeURIComponent(hrefSplit[hrefSplit.length-1]),
							fileDiscord: "",
							fileLink, fileType, href, hrefSplit, hostName, link, message, media_container
						};
						if (media_length > 1) {
							while (media_length--) {
								data.fileDiscord =  new RegExp(data.fileFilter).test(media[media_length].src) ? media[media_length].src : "";
							};
						}
						if (fileSite && fileSite.data) {
							data = Object.assign(data, fileSite.data(data));
							if (data.href) {
								data.fileFilter = data.href.split("/").slice(-2).join("/");
							}
						}
						// only continues if mediaCheck is true -- as in, the embedding doesn't already exist
						if (data.href && data.fileMedia && data.fileMedia !== "ignore" && mediaCheck(message, data.fileFilter)) {
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
				node.classList.add("customIgnore");
			}
			script.check.media = false;
		}
	},
	mediaEmbedding = function(data, mode) {
		log("info", "mediaEmbedding", data);
		const {fileMedia, fileTitle, fileType, fileSize, filePoster, fileReplace, fileFilter, fileDiscord, href, hostName, message, media_container} = data,
		previewReplace = script.media.replace.includes(hostName);
		let metaDataElement, mediaProperties, mediaControls;
		switch(fileMedia) {
			case "video":
			case "audio":
				if (mode !== "return") {
					metaDataElement = fileMedia == "video" ? _createElement("div", {className: "metadata-13NcHb", innerHTML: `<div class='metadataContent-3c_ZXw userSelectText-1o1dQ7'><div class='metadataName-14STf-'><a class='white-2qwKC7 customIgnore' href='${href}' target='_blank'>${fileTitle}</a></div><div class='metadataSize-2UOOLK'>${fileSize}</div></div>`}, [
						_createElement("a", {className: "metadataDownload-1fk90V orrie-tooltip orrie-relative customIgnore", href, target: "_blank", innerHTML: `<svg viewBox='0 0 24 24' name='Download' class='metadataIcon-2FyCKU' width='24' height='24'><g fill='none' fill-rule='evenodd'><path d='M0 0h24v24H0z'></path><path class='fill' fill='currentColor' d='M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z'></path></g></svg><div class='tooltip-2QfLtc tooltipBlack-PPG47z ${previewReplace ? "tooltipLeft-3EDOk1" : "tooltipTop-XDDSxx"}'><div class='tooltipPointer-3ZfirK'></div>Download Video</div>`}),
						_createElement("div", {className: "metadataButton metadataButtonPopout orrie-tooltip orrie-relative", innerHTML: `<div class='tooltip-2QfLtc tooltipBlack-PPG47z ${previewReplace ? "tooltipLeft-3EDOk1" : "tooltipTop-XDDSxx"}'><div class='tooltipPointer-3ZfirK'></div>Popout Video</div>`, // &#128471;
							onclick() {
								const video = this.parentNode.nextElementSibling;
								data.videoElement = video;
								data.currentTime = video.currentTime;
								data.playing = !video.paused;
								video.pause();
								video.nextElementSibling.firstElementChild.innerHTML = script.icons.play;
								modalHandler(mediaEmbedding(data, "return"), data);
							}
						}),
						_createElement("div", {className: "metadataButton metadataButtonExpand orrie-tooltip orrie-relative", innerHTML: "<div class='tooltip-2QfLtc tooltipBlack-PPG47z tooltipTop-XDDSxx'><div class='tooltipPointer-3ZfirK'></div>Expand Video</div>", // &#128470
							onclick() {
								const video = this.parentNode.nextElementSibling;
								container.classList.toggle(video.videoWidth/video.videoHeight > 1.25 ? "customMediaHorizontal" : "customMediaVertical");
								if (container.getBoundingClientRect().bottom > document.getElementsByClassName("messages-3amgkR")[0].clientHeight) {
									message.scrollIntoView(false);
								}
							}
						})
					]) : _createElement("div", {className: "audioMetadata-3zOuGv", innerHTML: `<div class='metadataContent-3c_ZXw userSelectText-1o1dQ7'><a class='metadataName-14STf- customIgnore' href='${href}' target='_blank'>${fileTitle}</a><div class='metadataSize-2UOOLK'>${fileSize}</div></div><a class='metadataDownload-1fk90V orrie-tooltip orrie-relative customIgnore' href='${href}' target='_blank'><svg viewBox='0 0 24 24' name='Download' class='metadataIcon-2FyCKU' width='24' height='24'><g fill='none' fill-rule='evenodd'><path d='M0 0h24v24H0z'></path><path class='fill' fill='currentColor' d='M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z'></path></g></svg><div class='tooltip-2QfLtc tooltipBlack-PPG47z tooltipTop-XDDSxx'><div class='tooltipPointer-3ZfirK'></div>Download Audio</div></a>`});
				}
				mediaProperties = {preload: script.settings.preload ? "metadata" : "none", loop: script.settings.loop, autoplay: script.settings.autoplay, poster: filePoster,
					onclick() {
						if (this.paused) {
							this.play();
							this.nextElementSibling.firstElementChild.innerHTML = script.icons.pause;
						}
						else {
							this.pause();
							this.nextElementSibling.firstElementChild.innerHTML = script.icons.play;
						}
					},
					onloadedmetadata() {
						if (fileMedia == "video") {
							data.fileRes = `${this.videoWidth}px × ${this.videoHeight}px`;
							if (script.settings.hoverPlay) {
								this.onmouseover = function() {
									if (this.paused) {
										this.play();
										this.nextElementSibling.firstElementChild.innerHTML = script.icons.pause;
									}
								};
								this.onmouseout = function() {
									this.pause();
									this.nextElementSibling.firstElementChild.innerHTML = script.icons.play;
								};
							}
							if (data.currentTime) {
								this.currentTime = data.currentTime;
								if (data.playing) {
									this.play();
									this.nextElementSibling.firstElementChild.innerHTML = script.icons.pause;
								}
							}
						}
						// volume
						this.volume = script.settings.volume;
						this.nextElementSibling.children[4].firstElementChild.firstElementChild.firstElementChild.style.width = `${script.settings.volume*100}%`;
						// total runtime
						this.nextElementSibling.children[1].lastElementChild.textContent = `${parseInt((this.duration / 60) % 60)}:${(`0${parseInt(this.duration % 60)}`).slice(-2)}`;
						// make sure loading error message is hidden
						if (this.closest(".imageWrapper-2p5ogY")) {
							this.closest(".imageWrapper-2p5ogY").nextElementSibling.classList.add("customMediaToggled");
						}
						// replace original accessory previews if they exist
						if (!previewReplace) {
							if (!script.archive.filter.includes(fileFilter)) {
								script.archive.filter.push(fileFilter);
							}
							mediaReplace(message);
						}
						scrollElement(message.scrollHeight);
					},
					ontimeupdate() {
						const controls = this.nextElementSibling.children;
						if (!this.muted && this.webkitAudioDecodedByteCount === 0 && this.webkitVideoDecodedByteCount !== 0) {
							this.muted = true;
							controls[3].classList.add("customMediaNoSound");
							controls[3].innerHTML = script.icons.muted;
							controls[4].classList.add("customMediaToggled");
						}
						controls[1].firstElementChild.textContent = `${parseInt((this.currentTime/60)%60)}:${(`0${parseInt(this.currentTime%60)}`).slice(-2)}`;
						controls[2].firstElementChild.firstElementChild.children[2].style.width = `${(100/this.duration)*this.currentTime}%`;
					},
					onended() {
						this.nextElementSibling.firstElementChild.innerHTML = script.icons.replay;
					}
				};
				mediaControls = _createElement("div" , {className: fileMedia == "video" ? "videoControls-2kcYic" : "audioControls-2HsaU6"}, [
					_createElement("div", {tabindex: "0", role: "button", innerHTML: script.icons.play,
						onclick() {
							const video = this.parentNode.previousElementSibling;
							if (video.paused) {
								video.play();
								this.innerHTML = script.icons.pause;
							} else {
								video.pause();
								this.innerHTML = script.icons.play;
							}
						}
					}),
					_createElement("div", {className: "durationTimeWrapper-OugPFt", innerHTML: "<span class='durationTimeDisplay-jww5fr weightMedium-2iZe9B'>0:00</span><span class='durationTimeSeparator-2_xpJ7 weightMedium-2iZe9B'>/</span><span class='durationTimeDisplay-jww5fr weightMedium-2iZe9B'>0:00</span>"}),
					_createElement("div", {className: "horizontal-3Sq5iO", innerHTML: "<div class='mediaBarInteraction-37i2O4'><div class='mediaBarWrapper-3D7r67 fakeEdges-27pgtp'><div class='buffer-26XPkd fakeEdges-27pgtp' style='width: 0%; left: 0%;'></div><div class='mediaBarPreview-1jfyFs fakeEdges-27pgtp' style='width: 0%;'></div><div class='mediaBarProgress-1xaPtl fakeEdges-27pgtp' style='width: 0%;'><span class='mediaBarGrabber-1FqnbN'/></div><div class='bubble-3qRl2J' style='left: 0%;'>0:0</div></div></div>",
						onclick(e) {
							const video = this.parentNode.previousElementSibling;
							video.currentTime = (video.duration*((e.pageX-(this.getBoundingClientRect().left+document.body.scrollLeft))/this.offsetWidth)*100)/100;
						},
						onmousedown(e) {
							const video = this.parentNode.previousElementSibling;
							this.leftButtonPressed = true;
							e.preventDefault();
							video.wasPlaying = !video.paused;
							const mouseup = () => {
								this.leftButtonPressed = false;
								if (video.wasPlaying) {
									video.play();
								}
								document.removeEventListener('mouseup', mouseup);
							};
							document.addEventListener('mouseup', mouseup, false);
						},
						onmousemove(e) {
							const video = this.parentNode.previousElementSibling,
							bubble = this.firstElementChild.firstElementChild.lastElementChild,
							time = (video.duration*((e.pageX-(this.getBoundingClientRect().left+document.body.scrollLeft))/this.offsetWidth)*100)/100;
							bubble.textContent = `${parseInt((time/60)%60)}:${(`0${parseInt(time%60)}`).slice(-2)}`;
							bubble.style.left = `${time/video.duration*100}%`;
							if (this.leftButtonPressed) {
								video.pause();
								video.currentTime = (video.duration*((e.pageX-(this.getBoundingClientRect().left+document.body.scrollLeft))/this.offsetWidth)*100)/100;
							}
						}
					}),
					_createElement("div", {className: "flex-1O1GKY", innerHTML: `<div tabindex='0' role='button'>${script.icons.speaker}</div>`,
						onclick() {
							const video = this.parentNode.previousElementSibling;
							if (video.muted === true) {
								video.muted = false;
								this.innerHTML = script.icons.speaker;
							}
							else {
								video.muted = true;
								this.innerHTML = script.icons.muted;
							}
						}
					}),
					_createElement("div", {className: fileMedia == "video" ? "videoVolumeWrapper-3syuC-" : "audioVolumeWrapper-2t9juP", innerHTML: "<div class='mediaBarInteraction-37i2O4 mediaBarInteractionVolume-3QZqYd'><div class='mediaBarWrapper-3D7r67 fakeEdges-27pgtp mediaBarWrapperVolume-354-jo'><div class='mediaBarProgress-1xaPtl fakeEdges-27pgtp' style='width: 100%;'><span class='mediaBarGrabber-1FqnbN'/></div></div></div>",
						onclick(e) {
							const video = this.parentNode.previousElementSibling,
							volumeBar = this.firstElementChild,
							volume = (Math.ceil((e.pageX-(volumeBar.getBoundingClientRect().left+document.body.scrollLeft))/5)*5)/volumeBar.offsetWidth;
							video.volume = volume;
							volumeBar.firstElementChild.firstElementChild.style.width = `${volume*100}%`;
						},
						onmousedown(e) {
							this.leftButtonPressed = true;
							e.preventDefault();
							const mouseup = () => {
								this.leftButtonPressed = false;
								document.removeEventListener('mouseup', mouseup);
							};
							document.addEventListener('mouseup', mouseup, false);
						},
						onmousemove(e) {
							if (this.leftButtonPressed) {
								const volumeBar = this.firstElementChild,
								speakerIcon = this.previousElementSibling.firstElementChild,
								volume = (Math.ceil((e.pageX-(volumeBar.getBoundingClientRect().left+document.body.scrollLeft))/5)*5)/volumeBar.offsetWidth;
								this.parentNode.previousElementSibling.volume = volume;
								volumeBar.firstElementChild.firstElementChild.style.width = `${volume*100}%`;
								if (volume == 0) {
									speakerIcon.innerHTML = script.icons.muted;
								}
								else if (speakerIcon.innerHTML !== script.icons.speaker) {
									speakerIcon.innerHTML = script.icons.speaker;
								}
							}
						}
					}),
					fileMedia == "video" ? _createElement("div", {tabindex: "0", role: "button", innerHTML: "<svg class='controlIcon-3cRbti' name='FullScreen' width='16' height='16' viewBox='0 0 24 24' style='margin-left: 0px;'><path fill='currentColor' d='M7,14 L5,14 L5,19 L10,19 L10,17 L7,17 L7,14 L7,14 Z M5,10 L7,10 L7,7 L10,7 L10,5 L5,5 L5,10 L5,10 Z M17,17 L14,17 L14,19 L19,19 L19,14 L17,14 L17,17 L17,17 Z M14,5 L14,7 L17,7 L17,10 L19,10 L19,5 L14,5 L14,5 Z'/></svg>",
						onclick() {
							this.parentNode.previousElementSibling.webkitRequestFullscreen();
						}
					}) : ""
				]);
				break;
			case "img":
				mediaProperties = {"className": fileMedia, src: fileType == "pdf" ? `https://docs.google.com/gview?url=${href}&embedded=true` : href, allowFullscreen: true, onclick() {mode !== "return" ? modalHandler(mediaEmbedding(data, "return"), data) : ""}};
				break;
			case "iframe":
				if (mode !== "return") {
					metaDataElement = _createElement("div", {className: "metadata-13NcHb", innerHTML: `<div class='metadataContent-3c_ZXw userSelectText-1o1dQ7'><div class='metadataName-14STf-'><a class='white-2qwKC7' href='${href}'>${fileTitle}</a></div><div class='metadataSize-2UOOLK'>${fileSize}</div></div>`}, [
						_createElement("div", {className: "metadataButton metadataButtonPopout orrie-tooltip orrie-relative", innerHTML: `<div class='tooltip-2QfLtc tooltipBlack-PPG47z tooltipTop-XDDSxx'><div class='tooltipPointer-3ZfirK'></div>Popout Media</div>`, // &#128471;
							onclick() {
								modalHandler(mediaEmbedding(data, "return"), data);
							}
						})
					]);
				}
				mediaProperties = {"className": fileMedia, src: fileType == "pdf" ? `https://docs.google.com/gview?url=${href}&embedded=true` : href, allowFullscreen: true};
				break;
			default:
				log("error", "mediaEmbed", href);
		}
		const container = _createElement("div", {className: `container-1ov-mD container-1e22Ot customMedia custom${fileMedia.replace(/\w/, c => c.toUpperCase())}`, fileFilter}, [
			_createElement("div", {className: `${script.classes[fileMedia]} ${script.settings.controls && fileMedia == "video" ? "customMediaHover" : "customMediaBelow"}`}, [
				metaDataElement,
				_createElement(fileMedia, mediaProperties,
					fileMedia !== "img" ? _createElement("source", {src: href,
						onerror() {
							if (!previewReplace) {
								const proxy = script.archive.proxy[fileFilter];
								if (fileDiscord) {
									this.src = fileDiscord;
									this.parentNode.load();
								}
								else if (proxy && proxy !== "ERROR" && this.src !== proxy) {
									this.src = proxy;
									this.parentNode.load();
								}
								else {
									script.archive.proxy[fileFilter] = "ERROR";
									this.id = `error_${fileFilter}`;
									this.parentNode.classList.add("customMediaToggled");
									this.parentNode.parentNode.nextElementSibling.classList.remove("customMediaToggled");
								}
							}
						}
					}) : ""
				),
				mediaControls
			]),
			_createElement("div", {className: "customMediaError userSelectText-1o1dQ7 customMediaToggled", textContent: `Unable to embed link - ${href}`})
		]);
		if (mode == "return") {
			return container;
		}
		if (previewReplace) {
			const video = message.querySelector(`video[poster*='${filePoster}']`),
			embed = video ? video.closest(".embedVideo-3nf0O9") : false;
			if (embed) {
				embed.closest(".container-1ov-mD").classList.add("media-replace");
				embed.firstElementChild.classList.add("customMediaToggled");
				embed.appendChild(container);
				embed.style.height = "auto";
			}
		}
		else {
			message.insertBefore(container, media_container);
		}
		// replace original accessory previews if they exist
		if ((fileReplace || (fileMedia == "video" || fileMedia == "audio")) && !previewReplace) {
			if (!script.archive.filter.includes(fileFilter)) {
				script.archive.filter.push(fileFilter);
			}
			mediaReplace(message);
		}
		scrollElement(message.scrollHeight);
	},
	archiveHandler = function() {
		// displays the archived links in a modal
		const archivesInfo = {
			sadpanda: {id: "Sadpanda", name: "ExHentai",       count: 0},
			chan:     {id: "Chan",     name: "4chan",          count: 0},
			steam:    {id: "Steam",    name: "Steam Workshop", count: 0},
			url:      {id: "Url",      name: "Other APIs",     count: Object.keys(script.archive.url).length, tooltip: "imgur and gfycat"},
			all:      {id: "All",      name: "Everything",     count: Object.keys(script.archive.proxy).length}
		},
		headerFragments = document.createDocumentFragment(),
		containerFragments = document.createDocumentFragment(),
		cleanMenuFragments = document.createDocumentFragment();
		BdApi.clearCSS("customFilters");
		for (let _db_k = Object.keys(archivesInfo), _db=0; _db<5; _db++) {
			const archiveName = _db_k[_db],
			archive = script.archive[archiveName],
			archiveInfo = archivesInfo[archiveName],
			archiveFragment = document.createDocumentFragment();
			if (_db<3) {
				for (let _dbe_k = Object.keys(archive), _dbe=_dbe_k.length; _dbe--;) {
					const archiveKey = _dbe_k[_dbe];
					archiveFragment.appendChild(_createElement("div", {className: `customMedia custom${archiveInfo.id} customFilter ${archive[archiveKey].tags ? archive[archiveKey].tags : ""}`, innerHTML: archive[archiveKey].html ? archive[archiveKey].html : archive[archiveKey]},
						_createElement("div", {className: "flex-1O1GKY customArchiveDelete orrie-tooltip", innerHTML: "<svg class='close-hhyjWJ flexChild-faoVW3' xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 12 12'><g fill='none' fill-rule='evenodd'><path d='M0 0h12v12H0'></path><path class='fill' fill='currentColor' d='M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6'></path></g></svg><div class='tooltip-2QfLtc tooltipBlack-PPG47z tooltipBottom-3ARrEK'><div class='tooltipPointer-3ZfirK'></div>Delete</div>", onclick() {archiveHandlerDelete(this, archiveKey, archiveName, `customArchive${archiveInfo.id}Counter`);}})
					));
					archiveInfo.count++;
				}
				headerFragments.appendChild(_createElement("div", {className: `defaultColor-1_ajX0 clickable-3rdHwn orrie-centerText ${archiveName == "sadpanda" ? "customArchiveActiveButton" : ""}`, innerHTML: `<div class='size18-3EXdSj'>${archiveInfo.name} (<span id='customArchive${archiveInfo.id}Counter'>${archiveInfo.count}</span>)</div><div class='divider-3573oO marginTop8-1DLZ1n marginBottom8-AtZOdT'></div>`, onclick() {archiveHandlerActive(this, archiveInfo.id);}}));
				containerFragments.appendChild(_createElement("div", {className: `flex-1O1GKY directionRow-3v3tfG justifyCenter-3D2jYp wrap-ZIn9Iy ${archiveName == "sadpanda" ? "customArchiveActive" : ""}`, id: `customArchive${archiveInfo.id}`}, archiveInfo.count ? archiveFragment : _createElement("div", {className: "contents-18-Yxp", innerHTML: "<h3 class='titleDefault-a8-ZSr buttonBrandLink-3csEAP marginReset-236NPn weightMedium-2iZe9B size16-14cGz5 height24-3XzeJx flexChild-faoVW3 defaultColor-1_ajX0 customArchiveEmpty' style='flex: 1 1 auto;'>Shits Empty Bro</h3>"})));
			}
			if (archiveName !== "all") {
				archivesInfo.all.count += archiveInfo.count;
			}
			cleanMenuFragments.appendChild(_createElement("div", {className: `item-1Yvehc itemBase-tz5SeC clickable-11uBi- ${archiveInfo.tooltip ? "orrie-tooltip" : ""}`, innerHTML: `<div class='label-JWQiNe'>${archiveInfo.name}</div><div class='hint-22uc-R'/>(${archiveInfo.count})</div>${archiveInfo.tooltip ? `<div class='tooltip-2QfLtc tooltipBlack-PPG47z tooltipLeft-3EDOk1'><div class='tooltipPointer-3ZfirK'></div>${archiveInfo.tooltip}</div>` : ""}`, onclick() {archiveClean(archiveName, archiveInfo.id, this);}}));
		}
		return _createElement("div", {className: "modal-yWgWj- userSelectText-1o1dQ7 sizeMedium-1fwIF2", innerHTML: "<div class='flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6 header-2tA9Os' style='flex: 0 0 auto;'><div class='flexChild-faoVW3' style='flex: 1 1 auto;'><h4 class='h4-AQvcAz title-3sZWYQ size16-14cGz5 height20-mO2eIN weightSemiBold-NJexzi defaultColor-1_ajX0 defaultMarginh4-2vWMG5 marginReset-236NPn'>Archive Manager</h4></div><button aria-label='Close' type='button' class='customModalCancel close-1kwMUs flexChild-faoVW3 button-38aScr lookBlank-3eh9lL colorBrand-3pXr91 grow-q77ONN'><div class='contents-18-Yxp'><svg name='Close' aria-hidden='false' width='18' height='18' viewBox='0 0 12 12' style='flex: 0 1 auto;'><g fill='none' fill-rule='evenodd'><path d='M0 0h12v12H0'></path><path class='fill' fill='currentColor' d='M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6'></path></g></svg></div></button></div>"}, [
			_createElement("div", {className: "flex-1O1GKY directionRow-3v3tfG justifyCenter-3D2jYp inner-3wn6Q5 customArchiveHeader", style: "flex: 0 0 auto;"}, headerFragments),
			_createElement("div", {className: "flex-1O1GKY directionRow-3v3tfG justifyCenter-3D2jYp inner-3wn6Q5 border-2AhmKo customArchiveFilter noScroll-3xWe_g", style: "flex: 0 0 auto;"}, [
				_createElement("div", {className: "flex-1O1GKY directionRow-3v3tfG"}, [
					_createElement("input", {className: "input-cIJ7To size16-14cGz5", placeholder: "Filter Content (tags or board)", type: "text", value: "",
						onchange() {
							BdApi.clearCSS("customFilters");
							BdApi.injectCSS("customFilters", `.customFilter:not(.${this.value.replace(/\s+/g,"").split(",").join(", .")}) {display:none;}`);
						}
					}),
					_createElement("div", {className: "flex-1O1GKY customArchiveClean orrie-tooltip orrie-relative", innerHTML: "<svg class='close-hhyjWJ flexChild-faoVW3' xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 12 12'><g fill='none' fill-rule='evenodd'><path d='M0 0h12v12H0'></path><path class='fill' fill='currentColor' d='M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6'></path></g></svg><div class='tooltip-2QfLtc tooltipBlack-PPG47z tooltipBottom-3ARrEK'><div class='tooltipPointer-3ZfirK'></div>Clean Filters</div>",
						onclick() {
							this.previousElementSibling.value = "";
							BdApi.clearCSS("customFilters");
						}
					})
				]),
				_createElement("div", {className: "customArchiveCleanMenu"},
					_createElement("div", {className: "customArchiveCleanMenu-wrapper orrie-tooltip orrie-relative", innerHTML: "<button type='button' class='userInfoViewingButton-2-jbH9 button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeSmall-2cSMqn grow-q77ONN'><div class='contents-18-Yxp'>Cleaning Menu</div></button><div class='tooltip-2QfLtc tooltipBlack-PPG47z tooltipTop-XDDSxx'><div class='tooltipPointer-3ZfirK'></div>Be very, very careful now!</div>"},
						_createElement("div", {className: "customArchiveCleanMenuButtons contextMenu-HLZMGh"},
							_createElement("div", {className: "itemGroup-1tL0uz"}, cleanMenuFragments)
						)
					)
				)
			]),
			_createElement("div", {className: "scrollerWrap-2lJEkd content-2BXhLs scrollerThemed-2oenus themeGhostHairline-DBD-2d border-2AhmKo"},
				_createElement("div", {className: "scroller-2FKFPG inner-3wn6Q5 container-PNkimc customArchiveContent"},
					_createElement("div", {className: "customArchiveContainer"}, containerFragments)
				)
			)
		]);
	},
	archiveHandlerActive = function({classList}, archive) {
		const activeArchive = document.getElementsByClassName("customArchiveActive")[0],
		activeButton = document.getElementsByClassName("customArchiveActiveButton")[0];
		if (activeArchive) {
			activeArchive.classList.toggle("customArchiveActive");
			activeArchive.scrollTop = 0;
		}
		if (activeButton) {
			activeButton.classList.toggle("customArchiveActiveButton");
		}
		classList.toggle("customArchiveActiveButton");
		document.getElementById(`customArchive${archive}`).classList.toggle("customArchiveActive");
	},
	archiveHandlerDelete = function(elem, key, archive, counter) {
		if (elem && key) {
			delete script.archive[archive][key];
			BdApi.saveData(script.file, "archive", script.archive);
			elem.parentNode.remove();
			document.getElementById(counter).textContent--;
		}
	},
	archiveClean = function(key, id, elem) {
		if (key !== "all") {
			script.archive[key] = Array.isArray(script.archive[key]) ? [] : {};
			if (id && key !== "url") {
				document.getElementById(`customArchive${id}`).innerHTML = "<h3 class='titleDefault-a8-ZSr buttonBrandLink-3csEAP marginReset-236NPn weightMedium-2iZe9B size16-14cGz5 height24-3XzeJx flexChild-faoVW3 defaultColor-1_ajX0 customArchiveEmpty' style='flex: 1 1 auto;'>Shits Empty Bro</h3>";
				document.getElementById(`customArchive${id}Counter`).textContent = "0";
			}
		}
		else {
			script.archive = {chan:{},filter:[],proxy:{},sadpanda:{},steam:{},url:{}};
		}
		if (elem) {
			elem.firstElementChild.textContent = "0";
		}
		BdApi.saveData(script.file, "archive", script.archive);
	},
	insertCustomMenu = function(className, tooltip) {
		const menuAnchor = document.getElementsByClassName("toolbar-1t6TWx").length ? document.getElementsByClassName("toolbar-1t6TWx")[0] : false;
		if (menuAnchor) {
			const menuIcon = menuAnchor.getElementsByClassName(className)[0];
			if (menuIcon) {
				menuIcon.remove();
			}
			menuAnchor.insertBefore(_createElement("div", {className: `${className} iconWrapper-2OrFZ1 clickable-3rdHwn orrie-relative orrie-tooltip`, innerHTML: `<div class='tooltip-2QfLtc tooltipBlack-PPG47z tooltipBottom-3ARrEK'><div class='tooltipPointer-3ZfirK'></div>${tooltip}</div>`,
				onclick() {modalHandler(archiveHandler());}
			}), menuAnchor.firstChild);
		}
	},
	textParser = function(node, name) {
		// parse messages for text conversion
		if (!script.check.textParser) {
			script.check.textParser = true;
			const messages = node.classList.contains("da-markup") ? [node] : node.querySelectorAll(".da-markup:not(.textParserProcessed)");
			log("info", `textParser - ${name}`, messages);
			for (let _m=messages.length; _m--;) {
				const elem = messages[_m];
				if (elem.firstElementChild && elem.firstElementChild.tagName == "PRE") {
					continue;
				}
				if (/&gt;|magnet:\?/.test(elem.innerHTML)) {
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
							textSplit[_t] = elem.innerText.split("\n")[_t].replace(/(magnet:\?[\w=:%&\-.;/\+]+)/g, "<a class='customIgnore' href='$1' target='_blank' rel='noreferrer'>$1</a> (Click to Open in Torrent Client)");
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
	settingsPanel = function() {
		// settings panel creation
		const settingsFragment = document.createDocumentFragment();
		for (let _s_k = Object.keys(script.settingsMenu), _s=0, _s_len=_s_k.length; _s<_s_len; _s++) {
			const setting = script.settingsMenu[_s_k[_s]];
			settingsFragment.appendChild(_createElement("div", {className: "ui-flex flex-vertical flex-justify-start flex-align-stretch flex-nowrap ui-switch-item", style: "margin-top: 0px;"}, [
				_createElement("div", {className: "ui-flex flex-horizontal flex-justify-start flex-align-stretch flex-nowrap plugin-setting-input-row", innerHTML: `<h3 class='ui-form-title h3 marginReset-236NPn ui-flex-child'>${setting[0]}</h3>`},
					_createElement("div", {className: "input-wrapper"}, settingsType(_s_k[_s], setting))
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
				_createElement("a", {href: script.url, target: "_blank", rel: "noreferrer", innerHTML: "<button type='button' class='button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeSmall-2cSMqn grow-q77ONN'>Source (GitHub)</button>"}),
				_createElement("button", {type: "button", className: "button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeSmall-2cSMqn grow-q77ONN orrie-buttonRed", textContent: `Clean Database`,
					onclick() {archiveClean("all");}
				})
			]),
			_createElement("div", {className: "orrie-centerText marginTop8-1DLZ1n", textContent: "Use the Archive Manager to tidy up the database, or clean it alltogether"}),
			_createElement("div", {className: "orrie-centerText marginTop8-1DLZ1n", textContent: "Add Orrie#1000 for support"}),
		]);
	},
	settingsType = function(key, props) {
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
	},
	settingsSave = function(key, data) {
		// save settings
		script.settings[key] = data;
		BdApi.saveData(script.file, "settings", script.settings);
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
	_createElement = function(tag, attributes, children) {
		// element creation
		const element = Object.assign(document.createElement(tag), attributes);
		if (children) {
			if (children.nodeType) {
				element.appendChild(children);
			}
			else {
				for (let _c=0, _c_len=children.length; _c<_c_len; _c++) {
					const child = children[_c];
					if (child && child.nodeType) {
						element.appendChild(child);
					}
				}
			}
		}
		return element;
	},
	request = function({name, api, method, cors, fallback, data}, handler) {
		log("info", name, "use fetch() with proxy");
		// request handler
		let headers = {
			"Accept": "application/json",
			"Content-Type": "application/json"
		};
		if (script.headers[name]) {
			headers = Object.assign(headers, script.headers[name]);
		}
		fetch(`${cors ? "https://cors-anywhere.herokuapp.com/" : ""}${api}`, {
			method,
			headers,
			body: data.apiData ? data.apiData : null
		}).then(function(resp) {
			if (resp.status >= 200 && resp.status < 300) {
				return resp.json();
			}
			else if (fallback) {
				mediaEmbedding(data);
			}
			throw new Error(`${resp.status} ${resp.statusText}: ${resp.url}`);
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
			return settingsPanel();
		}
		// start and observer
		load() {}
		start() {
			console.info(`${script.name} v${script.version} started.`);
			settingsLoad();
			BdApi.clearCSS("orrie-plugin");
			BdApi.injectCSS("orrie-plugin", script.css.shared);
			BdApi.injectCSS(script.file, script.css.script);
			insertCustomMenu("customMenuIcon", `${script.name} Archive`);
			const messages = document.getElementsByClassName("messages-3amgkR")[0];
			if (messages) {
				mediaConvert("messages", messages, "start");
				textParser(messages, "start");
			}
		}
		observer({addedNodes}) {
			if (addedNodes.length > 0 && document.getElementsByClassName("messages-3amgkR").length) {
				const node = addedNodes[0];
				if (node.nodeType == 1 && node.className) {
					//if (node.closest(".da-message")) {
					//	console.log(`observer ${node.classList[0]}`, node);
					//}
					const name = node.classList[0];
					switch(true) {
						case node.classList.contains("da-chatContent"):
						case node.classList.contains("da-chat"):
							if (!document.getElementsByClassName("customMenuIcon")[0]) {
								insertCustomMenu("customMenuIcon", `${script.name} Archive`);
							}
							/* falls through */
						case node.classList.contains("da-message"):
							mediaConvert("messages", node, name);
							mediaReplace(node);
							textParser(node, name);
							break;
						case node.classList.contains("metadataIcon-2FyCKU"):
						case node.classList.contains("iconPlay-2kgvwV"):
						case node.classList.contains("da-gifTag"):
						case node.classList.contains("gifFavoriteButton-2SKrBk"):
						case node.classList.contains("da-wrapperPaused"):
							mediaConvert("metadata", node, name);
							mediaReplace(node);
							break;
						case node.classList.contains("embedGIFV-3_ebID"):
							mediaReplace(node);
							break;
						case node.classList.contains("da-markup"):
						case node.classList.contains("da-edited"):
							textParser(node, name);
							break;
					}
				}
			}
		}
		// stop script
		stop() {
			BdApi.clearCSS(script.file);
			BdApi.clearCSS("customFilters");
			// remove media
			const remove_elements = document.querySelectorAll(".customMedia, .customMenuIcon");
			const remove_classes = document.querySelectorAll(".customIgnore, .customMediaToggled");
			for (let _e=remove_elements.length; _e--;) {
				if (remove_elements[_e]) {
					remove_elements[_e].remove();
				}
			}
			for (let _c=remove_classes.length; _c--;) {
				if (remove_classes[_c]) {
					remove_classes[_c].classList.remove("customIgnore", "customMediaToggled");
				}
			}
		}
	};
})();
