(function() {
  init();
  function init() {
      data();
  }
  function data() {
      var products_f1 = $('#products_f1');
      var products_f2 = $('#products_f2');
      var products_f3 = $('#products_f3');
      var tplItem = $('#tplItem').html();

      var items_f1 = value_data.f1.data;
      for (var i = 0; i < items_f1.length; i++) {
          var info_f1 = items_f1[i];
          products_f1.append(utility.tmplFormat(tplItem, info_f1));
          // products_f1.append(utility.tmplFormat(tplItem, info_f1, itemFormat));
      }
      var items_f2 = value_data.f2.data;
      for (var j = 0; j < items_f2.length; j++) {
          var info_f2 = items_f2[j];
          products_f2.append(utility.tmplFormat(tplItem, info_f2));
      }
      var items_f3 = value_data.f3.data;
      for (var x = 0; x < items_f3.length; x++) {
          var info_f3 = items_f3[x];
          products_f3.append(utility.tmplFormat(tplItem, info_f3));
      }
  }

  function itemFormat(itemObj, match) {
      var itemKey = match;
      if (itemKey == "monthly") {
          return utility.getPerPay(itemObj.price, 12, 0)
      }
  }
})();