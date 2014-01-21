/**
@fileOverview

@toc

*/

/* globals window:true, document:true*/

'use strict';

function StoreAdapter(store){
	this.store = store;
}

StoreAdapter.prototype = {
	getItem: function(k){
		var v = this.store.getItem(k);
		return v && angular.fromJson(v);
	},
	setItem: function(k, v){
		return this.store.setItem(k, angular.toJson(v));
	},
	removeItem: function(k){
		return this.store.removeItem(k);
	},
	clear: function(){
		return this.store.clear();
	},
	key: function(index){
		return this.store.key(index);
	},
	get length(){
		return this.store.length;
	}
};

function MemoryStorage(){
	this.memory = {};
}

MemoryStorage.prototype = {
	getItem: function(k){return this.memory[k] || null;},
	setItem: function(k, v){this.memory[k] = v; },
	removeItem: function(k){delete this.memory[k];},
	clear: function(){this.memory = {};},
	key: function(index){
		var i = 0;
		angular.forEach(this.memory, function(v, k){
			if(i == index){
				return v;
			}
		});
		throw new Error('memory index out of bounds');
	},
	get length(){
		//todo find a cross browser way to do this;
		return Object.keys(this.memory).length;
	}
};

function CookieStorage(persist){
	this.persist = persist;
	this.keyPrefix = "_ckcst_";
}

CookieStorage.prototype = {
	_setCookie: function(k, v, persist){
		k = this.keyPrefix + k;
		v = encodeURIComponent(v);
		persist = persist && ((new Date().getTime()) + (persist*24*60*60*1000));
		var expires = persist && ('; expires=' + new Date(persist).toGMTString());
		expires = expires || '';
		var cookieString = k + '=' + v + expires + '; path=/';
		document.cookie = cookieString;
	},
	_getCookie: function(k){
		k = this.keyPrefix + k;
		var r = k + '=[^;]+';
		r = new RegExp(r);
		var v = r.exec(document.cookie);
		v = v && decodeURIComponent(v[0].split('=')[1]);
		return v;
	},
	_removeCookie: function(k){
		this._setCookie(k, null, -1);
	},
	_keys: function(){
		var self = this;
		var r  = new RegExp(';?\\s*' + this.keyPrefix + '[^=]+=[^;]*', 'g');
		var pairs = document.cookie.match(r);
		var keys = [];
		angular.forEach(pairs, function(v, k){
			keys.push(v.replace(/^;?\s*/, '').split('=')[0].replace(self.keyPrefix, ''));
		});
		return keys;
	},
	getItem: function(k){
		return this._getCookie(k);
	},
	setItem: function(k, v){
		this._setCookie(k, v, this.persist);
	},
	removeItem: function(k){
		this._removeCookie(k);
	},
	clear: function(){
		var self = this;
		angular.forEach(this._keys(), function(v, k){
			self.removeItem(v);
		});
	},
	key: function(index){
		var k = this._keys()[index];
	},
	get length(){
		return this._keys().length;
	}
};


function BrowserStorage(selectionOrder){
	var self = this;
	self.selectionOrder = selectionOrder;
	self.length = 0;

	self.stores = {};

	self.$$local = self.stores.local = new StoreAdapter(window.localStorage);
	self.$$session = self.stores.session = new StoreAdapter(window.localStorage);
	self.$$cookie = self.stores.cookie = new StoreAdapter(new CookieStorage());
	self.$$memory = self.stores.memory = new MemoryStorage();
}

BrowserStorage.prototype.$inject = ['selectionOrder'];

BrowserStorage.prototype.getStore = function(selectionOrder){
	var self = this;
	selectionOrder = selectionOrder || self.selectionOrder;
	if(!angular.isArray(selectionOrder)){
		throw new Error('BrowserStorage: selectionOrder must be an Array');
	}

	var store;
	for(var i = 0; i<selectionOrder.length; i++){
		store = self.stores[selectionOrder[i]];
		if(store){
			break;
		}
	}
	if(!store){
		throw new Error('BrowserStorage: No store was found');
	}
	return store;
};

BrowserStorage.prototype.getItem = function(key, selectionOrder){
	return this.getStore(selectionOrder).getItem(key);
};

BrowserStorage.prototype.setItem = function(key, value, selectionOrder){
	return this.getStore(selectionOrder).setItem(key, value, selectionOrder);
};

BrowserStorage.prototype.removeItem = function(key, selectionOrder){
	return this.getStore(selectionOrder).removeItem(key);
};

BrowserStorage.prototype.clear = function(selectionOrder){
	return this.getStore(selectionOrder).clear(selectionOrder);
};

BrowserStorage.prototype.key = function(index, selectionOrder){
	return this.getStore(selectionOrder).getItem(index);
};

angular.module('aomitayo.angular-browser-storage', [])
.provider('BrowserStorage', [ function () {
	var provider = {
		selectionOrder:['session', 'local', 'cookie', 'memory'],
		$get: ['$injector', function($injector){
			return $injector.instantiate(BrowserStorage, {selectionOrder: this.selectionOrder});
		}]
	};
	return provider;
}]);