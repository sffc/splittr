// Declare
window.splittr = {};
window.splittr.barBreadth = 5;

// Static Methods
window.splittr.init = function() {
	var splitOptionsRegex = /^(horizontal|vertical) (static|dynamic) ((?:\d+ ?)+)$/;
	window.splittr.util.get(document, function(){
		var rawSplitOptions = this.getAttribute("data-splittr");
		if(!rawSplitOptions) return false;
		var container = this;

		var splitOptionsMatch = splitOptionsRegex.exec(rawSplitOptions);
		if(!splitOptionsMatch){
			throw new Error("Splittr: Invalid options string.  "
				+ "(Read '"+rawSplitOptions+"')");
		}
		var vertical = splitOptionsMatch[1] === "vertical";
		var dynamic = splitOptionsMatch[2] === "dynamic";
		var dimensions = splitOptionsMatch[3].split(" ");

		var barContainer = document.createElement("div");
		barContainer.setAttribute("class", "splittr-bar-container");

		var pos = 0;
		var allBar = [];
		var children = window.splittr.util.children(container, function(idx){
			var panel = this;
			var dim = parseInt(dimensions[idx]) || 0;
			this.collapsible = this.getAttribute("data-splittr-collapsible") !== null;

			if(idx > 0){
				var bar = window.splittr.util.makeBar(vertical, dynamic, pos);
				barContainer.appendChild(bar);
				allBar.push(bar);
				pos += window.splittr.barBreadth;
			}

			if(vertical){
				panel.style.left = pos+"px";
				panel.style.width = dim+"px";
				pos += dim;
			}else{
				panel.style.top = pos+"px";
				panel.style.height = dim+"px";
				pos += dim;
			}
		}, true);
		container.appendChild(barContainer);
		var lastChild = children[children.length-1];
		if(vertical){
			lastChild.style.width = "auto";
			lastChild.style.right = 0;
			lastChild.style.width = lastChild.offsetWidth+"px";
		}else{
			lastChild.style.height = "auto";
			lastChild.style.bottom = 0;
			lastChild.style.height = lastChild.offsetHeight+"px";
		}
		if(dynamic){
			for (var i = allBar.length - 1; i >= 0; i--) {
				var bar = allBar[i];
				var prev = children[i];
				var next = children[i+1];
				window.splittr.util.handleMouseEvents(bar, prev, next, vertical);
				if(prev.collapsible){
					bar.addCollapse(true, vertical, prev, next);
				}
				if(next.collapsible){
					bar.addCollapse(false, vertical, prev, next);
				}
			};
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
};
window.splittr.util.makeBar = function(vertical, dynamic, pos) {
	var bar = document.createElement("div"), barCls = "splittr-bar";
	if(vertical){
		barCls += " splittr-bar-vertical";
		bar.style.width = window.splittr.barBreadth+"px";
		bar.style.left = pos+"px";
	}else{
		barCls += " splittr-bar-horizontal";
		bar.style.height = window.splittr.barBreadth+"px";
		bar.style.top = pos+"px";
	}
	if(dynamic){
		barCls += " splittr-bar-dynamic";
	}
	bar.setAttribute("class", barCls);
	bar.addCollapse = function(previous, vertical, prev, next){
		var handleContainer = document.createElement("div");
		handleContainer.setAttribute("class", "splittr-handle-container");
		var handle = document.createElement("div");
		handle.setAttribute("class",
			previous ? "splittr-handle-prev" : "splittr-handle-next");
		var handleChar = previous ?
			(vertical ? "\u25C0" : "\u25B2"):
			(vertical ? "\u25B6" : "\u25BC");
		handle.appendChild(document.createTextNode(handleChar));
		handle.addEventListener("click", function(event){
			if(previous){
				if(vertical){
					bar.style.left    = (bar.offsetLeft    - prev.offsetWidth )+"px";
					next.style.left   = (bar.offsetLeft    + bar.offsetWidth  )+"px";
					next.style.width  = (next.offsetWidth  + prev.offsetWidth )+"px";
					prev.style.width  = 0;
				}else{
					bar.style.top     = (bar.offsetTop     - prev.offsetHeight)+"px";
					next.style.top    = (bar.offsetTop     + bar.offsetHeight )+"px";
					next.style.height = (next.offsetHeight + prev.offsetHeight)+"px";
					prev.style.height = 0;
				}
			}else{
				if(vertical){
					bar.style.left    = (bar.offsetLeft    + next.offsetWidth )+"px";
					next.style.left   = (next.offsetLeft   + next.offsetWidth )+"px";
					prev.style.width  = (prev.offsetWidth  + next.offsetWidth )+"px";
					next.style.width  = 0;
				}else{
					bar.style.top     = (bar.offsetTop     + next.offsetHeight)+"px";
					next.style.top    = (next.offsetTop    + next.offsetHeight)+"px";
					prev.style.height = (prev.offsetHeight + next.offsetHeight)+"px";
					next.style.height = 0;
				}
			}
			window.splittr.util.dispatchSplitterMove(bar.parentNode.parentNode, prev, next);
			// The "done" event is already fired because of the mouseup catchall
		}, false);
		handleContainer.appendChild(handle);
		bar.appendChild(handleContainer);
	}
	return bar;
};
window.splittr.util.getTotalOffsetTop = function(element){
	var retval = 0;
	do {
		retval += element.offsetTop;
	} while (element = element.offsetParent);
	return retval;
};
window.splittr.util.getTotalOffsetLeft = function(element){
	var retval = 0;
	do {
		retval += element.offsetLeft;
	} while (element = element.offsetParent);
	return retval;
};
window.splittr.util.handleMouseEvents = function(bar, prev, next, vertical){
	var origClientPos = null, origOffsetPos, minDPos, maxDPos,
		origPrevBreadth, origNextBreadth;
	bar.addEventListener("mousedown", function(event){
		event.preventDefault();
		origClientPos = vertical ? event.clientX : event.clientY;
		origOffsetPos = vertical ? bar.offsetLeft : bar.offsetTop;
		origPrevBreadth = vertical ? prev.offsetWidth : prev.offsetHeight;
		origNextBreadth = vertical ? next.offsetWidth : next.offsetHeight;
		minDPos = 0 - origPrevBreadth;
		maxDPos = origNextBreadth;
	}, false);
	window.addEventListener("mousemove", function(event){
		if(origClientPos === null) return;
		event.preventDefault();
		var newPos = vertical ? event.clientX : event.clientY;
		var dPos = newPos - origClientPos;
		if(dPos < minDPos) dPos = minDPos;
		if(dPos > maxDPos) dPos = maxDPos;
		if(vertical){
			bar.style.left   = (origOffsetPos + dPos)+"px";
			prev.style.width = (origPrevBreadth + dPos)+"px";
			next.style.left  = (origOffsetPos + dPos + window.splittr.barBreadth)+"px";
			next.style.width = (origNextBreadth - dPos)+"px";
		}else{
			bar.style.top     = (origOffsetPos + dPos)+"px";
			prev.style.height = (origPrevBreadth + dPos)+"px";
			next.style.top    = (origOffsetPos + dPos + window.splittr.barBreadth)+"px";
			next.style.height = (origNextBreadth - dPos)+"px";
		}
		window.splittr.util.dispatchSplitterMove(next.parentNode, prev, next);
	}, false);
	window.addEventListener("mouseup", function(event){
		if(origClientPos !== null){
			origClientPos = null;
			window.splittr.util.dispatchSplitterDone(next.parentNode, prev, next);
		}
	}, false);
};
window.splittr.util.dispatchSplitterMove = function(elem, prev, next){
	var evnt = document.createEvent("Event");
	evnt.initEvent("splitterMove", false, false);
	evnt.prev = prev;
	evnt.next = next;
	elem.dispatchEvent(evnt);
};
window.splittr.util.dispatchSplitterDone = function(elem, prev, next){
	var evnt = document.createEvent("Event");
	evnt.initEvent("splitterDone", false, false);
	evnt.prev = prev;
	evnt.next = next;
	elem.dispatchEvent(evnt);
};

document.addEventListener("DOMContentLoaded", function() {
	splittr.init();
}, false);