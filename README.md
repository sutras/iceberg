# iceberg

## 说明
基于jQuery的网页特效（轮播图、跑马灯、标签栏等）插件。

## iceberg名称由来
轮播图和跑马灯等效果，都是在网页上一个小小的框展示众多的内容，
一眼看去，小框上可能只显示一张图片，然而这只是冰山一角。

## 使用
1. 引入jQuery库

``` html
<script src="./js/jquery.min.js"></script>
```

2. 引入iceberg插件

``` html
<script src="./js/jquery.iceberg.min.js"></script>
```

3. 编写HTML内容

``` html
<div class="iceberg-container">
    <div class="iceberg-wrapper">
        <div class="iceberg-slide">滑块1</div>
        <div class="iceberg-slide">滑块2</div>
        <div class="iceberg-slide">滑块3</div>
    </div>
    <div class="iceberg-prev">&lt;</div>
    <div class="iceberg-next">&gt;</div>
    <div class="iceberg-page"></div>
</div>
```

4. 编写CSS样式

``` css
.iceberg-container {
    width: 400px;
    height: 200px;
}
```

5. 调用iceberg

``` js
jQuery('.iceberg-container').iceberg({
    effect: 'slide'
});
```

## 默认配置参数

``` js
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
```

## 方法

``` js
$().iceberg('goto', <pageNum>)
$().iceberg('prev')
$().iceberg('next')
$().iceberg('first')
$().iceberg('last')
```

## 属性

``` js
$().data().iceberg
```

## 常用效果代码

### 带底部和入场动画的全屏轮播

``` js
(function() {
    var MOTION_IN = 'motionIn',
        MOTION_OUT = 'motionOut',
        selector = '.fullpage-motion',
        motion,
        duration = 500;

    motion = new Motion({
        selector: selector,
        scroll: false,
        end: function( el, queue ) {
            if ( queue === MOTION_OUT ) {
                el.style.visibility = 'hidden';
            }
        },
        delay: 300
    });

    function motionIn( iceberg ) {
        var last = iceberg.pageNum - 1,
            booby = last - 1;
        if ( iceberg.prevIndex !== last || iceberg.index !== booby ) {
            iceberg.$slide.eq( iceberg.index ).find( selector ).each(function() {
                motion.exec( this, MOTION_IN );
            });
        }
        if ( iceberg.prevIndex !== booby && iceberg.index === last ) {
            iceberg.$slide.eq( booby ).find( selector ).each(function() {
                motion.exec( this, MOTION_IN );
            });
        }
    }

    function motionOut( iceberg ) {
        var last = iceberg.pageNum - 1,
            booby = last - 1;

        if ( iceberg.prevIndex != null ) {
            if ( iceberg.prevIndex !== booby || iceberg.index !== last ) {
                iceberg.$slide.eq( iceberg.prevIndex ).find( selector ).each(function() {
                    motion.exec( this, MOTION_OUT );
                });
            }
            if ( iceberg.prevIndex === last && iceberg.index !== booby ) {
                iceberg.$slide.eq( booby ).find( selector ).each(function() {
                    motion.exec( this, MOTION_OUT );
                });
            }
        }
    }

    $footer = $('.home-footer .footer');

    function handleFooter( iceberg ) {
        var $con = iceberg.$container,
            footerH = $footer.outerHeight(),
            conH = $con.height();

        if ( iceberg.index === iceberg.$page.length - 1 ) {
            $con.stop(true, true).animate({
                top: conH - footerH
            }, duration, function() {
                $con.css('top', 'calc(100vh - 120px - ' + footerH + 'px)');
            });
        } else {
            $con.stop(true, true).animate({
                top: 0
            }, duration);
        }
    }

    $fullPage = $('#homeFullPage');
    $fullPage.iceberg({
        effect: 'slide',
        page: ['.home-fullpage-page'],
        duration: duration,
        vertical: true,
        instant: false,
        disabled: true,
        mousewheel: true,
        autoPlay: false,
        init: function() {
            handleFooter( this );
            motionIn( this );
        },
        slideStart: function() {
            handleFooter( this );
            motionIn( this );
        },
        slideEnd: function() {
            motionOut( this );
        }
    });

    // 通过键盘的PageUp、PageDown、Home、End控制切换
    $(window).on('keyup', function( ev ) {
        switch ( ev.keyCode ) {
            // Home
            case 36:
                $fullPage.iceberg('first');
                break;
            // End
            case 35:
                $fullPage.iceberg('last');
                break;
            // PageUp
            case 33:
                $fullPage.iceberg('prev');
                break;
            // PageDown
            case 34:
                $fullPage.iceberg('next');
                break;
        }
    });
})();
```