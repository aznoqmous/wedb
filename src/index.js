import Wedb from './wedb.js'

document.addEventListener('DOMContentLoaded', ()=>{
  window.wedb = new Wedb({
    selectors: {
      title: {
        selector: 'div > div.columns-container > div.container > div.row > div.center_column.col-xs-12.col-sm-12 > div > div.primary_block.row > div.pb-center-column.col-xs-12.col-sm-4 > h1'
      },
      price: {
        selector: 'div > div.columns-container > div.container > div.row > div.center_column.col-xs-12.col-sm-12 > div > div.primary_block.row > div.pb-right-column.col-xs-12.col-sm-4.col-md-3 > form > div.box-info-product > div.content_prices.clearfix > div > p.our_price_display > span.price'
      }
    },
    bannedTags: 'script,link'
  })
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
