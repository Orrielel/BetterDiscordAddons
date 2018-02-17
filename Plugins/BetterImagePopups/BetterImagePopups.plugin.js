//META{"name":"BetterImagePopups"}*//

/* global BdApi */

class BetterImagePopups {
	getName() {return "Better Image Popups";}
	getShortName() {return "BetterImagePopups";}
	getDescription() {return "Show full sized images in image popup. Zooming is possible if the image is bigger than Discord window size";}
	getVersion() {return "1.2.2";}
	getAuthor() {return "Orrie";}

	load() {}
	start() {
		BdApi.injectCSS(this.getShortName(), `
.bip-container .scrollerWrap-2uBjct {display: unset; position: unset; height: unset; min-height: unset; flex: unset;}
.bip-container .imageWrapper-38T7d9 {display: table; margin: 0 auto;}
.bip-container .imageWrapper-38T7d9 img {position: static;}
.bip-container .bip-scroller {display: inline-block; max-height: calc(100vh - 140px); max-width: calc(100vw - 160px); overflow: auto;}
.bip-container .bip-scroller img {margin-bottom: -5px;}
.bip-container .bip-scroller::-webkit-scrollbar-corner {background: rgba(0,0,0,0);}
.bip-container .bip-center {max-height: calc(100vh - 140px); max-width: calc(100vw - 160px);}
.bip-container .bip-actions, .bip-container .bip-description {display: table; margin: 0 auto; user-select: auto;}
.bip-container .downloadLink-wANcd8 {text-transform: capitalize;}
		`);
	}
	stop() {
		BdApi.clearCSS(this.getShortName());
	}

	imagePopHandler(wrapper, desc) {
		const img = wrapper.lastElementChild;
		if (img.src) {
			const fullSrc = img.src.split("?")[0];
			if (!/\.gif$/.test(fullSrc)) {
				wrapper.href = fullSrc;
				wrapper.style.cssText = "";
				wrapper.removeAttribute("target");
				wrapper.nextElementSibling.classList.add("bip-actions");
				img.classList.add("bip-center");
				img.src = fullSrc;
				img.style.cssText = "";
				img.onload = function() {
					const overflow = this.naturalHeight > window.innerHeight*1.25,
					html = `${img.naturalWidth}px × ${img.naturalHeight}px${overflow ? ` (scaled to ${img.width}px × ${img.height}px)` : ""}`;
					if (!desc) {
						wrapper.insertAdjacentHTML("afterend", `<div class='bip-description description-3MVziF'>${html}</div>`);
					}
					else {
						desc.innerHTML = html;
					}
					if (overflow) {
						this.addEventListener("click", function() {
							this.classList.toggle("bip-center");
							wrapper.classList.toggle("bip-scroller");
							wrapper.classList.toggle("scroller-fzNley");
							wrapper.parentNode.classList.toggle("scrollerWrap-2uBjct");
						}, false);
					}
				};
			}
		}
	}

	observer({addedNodes}) {
		if (addedNodes.length > 0) {
			const node = addedNodes[0];
			if (node.className == "modal-2LIEKY") {
				const wrapper = node.getElementsByClassName("imageWrapper-38T7d9")[0];
				if (wrapper && !node.getElementsByClassName("uploadModal-2KN6Mm")[0]) {
					const wrapperObserver = new MutationObserver(function(mutations) {
						if (mutations[1].addedNodes.length) {
							this.imagePopHandler(wrapper, node.getElementsByClassName("bip-description")[0]);
							wrapperObserver.disconnect();
						}
					});
					if (node.getElementsByClassName("imageWrapperInner-BRGZ7A")[0]) {
						wrapperObserver.observe(wrapper,{childList: true});
					}
					else {
						this.imagePopHandler(wrapper, node.getElementsByClassName("bip-description")[0]);
					}
					node.classList.add("bip-container");
				}
			}
		}
	}
}
