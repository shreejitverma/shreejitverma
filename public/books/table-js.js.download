;(function ($) {
    /**
     * Fancy Table Plugin.
     *
     * @param el
     * @param options
     */
    $.thimFancyTable = function (el, options) {
        options = $.extend($.thimFancyTable.defaults, options);

        var $tbl = $(el),
            $wrap = $('<div class="thim-fancy-table"></div>').insertAfter($tbl),
            $horizontalScroll = $('<div class="tft-horizontal-scroll"><div></div></div>'),
            $fixedColumns = $('.nothing-here'),
            fixedWidth = 0;

        $tbl.appendTo($wrap);
        $tbl.find('tr').each(function () {
            $fixedColumns = $fixedColumns.add($(this).children(':lt(' + options.fixedColumns + ')').addClass('fixed'));
            if (fixedWidth === 0) {
                $fixedColumns.map(function () {
                    fixedWidth += $(this).outerWidth();
                })
            }
        })

        $horizontalScroll.insertAfter($tbl);
        $horizontalScroll.find('div').css({
            width: $tbl.outerWidth() - fixedWidth - 1
        });

        $horizontalScroll.on('scroll', function () {
            var r = $(this).width() / $wrap.width(),
                l = this.scrollLeft;
            $tbl.css({
                marginLeft: -l
            });

            $fixedColumns.css({
                transform: 'translateX(' + l + 'px)'
            });
        }).css({
            marginLeft: fixedWidth - 1
        });

        if ($.isFunction(options.onCreate)) {
            options.onCreate.apply(this, [$tbl[0]]);
        }
        setTimeout(function () {
            $wrap.addClass('ready')
        }, 100)
    }

    $.thimFancyTable.defaults = {
        fixedColumns: 1,
        fixedRows: 1,
        onCreate: function () {

        }
    }
    $.fn.thimFancyTable = function (options) {
        return $.each(this, function () {
            new $.thimFancyTable(this, options)
        })
    }
})(jQuery);