import iceberg from './core';

/*
|-------------------------------------------------------------------------------
| 标签栏
|-------------------------------------------------------------------------------
|
*/

iceberg.extend('tab', 'base', function() {}, {
    animation: function( done, isInit ) {
        var activeSlide,
            opts = this.options;

        activeSlide = this.$slide.stop(true, true).eq( this.index );
        activeSlide.fadeIn( isInit ? 0 : opts.duration, opts.easing, function() {
            done();
        });
        this.$slide.not( activeSlide ).css('display', 'none');
    }
});