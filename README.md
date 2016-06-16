## 介绍
QWrap Blog: http://www.qwrap.com

QWrap是百度有啊前端团队推出的一个javascript框架，在BSD协议下开源发布。

QWrap名称的来历: Query and Wrap、Quick Wrap、 Cute Wrap？随便怎么理解吧。
## 如何使用
Qwrap的一些典型用法：（以有啊版应用为例）
引用一个/core_dom_youa.js就可以这样用了：
像jQuery一样这样用： ----(注，W相当于jQuery的$)

    W('textarea').css('color','red').css('width','600px');

像prototype一样这样用： ----(注，原型风格)

    alert('Time: '+new Date().format('yyyy-MM-dd hh:mm:ss'));

像YUI3一样按需加载： ----(注，本示例把jQuery库当一个模块按需加载。需要配置，参见：种子应用)
    use('jQuery',function(){$('textarea').css('color','black');});

像YUI2一样静态调用： ----(注，静态方式适合组件开发者，参见：纯净应用)
    Dom.setStyle(document.body,'color','red');

QWrap与市面上的各大框架没有冲突，可以和平共存，所以还有一些互补型的应用，参见QWrap应用表.

## 为什么要Qwrap？
前端之大，框架或框枷很多。Prototype、YUI、Jquery、Dojo……各有各的好，但是也有一些各自的缺憾。QWrap用独特的设计与实现，做到了： 
    提供jquery一样方便的dom功能，同时又打破jquery“专注于dom”的约束，也提供非dom的许多功能。
    提供prototype方便的原型功能，同时又提供javascript1.6的泛型功能，并且提供用户有选择方便与严谨的自由。
    提供YUI2一样的静态方法库，同时又用所谓的Helper规范来做到真正的绝对静态，让组件开发者可以发布出无依赖的组件。
    学习YUI3的use，同时又摈弃YUI3的严谨性洁癖，让use更实用。
    QWrap独创特的Helper + Wrap + Retouch + Apps设计，让QWrap有更多的灵性等待你去发现。(参见：QWrap博客中的设计介绍系列)

## 如何参与Qwrap开发？
QWrap的第一支生力军，来自百度有啊WedTeam。
Wed在这贡献里只能是一小部分。更多是希望大家都来关注、贡献、试用、使用、推广、交流。


--------------

Qwrap, an open source(BSD) javascript framework, which is created by Baidu Youa front-end team "WED".

Where the name comes from? Query and Wrap、Quick Wrap、 Cute Wrap？Well, anything as you choose ^_^.

The basics of using Qwrap (some live examples in Youa project):
To start, just simply get a copy of the Qwrap library and include /core_dom_youa.js.
Using it just like using jQuery (W is the same as $ in Qwrap):

    W('textarea').css('color','red').css('width','600px');

Using it just like using prototype (the prototype style):

    alert('Time: '+new Date().format('yyyy-MM-dd hh:mm:ss'));

Loading on demand as YUI3 (in this example, jQuery library is loaded on demand as a module. See also: seed app):
    use('jQuery',function(){$('textarea').css('color','black');});

Static call as YUI2 (static call is for components developers. See also: pure app):
    Dom.setStyle(document.body,'color','red');

Further, it is not in conflict with other frameworks such as jquey, yui, and etc.

Why QWrap?
There are numerous frameworks or frame fetters:p. Prototype、YUI、JQuery、Dojo…… they all have their own  disadvantages as well as advantages. The unique design and implementation of Qwrap, enables:
    The DOM functions provided by Qwrap is convenient as JQuery is, but not limited by jQuery's "just focus on DOM", it also provides lots of functions outsides DOM.
    Both the prototype methods and generic functions as javascript1.6 are provided. Users can choose what they need.
    The static method library as YUI2, and the so called Helper standard (which enables the real static), enable components developers to build solo components
    The use method learned from YUI3, is modified to be more adaptable by discarding the over-cleanliness of YUI3.
    This unique design of QWrap: Helper + Wrap + Retouch + Apps, brings spirit that waiting to be discovered by you (See also: the introduction of design in QWrap blog).

Getting involved:
QWrap is a cooperation effort of WED, what we can contribute is limited, so we need your help!
You can make a difference by your attention, contribution, promotion, and application.

Translated by Teng (2011-07-31)
