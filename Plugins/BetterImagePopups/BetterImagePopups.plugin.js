//META{"name":"BetterImagePopups"}*//

/* global bdPluginStorage, BdApi */

const BetterImagePopups = (function() {	// plugin settings
	const script = {
		name: "Better Image Popups",
		file: "BetterImagePopups",
		version: "1.2.8",
		author: "Orrie",
		desc: "Show full sized images in image popup. Zooming is possible if the image is bigger than Discord window size",
		url: "https://github.com/Orrielel/BetterDiscordAddons/tree/master/Plugins/BetterImagePopups",
		raw: "https://raw.githubusercontent.com/Orrielel/BetterDiscordAddons/master/Plugins/BetterImagePopups/BetterImagePopups.plugin.js",
		discord: "https://discord.gg/YEZkpkj",
		settings: {fullRes: true, scale: 0.15, zoom: false, minSize: false, height: "auto", width: "auto", debug: false},
		settingsMenu: {
			//          localized                 type     description
			fullRes: ["Full Resolution Images",  "check", "Replaces images with full resolution ones whilst in popup mode.<br>Images larger than the visible screen will be clickable for pure native previews with scrolling"],
			scale:   ["Scaling Threshold",       "range", "The maximum threshold between the image and viewport before adding zooming. Default is 15% bigger than viewport"],
			zoom:    ["Always Zoom",             "check", "Force zooming when clicking on previewed image"],
			minSize: ["Minimum Size for Images", "check", "Use a minimum height/width for images"],
			height:  ["Height",                  "text",  "Image height (use auto for no minimum limit)"],
			width:   ["Width",                   "text",  "Image width (use auto for no minimum limit)"],
			debug:   ["Debug",                   "check", "Displays verbose stuff into the console"]
		},
		css: `
.bip-container {text-align: center;}
.bip-container .scrollerWrap-2lJEkd {flex-direction: column; min-height: unset;}
.bip-container .imageWrapper-2p5ogY img {position: static;}
.bip-container .spinner-2enMB9 {position: absolute;}
.bip-container .bip-scroller {margin-bottom: 6px; max-height: calc(100vh - 160px); max-width: calc(100vw - 160px); overflow: auto;}
.bip-container .bip-scroller img {vertical-align: middle;}
.bip-container .bip-scroller::-webkit-scrollbar-corner {background: rgba(0,0,0,0);}
.bip-container .bip-center {max-height: calc(100vh - 160px); max-width: calc(100vw - 160px);}
.bip-container .bip-description {font-size: 16px; line-height: 24px;}
.bip-container .bip-description span {margin: 0 4px;}
.bip-container .downloadLink-2oSgiF {text-transform: capitalize;}
.bip-container .bip-controls {margin: 0 auto; padding: 10px 25px; visibility: hidden;}
.bip-container.bip-scaling .bip-controls {visibility: visible;}
.bip-container .bip-controls > div {display: inline-block;}
.bip-container .bip-zoom {border-radius: 5px; border: 2px solid; cursor: pointer; line-height: 20px; margin: 0 10px; padding: 0px 5px; text-align: center; width: 10px;}
.bip-loading {opacity: 0; width: 0; height: 0;}
.bip-toggled {display: none !important;}
		`,
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
			const proxy = img.src.split("?")[0];
			if (!/\.gif$/.test(proxy)) {
				const container = wrapper.parentNode,
				fullSrc = /\/external\//.test(proxy) ? proxy.match(/http[s\/\.][\w\.\-\/]+/g)[0].replace(/https\/|http\//,"https://") : proxy;
				wrapper.href = fullSrc;
				wrapper.style.cssText = "";
				wrapper.removeAttribute("target");
				if (script.settings.fullRes) {
					wrapper.appendChild(_createElement("img", {className: "bip-loading", src: fullSrc,
						onload() {this.previousElementSibling.setAttribute("src", fullSrc); this.remove();}
					}));
				}
				node.classList.add("bip-container");
				node.firstElementChild.appendChild(_createElement("div", {className: "bip-controls description-3_Ncsb"}, [
					_createElement("div", {className: "bip-zoom downloadLink-2oSgiF", innerHTML: "-",
						onclick() {
							if (script.zoom !== 25) {
								script.zoom -= 25;
							}
							BdApi.clearCSS(`${script.file}-zoom`);
							BdApi.injectCSS(`${script.file}-zoom`, `.bip-container .imageWrapper-2p5ogY.bip-scroller img {zoom: ${script.zoom}%}`);
							this.nextElementSibling.innerHTML = `${script.zoom}%`;
							document.getElementById("bip-zoom").innerHTML = `Zoomed to ${img.width*(script.zoom/100)}px × ${img.height*(script.zoom/100)}px`
						}
					}),
					_createElement("div", {className: "bip-zoom-level", innerHTML: "100%"}),
					_createElement("div", {className: "bip-zoom downloadLink-2oSgiF", innerHTML: "+",
						onclick() {
							script.zoom += 25;
							BdApi.clearCSS(`${script.file}-zoom`);
							BdApi.injectCSS(`${script.file}-zoom`, `.bip-container .imageWrapper-2p5ogY.bip-scroller img {zoom: ${script.zoom}%`);
							this.previousElementSibling.innerHTML = `${script.zoom}%`;
							document.getElementById("bip-zoom").innerHTML = `Zoomed to ${img.width*(script.zoom/100)} × ${img.height*(script.zoom/100)}`
						}
					})
				]));
				container.insertBefore(_createElement("div", {className: "bip-description description-3_Ncsb userSelectText-1o1dQ7", innerHTML: `<span id='bip-info'>Loading...</span><span id='bip-scale' class='bip-toggled'></span><span id='bip-forced' class='bip-toggled'></span><span id='bip-zoom' class='bip-toggled'>Zoomed to ${img.width*(script.zoom/100)} × ${img.height*(script.zoom/100)}</span>`}), container.lastElementChild);
				img.classList.add("bip-center");
				img.style.cssText = "";
				img.onclick = function() {
					this.classList.toggle("bip-center");
					wrapper.classList.toggle("bip-scroller");
					wrapper.classList.toggle("scroller-2FKFPG");
					container.classList.toggle("scrollerWrap-2lJEkd");
					node.classList.toggle("bip-scaling");
					document.getElementById("bip-zoom").classList.toggle("bip-toggled");
				};
				img.onload = function() {
					const scale = 1+parseFloat(script.settings.scale);
					document.getElementById("bip-info").textContent = `${img.naturalWidth}px × ${img.naturalHeight}px`;
					if (this.naturalHeight > window.innerHeight*scale || this.naturalWidth > window.innerWidth*scale) {
						document.getElementById("bip-scale").textContent = `Scaled to ${img.width}px × ${img.height}px`;
						document.getElementById("bip-scale").classList.remove("bip-toggled");
					}
					if (script.settings.minSize) {
						document.getElementById("bip-forced").textContent = `Size forced to minimum '${isNaN(script.settings.width) ? "auto" : `${script.settings.width}px`} × ${isNaN(script.settings.height) ? "auto" : `${script.settings.height}px`}'`;
						document.getElementById("bip-forced").classList.remove("bip-toggled");
					}
				};
				img.onerror = function() {
					this.src = proxy;
					this.onerror = undefined;
				};
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
			_createElement("div", {className: "ops-plugin_wrapper"}, [
				_createElement("h2", {className: "h5-18_1nd title-3sZWYQ marginReset-236NPn height16-2Lv3qA weightSemiBold-NJexzi defaultMarginh5-2mL-bP marginBottom8-AtZOdT", innerHTML: "Settings"}),
				_createElement("div", {className: "plugin-controls"}, settingsFragment)
			]),
			_createElement("div", {className: "flex-1O1GKY justifyAround-1n1pnI"}, [
				_createElement("a", {href: script.discord, target: "_blank", rel:"noreferrer", innerHTML: "<button type='button' class='button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeSmall-2cSMqn grow-q77ONN'>Support (Discord)</button>"}),
				_createElement("a", {href: script.url, target: "_blank", rel:"noreferrer", innerHTML: "<button type='button' class='button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeSmall-2cSMqn grow-q77ONN'>Updates</button>"})
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
			BdApi.injectCSS(script.file, script.css);
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
			this.active = false;
		}
	};
})();
