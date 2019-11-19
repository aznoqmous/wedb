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
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Req; });\nclass Req{\r\n\r\n    constructor(config){\r\n        this.config = Object.assign({\r\n            url: '',\r\n            method: 'GET',\r\n            maxRequestTime: 10000,\r\n            maxTries: 10,\r\n            wait: false, // wait request returns before sending another\r\n            override: false, // abort previous req on new req.do\r\n            debug: false,\r\n\r\n            // callback\r\n            onDo: null,\r\n            onEmptyValue: null\r\n\r\n        }, config)\r\n        this.pending = []\r\n        this.config.method = this.config.method.toUpperCase()\r\n        this.log(this)\r\n    }\r\n\r\n    do(initialData){\r\n        if(this.config.wait && this.running) {\r\n            this.log('process already running')\r\n            return false;\r\n        }\r\n\r\n        var self = this\r\n        this.tries = 1\r\n        var reqT0 = Date.now()\r\n        this.tStart = Date.now()\r\n\r\n        this.config.datas = initialData\r\n\r\n        return new Promise((resolve, reject)=>{\r\n            reqdo(initialData)\r\n\r\n            function reqdo(initData){\r\n                var req = new XMLHttpRequest()\r\n                req.reqId = Date.now()\r\n                if(self.override) this.endPendings()\r\n                self.addPending(req)\r\n                if(self.config.method == 'POST') req.open('POST', self.config.url, true)\r\n                else req.open('GET', self.config.url + self.getDataUrl(initData), true)\r\n                // req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')\r\n\r\n                req.onreadystatechange = function(){\r\n                    if (this.readyState === XMLHttpRequest.DONE) {\r\n                        self.running = false\r\n                        self.status = this.status\r\n                        if (this.status === 200) {\r\n                            self.data = this.responseText\r\n                            self.json = (self.isJsonString(this.responseText)) ? JSON.parse(this.responseText) : this.responseText;\r\n                            self.time = Date.now() - self.tStart\r\n                            self.removePending(req)\r\n                            resolve(self)\r\n                            if(!self.data.length) self.handleEmptyValue()\r\n\r\n                        } else if(this.status) {\r\n                            if(self.config.debug) console.warn(self, this.status, this.statusText)\r\n                            self.message = this.statusText\r\n                            reject(self)\r\n                        } else if(self.tries >= self.config.maxTries){\r\n                            self.message = \"Max tries reached\"\r\n                            reject(self)\r\n                        }else{\r\n                            self.log(self.config.url, 'aborted')\r\n                        }\r\n                    }\r\n                }\r\n\r\n                let data = null\r\n                if(self.config.method == 'POST') data = self.getFormData(initData)\r\n                if(self.config.form) data = new FormData(initData)\r\n\r\n                req.send(data)\r\n\r\n                self.running = true\r\n                self.handleDo()\r\n\r\n                setTimeout(()=>{\r\n                    //retry\r\n                    if( !req.status ) {\r\n                        if(self.config.debug) console.warn(self.config.url, initialData, 'no response after config max request time (' + self.config.maxRequestTime + 'ms), retrying... ('+ self.tries +'/'+ self.config.maxTries +')')\r\n                        self.tries++;\r\n                        req.abort()\r\n                        self.running = false\r\n                        if( self.tries < self.config.maxTries ) reqdo(initData)\r\n                        else reject('Req:', \"Max request tries reached.\")\r\n                    }\r\n                }, self.config.maxRequestTime)\r\n            }\r\n\r\n        });\r\n    }\r\n\r\n    getFormData(data){\r\n        let formData = new FormData();\r\n        for (let name in data){\r\n            let value = data[name]\r\n            formData.append(name, value);\r\n        }\r\n        return formData;\r\n    }\r\n    getDataUrl(datas){\r\n        let dataArr = []\r\n        for(let data in datas){\r\n            dataArr.push( data + '=' + datas[data])\r\n        }\r\n        return '?' + dataArr.join('&');\r\n    }\r\n\r\n    log(){\r\n        if(this.config.debug) console.log('Req', ...arguments)\r\n    }\r\n\r\n    handleDo(){\r\n        if(this.config.onDo) this.config.onDo(this)\r\n        this.log('new call')\r\n    }\r\n    handleEmptyValue(){\r\n        if(this.config.onEmptyValue) this.config.onEmptyValue(this)\r\n        this.log('already received empty value')\r\n    }\r\n\r\n    isJsonString(str){\r\n        try {\r\n            JSON.parse(str);\r\n        } catch (e) {\r\n            return false;\r\n        }\r\n        return true;\r\n    }\r\n    addPending(req){\r\n        this.pending.push(req)\r\n    }\r\n    removePending(req){\r\n        this.pending = this.pending.filter( pending => pending.reqId != req.reqId )\r\n    }\r\n    endPendings(){\r\n        this.pending.map(pending => { pending.abort() })\r\n        this.pending = []\r\n    }\r\n}\r\n\r\nwindow.Req = Req\r\n\n\n//# sourceURL=webpack:///./node_modules/req/src/req.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _wedb_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./wedb.js */ \"./src/wedb.js\");\n\r\n\r\ndocument.addEventListener('DOMContentLoaded', ()=>{\r\n  window.w = new _wedb_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"]({\r\n    selectors: {\r\n      price: {\r\n        selector: '.our_price_display #our_price_display'\r\n      },\r\n      reference: {\r\n        selector: '#product_reference .editable',\r\n        attr: 'content'\r\n      }\r\n      // organisationTitle : {\r\n      //   selector: 'div.Organization h4.titre'\r\n      // },\r\n      // title: {\r\n      //   selector: 'title'\r\n      // },\r\n      // description: {\r\n      //   selector: 'meta[type=\"description\"]',\r\n      //   attr: 'content'\r\n      // },\r\n      // alt: {\r\n      //   selector: 'h1'\r\n      // }\r\n    },\r\n    bannedTags: 'script,link',\r\n    onAddUrl: (url)=> {\r\n      let ratio = ( w.urls.length - w.bufferedUrls.length ) / w.urls.length\r\n      progress.style.width = ratio * 100 + '%'\r\n      progress.innerHTML = Math.round(ratio * 100) + '%'\r\n      pagesCrawl.innerHTML = `${w.urls.length - w.bufferedUrls.length} pages crawled`\r\n      pagesCrawl.innerHTML += ` - ${w.bufferedUrls.length} pages left`\r\n      pagesCrawl.innerHTML += ` - ${w.urls.length} pages total <br>`\r\n      // addDiscovered(url)\r\n    },\r\n    onRemoveUrl: (url)=>{\r\n      let ratio = ( w.urls.length - w.bufferedUrls.length ) / w.urls.length\r\n      progress.style.width = ratio * 100 + '%'\r\n      progress.innerHTML = Math.round(ratio * 100) + '%'\r\n      pagesCrawl.innerHTML = `${w.urls.length - w.bufferedUrls.length} pages crawled`\r\n      pagesCrawl.innerHTML += ` - ${w.bufferedUrls.length} pages left`\r\n      pagesCrawl.innerHTML += ` - ${w.urls.length} pages total <br>`\r\n    },\r\n    onSuccess: (req)=>{\r\n      addCrawled('<span class=\"badge badge-success\">' + req.status + '</span> ' + req.config.datas.url)\r\n    },\r\n    onError: (req)=>{\r\n      addCrawled('<span class=\"badge badge-danger\">' + req.status + '</span> ' + req.config.datas.url)\r\n    },\r\n    onFinally: (url)=>{\r\n      // addCrawled(w.getNextUrl()+'...')\r\n      pagesCrawl.innerHTML += 'average' + w.averageTime +'ms load'\r\n      pagesCrawl.innerHTML += Math.round(w.left / 1000) + 's left'\r\n    },\r\n    onContent: (content)=>{\r\n      let entity = ''\r\n      for(let key in content){\r\n        entity += `${key}: ${content[key]}<br>`\r\n      }\r\n      entities.innerHTML += `<li>${entity}</li>`\r\n    }\r\n  })\r\n\r\n\r\n  input.addEventListener('keyup', (e)=>{\r\n    if(e.key == \"Enter\") {\r\n      w.crawl(input.value)\r\n    }\r\n  })\r\n\r\n  function addCrawled(url, className){\r\n    let urlEl = document.createElement('li')\r\n    urlEl.className = 'small'\r\n    if(className) urlEl.className += ' ' + className\r\n    urlEl.id = url.split('.').join('-').split('/').join('_')\r\n    urlEl.innerHTML = url\r\n    crawled.appendChild(urlEl)\r\n    if(crawled.children.length > 5) crawled.children[0].remove()\r\n  }\r\n  function addDiscovered(url, className){\r\n    let urlEl = document.createElement('li')\r\n    urlEl.className = 'small'\r\n    if(className) urlEl.className += ' ' + className\r\n    urlEl.id = url.split('.').join('-').split('/').join('_')\r\n    urlEl.innerHTML = url\r\n    discovered.appendChild(urlEl)\r\n    if(discovered.children.length > 5) discovered.children[0].remove()\r\n  }\r\n})\r\n\r\nHTMLElement.prototype.selector = function(){\r\n  let element = this;\r\n  let selector = ''\r\n  while(element && element != document.body){\r\n    let elSelector = element.tagName.toLowerCase()\r\n    if(element.id){\r\n      let ids = element.id.split(' ')\r\n      ids.map(id => {if(id.length) elSelector+=\"#\"+id} )\r\n    }\r\n    if(element.className.length){\r\n      let classes = element.className.split(' ')\r\n      classes.map(elclass => {if(elclass.length) elSelector+=\".\"+elclass} )\r\n    }\r\n    selector = (selector.length) ? elSelector + ' > ' + selector : elSelector\r\n    element = element.parentElement\r\n  }\r\n  return selector;\r\n}\r\n\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ }),

/***/ "./src/wedb.js":
/*!*********************!*\
  !*** ./src/wedb.js ***!
  \*********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Wedb; });\n/* harmony import */ var req__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! req */ \"./node_modules/req/src/req.js\");\n\r\n\r\nclass Wedb{\r\n  constructor(config){\r\n    this.setConfig({\r\n      url: '', // entrypoint for crawl\r\n      path: '', // base url for entities\r\n      // callbacks\r\n      onAddUrl: null,\r\n      onRemoveUrl: null,\r\n      onContent: null,\r\n      onSuccess: null,\r\n      onError: null,\r\n      onFinally: null\r\n    })\r\n    this.setConfig(config)\r\n    this.init()\r\n  }\r\n\r\n  setConfig(config){\r\n    if(!this.config) this.config = {}\r\n    this.config = Object.assign(this.config, config)\r\n  }\r\n\r\n  init(){\r\n    this.averageTime = 0\r\n    this.time = 0\r\n    this.urls = []\r\n    this.bufferedUrls = []\r\n    this.entities = []\r\n    this.getScript = new req__WEBPACK_IMPORTED_MODULE_0__[\"default\"]({url: './services/get.php', method: 'post'})\r\n    this.fakedom = document.createElement('div')\r\n    document.body.appendChild(this.fakedom)\r\n    this.fakedom.style.display = 'none'\r\n  }\r\n\r\n  crawl(url){\r\n    if(url) this.config.path = url;\r\n    let currentUrl = url || this.getNextUrl()\r\n    if(!url && currentUrl) currentUrl = this.config.path + '/' + this.getNextUrl()\r\n    if(currentUrl) this.get(currentUrl)\r\n    .then((req)=>{\r\n\r\n      this.extractLinks(req.json.links)\r\n\r\n      let content = this.extractContent(req.json.results)\r\n      content.time = req.time\r\n      content.status = req.status\r\n      this.entities.push(content)\r\n\r\n      this.averageTime = this.getAverageTime()\r\n      this.left = this.getTimeLeft()\r\n\r\n      if(this.config.onSuccess && req.config && req.config.datas) this.config.onSuccess(req, content)\r\n    })\r\n    .catch((req)=>{\r\n      if(this.config.onError && req.config && req.config.datas) this.config.onError(req)\r\n    })\r\n    .finally((req)=>{\r\n      this.removeNextUrl()\r\n      this.crawl()\r\n      if(this.config.onFinally) this.config.onFinally(url)\r\n    })\r\n\r\n    else return false;\r\n  }\r\n  get(url){\r\n    return this.getScript.do({\r\n      url: url,\r\n      selectors: JSON.stringify(this.config.selectors)\r\n    })\r\n  }\r\n\r\n  getAverageTime(){\r\n      let time = 0\r\n      this.entities.map(entity => {\r\n        time += entity.time\r\n      })\r\n      return Math.round(time / this.entities.length)\r\n  }\r\n  getTimeLeft(){\r\n    let time = 0\r\n    return this.averageTime * this.bufferedUrls.length\r\n  }\r\n\r\n  extractLinks(links){\r\n    for(let key in links){\r\n      let link = links[key]\r\n      if(\r\n        !link.match(/\\..*?\\//)\r\n        && !link.match('https://')\r\n        && !link.match('http://')\r\n      ) this.addUrl(link)\r\n    }\r\n  }\r\n\r\n  extractContent(contents){\r\n    let res = {}\r\n    let i = 0\r\n    for(let key in this.config.selectors){\r\n      let selector = this.config.selectors[key].selector\r\n      res[key] = contents[i].results\r\n      i++\r\n    }\r\n    if(this.config.onContent) this.config.onContent(res)\r\n    return res\r\n  }\r\n\r\n  addUrl(url){\r\n    url = url.split('?')[0]\r\n    url = url.split('#')[0]\r\n    if(url[0] == '/') url = url.slice(1)\r\n    if(url.split(this.config.url).length <= 1) return false;\r\n    if(url.split('.pdf').length > 1) return false;\r\n    if(url.split('.css').length > 1) return false;\r\n    if(url.split('.js').length > 1) return false;\r\n    if(!this.urls.includes(url)) {\r\n      this.bufferedUrls.push(url)\r\n      this.urls.push(url)\r\n      if(this.config.onAddUrl) this.config.onAddUrl(url)\r\n    }\r\n    else return false\r\n  }\r\n  getNextUrl(){\r\n    return this.bufferedUrls[0]\r\n  }\r\n  removeNextUrl(){\r\n    let removedUrl = this.bufferedUrls[0]\r\n    this.bufferedUrls.splice(0, 1)\r\n    if(this.config.onRemoveUrl) this.config.onRemoveUrl(removedUrl)\r\n  }\r\n}\r\n\n\n//# sourceURL=webpack:///./src/wedb.js?");

/***/ })

/******/ });