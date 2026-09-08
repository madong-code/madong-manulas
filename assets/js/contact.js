/**
 * 右下角「加入我们」浮动入口（门户 + 手册共用，单一来源）
 * 默认项：QQ 交流群（跳链接）/ 微信群（二维码弹窗）/ 公众号（二维码弹窗）
 * 占位地址请替换为真实链接或二维码图片路径。
 */
(function () {
  // 仓库 / 联系方式占位，按需修改
  var ITEMS = [
    { key: 'qq',     label: 'QQ 交流群', type: 'link', href: 'https://qm.qq.com/cgi-bin/qm/qr?k=YOUR_QQ_GROUP_KEY' },
    { key: 'wechat', label: '微信群',   type: 'qr', title: '微信群二维码', note: '请替换为真实微信群二维码图片' },
    { key: 'mp',     label: '公众号',   type: 'qr', title: '微信公众号',   note: '请替换为真实公众号二维码图片' }
  ];
  var ICON = { qq: 'QQ', wechat: '微', mp: '公' };

  var fab = document.createElement('div');
  fab.className = 'contact-fab';
  var panel = ITEMS.map(function (it) {
    return '<a class="contact-fab__item" data-key="' + it.key + '" href="javascript:void(0)">' +
      '<span class="contact-fab__ico">' + ICON[it.key] + '</span><span>' + it.label + '</span></a>';
  }).join('');
  fab.innerHTML = '<button class="contact-fab__btn" type="button" title="加入我们">联系</button>' +
    '<div class="contact-fab__panel">' + panel + '</div>';
  document.body.appendChild(fab);

  var btn = fab.querySelector('.contact-fab__btn');
  btn.addEventListener('click', function (e) { e.stopPropagation(); fab.classList.toggle('open'); });
  document.addEventListener('click', function () { fab.classList.remove('open'); });
  fab.querySelector('.contact-fab__panel').addEventListener('click', function (e) { e.stopPropagation(); });

  fab.querySelectorAll('.contact-fab__item').forEach(function (a) {
    a.addEventListener('click', function () {
      var it = ITEMS.filter(function (x) { return x.key === a.dataset.key; })[0];
      fab.classList.remove('open');
      if (it.type === 'link') { window.open(it.href, '_blank'); }
      else { openModal(it); }
    });
  });

  function openModal(it) {
    var m = document.createElement('div');
    m.className = 'contact-modal';
    m.innerHTML = '<div class="contact-modal__box">' +
      '<button class="contact-modal__close" type="button">×</button>' +
      '<h3 style="margin:0 0 4px;font-size:17px">' + it.title + '</h3>' +
      '<div class="contact-modal__qr">二维码<br>占位</div>' +
      '<p class="contact-modal__note">' + it.note + '</p>' +
      '</div>';
    document.body.appendChild(m);
    m.addEventListener('click', function (e) { if (e.target === m) m.remove(); });
    m.querySelector('.contact-modal__close').addEventListener('click', function () { m.remove(); });
  }
})();
