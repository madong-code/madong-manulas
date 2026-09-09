/**
 * 共用顶栏（banner）：所有手册页面共享同一份导航条，放置手册跳转链接。
 * 通过整页跳转（window.location.href）切换手册，绕过 Docsify SPA 路由拦截。
 *
 * 在手册 index.html 中于 docsify.min.js 之前引入：
 *   <script src="../../assets/js/site-nav.js"></script>
 *
 * 新增手册只需在下方 NAV / MORE 数组追加一项即可（单一事实源）。
 */
(function () {
  // GitHub Pages 子路径部署时，内部整页跳转需带基址，否则 /docs/...、/ 会跳到域名根 404。
  var BASE = (location.pathname.replace(/\/docs\/.*$/, '') || '');
  function withBase(u) { return u.charAt(0) === '/' ? BASE + u : u; }
  // 主导航：直接平铺的手册链接
  var NAV = [
    { name: '标准版手册', url: '/docs/standard/' },
    { name: 'SaaS 多租户版', url: '/docs/saas/' }
  ];
  // 「更多」下拉：规划中 / 入口类
  var MORE = [
    { name: '工作流引擎', url: '/docs/workflow/', soon: true },
    { name: '文档中心', url: '/' }
  ];

  var path = location.pathname.replace(/index\.html$/, '').replace(/\/+$/, '');
  function isActive(url) {
    var u = url.replace(/index\.html$/, '').replace(/\/+$/, '');
    return path === u || path.indexOf(u + '/') === 0;
  }

  var header = document.createElement('header');
  header.className = 'site-nav';

  var brand = '<a class="site-nav__brand" href="' + withBase('/') + '" data-full>Madong 文档</a>';

  var links = NAV.map(function (n) {
    return '<a class="site-nav__link' + (isActive(n.url) ? ' is-active' : '') +
      '" href="' + withBase(n.url) + '" data-full>' + n.name + '</a>';
  }).join('');

  var moreItems = MORE.map(function (n) {
    return '<a class="site-nav__menu-item' + (n.soon ? ' is-soon' : '') +
      '" href="' + withBase(n.url) + '" data-full>' + (n.soon ? '🚧 ' : '') + n.name +
      (n.soon ? '<span class="site-nav__soon">规划中</span>' : '') + '</a>';
  }).join('');

  header.innerHTML =
    brand +
    '<nav class="site-nav__links">' + links +
    '<span class="site-nav__drop">' +
    '<a class="site-nav__link site-nav__more" href="javascript:void(0)">更多 ▾</a>' +
    '<div class="site-nav__menu">' + moreItems + '</div>' +
    '</span></nav>';

  document.body.appendChild(header);

  // 整页跳转，彻底脱离当前 Docsify 实例
  header.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-full]');
    if (!a) return;
    e.preventDefault();
    e.stopPropagation();
    window.location.href = a.getAttribute('href');
  });

  // 下拉展开 / 收起
  var drop = header.querySelector('.site-nav__drop');
  var more = header.querySelector('.site-nav__more');
  more.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    drop.classList.toggle('open');
  });
  document.addEventListener('click', function () { drop.classList.remove('open'); });
})();
