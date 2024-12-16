/*
    增强背景轮播和表单处理脚本
    基于 "Eventually" 模板的改进版本
    针对性能、可访问性和现代 Web 标准进行了优化
*/

(function() {
    "use strict";

    // 兼容性和 Polyfill 工具
    const BrowserUtils = {
        // classList Polyfill（原始实现保留）
        polyfillClassList: function() {
            if ("classList" in document.documentElement) return;

            // 定义 ClassList 类，用于模拟 classList API
            function ClassList(elem) {
                const classList = elem.className.replace(/^\s+|\s+$/g, "").split(/\s+/);
                
                // 添加类名
                classList.add = function(token) {
                    if (!this.contains(token)) {
                        classList.push(token);
                        elem.className = classList.join(" ");
                    }
                };

                // 移除类名
                classList.remove = function(token) {
                    const index = classList.indexOf(token);
                    if (index !== -1) {
                        classList.splice(index, 1);
                        elem.className = classList.join(" ");
                    }
                };

                // 切换类名（存在则移除，不存在则添加）
                classList.toggle = function(token) {
                    this.contains(token) ? this.remove(token) : this.add(token);
                };

                // 检查类名是否存在
                classList.contains = function(token) {
                    return classList.indexOf(token) !== -1;
                };

                return classList;
            }

            // 在 Element 原型上定义 classList 属性
            Object.defineProperty(Element.prototype, 'classList', {
                get: function() {
                    return new ClassList(this);
                }
            });
        },

        // 功能检测工具
        canUse: function(property) {
            const testElement = document.createElement("div");
            const prefixes = ['', 'Moz', 'Webkit', 'O', 'ms'];
            
            return prefixes.some(prefix => {
                const prop = prefix ? prefix + property.charAt(0).toUpperCase() + property.slice(1) : property;
                return prop in testElement.style;
            });
        },

        // 事件监听 Polyfill
        addEventListenerPolyfill: function() {
            if ("addEventListener" in window) return;
            window.addEventListener = function(type, listener) {
                window.attachEvent("on" + type, listener);
            };
        }
    };

    // 背景轮播模块
    const BackgroundSlider = {
        settings: {
            // 图片配置：URL 和对齐方式
            images: {
                'https://pic.2ge.org/randimg/hot/': 'center',
                'https://pic.2ge.org/randimg/game/': 'center',
                'https://pic.2ge.org/randimg/dongman/': 'center'
            },
            delay: 10000 // 切换间隔（毫秒）
        },

        // 初始化背景轮播
        init: function() {
            const body = document.body;
            const wrapper = document.createElement('div');
            wrapper.id = 'bg';
            body.appendChild(wrapper);

            // 创建背景图片元素
            this.backgrounds = Object.entries(this.settings.images).map(([url, alignment]) => {
                const bg = document.createElement('div');
                bg.style.backgroundImage = `url("${url}")`;
                bg.style.backgroundPosition = alignment;
                wrapper.appendChild(bg);
                return bg;
            });

            this.enhanceAccessibility(); // 增强可访问性
            this.startSlideshow(); // 开始轮播
        },

        // 为背景图片添加可访问性标签
        enhanceAccessibility: function() {
            this.backgrounds.forEach((bg, index) => {
                bg.setAttribute('role', 'img');
                bg.setAttribute('aria-label', `背景图片 ${index + 1}`);
            });
        },

        // 启动轮播
        startSlideshow: function() {
            if (this.backgrounds.length <= 1 || !BrowserUtils.canUse('transition')) return;

            let currentIndex = 0;

            const cycleBackground = () => {
                const lastIndex = currentIndex;
                currentIndex = (currentIndex + 1) % this.backgrounds.length;

                // 上一张图片移除顶部类
                this.backgrounds[lastIndex].classList.remove('top');

                // 当前图片添加可见和顶部类
                this.backgrounds[currentIndex].classList.add('visible');
                this.backgrounds[currentIndex].classList.add('top');

                // 延迟隐藏上一张图片
                setTimeout(() => {
                    this.backgrounds[lastIndex].classList.remove('visible');
                }, this.settings.delay / 2);
            };

            // 初始化第一张图片
            this.backgrounds[currentIndex].classList.add('visible');
            this.backgrounds[currentIndex].classList.add('top');

            // 设置定时器开始轮播
            setInterval(cycleBackground, this.settings.delay);
        },

        // 预加载图片
        preloadImages: function() {
            const imageUrls = Object.keys(this.settings.images);
            return imageUrls.map(url => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                    img.src = url;
                });
            });
        }
    };

    // 表单处理模块
    const FormHandler = {
        init: function() {
            const form = document.querySelector('#signup-form');
            if (!form || !('addEventListener' in form)) return;

            const submit = form.querySelector('input[type="submit"]');
            const message = this.createMessageElement(form);

            form.addEventListener('submit', (event) => {
                event.preventDefault();
                event.stopPropagation();

                this.handleSubmit(form, submit, message);
            });
        },

        // 创建表单消息元素
        createMessageElement: function(form) {
            const message = document.createElement('span');
            message.classList.add('message');
            form.appendChild(message);

            // 显示消息
            message.show = (type, text) => {
                message.innerHTML = text;
                message.classList.add(type, 'visible');

                setTimeout(() => message.hide(), 3000);
            };

            // 隐藏消息
            message.hide = () => {
                message.classList.remove('visible');
            };

            return message;
        },

        // 处理表单提交
        handleSubmit: function(form, submit, message) {
            // 隐藏现有消息
            message.hide();

            // 禁用提交按钮
            submit.disabled = true;

            // 模拟表单处理
            setTimeout(() => {
                form.reset(); // 重置表单
                submit.disabled = false; // 重新启用按钮
                message.show('success', '感谢您的提交！'); // 显示成功消息
            }, 750);
        }
    };

    // 响应式设计工具
    const ResponsiveUtils = {
        init: function() {
            this.handleBackgroundResponsiveness();
            this.handleWindowResize();
        },

        // 背景自适应处理
        handleBackgroundResponsiveness: function() {
            const bg = document.getElementById('bg');
            if (!bg) return;

            function updateBackgroundSize() {
                const windowRatio = window.innerWidth / window.innerHeight;
                bg.style.backgroundSize = windowRatio > 1 ? 'cover' : 'contain';
            }

            window.addEventListener('resize', updateBackgroundSize);
            updateBackgroundSize();
        },

        // 处理窗口调整
        handleWindowResize: function() {
            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    console.log('窗口大小已调整');
                }, 250);
            });
        }
    };

    // 应用初始化
    function initializeApplication() {
        // 应用 Polyfill
        BrowserUtils.polyfillClassList();
        BrowserUtils.addEventListenerPolyfill();

        // 页面加载后移除预加载样式
        window.addEventListener('load', async () => {
            try {
                // 预加载图片
                await Promise.all(BackgroundSlider.preloadImages());
                document.body.classList.remove('is-preload');
            } catch (error) {
                console.warn('图片预加载部分失败：', error);
                document.body.classList.remove('is-preload');
            }

            // 初始化模块
            BackgroundSlider.init();
            FormHandler.init();
            ResponsiveUtils.init();
        });
    }

    // 启动应用
    initializeApplication();
})();
