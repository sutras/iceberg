import $ from 'jquery';

/*
|-------------------------------------------------------------------------------
| 扩展jquery动画引擎
|-------------------------------------------------------------------------------
| 
| 为其添加slideLeft，slideRight和slideToggleX三个水平方向的动画。
|
*/
var fxAttrs = ['width', 'marginLeft', 'marginRight', 'paddingLeft', 'paddingRight'];

var MARQUEE_DELAY = 20;

function genFx( type ) {  // 生成属性包
    var obj = {}, i = 0, name;

    for ( ; (name = fxAttrs[i++]); ) {
        obj[name] = type;
    }
    return obj;
}

$.each({
    slideLeft:      genFx('hide'),
    slideRight:     genFx('show'),
    slideToggleX:   genFx('toggle')
}, function( name, obj ) {
    $.fn[name] = function() {
        return this.animate.apply( this, $.merge( [obj], arguments ) );
    };
});


/*
|-------------------------------------------------------------------------------
| 统一不同浏览器的滚轮事件
|-------------------------------------------------------------------------------
|
*/
var wheel = 'onwheel' in document ?
    'wheel'  // 各个厂商的高版本浏览器都支持"wheel"
    : 'onmousewheel' in document ?
        'mousewheel'  // Webkit 和 IE一定支持"mousewheel"
        : 'DOMMouseScroll'; // 低版本firefox

$.event.special.wheel = {
    delegateType: wheel,
    bindType: wheel,
    handle: function( event ) {
        switch ( wheel ) {
            case 'wheel':
                event.deltaY = event.originalEvent.deltaY;
                break;
            case 'mousewheel':
                event.deltaY = -event.originalEvent.wheelDelta / 40;
                break;
            case 'DOMMouseScroll':
                event.deltaY = event.originalEvent.detail;
                break;
        }
        return event.handleObj.handler.apply( this, arguments );
    }
};


/*
|-------------------------------------------------------------------------------
| 工具函数
|-------------------------------------------------------------------------------
|
*/
var easing = {
    linear: [0.250, 0.250, 0.750, 0.750],
    swing: [0.250, 0.460, 0.450, 0.940]
};

// 寄生式继承来继承超类型的原型
function inheritPrototype( subType, superType, payload ) {
    var p = subType.prototype;

    // 继承原型
    if ( superType && superType.prototype ) {
        // 创建对象
        p = (function( o ) {
            function F() {}
            F.prototype = o;
            return new F();
        })( superType.prototype );
        p.constructor = subType;
    }

    // 增强对象
    if ( payload && typeof payload === 'object' ) {
        for ( var i in payload ) {
            p[i] = payload[i];
        }
    }
    return (subType.prototype = p);  // 指定对象
}

function error( text ) {
    console.error( '[jquery.iceberg] ' + text );
}
function warn( text ) {
    console.warn( '[jquery.iceberg] ' + text );
}

var cssProps = {};
var prefixes = ['', 'webkit', 'Moz', 'O', 'ms'];
var html = document.documentElement;
var transitionends = {
    transition: 'transitionend',
    OTransition: 'oTransitionEnd',
    MozTransition: 'transitionend',
    webkitTransition: 'webkitTransitionEnd'
};

function pascalCase( target ) {
    return target.replace( /[-]([^-])/g, function( m, g1 ) {
        return g1.toUpperCase();
    }).replace(/^./, function( m ) {
        return m.toUpperCase();
    });
}

function camalCase( target ) {
    return target.replace( /[-]([^-])/g, function( m, g1 ) {
        return g1.toUpperCase();
    }).replace(/^./, function( m ) {
        return m.toLowerCase();
    });
}

export function getCssProp( name, host ) {
    var i = 0, fitName,
        l = prefixes.length,
        prefix;

    host = host || html.style;

    if ( cssProps[ name ] ) {
        return cssProps[ name ];
    }

    for ( ; i < l; i++ ) {
        prefix = prefixes[ i ];
        fitName = prefix ? prefix + pascalCase( name ) : camalCase( name );
        if ( fitName in host ) {
            return ( cssProps[ name ] = fitName );
        }
    }
    return null;
}

