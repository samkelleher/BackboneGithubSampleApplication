define(["jquery"], function ($) {
    "use strict";

    return {
        parseQueryString: function(str) {
            if (typeof str !== "string") {
                return {};
            }

            str = str.trim().replace(/^(\?|#)/, "");

            if (!str) {
                return {};
            }

            return str.trim().split("&").reduce(function (ret, param) {
                var parts = param.replace(/\+/g, " ").split("=");
                var key = parts[0];
                var val = parts[1];

                key = decodeURIComponent(key);
                // missing `=` should be `null`:
                // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
                val = val === undefined ? null : decodeURIComponent(val);

                if (key === "page") {
                    if ($.isNumeric(val)) {
                        val = val * 1;
                    }
                }

                /* istanbul ignore next */
                if (!ret.hasOwnProperty(key)) {
                    ret[key] = val;
                } else if (Array.isArray(ret[key])) {
                    ret[key].push(val);
                } else {
                    ret[key] = [ret[key], val];
                }

                return ret;
            }, {});
        }
    };

});
