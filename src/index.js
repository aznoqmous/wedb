import Wedb from './wedb.js'

document.addEventListener('DOMContentLoaded', ()=>{
  var start = Date.now()

  window.w = new Wedb({
    selectors: {
      organisationTitle : {
        selector: 'div.Organization h4.titre'
      }
      title: {
        selector: 'title'
      },
      description: {
        selector: 'meta[type="description"]',
        attr: 'content'
      },
      alt: {
        selector: 'h1'
      }
    },
    bannedTags: 'script,link',
    onAddUrl: (url)=> {
      let ratio = ( w.urls.length - w.bufferedUrls.length ) / w.urls.length
      progress.style.width = ratio * 100 + '%'
      progress.innerHTML = Math.round(ratio * 100) + '%'
      pagesCrawl.innerHTML = `${w.urls.length - w.bufferedUrls.length} pages crawled`
      pagesCrawl.innerHTML += ` - ${w.bufferedUrls.length} pages left`
      pagesCrawl.innerHTML += ` - ${w.urls.length} pages total <br>`
      // addDiscovered(url)
    },
    onRemoveUrl: (url)=>{
      let ratio = ( w.urls.length - w.bufferedUrls.length ) / w.urls.length
      progress.style.width = ratio * 100 + '%'
      progress.innerHTML = Math.round(ratio * 100) + '%'
      pagesCrawl.innerHTML = `${w.urls.length - w.bufferedUrls.length} pages crawled`
      pagesCrawl.innerHTML += ` - ${w.bufferedUrls.length} pages left`
      pagesCrawl.innerHTML += ` - ${w.urls.length} pages total <br>`
    },
    onSuccess: (req)=>{
      addCrawled('<span class="badge badge-success"> ' + req.status + '</span>' + req.config.datas.url)
    },
    onError: (req)=>{
      addCrawled('<span class="badge badge-danger"> ' + req.status + '</span>' + req.config.datas.url)
    },
    onFinally: (url)=>{
      // addCrawled(w.getNextUrl()+'...')
      pagesCrawl.innerHTML += 'average' + w.averageTime +'ms load'
      pagesCrawl.innerHTML += Math.round(w.left / 1000) + 's left'
    },
    onContent: (content)=>{
      let entity = ''
      for(let key in content){
        entity += `${key}: ${content[key]}<br>`
      }
      entities.innerHTML += `<li>${entity}</li>`
    }
  })

  input.addEventListener('keyup', (e)=>{
    if(e.key == "Enter") {
      w.crawl(input.value)
      start = Date.now()
    }
  })

  function addCrawled(url, className){
    let urlEl = document.createElement('li')
    urlEl.className = 'small'
    if(className) urlEl.className += ' ' + className
    urlEl.id = url.split('.').join('-').split('/').join('_')
    urlEl.innerHTML = url
    crawled.appendChild(urlEl)
    if(crawled.children.length > 5) crawled.children[0].remove()
  }
  function addDiscovered(url, className){
    let urlEl = document.createElement('li')
    urlEl.className = 'small'
    if(className) urlEl.className += ' ' + className
    urlEl.id = url.split('.').join('-').split('/').join('_')
    urlEl.innerHTML = url
    discovered.appendChild(urlEl)
    if(discovered.children.length > 5) discovered.children[0].remove()
  }
})

HTMLElement.prototype.selector = function(){
  let element = this;
  let selector = ''
  while(element && element != document.body){
    let elSelector = element.tagName.toLowerCase()
    if(element.id){
      let ids = element.id.split(' ')
      ids.map(id => {if(id.length) elSelector+="#"+id} )
    }
    if(element.className.length){
      let classes = element.className.split(' ')
      classes.map(elclass => {if(elclass.length) elSelector+="."+elclass} )
    }
    selector = (selector.length) ? elSelector + ' > ' + selector : elSelector
    element = element.parentElement
  }
  return selector;
}
