// Declare
window.splittr = {};
window.splittr.barBreadth = 5;

// Static Methods
window.splittr.init = function() {
	var splitOptionsRegex = /^(horizontal|vertical) (static|dynamic) ((?:\d+ ?)+)$/;
	window.splittr.util.get(document, function(){
		var rawSplitOptions = this.getAttribute("data-split");
		if(!rawSplitOptions) return false;
		var container = this;

		var splitOptionsMatch = splitOptionsRegex.exec(rawSplitOptions);
		if(!splitOptionsMatch){
			throw new Error("Splittr: Invalid options string.  "
				+ "(Read '"+rawSplitOptions+"')");
		}
		var vertical = splitOptionsMatch[1] === "vertical";
		var static = splitOptionsMatch[1] === "static";
		var dimensions = splitOptionsMatch[3].split(" ");

		var pos = 0;
		var children = window.splittr.util.children(container, function(idx){
			var panel = this;
			var dim = parseInt(dimensions[idx]) || 0;

			if(idx > 0){
				var bar = window.splittr.util.makeBar(vertical);
				if(vertical){
					bar.style.left = pos+"px";
				}else{
					bar.style.top = pos+"px";
				}
				container.insertBefore(bar, panel);
				pos += window.splittr.barBreadth;
			}

			if(vertical){
				panel.style.width = dim+"px";
				panel.style.left = pos+"px";
				pos += dim;
			}else{
				panel.style.height = dim+"px";
				panel.style.top = pos+"px";
				pos += dim;
			}
		}, true);
		if(vertical){
			children[children.length-1].style.width	 = "auto";
		}else{
			children[children.length-1].style.height = "auto";
		}
	}, false);
};

window.splittr.util = {};
window.splittr.util.copy = function(orig){
	var newArr = [];
	for(var i in orig){
		if(orig.hasOwnProperty(i)){
			newArr.push(orig[i]);
		}
	}
	return newArr;
}
window.splittr.util._elements = function(elements, fn){
	var filtered = [];
	var idx = 0;
	for(var i in elements){
		if(elements.hasOwnProperty(i)){
			var elem = elements[i];
			if(elem.nodeType === 1){
				if(!fn || fn.call(elem, idx++)!==false){
					filtered.push(elem);
				}
			}
		}
	}
	return filtered;
}
window.splittr.util.get = function(parent, fn, copy){
	var elements = parent.getElementsByTagName("*");
	if(copy) elements = window.splittr.util.copy(elements);
	return window.splittr.util._elements(elements, fn);
};
window.splittr.util.children = function(parent, fn, copy){
	var elements = parent.childNodes;
	if(copy) elements = window.splittr.util.copy(elements);
	return window.splittr.util._elements(elements, fn);
}
window.splittr.util.makeBar = function(vertical, pos) {
	var bar = document.createElement("div"), barCls;
	if(vertical){
		bar.setAttribute("class", "splittr-bar splittr-bar-vertical");
		bar.style.width = window.splittr.barBreadth+"px";
	}else{
		bar.setAttribute("class", "splittr-bar splittr-bar-horizontal");
		bar.style.height = window.splittr.barBreadth+"px";
	}
	return bar;
};


document.addEventListener("DOMContentLoaded", function() {
	splittr.init();
}, false);