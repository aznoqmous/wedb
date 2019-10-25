import Wedb from './wedb.js'

document.addEventListener('DOMContentLoaded', ()=>{

  let w = new Wedb({
    selectors: {
      title: {
        selector: 'div#page > div.columns-container > div.container#columns > div.row > div.center_column.col-xs-12.col-sm-12#center_column > div > div.primary_block.row > div.pb-center-column.col-xs-12.col-sm-4 > h1'
      },
      price: {
        selector: 'div#page > div.columns-container > div.container#columns > div.row > div.center_column.col-xs-12.col-sm-12#center_column > div > div.primary_block.row > div.pb-right-column.col-xs-12.col-sm-4.col-md-3 > form#buy_block > div.box-info-product > div.content_prices.clearfix > div > p.our_price_display > span.price#our_price_display'
      },
      reference: {
        selector: 'div#page > div.columns-container > div.container#columns > div.row > div.center_column.col-xs-12.col-sm-12#center_column > div > div.primary_block.row > div.pb-center-column.col-xs-12.col-sm-4 > p#product_reference > span.editable'
      },
      condition: {
        selector: 'div#page > div.columns-container > div.container#columns > div.row > div.center_column.col-xs-12.col-sm-12#center_column > div > div.primary_block.row > div.pb-center-column.col-xs-12.col-sm-4 > p#product_condition > span.editable'
      },
      description: {
        selector: 'div#page > div.columns-container > div.container#columns > div.row > div.center_column.col-xs-12.col-sm-12#center_column > div > div.primary_block.row > div.pb-center-column.col-xs-12.col-sm-4 > div#short_description_block > div.rte.align_justify#short_description_content > p'
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
