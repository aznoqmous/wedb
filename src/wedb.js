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
    this.getScript = new Req({
      url: './services/get.php',
      method: 'post',
      maxTries: 3,
      maxRequestTime: 5000,
    })
    this.fakedom = document.createElement('div')
    document.body.appendChild(this.fakedom)
    this.fakedom.style.display = 'none'
  }

  crawl(url){
    if(url) this.config.path = this.getHost(url);
    let currentUrl = url || this.getNextUrl()
    if(!url && currentUrl) currentUrl = this.config.path + '/' + this.getNextUrl()
    if(currentUrl) this.get(currentUrl)
    .then((req)=>{

      this.extractLinks(req.json.links)

      let content = this.extractContent(req.json.results)
      content.time = req.time
      content.status = req.status
      content.url = req.config.datas.url
      content.id = this.entities.length
      if(this.config.onContent) this.config.onContent(content)
      this.entities.push(content)

      this.averageTime = this.getAverageTime()
      this.left = this.getTimeLeft()

      if(this.config.onSuccess && req.config && req.config.datas) this.config.onSuccess(req, content)
    })
    .catch((req)=>{
      if(this.config.onError && req.config && req.config.datas) this.config.onError(req)
    })
    .finally((req)=>{
      this.removeNextUrl()
      this.crawl()
      if(this.config.onFinally) this.config.onFinally(url)
    })

    else return false;
  }
  get(url){
    return this.getScript.do({
      url: url,
      selectors: JSON.stringify(this.config.selectors)
    })
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

  extractLinks(links){
    for(let key in links){
      let link = links[key]
      if(
        link.match(this.config.path)
        ||
        (
          !link.match(/\..*?\//)
          && !link.match('https://')
          && !link.match('http://')
      )
      ) this.addUrl(link)
    }
  }

  extractContent(contents){
    let res = {}
    let i = 0
    for(let key in this.config.selectors){
      let selector = this.config.selectors[key].selector
      res[key] = contents[i].results
      i++
    }
    return res
  }

  addUrl(url){
    let bannedExtensions = "pdf,jpg,jpeg,png,css,js"
    url = url.replace('http://', '')
    url = url.replace('https://', '')
    url = url.replace(this.config.path, '')
    url = url.split('?')[0]
    url = url.split('#')[0]

    if(url[0] == '/') url = url.slice(1)

    let extension = url.split('.')
    extension = extension[extension.length-1]

    if(bannedExtensions.split(extension).length > 1) return false;

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

  getHost(url){
    let host = url.replace('http://', '')
    host = host.replace('https://', '')
    host = host.split('/')[0]
    return host;
  }
}
