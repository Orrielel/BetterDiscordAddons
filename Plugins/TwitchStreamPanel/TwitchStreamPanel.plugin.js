//META{"name":"TwitchStreamPanel", "pname":"Twitch Stream Panel"}*//

/* global bdPluginStorage, BdApi, BDfunctionsDevilBro */

const TwitchStreamPanel = (function() {
	// plugin settings
	const script = {
		name: "Twitch Stream Panel",
		file: "TwitchStreamPanel",
		version: "1.6.3",
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
		streamAPI: false,
		streams: {},
		streamsCache: {},
		streamFreq: 120000,
		streamsActive: false,
		settings: {colors: true, state: true, pos: false, update: true, freq: 300, debug: false},
		settingsMenu: {
			//       localized         type     description
			colors: ["Colorize Names", "check", "Adds custom color for names, either self defined, or through <a href='https://github.com/rauenzi/BetterDiscordAddons/tree/master/Plugins/BetterRoleColors' target='_blank'>BetterRoleColors</a> if installed"],
			state:  ["Visibility",     "check", "Display streamlist at startup, or hide it (Hiding the list directly also changes this)"],
			pos:    ["Position",       "check", "Place panel above or below text/voice channels (Above if activated)"],
			update: ["Auto Update",    "check", "Update the streamlist depending on frequency setting"],
			freq:   ["Frequency",      "text",  "Time between updating, in seconds &#8213; Minimum 120 secs"],
			debug:  ["Debug",          "check", "Displays verbose stuff into the console"]
		},
		css: {
			script: `
.TwitchStreamPanel .tsp-streams_button {box-sizing: border-box; display: inline-block; margin-right: 0; padding-right: 0; width: 100%;}
.TwitchStreamPanel .tsp-update_button {display: inline-block; padding-left: 0; width: auto;}
.TwitchStreamPanel .nameDefault-Lnjrwm:hover {color: #B9BBBE;}
.TwitchStreamPanel .nameDefault-Lnjrwm:hover svg {color: #B9BBBE;}
.TwitchStreamPanel .content-2mSKOj {display: table; margin: 0; padding: 1px 0px 1px 16px; width: 100%;}
.TwitchStreamPanel .tsp-stream_row {font-weight: 500; line-height: 24px;}
.TwitchStreamPanel .tsp-stream_row:hover {background-color: rgba(0,0,0,0.2);}
.TwitchStreamPanel .tsp-stream_row_child {vertical-align: middle;}
.TwitchStreamPanel .tsp-stream_row_icon {background-size: 20px 20px; background-repeat: no-repeat; background-position: center left; height: 20px; padding-right: 8px; width: 20px;}
.TwitchStreamPanel .tsp-stream_row_anchor {max-width: 140px;}
.TwitchStreamPanel .tsp-stream_row_anchor a {color: #979C9F;}
.TwitchStreamPanel .tsp-stream_row_status {text-align: right; width: 40px;}
.TwitchStreamPanel .tsp-stream_online .tsp-stream_row_status {color: #709900; font-weight: 700; padding-right: 12px;}
.TwitchStreamPanel .tsp-stream_offline .tsp-stream_row_status {background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAqUExURQAAAPBGRvBGRu9GRu9GRvBGRvBFRfBHR/w+Pu9GRvBGRvBHR/BGRvBGRuDveooAAAANdFJOUwBv5ieBS/c2ClvMmqunDzf6AAAAk0lEQVQoz22R2xbAEAwEk7gE7f7/71ZVCYfHGWethGg77k470sYFZTMMbhzi1vsA+MCJfDWxczfTkjbTucx3rhia8V8B3J2HGvMZXgokwTDeFuA3/je2WIE1cXAHLIZpPn02GbvROY7FjCyxRknHAE0WrmQH7n8swS6i1sgtrXBa+VtDc3Dr4mC/tIkDb+bIqznyB/ANCkV2LxT1AAAAAElFTkSuQmCC") no-repeat right 10px center; background-size: 14px; opacity: 0.75;}
.TwitchStreamPanel .tsp-footer_wrapper {border-bottom: none; box-shadow: none;}
.TwitchStreamPanel .tsp-time_text {padding-left: 0; display: inline-block; width: auto;}
.TwitchStreamPanel .tsp-time_text span {margin: 0 2px;}
.TwitchStreamPanel #tsp-timer::before {content: "(";}
.TwitchStreamPanel #tsp-timer::after {content: ")";}
.TwitchStreamPanel .tsp-edit_button {display: inline-block; float: right; padding-left: 0; width: auto;}
.tsp-menuIcon {background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAABN0lEQVR4AWMAgST7hUdTHJf+Jxs7Le1mSLKao57suOQfSCDBdt7KBLt584nF8XZzV8ANSrRb2AwzOdCsQ4aBBOBuVCUJNyjFYckmmhsE9KpTisPS6P8M/xlB/DT7pRop9ksSom1nSJJkUKL9/E1Ag77U2+9nAfFTHZZmgdRFWk52HzUIApLsFvglOy3NqWeoZwIb7LhIH5jmCmOtZ8pRMfr/MyY5LG4D6Ut2INMgUHJIdlzUCjFk8aNEm7lKKAaFmvfYeJvUK4Gwj3GRCEiTh8pEdhAfGUNdgjAECOAGoWNgPloQ47qIG5ih96LLwQyJc1ygDDKDgEHzVic6LNqHLo7uEkQ2sFtQlWg3fwMc2y+4BFX8D6YRKLYXJp9gv2AN2CWEQIzN7Dxk24Ga2xjIAbE2s3LJMQQAZ9SV6n4xp1sAAAAASUVORK5CYII=) no-repeat center; opacity: 0.6;}
.tsp-menuIcon:hover {opacity: 1;}
.orriePluginModal .tsp-menu .content-2mSKOj {height: auto;}
.orriePluginModal .tsp-content svg {top: 0; left: 0;}
.orriePluginModal .tsp-content .cardPrimary-ZVL9Jr {border-radius: 5px; display: table; width: 100%;}
.orriePluginModal .tsp-content .cardPrimary-ZVL9Jr img {height: 20px; vertical-align: text-bottom;}
.orriePluginModal .input::-webkit-input-placeholder {font-size: 12px; color: rgba(255, 255, 255, 0.5) !important;}
.orriePluginModal #tsp-stream_status {height: 24px; padding: 8px;}
.orriePluginModal .tsp-stream_close svg {margin-top: 0; margin-right: 0 !important;}
.orriePluginModal .tsp-stream_server {margin: 10px 0;}
.orriePluginModal .tsp-stream_server td {line-height: 26px;}
.orriePluginModal .tsp-stream_server tr:hover td {background-color: rgba(0,0,0,0.2);}
.orriePluginModal .tsp-stream_server button {border-radius: 5px; color: #FFFFFF; padding: 1px 6px;}
.orriePluginModal #tsp-stream_input .buttonGreyGhost-SfY7zU:hover {background-color: rgba(116, 127, 141, 0.20);}
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
.orrie-tooltip_bottom {top: 135%; left: 50%; transform: translateX(-50%);}
.orrie-tooltip_right {left: 135%; top: 50%; transform: translateY(-50%);}
.orrie-tooltip_left {right: 135%; top: 50%; transform: translateY(-50%);}
.orrie-tooltip_text::after {border-color: transparent; border-style: solid; border-width: 5px; content: ""; position: absolute;}
.orrie-tooltip_top::after {border-top-color: #3A71C1; left: 50%; margin-left: -5px; top: 100%;}
.orrie-tooltip_bottom::after {border-bottom-color: #3A71C1; bottom: 100%; left: 50%; margin-left: -5px;}
.orrie-tooltip_right::after {border-right-color: #3A71C1; margin-top: -5px; right: 100%; top: 50%;}
.orrie-tooltip_left::after {border-left-color: #3A71C1; left: 100%; margin-top: -5px; top: 50%;}
.orrie-tooltip_text:hover {opacity: 0 !important; visibility: hidden !important;}
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
		script.streams = bdPluginStorage.get(script.file, "streams") || {};
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
			case "text":
				break;
			default:
				break;
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
	modalHandler = function(modalContent) {
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
	streamTimer = function(length) {
		const display = document.getElementById("tsp-timer");
		if (display) {
			let min, sec;
			script.check.timer = length;
			window.streamUpdateCounter = setInterval(function() {
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
		script.streamsActive = false;
		clearTimeout(window.nopanStreamsInterval);
		clearInterval(window.streamUpdateCounter);
	},
	streamsInsert = function() {
		// prepare static stream list data
		const channelContainer = document.getElementsByClassName("scroller-NXV0-d")[0],
		serverID = BDfunctionsDevilBro.getSelectedServer().id || null,
		streamFragment = document.createDocumentFragment(),
		streamString = [];
		script.streamsActive = script.streams[serverID];
		for (let _s_k = Object.keys(script.streamsActive), _s=0; _s<_s_k.length; _s++) {
			const stream = script.streamsActive[_s_k[_s]];
			streamString.push(stream[1]);
			streamFragment.appendChild(_createElement("tr", {className: "tsp-stream_row tsp-stream_offline", id: `stream_${stream[1]}`, name: stream[0], innerHTML: `<td class='tsp-stream_row_child tsp-stream_row_icon size14-1wjlWP' ${stream[3] ? `style="background-image: url(${stream[3]})"` : ""}></td><td class='tsp-stream_row_child tsp-stream_row_anchor size14-1wjlWP orrie-relative orrie-tooltip'><div class='overflowEllipsis-3Rxxjf'><a href='https://www.twitch.tv/${stream[1]}' rel='noreferrer' target='_blank' ${stream[4] ? `style='color:${stream[4]} !important'` : ""}>${stream[0] ? stream[0] : stream[1]}</a></div></td><td class='size14-1wjlWP tsp-stream_row_child tsp-stream_row_status'></td>`}));
		}
		// insert stream table before requesting data
		const streamContainer = _createElement("div", {className: "TwitchStreamPanel", id: `streams_${serverID}`}, [
			_createElement("div", {className: "containerDefault-1bbItS"},
				_createElement("div", {className: "flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO wrapperDefault-1Dl4SS cursorPointer-3oKATS"}, [
					_createElement("div", {className: `nameDefault-Lnjrwm colorTransition-2iZaYd tsp-streams_button`, innerHTML: `<svg class='iconDefault-xzclSQ iconTransition-VhWJ85${!script.settings.state ? " closed-2Hef-I" : ""}' width='12' height='12' viewBox='0 0 24 24'><path fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M7 10L12 15 17 10'></path></svg>Streams`,
					onclick() {
						script.settings.state = !script.settings.state;
						streamContainer.children[1].classList.toggle("orrie-toggled");
						this.firstElementChild.classList.toggle("closed-2Hef-I");
						this.nextElementSibling.classList.toggle("orrie-toggled");
						streamContainer.lastElementChild.classList.toggle("orrie-toggled");
						forceScrolling(streamContainer.scrollHeight, "scroller-NXV0-d");
					}}),
					_createElement("div", {className: `nameDefault-Lnjrwm colorTransition-2iZaYd tsp-update_button${!script.settings.state ? " orrie-toggled" : ""}`, innerHTML: "Update",
						onclick() {streamsUpdate("click");}
					})
				])
			),
			_createElement("div", {className: `containerDefault-7RImuF${!script.settings.state ? " orrie-toggled" : ""}`},
				_createElement("table", {className: "content-2mSKOj orrie-overflow", id: "tsp-stream_table", cellSpacing: 0, server: serverID}, streamFragment)
			),
			_createElement("div", {className: `wrapperDefault-1Dl4SS tsp-footer_wrapper${!script.settings.state ? " orrie-toggled" : ""}`, innerHTML: `<div class='nameDefault-Lnjrwm tsp-time_text'><span id="tsp-timestamp">${new Date().toLocaleTimeString("en-GB")}</span><span id="tsp-timer">00:00</span></div>`},
				_createElement("div", {className: "nameDefault-Lnjrwm cursorPointer-3oKATS tsp-edit_button", innerHTML: "Edit",
					onclick() {
						modalHandler(createStreamModal());
					}
				})
			)
		]);
		if (script.settings.pos) {
			channelContainer.insertBefore(streamContainer, channelContainer.firstChild);
		}
		else {
			channelContainer.appendChild(streamContainer);
		}

		// store streams
		script.streamAPI = `https://api.twitch.tv/kraken/streams/?channel=${streamString.join(",")}`;
		// `https://api.twitch.tv/helix/streams?user_login=${streamString.join("&user_login=")}`;

		// update streams
		const streamsCache = script.streamsCache[serverID];
		script.streamFreq = !Number.isNaN(script.settings.freq) && script.settings.freq >= 120 ? script.settings.freq*1000 : 120000;
		if (streamsCache && streamsCache.time+script.streamFreq > Date.now()) {
			log("info", "streamsCache", streamsCache);
			document.getElementById("tsp-stream_table").innerHTML = streamsCache.html;
			clearInterval(window.streamUpdateCounter);
			streamTimer(script.settings.freq);
		}
		else {
			streamsUpdate("initial");
		}
	},
	streamsUpdate = function(mode) {
		// request data from twitch api and insert into stream table
		if (!script.check.updating && script.streamsActive && (mode == "click" || mode == "initial" || script.check.timer < 30)) {
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
				const streamTable = document.getElementById("tsp-stream_table"),
				streamItems = streamTable.getElementsByClassName("tsp-stream_row"),
				streamStamp = document.getElementById("tsp-timestamp"),
				onlineStreams = [];
				for (let _o=data.streams.length; _o--;) {
					const stream = data.streams[_o],
					streamName = `stream_${stream.channel.name}`,
					streamItem = document.getElementById(streamName);
					if (streamItem) {
						if (streamItem.classList.contains("tsp-stream_offline")) {
							streamItem.classList.remove("tsp-stream_offline");
							streamItem.classList.add("tsp-stream_online");
							BDfunctionsDevilBro.showToast(`${streamItem.name} is streaming with ${stream.viewers.toLocaleString()} viewers!`);
						}
						streamItem.cells[1].innerHTML += `<div class='orrie-tooltip_text orrie-tooltip_bottom'>${stream.game}</div>`;
						streamItem.cells[2].innerHTML = stream.viewers.toLocaleString();
						onlineStreams.push(streamName);
						if (!script.streamsActive[stream.channel.name][0]) {
							script.streamsActive[stream.channel.name][0] = stream.channel.display_name;
							streamItem.cells[1].firstElementChild.innerHTML = stream.channel.display_name;
							bdPluginStorage.set(script.file, "streams", script.streams);
						}
						if (!script.streamsActive[stream.channel.name][3]) {
							script.streamsActive[stream.channel.name][3] = stream.channel.logo;
							streamItem.cells[0].style.backgroundImage = `url('${stream.channel.logo}')`;
							bdPluginStorage.set(script.file, "streams", script.streams);
						}
					}
					else {
						log("error", "streamItem doesn't exist -- Discord inactive?", [stream.channel.name, stream]);
					}
				}
				for (let _s=streamItems.length; _s--;) {
					const streamItem = streamItems[_s];
					if (streamItem.classList.contains("tsp-stream_online") && !onlineStreams.includes(streamItem.id)) {
						streamItem.cells[2].innerHTML = "";
						streamItem.classList.remove("tsp-stream_online");
						streamItem.classList.add("tsp-stream_offline");
						delete streamItem.title;
					}
				}
				if (streamStamp) {
					streamStamp.innerHTML = new Date().toLocaleTimeString("en-GB");
				}
				script.streamsCache[streamTable.server] = {
					time: Date.now(),
					html: streamTable.innerHTML
				};
				script.check.updating = false;
			});
			if (script.settings.update) {
				window.streamUpdateInterval = setTimeout(function() {streamsUpdate("interval");}, script.streamFreq);
				clearInterval(window.streamUpdateCounter);
				streamTimer(script.settings.freq);
			}
			else {
				clearTimeout(window.streamUpdateInterval);
			}
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
				default:
					return "";
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
				_createElement("button", {type: "button", className: "button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeSmall-3g6RX8 grow-25YQ8u", innerHTML: "Edit Streamlist",
					onclick() {modalHandler(createStreamModal());}
				}),
				_createElement("button", {type: "button", className: "button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeSmall-3g6RX8 grow-25YQ8u orrie-buttonRed", innerHTML: "Clean Database (Creates Backup)",
					onclick() {
						bdPluginStorage.set(`${script.file}_backup`, "streams", script.streams);
						script.streams = {};
						bdPluginStorage.set(script.file, "streams", {});
					}
				})
			])
		]);
	},
	createStreamModal = function() {
		return _createElement("div", {className: "modal-3HOjGZ userSelectText-wz4t4g sizeMedium-1-2BNS", innerHTML: "<div class='flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE' style='flex: 0 0 auto;'><div class='flexChild-1KGW5q' style='flex: 1 1 auto;'><h4 class='h4-2IXpeI title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 defaultMarginh4-jAopYe marginReset-3hwONl'>Streamlist Manager</h4></div><svg class='orrie-button-cancel close-3ejNTg flexChild-1KGW5q' xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 12 12'><g fill='none' fill-rule='evenodd'><path d='M0 0h12v12H0'></path><path class='fill' fill='currentColor' d='M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6'></path></g></svg></div>"}, [
			_createElement("div", {className: "scrollerWrap-2uBjct content-1Cut5s scrollerThemed-19vinI themeGhostHairline-2H8SiW"},
				_createElement("div", {className: "scroller-fzNley inner-tqJwAU container-RYiLUQ border-39Cu-M tsp-content"}, createServerList())
			),
			_createElement("div", {className: "flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO inner-tqJwAU container-RYiLUQ border-39Cu-M tsp-menu", style: "flex: 0 0 auto;"},
				_createElement("div", {className: "flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO marginTop8-2gOa2N marginBottom8-1mABJ4", style: "flex: 0 0 100%;"}, [
					_createElement("div", {className: "flex-3B1Tl4 directionRow-yNbSvJ justifyAround-1CVbTI", id: "tsp-stream_menu", style: "flex: 1 0 auto;"}, [
						_createElement("button", {type: "button", className: "button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeSmall-3g6RX8 grow-25YQ8u", innerHTML: "Add New Stream",
							onclick() {
								document.getElementById("tsp-stream_menu").classList.toggle("orrie-toggled");
								document.getElementById("tsp-stream_input").classList.toggle("orrie-toggled");
							}
						}),
						script.settings.colors && BdApi.getPlugin('BetterRoleColors') ? _createElement("button", {type: "button", className: "button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeSmall-3g6RX8 grow-25YQ8u", innerHTML: "Import Colors from BRC",
							onclick() {
								const streamStatus = document.getElementById("tsp-stream_status"),
								twitchStreamList = document.getElementsByClassName("tsp-content")[0],
								streamsBackup = script.streams;
								try {
									for (let _st_k = Object.keys(script.streams), _st=0, _st_len=_st_k.length; _st<_st_len; _st++) {
										const server = script.streams[_st_k[_st]];
										for (let _se_k = Object.keys(server), _se=0, _se_len=_se_k.length; _se<_se_len; _se++) {
											const stream = server[_se_k[_se]];
											if (stream[2]) {
												const member = BdApi.getPlugin('BetterRoleColors').GuildStore.getMember(_st_k[_st],stream[2]);
												if (member) {
													stream[4] = member.colorString;
												}
												else {
													log("error", "Can't find member in server", stream[0]);
												}
											}
										}
									}
									bdPluginStorage.set(script.file, "streams", script.streams);
									twitchStreamList.innerHTML = "";
									twitchStreamList.appendChild(createServerList());
									streamStatus.classList.remove("buttonBrandLink-3csEAP");
									streamStatus.classList.add("buttonGreenLink-211wfK");
									streamStatus.textContent = "Imported Successfully!";
									// remake streamlist
									script.streamsCache = {};
									streamsRemove();
									streamsInsert();
								} catch (e) {
									log("error", "Error importing from BRC", e);
									streamStatus.classList.remove("buttonBrandLink-3csEAP");
									streamStatus.classList.add("buttonRedLink-3HNCDW");
									streamStatus.textContent = "Oops, something went wrong??";
									script.streams = streamsBackup;
								}
								setTimeout(function() {
									streamStatus.classList.remove("buttonGreenLink-211wfK", "buttonRedLink-3HNCDW");
									streamStatus.classList.add("buttonBrandLink-3csEAP");
									streamStatus.textContent = "";
								}, 2500);
							}
						}) : null,
						_createElement("button", {type: "button", className: "button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeSmall-3g6RX8 grow-25YQ8u", innerHTML: "Import List",
							onclick() {
								document.getElementById("tsp-stream_menu").classList.toggle("orrie-toggled");
								document.getElementById("tsp-stream_import").classList.toggle("orrie-toggled");
							}
						}),
						_createElement("button", {type: "button", className: "button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeSmall-3g6RX8 grow-25YQ8u", innerHTML: "Export List",
							onclick() {
								const element = _createElement("textarea", {value: JSON.stringify(script.streams)}),
								streamStatus = document.getElementById("tsp-stream_status");
								document.body.appendChild(element);
								element.focus();
								element.setSelectionRange(0, element.value.length);
								document.execCommand("copy");
								element.remove();
								streamStatus.classList.remove("buttonBrandLink-3csEAP");
								streamStatus.classList.add("buttonGreenLink-211wfK");
								streamStatus.textContent = "Exported Successfully!";
								setTimeout(function() {
									streamStatus.classList.remove("buttonGreenLink-211wfK");
									streamStatus.classList.add("buttonBrandLink-3csEAP");
									streamStatus.textContent = "";
								}, 2500);
							}
						})
					]),
					_createElement("div", {className: "orrie-toggled", id: "tsp-stream_input", style: "flex: 0 1 100%;"}, [
						_createElement("div", {className: "flex-3B1Tl4 directionRow-yNbSvJ justifyBetween-1d1Hto alignStart-pnSyE6 noWrap-v6g9vO marginBottom4-_yArcI"}, [
							_createElement("button", {type: "button", className: "button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeSmall-3g6RX8 grow-25YQ8u", innerHTML: "Add Stream",
								onclick() {saveStream();}
							}),
							_createElement("div", {className: "tsp-stream_close", innerHTML: "<svg class='close-3ejNTg flexChild-1KGW5q' xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 12 12'><g fill='none' fill-rule='evenodd'><path d='M0 0h12v12H0'></path><path class='fill' fill='currentColor' d='M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6'></path></g></svg>",
								onclick() {
									document.getElementById("tsp-stream_input").classList.toggle("orrie-toggled");
									document.getElementById("tsp-stream_menu").classList.toggle("orrie-toggled");
								}
							})
						]),
						_createElement("div", {className: "flex-3B1Tl4 directionColumn-2h-LPR marginBottom8-1mABJ4", innerHTML: "<div class='input-2N4DTT'><input class='inputDefault-Y_U37D input-2YozMi size16-3IvaX_' name='discord_name' placeholder='Display Name  ― If left blank, plugin will use Twitch display name' type='text'></div><div class='input-2N4DTT orrie-inputRequired'><input class='inputDefault-Y_U37D input-2YozMi size16-3IvaX_' name='twitch_name' placeholder='Twitch Username' type='text'></div><div class='input-2N4DTT'><input class='inputDefault-Y_U37D input-2YozMi size16-3IvaX_' name='discord_id' placeholder='Discord ID  ― For coloring. Use dev mode; right click the user and copy ID' type='text'></div><div class='input-2N4DTT'><input class='inputDefault-Y_U37D input-2YozMi size16-3IvaX_' name='icon' placeholder='Custom Icon  ― If left blank, plugin will use Twitch profile image when possible' type='text'></div><div class='input-2N4DTT'><input class='inputDefault-Y_U37D input-2YozMi size16-3IvaX_' name='color' placeholder='Custom Color ― HEX and RGBA supported (Overrides BRC)' type='text'></div>"},
							_createElement("div", {className: "flex-3B1Tl4 input-2N4DTT orrie-inputRequired", innerHTML: "<input class='inputDefault-Y_U37D input-2YozMi size16-3IvaX_' name='server_id' placeholder='Server to Hook (ID) &#8213; Use dev mode; right click the server icon and copy ID' type='text'>"},
								BDfunctionsDevilBro.getSelectedServer() ?
									_createElement("div", {className: "flex-3B1Tl4 wrapper-P4PzYx input-2YozMi", innerHTML: "<button type='button' class='button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE grow-25YQ8u'><div class='contents-4L4hQM height24-2pMcnc'>Current Server</div></button>", onclick() {
										const server = BDfunctionsDevilBro.getSelectedServer();
										if (server) {
											this.previousElementSibling.value = server.id;
										}
									}})
								: false
							)
						)
					]),
					_createElement("div", {className: "orrie-toggled", id: "tsp-stream_import", style: "flex: 0 1 100%;"}, [
						_createElement("div", {className: "flex-3B1Tl4 directionRow-yNbSvJ justifyBetween-1d1Hto alignStart-pnSyE6 noWrap-v6g9vO marginBottom4-_yArcI"}, [
							_createElement("button", {type: "button", className: "button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeSmall-3g6RX8 grow-25YQ8u", innerHTML: "Import List",
								onclick() {
									const streamStatus = document.getElementById("tsp-stream_status"),
									twitchStreamList = document.getElementsByClassName("tsp-content")[0],
									streamsBackup = script.streams;
									try {
										script.streams = Object.assign(script.streams, JSON.parse(document.getElementById("tsp-stream_import-content").value));
										bdPluginStorage.set(script.file, "streams", script.streams);
										twitchStreamList.innerHTML = "";
										twitchStreamList.appendChild(createServerList());
										streamStatus.classList.remove("buttonBrandLink-3csEAP");
										streamStatus.classList.add("buttonGreenLink-211wfK");
										streamStatus.textContent = "Imported Successfully!";
										// remake streamlist
										script.streamsCache = {};
										streamsRemove();
										streamsInsert();
									} catch (e) {
										streamStatus.classList.remove("buttonBrandLink-3csEAP");
										streamStatus.classList.add("buttonRedLink-3HNCDW");
										streamStatus.textContent = "Input not JSON string";
										script.streams = streamsBackup;
									}
									setTimeout(function() {
										streamStatus.classList.remove("buttonGreenLink-211wfK", "buttonRedLink-3HNCDW");
										streamStatus.classList.add("buttonBrandLink-3csEAP");
										streamStatus.textContent = "";
									}, 2500);
								}
							}),
							_createElement("div", {className: "tsp-stream_close", innerHTML: "<svg class='close-3ejNTg flexChild-1KGW5q' xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 12 12'><g fill='none' fill-rule='evenodd'><path d='M0 0h12v12H0'></path><path class='fill' fill='currentColor' d='M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6'></path></g></svg>",
								onclick() {
									document.getElementById("tsp-stream_import").classList.toggle("orrie-toggled");
									document.getElementById("tsp-stream_menu").classList.toggle("orrie-toggled");
								}
							})
						]),
						_createElement("div", {className: "inner-3if5cm flex-3B1Tl4 innerNoAutocomplete-kaUXJZ", innerHTML: "<textarea id='tsp-stream_import-content' class='textArea-20yzAH textArea-20yzAH card-3DriLT scrollbarGhostHairline-D_btXm scrollbar-11WJwo' style='flex: 1 1 auto; width: calc(100% - 25px); resize: vertical;'></textarea>"})
					]),
				])
			),
			_createElement("div", {className: "contents-4L4hQM contents-4L4hQM", innerHTML: "<h3 class='titleDefault-1CWM9y buttonBrandLink-3csEAP marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q' style='flex: 1 1 auto;' id='tsp-stream_status'></h3>", style: "flex: 0 0 auto;"})
		]);
	},
	createServerList = function() {
		const serverFragment = document.createDocumentFragment(),
		servers = BDfunctionsDevilBro.readServerList();
		for (let _a=0, _a_len = servers.length; _a<_a_len; _a++) {
			const server = servers[_a];
			let streams = script.streams[server.id];
			if (streams && Object.keys(streams).length) {
				const streamFragment = document.createDocumentFragment();
				for (let _b_k = Object.keys(streams), _b=0, _b_len = _b_k.length; _b<_b_len; _b++) {
					const streamer = streams[_b_k[_b]];
					streamFragment.appendChild(_createElement("tr", {innerHTML: `<td class='size14-1wjlWP' ${streamer[4] ? `style='color:${streamer[4]} !important'` : ""}>${streamer[0]}</td><td class='size14-1wjlWP'>${streamer[1]}</td><td class='size14-1wjlWP'>${streamer[3] ? `<img src='${streamer[3]}'/>` : ""}</td><td class='size14-1wjlWP'>${streamer[4] ? `<div style="color:${streamer[4]}">${streamer[4]}</div>` : "Default"}</td><td class='size14-1wjlWP'>${streamer[2]}</td>`},
						_createElement("td", {className: "size14-1wjlWP"},
							_createElement("button", {type: "button", className: "orrie-buttonRed orrie-relative orrie-tooltip", innerHTML: "✘<div class='orrie-tooltip_text orrie-tooltip_left'>Remove Stream</div>",
								onclick() {
									delete streams[streamer[1]];
									script.streamsCache[server.id] = {};
									streamsRemove();
									const streams_count = Object.keys(streams).length;
									if (streams_count === 0) {
										streams = null;
										document.getElementById(`tsp_${server.id}`).remove();
									}
									else {
										document.getElementById(`tsp_${server.id}_count`).innerHTML = streams_count;
										streamsInsert();
									}
									bdPluginStorage.set(script.file, "streams", script.streams);
									this.parentNode.parentNode.remove();
								}
							})
						)
					));
				}
				serverFragment.appendChild(_createElement("div", {className: "tsp-stream_server", id: `tsp_${server.id}`}, [
					_createElement("div", {className: "defaultColor-v22dK1 app-XZYfmp cursorPointer-3oKATS orrie-centerText", innerHTML: `<svg class='iconDefault-xzclSQ iconTransition-VhWJ85$ closed-2Hef-I' width='18' height='18' viewBox='0 0 24 24'><path fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M7 10L12 15 17 10'></path></svg><div class='size18-ZM4Qv-'>${server.name}</div><div class='divider-1G01Z9 marginTop8-2gOa2N marginBottom8-1mABJ4'></div>`, onclick() {this.nextElementSibling.classList.toggle("orrie-toggled"); this.firstElementChild.classList.toggle("closed-2Hef-I");}}),
					_createElement("div", {className: "orrie-toggled flex-3B1Tl4 directionColumn-2h-LPR"}, [
						_createElement("table", {className: "cardPrimary-ZVL9Jr primary-2giqSn orrie-centerText", innerHTML: `<tr><td class='weightSemiBold-T8sxWH'>Server ID</td><td>${server.id}</td></tr><tr><td class='weightSemiBold-T8sxWH'>Streams</td><td id='tsp_${server.id}_count'>${streamFragment.childElementCount}</td></tr>`, cellSpacing: 0}),
						_createElement("div", {className: "divider-2JwdCF"}),
						_createElement("table", {className: "cardPrimary-ZVL9Jr primary-2giqSn orrie-centerText", innerHTML: "<thead><th class='size16-3IvaX_ weightSemiBold-T8sxWH height30-9l_TZO'>Display Name</th><th class='size16-3IvaX_ weightSemiBold-T8sxWH height30-9l_TZO'>Twitch Username</th><th class='size16-3IvaX_ weightSemiBold-T8sxWH height30-9l_TZO'>Icon</th><th class='size16-3IvaX_ weightSemiBold-T8sxWH height30-9l_TZO'>Color</th><th class='size16-3IvaX_ weightSemiBold-T8sxWH height30-9l_TZO'>Discord ID</th><th class='size16-3IvaX_ weightSemiBold-T8sxWH height30-9l_TZO'>Remove</th></thead>", cellSpacing: 0}, streamFragment)
					])
				]));
			}
		}
		return serverFragment;
	},
	saveStream = function() {
		// save stream
		const inputs = document.getElementById("tsp-stream_input").getElementsByTagName("input"),
		streamStatus = document.getElementById("tsp-stream_status"),
		data = [];
		for (let _i=0, _i_len = inputs.length; _i<_i_len; _i++) {
			data.push(inputs[_i].value.replace(/\s/g,""));
		}
		if (data[1] && data[5]) {
			if (BDfunctionsDevilBro.getDivOfServer(data[5])) {
				if (!script.streams[data[5]]) {
					script.streams[data[5]] = {};
				}
				if (Object.keys(script.streams[data[5]]).length >= 100) {
					streamStatus.classList.remove("buttonBrandLink-3csEAP");
					streamStatus.classList.add("buttonRedLink-3HNCDW");
					streamStatus.textContent = "Maximum amount of streamers reached, API supports maximum 100 streamers";
				}
				else {
					const twitchStreamList = document.getElementsByClassName("tsp-content")[0];
					if (script.settings.colors && BdApi.getPlugin('BetterRoleColors') && data[2] && !data[4]) {
						const memberData = BdApi.getPlugin('BetterRoleColors').GuildStore.getMember(data[5],data[2]);
						data[4] = memberData ? memberData.colorString : "";
					}
					script.streams[data[5]][data[1]] = data.splice(0,5);
					bdPluginStorage.set(script.file, "streams", script.streams);
					streamStatus.classList.remove("buttonBrandLink-3csEAP");
					streamStatus.classList.add("buttonGreenLink-211wfK");
					streamStatus.textContent = "Saved Successfully!";
					// remake streamlist
					twitchStreamList.innerHTML = "";
					twitchStreamList.appendChild(createServerList());
					document.getElementById(`tsp_${data[0]}`).firstElementChild.click();
					script.streamsCache[data[0]] = {};
					streamsRemove();
					streamsInsert();
				}
			}
			else {
				streamStatus.classList.remove("buttonBrandLink-3csEAP");
				streamStatus.classList.add("buttonRedLink-3HNCDW");
				streamStatus.textContent = "Server doesn't exist in your serverlist";
			}
		}
		else {
			streamStatus.classList.remove("buttonBrandLink-3csEAP");
			streamStatus.classList.add("buttonRedLink-3HNCDW");
			streamStatus.textContent = "Missing required data";
		}
		setTimeout(function() {
			streamStatus.classList.remove("buttonGreenLink-211wfK", "buttonRedLink-3HNCDW");
			streamStatus.classList.add("buttonBrandLink-3csEAP");
			streamStatus.textContent = "";
		}, 2500);
	},
	insertCustomMenu = function(className, tooltip) {
		const menuAnchor = document.getElementsByClassName("titleText-2IfpkV")[0] ? document.getElementsByClassName("titleText-2IfpkV")[0].nextElementSibling.nextElementSibling : false;
		if (menuAnchor) {
			const menuIcon = menuAnchor.getElementsByClassName(className)[0];
			if (menuIcon) {
				menuIcon.remove();
			}
			menuAnchor.insertBefore(_createElement("div", {className: `${className} iconMargin-2Js7V9 icon-mr9wAc orrie-relative orrie-tooltip`, innerHTML: `<div class='orrie-tooltip_text orrie-tooltip_bottom'>${tooltip}</div>`,
				onclick() {
					console.time("createStreamModal");
					modalHandler(createStreamModal());
					console.timeEnd("createStreamModal");
				}
			}), menuAnchor.firstChild);
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
					if (children[_c]) {
						element.appendChild(children[_c]);
					}
				}
			}
		}
		return element;
	};
	// return class construction
	return class TwitchStreamPanel {
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
			if (typeof BDfunctionsDevilBro !== "object") {
				document.head.appendChild(_createElement("script", {type: "text/javascript", src: "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"}));
			}
			if (typeof BDfunctionsDevilBro === "object" && document.getElementsByClassName("messages")[0]) {
				const serverID = BDfunctionsDevilBro.getSelectedServer() ? BDfunctionsDevilBro.getSelectedServer().id : false;
				if (script.streams[serverID] && Object.keys(script.streams[serverID]).length) {
					streamsInsert();
				}
				insertCustomMenu("tsp-menuIcon", script.name);
			}
		}
		observer({addedNodes}) {
			if (addedNodes.length > 0 && addedNodes[0].className == "messages-wrapper" && BDfunctionsDevilBro) {
				const serverID = BDfunctionsDevilBro.getSelectedServer() ? BDfunctionsDevilBro.getSelectedServer().id : false;
				if (!document.getElementsByClassName("tsp-menuIcon")[0]) {
					insertCustomMenu("tsp-menuIcon", script.name);
				}
				if (script.streams[serverID] && Object.keys(script.streams[serverID]).length) {
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
			const menuIcon = document.getElementsByClassName("tsp-menuIcon")[0];
			if (menuIcon) {
				menuIcon.remove();
			}
		}
	};
})();
