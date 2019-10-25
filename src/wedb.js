import Req from 'req'

export default class Wedb{
  constructor(config){
    this.setConfig({
      url: '', // entrypoint for crawl
      path: '', // base url for entities
      bannedElement: [], // selectors
      crawlDepth: 1
    })
    this.setConfig(config)
    this.init()
  }

  setConfig(config){
    if(!this.config) this.config = {}
    this.config = Object.assign(this.config, config)
  }

  init(){
    this.getScript = new Req({url: './services/get.php', method: 'post'})
    this.urls = []
    this.bufferedUrls = []
    this.entities = []
    this.content = []
    this.fakedom = document.createElement('div')
    document.body.appendChild(this.fakedom)
    this.fakedom.style.display = 'none'
  }

  crawl(url){
    if(url) this.config.path = url;
    let currentUrl = url || this.getNextUrl()
    if(currentUrl) this.get(currentUrl)
    .then((req)=>{
      let html = req.json
      this.extractLinks(html)
      let content = this.extractContent(html)
      this.content.push(content + '\n' + currentUrl)
      // console.log(content, currentUrl)
    })
    .finally(()=>{
      console.log(currentUrl, this.bufferedUrls.length)
      this.removeNextUrl()
      this.crawl()
    })
    else console.log(this.content.join('\n____________________\n'))
  }
  get(url){
    return this.getScript.do({url: url})
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
    let bannedTags = [...this.fakedom.querySelectorAll(this.config.bannedTags)]
    bannedTags.map(tag => {
      tag.remove()
    })

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
      }
    }
    if(content.title && content.price) document.body.innerHTML += content.title + ' ' + content.price + '<br>'

    this.fakedom.innerHTML = ''
    return content;
  }

  addUrl(url){
    if(!this.urls.includes(url)) {
      this.bufferedUrls.push(url)
      this.urls.push(url)
    }
    else return false
  }
  getNextUrl(url){
    return this.bufferedUrls[0]
  }
  removeNextUrl(){
    this.bufferedUrls.splice(0, 1)
  }
}