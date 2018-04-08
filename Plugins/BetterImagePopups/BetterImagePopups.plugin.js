//META{"name":"BetterImagePopups"}*//

/* global bdPluginStorage, BdApi */

const BetterImagePopups = (function() {	// plugin settings
	const script = {
		name: "Better Image Popups",
		file: "BetterImagePopups",
		version: "1.2.4",
		author: "Orrie",
		desc: "Show full sized images in image popup. Zooming is possible if the image is bigger than Discord window size",
		url: "https://github.com/Orrielel/BetterDiscordAddons/tree/master/Plugins/BetterImagePopups",
		raw: "https://raw.githubusercontent.com/Orrielel/BetterDiscordAddons/master/Plugins/BetterImagePopups/BetterImagePopups.plugin.js",
		discord: "https://discord.gg/YEZkpkj",
		check: {
			version: false,
			media: false,
			sadpanda: false,
			chan: false,
			textParser: false
		},
		settings: {fullRes: true, scale: 0.15, debug: false},
		settingsMenu: {
			//          localized                 type     description
			fullRes: ["Full Resolution Images", "check", "Replaces images with full resolution ones whilst in popup mode.<br>Images larger than the visible screen will be clickable for pure native previews with scrolling"],
			scale:   ["Scaling Threshold",      "range", "The maximum threshold between the image and viewport before adding zooming. Default is 15% bigger than viewport"],
			debug:   ["Debug",                  "check", "Displays verbose stuff into the console"]
		},
		css: `
.bip-container .scrollerWrap-2uBjct {display: unset; position: unset; height: unset; min-height: unset; flex: unset;}
.bip-container .imageWrapper-38T7d9 {display: table; margin: 0 auto;}
.bip-container .imageWrapper-38T7d9 img {position: static;}
.bip-container .bip-scroller {display: inline-block; max-height: calc(100vh - 140px); max-width: calc(100vw - 160px); overflow: auto;}
.bip-container .bip-scroller img {margin-bottom: -5px;}
.bip-container .bip-scroller::-webkit-scrollbar-corner {background: rgba(0,0,0,0);}
.bip-container .bip-center {max-height: calc(100vh - 140px); max-width: calc(100vw - 160px);}
.bip-container .bip-actions, .bip-container .bip-description {display: table; margin: 0 auto; user-select: auto;}
.bip-container .downloadLink-wANcd8 {text-transform: capitalize;}
		`
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
	imagePopHandler = function(wrapper) {
		log("info", "imagePop", wrapper);
		const img = wrapper.lastElementChild;
		if (img.src) {
			const proxy = img.src.split("?")[0];
			if (!/\.gif$/.test(proxy)) {
				const fullSrc = /\/external\//.test(proxy) ? proxy.match(/http[s\/\.][\w\.\-\/]+/g)[0].replace(/https\/|http\//,"https://") : proxy;
				wrapper.href = fullSrc;
				wrapper.style.cssText = "";
				wrapper.removeAttribute("target");
				wrapper.nextElementSibling.classList.add("bip-actions");
				img.classList.add("bip-center");
				if (script.settings.fullRes) {
					img.src = fullSrc;
				}
				img.style.cssText = "";
				img.onload = function() {
					const scale = 1+parseFloat(script.settings.scale),
					scaling = this.naturalHeight > window.innerHeight*scale || this.naturalWidth > window.innerWidth*scale,
					html = `${img.naturalWidth}px × ${img.naturalHeight}px${scaling ? ` (scaled to ${img.width}px × ${img.height}px)` : ""}`,
					next = wrapper.nextElementSibling;
					if (!next.classList.contains("bip-description")) {
						wrapper.insertAdjacentHTML("afterend", `<div class='bip-description description-3MVziF'>${html}</div>`);
					}
					else {
						next.innerHTML = html;
					}
					if (scaling) {
						this.addEventListener("click", function() {
							this.classList.toggle("bip-center");
							wrapper.classList.toggle("bip-scroller");
							wrapper.classList.toggle("scroller-fzNley");
							wrapper.parentNode.classList.toggle("scrollerWrap-2uBjct");
						}, false);
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
				_createElement("a", {href: script.discord, target: "_blank", rel:"noreferrer", innerHTML: "<button type='button' class='button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeSmall-3g6RX8 grow-25YQ8u'>Support (Discord)</button>"}),
				_createElement("a", {href: script.url, target: "_blank", rel:"noreferrer", innerHTML: "<button type='button' class='button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeSmall-3g6RX8 grow-25YQ8u'>Updates</button>"})
			])
		]);
	},
	_createElement = function(tag, attributes, children) {
		// element creation
		const element = document.createElement(tag);
		if (attributes) {
			for (let _e_k = Object.keys(attributes), _e=_e_k.length; _e--;) {
				element[_e_k[_e]] = attributes[_e_k[_e]];
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
	return class BetterImagePopups {
		getName() {return script.name;}
		getVersion() {return script.version;}
		getAuthor() {return script.author;}
		getDescription() {return script.desc;}
		// create settings panel
		getSettingsPanel() {
			return createSettingsPanel();
		}
		// load, start and observer
		load() {}
		start() {
			settingsLoad();
			BdApi.injectCSS(script.file, script.css);
			this.active = true;
		}
		observer({addedNodes}) {
			if (addedNodes.length > 0) {
				const node = addedNodes[0];
				if (node.className == "modal-2LIEKY") {
					const wrapper = node.getElementsByClassName("imageWrapper-38T7d9")[0];
					if (wrapper && !node.getElementsByClassName("uploadModal-2KN6Mm")[0]) {
						const wrapperObserver = new MutationObserver(function(mutations) {
							if (mutations[1].addedNodes.length) {
								imagePopHandler(wrapper);
								wrapperObserver.disconnect();
							}
						});
						if (node.getElementsByClassName("imageWrapperInner-BRGZ7A")[0]) {
							wrapperObserver.observe(wrapper,{childList: true});
						}
						else {
							imagePopHandler(wrapper);
						}
						node.classList.add("bip-container");
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

