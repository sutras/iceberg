import iceberg, { getTransitionend, getCssProp } from './core';

/*
|-------------------------------------------------------------------------------
| 滑动类
|-------------------------------------------------------------------------------
|
*/

iceberg.extend('slide', 'base', {
    // 给当前滑块对应的克隆滑块添加指定类名
    toggleCloneClass: function() {
        var activeData,
            opts = this.options;

        if ( opts.loop && this.enough ) {
            activeData = this.$srcSlide.eq( this.index ).attr( opts.slideDataName );
            this.$slide.filter('[' + opts.slideDataName + '="' + activeData + '"]').
                addClass( opts.slideActiveClass );
            this.$slide.not('[' + opts.slideDataName + '="' + activeData + '"]').
                removeClass( opts.slideActiveClass );
        }
    },
    
    animation: function( done, isInit ) {
        var that = this,
            rightEdge = this.rightEdge,
            leftEdge = this.leftEdge,
            activeSlide,
            opts = this.options,
            props,
            callback;

        props = this.unifiedStyle( this.getScrollSlideNum() );
        callback = function(ev) {
            ev = ev || window.event;
            if ( ev && ev.stopPropagation ) {
                ev.stopPropagation();
            }

            if ( (ev && ev.target === that.$wrapper[0]) || !ev ) {
                that.$wrapper.off( getTransitionend() );

                if ( that.css3 ) {
                    that.$wrapper.css( getCssProp('transition-duration'), '0s' );
                }
                if ( opts.loop ) {
                    // 通过闭包，保存上一个 rightEdge和leftEdge，避免值被覆盖掉
                    // 如果通过 this.rightEdge 保存，因为作为对象属性值，所以被轻易的覆盖掉了
                    if ( rightEdge ) {
                        that.$wrapper.css( that.unifiedStyle( that.lastPageSlideNum + opts.extra ) );
                    } else if ( leftEdge ) {
                        that.$wrapper.css( that.unifiedStyle( that.srcSlideNum + opts.extra ) );
                    }
                }

                void that.$wrapper[0].offsetHeight;

                done();
            }
        };

        this.toggleCloneClass();  // 当前页对应的克隆节点添加指定类名

        if ( this.css3 ) {
            this.$wrapper
                .trigger( getTransitionend() )
                .on( getTransitionend(), callback )
                .css( getCssProp('transition-duration'), opts.duration + 'ms' )
                .css( props );

            if ( isInit ) {
                this.$wrapper.trigger( getTransitionend() );
            }
        } else {
            this.$wrapper.stop(true, true).animate( props, isInit ? 0 : opts.duration, opts.easing, callback );
        }
    },

    // 初始化
    init: function() {
        this.cloneSlide();
        this.toggleCloneClass();
        this.setContainerStyle();
        this.setWrapperStyle();
        this.setSlideStyle();
        if ( this.options.resize ) {
            this.resize();
        }
    }
});