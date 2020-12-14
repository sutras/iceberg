import iceberg from './core';

/*
|-------------------------------------------------------------------------------
| 层叠
|-------------------------------------------------------------------------------
|
*/

iceberg.extend('stack', 'base', {
    animation: function( done, isInit ) {
        var that = this, duration = isInit ? 0 : that.options.duration;

        $.each( this.options.stackStyle, function( i, style ) {
            var j = that.getOffsetIndex( i - that.stackIndex );

            that.$slide.eq(j).stop(true, true).animate( style, duration, that.options.easing, function() {
                done();
            } );
        });
    },
    init: function() {
        var opts = this.options;

        if ( !opts.stackStyle ) {
            return error('The stack effect must pass in the "stackStyle" configuration parameter, whose value is an array of CSS style objects.');
        }

        this.stackIndex = opts.stackIndex == null ?
            ~~( opts.stackStyle.length / 2 ) : opts.stackIndex;
    }
});