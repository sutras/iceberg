import iceberg from './core';

/*
|-------------------------------------------------------------------------------
| 跑马灯
|-------------------------------------------------------------------------------
|
*/

iceberg.extend('marquee', 'base', {
    init: function() {
        var translate = 0,
            opts = this.options,
            isHoriz = !opts.vertical,
            axis = isHoriz ? 'Width' : 'Height';


        if ( opts.fluid ) {
            this.$container.css({
                position: 'relative',
                overflow: 'hidden'
            });
            this.$wrapper.css('position', 'relative');

            if ( isHoriz ) {
                this.$wrapper.css('overflow', 'hidden');
                this.$slide.css('float', 'left');

                this.$slide.each(function() {
                    translate += $(this).outerWidth(true);
                });
            } else {
                translate = this.$wrapper.outerHeight(true);
            }

            this.maxTranslate = translate;
            // 强制enough
            this.enough = true;

            this.$wrapper.html(function( i, html ) {
                return html + html;
            });
            translate *= 2;
            if ( isHoriz ) {
                this.$wrapper.css( 'width', translate );
            }

            this.setTranslate( opts.translate );

        } else {
            // 强制loop
            this.options.loop = true;
            this.setContainerStyle();
            this.cloneSlide(true);
            this.setWrapperStyle(true);
            this.setSlideStyle();

            if ( this.enough ) {
                this.maxTranslate = this.slideSize[ this.axis ].slide * this.srcSlideNum;
                this.setTranslate( opts.translate );
            }
        }

        if ( this.srcOptions.delay === void 0 ) {
            this.delay = MARQUEE_DELAY;
        }

        // 前后控制器
        this.control();
        // 自动播放
        this.autoPlay();

        if ( typeof opts.init === 'function' ) {
            opts.init.call( this, this );
        }
    },

    // 初始化之后做一些必要的工作
    afterInit: function() {},

    // 覆盖父类控制器
    control: function() {
        var that = this,
            isPressed = false,
            opts = this.options,
            tempReverse = opts.reverse,
            downOffset = this.srcOptions.downOffset || this.options.offset;

        // 鼠标按下，快速滚动
        this.$next.add( this.$prev ).on('mousedown', function(ev) {
            ev.preventDefault();

            opts.reverse = that.$prev.is(this) ? !tempReverse : tempReverse;

            isPressed = true;
            that.delay = opts.downDelay;
            that.offset = downOffset;

            if ( opts.reverse ) {
                that.offset = -that.offset;
            }

            that.allowedPlay = true;
            that._autoPlay = true;
            that.play();
        });

        $( document ).on('mouseup.iceberg', function() {
            if ( isPressed ) {
                isPressed = false;
                that.delay = opts.delay;
                that._autoPlay = that.options.autoPlay;
            }
        });
    },

    animationPreprocess: function() {
        this.animation( $.proxy( this.done, this ) );
    },

    setTranslate: function( val ) {
        if ( val < 0 ) {
            val = 0;
        } else if ( val > this.maxTranslate ) {
            val = this.maxTranslate;
        }
        this.translate = val;
    },

    animation: function( done ) {
        if ( (this.translate += this.offset) > this.maxTranslate ) {
            this.translate = 0;
        } else if ( this.translate < 0 ) {
            this.translate = this.maxTranslate;
        }

        if ( this.options.fluid ) {
            this.$wrapper.css( this.unifiedStyle( this.translate, true ) );
        } else {
            this.$wrapper.css(
                this.unifiedStyle(
                    (this.lastPageSlideNum + this.options.extra) * this.slideSize[this.axis].slide + this.translate, true
                )
            );
        }
        done();
    },
});

$.extend( iceberg.methods, {
    setTranslate: function( jq, val ) {
        return jq.each(function() {
            var obj = $.data( this, 'iceberg' );
            obj.setTranslate( val );
        });
    },
    getTranslate: function( jq, val ) {
        if ( jq[0] && $.data( jq[0], 'iceberg' ) ) {
            return $.data( jq[0], 'iceberg' ).translate;
        }
    }
});