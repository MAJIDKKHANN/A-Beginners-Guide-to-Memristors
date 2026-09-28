/* Interactive "Try it yourself" boxes for A Beginner's Guide to Memristors.
   Each lab only starts if its elements are on the page. */
(function () {
  var INK = '#1A1A1A', ACC = '#0F6B4E', RED = '#B3362B', PIPE = '#F3F7F5', TINT = '#E3F1EB';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(id) { return document.getElementById(id); }
  function gauss() { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

  /* ---------- Chapter 1: the sliding door ---------- */
  function doorLab() {
    var svg = $('door-svg'); if (!svg) return;
    var RON = 1, ROFF = 100, W = 440, top = 48, bot = 150, mid = 99, wx = 206, ww = 28;
    var o = 0.3, target = 0.3, power = true, dots = [];
    for (var i = 0; i < 16; i++) dots.push({ x: 14 + Math.random() * 412, y: mid + (Math.random() - 0.5) * 88, v: 0.6 + Math.random() * 0.8 });
    function draw() {
      var gap = 6 + 86 * o, g0 = mid - gap / 2, g1 = mid + gap / 2, s = '';
      s += '<rect x="6" y="' + top + '" width="' + (W - 12) + '" height="' + (bot - top) + '" fill="' + PIPE + '"/>';
      s += '<path d="M6 ' + top + ' H' + (W - 6) + ' M6 ' + bot + ' H' + (W - 6) + '" stroke="' + INK + '" stroke-width="2"/>';
      dots.forEach(function (d) { s += '<circle cx="' + d.x.toFixed(1) + '" cy="' + d.y.toFixed(1) + '" r="4.5" fill="' + ACC + '" opacity="' + (power ? 1 : 0.3) + '"/>'; });
      s += '<rect x="' + wx + '" y="' + top + '" width="' + ww + '" height="' + Math.max(0, g0 - top) + '" fill="' + INK + '"/>';
      s += '<rect x="' + wx + '" y="' + g1 + '" width="' + ww + '" height="' + Math.max(0, bot - g1) + '" fill="' + INK + '"/>';
      var b = power ? o : 0, cx = 404, cy = 22;
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="9" fill="' + (b > 0.02 ? TINT : '#FFFFFF') + '" stroke="' + INK + '" stroke-width="2"/>';
      if (b > 0.02) for (var k = 0; k < 8; k++) {
        var a = k * Math.PI / 4, r0 = 13, r1 = 13 + 14 * b;
        s += '<path d="M' + (cx + r0 * Math.cos(a)).toFixed(1) + ' ' + (cy + r0 * Math.sin(a)).toFixed(1) + ' L' + (cx + r1 * Math.cos(a)).toFixed(1) + ' ' + (cy + r1 * Math.sin(a)).toFixed(1) + '" stroke="' + ACC + '" stroke-width="2" stroke-linecap="round"/>';
      }
      s += '<text class="lbl-grey" x="380" y="27" text-anchor="end">bulb</text>';
      s += '<text class="' + (power ? 'lbl-acc' : 'lbl-red') + '" x="10" y="27">' + (power ? 'power on' : 'power off') + '</text>';
      svg.innerHTML = s;
    }
    function step() {
      o += (target - o) * 0.15;
      if (power) {
        var gap = 6 + 86 * o, g0 = mid - gap / 2 + 5, g1 = mid + gap / 2 - 5;
        dots.forEach(function (d) {
          var nx = d.x + d.v * 2;
          if (nx + 5 > wx && d.x - 5 < wx + ww) {
            if (g1 > g0) d.y += (Math.min(Math.max(d.y, g0), g1) - d.y) * 0.2;
            if (d.y < g0 - 1 || d.y > g1 + 1 || g1 <= g0) nx = d.x;
          }
          d.x = nx;
          if (d.x > W - 14) { d.x = 14; d.y = mid + (Math.random() - 0.5) * 88; }
        });
      }
      draw();
      if (!reduce) requestAnimationFrame(step);
    }
    function update(text, bad) {
      $('door-open-v').textContent = Math.round(target * 100) + '%';
      $('door-res-v').textContent = (ROFF - (ROFF - RON) * target).toFixed(1) + ' kΩ';
      $('door-pow-v').textContent = power ? 'on' : 'off';
      $('door-open').disabled = !power || target >= 1;
      $('door-close').disabled = !power || target <= 0;
      $('door-plug').textContent = power ? 'Pull the plug' : 'Plug it back in';
      var m = $('door-msg'); m.textContent = text; m.className = 'msg' + (bad ? ' bad' : '');
      if (reduce) { o = target; draw(); }
    }
    $('door-open').addEventListener('click', function () { target = Math.min(1, +(target + 0.2).toFixed(2)); update(target >= 1 ? 'Wide open. The resistance is as low as it goes.' : 'The door slid open a little. More electrons squeeze through.'); });
    $('door-close').addEventListener('click', function () { target = Math.max(0, +(target - 0.2).toFixed(2)); update(target <= 0 ? 'Shut tight. Almost nothing gets through.' : 'The door slid closed a little. A queue forms.'); });
    $('door-plug').addEventListener('click', function () {
      power = !power;
      if (!power) update('Power is off and nothing moves. But the door is still ' + Math.round(target * 100) + '% open. It remembers.', true);
      else update('Power is back. The door carries on from exactly where it stopped.');
    });
    update('Electrons are walking through. Try pushing the door open.');
    draw();
    if (!reduce) requestAnimationFrame(step);
  }

  /* ---------- Chapter 4: play the voltage sweep ---------- */
  function ivLab() {
    var dot = $('iv-dot'); if (!dot) return;
    var X = function (v) { return 320 + v * 170; }, Y = function (i) { return 210 - i * 150; };
    var pts = [], state = 'H';
    function cur(v) { var i = v / (state === 'H' ? 10 : 1); return Math.min(i, 0.8); }
    function seg(a, b, stepA, stepB) {
      var n = 60, switched = false;
      for (var k = 0; k <= n; k++) {
        var v = +(a + (b - a) * k / n).toFixed(3);
        if ((state === 'H' && v >= 1.0 && b > a) || (state === 'L' && v <= -1.0 && b < a)) {
          pts.push({ v: v, i: cur(v), s: stepA, st: state });
          state = state === 'H' ? 'L' : 'H'; switched = true;
        }
        pts.push({ v: v, i: cur(v), s: switched ? stepB : stepA, st: state });
      }
    }
    seg(0, 1.2, 1, 2); seg(1.2, 0, 3, 3); seg(0, -1.2, 4, 5); seg(-1.2, 0, 6, 6);
    var items = document.querySelectorAll('#iv-steps li'), idx = 0, playing = false;
    function show(p) {
      dot.setAttribute('cx', X(p.v).toFixed(1)); dot.setAttribute('cy', Y(p.i).toFixed(1));
      $('iv-v').textContent = (p.v >= 0 ? '+' : '') + p.v.toFixed(2) + ' V';
      $('iv-i').textContent = (p.i >= 0 ? '+' : '') + p.i.toFixed(2) + ' mA';
      $('iv-s').textContent = p.st === 'H' ? 'closed (high resistance)' : 'open (low resistance)';
      items.forEach(function (li) { li.classList.toggle('on', +li.getAttribute('data-step') === p.s); });
    }
    function tick() {
      if (!playing) return;
      show(pts[idx]); idx += 1;
      if (idx >= pts.length) { playing = false; $('iv-play').textContent = 'Play it again'; $('iv-play').disabled = false; return; }
      setTimeout(tick, 22);
    }
    $('iv-play').addEventListener('click', function () {
      if (reduce) { show(pts[pts.length - 1]); return; }
      idx = 0; playing = true; this.disabled = true; tick();
    });
    show(pts[0]);
  }

  /* ---------- Chapter 7: a crossbar that multiplies ---------- */
  function xbarLab() {
    if (!$('xbar-lab')) return;
    var G = [[2, 0.5], [1, 1.5], [0.5, 2]], MAX = 3.5;
    var ins = [0, 1, 2].map(function (r) { return $('xv' + r); });
    function calc() {
      var V = ins.map(function (el) { return +el.value; });
      V.forEach(function (v, r) { $('xv' + r + 'o').textContent = v.toFixed(1) + ' V'; var t = $('sv' + r); if (t) t.textContent = v.toFixed(1) + ' V'; });
      [0, 1].forEach(function (c) {
        var I = 0, parts = [];
        V.forEach(function (v, r) { I += v * G[r][c]; parts.push(v.toFixed(1) + '×' + G[r][c]); });
        $('xi' + c).textContent = I.toFixed(2) + ' mA';
        $('xb' + c).style.width = Math.min(100, I / MAX * 100).toFixed(1) + '%';
        $('xf' + c).textContent = parts.join(' + ') + ' = ' + I.toFixed(2) + ' mA';
      });
    }
    ins.forEach(function (el) { el.addEventListener('input', calc); });
    calc();
  }

  /* ---------- Chapter 8: chip fingerprints ---------- */
  function pufLab() {
    var svg = $('puf-svg'); if (!svg) return;
    var chip = null, ref = null, prevBits = null, chipNo = 0;
    function mix(t) {
      var a = [227, 241, 235], b = [15, 107, 78];
      return 'rgb(' + a.map(function (x, k) { return Math.round(x + (b[k] - x) * t); }).join(',') + ')';
    }
    function read(noise) { return chip.map(function (r) { return r * (1 + noise * gauss()); }); }
    function bitsOf(vals) { var out = []; for (var r = 0; r < 4; r++) for (var p = 0; p < 2; p++) { var a = vals[r * 4 + p * 2], b = vals[r * 4 + p * 2 + 1]; out.push(a > b ? 1 : 0); } return out; }
    function draw(vals, bits) {
      var s = '', cw = 78, ch = 46, gx = 16, x0 = 20, y0 = 20;
      for (var r = 0; r < 4; r++) {
        for (var c = 0; c < 4; c++) {
          var R = vals[r * 4 + c], t = Math.max(0, Math.min(1, (Math.log(R) - Math.log(8)) / (Math.log(50) - Math.log(8))));
          var x = x0 + c * cw + (c >= 2 ? gx : 0) + (c % 2 ? 4 : 0), y = y0 + r * (ch + 12);
          s += '<rect x="' + x + '" y="' + y + '" width="' + (cw - 6) + '" height="' + ch + '" fill="' + mix(t) + '" stroke="' + INK + '" stroke-width="1.5"/>';
          s += '<text x="' + (x + (cw - 6) / 2) + '" y="' + (y + 28) + '" text-anchor="middle" class="' + (t > 0.55 ? 'lbl-w' : 'lbl') + '">' + R.toFixed(1) + ' kΩ</text>';
        }
        for (var p = 0; p < 2; p++) {
          var bx = x0 + p * (2 * cw + gx), by = y0 + r * (ch + 12) + ch + 4;
          s += '<path d="M' + (bx + 2) + ' ' + (by - 2) + ' V' + by + ' H' + (bx + 2 * cw - 4) + ' V' + (by - 2) + '" stroke="' + INK + '" stroke-width="1" fill="none"/>';
        }
        var b0 = bits[r * 2], b1 = bits[r * 2 + 1], tx = x0 + 4 * cw + gx + 34, ty = y0 + r * (ch + 12) + 30;
        s += '<text class="lbl" x="' + tx + '" y="' + ty + '">→  ' + b0 + '  ' + b1 + '</text>';
      }
      svg.innerHTML = s;
    }
    function showBits(el, bits, flips) {
      el.innerHTML = bits.map(function (b, k) { return '<span class="' + (b ? 'one' : '') + (flips && flips[k] ? ' flip' : '') + '">' + b + '</span>'; }).join('');
    }
    function newChip() {
      chipNo += 1;
      chip = []; for (var k = 0; k < 16; k++) chip.push(Math.max(3, 18 * Math.exp(0.38 * gauss())));
      if (ref) prevBits = ref;
      var vals = read(0); ref = bitsOf(vals); draw(vals, ref);
      showBits($('puf-bits'), ref);
      $('puf-title').textContent = 'Chip #' + chipNo + ' fingerprint';
      if (prevBits) {
        showBits($('puf-prev'), prevBits); $('puf-prev-wrap').hidden = false;
        var d = 0; ref.forEach(function (b, k) { if (b !== prevBits[k]) d++; });
        setMsg('A brand new chip. Its fingerprint differs from the last chip in ' + d + ' of 8 bits.', false);
      } else setMsg('This is chip #1. Build another one and compare their fingerprints.', false);
      $('puf-again').disabled = false;
    }
    function again() {
      var vals = read(0.05), bits = bitsOf(vals), flips = bits.map(function (b, k) { return b !== ref[k]; });
      draw(vals, bits); showBits($('puf-bits'), bits, flips);
      var n = flips.filter(Boolean).length;
      setMsg(n === 0 ? 'Read again: the numbers wobbled a little, but every bit came out the same.' : 'Read again: ' + n + ' bit' + (n > 1 ? 's' : '') + ' flipped (outlined in red). Those pairs were almost equal. This is why real designs add error correction.', n > 0);
    }
    function setMsg(t, bad) { var m = $('puf-msg'); m.textContent = t; m.className = 'msg' + (bad ? ' bad' : ''); }
    $('puf-new').addEventListener('click', newChip);
    $('puf-again').addEventListener('click', again);
    newChip();
  }

  doorLab(); ivLab(); xbarLab(); pufLab();
})();
