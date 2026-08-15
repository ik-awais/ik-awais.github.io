// ── PDF EXPORT (Blog & Articles only) ────────────────────────────────────
// Builds a real, text-based PDF client-side using a self-hosted, vendored
// copy of jsPDF (static/js/vendor/jspdf.umd.min.js — no CDN, no build step,
// no Node.js). Loaded lazily: the ~410KB library is only fetched the first
// time the visitor actually clicks Download, not on every article page
// load. No-ops entirely on any page without #pdfDownloadBtn.
(function () {
  'use strict';

  var btn    = document.getElementById('pdfDownloadBtn');
  var status = document.getElementById('pdfDownloadStatus');
  var dataEl = document.getElementById('pdfArticleData');
  if (!btn || !dataEl) return;

  var REUSE_NOTICE =
    'This document is confidential and is the property of Muhammad Awais. ' +
    'It may not be reused, reproduced, redistributed, republished, or otherwise ' +
    'used, in whole or in part, without prior consent from Muhammad Awais.';

  var jsPDFLoadPromise = null;

  function loadJsPDF() {
    if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve();
    if (jsPDFLoadPromise) return jsPDFLoadPromise;
    jsPDFLoadPromise = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = '/js/vendor/jspdf.umd.min.js';
      s.onload = function () {
        if (window.jspdf && window.jspdf.jsPDF) resolve();
        else reject(new Error('jsPDF failed to initialize.'));
      };
      s.onerror = function () { reject(new Error('Could not load PDF library.')); };
      document.head.appendChild(s);
    });
    return jsPDFLoadPromise;
  }

  // ── Lightweight Markdown-aware line classifier ──────────────────────────
  // Not a full Markdown parser — just enough structure (headings, lists,
  // blockquotes, code fences, paragraphs) to lay the article out with
  // readable typography instead of one flat wall of text.
  function stripInline(line) {
    return line
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
      .trim();
  }

  function parseBlocks(raw) {
    var lines  = raw.replace(/\r\n/g, '\n').split('\n');
    var blocks = [];
    var para   = [];
    var inCode = false;
    var codeLines = [];

    function flushPara() {
      if (para.length) {
        blocks.push({ type: 'p', text: stripInline(para.join(' ')) });
        para = [];
      }
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      if (/^\s*```/.test(line)) {
        if (inCode) {
          blocks.push({ type: 'code', lines: codeLines });
          codeLines = [];
          inCode = false;
        } else {
          flushPara();
          inCode = true;
        }
        continue;
      }
      if (inCode) { codeLines.push(line); continue; }

      var h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) {
        flushPara();
        blocks.push({ type: 'h', level: h[1].length, text: stripInline(h[2]) });
        continue;
      }

      if (/^\s*\|.*\|\s*$/.test(line)) {
        var next = lines[i + 1] || '';
        if (/^\s*\|?[\s:|-]+\|[\s:|-]*\|?\s*$/.test(next) && /-/.test(next)) {
          flushPara();
          var splitRow = function (l) {
            var cells = l.split('|').map(function (c) { return c.trim(); });
            if (cells.length && cells[0] === '') cells.shift();
            if (cells.length && cells[cells.length - 1] === '') cells.pop();
            return cells;
          };
          var headerCells = splitRow(line);
          var rows = [];
          var j = i + 2;
          while (j < lines.length && /^\s*\|.*\|\s*$/.test(lines[j])) {
            rows.push(splitRow(lines[j]).map(stripInline));
            j++;
          }
          blocks.push({ type: 'table', header: headerCells, rows: rows });
          i = j - 1;
          continue;
        }
      }

      if (/^\s*[-*]\s+/.test(line)) {
        flushPara();
        blocks.push({ type: 'li', text: stripInline(line.replace(/^\s*[-*]\s+/, '')) });
        continue;
      }
      if (/^\s*\d+\.\s+/.test(line)) {
        flushPara();
        blocks.push({ type: 'li', text: stripInline(line.replace(/^\s*\d+\.\s+/, '')) });
        continue;
      }

      if (/^\s*>\s?/.test(line)) {
        flushPara();
        blocks.push({ type: 'quote', text: stripInline(line.replace(/^\s*>\s?/, '')) });
        continue;
      }

      if (/^\s*$/.test(line)) { flushPara(); continue; }
      if (/^\s*(---+|\*\*\*+|___+)\s*$/.test(line)) { flushPara(); blocks.push({ type: 'hr' }); continue; }

      para.push(line.trim());
    }
    flushPara();
    if (inCode && codeLines.length) blocks.push({ type: 'code', lines: codeLines });

    return blocks;
  }

  // ── Layout constants ─────────────────────────────────────────────────
  var PAGE_W = 612, PAGE_H = 792;
  var MARGIN_X = 56, TOP = 92, BOTTOM = 66;
  var LINE_H = 15;

  function drawPageChrome(doc) {
    // CONFIDENTIAL header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(150, 40, 40);
    doc.text('CONFIDENTIAL', MARGIN_X, 40);
    doc.setDrawColor(220, 220, 220);
    doc.line(MARGIN_X, 48, PAGE_W - MARGIN_X, 48);

    // Diagonal repeated watermark — real vector text embedded in the PDF,
    // not a screen/print overlay.
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.07 }));
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(34);
    doc.setTextColor(20, 20, 20);
    var rows = [160, 340, 520, 700];
    rows.forEach(function (y) {
      doc.text('Muhammad Awais', PAGE_W / 2, y, { align: 'center', angle: 35 });
    });
    doc.restoreGraphicsState();
  }

  function drawFooter(doc, pageNum) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text('\u00A9 Muhammad Awais — Confidential', MARGIN_X, PAGE_H - 28);
    doc.text(String(pageNum), PAGE_W - MARGIN_X, PAGE_H - 28, { align: 'right' });
  }

  function buildPdf(data) {
    var doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'letter' });
    var pageNum = 1;
    var y = TOP;

    drawPageChrome(doc);
    drawFooter(doc, pageNum);

    function newPage() {
      drawFooter(doc, pageNum);
      doc.addPage();
      pageNum++;
      drawPageChrome(doc);
      y = TOP;
    }

    function ensureRoom(need) {
      if (y + need > PAGE_H - BOTTOM) newPage();
    }

    function writeWrapped(text, opts) {
      opts = opts || {};
      var size   = opts.size || 10.5;
      var style  = opts.style || 'normal';
      var indent = opts.indent || 0;
      var color  = opts.color || [30, 30, 30];
      var lineH  = opts.lineH || LINE_H;

      doc.setFont('helvetica', style);
      doc.setFontSize(size);
      var maxWidth = PAGE_W - MARGIN_X * 2 - indent;
      var wrapped  = doc.splitTextToSize(text, maxWidth);
      wrapped.forEach(function (ln) {
        ensureRoom(lineH);
        // Re-applied per line: a page break above (ensureRoom -> newPage ->
        // drawPageChrome) changes the doc's font/color state for the
        // CONFIDENTIAL header and watermark, so it must be restored here
        // rather than relying on the single call made before this loop.
        doc.setFont('helvetica', style);
        doc.setFontSize(size);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(ln, MARGIN_X + indent, y);
        y += lineH;
      });
    }

    // Title
    ensureRoom(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(15, 15, 15);
    var titleLines = doc.splitTextToSize(data.title, PAGE_W - MARGIN_X * 2);
    titleLines.forEach(function (ln) {
      ensureRoom(24);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(15, 15, 15);
      doc.text(ln, MARGIN_X, y);
      y += 24;
    });
    y += 4;

    // Meta line
    var metaParts = [];
    if (data.date) metaParts.push(data.date);
    if (data.author) metaParts.push('By ' + data.author);
    if (metaParts.length) {
      writeWrapped(metaParts.join('   \u00B7   '), { size: 9.5, color: [120, 120, 120] });
      y += 10;
    } else {
      y += 6;
    }

    // Body
    var blocks = parseBlocks(data.raw || '');
    blocks.forEach(function (b) {
      if (b.type === 'h') {
        y += b.level <= 2 ? 14 : 8;
        ensureRoom(22);
        writeWrapped(b.text, { size: b.level <= 2 ? 14.5 : 12.5, style: 'bold', color: [15, 15, 15] });
        y += 4;
      } else if (b.type === 'p') {
        writeWrapped(b.text, {});
        y += 8;
      } else if (b.type === 'li') {
        writeWrapped('\u2022  ' + b.text, { indent: 4 });
        y += 3;
      } else if (b.type === 'quote') {
        writeWrapped(b.text, { style: 'italic', indent: 16, color: [90, 90, 90] });
        y += 6;
      } else if (b.type === 'table') {
        y += 4;
        b.rows.forEach(function (row) {
          var rowText = b.header.map(function (h, idx) {
            var val = row[idx] || '';
            return h ? (h + ': ' + val) : val;
          }).join('   \u2013   ');
          ensureRoom(LINE_H);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(60, 60, 60);
          var maxWidth = PAGE_W - MARGIN_X * 2 - 10;
          var wrapped = doc.splitTextToSize(rowText, maxWidth);
          wrapped.forEach(function (ln) {
            ensureRoom(LINE_H);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(60, 60, 60);
            doc.text(ln, MARGIN_X + 6, y);
            y += LINE_H - 2;
          });
          ensureRoom(6);
          doc.setDrawColor(235, 235, 235);
          doc.line(MARGIN_X, y - 4, PAGE_W - MARGIN_X, y - 4);
          y += 4;
        });
        y += 8;
      } else if (b.type === 'code') {
        var codeText = b.lines.join('\n');
        doc.setFont('courier', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(40, 40, 40);
        var maxW = PAGE_W - MARGIN_X * 2 - 12;
        var codeWrapped = [];
        b.lines.forEach(function (l) {
          var w = doc.splitTextToSize(l.length ? l : ' ', maxW);
          codeWrapped = codeWrapped.concat(w);
        });
        var blockH = codeWrapped.length * 11 + 12;
        ensureRoom(Math.min(blockH, PAGE_H - TOP - BOTTOM));
        doc.setFillColor(245, 245, 247);
        var boxTop = y - 9;
        var boxH   = Math.min(blockH, PAGE_H - BOTTOM - boxTop);
        doc.rect(MARGIN_X - 4, boxTop, PAGE_W - MARGIN_X * 2 + 8, boxH, 'F');
        codeWrapped.forEach(function (ln) {
          ensureRoom(11);
          doc.setFont('courier', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(40, 40, 40);
          doc.text(ln, MARGIN_X + 2, y);
          y += 11;
        });
        y += 10;
      } else if (b.type === 'hr') {
        ensureRoom(16);
        doc.setDrawColor(220, 220, 220);
        doc.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
        y += 16;
      }
    });

    // Reuse / license notice — always present, own clearly separated block
    y += 14;
    ensureRoom(70);
    doc.setDrawColor(190, 190, 190);
    doc.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
    y += 18;
    writeWrapped('Usage & Distribution', { size: 10.5, style: 'bold', color: [15, 15, 15] });
    y += 4;
    writeWrapped(REUSE_NOTICE, { size: 9, color: [90, 90, 90], lineH: 12.5 });

    drawFooter(doc, pageNum);

    var safeSlug = (data.slug || 'article').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
    doc.save(safeSlug + '-muhammad-awais.pdf');
  }

  btn.addEventListener('click', function () {
    var data;
    try {
      data = JSON.parse(dataEl.textContent);
    } catch (e) {
      if (status) status.textContent = 'Could not prepare this article for download.';
      return;
    }

    btn.disabled = true;
    if (status) status.textContent = 'Preparing PDF\u2026';

    loadJsPDF()
      .then(function () {
        buildPdf(data);
        if (status) status.textContent = 'Downloaded.';
      })
      .catch(function () {
        if (status) status.textContent = 'Could not generate the PDF. Please try again.';
      })
      .finally(function () {
        btn.disabled = false;
      });
  });
})();