export function getTransitionend() {
    return transitionends[ getCssProp('transition') ];
}

function hasTransition() {
    return !!getCssProp('transition');
}

function curry( fn, context ) {
    var args = Array.prototype.slice.call( arguments, 2 );
    return function() {
        var innerArgs = Array.prototype.slice.call( arguments );
        var finalArgs = args.concat( innerArgs );
        return fn.apply( context, finalArgs );
    };
}

function throttle( fn, interval ) {
    var timer = null,
        first = true;

    return function() {
        var that = this, args = arguments;

        // 第一次执行
        if ( first ) {
            fn.apply( this, args );
            first = false;
        } else {
            if ( !timer ) {
                timer = setTimeout(function() {
                    clearTimeout( timer );
                    timer = null;
                    fn.apply( that, args );
                }, interval || 150);
            }
        }
    };
}


/*
|-------------------------------------------------------------------------------
| 对外的接口实现
|-------------------------------------------------------------------------------
|
*/
// 保存effect名与插件之间的映射
var effect = {};

// 把iceberg注册为$.fn插件
var iceberg = $.fn.iceberg = function( options ) {
    if ( typeof options === 'string' ) {
        return iceberg.methods[ options ]( this, $.makeArray( arguments ).slice(1) );
    }

    return this.each(function() {
        if ( !$.data(this, 'iceberg') ) {
            $.data( this, 'iceberg', getIcebergInstance( this, options || {} ) );
        }
    });
};

// 代理iceberg对象的创建
function getIcebergInstance( elem, options ) {
    var opts = $.extend( {}, defaults, options ),
        Class = effect[ opts.effect ];

    if ( typeof Class !== 'function' ) {
        error( 'This effect does not exist: ' + opts.effect  + '.');
        return;
    }

    // 根据effect效果来实例化对应的类
    return new Class( elem, opts, $.isPlainObject( options ) ? options : {} );
}

// 通过extend来扩展插件
iceberg.extend = function( subType, superType, _constructor, proto ) {
    var superClass = effect[ superType ], Class;

    if ( typeof _constructor !== 'function'  ) {
        proto = _constructor;
        _constructor = function() {};
    }

    Class = _constructor;

    if ( subType in effect ) {
        return error('The same effect already exists: ' + subType + '.');
    }

    // 继承
    if ( typeof superClass === 'function' ) {
        Class = function() {
            superClass.apply( this, arguments );
            _constructor.call( this );
        };
    }

    // 把类保存到effect对象
    effect[ subType ] = Class;

    // 继承原型属性/增强对象
    inheritPrototype(Class, superClass, proto);
};


