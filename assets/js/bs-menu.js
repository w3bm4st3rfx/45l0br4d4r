(function(){
'use strict';

var TRANSITION_END='transitionend';
function getTransitionDurationFromElement(el){
if(!el)return 0;
var s=window.getComputedStyle(el);
var dur=Number.parseFloat(s.transitionDuration)||0;
var del=Number.parseFloat(s.transitionDelay)||0;
if(!dur&&!del)return 0;
dur=s.transitionDuration.split(',')[0];
del=s.transitionDelay.split(',')[0];
return(Number.parseFloat(dur)+Number.parseFloat(del))*1000+5;
}
function triggerTransitionEnd(el){
el.dispatchEvent(new Event(TRANSITION_END));
}
function reflow(el){
el.offsetHeight;
}
function executeAfterTransition(cb,el,waitForTransition){
if(waitForTransition===undefined)waitForTransition=true;
if(!waitForTransition){cb();return;}
var duration=getTransitionDurationFromElement(el);
var called=false;
function handler(e){
if(e.target!==el)return;
called=true;
el.removeEventListener(TRANSITION_END,handler);
cb();
}
el.addEventListener(TRANSITION_END,handler);
setTimeout(function(){if(!called)triggerTransitionEnd(el);},duration);
}

function isElement(obj){
if(!obj||typeof obj!=='object')return false;
if(typeof obj.jquery!=='undefined')obj=obj[0];
return typeof obj.nodeType!=='undefined';
}
function getElement(obj){
if(isElement(obj))return obj.jquery?obj[0]:obj;
if(typeof obj==='string'&&obj.length>0)return document.querySelector(obj);
return null;
}

function getSelector(el){
var sel=el.getAttribute('data-bs-target');
if(!sel||sel==='#'){
var href=el.getAttribute('href');
if(!href||(!href.includes('#')&&!href.startsWith('.')))return null;
if(href.includes('#')&&!href.startsWith('#'))href='#'+href.split('#')[1];
sel=href&&href!=='#'?href.trim():null;
}
return sel;
}
function getSelectorFromElement(el){
var sel=getSelector(el);
return sel&&document.querySelector(sel)?sel:null;
}
function getElementFromSelector(el){
var sel=getSelector(el);
return sel?document.querySelector(sel):null;
}

var UID_KEY=1;
var HANDLERS={};
var NATIVE_EVENTS=new Set([
'click','dblclick','mouseup','mousedown','contextmenu',
'mouseover','mouseout','mousemove','keydown','keypress','keyup',
'touchstart','touchmove','touchend','touchcancel',
'focus','blur','change','reset','select','submit',
'focusin','focusout','load','unload','resize','scroll',
'DOMContentLoaded','readystatechange'
]);
function normalizeEventType(type){
var legacyMap={mouseenter:'mouseover',mouseleave:'mouseout'};
type=type.replace(/\..*/,'');
return legacyMap[type]||type;
}
function getUid(handler,eventName){
if(eventName)return(eventName||'')+'::'+(UID_KEY++);
return handler.uidEvent||(UID_KEY++);
}
function getHandlerStore(el){
var uid=getUid(el);
el.uidEvent=uid;
HANDLERS[uid]=HANDLERS[uid]||{};
return HANDLERS[uid];
}
function findExistingHandler(storeForType,handler,delegationSel){
return Object.values(storeForType).find(function(h){
return h.originalHandler===handler&&h.delegationSelector===delegationSel;
});
}
function addHandler(el,eventName,handler,delegationSel,oneOff){
if(typeof eventName!=='string'||!el)return;
var isDelegated=typeof handler==='string';
if(isDelegated){
var tmp=delegationSel;delegationSel=handler;handler=tmp;
}
var realType=normalizeEventType(eventName);
if(!NATIVE_EVENTS.has(realType))realType=eventName;
var store=getHandlerStore(el);
var typeStore=store[realType]=store[realType]||{};
var existing=findExistingHandler(typeStore,handler,isDelegated?delegationSel:null);
if(existing){existing.oneOff=existing.oneOff&&oneOff;return;}
var uidEvent=getUid(handler,eventName.replace(/[^.]*(?=\..*)\.|\..*/g,''));
var wrappedHandler;
if(isDelegated){
wrappedHandler=(function(el,sel,fn){
return function delegateHandler(e){
var targets=el.querySelectorAll(sel);
for(var target=e.target;target&&target!==el;target=target.parentNode){
for(var i=0;i<targets.length;i++){
if(targets[i]===target){
e.delegateTarget=target;
if(delegateHandler.oneOff)EventHandler.off(el,e.type,sel,fn);
return fn.apply(target,[e]);
}
}
}
};
})(el,delegationSel,handler);
}else{
wrappedHandler=(function(el,fn){
return function boundHandler(e){
e.delegateTarget=el;
if(boundHandler.oneOff)EventHandler.off(el,e.type,fn);
return fn.apply(el,[e]);
};
})(el,handler);
}
wrappedHandler.delegationSelector=isDelegated?delegationSel:null;
wrappedHandler.originalHandler=handler;
wrappedHandler.oneOff=oneOff;
wrappedHandler.uidEvent=uidEvent;
typeStore[uidEvent]=wrappedHandler;
el.addEventListener(realType,wrappedHandler,isDelegated);
}
function removeHandler(el,store,type,handler,delegationSel){
var existing=findExistingHandler(store[type]||{},handler,delegationSel);
if(!existing)return;
el.removeEventListener(type,existing,Boolean(delegationSel));
delete store[type][existing.uidEvent];
}
var EventHandler={
on:function(el,event,handler,delegationSel){
addHandler(el,event,handler,delegationSel,false);
},
one:function(el,event,handler,delegationSel){
addHandler(el,event,handler,delegationSel,true);
},
off:function(el,event,handler,delegationSel){
if(typeof event!=='string'||!el)return;
var isDelegated=typeof handler==='string';
if(isDelegated){var tmp=delegationSel;delegationSel=handler;handler=tmp;}
var realType=normalizeEventType(event);
if(!NATIVE_EVENTS.has(realType))realType=event;
var store=getHandlerStore(el);
if(handler!==undefined){
if(!store||!store[realType])return;
removeHandler(el,store,realType,handler,isDelegated?delegationSel:null);
return;
}
var typeStore=store[realType]||{};
Object.keys(typeStore).forEach(function(uidEvent){
var h=typeStore[uidEvent];
removeHandler(el,store,realType,h.originalHandler,h.delegationSelector);
});
},
trigger:function(el,event,extraProps){
if(typeof event!=='string'||!el)return null;
var e=new Event(event,{bubbles:true,cancelable:true});
if(extraProps){
Object.keys(extraProps).forEach(function(k){
Object.defineProperty(e,k,{get:function(){return extraProps[k];}});
});
}
el.dispatchEvent(e);
return e;
}
};

var DATA_MAP=new Map();
var Data={
set:function(el,key,instance){
if(!DATA_MAP.has(el))DATA_MAP.set(el,new Map());
DATA_MAP.get(el).set(key,instance);
},
get:function(el,key){
return(DATA_MAP.has(el)&&DATA_MAP.get(el).get(key))||null;
},
remove:function(el,key){
if(!DATA_MAP.has(el))return;
var m=DATA_MAP.get(el);
m.delete(key);
if(m.size===0)DATA_MAP.delete(el);
}
};

function normalizeData(val){
if(val==='true')return true;
if(val==='false')return false;
if(val===Number(val).toString())return Number(val);
if(val===''||val==='null')return null;
if(typeof val!=='string')return val;
try{return JSON.parse(decodeURIComponent(val));}catch(e){return val;}
}
function toDashCase(str){
return str.replace(/[A-Z]/g,function(c){return '-'+c.toLowerCase();});
}
var Manipulator={
getDataAttribute:function(el,key){
return normalizeData(el.getAttribute('data-bs-'+toDashCase(key)));
},
getDataAttributes:function(el){
if(!el)return{};
var result={};
Object.keys(el.dataset)
.filter(function(k){return k.startsWith('bs')&&!k.startsWith('bsConfig');})
.forEach(function(k){
var key=k.replace(/^bs/,'');
key=key.charAt(0).toLowerCase()+key.slice(1);
result[key]=normalizeData(el.dataset[k]);
});
return result;
}
};

var SelectorEngine={
find:function(sel,parent){
parent=parent||document.documentElement;
return[].concat(Array.prototype.slice.call(parent.querySelectorAll(sel)));
},
findOne:function(sel,parent){
parent=parent||document.documentElement;
return parent.querySelector(sel);
}
};

function BaseComponent(el,config){
el=getElement(el);
if(!el)return;
this._element=el;
this._config=this._getConfig(config||{});
Data.set(el,this.constructor.DATA_KEY,this);
}
BaseComponent.prototype._getConfig=function(config){
var dataAttrs=Manipulator.getDataAttributes(this._element);
var merged=Object.assign({},this.constructor.Default||{},dataAttrs,
typeof config==='object'?config:{});
return merged;
};
BaseComponent.prototype.dispose=function(){
Data.remove(this._element,this.constructor.DATA_KEY);
EventHandler.off(this._element,this.constructor.EVENT_KEY);
var self=this;
Object.getOwnPropertyNames(this).forEach(function(k){self[k]=null;});
};
BaseComponent.prototype._queueCallback=function(cb,el,waitForTransition){
executeAfterTransition(cb,el,waitForTransition);
};
BaseComponent.getInstance=function(el){
return Data.get(getElement(el),this.DATA_KEY);
};
BaseComponent.getOrCreateInstance=function(el,config){
return this.getInstance(el)||new this(el,typeof config==='object'?config:null);
};

var COLLAPSE_TOGGLE_SELECTOR='[data-bs-toggle="collapse"]';
function Collapse(el,config){
BaseComponent.call(this,el,config);
this._isTransitioning=false;
this._triggerArray=[];
var toggles=SelectorEngine.find(COLLAPSE_TOGGLE_SELECTOR);
for(var i=0;i<toggles.length;i++){
var t=toggles[i];
var sel=getSelectorFromElement(t);
var targets=sel?SelectorEngine.find(sel):[];
for(var j=0;j<targets.length;j++){
if(targets[j]===this._element){
this._triggerArray.push(t);
break;
}
}
}
this._initializeChildren();
if(!this._config.parent){
this._addAriaAndCollapsedClass(this._triggerArray,this._isShown());
}
if(this._config.toggle)this.toggle();
}
Collapse.prototype=Object.create(BaseComponent.prototype);
Collapse.prototype.constructor=Collapse;
Collapse.Default={toggle:true,parent:null};
Collapse.DefaultType={toggle:'boolean',parent:'(null|element)'};
Collapse.DATA_KEY='bs.collapse';
Collapse.EVENT_KEY='.bs.collapse';
Collapse.prototype._getConfig=function(config){
var dataAttrs=Manipulator.getDataAttributes(this._element);
var merged=Object.assign({},Collapse.Default,dataAttrs,
typeof config==='object'?config:{});
merged.toggle=Boolean(merged.toggle);
merged.parent=getElement(merged.parent);
return merged;
};
Collapse.prototype.toggle=function(){
this._isShown()?this.hide():this.show();
};
Collapse.prototype.show=function(){
if(this._isTransitioning||this._isShown())return;
var self=this;
var actives=[];
if(this._config.parent){
var firstLevelCollapsing=this._getFirstLevelChildren('.collapse.show,.collapse.collapsing')
.filter(function(el){return el!==self._element;})
.map(function(el){return Collapse.getOrCreateInstance(el,{toggle:false});});
actives=firstLevelCollapsing;
}
if(actives.length&&actives[0]._isTransitioning)return;
var showEvent=EventHandler.trigger(this._element,'show.bs.collapse');
if(showEvent.defaultPrevented)return;
actives.forEach(function(a){a.hide();});
var dimension=this._getDimension();
this._element.classList.remove('collapse');
this._element.classList.add('collapsing');
this._element.style[dimension]=0;
this._addAriaAndCollapsedClass(this._triggerArray,true);
this._isTransitioning=true;
var scrollProp='scroll'+dimension[0].toUpperCase()+dimension.slice(1);
this._queueCallback(function(){
self._isTransitioning=false;
self._element.classList.remove('collapsing');
self._element.classList.add('collapse','show');
self._element.style[dimension]='';
EventHandler.trigger(self._element,'shown.bs.collapse');
},this._element,true);
this._element.style[dimension]=this._element[scrollProp]+'px';
};
Collapse.prototype.hide=function(){
if(this._isTransitioning||!this._isShown())return;
var self=this;
var hideEvent=EventHandler.trigger(this._element,'hide.bs.collapse');
if(hideEvent.defaultPrevented)return;
var dimension=this._getDimension();
this._element.style[dimension]=this._element.getBoundingClientRect()[dimension]+'px';
reflow(this._element);
this._element.classList.add('collapsing');
this._element.classList.remove('collapse','show');
this._triggerArray.forEach(function(t){
var target=getElementFromSelector(t);
if(target&&!self._isShown(target)){
self._addAriaAndCollapsedClass([t],false);
}
});
this._isTransitioning=true;
this._element.style[dimension]='';
this._queueCallback(function(){
self._isTransitioning=false;
self._element.classList.remove('collapsing');
self._element.classList.add('collapse');
EventHandler.trigger(self._element,'hidden.bs.collapse');
},this._element,true);
};
Collapse.prototype._isShown=function(el){
return(el||this._element).classList.contains('show');
};
Collapse.prototype._getDimension=function(){
return this._element.classList.contains('collapse-horizontal')?'width':'height';
};
Collapse.prototype._initializeChildren=function(){
if(!this._config.parent)return;
var self=this;
var firstLevel=this._getFirstLevelChildren(COLLAPSE_TOGGLE_SELECTOR);
firstLevel.forEach(function(t){
var target=getElementFromSelector(t);
if(target)self._addAriaAndCollapsedClass([t],self._isShown(target));
});
};
Collapse.prototype._getFirstLevelChildren=function(sel){
var parent=this._config.parent;
var nestedCollapsibles=SelectorEngine.find(':scope .collapse .collapse',parent);
return SelectorEngine.find(sel,parent).filter(function(el){
return!nestedCollapsibles.includes(el);
});
};
Collapse.prototype._addAriaAndCollapsedClass=function(triggers,isOpen){
triggers.forEach(function(t){
t.classList.toggle('collapsed',!isOpen);
t.setAttribute('aria-expanded',isOpen);
});
};
Collapse.getInstance=function(el){return Data.get(getElement(el),Collapse.DATA_KEY);};
Collapse.getOrCreateInstance=function(el,config){
return Collapse.getInstance(el)||new Collapse(el,typeof config==='object'?config:null);
};

EventHandler.on(document,'click.bs.collapse.data-api',COLLAPSE_TOGGLE_SELECTOR,function(e){
if(e.target.tagName==='A'||(e.delegateTarget&&e.delegateTarget.tagName==='A')){
e.preventDefault();
}
var sel=getSelectorFromElement(this);
var targets=SelectorEngine.find(sel);
targets.forEach(function(target){
Collapse.getOrCreateInstance(target,{toggle:false}).toggle();
});
});

window.bootstrap=window.bootstrap||{};
window.bootstrap.Collapse=Collapse;
})();