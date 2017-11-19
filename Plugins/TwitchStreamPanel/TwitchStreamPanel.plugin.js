//META{"name":"TwitchStreamPanel", "pname":"Twitch Stream Panel"}*//

/* global bdPluginStorage, BdApi, BDfunctionsDevilBro, PluginUpdates */

const TwitchStreamPanel = (function() {
	// plugin settings
	const script = {
		name: "Twitch Stream Panel",
		file: "TwitchStreamPanel",
		version: "1.3.7",
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
		streamsActive: false,
		settings: {colors: true, state: true, update: true, freq: 300, debug: false},
		settingsMenu: {
			//       localized         type     description
			colors: ["Colorize Names", "check", "Uses <a href='https://github.com/rauenzi/BetterDiscordAddons/tree/master/Plugins/BetterRoleColors' target='_blank'>BetterRoleColors</a> to colorize names"],
			state:  ["Visibility",     "check", "Display streamlist at startup, or hide it"],
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
.TwitchStreamPanel #tsp-timer:before {content: "(";}
.TwitchStreamPanel #tsp-timer:after {content: ")";}
.TwitchStreamPanel .tsp-edit_button {display: inline-block; float: right; padding-left: 0; width: auto;}
.orriePluginModal .modal-3HOjGZ {padding: 0 20px; user-select: auto;}
.orriePluginModal .tsp-menu .content-2mSKOj {height: auto;}
.orriePluginModal .tsp-content .content-2mSKOj {display: table; width: 100%;}
.orriePluginModal .tsp-content .content-2mSKOj img {height: 20px; vertical-align: text-bottom;}
.orriePluginModal .input::-webkit-input-placeholder {font-size: 12px; color: rgba(255, 255, 255, 0.5) !important;}
.orriePluginModal #tsp-stream_status {border-radius: 2px; display: inline-block; padding: 8px; }
.orriePluginModal .tsp-stream_close svg {margin-top: 0; margin-right: 0 !important;}
.orriePluginModal .tsp-stream_server {margin: 10px 0;}
.orriePluginModal .tsp-stream_server td {line-height: 26px;}
.orriePluginModal .tsp-stream_server tr:hover td {background-color: rgba(0,0,0,0.2);}
.orriePluginModal .tsp-stream_server button {border-radius: 5px; color: #FFFFFF; padding: 1px 6px;}
			`,
			shared: `
.orrie-flex {display: flex; justify-content: space-around;}
.orrie-plugin .buttonBrandFilled-3Mv0Ra a {color: #FFFFFF !important;}
.orrie-buttonRed, .bda-slist .orrie-buttonRed {background-color: #F04747 !important;}
.orrie-buttonRed:hover, .bda-slist .orrie-buttonRed:hover {background-color: #FD5D5D !important;}
.orrie-toggled {display: none !important;}
.orrie-centerText {text-align: center;}
.theme-dark .orrie-plugin {color: #B0B6B9;}
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
	settingsSave = function(key, data) {
		// save settings
		script.settings[key] = data;
		bdPluginStorage.set(script.file, "settings", script.settings);
		log("info", "Settings Saved", [key, data]);
	},
	settingsAnimate = function(data, type, elem) {
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
	cleanDB = function() {
		// clean database
		script.streams = {};
		bdPluginStorage.set(script.file, "streams", {});
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
		const display = document.getElementById("tsp-timer");
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
		script.streamsActive = false;
		clearInterval(window.nopanStreamsInterval);
		clearInterval(window.streamUpdateCounter);
	},
	streamsInsert = function() {
		// prepare static stream list data
		const channelContainer = document.getElementsByClassName("scroller-NXV0-d")[0],
		serverID = BDfunctionsDevilBro.getIdOfServer(BDfunctionsDevilBro.getSelectedServer()),
		streamFragment = document.createDocumentFragment(),
		streamString = [],
		colorData = script.settings.colors && BdApi.getPlugin('BetterRoleColors') ? BdApi.getPlugin('BetterRoleColors').colorData[serverID] : false;
		script.streamsActive = script.streams[serverID];
		for (let _s_k = Object.keys(script.streamsActive), _s=0; _s<_s_k.length; _s++) {
			const stream = script.streamsActive[_s_k[_s]];
			streamString.push(stream[1]);
			streamFragment.appendChild(_createElement("tr", {className: "tsp-stream_row tsp-stream_offline", id: `stream_${stream[1]}`, name: stream[0], innerHTML: `<td class='tsp-stream_row_child tsp-stream_row_icon size14-1wjlWP' ${stream[3] ? `style="background-image: url(${stream[3]})"` : ""}></td><td class='tsp-stream_row_child tsp-stream_row_anchor size14-1wjlWP overflowEllipsis-3Rxxjf'><a href='https://www.twitch.tv/${stream[1]}' rel='noreferrer' target='_blank' ${colorData && colorData[stream[2]] ? `style='color:${colorData[stream[2]]} !important'` : ""}>${stream[0]}</a></td><td class='size14-1wjlWP tsp-stream_row_child tsp-stream_row_status'></td>`}));
		}
		// insert stream table before requesting data
		const streamContainer = _createElement("div", {className: "TwitchStreamPanel", id: `streams_${serverID}`}, [
			_createElement("div", {className: "containerDefault-1bbItS"}, [
				_createElement("div", {className: "flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO wrapperDefault-1Dl4SS cursorPointer-3oKATS"}, [
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
			]),
			_createElement("div", {className: `containerDefault-7RImuF${!script.settings.state ? " orrie-toggled" : ""}`}, [
				_createElement("table", {className: "content-2mSKOj", id: "tsp-stream_table", cellSpacing: 0}, streamFragment)
			]),
			_createElement("div", {className: "wrapperDefault-1Dl4SS tsp-footer_wrapper", innerHTML: `<div class='nameDefault-Lnjrwm tsp-time_text'><span id="tsp-timestamp">${new Date().toLocaleTimeString("en-GB")}</span><span id="tsp-timer">00:00</span></div>`}, [
				_createElement("div", {className: "nameDefault-Lnjrwm cursorPointer-3oKATS tsp-edit_button", innerHTML: "Edit",
					onclick() {
						BDfunctionsDevilBro.appendModal(createStreamModal());
					}
				})
			])
		]);
		channelContainer.appendChild(streamContainer);

		// store streams
		script.streamAPI = `https://api.twitch.tv/kraken/streams/?channel=${streamString.join(",")}`;

		// update streams and set update interval to 2mins
		streamsUpdate("initial");
		if (script.settings.update) {
			const updateFreq = !Number.isNaN(script.settings.freq) && script.settings.freq >= 120 ? script.settings.freq*1000 : 120000;
			clearInterval(window.streamUpdateInterval);
			window.streamUpdateInterval = setInterval(function() {streamsUpdate("interval");}, updateFreq);
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
				const streamItems = document.getElementById("tsp-stream_table").getElementsByClassName("tsp-stream_row"),
				streamStamp = document.getElementById("tsp-timestamp"),
				onlineStreams = [];
				for (let _o=0; _o<data.streams.length; _o++) {
					const stream = data.streams[_o],
					streamName = `stream_${stream.channel.name}`,
					streamItem = document.getElementById(streamName);
					if (streamItem) {
						if (streamItem.classList.contains("tsp-stream_offline")) {
							streamItem.classList.remove("tsp-stream_offline");
							streamItem.classList.add("tsp-stream_online");
							BDfunctionsDevilBro.showToast(`${streamItem.name} is streaming with ${stream.viewers.toLocaleString()} viewers!`);
						}
						streamItem.title = stream.game;
						streamItem.cells[2].innerHTML = stream.viewers.toLocaleString();
						onlineStreams.push(streamName);
						if (!script.streamsActive[stream.channel.name][0]) {
							script.streamsActive[stream.channel.name][0] = stream.channel.display_name;
							streamItem.cells[1].innerHTML = stream.channel.display_name;
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
				for (let _s=0; _s<streamItems.length; _s++) {
					const streamItem = streamItems[_s];
					if (streamItem.classList.contains("tsp-stream_online") && !onlineStreams.includes(streamItem.id)) {
						streamItem.cells[2].innerHTML = "";
						streamItem.classList.add("tsp-stream_offline");
						streamItem.classList.remove("tsp-stream_online");
						delete streamItem.title;
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
								settingsAnimate(this.checked, "check", this);
							}
						}),
						_createElement("div", {className: `ui-switch ${checked}`})
					]);
				case "range":
					const value = `${(script.settings[key]*100).toFixed(0)}%`;
					return _createElement("div", {className: "plugin-setting-input-container", innerHTML: `<span class='plugin-setting-label'>${value}</span>`}, [
						_createElement("input", {className: "plugin-input plugin-input-range", type: "range", max: "1", min: "0", step: "0.01", value: script.settings[key], style: `background: linear-gradient(to right, rgb(114, 137, 218), rgb(114, 137, 218) ${value}, rgb(114, 118, 125) ${value}); margin-left: 10px; float: right;`,
							onchange() {settingsSave(key, this.value);},
							oninput() {settingsAnimate(this.value, "range", this);}
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
				_createElement("div", {className: "ui-flex flex-horizontal flex-justify-start flex-align-stretch flex-nowrap plugin-setting-input-row", innerHTML: `<h3 class='ui-form-title h3 margin-reset margin-reset ui-flex-child'>${setting[0]}</h3>`}, [
					_createElement("div", {className: "input-wrapper"}, settingType(_s_k[_s], setting))
				]),
				_createElement("div", {className: "ui-form-text style-description margin-top-4", innerHTML: setting[2]})
			]));
		}
		return _createElement("div", {className: `${script.file} orrie-plugin`}, [
			_createElement("div", {className: "ops-plugin_wrapper"}, [
				_createElement("h2", {className: "h5-3KssQU title-1pmpPr marginReset-3hwONl height16-1qXrGy weightSemiBold-T8sxWH defaultMarginh5-2UwwFY marginBottom8-1mABJ4", innerHTML: "Settings"}),
				_createElement("div", {className: "plugin-controls"}, settingsFragment)
			]),
			_createElement("div", {className: "orrie-flex"}, [
				_createElement("button", {type: "button", className: "button-2t3of8 smallGrow-2_7ZaC buttonBrandFilled-3Mv0Ra", innerHTML: `<a href='${script.discord}' target='_blank' rel='noreferrer'>Support (Discord)</a>`}),
				_createElement("button", {type: "button", className: "button-2t3of8 smallGrow-2_7ZaC buttonBrandFilled-3Mv0Ra", innerHTML: `<a href='${script.url}' target='_blank' rel='noreferrer'>Updates</a>`}),
				_createElement("button", {type: "button", className: "button-2t3of8 smallGrow-2_7ZaC buttonBrandFilled-3Mv0Ra", innerHTML: "Edit Streamlist",
					onclick() {BDfunctionsDevilBro.appendModal(createStreamModal());}
				}),
				_createElement("button", {type: "button", className: "button-2t3of8 smallGrow-2_7ZaC buttonBrandFilled-3Mv0Ra orrie-buttonRed", innerHTML: "Clean Database (Irreversible!)",
					onclick() {cleanDB();}
				})
			])
		]);
	},
	createStreamModal = function() {
		const modal = _createElement("span", {className: `${script.file}Modal orriePluginModal DevilBro-modal`, innerHTML: "<div class='backdrop-2ohBEd'></div><div class='modal-2LIEKY'><div class='inner-1_1f7b'><div class='modal-3HOjGZ sizeMedium-1-2BNS'><div class='flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE' style='flex: 0 0 auto;'><div class='flexChild-1KGW5q' style='flex: 1 1 auto;'><h4 class='h4-2IXpeI title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 defaultMarginh4-jAopYe marginReset-3hwONl'>Streamlist</h4></div><svg class='btn-cancel close-3ejNTg flexChild-1KGW5q' xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 12 12'><g fill='none' fill-rule='evenodd'><path d='M0 0h12v12H0'></path><path class='fill' fill='currentColor' d='M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6'></path></g></svg></div><div class='flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO tsp-menu' style='flex: 0 0 auto;'></div><div class='scrollerWrap-2uBjct content-1Cut5s scrollerThemed-19vinI themeGhostHairline-2H8SiW'><div class='scroller-fzNley inner-tqJwAU cardPrimary-ZVL9Jr tsp-content'></div></div><div class='flex-lFgbSz flex-3B1Tl4 horizontalReverse-2LanvO horizontalReverse-k5PqxT flex-3B1Tl4 directionRowReverse-2eZTxP justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO footer-1PYmcw'><div class='contentsDefault-nt2Ym5 contents-4L4hQM contentsFilled-3M8HCx contents-4L4hQM'><h3 class='titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q' style='flex: 1 1 auto;'>Saves Automatically</h3></div></div></div></div></div>"});
		modal.getElementsByClassName("tsp-menu")[0].appendChild(_createElement("div", {className: "flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO margin-bottom-8", style: "flex: 0 0 100%;"}, [
			_createElement("div", {className: "tsp-stream_header", innerHTML: `<button class='buttonBrandFilledDefault-2Rs6u5 buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 buttonBrandFilled-3Mv0Ra smallGrow-2_7ZaC' type='button'>Add New Stream</button>`,
				onclick() {
					this.classList.toggle("orrie-toggled");
					this.nextElementSibling.classList.toggle("orrie-toggled");
				}
			}),
			_createElement("div", {className: "orrie-toggled", id: "tsp-stream_input", style: "flex: 0 1 100%;"}, [
				_createElement("div", {className: "flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO margin-bottom-4 tsp-relative"}, [
					_createElement("button", {className: "buttonBrandFilledDefault-2Rs6u5 buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 buttonBrandFilled-3Mv0Ra smallGrow-2_7ZaC", innerHTML: "Add to List",
						onclick() {saveStream();}
					}),
					_createElement("div", {className: "orrie-centerText", innerHTML: "<div id='tsp-stream_status'></div>", style: "flex: 1 1 auto;"}),
					_createElement("div", {className: "tsp-stream_close", innerHTML: "<svg class='close-3ejNTg flexChild-1KGW5q' xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 12 12'><g fill='none' fill-rule='evenodd'><path d='M0 0h12v12H0'></path><path class='fill' fill='currentColor' d='M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6'></path></g></svg>",
						onclick() {
							const stream_input = document.getElementById("tsp-stream_input");
							stream_input.classList.toggle("orrie-toggled");
							stream_input.previousElementSibling.classList.toggle("orrie-toggled");
						}
					})
				]),
				_createElement("div", {className: "content-2mSKOj flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO margin-bottom-8", innerHTML: "<div class='ui-form-item flexChild-1KGW5q' style='flex: 1 0 auto;'><div class='ui-input-button'><div class='flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO layout'><input class='input' name='discord_name' placeholder='Display Name &#8213; Optional &#8213; If left blank, plugin will use Twitch display name' type='text'></div></div><div class='ui-input-button'><div class='flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO layout'><input class='input' name='twitch_name' placeholder='Twitch Username &#8213; Required' type='text'></div></div><div class='ui-input-button'><div class='flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO layout'><input class='input' name='discord_id' placeholder='Discord ID &#8213; Optional &#8213; For coloring. Use dev mode; right click the user and copy ID' type='text'></div></div><div class='ui-input-button'><div class='flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO layout'><input class='input' name='icon' placeholder='Custom Icon &#8213; Optional &#8213; If left blank, plugin will use Twitch profile image when possible' type='text'></div></div><div class='ui-input-button'><div class='flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO layout'><input class='input' name='server_id' placeholder='Server to Hook (ID) &#8213; Required &#8213; Use dev mode; right click the server icon and copy ID' type='text'></div></div></div>"})
			])
		]));
		modal.getElementsByClassName("tsp-content")[0].appendChild(createServerList());
		return modal;
	},
	createServerList = function () {
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
						streamFragment.appendChild(_createElement("tr", {innerHTML: `<td class='size14-1wjlWP'>${streamer[0]}</td><td class='size14-1wjlWP'>${streamer[1]}</td><td class='size14-1wjlWP'>${streamer[2]}</td><td class='size14-1wjlWP'><img src='${streamer[3]}'/></td>`}, [
							_createElement("td", {className: "size14-1wjlWP"}, [
								_createElement("button", {className: "orrie-buttonRed", innerHTML: "✘",
									onclick() {
										delete script.streams[data.id][streamer[1]];
										this.parentNode.parentNode.remove();
										streamsRemove();
										if (Object.keys(script.streams[data.id]).length === 0) {
											delete script.streams[data.id];
											document.getElementById(`streamTable_${data.id}`).remove();
										}
										else {
											streamsInsert();
										}
										bdPluginStorage.set(script.file, "streams", script.streams);
									}
								})
							])
						]));
					}
					serverFragment.appendChild(_createElement("div", {className: "tsp-stream_server", id: `streamTable_${data.id}`, innerHTML: `<div class='defaultColor-v22dK1 orrie-centerText'><div class='size18-ZM4Qv-'>${data.name} &#8213; ID &#10151; ${data.id}</div><div class='divider-1G01Z9 marginTop8-2gOa2N marginBottom8-1mABJ4'></div></div>`}, [
						_createElement("table", {className: "content-2mSKOj primary-2giqSn orrie-centerText", innerHTML: "<thead><th class='size16-3IvaX_'>Display Name</th><th class='size16-3IvaX_'>Twitch Username</th><th class='size16-3IvaX_'>Discord ID</th><th class='size16-3IvaX_'>Icon</th><th class='size16-3IvaX_'>Remove</th></thead>", cellSpacing: 0}, streamFragment)
					]));
				}
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
			data.push(inputs[_i].value);
		}
		if (data[1] && data[4]) {
			if (BDfunctionsDevilBro.getDivOfServer(data[4])) {
				const twitchStreamList = document.getElementsByClassName("tsp-content")[0];
				if (!script.streams[data[4]]) {
					script.streams[data[4]] = {};
				}
				script.streams[data[4]][data[1]] = data.splice(0,4);
				bdPluginStorage.set(script.file, "streams", script.streams);
				twitchStreamList.innerHTML = "";
				twitchStreamList.appendChild(createServerList());
				streamStatus.classList.add("itemBrand-mC9YR4");
				streamStatus.textContent = "Saved Successfully!";
				// remake streamlist
				streamsRemove();
				streamsInsert();
			}
			else {
				streamStatus.classList.add("itemDanger-3m3dwx");
				streamStatus.textContent = "Server doesn't exist in your serverlist";
			}
		}
		else {
			streamStatus.classList.add("itemDanger-3m3dwx");
			streamStatus.textContent = "Missing required data";
		}
		setTimeout(function() {
			streamStatus.className = "";
			streamStatus.textContent = "";
		}, 2500);
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
		// load, start and observer
		load() {
			console.info(`${script.name} v${script.version} loaded.`);
			BdApi.clearCSS("orrie-plugin");
			BdApi.injectCSS("orrie-plugin", script.css.shared);
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
