//META{"name":"StreamPanel", "pname":"Twitch Stream Panel"}*//

/* global bdPluginStorage, BdApi, PluginUtilities */

const StreamPanel = (function(){
	// plugin settings
	const script = {
		name: "Twitch Stream Panel",
		file: "StreamPanel",
		version: "1.2.1",
		author: "Orrie",
		desc: "Adds a toggleable panel that gives you stream statuses from Twitch",
		url: "https://github.com/Orrielel/BetterDiscordAddons/tree/master/Plugins/StreamPanel",
		raw: "https://raw.githubusercontent.com/Orrielel/BetterDiscordAddons/master/Plugins/StreamPanel/StreamPanel.plugin.js",
		discord: "https://discord.gg/YEZkpkj",
		check: {
			updating: false,
			version: false,
			timer: 0
		},
		streamAPI: "",
		streams: {
			/*  name       - localized name in the table (required)
				twitch_id  - twitch username (required)
				discord_id - (required)
				icon_id    - clan tag (can be blank) */
			"356792687585787924": [
				["Orrie",     "orrie_",     "140850226696159232", "https://eu.wargaming.net/clans/media/clans/emblems/cl_066/500136066/emblem_32x32.png"],
				["Shroud",    "shroud",     "",                   "https://static-cdn.jtvnw.net/jtv_user_pictures/shroud-profile_image-850e059aee3d6bfa-70x70.jpeg"]
			],
			"220922618272808962": [
				// name       twitch_id     discord_id            icon_id
				["Full_marx", "fullmarx",   "207634390870654976", "https://eu.wargaming.net/clans/media/clans/emblems/cl_066/500136066/emblem_32x32.png"],
				["goatti",    "g0atti",     "155356032078577664", "https://eu.wargaming.net/clans/media/clans/emblems/cl_585/500003585/emblem_32x32.png"],
				["Hatbuster", "hatbuster",  "108127619274317824", "https://eu.wargaming.net/clans/media/clans/emblems/cl_066/500136066/emblem_32x32.png"],
				["Meyhoff",   "mmeyhoff",   "165531501755105281", "https://eu.wargaming.net/clans/media/clans/emblems/cl_066/500136066/emblem_32x32.png"],
				["Orrie",     "orrie_",     "140850226696159232", "https://eu.wargaming.net/clans/media/clans/emblems/cl_066/500136066/emblem_32x32.png"],
				["prassel",   "prassel",    "172353609269248000", "https://eu.wargaming.net/clans/media/clans/emblems/cl_066/500136066/emblem_32x32.png"],
				["Smaha",     "smahams",    "227540017633951744", "https://eu.wargaming.net/clans/media/clans/emblems/cl_066/500136066/emblem_32x32.png"],
				["steegel25", "steegel25",  "171667940201070593", "https://eu.wargaming.net/clans/media/clans/emblems/cl_066/500136066/emblem_32x32.png"],
				["Vehjetys",  "pizzamyway", "156929947393327115", "https://eu.wargaming.net/clans/media/clans/emblems/cl_066/500136066/emblem_32x32.png"]
			]
		},
		settings: {colors: true, state: true, update: true, freq: 120, debug: false},
		settingsMenu: {
			//       localized         type     description
			colors: ["Colorize Names", "check", "Uses <a href='https://github.com/rauenzi/BetterDiscordAddons/tree/master/Plugins/BetterRoleColors' target='_blank'>BetterRoleColors</a> to colorize names"],
			state:  ["Visibility",     "check", "Display streamlist at startup, or hide it"],
			update: ["Auto Update",    "check", "Updates the streamlist every other minute"],
			freq:   ["Frequency",      "text",  "Time between updating, in seconds (Minimum 120 secs)"],
			debug:  ["Debug",          "check", "Displays verbose stuff into the console"]
		},
		css: {
			script: `
.streamPanel .containerDefault-1bbItS {margin-bottom: 10px;}
.streamPanel .containerDefault-1bbItS span {cursor: pointer; color: #72767d; text-transform: uppercase; font-size: 12px; line-height: 16px; font-weight: 600; vertical-align: bottom;}
.streamPanel .containerDefault-1bbItS .stream_collapse {display: inline-block; padding-left: 18px; position: relative;}
.streamPanel .containerDefault-1bbItS .stream_collapse .iconDefault-xzclSQ {top: 2px;}
.streamPanel .containerDefault-1bbItS .text-right {position: absolute; right: 20px;}
.streamPanel .containerDefault-1bbItS .stream_collapse:hover *, .streamPanel .containerDefault-1bbItS .text-right:hover {color: #B9BBBE;}
.streamPanel .stream_container .channel-stream {font-size: 14px; font-weight: 500; height: 24px; overflow: hidden; text-overflow: ellipsis; position: relative; white-space: nowrap;}
.streamPanel .stream_container .channel-stream:hover {background-color: #1E2124}
.streamPanel .stream_container .channel-stream_child {display: inline-block; vertical-align: middle;}
.streamPanel .stream_container .channel-stream_icon {width: 20px; height: 20px; margin: 0 8px; background-size: 20px 20px; background-repeat: no-repeat; background-position: 50% 50%;}
.streamPanel .stream_container .channel-stream_anchor {width: 140px;}
.streamPanel .stream_container .stream-online .channel-stream_status {color: #709900; font-weight: 700;}
.streamPanel .stream_container .stream-offline .channel-stream_status {color: #F32323;}
.streamPanel .stream_container.toggled {display: none;}
.streamPanel footer {color: #72767d; line-height: 24px; text-align: center;}
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
		}
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
	streamTimer = function(length) {
		const display = document.getElementById("stream-timer");
		if (display) {
			let min, sec;
			script.check.timer = length;
			window.streamUpdateCounter = setInterval(function () {
				min = parseInt(script.check.timer / 60, 10);
				sec = parseInt(script.check.timer % 60, 10);
				sec = sec < 10 ? `0${sec}` : sec;
				display.textContent = `${min}:${sec}`;
				if (--script.check.timer < 0) {
					script.check.timer = length;
				}
			}, 1000);
		}
		else {
			log("error", "streamTimer");
		}
	},
	streamsRemove = function() {
		// remove streams
		const streamContainer = document.getElementsByClassName("streamPanel")[0];
		if (streamContainer) {
			streamContainer.remove();
		}
		clearInterval(window.nopanStreamsInterval);
		clearInterval(window.streamUpdateCounter);
	},
	streamsInsert = function() {
		// insert stream table before requesting data
		const channelContainer = document.getElementsByClassName("scroller-NXV0-d")[0],
		serverID = PluginUtilities.getCurrentServer(),
		serverStreams = script.streams[serverID],
		streamContainer = _createElement("div", "streamPanel", `<div class='containerDefault-1bbItS'><div class='stream_collapse'><svg class='iconDefault-xzclSQ iconTransition-VhWJ85${!script.settings.state ? " closed-2Hef-I" : ""}' width='12' height='12' viewBox='0 0 24 24'><path fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M7 10L12 15 17 10'></path></svg><span>Streams</span></div><span class='text-right'>Update</span></div><ul class='stream_container${!script.settings.state ? " toggled" : ""}'></ul><footer><span>Last Update: </span><span id='stream-timestamp'>${new Date().toLocaleTimeString("en-GB")}</span> (<span id='stream-timer'>00:00</span>)</footer>`, {id: `stream_${serverID}`}),
		streamString = [],
		colorData = script.settings.colors && BdApi.getPlugin('BetterRoleColors') ? bdPluginStorage.get("BRC", "color-data")[serverID] : false;
		for (let _s=0; _s<serverStreams.length; _s++) {
			const stream = serverStreams[_s],
			streamItem = _createElement("li", "channel-stream stream-offline", `<div class='channel-stream_child channel-stream_icon' ${stream[3] ? `style="background-image: url(${stream[3]})"` : ""}></div><div class='channel-stream_child channel-stream_anchor'><a href='https://www.twitch.tv/${stream[1]}' rel='noreferrer' target='_blank'><span class='channel-stream_name' style='color: ${stream[2] && colorData ? colorData[stream[2]] : "#979C9F"}'>${stream[0]}</span></a></div><div class='channel-stream_child channel-stream_status'>Offline</div>`, {id: `stream_${stream[1]}`, name: stream[0]});
			streamString.push(stream[1]);
			streamContainer.children[1].appendChild(streamItem);
		}
		channelContainer.appendChild(streamContainer);

		// store streams
		script.streamAPI = `https://api.twitch.tv/kraken/streams/?channel=${streamString.join(",")}`;

		// add collapse listener
		streamContainer.firstElementChild.firstElementChild.addEventListener("click", function() {
			script.settings.state = !script.settings.state;
			streamContainer.children[1].classList.toggle("toggled");
			this.firstElementChild.classList.toggle("closed-2Hef-I");
			forceScrolling(streamContainer.scrollHeight, "scroller-NXV0-d");
		}, false);

		// update streams and set update interval to 2mins
		streamsUpdate("initial");
		if (script.settings.update) {
			const updateFreq = !Number.isNaN(script.settings.freq) && script.settings.freq >= 120 ? script.settings.freq*1000 : 120000;
			window.streamUpdateInterval = setInterval(function() {streamsUpdater();}, updateFreq);
		}
		streamContainer.firstElementChild.lastElementChild.addEventListener("click", function() {
			streamsUpdate("click");
		}, false);
	},
	streamsUpdate = function(mode) {
		// request data from twitch api and insert into stream table
		if (!script.check.updating && (mode == "click" || script.check.timer < 30)) {
			script.check.updating = true;
			fetch(script.streamAPI, {
				method: "GET",
				headers: {
					"Client-ID": "fbs3puqef627klk0wf9jrgjach2h3y9"
				}
			}).then(function(resp) {
				if (resp.status >= 200 && resp.status < 300) {
					return resp.json();
				}
				throw new Error(resp.statusText);
			}).then(function(data) {
				log("info", "streamsUpdate", [mode, data]);
				const streamItems = document.getElementsByClassName("channel-stream"),
				streamStamp = document.getElementById("stream-timestamp"),
				onlineStreams = [];
				for (let _o=0; _o<data.streams.length; _o++) {
					const stream = data.streams[_o],
					streamName = `stream_${stream.channel.name}`,
					streamItem = document.getElementById(streamName);
					if (streamItem) {
						if (streamItem.classList.contains("stream-offline")) {
							streamItem.classList.remove("stream-offline");
							streamItem.classList.add("stream-online");
							PluginUtilities.showToast(`${streamItem.name} is streaming with ${stream.viewers} viewers!`);
						}
						streamItem.title = stream.game;
						streamItem.lastElementChild.innerHTML = stream.viewers;
						onlineStreams.push(streamName);
					}
					else {
						log("error", "streamItem doesn't exist -- Discord inactive?", [stream.channel.name, stream]);
					}
				}
				for (let _s=0; _s<streamItems.length; _s++) {
					const streamItem = streamItems[_s];
					if (streamItem.classList.contains("stream-online") && onlineStreams.indexOf(streamItem.id) == -1) {
						streamItem.classList.add("stream-offline");
						streamItem.classList.remove("stream-online");
						delete streamItem.title;
						streamItem.lastElementChild.innerHTML = "Offline";
					}
				}
				if (streamStamp) {
					streamStamp.innerHTML = new Date().toLocaleTimeString("en-GB");
				}
				script.check.updating = false;
			});
			if (script.settings.update) {
				clearInterval(window.streamUpdateCounter);
				streamTimer(script.settings.freq);
			}
			else {
				clearInterval(window.streamUpdateInterval);
			}
		}
	},
	streamsUpdater = function() {
		// interval updater
		streamsUpdate("interval");
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
			for (let _e in extra) {
				if (extra.hasOwnProperty(_e)) {
					element[_e] = extra[_e];
				}
			}
		}
		return element;
	};
	// return class construction
	return class {
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
		return `<div class='${script.file} orriePluginSettings'><div class='orriePluginHeader'><span class='bda-name'>${script.name} v${script.version} by ${script.author}</span></div><div class='orriePluginTable'><table>${settingsOptions}</table></div><div class='orriePluginFooter'><button><a href='${script.discord}' target='_blank' rel='noreferrer'>Support (Discord)</a></button><button><a href='${script.url}' target='_blank' rel='noreferrer'>Updates</a></button></div></div>`;
		}
		// save settings
		settingsSave(key, value) {
			script.settings[key] = value;
			bdPluginStorage.set(script.file, "settings", script.settings);
			log("info", "Settings Saved", [key, value]);
		}
		// load, start and observer
		load() {
			console.info(`${script.name} v${script.version} loaded.`);
			BdApi.clearCSS("orriePluginSettings");
			BdApi.injectCSS("orriePluginSettings", script.css.shared);
		}
		start() {
			settingsLoad();
			BdApi.injectCSS(script.file, script.css.script);
			var libraryScript = document.getElementById('zeresLibraryScript');
			if (!libraryScript) {
				libraryScript = _createElement("script", "", "", {id: "zeresLibraryScript", type: "text/javascript", src: "https://rauenzi.github.io/BetterDiscordAddons/Plugins/PluginLibrary.js"});
				document.head.appendChild(libraryScript);
			}
			if (typeof window.ZeresLibrary !== "undefined") {
				PluginUtilities.checkForUpdate(script.name, script.version, script.raw);
				PluginUtilities.showToast(`${script.name} ${script.version} has started.`);
				const serverID = PluginUtilities.getCurrentServer();
				if (script.streams[serverID] && document.getElementsByClassName("scroller-NXV0-d")[0]) {
					streamsInsert();
				}
			}
			else {
				libraryScript.addEventListener("load", function() {
					PluginUtilities.checkForUpdate(script.name, script.version, script.raw);
					PluginUtilities.showToast(`${script.name} ${script.version} has started.`);
					const serverID = PluginUtilities.getCurrentServer();
					if (script.streams[serverID] && document.getElementsByClassName("scroller-NXV0-d")[0]) {
						streamsInsert();
					}
				});
			}
		}
		observer(mutation) {
			if (mutation.addedNodes.length > 0 && mutation.target.className == "flex-spacer flex-vertical" && window.PluginUtilities && document.getElementsByClassName("messages")) {
				const serverID = PluginUtilities.getCurrentServer();
				if (script.streams[serverID]) {
					if (!document.getElementById(`stream_${serverID}`)) {
						streamsRemove();
						streamsInsert();
					}
				}
				else {
					streamsRemove();
				}
			}
		}
		// stop script
		stop() {
			BdApi.clearCSS(script.file);
			streamsRemove();
		}
	};
})();
.streamPanel .containerDefault-1bbItS {margin-bottom: 10px;}
.streamPanel .containerDefault-1bbItS span {cursor: pointer; color: #72767d; text-transform: uppercase; font-size: 12px; line-height: 16px; font-weight: 600; vertical-align: bottom;}
.streamPanel .containerDefault-1bbItS .stream_collapse {display: inline-block; padding-left: 18px; position: relative;}
.streamPanel .containerDefault-1bbItS .stream_collapse .iconDefault-xzclSQ {top: 2px;}
.streamPanel .containerDefault-1bbItS .text-right {position: absolute; right: 20px;}
.streamPanel .containerDefault-1bbItS .stream_collapse:hover *, .streamPanel .containerDefault-1bbItS .text-right:hover {color: #B9BBBE;}
.streamPanel .stream_container .channel-stream {font-size: 14px; font-weight: 500; height: 24px; overflow: hidden; text-overflow: ellipsis; position: relative; white-space: nowrap;}
.streamPanel .stream_container .channel-stream:hover {background-color: #1E2124}
.streamPanel .stream_container .channel-stream_child {display: inline-block; vertical-align: middle;}
.streamPanel .stream_container .channel-stream_icon {width: 20px; height: 20px; margin: 0 8px; background-size: 20px 20px; background-repeat: no-repeat; background-position: 50% 50%;}
.streamPanel .stream_container .channel-stream_anchor {width: 140px;}
.streamPanel .stream_container .stream-online .channel-stream_status {color: #709900; font-weight: 700;}
.streamPanel .stream_container .stream-offline .channel-stream_status {color: #F32323;}
.streamPanel .stream_container.toggled {display: none;}
.streamPanel footer {color: #72767d; line-height: 24px; text-align: center;}
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
		}
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
	streamTimer = function(length) {
		const display = document.getElementById("stream-timer");
		if (display) {
			let min, sec;
			script.check.timer = length;
			window.streamUpdateCounter = setInterval(function () {
				min = parseInt(script.check.timer / 60, 10);
				sec = parseInt(script.check.timer % 60, 10);
				sec = sec < 10 ? `0${sec}` : sec;
				display.textContent = `${min}:${sec}`;
				if (--script.check.timer < 0) {
					script.check.timer = length;
				}
			}, 1000);
		}
		else {
			log("error", "streamTimer");
		}
	},
	streamsRemove = function() {
		// remove streams
		const streamContainer = document.getElementsByClassName("streamPanel")[0];
		if (streamContainer) {
			streamContainer.remove();
		}
		clearInterval(window.nopanStreamsInterval);
		clearInterval(window.streamUpdateCounter);
	},
	streamsInsert = function() {
		// insert stream table before requesting data
		const channelContainer = document.getElementsByClassName("scroller-NXV0-d")[0],
		serverID = PluginUtilities.getCurrentServer(),
		serverStreams = script.streams[serverID],
		streamContainer = _createElement("div", "streamPanel", `<div class='containerDefault-1bbItS'><div class='stream_collapse'><svg class='iconDefault-xzclSQ iconTransition-VhWJ85${!script.settings.state ? " closed-2Hef-I" : ""}' width='12' height='12' viewBox='0 0 24 24'><path fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M7 10L12 15 17 10'></path></svg><span>Streams</span></div><span class='text-right'>Update</span></div><ul class='stream_container${!script.settings.state ? " toggled" : ""}'></ul><footer><span>Last Update: </span><span id='stream-timestamp'>${new Date().toLocaleTimeString("en-GB")}</span> (<span id='stream-timer'>00:00</span>)</footer>`, {id: `stream_${serverID}`}),
		streamString = [],
		colorData = script.settings.colors && BdApi.getPlugin('BetterRoleColors') ? bdPluginStorage.get("BRC", "color-data")[serverID] : false;
		for (let _s=0; _s<serverStreams.length; _s++) {
			const stream = serverStreams[_s],
			streamItem = _createElement("li", "channel-stream stream-offline", `<div class='channel-stream_child channel-stream_icon' ${stream[3] ? `style="background-image: url(${stream[3]})"` : ""}></div><div class='channel-stream_child channel-stream_anchor'><a href='https://www.twitch.tv/${stream[1]}' rel='noreferrer' target='_blank'><span class='channel-stream_name' style='color: ${stream[2] && colorData ? colorData[stream[2]] : "#979C9F"}'>${stream[0]}</span></a></div><div class='channel-stream_child channel-stream_status'>Offline</div>`, {id: `stream_${stream[1]}`, name: stream[0]});
			streamString.push(stream[1]);
			streamContainer.children[1].appendChild(streamItem);
		}
		channelContainer.appendChild(streamContainer);

		// store streams
		script.streamAPI = `https://api.twitch.tv/kraken/streams/?channel=${streamString.join(",")}`;

		// add collapse listener
		streamContainer.firstElementChild.firstElementChild.addEventListener("click", function() {
			script.settings.state = !script.settings.state;
			streamContainer.children[1].classList.toggle("toggled");
			this.firstElementChild.classList.toggle("closed-2Hef-I");
			forceScrolling(streamContainer.scrollHeight, "scroller-NXV0-d");
		}, false);

		// update streams and set update interval to 2mins
		streamsUpdate("initial");
		if (script.settings.update) {
			const updateFreq = !Number.isNaN(script.settings.freq) && script.settings.freq >= 120 ? script.settings.freq*1000 : 120000;
			window.streamUpdateInterval = setInterval(function() {streamsUpdater();}, updateFreq);
		}
		streamContainer.firstElementChild.lastElementChild.addEventListener("click", function() {
			streamsUpdate("click");
		}, false);
	},
	streamsUpdate = function(mode) {
		// request data from twitch api and insert into stream table
		if (!script.check.updating && (mode == "click" || script.check.timer < 30)) {
			script.check.updating = true;
			fetch(script.streamAPI, {
				method: "GET",
				headers: {
					"Client-ID": "fbs3puqef627klk0wf9jrgjach2h3y9"
				}
			}).then(function(resp) {
				if (resp.status >= 200 && resp.status < 300) {
					return resp.json();
				}
				throw new Error(resp.statusText);
			}).then(function(data) {
				log("info", "streamsUpdate", [mode, data]);
				const streamItems = document.getElementsByClassName("channel-stream"),
				streamStamp = document.getElementById("stream-timestamp"),
				onlineStreams = [];
				for (let _o=0; _o<data.streams.length; _o++) {
					const stream = data.streams[_o],
					streamName = `stream_${stream.channel.name}`,
					streamItem = document.getElementById(streamName);
					if (streamItem) {
						if (streamItem.classList.contains("stream-offline")) {
							streamItem.classList.remove("stream-offline");
							streamItem.classList.add("stream-online");
							PluginUtilities.showToast(`${streamItem.name} is streaming with ${stream.viewers} viewers!`);
						}
						streamItem.title = stream.game;
						streamItem.lastElementChild.innerHTML = stream.viewers;
						onlineStreams.push(streamName);
					}
					else {
						log("error", "streamItem doesn't exist -- Discord inactive?", [stream.channel.name, stream]);
					}
				}
				for (let _s=0; _s<streamItems.length; _s++) {
					const streamItem = streamItems[_s];
					if (streamItem.classList.contains("stream-online") && onlineStreams.indexOf(streamItem.id) == -1) {
						streamItem.classList.add("stream-offline");
						streamItem.classList.remove("stream-online");
						delete streamItem.title;
						streamItem.lastElementChild.innerHTML = "Offline";
					}
				}
				if (streamStamp) {
					streamStamp.innerHTML = new Date().toLocaleTimeString("en-GB");
				}
				script.check.updating = false;
			});
			if (script.settings.update) {
				clearInterval(window.streamUpdateCounter);
				streamTimer(script.settings.freq);
			}
			else {
				clearInterval(window.streamUpdateInterval);
			}
		}
	},
	streamsUpdater = function() {
		// interval updater
		streamsUpdate("interval");
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
			for (let _e in extra) {
				if (extra.hasOwnProperty(_e)) {
					element[_e] = extra[_e];
				}
			}
		}
		return element;
	};
	// return class construction
	return class {
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
		return `<div class='${script.file} orriePluginSettings'><div class='orriePluginHeader'><span class='bda-name'>${script.name} v${script.version} by ${script.author}</span></div><div class='orriePluginTable'><table>${settingsOptions}</table></div><div class='orriePluginFooter'><button><a href='${script.discord}' target='_blank' rel='noreferrer'>Support (Discord)</a></button><button><a href='${script.url}' target='_blank' rel='noreferrer'>Updates</a></button></div></div>`;
		}
		// save settings
		settingsSave(key, value) {
			script.settings[key] = value;
			bdPluginStorage.set(script.file, "settings", script.settings);
			log("info", "Settings Saved", [key, value]);
		}
		// load, start and observer
		load() {
			console.info(`${script.name} v${script.version} loaded.`);
			BdApi.clearCSS("orriePluginSettings");
			BdApi.injectCSS("orriePluginSettings", script.css.shared);
		}
		start() {
			settingsLoad();
			BdApi.injectCSS(script.file, script.css.script);
			var libraryScript = document.getElementById('zeresLibraryScript');
			if (!libraryScript) {
				libraryScript = _createElement("script", "", "", {id: "zeresLibraryScript", type: "text/javascript", src: "https://rauenzi.github.io/BetterDiscordAddons/Plugins/PluginLibrary.js"});
				document.head.appendChild(libraryScript);
			}
			if (typeof window.ZeresLibrary !== "undefined") {
				PluginUtilities.checkForUpdate(script.name, script.version, script.raw);
				PluginUtilities.showToast(`${script.name} ${script.version} has started.`);
				const serverID = PluginUtilities.getCurrentServer();
				if (script.streams[serverID] && document.getElementsByClassName("scroller-NXV0-d")[0]) {
					streamsInsert();
				}
			}
			else {
				libraryScript.addEventListener("load", function() {
					PluginUtilities.checkForUpdate(script.name, script.version, script.raw);
					PluginUtilities.showToast(`${script.name} ${script.version} has started.`);
					const serverID = PluginUtilities.getCurrentServer();
					if (script.streams[serverID] && document.getElementsByClassName("scroller-NXV0-d")[0]) {
						streamsInsert();
					}
				});
			}
		}
		observer(mutation) {
			if (mutation.addedNodes.length > 0 && mutation.target.className == "flex-spacer flex-vertical" && window.PluginUtilities && document.getElementsByClassName("messages")) {
				const serverID = PluginUtilities.getCurrentServer();
				if (script.streams[serverID]) {
					if (!document.getElementById(`stream_${serverID}`)) {
						streamsRemove();
						streamsInsert();
					}
				}
				else {
					streamsRemove();
				}
			}
		}
		// stop script
		stop() {
			BdApi.clearCSS(script.file);
			streamsRemove();
		}
	};
})();
