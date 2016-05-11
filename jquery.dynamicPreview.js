/*! htmlFormatting | © 2016 bashkos | https://github.com/WEACOMRU/jquery.dynamicPreview */

(function ($) {
    'use strict';

    var dataAttrName = 'dynamicPreview',

        $body = $('body'),

        capitalize = function (str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },

        getDataOptions = function ($target) {
            var option,
                dataOption,
                result = {};

            for (option in $.fn.dynamicPreview.defaults) {
                if ($.fn.dynamicPreview.defaults.hasOwnProperty(option)) {
                    dataOption = dataAttrName + capitalize(option);

                    if ($target.data(dataOption) !== undefined) {
                        result[option] = $target.data(dataOption);
                    }
                }
            }

            return result;
        },

        getImageUrl = function ($target) {
            var result;

            if ($target.prop('tagName') === 'IMG') {
                result = $target.attr('src');
            } else {
                result = $target.css('background-image').match(/url\(["|']?([^"']*)["|']?\)/)[1];
            }

            return result;
        },

        setImageUrl = function ($target, url) {
            var $shadowImage = $('<img/>');

            $shadowImage
                .on('load cached', function () {
                    $shadowImage.remove();

                    if ($target.prop('tagName') === 'IMG') {
                        $target.attr('src', url);
                    } else {
                        $target.css('background-image', 'url(' + url + ')');
                    }
                })
                .on('abort error', function () {
                    $shadowImage.remove();
                })
                .attr('src', url);

            $body.append($shadowImage);
        },

        zeroPad = function (value, maxValue) {
            var result = value.toString(),
                length = maxValue.toString().length;

            while (result.length < length) {
                result = '0' + result;
            }

            return result;
        },

        generateFileName = function (index, options) {
            return options.prefix + (options.zeroPad ? zeroPad(index, options.count) : index) + options.suffix;
        },

        publicMethods = {
            init: function (options) {
                var settings = $.extend({}, $.fn.dynamicPreview.defaults, options);

                return this.each(function () {
                    var $target = $(this),
                        instanceSettings;

                    if ($target.data(dataAttrName) === undefined) {
                        instanceSettings = $.extend({}, settings, getDataOptions($target));

                        if (instanceSettings.default === '') {
                            instanceSettings.default = getImageUrl($target)
                        }

                        if (instanceSettings.autoMode) {
                            $target
                                .on('mouseover', publicMethods.start.bind($target))
                                .on('mouseout', publicMethods.stop.bind($target));
                        }

                        $target.data(dataAttrName, instanceSettings);
                    }
                });
            },

            start: function (options) {
                return this.each(function () {
                    var $target = $(this),
                        instanceSettings = $target.data(dataAttrName),
                        index;

                    if (instanceSettings === undefined) {
                        instanceSettings = $.extend(options, {
                            autoMode: false
                        });

                        $target.dynamicPreview(instanceSettings);
                        instanceSettings = $target.data(dataAttrName);
                    }

                    if (!$target.data(dataAttrName + 'Rotation') && instanceSettings.count > 0) {
                        index = instanceSettings.startIndex;
                        setImageUrl($target, instanceSettings.url + generateFileName(index, instanceSettings));

                        $target.data(dataAttrName + 'Rotation', setInterval(function () {
                            index++;
                            if (index === instanceSettings.startIndex + instanceSettings.count) {
                                index = instanceSettings.startIndex;
                            }
                            setImageUrl($target, instanceSettings.url + generateFileName(index, instanceSettings));
                        }, instanceSettings.delay));
                    }
                });
            },

            stop: function () {
                return this.each(function () {
                    var $target = $(this),
                        instanceSettings = $target.data(dataAttrName);

                    if ($target.data(dataAttrName + 'Rotation')) {
                        clearInterval($target.data(dataAttrName + 'Rotation'));
                        $target.data(dataAttrName + 'Rotation', null);
                        setImageUrl($target, instanceSettings.default);
                    }
                });
            }
        };

    $.fn.dynamicPreview = function () {
        var result;

        if (arguments.length && publicMethods[arguments[0]]) {
            result = publicMethods[arguments[0]].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            result = publicMethods.init.apply(this, arguments);
        }

        return result;
    };

    $.fn.dynamicPreview.defaults = {
        url: '',
        prefix: '',
        suffix: '.jpg',
        count: 0,
        startIndex: 1,
        zeroPad: false,
        autoMode: true,
        default: '',
        delay: 750
    };
})(jQuery);
