import iceberg from './core';

/*
|-------------------------------------------------------------------------------
| 手风琴
|-------------------------------------------------------------------------------
|
*/

iceberg.extend('accordion', 'base', {
    animation: function( done, isInit ) {
        var activeSlide,
            opts = this.options,
            duration = isInit ? 0 : opts.duration,
            easing = opts.easing;

        activeSlide = this.$slide.stop(true, true).eq( this.index );

        this.$slide.not( activeSlide )[ !opts.vertical ? 'slideLeft' : 'slideUp' ]( duration, easing );

        activeSlide[ !opts.vertical ? 'slideRight' : 'slideDown' ]( duration, easing, function() {
            done();
        });
    }
});