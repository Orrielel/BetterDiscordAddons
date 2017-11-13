//META{"name":"TwitchStreamPanel", "pname":"Twitch Stream Panel"}*//

/* global bdPluginStorage, BdApi, BDfunctionsDevilBro, PluginUpdates */

const TwitchStreamPanel = (function() {
	// plugin settings
	const script = {
		name: "Twitch Stream Panel",
		file: "TwitchStreamPanel",
		version: "1.2.3",
		author: "Orrie",
		desc: "Adds a toggleable panel that gives you stream statuses from Twitch",
		url: "https://github.com/Orrielel/BetterDiscordAddons/tree/master/Plugins/TwitchStreamPanel",
		raw: "https://raw.githubusercontent.com/Orrielel/BetterDiscordAddons/master/Plugins/TwitchStreamPanel/TwitchStreamPanel.plugin.js",
		discord: "https://discord.gg/YEZkpkj",
		check: {
			updating: false,
			version: false,
			timer: 0
		},
		streamAPI: "",
		streams: {},
		settings: {colors: true, state: true, update: true, freq: 300, debug: false},
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
.TwitchStreamPanel .containerDefault-1bbItS {margin-bottom: 10px;}
.TwitchStreamPanel .containerDefault-1bbItS span {cursor: pointer; color: #72767d; text-transform: uppercase; font-size: 12px; line-height: 16px; font-weight: 600; vertical-align: bottom;}
.TwitchStreamPanel .containerDefault-1bbItS .stream_collapse {display: inline-block; padding-left: 18px; position: relative;}
.TwitchStreamPanel .containerDefault-1bbItS .stream_collapse .iconDefault-xzclSQ {top: 2px;}
.TwitchStreamPanel .containerDefault-1bbItS .text-right {position: absolute; right: 20px;}
.TwitchStreamPanel .containerDefault-1bbItS .stream_collapse:hover *, .TwitchStreamPanel .containerDefault-1bbItS .text-right:hover {color: #B9BBBE;}
.TwitchStreamPanel .stream_container .channel-stream {font-size: 14px; font-weight: 500; height: 24px; overflow: hidden; text-overflow: ellipsis; position: relative; white-space: nowrap;}
.TwitchStreamPanel .stream_container .channel-stream:hover {background-color: #1E2124}
.TwitchStreamPanel .stream_container .channel-stream_child {display: inline-block; vertical-align: middle;}
.TwitchStreamPanel .stream_container .channel-stream_icon {width: 20px; height: 20px; margin: 0 8px; background-size: 20px 20px; background-repeat: no-repeat; background-position: 50% 50%;}
.TwitchStreamPanel .stream_container .channel-stream_anchor {width: 140px;}
.TwitchStreamPanel .stream_container .stream-online .channel-stream_status {color: #709900; font-weight: 700;}
.TwitchStreamPanel .stream_container .stream-offline .channel-stream_status {color: #F32323;}
.TwitchStreamPanel footer {color: #72767d; line-height: 24px; text-align: center;}
.TwitchStreamPanel footer span {margin: 0 2px;}
.TwitchStreamPanel #stream-timer::before {content: "(";}
.TwitchStreamPanel #stream-timer::after {content: ")";}
.TwitchStreamPanel.orriePluginSettings .orriePluginTable {margin: 0 0 25px;}
.TwitchStreamPanel.orriePluginSettings .orriePluginTable th {font-weight: 700;}
.TwitchStreamPanel.orriePluginSettings .orriePluginTable img {height: 20px;}
.TwitchStreamPanel.orriePluginSettings .orriePluginForm {margin: 0 0 25px;}
.TwitchStreamPanel.orriePluginSettings .stream_form button {display: table; margin: 5px auto 0;}
.TwitchStreamPanel.orriePluginSettings .orriePluginStreamlist {background-color: rgba(0, 0, 0, 0.15); border: 1px solid rgba(0, 0, 0, 0.25); border-radius: 5px; margin: 0; max-height: 300px; overflow-x: auto; padding: 15px 0;}
.TwitchStreamPanel.orriePluginSettings .orriePluginServer {margin-bottom: 10px;}
.TwitchStreamPanel.orriePluginSettings .orriePluginServer th, .TwitchStreamPanel.orriePluginSettings .orriePluginServer td {font-size: 14px; text-align: center;}
.TwitchStreamPanel.orriePluginSettings .orriePluginTable .stream_form td:first-of-type {white-space: nowrap;}
.TwitchStreamPanel.orriePluginSettings .orriePluginTable .stream_form td:last-of-type {width: 100%;}
.TwitchStreamPanel.orriePluginSettings .orriePluginTable .stream_form input {width: 100%;}
.TwitchStreamPanel .toggled {display: none;}
			`,
			shared: `
.orriePluginSettings .orriePluginHeader {border-bottom: 1px solid #3F4146; font-weight: 700; margin-bottom: 5px; padding-bottom: 2px; text-align: center;}
.orriePluginSettings .orriePluginHeader .iconDefault-xzclSQ {position: static;}
.orriePluginSettings .orriePluginTable {margin: 0;}
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
.orriePluginSettings .orriePluginFooter {border-top: 1px solid #3F4146; font-size: 12px; font-weight: 700; margin-bottom: 5px; padding-top: 5px; display: flex; justify-content: space-around;}
.orriePluginSettings .orriePluginNotice {text-align: center;}
.orriePluginSettings button {background: #3A71C1; color: #FFFFFF; border-radius: 5px;}
.orriePluginSettings button.warning {background: #F04747;}
.orriePluginSettings button a {color: #FFFFFF;}
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
		script.streams = bdPluginStorage.get(script.file, "streams");
		if (script.streams === null) {
			script.streams = {};
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
		const streamContainer = document.getElementsByClassName("TwitchStreamPanel")[0];
		if (streamContainer) {
			streamContainer.remove();
		}
		clearInterval(window.nopanStreamsInterval);
		clearInterval(window.streamUpdateCounter);
	},
	streamsInsert = function() {
		// prepare static stream list data
		const channelContainer = document.getElementsByClassName("scroller-NXV0-d")[0],
		serverID = BDfunctionsDevilBro.getIdOfServer(BDfunctionsDevilBro.getSelectedServer()),
		serverStreams = script.streams[serverID],
		streamFragment = document.createDocumentFragment(),
		streamString = [],
		colorData = script.settings.colors && BdApi.getPlugin('BetterRoleColors') ? bdPluginStorage.get("BRC", "color-data")[serverID] : false;
		for (let _s_k = Object.keys(serverStreams), _s=0; _s<_s_k.length; _s++) {
			const stream = serverStreams[_s_k[_s]];
			streamString.push(stream[1]);
			streamFragment.appendChild(_createElement("li", {className: "channel-stream stream-offline", id: `stream_${stream[1]}`, name: stream[0], innerHTML: `<div class='channel-stream_child channel-stream_icon' ${stream[3] ? `style="background-image: url(${stream[3]})"` : ""}></div><div class='channel-stream_child channel-stream_anchor'><a href='https://www.twitch.tv/${stream[1]}' rel='noreferrer' target='_blank'><span class='channel-stream_name' style='color: ${stream[2] && colorData ? colorData[stream[2]] : "#979C9F"}'>${stream[0]}</span></a></div><div class='channel-stream_child channel-stream_status'>Offline</div>`}));
		}
		// insert stream table before requesting data
		const streamContainer = _createElement("div", {className: "TwitchStreamPanel", id: `streams_${serverID}`}, [
			_createElement("div", {className: "containerDefault-1bbItS"}, [
				_createElement("div", {className: "stream_collapse", innerHTML: `<svg class='iconDefault-xzclSQ iconTransition-VhWJ85${!script.settings.state ? " closed-2Hef-I" : ""}' width='12' height='12' viewBox='0 0 24 24'><path fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M7 10L12 15 17 10'></path></svg><span>Streams</span>`,
					onclick() {
						script.settings.state = !script.settings.state;
						streamContainer.children[1].classList.toggle("toggled");
						this.firstElementChild.classList.toggle("closed-2Hef-I");
						forceScrolling(streamContainer.scrollHeight, "scroller-NXV0-d");
					}
				}),
				_createElement("span", {className: "text-right", innerHTML: "Update", onclick() {streamsUpdate("click");}})
			]),
			_createElement("ul", {className: `stream_container${!script.settings.state ? " toggled" : ""}`}, streamFragment),
			_createElement("footer", {innerHTML: `<span>Last Update:</span><span id="stream-timestamp">${new Date().toLocaleTimeString("en-GB")}</span><span id="stream-timer">00:00</span>`})
		]);
		channelContainer.appendChild(streamContainer);

		// store streams
		script.streamAPI = `https://api.twitch.tv/kraken/streams/?channel=${streamString.join(",")}`;

		// update streams and set update interval to 2mins
		streamsUpdate("initial");
		if (script.settings.update) {
			const updateFreq = !Number.isNaN(script.settings.freq) && script.settings.freq >= 120 ? script.settings.freq*1000 : 120000;
			window.streamUpdateInterval = setInterval(function() {streamsUpdate("interval");}, updateFreq);
		}
	},
	streamsUpdate = function(mode) {
		// request data from twitch api and insert into stream table
		if (!script.check.updating && (mode == "click" || mode == "initial" || script.check.timer < 30)) {
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
							BDfunctionsDevilBro.showToast(`${streamItem.name} is streaming with ${stream.viewers} viewers!`);
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
					if (streamItem.classList.contains("stream-online") && !onlineStreams.includes(streamItem.id)) {
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
	createSettingsPanel = function() {
		// better settings panel creation
		const settingsFragment = document.createDocumentFragment(),
		settingType = function(key, props) {
			switch(props[1]) {
				case "check":
					return _createElement("tr", {innerHTML: `<td><label for='id_${key}'>${props[0]}</label></td><td><input id='id_${key}' name='${key}' type='checkbox'${script.settings[key] ? " checked=checked" : ""} onchange='BdApi.getPlugin("${script.name}").settingsSave("${key}", this.checked)'/></td><td>${props[2]}</td>`});
				case "range":
					return _createElement("tr", {innerHTML: `<td><label for='id_${key}'>${props[0]}</label></td><td><input id='id_${key}' name='${key}' value='${script.settings[key]}' type='range' min='0' max='1' step='0.05' onchange='BdApi.getPlugin("${script.name}").settingsSave("${key}", this.value)'/></td><td>${props[2]}</td>`});
				case "text":
					return _createElement("tr", {innerHTML: `<td><label for='id_${key}'>${props[0]}</label></td><td><input id='id_${key}' name='${key}' value='${script.settings[key]}' type='text' onchange='BdApi.getPlugin("${script.name}").settingsSave("${key}", this.value)'/></td><td>${props[2]}</td>`});
				default:
					return "";
			}
		};
		for (let _s_k = Object.keys(script.settingsMenu), _s=0, _s_len=_s_k.length; _s<_s_len; _s++) {
			settingsFragment.appendChild(settingType(_s_k[_s], script.settingsMenu[_s_k[_s]]));
		}
		return _createElement("div", {className: `${script.file} orriePluginSettings`}, [
			_createElement("div", {className: "orriePluginTable"}, [
				_createElement("table", "", settingsFragment)
			]),
			_createElement("div", {className: "orriePluginForm orriePluginTable"}, [
					_createElement("div", {className: "orriePluginHeader", innerHTML: `<svg class='iconDefault-xzclSQ iconTransition-VhWJ85$ closed-2Hef-I' width='12' height='12' viewBox='0 0 24 24'><path fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M7 10L12 15 17 10'></path></svg><button>Add New Stream</button>`,
						onclick() {
							this.nextElementSibling.classList.toggle("toggled"); this.firstElementChild.classList.toggle("closed-2Hef-I");
						}
					}),
					_createElement("form", {className: "stream_form toggled", name: "insert_stream", innerHTML: `<table><tr><td>Discord Name</td><td><input type="text" name="discord_name" placeholder="Required -- Can be anything"></td></tr><tr><td>Twitch Username</td><td><input type="text" name="twitch_name" placeholder="Required"></td></tr><tr><td>Discord ID</td><td><input type="text" name="discord_id" placeholder="For BetterRoleColors -- Use Discord developer mode, right click the user and copy ID"></td></tr><tr><td>Icon</td><td><input type="text" name="icon" placeholder="Will be resized to 20x20"></td></tr><tr><td>Server to Hook (ID)</td><td><input type="text" name="server_id" placeholder="Required -- Use Discord developer mode, right click the server icon and copy ID"></td></tr></table><button onclick='BdApi.getPlugin("${script.name}").saveStream()'>Add to List</button>`}),
					_createElement("span", {id: "saveStreamInfo"})
			]),
			_createElement("div", {className: "orriePluginStreamlist orriePluginTable", id: "twitchStreamList"}, createSettingsServerList()),
			_createElement("div", {className: "orriePluginFooter", innerHTML: `<button><a href='${script.discord}' target='_blank' rel='noreferrer'>Support (Discord)</a></button><button><a href='${script.url}' target='_blank' rel='noreferrer'>Updates</a></button><button class='warning' onclick='BdApi.getPlugin(\"${script.name}\").cleanDB(this)'>Clean Database (Irreversible!)</button>`})
		]);
	},
	createSettingsServerList = function () {
		const serverFragment = document.createDocumentFragment(),
		servers = BDfunctionsDevilBro.readServerList();
		for (let _a=0, _a_len = servers.length; _a<_a_len; _a++) {
			const server = servers[_a];
			if (server.offsetParent) {
				const data = BDfunctionsDevilBro.getKeyInformation({"node":server, "key":"guild"}),
				streams = script.streams[data.id];
				if (streams) {
					const streamFragment = document.createDocumentFragment();
					for (let _b_k = Object.keys(streams), _b=0, _b_len = _b_k.length; _b<_b_len; _b++) {
						const streamer = streams[_b_k[_b]];
						streamFragment.appendChild(_createElement("tr", "", [
							_createElement("td", {innerHTML: streamer[0]}),
							_createElement("td", {innerHTML: streamer[1]}),
							_createElement("td", {innerHTML: streamer[2]}),
							_createElement("td", {innerHTML: `<img src='${streamer[3]}'/>`}),
							_createElement("td", "", [
								_createElement("button", {className: "warning", innerHTML: "✘",
									onclick() {
										delete script.streams[data.id][streamer[1]];
										this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
										bdPluginStorage.set(script.file, "streams", script.streams);
									}
								})
							])
						]));
					}
					serverFragment.appendChild(_createElement("div", {className: "orriePluginServer"}, [
						_createElement("div", {className: "orriePluginHeader", innerHTML: `${data.name} -- ${data.id}`}),
						_createElement("table", {innerHTML: "<thead><th>Discord Name</th><th>Twitch Username</th><th>Discord ID</th><th>Icon</th><th>Remove</th></thead>"}, streamFragment)
					]));
				}
			}
		}
		return serverFragment;
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
			if (children.childElementCount) {
				element.appendChild(children);
			}
			else {
				for (let _c=0, _c_len=children.length; _c<_c_len; _c++) {
					element.appendChild(children[_c]);
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
			return createSettingsPanel();
		}
		// save settings
		settingsSave(key, value) {
			script.settings[key] = value;
			bdPluginStorage.set(script.file, "settings", script.settings);
			log("info", "Settings Saved", [key, value]);
		}
		// save stream
		saveStream() {
			const inputs = document.forms.insert_stream.getElementsByTagName("input"),
			streamStatus = document.getElementById("saveStreamInfo"),
			data = [];
			for (let _i=0, _i_len = inputs.length; _i<_i_len; _i++) {
				data.push(inputs[_i].value);
			}
			if (data[0] && data[1] && data[4]) {
				if (BDfunctionsDevilBro.getDivOfServer(data[4])) {
					if (!script.streams[data[4]]) {
						script.streams[data[4]] = {};
					}
					script.streams[data[4]][data[1]] = data.splice(0,4);
					const twitchStreamList = document.getElementById("twitchStreamList");
					twitchStreamList.innerHTML = "";
					twitchStreamList.appendChild(createSettingsServerList());
					bdPluginStorage.set(script.file, "streams", script.streams);
				}
				else {
					streamStatus.textContent = "Server doesn't exist in your serverlist";
				}
			}
			else {
				streamStatus.textContent = "Missing required data (*)";
			}
		}
		// clean database
		cleanDB(elem) {
			script.streams = {};
			bdPluginStorage.set(script.file, "streams", {});
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
			if (typeof BDfunctionsDevilBro !== "object") {
				document.head.appendChild(_createElement("script", {type: "text/javascript", src: "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"}));
			}
			if (typeof BDfunctionsDevilBro === "object") {
				PluginUpdates.plugins[script.raw] = {name:script.name, raw:script.raw, version:script.version};
				BDfunctionsDevilBro.checkUpdate(script.name, script.raw);
				BDfunctionsDevilBro.showToast(`${script.name} ${script.version} has started.`);
				const serverID = BDfunctionsDevilBro.getIdOfServer(BDfunctionsDevilBro.getSelectedServer());
				if (script.streams[serverID] && document.getElementsByClassName("scroller-NXV0-d")[0]) {
					streamsInsert();
				}
			}
			else {
				log("error", "BDfunctionsDevilBro not loaded?");
			}
		}
		observer({addedNodes, target}) {
			if (addedNodes.length > 0 && target.className == "flex-spacer flex-vertical" && BDfunctionsDevilBro && document.getElementsByClassName("messages")) {
				const serverID = BDfunctionsDevilBro.getIdOfServer(BDfunctionsDevilBro.getSelectedServer());
				if (script.streams[serverID]) {
					if (!document.getElementById(`streams_${serverID}`)) {
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