/*
|-------------------------------------------------------------------------------
| 默认参数
|-------------------------------------------------------------------------------
|
*/
var defaults = iceberg.defaults = {
    // 指定元素
    wrapper: '.iceberg-wrapper',  // 滑块的包裹元素
    slide: '.iceberg-slide',  // 滑块元素
    prev: '.iceberg-prev',  // 上一页按钮，默认从容器里面找，如果不为默认值，则从全文档找。
    next: '.iceberg-next',  // 下一页按钮，默认从容器里面找，如果不为默认值，则从全文档找。
    page: '.iceberg-page',  // 自动分页时表示分页元素的父元素，非自动分页时表示已有的分页元素
    pageItem: '.iceberg-page-item',

    // 命名空间
    slideActiveClass: 'iceberg-slide-active',  // 活动的滑块类名
    slideVisibleClass: 'iceberg-slide-visible',  // 活动滑块前的滑块
    slidePrevClass: 'iceberg-slide-prev',  // 活动滑块前的滑块
    slideNextClass: 'iceberg-slide-next',  // 活动滑块后的滑块
    slideCloneClass: 'iceberg-slide-clone',  // 克隆的滑块元素
                                              // 有克隆的情况下为每个滑块设置的属性，值对应为滑块下标，
                                              // 作用是为了使克隆和被克隆的滑块行为统一
    slideDataName: 'data-iceberg-slide-index',
    pageClass: 'iceberg-page-item',  // 页码类名
    pageActiveClass: 'iceberg-page-item-active',  // 活动页码的类名
    disabledClass: 'iceberg-disabled',  // 上下页按钮禁用时的类名

    effect: 'fade',  // 动画效果：slide、marquee、fade、tab、accordion、stack
    vertical: false,  // 是否垂直滚动，默认水平
    loop: false,  // 循环滚动
    duration: 400,  // 滑块从开始滑动到结束的时间
    autoPlay: true,  // 是否自动播放
    delay: 3000,  // 从一个滑块滑动结束到另一个滑块滑动开始的时间，当动效为marquee时，默认值为20，单位毫秒
    easing: 'swing',  // 缓动公式，可选：'linear'、'swing'
    index: 0,  // 当前页的下标
    visible: 1,  // 容器显示的slide数量
    scroll: 1,  // 每次滚动的滑块的个数
    reverse: false,  // 滑块是否反方向切换,
    instant: true,  // 新的滑块开始切换时立即结束上一个滑块的切换
    mouseoverStop: true,  // 鼠标移到容器上，停止自动播放
    mousewheel: false,  // 是否可通过鼠标滚轮来进行切换，常用于全屏滚动
                        // 设置为true则把滚轮事件放到容器上，
                        // 也可以把传入选择器字符串来指定放到哪个元素上监听滚轮事件

    resize: false,  // 用于slide效果，屏幕尺寸变化时是否调整wrapper和滑块的大小。
                    // 用此选项前需将容器的大小样式添加important修饰，否则会被覆盖。
                    // 常用于全屏轮播
    interval: 150,  // 用于浏览器窗口resize时，函数节流的时间间隔。

    css3: true,  // 在支持transition的浏览器会使用transform来实现动画效果，作用于slide和marquee


    downDelay: 5,  // 用于跑马灯，鼠标按下时的delay值
    offset: 1,  // 用于跑马灯，每隔delay时间，wrapper的偏移量，单位px
    downOffset: null,  // 用于跑马灯，鼠标按下时的offset值，如果不设置，默认等同于offset
    translate: 0,  // 用于跑马灯，默认的位移
    fluid: false,  // 用于跑马灯，滑块或者容器的大小是否是不固定的；
                   // 即滑块有大有小，容器宽度可能随窗口的大小变化而变化。
                   // 如果设为true，则拷贝一份滑块，让其首尾相接，循环往复无缝滚动。

    extra: 0, // 添加额外克隆的滑块，用于loop下预览多个滑块
    stackIndex: null,  // 堆叠效果，指定焦点滑块所在的位置，默认为中心块

    pageTrigger: 'click',  // 分页指示器触发的方式，可选mouseover/click/mousedown等事件
    pageDelay: 150,  // 触发的等待时间，避免短时间内重复触发

    trigger: 'click',  // 上下页按钮触发方式, 可选mousedown/mouseover/click等事件
    disabled: false,  // 到达第一页或最后一页时是否停止切换

    // 是否自动分页，或者自动分页时自定义页码元素和格式
    autoPage: function( index, total, cls ) { return '<span class="' + cls + '">' + index + '</span>'; },

    // 以下参数用于menu
    hideDelay: 150,  // 鼠标移开多长时间才隐藏
    type: 'fade',  // 动画效果，可选：fade、slide；fade：淡入淡出、slide：上下滑动。

    // 回调函数
    init: null,  // 初始化完的回调函数
    beforeSlideStart: null,  // 在滑动开始之前的回调函数，可显式返回false来阻止滑块的滑动
    slideStart: null,  // 滑块滑动前的回调函数
    slideEnd: null,  // 滑块滑动完的回调函数
};

function getEl( val, context ) {
    var need = false;

    if ( typeof val === 'string' ) {
        if ( val.charAt(0) === '!' ) {
            val = val.slice(1);
        } else {
            need = true;
        }
    }

    return $( val, need ? context : null );
}

