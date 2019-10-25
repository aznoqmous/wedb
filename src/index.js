import Wedb from './wedb.js'

document.addEventListener('DOMContentLoaded', ()=>{
  var start = Date.now()

  let w = new Wedb({
    selectors: {
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
      pagesCrawl.innerHTML += ` ${w.bufferedUrls.length} pages left`
      pagesCrawl.innerHTML += ` ${w.urls.length} pages total <br>`
    },
    onRemoveUrl: (url)=>{
      let ratio = ( w.urls.length - w.bufferedUrls.length ) / w.urls.length
      progress.style.width = ratio * 100 + '%'
      progress.innerHTML = Math.round(ratio * 100) + '%'
      pagesCrawl.innerHTML = `${w.urls.length - w.bufferedUrls.length} pages crawled`
      pagesCrawl.innerHTML += `${w.bufferedUrls.length} pages left`
      pagesCrawl.innerHTML += `${w.urls.length} pages total <br>`
    },
    onSuccess: (url)=>{
      addUrlEl(url + ':)', 'text-success')
    },
    onError: (url)=>{
      addUrlEl(url + ':(', 'text-danger')
    },
    onFinally: ()=>{
      addUrl(w.getNextUrl()+'...')
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

  function addUrlEl(url, className){
    let urlEl = document.createElement('li')
    urlEl.className = 'small'
    if(className) urlEl.className += ' ' + className
    urlEl.id = url.split('.').join('-').split('/').join('_')
    urlEl.innerHTML = url
    urls.appendChild(urlEl)
    if(urls.children.length > 5) urls.children[0].remove()
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
