import Wedb from './wedb.js'

document.addEventListener('DOMContentLoaded', ()=>{

  let w = new Wedb({
    selectors: {
      title: {
        selector: 'div > div.columns-container > div.container > div.row > div.center_column.col-xs-12.col-sm-12 > div > div.primary_block.row > div.pb-center-column.col-xs-12.col-sm-4 > h1'
      },
      price: {
        selector: 'div > div.columns-container > div.container > div.row > div.center_column.col-xs-12.col-sm-12 > div > div.primary_block.row > div.pb-right-column.col-xs-12.col-sm-4.col-md-3 > form > div.box-info-product > div.content_prices.clearfix > div > p.our_price_display > span.price'
      }
    },
    bannedTags: 'script,link',
    onAddUrl: (url)=> {
      pagesCrawl.innerHTML = `${w.urls.length - w.bufferedUrls.length} scannées / ${w.urls.length} découvertes <br> ${w.getNextUrl()}`
    },
    onRemoveUrl: (url)=>{
      pagesCrawl.innerHTML = `${w.urls.length - w.bufferedUrls.length} scannées / ${w.urls.length} découvertes <br> ${w.getNextUrl()}`
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
    if(e.key == "Enter") w.crawl(input.value)
  })
  function generateIdFromUrl(url){
    return url.split('.').join('-').split('/').join('_')
  }
})



HTMLElement.prototype.selector = function(){
  let element = this;
  let selector = ''
  while(element && element != document.body){
    let elSelector = element.tagName.toLowerCase()
    if(element.className.length){
      let classes = element.className.split(' ')
      classes.map(elclass => {if(elclass.length) elSelector+="."+elclass} )
    }
    selector = (selector.length) ? elSelector + ' > ' + selector : elSelector
    element = element.parentElement
  }
  return selector;
}
