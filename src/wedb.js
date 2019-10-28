import Req from 'req'

export default class Wedb{
  constructor(config){
    this.setConfig({
      url: '', // entrypoint for crawl
      path: '', // base url for entities
      // callbacks
      onAddUrl: null,
      onRemoveUrl: null,
      onContent: null,
      onSuccess: null,
      onError: null,
      onFinally: null
    })
    this.setConfig(config)
    this.init()
  }

  setConfig(config){
    if(!this.config) this.config = {}
    this.config = Object.assign(this.config, config)
  }

  init(){
    this.averageTime = 0
    this.time = 0
    this.urls = []
    this.bufferedUrls = []
    this.entities = []
    this.getScript = new Req({url: './services/get.php', method: 'post'})
    this.fakedom = document.createElement('div')
    document.body.appendChild(this.fakedom)
    this.fakedom.style.display = 'none'
    console.log(this)
  }

  crawl(url){
    if(url) this.config.path = url;
    let currentUrl = url || this.getNextUrl()
    if(currentUrl) this.get(currentUrl)
    .then((req)=>{
      let html = req.json
      this.extractLinks(html)
      let content = this.extractContent(html)
      content.time = req.time
      content.status = req.status
      this.entities.push(content)
      this.averageTime = this.getAverageTime()
      this.left = this.getTimeLeft()
      if(this.config.onSuccess && req.config.datas) this.config.onSuccess(req, content)
    })
    .catch((req)=>{
      if(this.config.onError && req.config.datas) this.config.onError(req)
    })
    .finally((req)=>{
      this.removeNextUrl()
      this.crawl()
      if(this.config.onFinally) this.config.onFinally(url)
    })
  }
  get(url){
    return this.getScript.do({url: url})
  }

  getAverageTime(){
      let time = 0
      this.entities.map(entity => {
        time += entity.time
      })
      return Math.round(time / this.entities.length)
  }
  getTimeLeft(){
    let time = 0
    return this.averageTime * this.bufferedUrls.length
  }

  extractLinks(html){
    this.fakedom.innerHTML = html
    let links = [].slice.call(this.fakedom.querySelectorAll('a'))
    links.map( link => {
      if( link.href.split(this.config.path).length > 1 ) this.addUrl(link.href)
    })
    this.fakedom.innerHTML = ''
  }
  extractContent(html){
    this.fakedom.innerHTML = html
    let content = {}
    for(let key in this.config.selectors){
      let selector = this.config.selectors[key]
      let extract = this.fakedom.querySelector(selector.selector)
      if(extract) {
        let txt = ''
        let contentValue = extract.innerText
        if(selector.attr) contentValue = extract.getAttribute(selector.attr)
        contentValue.split(' ').map( word => { if(word.length) txt += ' '+word } )
        txt = txt.replace(/\n\:/g, ' :').replace(/\n /g, '\n').replace(/\n\n/g, '\n')
        content[key] = txt
        content.url = this.getNextUrl()
      }
    }
    if(content.url && this.config.onContent) this.config.onContent(content)

    this.fakedom.innerHTML = ''
    return content;
  }

  addUrl(url){
    url = url.split('?')[0]
    url = url.split('#')[0]
    if(url.split(this.config.url).length <= 1) return false;
    if(url.split('.pdf').length > 1) return false;
    if(!this.urls.includes(url)) {
      this.bufferedUrls.push(url)
      this.urls.push(url)
      if(this.config.onAddUrl) this.config.onAddUrl(url)
    }
    else return false
  }
  getNextUrl(){
    return this.bufferedUrls[0]
  }
  removeNextUrl(){
    let removedUrl = this.bufferedUrls[0]
    this.bufferedUrls.splice(0, 1)
    if(this.config.onRemoveUrl) this.config.onRemoveUrl(removedUrl)
  }
}
