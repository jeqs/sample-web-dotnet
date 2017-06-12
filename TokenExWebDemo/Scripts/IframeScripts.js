elements = {};

//Setup DOM elements and Event Listeners
ready(function () {
    elements = {
        iframe: document.getElementById("tokenExIframe"),
        token: document.getElementById("token"),
        iframeData: document.getElementById("iframeData"),
        hmac: document.getElementById("hmac"),
        form: document.getElementById("iframeform"),
        btnSubmit: document.getElementById('btnSubmit'),
        expMonth: document.getElementById('expiry_month'),
        expYear: document.getElementById('expiry_year')
    };

    if (elements.btnSubmit){
        elements.btnSubmit.onclick = util.submit;
    }
    util.addEventListener(window, 'message', util.listener);
});

var util = {
    addEventListener:
        function (el, eventName, handler) {
            if (el.addEventListener) {
                el.addEventListener(eventName, handler, false);
            } else {
                el.attachEvent('on' + eventName, function () {
                    handler.call(el);
                });
            }
        },
    preventDefault: function (evt) {
        var ev = evt !== undefined ? evt : window.event;
        if (ev.preventDefault) {

            ev.preventDefault();
        } else {
            ev.returnValue = false;
        }
        return ev;
    },    
    log: 
        function (el) {
            console.log(el);
        },
    addClass:
		function (el, className) {
		    if (el) {
		        if (el.classList) {
		            el.classList.add(className);
		        } else {
		            el.className += ' ' + className;
		        }

		    }
		},
    removeClass:
		function (el, className) {
		    if (el) {
		        if (el.classList) {
		            el.classList.remove(className);
		        } else {
		            el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		        }
		    }
		},
    validateExpiration: 
        function (el) {
            var expiryMonth = elements.expMonth.options[elements.expMonth.selectedIndex].value - 1;
            var expiryYear = elements.expYear.options[elements.expYear.selectedIndex].value;
            var expiryDate = new Date(expiryYear, expiryMonth);

            //Set currentDate to beginning of current month
            var d = new Date();
            var currentMonth = d.getMonth();
            var currentYear = d.getFullYear();
            var currentDate = new Date(currentYear, currentMonth);
            
            if (expiryDate < currentDate) {
                util.addClass(elements.expMonth, 'input-validation-error');
                return false;
            } else {
                util.removeClass(elements.expMonth, 'input-validation-error');
                return true;
            }
        },
    submit:
        function (el) {
            if (util.validateExpiration()) {
                util.postMessage('tokenize', 'https://test-htp.tokenex.com');       
            } else {
                util.postMessage('validate', 'https://test-htp.tokenex.com');
            }
        },
    postMessage:
        function (msg, URL) {
            elements.iframe.contentWindow.postMessage(msg, URL);
        },
    listener:
        function (event) {
            if (event.origin === 'https://test-htp.tokenex.com') {
                var message = JSON.parse(event.data);
                switch (message.event) {
                    case 'load':
                        util.postMessage('enablePrettyFormat', 'https://test-htp.tokenex.com');
                        util.removeClass(elements.form, 'hidden');
                        break;
                    case 'validation':
                        if (!message.data.isValid) {
                            //field failed validation
                        } else {
                            //validation valid!
                        }
                        break;
                    case 'post':
                        if (!message.data.success) {
                            // use message.data.error 
                        } else {
                            //get token! message.data.token
                            elements.token.value = message.data.token;
                            elements.iframeData.value = JSON.stringify(message.data);
                            elements.hmac.value = message.hmac;
                            elements.form.submit();
                        }
                        break;
                }
                util.log("iframe message:" + event.data)
            } else {
                util.log("Oops! Origin: " + event.origin + " isn't allowed")
            }
        }
};

//Cross Browser Compatible Document Ready Check
function ready(fn) {
    if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', fn);
    } else {
        document.attachEvent('onreadystatechange', function () {
            if (document.readyState === 'complete') {
                fn();
            }
        });
    }
}
