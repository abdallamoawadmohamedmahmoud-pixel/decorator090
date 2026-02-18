(function(){
  var addrHtml = `
  <div class="footer-address" style="padding: 12px 0; text-align: center;">
    <h4>العناوين الرسمية</h4>
    <p>الفيوم: دارماد- الشارع الجديد خلف فيلا المحافظ بجوار كافيه تايم اوت</p>
    <p>الهاتف: 01009094462 | واتساب: 01099797984</p>
    <p>القاهرة: عماره20 _ شارع ابراهيم ناجى المنطقه العاشره _ مدينه نصر</p>
  </div> 
  `;
  var footers = document.querySelectorAll('footer');
  if(footers.length){
    footers.forEach(function(f){
      if(!f.querySelector('.footer-address')){
        f.insertAdjacentHTML('beforeend', addrHtml);
      }
    });
  }
})();