/*
|-------------------------------------------------------------------------------
| 基类
|-------------------------------------------------------------------------------
|
*/
iceberg.extend('base', '', function( container, opts, srcOptions ) {
    this.options = opts;
    this.srcOptions = srcOptions;

    this.$container = $( container );

    // 滑块的包装层
    this.$wrapper = $( opts.wrapper, container );

    // 原始滑块元素
    // 默认不指定slide，用于slide、marquee、fade等；指定的情况常见于accordion
    this.$srcSlide = getEl( opts.slide, container );

    // 上一页控制元素
    this.$prev = getEl( opts.prev, container );

    // 下一页控制元素
    this.$next = getEl( opts.next, container );

    // 分页器元素
    this.$page = getEl( opts.page, container );

    // 分页器元素
    this.$pageItem = getEl( opts.pageItem, container );

    // 下一滑块运动间隔时间
    this.delay = opts.delay;
    this.offset = opts.offset;

    // 每次滚动的滑块数
    // 滚动数不大于可视数
    this.scroll = opts.scroll > opts.visible ? opts.visible : opts.scroll;

    // 总滑块数
    this.srcSlideNum = this.$srcSlide.length;

    // 隐藏的滑块数
    this.hideSlideNum = this.srcSlideNum < opts.visible ? 0 : this.srcSlideNum - opts.visible;
    this.enough = this.hideSlideNum > 0;

    // 最后一页滑块数，默认等于滚动数
    this.lastPageSlideNum = this.scroll;

    // 总页数
    // 如果循环，则设置最后一页的滑块数
    if ( !this.enough ) {
        this.pageNum = 1;
        this.$prev.add( this.$next ).addClass( opts.disabledClass );
    } else if ( opts.loop ) {
        this.lastPageSlideNum = this.srcSlideNum % this.scroll;
        if ( this.lastPageSlideNum === 0 ) {

        }
        this.pageNum = this.lastPageSlideNum === 0 ?
            this.srcSlideNum / ( this.lastPageSlideNum = this.scroll ) :
            ~~( this.srcSlideNum / this.scroll ) + 1;
    } else {
        this.pageNum = Math.ceil( this.hideSlideNum / this.scroll ) + 1;
    }

    // 设置的下标不能超出页数
    this.index = opts.index > this.pageNum - 1 ? this.pageNum - 1 : opts.index;

    // 保存所有滑块，包括克隆后的滑块
    this.$slide = this.$srcSlide;
    this.slideNum = this.srcSlideNum;

    this.axis = opts.vertical ? 'height' : 'width';
    this.axisCap = this.axis.replace(/^./, function(m) {return m.toUpperCase();});

    // 获取滑块的尺寸
    this.slideSize = this.getSlideSize();

    this._autoPlay = this.options.autoPlay;
    // 用于自动播放
    this.allowedPlay = true;

    // 动画是否已结束
    this.finished = true;

    this.instant = this.options.instant;

    this.css3 = opts.css3 && hasTransition();

    // 初始化函数，用于编写动效时使用
    this.init();

    this.afterInit();
}, {
    // 获取新的下标
    // index：当前下标
    // len：元素列表长度
    // offset：偏移量（新下标 - 当前下标）或者直接传入偏移量，左偏移为负，右偏移为正
    getNewIndex: function( index, len, offset ) {
        return offset > 0 ? this.getNewIndex( ++index >= len ? 0 : index, len, --offset ) :
            offset < 0 ? this.getNewIndex( --index < 0 ? len - 1 : index, len, ++offset ) : index;
    },

    getOffsetIndex: function( offset ) {
        return this.getNewIndex( this.index, this.pageNum, offset );
    },

    // loop下会克隆节点
    cloneSlide: function( isMarquee ) {
        var that = this, i,
            opts = this.options;

        if ( opts.loop && this.pageNum > 1 ) {
            // 把下标保存到元素属性
            // 为了使克隆和被克隆的滑块行为统一
            this.$srcSlide.each(function(index, slide ) {
                $(this).attr( that.options.slideDataName, index );
            });

            // 往 wrapper 前面添加从 srcSlide 后面往回数 lastPageSlideNum 个元素的克隆
            for ( i = 1; i <= this.lastPageSlideNum + opts.extra; i++ ) {
                this.$wrapper.prepend( this.$srcSlide.eq( this.srcSlideNum - i ).clone(true).addClass( opts.slideCloneClass ) );
            }

            // 往 wrapper 后面添加从 srcSlide 前面往后数 visible 个元素的克隆
            for ( i = 0; i < opts.visible + opts.extra; i++ ) {
                this.$wrapper.append( this.$srcSlide.eq( i ).clone(true).addClass( opts.slideCloneClass ) );
            }

            // 克隆后重新获取所有滑块的集合及其数量
            this.$slide = this.$wrapper.children();
            this.slideNum = this.$slide.length;
        }
    },

    getSlideSize: function() {
        var selfW = 0,
            selfH = 0,
            slideW = 0,
            slideH = 0;

        if ( this.axis === 'width' && /^(?:slide|marquee)$/.test(this.options.effect) ) {
            this.$srcSlide.css('float', 'left');
        }

        this.$srcSlide.each(function() {
            var width = $(this).width(),
                height = $(this).height();
            if ( width > selfW ) {
                selfW = width;
                slideW = $(this).outerWidth(true);
            }
            if ( height > selfH ) {
                selfH = height;
                slideH = $(this).outerHeight(true);
            }
        });
        return {
            width: {
                self: selfW,
                slide: slideW
            },
            height: {
                self: selfH,
                slide: slideH
            }
        };
    },

    // 设置 container 的样式
    setContainerStyle: function() {
        var opts = this.options,
            position = this.$container.css('position'),
            styles = {
                position: position === 'static' ? 'relative' : position,
                overflow: 'hidden'
            };

            styles[ this.axis ] = this.slideSize[ this.axis ].slide * opts.visible;

        this.$container.css( styles );
    },

    // 设置wrapper的样式
    setWrapperStyle: function( isMarquee ) {
        var props = this.unifiedStyle( this.getScrollSlideNum() ),
            opts = this.options;

        props.position = 'relative';

        props[ this.axis ] = this.slideSize[ this.axis ].slide * this.slideNum + 'px';

        if ( !opts.vertical ) {
            props.overflow = 'hidden';
        }

        if ( this.css3 && !isMarquee ) {
            props[ getCssProp('transition') ] =
                getCssProp('transform') + ' ' + opts.duration + 'ms cubic-bezier(' + easing[ opts.easing ].join(',') + ')';
        }
        this.$wrapper.css( props );
    },

    // 设置滑块的样式
    setSlideStyle: function() {
        var props = {};
        if ( !this.options.vertical ) {
            props.float = 'left';
        }
        props[ this.axis ] = this.slideSize[ this.axis ].self;

        this.$slide.css( props );
    },

    resize: function() {
        this.resizeHandlerProxy = throttle( $.proxy(this.resizeHandler, this), this.options.interval );
        $(window).resize( this.resizeHandlerProxy );
    },

    unresize: function() {
        $(window).off('resize', this.resizeHandlerProxy);
    },

    resizeHandler: function() {
        var axis = this.axis,
            size = this.$container[ axis ](),
            slideSize = size / this.options.visible;

        this.slideSize[ axis ].slide = slideSize;
        this.slideSize[ axis ].self = slideSize;
        this.$wrapper.css( axis, this.slideNum * slideSize );
        this.$slide.css( axis, slideSize );
        this.instant = true;
        this.goto( this.index, true );
        this.instant = this.options.instant;
    },

    // 处理分页
    pagination: function() {
        var str = '', timer = null, that = this,
            opts = this.options,
            auto = opts.autoPage;

        // 自动分页，常用于焦点图
        if ( typeof auto === 'function' ) {
            for ( var i = 0; i < this.pageNum; i++ ) {
                str += auto( i, this.pageNum, opts.pageClass );
            }
            this.$pageItem = this.$page.html( str ).children();
        }

        // 如果是鼠标移上事件，则做一些处理，避免重复触发
        if ( opts.pageTrigger === 'mouseover' ) {
            this.$pageItem.hover(function() {
                var s = this,
                    offset = that.$pageItem.index( s ) - that.index;

                timer = setTimeout(function() {
                    that.animationPreprocess( opts.reverse ? -offset : offset );
                }, opts.pageDelay);
            }, function() {
                clearTimeout( timer );
                timer = null;
            });
        } else {
            this.$pageItem.on(opts.pageTrigger, function() {
                var offset = that.$pageItem.index( this ) - that.index;
                that.animationPreprocess( opts.reverse ? -offset : offset );
            });
        }
    },

    // 处理前后控制按钮
    control: function() {
        var that = this,
            opts = this.options;

        // 绑定上一页控制器
        this.$prev.on( opts.trigger, function( ev ) {
            ev.preventDefault();
            that.animationPreprocess(-1);
        });
        // 绑定下一页控制器
        this.$next.on( opts.trigger, function( ev ) {
            ev.preventDefault();
            that.animationPreprocess(1);
        });
    },

    // 通过鼠标滚轮来切换滑块
    mousewheel: function() {
        var that = this, wheel = this.options.mousewheel;
        if ( wheel ) {
            ( typeof wheel === 'boolean' ? this.$container : $( wheel, this.$container ) )
                .on('wheel', function( ev ) {
                    ev.preventDefault();
                    that.animationPreprocess( ev.deltaY / Math.abs( ev.deltaY ) );
                });
        }
    },

    // 获取滑动的滑块数
    getScrollSlideNum: function() {
        var opts = this.options;

        if ( opts.loop ) {
            if ( !this.enough ) {
                opts.extra = 0;
                this.lastPageSlideNum = 0;
            }
            if ( this.rightEdge ) {
                return this.srcSlideNum + this.lastPageSlideNum + opts.extra;
            }
            if ( this.leftEdge ) {
                return opts.extra;
            }
            return this.index * this.scroll + this.lastPageSlideNum + opts.extra;
        } else {
            if ( this.index >= this.pageNum - 1 ) {
                return this.hideSlideNum;
            }
            return this.index * this.scroll;
        }
    },

    // 根据需要滑动的滑块数来返回需要滑动的具体距离，
    // 并决定使用哪一种方式产生动画效果。
    unifiedStyle: function( slide, isMarquee ) {
        var props = {}, prop, val,
            opts = this.options;

        val = isMarquee ? -slide + 'px' : -slide * this.slideSize[ this.axis ].slide + 'px';

        if ( this.css3 ) {
            props[ getCssProp('transform') ] = 'translate' + (opts.vertical ? 'Y' : 'X') + '(' + val + ')';
        } else {
            prop = !opts.vertical ? 'left' : 'top';
            props[ prop ] = val;
        }

        return props;
    },

    // 动画预处理
    animationPreprocess: function( offset, isInit ) {
        var opts = this.options;

        // 动画未完成且又不是立即执行动画时直接退出
        if ( !this.finished && !this.instant ) {
            return;
        }

        // 初始化边界
        this.leftEdge = this.rightEdge = false;

        offset = opts.reverse ? -offset : offset;

        // 获取下一个索引
        this.nextIndex = this.getOffsetIndex( offset );
           
        // 动画开始前的回调函数，可返回false停止当次动画执行
        if ( !isInit && typeof opts.beforeSlideStart === 'function' && 
                opts.beforeSlideStart.call( this, this ) === false ) {
            return;
        }

        // 如果下一索引等于当前索引，不做处理（除了初始化，初始化时可能前后索引一致）
        // 下面也不需要判断有没有隐藏的滑块，如果没有隐藏滑块，前后索引会一致，在这里就会被阻止掉
        if ( this.nextIndex === this.index && !isInit ) {
            return;
        }

        // 判断滑块是否处于边缘
        if ( offset > 0 && this.nextIndex < this.index ) {
            this.rightEdge = true;
        }
        if ( offset < 0 && this.nextIndex > this.index ) {
            this.leftEdge = true;
        }

        // 如果有设置到达边缘禁止动画，且满足要求，则不进行动画
        if ( !(opts.disabled && (this.leftEdge || this.rightEdge)) ) {
            // 设置新的索引
            this.index = this.nextIndex;

            // 当撞墙时，给控制器添加类名
            if ( opts.disabled ) {
                this.$prev[ this.index === 0 ? 'addClass' : 'removeClass' ]( opts.disabledClass );
                this.$next[ this.index === this.pageNum - 1 ? 'addClass' : 'removeClass' ]( opts.disabledClass );
            }

            // 切换滑块类名
            this.$slide.removeClass( opts.slideActiveClass ).eq( this.index  * this.scroll ).addClass( opts.slideActiveClass );

            // 切换分页类名
            this.$pageItem.removeClass( opts.pageActiveClass ).eq( this.index ).addClass( opts.pageActiveClass );

            // 正处于动画当中
            this.finished = false;

            // 动画开始时的回调
            if ( !isInit && typeof opts.slideStart === 'function' ) {
                opts.slideStart.call( this, this );
            }

            // 执行动画
            this.animation( $.proxy( this.done, this, isInit ), isInit );
        }
    },

    animation: function() {
        error('This method must be redefined: animation.');
    },

    // 初始化函数
    // 可以做一下变量的声明，或者样式的初始设置
    init: function() {},

    // 自动播放动画
    play: function() {
        // 如果定时器停止了，并且允许自动播放，并且有隐藏滑块
        if ( !this.autoPlayTimer &&
                this._autoPlay &&
                this.enough &&
                this.allowedPlay ) {
            this.autoPlayTimer = setTimeout( $.proxy( function() {
                this.autoPlayTimer = null;
                this.animationPreprocess(1);
            }, this), this.delay);
        }
    },

    // 停止动画自动播放
    stop: function() {
        if ( this.autoPlayTimer ) {
            clearTimeout( this.autoPlayTimer );
            this.autoPlayTimer = null;
        }
    },

    // 自动播放
    autoPlay: function() {
        var opts = this.options;

        if ( this._autoPlay && opts.mouseoverStop ) {
            this.$container
                .add( this.$prev )
                .add( this.$next )
                .add( this.$pageItem )
                .hover( $.proxy( function( ev ) {
                    this.allowedPlay = false;
                    this.stop();
                }, this ), $.proxy( function( ev ) {
                    this.allowedPlay = true;
                    this.play();
                }, this ));
        }
        this.play();
    },

    // 初始化之后做一些必要的工作
    afterInit: function() {
        var opts = this.options;

        // 分页
        this.pagination();
        // 前后控制器
        this.control();
        // 滚轮切换
        this.mousewheel();
        // 自动播放
        this.autoPlay();

        this.goto( this.index, true );

        if ( typeof opts.init === 'function' ) {
            opts.init.call( this, this );
        }
    },

    // 动画结束回调
    // 会传入到animation方法里面，在动画运动完后必须调用此方法。
    done: function( isInit ) {
        var opts = this.options;

        this.finished = true;

        // 如果用户有设置动画结束函数，则执行
        if ( !isInit && typeof opts.slideEnd === 'function' ) {
            opts.slideEnd.call( this, this );
        }

        this.prevIndex = this.index;

        this.play();
    },

    // 切换到指定页
    goto: function( page, isInit/*内部属性*/ ) {
        page = Math.abs( ~~Number( page ) );
        this.stop();
        this.animationPreprocess( page - this.index, isInit );
    }
});


/*
|-------------------------------------------------------------------------------
| 方法
|-------------------------------------------------------------------------------
|
*/
iceberg.methods = {
    goto: function( jq, index ) {
        return jq.each(function() {
            var obj = $.data( this, 'iceberg' );
            obj.goto( index );
        });
    },
    prev: function( jq ) {
        return jq.each(function() {
            var obj = $.data( this, 'iceberg' );
            obj.animationPreprocess( -1 );
        });
    },
    next: function( jq ) {
        return jq.each(function() {
            var obj = $.data( this, 'iceberg' );
            obj.animationPreprocess( 1 );
        });
    },
    first: function( jq ) {
        return jq.each(function() {
            var obj = $.data( this, 'iceberg' );
            obj.goto( 0 );
        });
    },
    last: function( jq ) {
        return jq.each(function() {
            var obj = $.data( this, 'iceberg' );
            obj.goto( obj.pageNum - 1 );
        });
    }
};

export default iceberg;