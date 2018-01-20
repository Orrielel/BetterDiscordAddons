//META{"name":"BetterImagePopups"}*//

/* global BdApi */

class BetterImagePopups {
	getName() {return "Better Image Popups";}
	getShortName() {return "BetterImagePopups";}
	getDescription() {return "Show full sized images in image popup";}
	getVersion() {return "1.0.7";}
	getAuthor() {return "Orrie";}

	load() {}
	start(){
		BdApi.injectCSS(this.getShortName(), `
.bip-container .scrollerWrap-2uBjct {display: unset; position: unset; height: unset; min-height: unset; flex: unset;}
.bip-container .bip-scroller {max-height: calc(100vh - 120px); max-width: calc(100vw - 160px); overflow-y: scroll; margin-bottom: 3px;}
.bip-container .bip-scroller img {margin-bottom: -5px;}
.bip-container .bip-center {max-height: calc(100vh - 120px); max-width: calc(100vw - 160px);}
.bip-container .bip-actions {display: table; margin: 0 auto;}
.bip-container .downloadLink-wANcd8 {text-transform: capitalize;}
.bip-container .image.image-loading {opacity: 0.9;}
.bip-container .image.image-loading::before {background: transparent;}
		`);
	}
	stop(){
		BdApi.clearCSS(this.getShortName());
	}

	observer({addedNodes}) {
		if (addedNodes.length > 0 && addedNodes[0].className == "modal-2LIEKY") {
			const img = addedNodes[0].getElementsByTagName("IMG")[0];
			if (img.src) {
				const fullSrc = img.src.split("?")[0],
				wrapper = img.parentNode;
				addedNodes[0].classList.add("bip-container");
				wrapper.href = fullSrc;
				wrapper.style.cssText = "";
				wrapper.removeAttribute("target");
				wrapper.nextElementSibling.classList.add("bip-actions");
				img.classList.add("bip-center");
				img.src = fullSrc;
				img.style.cssText = "";
				img.onload = function(){
					if (this.naturalHeight > window.innerHeight*1.35) {
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
}
