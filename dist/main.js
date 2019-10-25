/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/req/src/req.js":
/*!*************************************!*\
  !*** ./node_modules/req/src/req.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Req; });\nclass Req{\r\n\r\n    constructor(config){\r\n        this.config = Object.assign({\r\n            url: '',\r\n            method: 'GET',\r\n            maxRequestTime: 10000,\r\n            maxTries: 10,\r\n            wait: false, // wait request returns before sending another\r\n            debug: false,\r\n\r\n            // callback\r\n            onDo: null,\r\n            onEmptyValue: null\r\n\r\n        }, config)\r\n\r\n        this.config.method = this.config.method.toUpperCase()\r\n        this.log(this)\r\n    }\r\n\r\n    do(initialData){\r\n        if(this.config.wait && this.running) {\r\n            this.log('process already running')\r\n            return false;\r\n        }\r\n\r\n        var self = this\r\n        this.tries = 1\r\n        var reqT0 = Date.now()\r\n        this.tStart = Date.now()\r\n\r\n        this.config.datas = initialData\r\n\r\n        return new Promise((resolve, reject)=>{\r\n            reqdo(initialData)\r\n\r\n            function reqdo(initData){\r\n                let req = new XMLHttpRequest()\r\n\r\n                if(self.config.method == 'POST') req.open('POST', self.config.url, true)\r\n                else req.open('GET', self.config.url + self.getDataUrl(initData), true)\r\n                // req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')\r\n\r\n                req.onreadystatechange = function(){\r\n                    if (this.readyState === XMLHttpRequest.DONE) {\r\n                        self.running = false\r\n                        if (this.status === 200) {\r\n                            self.data = this.responseText\r\n                            self.json = (self.isJsonString(this.responseText)) ? JSON.parse(this.responseText) : this.responseText;\r\n                            self.time = Date.now() - self.tStart\r\n                            resolve(self)\r\n\r\n                            if(!JSON.parse(self.data).length) self.handleEmptyValue()\r\n\r\n                        } else if(this.status) {\r\n                            if(self.config.debug) console.warn(self, this.status, this.statusText)\r\n                            reject(this.status, this.statusText)\r\n                        } else if(self.tries >= self.config.maxTries){\r\n                            reject('Req:', \"Max request tries reached.\");\r\n                        }else{\r\n                            self.log(self.config.url, 'aborted');\r\n                        }\r\n                    }\r\n                }\r\n\r\n                let data = null\r\n                if(self.config.method == 'POST') data = self.getFormData(initData)\r\n                req.send(data)\r\n\r\n                self.running = true\r\n                self.handleDo()\r\n\r\n                setTimeout(()=>{\r\n                    //retry\r\n                    if( !req.status ) {\r\n                        if(self.config.debug) console.warn(self.config.url, initialData, 'no response after config max request time (' + self.config.maxRequestTime + 'ms), retrying... ('+ self.tries +'/'+ self.config.maxTries +')')\r\n                        self.tries++;\r\n                        req.abort()\r\n                        self.running = false\r\n                        if( self.tries < self.config.maxTries ) reqdo(initData)\r\n                        else reject('Req:', \"Max request tries reached.\")\r\n                    }\r\n                }, self.config.maxRequestTime)\r\n            }\r\n\r\n        });\r\n    }\r\n\r\n    getFormData(data){\r\n        let formData = new FormData();\r\n        for (let name in data){\r\n            let value = data[name]\r\n            formData.append(name, value);\r\n        }\r\n        return formData;\r\n    }\r\n    getDataUrl(datas){\r\n      let dataArr = []\r\n      for(let data in datas){\r\n        dataArr.push( data + '=' + datas[data])\r\n      }\r\n      return '?' + dataArr.join('&');\r\n    }\r\n\r\n    log(){\r\n        if(this.config.debug) console.log('Req', ...arguments)\r\n    }\r\n\r\n    handleDo(){\r\n        if(this.config.onDo) this.config.onDo(this)\r\n        this.log('new call')\r\n    }\r\n    handleEmptyValue(){\r\n        if(this.config.onEmptyValue) this.config.onEmptyValue(this)\r\n        this.log('already received empty value')\r\n    }\r\n\r\n    isJsonString(str){\r\n      try {\r\n        JSON.parse(str);\r\n      } catch (e) {\r\n          return false;\r\n      }\r\n      return true;\r\n    }\r\n}\r\n\r\nwindow.Req = Req\r\n\n\n//# sourceURL=webpack:///./node_modules/req/src/req.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _wedb_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./wedb.js */ \"./src/wedb.js\");\n\r\n\r\ndocument.addEventListener('DOMContentLoaded', ()=>{\r\n  window.wedb = new _wedb_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"]({\r\n    selectors: {\r\n      title: {\r\n        selector: 'div > div.columns-container > div.container > div.row > div.center_column.col-xs-12.col-sm-12 > div > div.primary_block.row > div.pb-center-column.col-xs-12.col-sm-4 > h1'\r\n      },\r\n      price: {\r\n        selector: 'div > div.columns-container > div.container > div.row > div.center_column.col-xs-12.col-sm-12 > div > div.primary_block.row > div.pb-right-column.col-xs-12.col-sm-4.col-md-3 > form > div.box-info-product > div.content_prices.clearfix > div > p.our_price_display > span.price'\r\n      }\r\n    },\r\n    bannedTags: 'script,link'\r\n  })\r\n})\r\n\r\n\r\n\r\nHTMLElement.prototype.selector = function(){\r\n  let element = this;\r\n  let selector = ''\r\n  while(element && element != document.body){\r\n    let elSelector = element.tagName.toLowerCase()\r\n    if(element.className.length){\r\n      let classes = element.className.split(' ')\r\n      classes.map(elclass => {if(elclass.length) elSelector+=\".\"+elclass} )\r\n    }\r\n    selector = (selector.length) ? elSelector + ' > ' + selector : elSelector\r\n    element = element.parentElement\r\n  }\r\n  return selector;\r\n}\r\n\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ }),

/***/ "./src/wedb.js":
/*!*********************!*\
  !*** ./src/wedb.js ***!
  \*********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Wedb; });\n/* harmony import */ var req__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! req */ \"./node_modules/req/src/req.js\");\n\r\n\r\nclass Wedb{\r\n  constructor(config){\r\n    this.setConfig({\r\n      url: '', // entrypoint for crawl\r\n      path: '', // base url for entities\r\n      bannedElement: [], // selectors\r\n      crawlDepth: 1\r\n    })\r\n    this.setConfig(config)\r\n    this.init()\r\n  }\r\n\r\n  setConfig(config){\r\n    if(!this.config) this.config = {}\r\n    this.config = Object.assign(this.config, config)\r\n  }\r\n\r\n  init(){\r\n    this.getScript = new req__WEBPACK_IMPORTED_MODULE_0__[\"default\"]({url: './services/get.php', method: 'post'})\r\n    this.urls = []\r\n    this.bufferedUrls = []\r\n    this.entities = []\r\n    this.content = []\r\n    this.fakedom = document.createElement('div')\r\n    document.body.appendChild(this.fakedom)\r\n    this.fakedom.style.display = 'none'\r\n  }\r\n\r\n  crawl(url){\r\n    if(url) this.config.path = url;\r\n    let currentUrl = url || this.getNextUrl()\r\n    if(currentUrl) this.get(currentUrl)\r\n    .then((req)=>{\r\n      let html = req.json\r\n      this.extractLinks(html)\r\n      let content = this.extractContent(html)\r\n      this.content.push(content + '\\n' + currentUrl)\r\n      // console.log(content, currentUrl)\r\n    })\r\n    .finally(()=>{\r\n      console.log(currentUrl, this.bufferedUrls.length)\r\n      this.removeNextUrl()\r\n      this.crawl()\r\n    })\r\n    else console.log(this.content.join('\\n____________________\\n'))\r\n  }\r\n  get(url){\r\n    return this.getScript.do({url: url})\r\n  }\r\n\r\n  extractLinks(html){\r\n    this.fakedom.innerHTML = html\r\n    let links = [].slice.call(this.fakedom.querySelectorAll('a'))\r\n    links.map( link => {\r\n      if( link.href.split(this.config.path).length > 1 ) this.addUrl(link.href)\r\n    })\r\n    this.fakedom.innerHTML = ''\r\n  }\r\n  extractContent(html){\r\n    this.fakedom.innerHTML = html\r\n    let content = {}\r\n    let bannedTags = [...this.fakedom.querySelectorAll(this.config.bannedTags)]\r\n    bannedTags.map(tag => {\r\n      tag.remove()\r\n    })\r\n\r\n    for(let key in this.config.selectors){\r\n      let selector = this.config.selectors[key]\r\n      let extract = this.fakedom.querySelector(selector.selector)\r\n      if(extract) {\r\n        let txt = ''\r\n        let contentValue = extract.innerText\r\n        if(selector.attr) contentValue = extract.getAttribute(selector.attr)\r\n        contentValue.split(' ').map( word => { if(word.length) txt += ' '+word } )\r\n        txt = txt.replace(/\\n\\:/g, ' :').replace(/\\n /g, '\\n').replace(/\\n\\n/g, '\\n')\r\n        content[key] = txt\r\n      }\r\n    }\r\n    if(content.title && content.price) document.body.innerHTML += content.title + ' ' + content.price + '<br>'\r\n\r\n    this.fakedom.innerHTML = ''\r\n    return content;\r\n  }\r\n\r\n  addUrl(url){\r\n    if(!this.urls.includes(url)) {\r\n      this.bufferedUrls.push(url)\r\n      this.urls.push(url)\r\n    }\r\n    else return false\r\n  }\r\n  getNextUrl(url){\r\n    return this.bufferedUrls[0]\r\n  }\r\n  removeNextUrl(){\r\n    this.bufferedUrls.splice(0, 1)\r\n  }\r\n}\r\n\n\n//# sourceURL=webpack:///./src/wedb.js?");

/***/ })

/******/ });