/**
 * BilliesBkchangeV2
 *
 * @version 2.0
 * @author  Seiichi Nukayama
 * @license MIT License
 * @link    https://github.com/SeiichiN/
 */
;(function($) {
    'use strict';

    var loadedImages = {},
        corners = ['Top', 'Right', 'Bottom', 'Left'],
        backgroundProperties = [
                'Attachment', // スクロールしたときの背景画像の表示方法
                'Color',      // 背景色
                'Image',      // 背景画像
                'Repeat',     // 背景画像の繰り返し
                'Position',   // 背景画像の水平・垂直位置
                'Size',       // 背景画像の表示方法
                'Clip',       // 背景画像を表示する領域
                'Origin'      // 背景画像を表示する基準位置
        ];

    // jQueryプラグイン bgchanger の定義
    $.fn.bgchanger = function() {
        var args = arguments;

        return this.each(function() {

            var instance = new BgChanger(this);

            // instance には、$el と $bg の2つが含まれている。
            instance.setOptions(args);

            instance.refresh();
            instance.start();

        });
            
    }

    // Backward Compatibility
    $.fn.bgChanger = $.fn.bgchanger;

    /**
     * BgChanger
     *
     * @param: {HTML_Element} el
     *
     * @constructor
     */
    function BgChanger(el) {
        this.$el = $(el);
        this.index = 0;
        this.options = $.extend({}, BgChanger.defaultOptions);
        this.imageList = [];
        
        this._setupBackgroundElement();
    }
    
    $.extend(BgChanger.prototype, {

        /**
         * setOptions
         *
         * @param: {Object} options
         */
        setOptions: function(options) {
            this.options = $.extend(this.options, options);
        },

        /**
         * Refresh
         */
        refresh: function() {
            this.setImages(this.options[0].images);
            this._prepareChanging();
        },

        /**
         * Start -- next をインターバル処理
         */
        start: function() {
            if (!this._timerID) {
                // this._timerID = setInterval($.proxy(this, 'next'), this.options[0].times); 
                this._timerID = setTimeout($.proxy(this, 'next'), this.options[0].times); 
            }
        },

        /**
         * Stop
         */
        stop: function() {
            if (this._timerID) {
                clearTimeout(this._timerID);
                this._timerID = null;
            }
        },

        /**
         * Next -- this.indexを1つすすめて、changingに処理をわたす
         */
        next: function() {
            var max = this.imageList.length;

            this.index++;

            if (this.index === max) {
                this.index = 0;
            }

            this.changing();
        },

        /**
         * Changing -- 背景を入れ替える
         */
        changing: function() {
            var started = !!this._timerID;  // _timerIDがセットされていれば、true
            
            if (started) {
                this.stop();
            }

            this._createChangingElement();  // $bg の子要素に $changing を追加(cssをコピーして)
            this._prepareChanging();        // $bg の背景をセット(this.indexを1つすすめて）
            this.switchHandler(this.$changing);

            if (started) {
                this.start();
            }
        },

        /**
         * switchHandler
         *
         * @param: {Object} node -- アニメーション対象の要素
         */
        switchHandler: function(node) {
            var 
            // animateに渡すCSS,
            params = {
                opacity: 0
            },

                // animateの持続時間
                duration = this.options[0].speed,

                // アニメーション終了時の処理
                callback = function() {
                    // 非表示にして
                    node.hide();
                    // アニメーションで変更したスタイルを元に戻す
                    node.css({
                        opacity: 1
                    });
                };

            node.animate(params, duration, callback);
        },
        
        /**
         * SetImages
         *
         * @param: Array images -- ['img/bak1.jpg', 'img/bak2.jpg', 'img/bak3.jpg']
         *
         * @return: Array imageList -- ['url(img/bak1.jpg)', 'url(img/bak2.jpg)', 'url(img/bak3.jpg')]
         */
        setImages: function(images) {
            this.imageList = $.map(images, function(ele, index) {
                return 'url(' + ele + ')';
            });
        },

        /**
         * Setup background element
         */
        _setupBackgroundElement: function() {
            this.$bg = $(document.createElement('div'));
            this.$bg.css({
                position: 'absolute',
                zIndex: (parseInt(this.$el.css('zIndex'), 10) || 0) - 1,
                overflow: 'hidden'
            });

            this._copyBackgroundStyles();
            this._adjustRectangle();

            if (this.$el[0].tagName === 'BODY') {
                // $el要素(=BODY)
                //   $bg要素
                this.$el.prepend(this.$bg);
            } else {
                // $bg要素
                //   $el要素
                this.$el.before(this.$bg);
                this.$el.css('background', 'none');
            }
                
        },

        /**
         * Copy background styles
         */
        _copyBackgroundStyles: function() {
            var prop,
                copiedStyle = {},
                i = 0,
                length = backgroundProperties.length,
                backgroundPosition = 'backgroundPosition';

            for (; i < length; i++) {
                // backgroundProperties[i] --
                //   Attachment
                //   Color
                //   Image
                //   Repeat
                //   Position
                //   Size
                //   Clip
                //   Origin
                prop = 'background' + backgroundProperties[i];
                copiedStyle[prop] = this.$el.css(prop);
            }
            
            this.$bg.css(copiedStyle);
        },

        /**
         * Create Changing Element
         *
         * <div>...</div>   <== 背景をセットした要素($bg)
         *       | 
         *       V
         * <div>               <== $bg
         *    <div>...</div>   <== $changing を追加(appendTo())
         * </div>
         */
        _createChangingElement: function() {
            if (this.$changing) {
                this.$changing.remove();
            }

            this.$changing = this.$bg.clone();

            this.$changing.css({top: 0, left: 0});

            this.$changing.appendTo(this.$bg);  // $bg の子要素に $changing を追加
        },

        /**
         * Adjust rectangle
         */
        _adjustRectangle: function() {
            var corner,
                i = 0,
                length = corners.length,
                offset = this.$el.position(),
                copiedStyles = {
                    top: offset.top,
                    left: offset.left,
                    width: this.$el.innerWidth(),
                    height: this.$el.innerHeight()
                };

            for (; i < length; i++) {
                corner = corners[i];
                copiedStyles['margin' + corner] = this.$el.css('margin' + corner);
                copiedStyles['border' + corner] = this.$el.css('border' + corner);
            }

            this.$bg.css(copiedStyles);
        },

        /**
         * Prepare Changing
         *
         * $bg の背景に this.index(0, 1, 2) の画像をセットする
         */
        _prepareChanging: function() {
            this.$bg.css('backgroundImage', this.imageList[this.index]);
        }
        
    }); // BgChanger.prototype

    /**
     * Default Options
     * @type {Object}
     */
    BgChanger.defaultOptions = {
        images: [],
        times: 5000,
        effect: 'fade',
        speed: 3000
    };

}(jQuery));
    
