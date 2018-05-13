//META{"name":"BetterImagePopups","website":"https://github.com/Orrielel/BetterDiscordAddons/tree/master/Plugins/BetterImagePopups","source":"https://raw.githubusercontent.com/Orrielel/BetterDiscordAddons/master/Plugins/BetterImagePopups/BetterImagePopups.plugin.js"}*//

/* global bdPluginStorage, BdApi */

const BetterImagePopups = (function() {	// plugin settings
	const script = {
		name: "Better Image Popups",
		file: "BetterImagePopups",
		version: "1.3.1",
		author: "Orrie",
		desc: "Improves the image popups with full resolution images (if activated) and zooming from native size when clicking on them",
		url: "https://github.com/Orrielel/BetterDiscordAddons/tree/master/Plugins/BetterImagePopups",
		raw: "https://raw.githubusercontent.com/Orrielel/BetterDiscordAddons/master/Plugins/BetterImagePopups/BetterImagePopups.plugin.js",
		discord: "https://discord.gg/YEZkpkj",
		settings: {fullRes: true, minSize: false, height: "auto", width: "auto", debug: false},
		settingsMenu: {
			//          localized                 type     description
			fullRes: ["Full Resolution Images",  "check", "Replaces images with full resolution.<br>NOTE: Zooming is always possible. Default is 25% per click.<br>Use CTRL (100%), SHIFT (50%) and ALT (200%) to manipulate the zooming clicks."],
			minSize: ["Minimum Size for Images", "check", "Use a minimum height/width for images (use 'auto' for no minimum limit)"],
			height:  ["Height",                  "text",  "In pixels"],
			width:   ["Width",                   "text",  "In pixels"],
			debug:   ["Debug",                   "check", "Displays verbose stuff into the console"]
		},
		css: {
			script:`
.bip-container {text-align: center;}
.bip-container .scrollerWrap-2lJEkd {flex-direction: column; min-height: unset;}
.bip-container .imageWrapper-2p5ogY img {position: static;}
.bip-container .spinner-2enMB9 {position: absolute;}
.bip-container .bip-scroller {margin-bottom: 6px; max-height: calc(100vh - 160px); max-width: calc(100vw - 160px); overflow: auto;}
.bip-container .bip-scroller img {vertical-align: middle;}
.bip-container .bip-scroller::-webkit-scrollbar-corner {background: rgba(0,0,0,0);}
.bip-container .bip-center {max-height: calc(100vh - 160px); max-width: calc(100vw - 160px);}
.bip-container .bip-description {font-size: 16px; line-height: 24px;}
.bip-container .bip-description > span {margin-left: 4px;}
.bip-container .bip-description > span+span:before {content: "–"; font-weight: bold; margin-right: 4px;}
.bip-container .downloadLink-2oSgiF {text-transform: capitalize;}
.bip-container .bip-controls {margin: 0 auto; padding: 10px 25px; visibility: hidden;}
.bip-container.bip-scaling .bip-controls {visibility: visible;}
.bip-container .bip-controls > div {display: inline-block;}
.bip-container .bip-zoom {border-radius: 5px; border: 2px solid; cursor: pointer; line-height: 20px; margin: 0 10px; padding: 0px 5px; text-align: center; width: 10px;}
.bip-loading {opacity: 0; width: 0; height: 0;}
.bip-toggled {display: none !important;}
.bip-container .orrie-tooltip .tooltip-top {bottom: calc(100% + 10px);}
.bip-container.bip-scaling .tooltip {display: none;}
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
		zoom: 100
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
		if (script.settings.debug) {
			console[method](`%c[${script.file}]%c ${title}`, "color: purple; font-weight: bold;", "", new Date().toLocaleTimeString("en-GB"), data ? data : "");
		}
	},
	imagePopHandler = function(wrapper, node) {
		log("info", "imagePop", wrapper);
		const img = wrapper.lastElementChild;
		if (img.src) {
			const proxy = img.src.split("?")[0],
			container = wrapper.parentNode,
			fullSrc = /\/external\//.test(proxy) ? proxy.match(/http[s\/\.][\w\.\-\/]+/g)[0].replace(/https\/|http\//,"https://") : proxy;
			wrapper.href = fullSrc;
			wrapper.style.cssText = "";
			wrapper.removeAttribute("target");
			if (script.settings.fullRes) {
				wrapper.appendChild(_createElement("img", {className: "bip-loading", src: fullSrc,
					onload() {
						document.getElementById("bip-loading").classList.add("bip-toggled");
						this.previousElementSibling.setAttribute("src", this.src);
						this.remove();
					},
					onerror() {
						this.src = proxy;
						this.onerror = undefined;
					}
				}));
			}
			node.classList.add("bip-container");
			node.firstElementChild.appendChild(_createElement("div", {className: "bip-controls description-3_Ncsb"}, [
				_createElement("div", {className: "bip-zoom downloadLink-2oSgiF", textContent: "-",
					onclick(click) {
						zoomImage(click, "out", img, wrapper);
					}
				}),
				_createElement("div", {className: "bip-zoom-level"}),
				_createElement("div", {className: "bip-zoom downloadLink-2oSgiF", textContent: "+",
					onclick(click) {
						zoomImage(click, "in", img, wrapper);
					}
				})
			]));
			container.classList.add("orrie-tooltip", "orrie-relative");
			container.insertBefore(_createElement("div", {className: "bip-description description-3_Ncsb userSelectText-1o1dQ7", innerHTML: `<span id='bip-info'></span><span id='bip-scale' class='bip-toggled'></span><span id='bip-zoom' class='bip-toggled'>Zoomed to <span class='bip-zoom-width'></span>px × <span class='bip-zoom-height'></span>px</span><span id='bip-loading'>${script.settings.fullRes ? "Loading Full Resolution": ""}</span>`}), container.lastElementChild);
			container.appendChild(_createElement("div", {className: "tooltip tooltip-top", textContent: "Click the image to zoom"}));
			img.classList.add("bip-center");
			img.style.cssText = "";
			img.onclick = function() {
				this.classList.toggle("bip-center");
				wrapper.classList.toggle("bip-scroller");
				wrapper.classList.toggle("scroller-2FKFPG");
				container.classList.toggle("scrollerWrap-2lJEkd");
				node.classList.toggle("bip-scaling");
				document.getElementById("bip-zoom").classList.toggle("bip-toggled");
				if (img.scaled) {
					document.getElementById("bip-scale").classList.toggle("bip-toggled");
				}
				BdApi.clearCSS(`${script.file}-zoom`);
				BdApi.injectCSS(`${script.file}-zoom`, `
					.bip-container .imageWrapper-2p5ogY.bip-scroller img {zoom: ${script.zoom}%}
					.bip-zoom-level:after{content: '${script.zoom}%';}
					.bip-zoom-width:after{content: '${img.width*(script.zoom/100)}';}
					.bip-zoom-height:after{content: '${img.height*(script.zoom/100)}';}
				`);
			};
			img.onload = function() {
				document.getElementById("bip-info").textContent = `${this.naturalWidth}px × ${this.naturalHeight}px`;
				if (this.naturalHeight > window.innerHeight || this.naturalWidth > window.innerWidth || (script.settings.minSize && this.naturalHeight !== this.height && this.naturalWidth !== this.width)) {
					document.getElementById("bip-scale").textContent = `Scaled to ${this.width}px × ${this.height}px`;
					document.getElementById("bip-scale").classList.remove("bip-toggled");
					img.scaled = true;
				}
			};
		}
	},
	zoomImage = function({altKey, ctrlKey, shiftKey}, mode, img, wrapper) {
		let steps = 25;
		if (altKey) {steps = 200;}
		else if (ctrlKey) {steps = 100;}
		else if (shiftKey) {steps = 50;}
		if (mode == "out"&& script.zoom > steps) {
			script.zoom -= steps;
		}
		else {
			script.zoom += steps;
		}
		const width = img.width*(script.zoom/100),
		height = img.height*(script.zoom/100);
		BdApi.clearCSS(`${script.file}-zoom`);
		BdApi.injectCSS(`${script.file}-zoom`, `
			.bip-container .imageWrapper-2p5ogY.bip-scroller img {zoom: ${script.zoom}%}
			.bip-zoom-level:after{content: '${script.zoom}%';}
			.bip-zoom-width:after{content: '${width}';}
			.bip-zoom-height:after{content: '${height}';}
		`);
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
				_createElement("a", {href: script.url, target: "_blank", rel:"noreferrer", innerHTML: "<button type='button' class='button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeSmall-2cSMqn grow-q77ONN'>Source (GitHub)</button>"})
			])
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
	};
	return class BetterImagePopups {
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
		// load, start and observer
		load() {}
		start() {
			settingsLoad();
			BdApi.clearCSS("orrie-plugin");
			BdApi.injectCSS("orrie-plugin", script.css.shared);
			BdApi.injectCSS(script.file, script.css.script);
			if (script.settings.minSize) {
				BdApi.clearCSS(`${script.file}-imageSize`);
				BdApi.injectCSS(`${script.file}-imageSize`, `.bip-container .imageWrapper-2p5ogY img {min-height: ${isNaN(script.settings.height) ? "auto" : `${script.settings.height}px`}; min-width: ${isNaN(script.settings.width) ? "auto" : `${script.settings.width}px`}`);
			}
			else {
				BdApi.clearCSS(`${script.file}-imageSize`);
			}
			this.active = true;
		}
		observer({addedNodes}) {
			if (addedNodes.length > 0) {
				const node = addedNodes[0];
				if (node.className == "modal-1UGdnR") {
					const wrapper = node.getElementsByClassName("imageWrapper-2p5ogY")[0];
					if (wrapper && !node.getElementsByClassName("uploadModal-2ifh8j")[0]) {
						BdApi.clearCSS(`${script.file}-zoom`);
						script.zoom = 100;
						const wrapperObserver = new MutationObserver(function(mutations) {
							if (mutations[1].addedNodes.length) {
								imagePopHandler(wrapper, node);
								wrapperObserver.disconnect();
							}
						});
						if (node.getElementsByClassName("imageWrapperInner-3_dNk0")[0]) {
							wrapperObserver.observe(wrapper,{childList: true});
						}
						else {
							imagePopHandler(wrapper, node);
						}
					}
					if (script.settings.minSize) {
						BdApi.clearCSS(`${script.file}-imageSize`);
						BdApi.injectCSS(`${script.file}-imageSize`, `.bip-container .imageWrapper-2p5ogY img {min-height: ${isNaN(script.settings.height) ? "auto" : `${script.settings.height}px`}; min-width: ${isNaN(script.settings.width) ? "auto" : `${script.settings.width}px`}`);
					}
					else {
						BdApi.clearCSS(`${script.file}-imageSize`);
					}
				}
			}
		}
		// stop script
		stop() {
			BdApi.clearCSS(script.file);
			BdApi.clearCSS(`${script.file}-imageSize`);
			BdApi.clearCSS(`${script.file}-zoom`);
			this.active = false;
		}
	};
})();
