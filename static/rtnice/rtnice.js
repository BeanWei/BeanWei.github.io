var RichTextNiceService = (function () {
  'use strict';

  var replacements = {};

  replacements.media = {
    filter: ['img', 'audio', 'video'],

    replacement: function (content, node, options) {
      node.removeAttribute('id');
      node.removeAttribute('class');
      node.removeAttribute('style');
      if (node.nodeName == 'IMG') {
          node.removeAttribute('width');
          node.removeAttribute('height');
          var preEl = document.createElement('figure');
          preEl.appendChild(node);
          node = preEl.childNodes[0];
      }
      return preEl ? preEl.outerHTML : node.outerHTML
    }
  };

  replacements.heading = {
    filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],

    replacement: function (content, node, options) {
      return `<${node.nodeName.toLowerCase()}><span class="prefix"></span><span class="content">${content}</span><span class="suffix"></span></${node.nodeName.toLowerCase()}>`
    }
  };

  replacements.lineBreak = {
    filter: 'br',

    replacement: function (content, node, options) {
      return ''
    }
  };

  replacements.list = {
    filter: ['ol'],

    replacement: function (content, node, options) {
      return `<ol start="${node.getAttribute('start')}">${content}</ol>`
    }
  };

  replacements.codeBlock = {
    filter: function (node) {
      return (
        node.nodeName === 'PRE' &&
        node.firstChild &&
        node.firstChild.nodeName === 'CODE'
      )
    },

    replacement: function(content, node, options) {
      var codeText = node.firstChild.textContent;
      if (!codeText.trim()) return ''
      var lines = codeText.split("\n");
      var className = node.firstChild.getAttribute('class') || '';
      var language = (className.match(/language-(\S+)/) || [null, ''])[1] || className.replace('hljs', '').trim();
      var codeLines = [];
      var numbers = [];
      for (let i = 0; i < lines.length - 1; i++) {
        codeLines.push(`<code class="${className}"><span class="code-snippet_outer">` + (lines[i] || "<br>") + "</span></code>");
        numbers.push(`<li>${i+1}</li>`);
      }
      return (
        '<section class="code-snippet_fix code-snippet_js">' +
        '<ul class="code-snippet_line-index code-snippet_js">' +
        numbers.join("") +
        "</ul>" +
        '<pre class="code-snippet_js" data-lang="' +
        language +
        '">' +
        codeLines.join("") +
        "</pre></section>"
      )
    }
  };

  var cssTemplates = {};

  cssTemplates.basic = {
      '#rtnice': `font-size: 16px; color: black; padding: 0 10px; line-height: 1.6; word-spacing: 0px; letter-spacing: 0px; word-break: break-word; word-wrap: break-word; text-align: left; font-family: Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, 'PingFang SC', Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;`,
      'a': `text-decoration: none; color: #1e6bb8; word-wrap: break-word; font-weight: bold; border-bottom: 1px solid #1e6bb8;`,
      'p': `font-size: 16px; padding-top: 8px; padding-bottom: 8px; margin: 0; line-height: 26px; color: black;`,
      'h1': `font-size: 24px; margin-top: 30px; margin-bottom: 15px; padding: 0px; font-weight: bold; color: black;`,
      'h2': `font-size: 22px; margin-top: 30px; margin-bottom: 15px; padding: 0px; font-weight: bold; color: black;`,
      'h3': `font-size: 20px; margin-top: 30px; margin-bottom: 15px; padding: 0px; font-weight: bold; color: black;`,
      'h4': `font-size: 18px; margin-top: 30px; margin-bottom: 15px; padding: 0px; font-weight: bold; color: black;`,
      'h5': `font-size: 16px; margin-top: 30px; margin-bottom: 15px; padding: 0px; font-weight: bold; color: black;`,
      'h6': `font-size: 16px; margin-top: 30px; margin-bottom: 15px; padding: 0px; font-weight: bold; color: black;`,
      'h1 .prefix': `display: none;`,
      'h2 .prefix': `display: none;`,
      'h3 .prefix': `display: none;`,
      'h4 .prefix': `display: none;`,
      'h5 .prefix': `display: none;`,
      'h6 .prefix': `display: none;`,
      'h1 .content': `display: inline-block;`,
      'h2 .content': `display: inline-block;`,
      'h3 .content': `display: inline-block;`,
      'h4 .content': `display: inline-block;`,
      'h5 .content': `display: inline-block;`,
      'h6 .content': `display: inline-block;`,
      'h1 .suffix': `display: none;`,
      'h2 .suffix': `display: none;`,
      'h3 .suffix': `display: none;`,
      'h4 .suffix': `display: none;`,
      'h5 .suffix': `display: none;`,
      'h6 .suffix': `display: none;`,
      'ul': `margin-top: 8px; margin-bottom: 8px; padding-left: 25px; color: black; list-style-type: disc;`,
      'ul ul': `list-style-type: square;`,
      'ol': `margin-top: 8px; margin-bottom: 8px; padding-left: 25px; color: black; list-style-type: decimal;`,
      'li section': `margin-top: 5px; margin-bottom: 5px; line-height: 26px; text-align: left; color: rgb(1,1,1); font-weight: 500;`,
      'blockquote': `display: block; font-size: 0.9em; overflow: auto; overflow-scrolling: touch; border-left: 3px solid rgba(0, 0, 0, 0.4); background: rgba(0, 0, 0, 0.05); color: #6a737d; padding-top: 10px; padding-bottom: 10px; padding-left: 20px; padding-right: 10px; margin-bottom: 20px; margin-top: 20px;`,
      'blockquote p': `margin: 0px; color: black; line-height: 26px;`,
      'strong': `font-weight: bold; color: black;`,
      'em': `font-style: italic; color: black;`,
      'em strong': `font-weight: bold; color: black;`,
      'del': `font-style: italic; color: black;`,
      'hr': `height: 1px; margin: 0; margin-top: 10px; margin-bottom: 10px; border: none; border-top: 1px solid black;`,
      'img': `display: block; margin: 0 auto; max-width: 100%;`,
      'figcaption': `margin-top: 5px; text-align: center; color: #888; font-size: 14px;`,
      'table': `display: table; text-align: left; border-collapse: collapse;`,
      'tbody': `border: 0;`,
      'tbody tr': `border: 0; border-top: 1px solid #ccc; background-color: white;`,
      'tbody tr th': `font-size: 16px; border: 1px solid #ccc; padding: 5px 10px; text-align: left; font-weight: bold; background-color: #f0f0f0;`,
      'tbody tr td': `font-size: 16px; border: 1px solid #ccc; padding: 5px 10px; text-align: left;`,
      'table tr:nth-child(2n)': `background-color: #F8F8F8;`,
      'table tr th:nth-of-type(n)': `min-width:85px;`,
      'table tr td:nth-of-type(n)': `min-width:85px;`,
      'sub': `line-height: 0;`,
      'sup': `line-height: 0;`,
      'figure': `margin: 0; margin-top: 10px; margin-bottom: 10px; display:flex; flex-direction: column; justify-content: center; align-items: center;`,
      'figure a': `border: none;`,
      'figure a img': `margin: 0px;`,
      'figure a + figcaption': `display: flex; justify-content: center; align-items: center; width: 100%; margin-top: -35px; background: rgba(0,0,0,0.7); color: white; line-height: 35px; z-index: 20;`,

      // code block - [WeChat Style]
      'pre': `margin-top: 0px; margin-bottom: 10px;`,
      'pre code': `display: -webkit-box; font-family: Operator Mono, Consolas, Monaco, Menlo, monospace; border-radius: 0px; font-size: 12px; -webkit-overflow-scrolling: touch;`,
      'p code': `font-size: 14px; word-wrap: break-word; padding: 2px 4px; border-radius: 4px; margin: 0 2px; color: #1e6bb8; background-color: rgba(27,31,35,.05); font-family: Operator Mono, Consolas, Monaco, Menlo, monospace; word-break: break-all;`,
      'li code': `font-size: 14px; word-wrap: break-word; padding: 2px 4px; border-radius: 4px; margin: 0 2px; color: #1e6bb8; background-color: rgba(27,31,35,.05); font-family: Operator Mono, Consolas, Monaco, Menlo, monospace; word-break: break-all;`,
      'pre code span': `line-height: 26px;`,
      '.code-snippet_fix': `word-wrap: break-word !important; font-size: 14px; margin: 10px 0; display: block; color: #333; position: relative; background-color: rgba(0,0,0,0.03); border: 1px solid #f0f0f0; border-radius: 2px; display: flex; line-height: 20px;`,
      '.code-snippet_fix pre': `margin-bottom: 10px; margin-top: 0px;`,
      '.code-snippet_fix .code-snippet_line-index': `counter-reset: line; flex-shrink: 0; height: 100%; padding: 1em; list-style-type: none; padding: 16px; margin: 0;`,
      '.code-snippet_fix .code-snippet_line-index li': `list-style-type: none; text-align: right; line-height: 26px; color: rgba(0,0,0,0.3); margin: 0;`,
      // TODO: Support counter-increment
      '.code-snippet_fix .code-snippet_line-index li::after': `min-width: 1.5em; text-align: right; left: -2.5em; counter-increment: line; content: counter(line); display: inline; color: rgba(0,0,0,0.3);`,
      '.code-snippet_fix pre': `overflow-x: auto; padding: 16px; padding-left: 0; white-space: normal; flex: 1; -webkit-overflow-scrolling: touch;`,
      '.code-snippet_fix code': `text-align: left; font-size: 14px; display: block; white-space: pre; display: flex; position: relative; font-family: Consolas,"Liberation Mono",Menlo,Courier,monospace; padding: 0px;`
  };

  cssTemplates.orange = {
      'a': `text-decoration: none; color: rgb(239, 112, 96); word-wrap: break-word; font-weight: bold; border-bottom: 1px solid rgb(239, 112, 96);`,
      'h2': `border-bottom: 2px solid rgb(239, 112, 96); font-size: 1.3em; margin-top: 30px; margin-bottom: 15px; padding: 0px; font-weight: bold; color: black;`,
      'h2 .content': `display: inline-block; font-weight: bold; background: rgb(239, 112, 96); color: #ffffff; padding: 3px 10px 1px; border-top-right-radius: 3px; border-top-left-radius: 3px; margin-right: 3px;`,
      'h2::after': `display: inline-block; content: " "; vertical-align: bottom; border-bottom: 36px solid #efebe9; border-right: 20px solid transparent;`,
      'blockquote': `display: block; font-size: 0.9em; overflow: auto; overflow-scrolling: touch; border-left: 3px solid rgb(239, 112, 96); background: #fff9f9; color: #6a737d; padding-top: 10px; padding-bottom: 10px; padding-left: 20px; padding-right: 10px; margin-bottom: 20px; margin-top: 20px;`,
      'p code': `font-size: 14px; word-wrap: break-word; padding: 2px 4px; border-radius: 4px; margin: 0 2px; color: rgb(239, 112, 96); background-color: rgba(27,31,35,.05); font-family: Operator Mono, Consolas, Monaco, Menlo, monospace; word-break: break-all;`,
      'li code': `font-size: 14px; word-wrap: break-word; padding: 2px 4px; border-radius: 4px; margin: 0 2px; color: rgb(239, 112, 96); background-color: rgba(27,31,35,.05); font-family: Operator Mono, Consolas, Monaco, Menlo, monospace; word-break: break-all;`,
  };

  /**
   * Manages a collection of rules used to convert HTML to Markdown
   */

  function Rules (options) {
    this.options = options;
    this._keep = [];
    this._remove = [];

    this.blankRule = {
      replacement: options.blankReplacement
    };

    this.keepReplacement = options.keepReplacement;

    this.defaultRule = {
      replacement: options.defaultReplacement
    };

    this.array = [];
    for (var key in options.rules) this.array.push(options.rules[key]);
  }

  Rules.prototype = {
    add: function (key, rule) {
      this.array.unshift(rule);
    },

    keep: function (filter) {
      this._keep.unshift({
        filter: filter,
        replacement: this.keepReplacement
      });
    },

    remove: function (filter) {
      this._remove.unshift({
        filter: filter,
        replacement: function () {
          return ''
        }
      });
    },

    forNode: function (node) {
      if (node.isBlank) return this.blankRule
      var rule;

      if ((rule = findRule(this.array, node, this.options))) return rule
      if ((rule = findRule(this._keep, node, this.options))) return rule
      if ((rule = findRule(this._remove, node, this.options))) return rule

      return this.defaultRule
    },

    forEach: function (fn) {
      for (var i = 0; i < this.array.length; i++) fn(this.array[i], i);
    }
  };

  function findRule (rules, node, options) {
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      if (filterValue(rule, node, options)) return rule
    }
    return void 0
  }

  function filterValue (rule, node, options) {
    var filter = rule.filter;
    if (typeof filter === 'string') {
      if (filter === node.nodeName.toLowerCase()) return true
    } else if (Array.isArray(filter)) {
      if (filter.indexOf(node.nodeName.toLowerCase()) > -1) return true
    } else if (typeof filter === 'function') {
      if (filter.call(rule, node, options)) return true
    } else {
      throw new TypeError('`filter` needs to be a string, array, or function')
    }
  }

  /*
   * Set up window for Node.js
   */

  var root = (typeof window !== 'undefined' ? window : {});

  /*
   * Parsing HTML strings
   */

  function canParseHTMLNatively () {
    var Parser = root.DOMParser;
    var canParse = false;

    // Adapted from https://gist.github.com/1129031
    // Firefox/Opera/IE throw errors on unsupported types
    try {
      // WebKit returns null on unsupported types
      if (new Parser().parseFromString('', 'text/html')) {
        canParse = true;
      }
    } catch (e) {}

    return canParse
  }

  function createHTMLParser () {
    var Parser = function () {};

    {
      if (shouldUseActiveX()) {
        Parser.prototype.parseFromString = function (string) {
          var doc = new window.ActiveXObject('htmlfile');
          doc.designMode = 'on'; // disable on-page scripts
          doc.open();
          doc.write(string);
          doc.close();
          return doc
        };
      } else {
        Parser.prototype.parseFromString = function (string) {
          var doc = document.implementation.createHTMLDocument('');
          doc.open();
          doc.write(string);
          doc.close();
          return doc
        };
      }
    }
    return Parser
  }

  function shouldUseActiveX () {
    var useActiveX = false;
    try {
      document.implementation.createHTMLDocument('').open();
    } catch (e) {
      if (window.ActiveXObject) useActiveX = true;
    }
    return useActiveX
  }

  var HTMLParser = canParseHTMLNatively() ? root.DOMParser : createHTMLParser();

  function extend (destination) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (source.hasOwnProperty(key)) destination[key] = source[key];
      }
    }
    return destination
  }

  var blockElements = [
    'ADDRESS', 'ARTICLE', 'ASIDE', 'AUDIO', 'BLOCKQUOTE', 'BODY', 'CANVAS',
    'CENTER', 'DD', 'DIR', 'DIV', 'DL', 'DT', 'FIELDSET', 'FIGCAPTION', 'FIGURE',
    'FOOTER', 'FORM', 'FRAMESET', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER',
    'HGROUP', 'HR', 'HTML', 'ISINDEX', 'LI', 'MAIN', 'MENU', 'NAV', 'NOFRAMES',
    'NOSCRIPT', 'OL', 'OUTPUT', 'P', 'PRE', 'SECTION', 'TABLE', 'TBODY', 'TD',
    'TFOOT', 'TH', 'THEAD', 'TR', 'UL'
  ];

  function isBlock (node) {
    return is(node, blockElements)
  }

  var voidElements = [
    'AREA', 'BASE', 'COL', 'COMMAND', 'EMBED', 'HR', 'IMG', 'INPUT',
    'KEYGEN', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR'
  ];

  function isVoid (node) {
    return is(node, voidElements)
  }

  function hasVoid (node) {
    return has(node, voidElements)
  }

  var meaningfulWhenBlankElements = [
    'A', 'TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TH', 'TD', 'IFRAME', 'SCRIPT',
    'AUDIO', 'VIDEO'
  ];

  function isMeaningfulWhenBlank (node) {
    return is(node, meaningfulWhenBlankElements)
  }

  function hasMeaningfulWhenBlank (node) {
    return has(node, meaningfulWhenBlankElements)
  }

  function is (node, tagNames) {
    return tagNames.indexOf(node.nodeName) >= 0
  }

  function has (node, tagNames) {
    return (
      node.getElementsByTagName &&
      tagNames.some(function (tagName) {
        return node.getElementsByTagName(tagName).length
      })
    )
  }

  function nodeInsertStyles (input, styleConfigs) {
    var node;
    if (typeof input === 'string') {
      var doc = new HTMLParser().parseFromString(
        `<section id="rtnice" data-tool="RichTextNice" style="${styleConfigs['#rtnice']}" data-website="https://github.com/BeanWei/rtnice">` + input + '</section>',
        'text/html'
      );
      node = doc.getElementById('rtnice');
    } else {
      node = input.cloneNode(true);
    }
    Object.keys(styleConfigs).forEach(function(cssSelector) {
      var style = styleConfigs[cssSelector];
      var els;
      if (cssSelector.endsWith('::before')) {
        cssSelector = cssSelector.split('::before');
        cssSelector.pop();
        cssSelector = cssSelector.join('');
        els = node.querySelectorAll(cssSelector);
        if (els.length) {
          els.forEach((el) => {
            var childSpan = document.createElement('span');
            childSpan.setAttribute('style', style);
            el.parentNode.replaceChild(childSpan, el);
            childSpan.appendChild(el);
          });
        }
      } else if (cssSelector.endsWith('::after')) {
        cssSelector = cssSelector.split('::after');
        cssSelector.pop();
        cssSelector = cssSelector.join('');
        els = node.querySelectorAll(cssSelector);
        if (els.length) {
          els.forEach((el) => {
            var childSpan = document.createElement('span');
            childSpan.setAttribute('style', style);
            el.appendChild(childSpan);
          });
        }
      } else {
        els = node.querySelectorAll(cssSelector);
        if (els.length) {
          els.forEach((el) => {
            var elStyle = el.getAttribute('style') || "";
            if (elStyle != "" && !elStyle.endsWith(';')) {
              elStyle += ";";
            }
            elStyle += style;
            el.setAttribute('style', elStyle);
          });
        }
      }
    });
    return node.outerHTML
  }

  /**
   * The collapseWhitespace function is adapted from collapse-whitespace
   * by Luc Thevenard.
   *
   * The MIT License (MIT)
   *
   * Copyright (c) 2014 Luc Thevenard <lucthevenard@gmail.com>
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in
   * all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   * THE SOFTWARE.
   */

  /**
   * collapseWhitespace(options) removes extraneous whitespace from an the given element.
   *
   * @param {Object} options
   */
  function collapseWhitespace (options) {
    var element = options.element;
    var isBlock = options.isBlock;
    var isVoid = options.isVoid;
    var isPre = options.isPre || function (node) {
      return node.nodeName === 'PRE'
    };

    if (!element.firstChild || isPre(element)) return

    var prevText = null;
    var prevVoid = false;

    var prev = null;
    var node = next(prev, element, isPre);

    while (node !== element) {
      if (node.nodeType === 3 || node.nodeType === 4) { // Node.TEXT_NODE or Node.CDATA_SECTION_NODE
        var text = node.data.replace(/[ \r\n\t]+/g, ' ');

        if ((!prevText || / $/.test(prevText.data)) &&
            !prevVoid && text[0] === ' ') {
          text = text.substr(1);
        }

        // `text` might be empty at this point.
        if (!text) {
          node = remove(node);
          continue
        }

        node.data = text;

        prevText = node;
      } else if (node.nodeType === 1) { // Node.ELEMENT_NODE
        if (isBlock(node) || node.nodeName === 'BR') {
          if (prevText) {
            prevText.data = prevText.data.replace(/ $/, '');
          }

          prevText = null;
          prevVoid = false;
        } else if (isVoid(node)) {
          // Avoid trimming space around non-block, non-BR void elements.
          prevText = null;
          prevVoid = true;
        }
      } else {
        node = remove(node);
        continue
      }

      var nextNode = next(prev, node, isPre);
      prev = node;
      node = nextNode;
    }

    if (prevText) {
      prevText.data = prevText.data.replace(/ $/, '');
      if (!prevText.data) {
        remove(prevText);
      }
    }
  }

  /**
   * remove(node) removes the given node from the DOM and returns the
   * next node in the sequence.
   *
   * @param {Node} node
   * @return {Node} node
   */
  function remove (node) {
    var next = node.nextSibling || node.parentNode;

    node.parentNode.removeChild(node);

    return next
  }

  /**
   * next(prev, current, isPre) returns the next node in the sequence, given the
   * current and previous nodes.
   *
   * @param {Node} prev
   * @param {Node} current
   * @param {Function} isPre
   * @return {Node}
   */
  function next (prev, current, isPre) {
    if ((prev && prev.parentNode === current) || isPre(current)) {
      return current.nextSibling || current.parentNode
    }

    return current.firstChild || current.nextSibling || current.parentNode
  }

  function RootNode (input) {
    var root;
    if (typeof input === 'string') {
      var doc = htmlParser().parseFromString(
        // DOM parsers arrange elements in the <head> and <body>.
        // Wrapping in a custom element ensures elements are reliably arranged in
        // a single element.
        '<x-rtnice id="rtnice-root">' + input + '</x-rtnice>',
        'text/html'
      );
      root = doc.getElementById('rtnice-root');
    } else {
      root = input.cloneNode(true);
    }
    collapseWhitespace({
      element: root,
      isBlock: isBlock,
      isVoid: isVoid
    });

    return root
  }

  var _htmlParser;
  function htmlParser () {
    _htmlParser = _htmlParser || new HTMLParser();
    return _htmlParser
  }

  function Node (node) {
    node.isBlock = isBlock(node);
    node.isCode = node.nodeName.toLowerCase() === 'code' || (node.parentNode && node.parentNode.isCode);
    node.isBlank = isBlank(node);
    node.flankingWhitespace = flankingWhitespace(node);
    return node
  }

  function isBlank (node) {
    return (
      !isVoid(node) &&
      !isMeaningfulWhenBlank(node) &&
      /^\s*$/i.test(node.textContent) &&
      !hasVoid(node) &&
      !hasMeaningfulWhenBlank(node)
    )
  }

  function flankingWhitespace (node) {
    var leading = '';
    var trailing = '';

    if (!node.isBlock) {
      var hasLeading = /^\s/.test(node.textContent);
      var hasTrailing = /\s$/.test(node.textContent);
      var blankWithSpaces = node.isBlank && hasLeading && hasTrailing;

      if (hasLeading && !isFlankedByWhitespace('left', node)) {
        leading = ' ';
      }

      if (!blankWithSpaces && hasTrailing && !isFlankedByWhitespace('right', node)) {
        trailing = ' ';
      }
    }

    return { leading: leading, trailing: trailing }
  }

  function isFlankedByWhitespace (side, node) {
    var sibling;
    var regExp;
    var isFlanked;

    if (side === 'left') {
      sibling = node.previousSibling;
      regExp = / $/;
    } else {
      sibling = node.nextSibling;
      regExp = /^ /;
    }

    if (sibling) {
      if (sibling.nodeType === 3) {
        isFlanked = regExp.test(sibling.nodeValue);
      } else if (sibling.nodeType === 1 && !isBlock(sibling)) {
        isFlanked = regExp.test(sibling.textContent);
      }
    }
    return isFlanked
  }

  var reduce = Array.prototype.reduce;


  function RichTextNiceService (options) {
    if (!(this instanceof RichTextNiceService)) return new RichTextNiceService(options)

    var defaults = {
      rules: replacements,
      theme: 'basic',
      rtNiceStylesheets: cssTemplates.basic,
      blankReplacement: function (content, node) {
        return ''
      },
      keepReplacement: function (content, node) {
        return node.outerHTML
      },
      defaultReplacement: function (content, node, options) {
        var elTag = node.nodeName.toLowerCase();
        return `<${elTag}>${content ? content : ''}</${elTag}>`
      }
    };
    this.options = extend({}, defaults, options);

    if (this.options.theme != defaults.theme) {
      this.options.rtNiceStylesheets = extend({}, defaults.rtNiceStylesheets, cssTemplates[this.options.theme]);
    }

    this.rules = new Rules(this.options);
  }

  RichTextNiceService.prototype = {
    /**
     * The entry point for make a string or DOM node style nice
     * @public
     * @param {String|HTMLElement} input The string or DOM node to convert
     * @returns nice html
     * @type String
     */

    rtnice: function (input) {
      if (!canConvert(input)) {
        throw new TypeError(
          input + ' is not a string, or an element/document/fragment node.'
        )
      }

      if (input === '') return ''

      return nodeInsertStyles(
        process.call(this, new RootNode(input)),
        this.options.rtNiceStylesheets
      )
    },
  };

  /**
   * Reduces a DOM node format
   * @private
   * @param {HTMLElement} parentNode The node to convert
   * @returns nice node
   * @type String
   */

  function process (parentNode) {
    var self = this;
    return reduce.call(parentNode.childNodes, function (output, node) {
      node = new Node(node);

      var replacement = '';
      if (node.nodeType === 3) {
        replacement = node.parentNode && node.parentNode.nodeName === "X-RTNICE" ? `<p>${node.nodeValue}</p>` : node.nodeValue;
      } else if (node.nodeType === 1) {
          replacement = replacementForNode.call(self, node);
      }

      return output + replacement
    }, '')
  }

  /**
   * Converts an element node to its Markdown equivalent
   * @private
   * @param {HTMLElement} node The node to convert
   * @returns A Markdown representation of the node
   * @type String
   */

  function replacementForNode (node) {
    var rule = this.rules.forNode(node);
    if (!rule.replacement) {
      console.log(node);
    }
    var content = process.call(this, node);
    var whitespace = node.flankingWhitespace;
    if (whitespace.leading || whitespace.trailing) content = content.trim();
    return (
      whitespace.leading +
      rule.replacement(content, node, this.options) +
      whitespace.trailing
    )
  }

  /**
   * Determines whether an input can be converted
   * @private
   * @param {String|HTMLElement} input Describe this parameter
   * @returns Describe what it returns
   * @type String|Object|Array|Boolean|Number
   */

  function canConvert (input) {
    return (
      input != null && (
        typeof input === 'string' ||
        (input.nodeType && (
          input.nodeType === 1 || input.nodeType === 9 || input.nodeType === 11
        ))
      )
    )
  }

  return RichTextNiceService;

}());
