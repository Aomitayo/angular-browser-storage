'use strict';

/* globals console, describe, beforeEach, afterEach, module, inject, it, expect, browser */
/* jshint camelcase:false */

function testStorageInterface(){
	it('Responds to storage functions', function(){
		expect(this.storage).to.respondTo('getItem');
		expect(this.storage).to.respondTo('setItem');
		expect(this.storage).to.respondTo('removeItem');
		expect(this.storage).to.respondTo('clear');
		expect(this.storage).to.respondTo('key');
		expect(this.storage).to.have.property('length');
	});
}

function testStorageImplementation(){
	var context;
	var pairs = {
		'skey': 'string value',
		'nkey': 78653,
		'arrkey':['asffasdf', 223432, 'dasfads'],
		'objkey': {a:'asdfadsf', b:2432432}
	};
	

	beforeEach(function(){
		context = this;
		angular.forEach(pairs, function(v, k){
			context.storage.setItem(k, v);
		});
	});

	afterEach(function(){
		this.storage.clear();
	});

	it('Should return correct values and types', function(){
		angular.forEach(pairs, function(v, k){
			expect(angular.equals(context.storage.getItem(k),v)).to.be.true;
		});
		
	});

	it('Should remove only the right key', function(){
		context.storage.removeItem('skey');
		expect(context.storage.getItem('skey')).to.be.null;
	});

	it('Length property should reflect correct value', function(){
		angular.forEach(pairs, function(v, k){
			context.storage.setItem(k, v);
		});
		expect(context.storage.length).to.equal(4);
	});

	it('Should Clear all key-value pairs when cleared', function(){
		context.storage.clear();
		angular.forEach(pairs, function(v, k){
			expect(context.storage.getItem(k)).to.be.null;
		});
	});
}

describe('Browser storage', function(){
	beforeEach(function(){
		var context = this;
		module('aomitayo.angular-browser-storage', function(BrowserStorageProvider){
			context.storageProvider = BrowserStorageProvider;
		});
		inject(function(_BrowserStorage_){
			context.storage = _BrowserStorage_.$$local;
		});
	});
	
	it('Storage provider Should have a selectionOrder property', function(){
		expect(this.storageProvider).to.have.property('selectionOrder');
	});

	testStorageInterface();

	testStorageImplementation();
});

describe('BrowserStorage.$$local', function(){
	
	beforeEach(function(){
		var context = this;
		module('aomitayo.angular-browser-storage', function(BrowserStorageProvider){
			context.storageProvider = BrowserStorageProvider;
		});
		inject(function(_BrowserStorage_){
			context.storage = _BrowserStorage_.$$local;
		});
	});

	testStorageInterface();

	testStorageImplementation();
});

describe('BrowserStorage.$$session', function(){	
	beforeEach(function(){
		var context = this;
		module('aomitayo.angular-browser-storage', function(BrowserStorageProvider){
			context.storageProvider = BrowserStorageProvider;
		});
		inject(function(_BrowserStorage_){
			context.storage = _BrowserStorage_.$$session;
		});
	});

	testStorageInterface();

	testStorageImplementation();
});


describe('BrowserStorage.$$cookie', function(){	
	beforeEach(function(){
		var context = this;
		module('aomitayo.angular-browser-storage', function(BrowserStorageProvider){
			context.storageProvider = BrowserStorageProvider;
		});
		inject(function(_BrowserStorage_){
			context.storage = _BrowserStorage_.$$cookie;
		});
	});

	testStorageInterface();

	testStorageImplementation();
});

describe('BrowserStorage.$$memory', function(){	
	beforeEach(function(){
		var context = this;
		module('aomitayo.angular-browser-storage', function(BrowserStorageProvider){
			context.storageProvider = BrowserStorageProvider;
		});
		inject(function(_BrowserStorage_){
			context.storage = _BrowserStorage_.$$memory;
		});
	});

	testStorageInterface();

	testStorageImplementation();
});
