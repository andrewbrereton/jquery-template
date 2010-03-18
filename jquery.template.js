/**
 * jQuery.template
 * A micro-templating plugin for jQuery by David Furfero <http://furf.com/>
 * http://github.com/furf/jquery-template
 * Adapted from an original work by John Resig <http://ejohn.org/>
 * http://ejohn.org/blog/javascript-micro-templating/
 * MIT Licensed
 */
jQuery.template = function(str, obj, raw) {

  var replace = 'replace', split = 'split', join = 'join',

      // Convert template to JavaScript source code
      source = "var __=[];__.push('" +
        str[replace](/[\r\t\n]/g, " ")
           [split]("{%")[join]("\t")
           [replace](/((^|%\})[^\t]*)'/g, "$1\r")
           [replace](/\t=(.*?)%\}/g, "',$1,'")
           [split]("\t")[join]("');")
           [split]("%}")[join](";__.push('")
           [split]("\r")[join]("\\'") +
           "');return __.join('');",
      
      // Create the render function from generated source
      render = new Function (source);

  /**
   * Using a proxy function helps us avoid use of the "with" keyword as in the
   * original micro-templating code. This provides a noticeable performance 
   * improvement (in most browsers), but requires the use of "this" keyword in
   * the templates.
   */
  function proxy (obj, raw) {
    
    var html = render.call(obj), match, ret;
        
    // Return rendered HTML as a string
    if (raw) {
      return html;
    }

    // Return a jQuery object from the rendered HTML

    /**
     * The following block works around a jQuery limitation (as of 1.4.2)
     * where leading/trailing text fragments are stripped from the selector
     * when jQuery() is used to create DOM elements.
     *
     * $("this <em>doesn't work</em> as expected"); // <em>doesn't work</em>
     *
     * A ticket has been filed:
     * http://dev.jquery.com/ticket/6303
     *
     * And a patch has been made:
     * http://github.com/furf/jquery/blob/master/src/core.js
     */
    match = jQuery.template.quickExpr.exec(html);
    
    if (match) {

      // Create instance from DOM elements
      ret = jQuery(match[2]);

      // Prepend leading text
      Array.prototype.unshift.call(ret, document.createTextNode(match[1]));

      // Append trailing text
      ret.push(document.createTextNode(match[3]));

    } else {

      /**
       * If the rendered HTML contains no DOM elements, use a text node so
       * jQuery doesn't mistake it for a selector.
       */
      ret = jQuery(document.createTextNode(html));
    }

    return ret;
  }

  /**
   * Aliased toString and toSource methods allow access to rendered template
   * function source code for improved debugging.
   */
  proxy.toString = function () {
    return render.toString();
  };
  
  if (render.toSource) {
    proxy.toSource = function () {
      return render.toSource();
    };
  }
  
  // Return template engine or rendered HTML if an object is specified
  return obj ? proxy(obj, raw) : proxy;
};


// Splits leading text fragment, DOM elements, trailing text fragments
jQuery.template.quickExpr = /^([^<]*)(<[\w\W]+>)([^>]*)$/;


/**
 * Parse selected elements as templates
 */
jQuery.fn.template = function(obj, raw) {
  return jQuery.template(this.text() || '', obj, raw);
};
