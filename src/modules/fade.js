import iceberg from './core';

/*
|-------------------------------------------------------------------------------
| 淡入淡出
|-------------------------------------------------------------------------------
|
*/

iceberg.extend('fade', 'base', {
    animation: function( done, isInit ) {
        var activeSlide,
            opts = this.options,
            duration = isInit ? 0 : opts.duration,
            easing = opts.easing;

        activeSlide = this.$slide.stop(true, true).eq( this.index );
        activeSlide.fadeIn( duration, easing, function() {
            done();
        });
        this.$slide.not( activeSlide ).fadeOut( duration, easing );
    },

    init: function() {
        // 设置container样式
        var position = this.$wrapper.css('position');
        this.$wrapper.css({
            position: position === 'static' ? 'relative' : position,
            width: this.slideSize.width.slide,
            height: this.slideSize.height.slide
        });

        // 设置滑块样式
        this.$slide.css({
            position: 'absolute',
            top: 0,
            left: 0
        });
    }
});