import iceberg from './core';

/*
|-------------------------------------------------------------------------------
| 菜单
|-------------------------------------------------------------------------------
|
| 虽然使用相同的接口实现菜单功能，内部功能完全不一样。
|
*/

iceberg.extend('menu', '', function( container, opts, srcOptions ) {
    var CLS_ACTIVE = opts.pageActiveClass;
    var $pageItem = $(container).find( opts.pageItem );
    var active = $pageItem.filter('.' + CLS_ACTIVE);
    var current = null;
    var showTimer = null;
    var hideTimer = null;

    var showType = '';
    var hideType = '';

    switch ( opts.type ) {
        case 'slide':
            showType = 'slideDown';
            hideType = 'slideUp';
            break;
        case 'fade':
            showType = 'fadeIn';
            hideType = 'fadeOut';
            break;
        default:
            showType = 'fadeIn';
            hideType = 'fadeOut';
            break;
    }

    function hideCurrent() {
        var currBak = current;
        var $slide = $(current).find( opts.slide );

        function hideFn() {
            if ( current === currBak ) {
                $(current).removeClass( CLS_ACTIVE );
                $(active).addClass( CLS_ACTIVE );
            }
        }

        if ( $slide.length === 0 ) {
            hideFn();
        } else {
            $slide.stop(true, true)[hideType](opts.duration, hideFn);
        }

        if ( hideTimer ) {
            clearTimeout(hideTimer);
            hideTimer = null;
        }
    }

    function showCurrent() {
        $(current).find( opts.slide ).stop(true, true)[showType](opts.duration);

        $pageItem.removeClass( CLS_ACTIVE );
        $(current).addClass( CLS_ACTIVE );

        if ( showTimer ) {
            clearTimeout(showTimer);
            showTimer = null;
        }
    }

    $pageItem.hover(function() {
        var el = this;

        if ( current === el ) {
            // 未隐藏
            if ( hideTimer ) {
                clearTimeout( hideTimer );
                hideTimer = null;

            // 已隐藏
            } else {
                showTimer = setTimeout(function() {
                    showCurrent();
                }, opts.pageDelay);
            }
        } else {
            showTimer = setTimeout(function() {
                if ( hideTimer ) {
                    clearTimeout( hideTimer );
                    hideTimer = null;
                    hideCurrent();
                }
                current = el;
                showCurrent();
            }, opts.pageDelay);
        }
    }, function() {
        if ( showTimer ) {
            clearTimeout( showTimer );
            showTimer = null;
        } else {
            hideTimer = setTimeout(function() {
                hideCurrent();
            }, opts.hideDelay);
        }
    });
}, {

});