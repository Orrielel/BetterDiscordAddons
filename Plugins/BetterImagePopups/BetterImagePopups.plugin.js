//META{"name":"BetterImagePopups"}*//

/* global BdApi */

class BetterImagePopups {
	getName() {return "Better Image Popups";}
	getShortName() {return "BetterImagePopups";}
	getDescription() {return "Show full sized images in image popup. Zooming is possible if the image is bigger than the size of Discord";}
	getVersion() {return "1.1.1";}
	getAuthor() {return "Orrie";}

	load() {}
	start(){
		BdApi.injectCSS(this.getShortName(), `
.bip-container .scrollerWrap-2uBjct {display: unset; position: unset; height: unset; min-height: unset; flex: unset;}
.bip-container .imageWrapper-38T7d9 {display: table; margin: 0 auto;}
.bip-container .bip-scroller {display: inline-block; max-height: calc(100vh - 140px); max-width: calc(100vw - 160px); overflow: auto;}
.bip-container .bip-scroller img {margin-bottom: -5px;}
.bip-container .bip-scroller::-webkit-scrollbar-corner {background: rgba(0,0,0,0);}
.bip-container .bip-center {max-height: calc(100vh - 140px); max-width: calc(100vw - 160px);}
.bip-container .bip-actions {display: table; margin: 0 auto; user-select: auto;}
.bip-container .downloadLink-wANcd8 {text-transform: capitalize;}
		`);
	}
	stop(){
		BdApi.clearCSS(this.getShortName());
	}

	observer({addedNodes}) {
		if (addedNodes.length > 0 && document.getElementsByClassName("messages")) {
			const node = addedNodes[0];
			if (node.classList && (node.classList.contains("modal-2LIEKY") || node.classList.contains("imageWrapper-38T7d9"))) {
				const img = node.getElementsByClassName("imageWrapper-38T7d9")[0] && !node.getElementsByClassName("uploadModal-2KN6Mm")[0] ? node.getElementsByClassName("imageWrapper-38T7d9")[0].lastElementChild : (node.className == "imageWrapper-38T7d9" ? node.lastElementChild : false);
				if (!img.classList.contains("imagePlaceholder-jWw28v") && img.src) {
					const fullSrc = img.src.split("?")[0],
					wrapper = img.parentNode;
					wrapper.href = fullSrc;
					wrapper.style.cssText = "";
					wrapper.removeAttribute("target");
					wrapper.nextElementSibling.classList.add("bip-actions");
					img.classList.add("bip-center");
					img.src = fullSrc;
					img.style.cssText = "";
					img.onload = function(){
						wrapper.insertAdjacentHTML("afterend", `<div class='bip-actions description-3MVziF'>${img.naturalWidth}px × ${img.naturalHeight}px${this.naturalHeight > window.innerHeight*1.25 ? ` (scaled to ${img.width}px × ${img.height}px)</div>` : ""}`);
						if (this.naturalHeight > window.innerHeight*1.25) {
							this.addEventListener("click", function() {
								this.classList.toggle("bip-center");
								wrapper.classList.toggle("bip-scroller");
								wrapper.classList.toggle("scroller-fzNley");
								wrapper.parentNode.classList.toggle("scrollerWrap-2uBjct");
							}, false);
						}
					};
					if (node.className == "imageWrapper-38T7d9") {
						node.closest(".modal-2LIEKY").classList.add("bip-container");
					}
					else {
						node.classList.add("bip-container");
					}
				}
			}
		}
	}
}
