/* ============================================================
   三角洲行动攻略站 · GTI 终端特效 effects.js v3（重写）
   零依赖 vanilla JS · ES5 兼容 · 绝不修改正文元素的 display/opacity/visibility
   ============================================================ */
(function () {
  'use strict';
  var d = document;
  var html = d.documentElement;
  var body = d.body;
  var P = (body.getAttribute('data-page') || '').toLowerCase();
  var RM = false;
  try { RM = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  html.classList.add('js');

  /* ---- 工具 ---- */
  function el(tag, cls, txt) {
    var n = d.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  var toastBox = d.getElementById('dfToast');
  function toast(msg, cls) {
    if (!toastBox) return;
    var t = el('div', 'toast' + (cls ? ' ' + cls : ''), msg);
    toastBox.appendChild(t);
    setTimeout(function () { t.classList.add('out'); }, 2400);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 2800);
  }

  /* ---- 1. 撤离倒计时（周五/六/日 20:00-21:00）---- */
  (function countdown() {
    var chip = el('div', 'cd-chip');
    chip.innerHTML = '<span class="cd-label">EXTRACT // 距下次可玩</span><span class="cd-time">--:--:--</span>';
    var tab = el('a', 'tab-cd');
    tab.href = 'health.html';
    tab.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/></svg><span class="cd-time">--:--:--</span><span class="cd-label">撤离倒计时</span>';
    body.appendChild(chip);

    function tick() {
      var now = new Date();
      var wd = now.getDay(); // 0 日 5 五 6 六
      var inWindow = (wd === 5 || wd === 6 || wd === 0);
      var target = null, active = false;
      if (inWindow) {
        var end = new Date(now); end.setHours(21, 0, 0, 0);
        var start = new Date(now); start.setHours(20, 0, 0, 0);
        if (now >= start && now < end) { active = true; target = end; }
      }
      if (!target) {
        for (var dd = 0; dd < 8; dd++) {
          var t = new Date(now); t.setDate(now.getDate() + dd);
          var w = t.getDay();
          if (w === 5 || w === 6 || w === 0) {
            t.setHours(20, 0, 0, 0);
            if (t > now) { target = t; break; }
          }
        }
      }
      if (!target) return;
      var diff = Math.max(0, target - now);
      var h = Math.floor(diff / 3600000);
      var m = Math.floor(diff % 3600000 / 60000);
      var s = Math.floor(diff % 60000 / 1000);
      var str = pad(h) + ':' + pad(m) + ':' + pad(s);
      chip.querySelector('.cd-time').textContent = str;
      tab.querySelector('.cd-time').textContent = str;
      chip.classList.toggle('run', active);
      tab.classList.toggle('run', active);
      chip.querySelector('.cd-label').textContent = active ? 'EXTRACT // 作战窗口开启' : 'EXTRACT // 距下次可玩';
      tab.querySelector('.cd-label').textContent = active ? '作战中' : '撤离倒计时';
    }
    tick();
    setInterval(tick, 1000);
    window.__dfTabCountdown = tab;
  })();

  /* ---- 2. 移动端底部导航 ---- */
  (function tabbar() {
    var bar = d.getElementById('dfTabbar');
    if (!bar) return;
    var ICONS = {
      home: '<svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/></svg>',
      loadout: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>',
      maps: '<svg viewBox="0 0 24 24"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/></svg>',
      ops: '<svg viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>'
    };
    var items = [
      ['index', '首页', 'home', 'index.html'],
      ['loadout', '配装', 'loadout', 'loadout.html'],
      null, // 中央倒计时占位
      ['maps', '地图', 'maps', 'maps.html'],
      ['operators', '干员', 'ops', 'operators.html']
    ];
    items.forEach(function (it) {
      if (!it) { bar.appendChild(window.__dfTabCountdown || el('span')); return; }
      var key = it[0], label = it[1], icon = it[2], href = it[3];
      var a = el('a', P === key ? 'on' : '');
      a.href = href;
      a.innerHTML = ICONS[icon] + '<span>' + label + '</span>';
      bar.appendChild(a);
    });
  })();

  /* ---- 3. 页脚全站链接 ---- */
  (function footerLinks() {
    var f = body.querySelector('footer');
    if (!f || f.querySelector('.f-links')) return;
    var all = [
      ['weekly.html', '每周速览'], ['loadout.html', '配装库'], ['money.html', '赚钱路线'],
      ['operators.html', '干员图鉴'], ['maps.html', '地图攻略'], ['squad.html', '开黑专区'],
      ['mobile.html', '手机设置'], ['newbie.html', '新手入门'], ['wall.html', '炫耀墙'],
      ['health.html', '健康游戏']
    ];
    var p = el('p', 'f-links');
    all.forEach(function (it) {
      if (P + '.html' === it[0]) return;
      var a = el('a', '', it[1]); a.href = it[0]; p.appendChild(a);
    });
    f.appendChild(p);
  })();

  /* ---- 4. 首页：雷达 Hero canvas ---- */
  (function radar() {
    var cv = d.getElementById('dfRadar');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    var W = 0, H = 0, ang = 0, raf = null, visible = true;
    var blips = [];
    for (var i = 0; i < 7; i++) {
      blips.push({ r: 0.25 + Math.random() * 0.7, a: Math.random() * Math.PI * 2, s: 0.5 + Math.random() });
    }
    function size() {
      var r = cv.parentNode.getBoundingClientRect();
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var cx = W * 0.82, cy = H * 0.5, R = Math.min(W, H) * 0.9;
      if (R < 40) { raf = requestAnimationFrame(draw); return; }
      ctx.strokeStyle = 'rgba(53,224,255,0.14)';
      ctx.lineWidth = 1;
      for (var j = 1; j <= 3; j++) { ctx.beginPath(); ctx.arc(cx, cy, R * j / 3, 0, 7); ctx.stroke(); }
      ctx.beginPath();
      ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy);
      ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R);
      ctx.stroke();
      if (ctx.createConicGradient) {
        var grad = ctx.createConicGradient(ang, cx, cy);
        grad.addColorStop(0, 'rgba(255,176,46,0.28)');
        grad.addColorStop(0.12, 'rgba(255,176,46,0)');
        grad.addColorStop(1, 'rgba(255,176,46,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, R, ang - 0.02, ang + Math.PI * 2 - 0.02);
        ctx.closePath(); ctx.fill();
      }
      ctx.strokeStyle = 'rgba(255,176,46,0.85)';
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R);
      ctx.stroke();
      blips.forEach(function (b) {
        var da = (ang - b.a) % (Math.PI * 2);
        if (da < 0) da += Math.PI * 2;
        var glow = Math.max(0, 1 - da / 1.2);
        if (glow > 0.02) {
          ctx.fillStyle = 'rgba(255,90,90,' + (glow * b.s).toFixed(2) + ')';
          ctx.beginPath();
          ctx.arc(cx + Math.cos(b.a) * R * b.r, cy + Math.sin(b.a) * R * b.r, 2.5, 0, 7);
          ctx.fill();
        }
      });
      ang += 0.022;
      if (ang > Math.PI * 2) ang -= Math.PI * 2;
      raf = requestAnimationFrame(draw);
    }
    size();
    window.addEventListener('resize', size);
    if (RM) {
      ang = 1;
      draw();
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    } else {
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          var e = es[0];
          visible = (typeof e.isIntersecting === 'boolean') ? e.isIntersecting : (e.intersectionRatio > 0);
          if (visible && !raf) raf = requestAnimationFrame(draw);
        }).observe(cv);
      }
      raf = requestAnimationFrame(draw);
    }
    d.addEventListener('visibilitychange', function () {
      if (d.hidden && raf) { cancelAnimationFrame(raf); raf = null; }
      else if (!d.hidden && !RM && visible && !raf) raf = requestAnimationFrame(draw);
    });
  })();

  /* ---- 5. 大红出货彩蛋：连点 hero 标题 5 次 ---- */
  (function egg() {
    var h1 = body.querySelector('.hero h1');
    if (!h1) return;
    var n = 0, last = 0;
    h1.style.cursor = 'pointer';
    h1.addEventListener('click', function () {
      var now = Date.now();
      if (now - last > 2500) n = 0;
      last = now; n++;
      if (n >= 5) {
        n = 0;
        var rain = d.getElementById('redRain');
        if (!rain) return;
        rain.innerHTML = '';
        for (var i = 0; i < 42; i++) {
          var drop = el('i');
          drop.style.left = (Math.random() * 100) + '%';
          drop.style.animationDelay = (Math.random() * 1.2) + 's';
          drop.style.animationDuration = (1 + Math.random() * 0.9) + 's';
          rain.appendChild(drop);
        }
        rain.classList.add('on');
        toast('★ 恭喜出货！大红品质 · 今晚撤离稳了 ★', 'big');
        setTimeout(function () { rain.classList.remove('on'); rain.innerHTML = ''; }, 3200);
      }
    });
  })();

  /* ---- 6. 配装库：品质卡 + 抄作业复制 ---- */
  (function loadout() {
    if (P !== 'loadout') return;
    body.querySelectorAll('.card').forEach(function (card) {
      var h3 = card.querySelector('h3');
      if (!h3) return;
      var badges = h3.querySelectorAll('.badge');
      var q = null;
      badges.forEach(function (b) {
        if (b.classList.contains('rec')) q = 'q-gold';
        else if (b.classList.contains('hot')) q = 'q-red';
        else if (b.classList.contains('new')) q = 'q-green';
      });
      if (h3.textContent.indexOf('SVCH') > -1) q = 'q-purple';
      if (q) card.classList.add(q);
      var name = '';
      for (var ni = 0; ni < h3.childNodes.length; ni++) {
        var nn = h3.childNodes[ni];
        if (nn.nodeType === 3 && nn.textContent.trim()) { name = nn.textContent.trim(); break; }
      }
      var btn = el('button', 'copy-btn', '⧉ 抄作业');
      btn.addEventListener('click', function () {
        var txt = '【' + name + ' 配装 · 三角洲攻略站】\n' + card.innerText.replace(/⧉ 抄作业/g, '').trim();
        function ok() { toast('任务完成 · 已复制 ' + name + ' 配装 +250 EXP', 'good'); }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt).then(ok, function () { fallback(); });
        } else fallback();
        function fallback() {
          var ta = d.createElement('textarea');
          ta.value = txt; d.body.appendChild(ta); ta.select();
          try { d.execCommand('copy'); ok(); } catch (e) {}
          d.body.removeChild(ta);
        }
      });
      h3.insertBefore(btn, h3.firstChild);
    });
  })();

  /* ---- 7. 干员图鉴：兵种筛选 + 难度星级 + 兵种色 ---- */
  (function operators() {
    if (P !== 'operators') return;
    var CLS = { '突击位': 'c-assault', '支援位': 'c-support', '侦察位': 'c-recon', '工程位': 'c-engineer' };
    var sections = [];
    body.querySelectorAll('h2.section-title').forEach(function (h2) {
      var key = null;
      Object.keys(CLS).forEach(function (k) { if (h2.textContent.indexOf(k) > -1) key = k; });
      if (!key) return;
      var card = h2.nextElementSibling;
      if (!card) return;
      sections.push({ key: key, h2: h2, card: card, cls: CLS[key] });
      card.querySelectorAll('tbody tr, tr').forEach(function (tr) {
        if (tr.querySelector('th')) return;
        tr.classList.add(CLS[key]);
      });
      var STAR = { '低': 1, '中': 2, '中高': 3, '高': 4 };
      card.querySelectorAll('tr').forEach(function (tr) {
        var tds = tr.querySelectorAll('td');
        if (tds.length < 2) return;
        var lv = STAR[tds[1].textContent.trim()];
        if (!lv) return;
        var s = el('span', 'stars');
        for (var i = 1; i <= 4; i++) {
          var st = el('span', i <= lv ? '' : 'off', '★');
          s.appendChild(st);
        }
        tds[1].textContent = '';
        tds[1].appendChild(s);
      });
    });
    var tip = body.querySelector('.container > .tip');
    var bar = el('div', 'op-tabs');
    var defs = [['全部', null], ['突击', 'c-assault'], ['支援', 'c-support'], ['侦察', 'c-recon'], ['工程', 'c-engineer']];
    defs.forEach(function (def, idx) {
      var b = el('button', idx === 0 ? 'on' : '', def[0]);
      b.addEventListener('click', function () {
        bar.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        sections.forEach(function (s) {
          var show = !def[1] || s.cls === def[1];
          // 用 hidden 属性而不是 display:none，CSS 可控 fallback
          if (show) { s.h2.removeAttribute('hidden'); s.card.removeAttribute('hidden'); }
          else { s.h2.setAttribute('hidden', ''); s.card.setAttribute('hidden', ''); }
        });
      });
      bar.appendChild(b);
    });
    if (tip && tip.parentNode) tip.parentNode.insertBefore(bar, tip.nextSibling);
  })();

  /* ---- 8. 黑话词典：翻牌化（保留原 table）---- */
  (function squad() {
    if (P !== 'squad') return;
    var table = body.querySelector('.card table');
    if (!table) return;
    var rows = table.querySelectorAll('tr');
    var grid = el('div', 'flip-grid');
    rows.forEach(function (tr) {
      if (tr.querySelector('th')) return;
      var tds = tr.querySelectorAll('td');
      if (tds.length < 2) return;
      var term = tds[0].textContent.trim();
      var mean = tds[1].textContent.trim();
      var flip = el('div', 'flip');
      flip.innerHTML =
        '<div class="flip-inner">' +
        '<div class="flip-face flip-front"><div class="f-term"></div><div class="f-hint">点击解密 ▸</div></div>' +
        '<div class="flip-face flip-back"></div>' +
        '</div>';
      flip.querySelector('.f-term').textContent = term;
      flip.querySelector('.flip-back').textContent = mean;
      flip.addEventListener('click', function () { flip.classList.toggle('flipped'); });
      grid.appendChild(flip);
    });
    var card = table.closest('.card');
    var wrap = table.closest('.table-wrap') || table;
    card.insertBefore(grid, wrap);
    // 翻牌 grid 已显示，原表保留作为可读 fallback（不再隐藏）
    // 更新区标题
    var prev = card.previousElementSibling;
    if (prev && prev.classList.contains('section-title')) {
      var hh = prev.matches('h2') ? prev : prev.querySelector('h2');
      if (hh) hh.textContent = '黑话情报卡（点击卡片解密）';
    }
  })();

  /* ---- 9. 新手作战清单：可勾选 + 本地保存 ---- */
  (function newbie() {
    if (P !== 'newbie') return;
    var target = null;
    body.querySelectorAll('h2.section-title').forEach(function (h2) {
      if (h2.textContent.indexOf('第一周任务清单') > -1) {
        var next = h2.nextElementSibling;
        if (next && next.classList.contains('card')) target = next;
      }
    });
    if (!target) return;
    var ol = target.querySelector('ol.list');
    if (!ol) return;
    var items = [];
    ol.querySelectorAll('li').forEach(function (li) {
      items.push({ t: li.innerHTML, done: false });
    });
    var KEY = 'df_tasks_v1';
    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (saved && saved.length === items.length) items = saved;
    } catch (e) {}
    var box = el('div', 'checklist');
    var prog = el('div', 'check-progress');
    prog.appendChild(el('i'));
    items.forEach(function (it, i) {
      var lab = el('label', 'check-item' + (it.done ? ' done' : ''));
      var inp = d.createElement('input');
      inp.type = 'checkbox'; inp.checked = !!it.done;
      lab.appendChild(inp);
      lab.appendChild(el('span', 'check-box'));
      var txt = el('span', 'check-text');
      txt.innerHTML = it.t;
      lab.appendChild(txt);
      lab.addEventListener('click', function (ev) {
        ev.preventDefault();
        items[i].done = !items[i].done;
        lab.classList.toggle('done', items[i].done);
        save();
      });
      box.appendChild(lab);
    });
    function save() {
      try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
      var done = items.filter(function (x) { return x.done; }).length;
      prog.querySelector('i').style.width = (done / items.length * 100) + '%';
      if (done === items.length && items.length) toast('★ 第一周任务全部完成！老兵认证 ★', 'big');
    }
    var reset = el('button', 'check-reset', '重置清单');
    reset.addEventListener('click', function () {
      items.forEach(function (x) { x.done = false; });
      box.querySelectorAll('.check-item').forEach(function (n) { n.classList.remove('done'); });
      save();
    });
    // ol 保留为可读 fallback（不再隐藏）
    target.insertBefore(prog, ol.nextSibling);
    target.insertBefore(box, prog);
    target.insertBefore(reset, box);
    save();
  })();

  /* ---- 10. 赚钱路线：跑刀收益计算器 ---- */
  (function money() {
    if (P !== 'money') return;
    var title = null;
    body.querySelectorAll('h2.section-title').forEach(function (h) {
      if (h.textContent.indexOf('赚钱的 5 条铁律') > -1) title = h;
    });
    if (!title) return;
    var card = el('div', 'card');
    card.innerHTML =
      '<h2>跑刀收益计算器</h2>' +
      '<p>输入单局撤离带走的价值，算算每周 3 小时理论上能攒多少。</p>' +
      '<div class="calc-row">' +
      '<div class="calc-field"><label>单局撤离价值（哈夫币）</label><input type="number" id="calcV" value="30000" min="0" step="5000"></div>' +
      '<div class="calc-field"><label>每周出击窗口（1-3 次）</label><input type="range" id="calcN" min="1" max="3" step="1" value="3"></div>' +
      '</div>' +
      '<div class="calc-out"><div class="hvb" id="calcOut">0</div><div class="hvb-rank" id="calcRank"></div></div>';
    title.parentNode.insertBefore(card, title);
    var v = card.querySelector('#calcV'), n = card.querySelector('#calcN');
    var out = card.querySelector('#calcOut'), rank = card.querySelector('#calcRank');
    var cur = 0;
    function fmt(x) { return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    function calc() {
      var val = Math.max(0, parseInt(v.value, 10) || 0);
      var times = parseInt(n.value, 10);
      var total = val * times;
      var from = cur;
      var t0 = Date.now();
      (function anim() {
        var p = Math.min(1, (Date.now() - t0) / 450);
        cur = Math.round(from + (total - from) * (1 - Math.pow(1 - p, 3)));
        out.textContent = '₪ ' + fmt(cur);
        if (p < 1) requestAnimationFrame(anim);
      })();
      var r;
      if (total < 50000) r = '新手跑刀鼠 · 稳住别贪';
      else if (total < 150000) r = '老鼠王 · 保险箱在向你招手';
      else if (total < 400000) r = '搬砖大师 · 半装可以安排了';
      else r = '哈夫币印刷机 · 大红在等你';
      rank.textContent = r;
    }
    v.addEventListener('input', calc);
    n.addEventListener('input', calc);
    calc();
  })();

  /* ---- 11. 地图攻略：威胁等级 ---- */
  (function maps() {
    if (P !== 'maps') return;
    function threatOf(title) {
      if (title.indexOf('零号大坝') > -1) return [1, '威胁等级 · 低'];
      if (title.indexOf('长弓溪谷') > -1) return [2, '威胁等级 · 中'];
      if (title.indexOf('潮汐监狱') > -1) return [3, '威胁等级 · 中高'];
      if (title.indexOf('航天') > -1 || title.indexOf('巴克什') > -1) return [5, '威胁等级 · 极高'];
      if (title.indexOf('通用思路') > -1) return null;
      return [3, '威胁等级 · 中'];
    }
    body.querySelectorAll('.card').forEach(function (card) {
      var h3 = card.querySelector('h3');
      if (!h3) return;
      var t = threatOf(h3.textContent);
      if (!t) return;
      var lv = t[0], label = t[1];
      var th = el('div', 'threat lv' + lv);
      var cells = el('div', 't-cells');
      for (var i = 0; i < 5; i++) cells.appendChild(el('i', i < lv ? 'f' : ''));
      th.appendChild(el('span', 't-label', label));
      th.appendChild(cells);
      h3.parentNode.insertBefore(th, h3.nextSibling);
    });
  })();

  /* ---- 12. 每周速览：简报印章 ---- */
  (function weekly() {
    if (P !== 'weekly') return;
    var first = body.querySelector('.container .card');
    if (first) first.classList.add('stamp-card');
  })();

})();
