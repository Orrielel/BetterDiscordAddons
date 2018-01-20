//META{"name":"BetterImagePopups"}*//

/* global BdApi */

class BetterImagePopups {
	getName() {return "Better Image Popups";}
	getShortName() {return "BetterImagePopups";}
	getDescription() {return "Show full sized images in image popup";}
	getVersion() {return "1.0.5";}
	getAuthor() {return "Orrie";}

	load() {}
	start(){
		BdApi.injectCSS(this.getShortName(), `
.modal-2LIEKY .scrollerWrap-2uBjct {display: unset; position: unset; height: unset; min-height: unset; flex: unset;}
.modal-2LIEKY .bip-scroller {max-height: calc(100vh - 120px); max-width: calc(100vw - 160px); overflow-y: scroll; margin-bottom: 3px;}
.modal-2LIEKY .bip-scroller img {margin-bottom: -5px;}
.modal-2LIEKY .bip-center {max-height: calc(100vh - 120px); max-width: calc(100vw - 160px);}
.modal-2LIEKY .bip-actions {display: table; margin: 0 auto;}
.modal-2LIEKY .downloadLink-wANcd8 {text-transform: capitalize;}
.modal-2LIEKY .image.image-loading {opacity: 0.9;}
.modal-2LIEKY .image.image-loading::before {background: transparent;}
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
