Ext.BLANK_IMAGE_URL = 'resources/s.gif';

Docs = {};
Demos = {classData: {}, icons:{}};
Notes = {classData: {}, icons:{}};
Valids = {};
ApiPanel = function() {
	ApiPanel.superclass.constructor.call(this, {
		id:'api-tree',
		//region:'west',
		split:true,
		width: 280,
		minSize: 175,
		maxSize: 500,
		collapsible: true,
		margins:'0 0 5 5',
		cmargins:'0 0 0 0',
		rootVisible:false,
		lines:false,
		autoScroll:true,
		animCollapse:true,
		animate: true,
		collapseMode:'mini',
		title: 'API Documentation',
		loader: new Ext.tree.TreeLoader({
			preloadChildren: true,
			clearOnLoad: false
		}),
		root: new Ext.tree.AsyncTreeNode({
			text:'Ext JS',
			id:'root',
			expanded:true,
			children:[Docs.classData]
		}),
		collapseFirst:false
    });
    // no longer needed!
    //new Ext.tree.TreeSorter(this, {folderSort:true,leafAttr:'isClass'});

    this.getSelectionModel().on('beforeselect', function(sm, node){
        return node.isLeaf();
    });
};


DemoPanel = function() {
	DemoPanel.superclass.constructor.call(this, {
		id: 'demo-tree',
		title: 'Example',
		split: true,
		width: 280,
		minSize: 175,
		maxSize: 500,
		collapsible: true,
		margins:'0 0 5 5',
		cmargins:'0 0 0 0',
		rootVisible:false,
		lines:false,
		autoScroll:true,
		animCollapse:true,
		animate: true,
		collapseMode:'mini',
		root: new Ext.tree.AsyncTreeNode({
			text:'Ext JS',
			id:'ss',
			expanded:true,
			children:[Demos.classData]
		}),
		loader: new Ext.tree.TreeLoader({
			preloadChildren: true,
			clearOnLoad: false
		}),
		collapseFirst:false
	});
	this.getSelectionModel().on('beforeselect', function(sm, node){
		return node.isLeaf();
	});
};

ValidTreePanel = function() {
	ValidTreePanel.superclass.constructor.call(this, {
		id: 'valid-tree',
		title: 'Analyse',
		split: true,
		width: 280,
		minSize: 175,
		maxSize: 500,
		collapsible: true,
		margins:'0 0 5 5',
		cmargins:'0 0 0 0',
		rootVisible:false,
		autoScroll:true,
		animCollapse:true,
		lines:false,
		animate: true,
		collapseMode:'mini',
		root: new Ext.tree.AsyncTreeNode({
			text:'dsdsd',
			id:'validsds',
			expanded:true,
			children:[Valids.classData]
		}),
		loader: new Ext.tree.TreeLoader({
			preloadChildren: true,
			clearOnLoad: false
		}),
		collapseFirst:false
	});
	this.getSelectionModel().on('beforeselect', function(sm, node){
		return node.isLeaf();
	});
};

NotePanel = function() {
        NotePanel.superclass.constructor.call(this, {
                id: 'note-tree',
                title: 'Notes',
                split: true,
                width: 280,
                minSize: 175,
                maxSize: 500,
                collapsible: true,
                margins:'0 0 5 5',
                cmargins:'0 0 0 0',
                rootVisible:false,
                lines:false,
                autoScroll:true,
                animCollapse:true,
                animate: true,
                collapseMode:'mini',
                root: new Ext.tree.AsyncTreeNode({
                        text:'Ext JS',
                        id:'ss-note',
                        expanded:true,
                        children:[Notes.classData]
                }),
                loader: new Ext.tree.TreeLoader({
                        preloadChildren: true,
                        clearOnLoad: false
                }),
                collapseFirst:false
        });
        this.getSelectionModel().on('beforeselect', function(sm, node){
                return node.isLeaf();
        });
};

Ext.extend(ApiPanel, Ext.tree.TreePanel, {
    initComponent: function(){
        this.hiddenPkgs = [];
        Ext.apply(this, {
            tbar:[ ' ',
			new Ext.form.TextField({
				width: 200,
				emptyText:'Find a Class',
                enableKeyEvents: true,
				listeners:{
					render: function(f){
                    	this.filter = new Ext.tree.TreeFilter(this, {
                    		clearBlank: true,
                    		autoClear: true
                    	});
					},
                    keydown: {
                        fn: this.filterTree,
                        buffer: 350,
                        scope: this
                    },
                    scope: this
				}
			}), ' ', ' ',
			{
                iconCls: 'icon-expand-all',
				tooltip: 'Expand All',
                handler: function(){ this.root.expand(true); },
                scope: this
            }, '-', {
                iconCls: 'icon-collapse-all',
                tooltip: 'Collapse All',
                handler: function(){ this.root.collapse(true); },
                scope: this
            }]
        })
        ApiPanel.superclass.initComponent.call(this);
    },
	filterTree: function(t, e){
		var text = t.getValue();
		Ext.each(this.hiddenPkgs, function(n){
			n.ui.show();
		});
		if(!text){
			this.filter.clear();
			return;
		}
		this.expandAll();
		
		var re = new RegExp(Ext.escapeRe(text), 'img');
		this.filter.filterBy(function(n){
			return !n.attributes.isClass || re.test(n.text);
		});
		
		// hide empty packages that weren't filtered
		this.hiddenPkgs = [];
		var me = this;
		this.root.cascade(function(n){
			if(!n.attributes.isClass && n.ui.ctNode.offsetHeight < 3){
				n.ui.hide();
				me.hiddenPkgs.push(n);
			}
		});
	},
    selectClass : function(cls){
        if(cls){
            var parts = cls.split('.');
            var last = parts.length-1;
            var res = [];
            var pkg = [];
            for(var i = 0; i < last; i++){ // things get nasty - static classes can have .
                var p = parts[i];
                var fc = p.charAt(0);
                var staticCls = fc.toUpperCase() == fc;
                if(p == 'Ext' || !staticCls){
                    pkg.push(p);
                    res[i] = 'pkg-'+pkg.join('.');
                }else if(staticCls){
                    --last;
                    res.splice(i, 1);
                }
            }
            res[last] = cls;

            this.selectPath('/root/apidocs/'+res.join('/'));
        }
    }
});

Ext.extend(DemoPanel, Ext.tree.TreePanel, {
    initComponent: function(){
        this.hiddenPkgs = [];
        Ext.apply(this, {
            tbar:[ ' ',
			new Ext.form.TextField({
				width: 200,
				emptyText:'Find a Sample',
                enableKeyEvents: true,
				listeners:{
					render: function(f){
                    	this.filter = new Ext.tree.TreeFilter(this, {
                    		clearBlank: true,
                    		autoClear: true
                    	});
					},
                    keydown: {
                        fn: this.filterTree,
                        buffer: 350,
                        scope: this
                    },
                    scope: this
				}
			}), ' ', ' ',
			{
                iconCls: 'icon-expand-all',
				tooltip: 'Expand All',
                handler: function(){ this.root.expand(true); },
                scope: this
            }, '-', {
                iconCls: 'icon-collapse-all',
                tooltip: 'Collapse All',
                handler: function(){ this.root.collapse(true); },
                scope: this
            }]
        })
        DemoPanel.superclass.initComponent.call(this);
    },
	filterTree: function(t, e){
		var text = t.getValue();
		Ext.each(this.hiddenPkgs, function(n){
			n.ui.show();
		});
		if(!text){
			this.filter.clear();
			return;
		}
		this.expandAll();
		
		var re = new RegExp(Ext.escapeRe(text), 'img');
		this.filter.filterBy(function(n){
			return !n.attributes.leaf || re.test(n.text);
		});
		
		// hide empty packages that weren't filtered
		this.hiddenPkgs = [];
		var me = this;
		this.root.cascade(function(n){
			if(!n.attributes.leaf && n.ui.ctNode.offsetHeight < 3){
				n.ui.hide();
				me.hiddenPkgs.push(n);
			}
		});
	},
    selectClass : function(cls){
        if(cls){
            var parts = cls.split('.');
            var last = parts.length-1;
            var res = [];
            var pkg = [];
            for(var i = 0; i < last; i++){ // things get nasty - static classes can have .
                var p = parts[i];
                var fc = p.charAt(0);
                var staticCls = fc.toUpperCase() == fc;
                if(p == 'Ext' || !staticCls){
                    pkg.push(p);
                    res[i] = 'pkg-'+pkg.join('.');
                }else if(staticCls){
                    --last;
                    res.splice(i, 1);
                }
            }
            res[last] = cls;

            this.selectPath('/root/apidocs/'+res.join('/'));
        }
    }
});

Ext.extend(NotePanel, Ext.tree.TreePanel, {
    initComponent: function(){
        this.hiddenPkgs = [];
        Ext.apply(this, {
            tbar:[ ' ',
			new Ext.form.TextField({
				width: 200,
				emptyText:'Find a Note',
                enableKeyEvents: true,
				listeners:{
					render: function(f){
                    	this.filter = new Ext.tree.TreeFilter(this, {
                    		clearBlank: true,
                    		autoClear: true
                    	});
					},
                    keydown: {
                        fn: this.filterTree,
                        buffer: 350,
                        scope: this
                    },
                    scope: this
				}
			}), ' ', ' ',
			{
                iconCls: 'icon-expand-all',
				tooltip: 'Expand All',
                handler: function(){ this.root.expand(true); },
                scope: this
            }, '-', {
                iconCls: 'icon-collapse-all',
                tooltip: 'Collapse All',
                handler: function(){ this.root.collapse(true); },
                scope: this
            }]
        })
        NotePanel.superclass.initComponent.call(this);
    },
	filterTree: function(t, e){
		var text = t.getValue();
		Ext.each(this.hiddenPkgs, function(n){
			n.ui.show();
		});
		if(!text){
			this.filter.clear();
			return;
		}
		this.expandAll();
		
		var re = new RegExp(Ext.escapeRe(text), 'img');
		this.filter.filterBy(function(n){
			return !n.attributes.leaf || re.test(n.text);
		});
		
		// hide empty packages that weren't filtered
		this.hiddenPkgs = [];
		var me = this;
		this.root.cascade(function(n){
			if(!n.attributes.leaf && n.ui.ctNode.offsetHeight < 3){
				n.ui.hide();
				me.hiddenPkgs.push(n);
			}
		});
	},
    selectClass : function(cls){
        if(cls){
            var parts = cls.split('.');
            var last = parts.length-1;
            var res = [];
            var pkg = [];
            for(var i = 0; i < last; i++){ // things get nasty - static classes can have .
                var p = parts[i];
                var fc = p.charAt(0);
                var staticCls = fc.toUpperCase() == fc;
                if(p == 'Ext' || !staticCls){
                    pkg.push(p);
                    res[i] = 'pkg-'+pkg.join('.');
                }else if(staticCls){
                    --last;
                    res.splice(i, 1);
                }
            }
            res[last] = cls;

            this.selectPath('/root/apidocs/'+res.join('/'));
        }
    }
});

Ext.extend(ValidTreePanel, Ext.tree.TreePanel, {
    selectClass : function(cls){
        if(cls){
            var parts = cls.split('.');
            var last = parts.length-1;
            var res = [];
            var pkg = [];
            for(var i = 0; i < last; i++){ // things get nasty - static classes can have .
                var p = parts[i];
                var fc = p.charAt(0);
                var staticCls = fc.toUpperCase() == fc;
                if(p == 'Ext' || !staticCls){
                    pkg.push(p);
                    res[i] = 'pkg-'+pkg.join('.');
                }else if(staticCls){
                    --last;
                    res.splice(i, 1);
                }
            }
            res[last] = cls;

            this.selectPath('/root/apidocs/'+res.join('/'));
        }
    }
});


DocPanel = Ext.extend(Ext.Panel, {
    closable: true,
    autoScroll:true,
    
    initComponent : function(){
        var ps = this.cclass.split('.');
        this.title = ps[ps.length-1];
        Ext.apply(this,{
            tbar: ['->',{
                text: 'Config Options',
                handler: this.scrollToMember.createDelegate(this, ['configs']),
                iconCls: 'icon-config'
            },'-',{
                text: 'Properties',
                handler: this.scrollToMember.createDelegate(this, ['props']),
                iconCls: 'icon-prop'
            }, '-',{
                text: 'Methods',
                handler: this.scrollToMember.createDelegate(this, ['methods']),
                iconCls: 'icon-method'
            }, '-',{
                text: 'Events',
                handler: this.scrollToMember.createDelegate(this, ['events']),
                iconCls: 'icon-event'
            }, '-',{
                text: 'Direct Link',
                handler: this.directLink,
                scope: this,
                iconCls: 'icon-fav'
            }, '-',{
                tooltip:'Hide Inherited Members',
                iconCls: 'icon-hide-inherited',
                enableToggle: true,
                scope: this,
                toggleHandler : function(b, pressed){
                     this.body[pressed ? 'addClass' : 'removeClass']('hide-inherited');
                }
            }, '-', {
                tooltip:'Expand All Members',
                iconCls: 'icon-expand-members',
                enableToggle: true,
                scope: this,
                toggleHandler : function(b, pressed){
                    this.body[pressed ? 'addClass' : 'removeClass']('full-details');
                }
            }]
        });
        DocPanel.superclass.initComponent.call(this);
    },

    directLink : function(){
        var link = String.format(
            "<a href=\"{0}\" target=\"_blank\">{0}</a>",
            document.location.href+'?class='+this.cclass
        );
        Ext.Msg.alert('Direct Link to ' + this.cclass,link);
    },
    
    scrollToMember : function(member){
        var el = Ext.fly(this.cclass + '-' + member);
        if(el){
            var top = (el.getOffsetsTo(this.body)[1]) + this.body.dom.scrollTop;
            this.body.scrollTo('top', top-25, {duration:0.75, callback: this.hlMember.createDelegate(this, [member])});
        }
    },

	scrollToSection : function(id){
		var el = Ext.getDom(id);
		if(el){
			var top = (Ext.fly(el).getOffsetsTo(this.body)[1]) + this.body.dom.scrollTop;
			this.body.scrollTo('top', top-25, {duration:0.5, callback: function(){
                Ext.fly(el).next('h2').pause(0.2).highlight('#8DB2E3', {attr:'color'});
            }});
        }
	},

    hlMember : function(member){
        var el = Ext.fly(this.cclass + '-' + member);
        if(el){
            if (tr = el.up('tr')) {
                tr.highlight('#cadaf9');
            }
        }
    }
});

ExamplePanel = Ext.extend(Ext.Panel, {
    closable: true,
    autoScroll:true,
    
    initComponent : function(){
        var ps = this.cclass.split('.');
        this.title = ps[ps.length-1];
        Ext.apply(this,{
            tbar: ['->',{
                text: 'View In New Window',
                handler: this.viewInNewWindow,
                scope: this,
                iconCls: 'icon-config'
            },'-',{
                text: 'View Source',
                handler: this.viewSource,
                scope: this,
                iconCls: 'icon-prop'
            }]
        });
        ExamplePanel.superclass.initComponent.call(this);
    },

    viewInNewWindow : function(){
        var link = String.format("<a href=\"{0}\" target=\"_blank\">{0}</a>", this.href);
        Ext.Msg.alert('Direct Link to ' + this.cclass,link);
    },

    viewSource : function(){
        var link = String.format("<a href=\"{0}\" target=\"_blank\">{0}</a>", "/docgen/output/getcode.php?url=" + this.href);
        Ext.Msg.alert('Direct Link to ' + this.cclass, link);
    }
});

ValidPanel = Ext.extend(Ext.Panel, {
    closable: true,
    autoScroll:true,
    
    initComponent : function(){
        var ps = this.cclass.split('.');
        ValidPanel.superclass.initComponent.call(this);
    }
});

NoteDetailPanel = Ext.extend(Ext.Panel, {
    closable: true,
    autoScroll:true,
    
    initComponent : function(){
        var ps = this.cclass.split('.');
		this.title = ps[ps.length-1];
        NoteDetailPanel.superclass.initComponent.call(this);
    }
});


MainPanel = function(){
	
	this.searchStore = new Ext.data.Store({
        proxy: new Ext.data.ScriptTagProxy({
			  //------------------------------------------- to be modified ---------------------------------------
		url: 'http://bb-eb-mall-test07.bb01.baidu.com/test/jsonrpcphp/search.php'
		//url: 'http://www.extjs.com/playpen/api.php'
        }),
        reader: new Ext.data.JsonReader({
	            root: 'data'
	        }, 
			['cls', 'member', 'type', 'doc', 'href', 'code']
		),
		baseParams: {},
        listeners: {
            'beforeload' : function(){
                //this.baseParams.qt = Ext.getCmp('search-type').getValue();
            }
        }
    }); 
	
    MainPanel.superclass.constructor.call(this, {
        id:'doc-body',
        region:'center',
        margins:'0 5 5 0',
        resizeTabs: true,
        minTabWidth: 135,
        tabWidth: 135,
        plugins: new Ext.ux.TabCloseMenu(),
        enableTabScroll: true,
        activeTab: 0,

        items: {
            id:'welcome-panel',
            title: '首页',
            autoLoad: {url: 'welcome.html', callback: this.initSearch, scope: this},
            iconCls:'icon-docs',
            autoScroll: true,
			tbar: [
				'Search: ', ' ',
                new Ext.ux.SelectBox({
                    listClass:'x-combo-list-small',
                    width:90,
                    value:'Any match',
                    id:'search-type',
                    store: new Ext.data.SimpleStore({
                        fields: ['text'],
                        expandData: true,
                        data : ['API Docs', 'Examples', 'Notes', 'Any match']
                    }),
                    displayField: 'text'
                }), ' ',
                new Ext.app.SearchField({
	                width:240,
					store: this.searchStore,
					paramName: 'q'
	            })
            ]
        }
    });
};

Ext.extend(MainPanel, Ext.TabPanel, {

    initEvents : function(){
        MainPanel.superclass.initEvents.call(this);
        this.body.on('click', this.onClick, this);
    },

    onClick: function(e, target){
        if(target = e.getTarget('a:not(.exi)', 3)){
            var cls = Ext.fly(target).getAttributeNS('ext', 'cls');
            e.stopEvent();
            if(cls){
                var member = Ext.fly(target).getAttributeNS('ext', 'member');
                this.loadClass(target.href, cls, member, 'doc');
            }else if(target.className == 'inner-link'){
                this.getActiveTab().scrollToSection(target.href.split('#')[1]);
            }else{
                window.open(target.href);
            }
        }else if(target = e.getTarget('.micon', 2)){
            e.stopEvent();
            var tr = Ext.fly(target.parentNode);
            if(tr.hasClass('expandable')){
                tr.toggleClass('expanded');
            }
        }
    },

    loadClass : function(href, cls, member, docOrDemo, text){
        var id = 'docs-' + cls;
        var tab = this.getComponent(id);
        if(tab){
            this.setActiveTab(tab);
            if(member){
                tab.scrollToMember(member);
            }
        }else{
            var autoLoad = {url: href};
				autoLoad.callback = function(){
					if(member){
						Ext.getCmp(id).scrollToMember(member);
					}
					SyntaxHighlighter.highlight();
				}
				if (docOrDemo == 'doc') {
					var p = this.add(new DocPanel({
						 id: id,
						 cclass : cls,
						 autoLoad: autoLoad,
						 iconCls: Docs.icons[cls]
					}));
					this.setActiveTab(p);
				} else if (docOrDemo == 'demo') {
					var p = this.add(new ExamplePanel({
						 id: id,
						 cclass : cls,
						 href: href,
						 //html: '<div style="background:#dfe8f6;width:100%;height:100%;float:left;"><div style="border:1px solid #99bbe8;margin:0.3%;"><iframe src="' + href + '" style="width:100%;height:48.6%;border:0;background:#fff"></iframe></div><div style="border:1px solid #99bbe8;margin:0.3%;"><iframe src="http://labs.youa.com/jsm/getcode.php?url=' + href + '" style="width:100%;height:48.6%;border:0;background:#fff"></iframe></div></div>',
						 iconCls: Demos.icons[cls],
						 layout: 'border',
						closable: true,
						bodyStyle: "background: #F2F1FF",
						items: [{
							region: 'east',
							width: 500,
							split: true,
							margins: '3 3 3 0',
							html: '<iframe src="getcode.php?url=' + href + '" style="width:100%;height:100%;border:0;background:#fff"></iframe>'
						},{
							region: 'center',
							layout: 'fit',
							margins: '3 0 3 3',
							html: '<iframe src="' + href + '" style="width:100%;height:100%;border:0;background:#fff"></iframe>'
						}]

					}));
					this.setActiveTab(p);
				}else if (docOrDemo == 'note') {
					var p = this.add(new NoteDetailPanel({
						 id: id,
						 cclass : cls,
						 href: href,
						// html: '<div style="background:#dfe8f6;width:100%;height:100%;float:left;"><div style="border:1px solid #99bbe8;margin:0.3%;"><iframe src="' + href + '" style="width:100%;height:48.6%;border:0;background:#fff"></iframe></div><div style="border:1px solid #99bbe8;margin:0.3%;"><iframe src="http://labs.youa.com/jsm/getcode.php?url=' + href + '" style="width:100%;height:48.6%;border:0;background:#fff"></iframe></div></div>',
						 iconCls: Notes.icons[cls],
						 layout: 'border',
						closable: true,
						bodyStyle: "background: #F2F1FF",
						items: [{
							region: 'center',
							layout: 'fit',
							margins: '3 0 3 3',
							html: '<iframe src="' + href + '" style="width:100%;height:100%;border:0;background:#fff"></iframe>'
						}]

					}));
					this.setActiveTab(p);
				} else if (docOrDemo == 'valid') {
					var infoStore = new Ext.data.Store({
						autoDestroy: true,
						url: 'data/errors/' + href.replace("../", "").replace(/\//gi, '_') + '.json',
						storeId: text,
						sortInfo: {field:'type', direction:'ASC'},
						reader: new Ext.data.ArrayReader(
							{}, 
							[{name:'id', type: 'float', mapping: 0}, {name:'type', type: 'string', mapping: 1}, {name:'line', type: 'float', mapping: 2}, {name:'charat', type: 'float', mapping: 3}, {name:'err', type: 'string', mapping: 4}, {name:'evid', type: 'string', mapping: 5}]
						)
					});
					infoStore.load();
					var selectModel = new Ext.grid.RowSelectionModel({
						singleSelect:true
					})
					var gridP = new Ext.grid.GridPanel({
						store: infoStore,
						colModel: new Ext.grid.ColumnModel({
							defaults: {
								width: 40,
								sortable: true
							},
							columns: [
								{header: 'Type', sortable: true, dataIndex: 'type', width: 60},
								{header: 'Line', sortable: true, dataIndex: 'line', width: 60},
								{header: 'Error Message', dataIndex: 'err', width: 300}
							]
						}),viewConfig: {
							forceFit: true
						},
						sm: selectModel,
						region: 'west',
						frame: false,
						split: true,
						width: 450,
						margins: '3 0 3 3',
						header: false,
						iconCls: 'icon-grid',
						tbar: [{
								text: 'Only Errors',
								toggleHandler: function(m, state){
									if (state) {
										var is = gridP.getStore();
										is.each(function(r){
											if (r.data.type.indexOf('Warning') >= 0) {
												is.remove(r);
											}
										});
									} else {
										gridP.getStore().reload();
									}
								},
								enableToggle: true,
								iconCls: 'icon-config'
							}
						]
					});
					var vPanel = new ValidPanel({
						id : id + "_error",
						cclass : cls,
						iconCls : Docs.icons[cls],
						title : text.split(' ')[0],
						layout: 'border',
						items: [
							{
								region: 'center',
								html: '<iframe src="getcode.php?url=' + ("http://" + document.domain + '/~remember2015/docgen/' + href.replace(/\.\.\//g, '')) + '" style="width:100%;height:100%;border:0;background:#fff"></iframe>',
								margins: "3 3 3 0"
							},
							gridP
						]
					});
					var p = this.add(vPanel);
					this.setActiveTab(p);
					selectModel.on('rowselect', function(sm, index, record){
						var line = record.data.line-1;
						var doc = vPanel.items.items[0].el.query('iframe')[0].contentWindow;
						doc.focusLine(line);
						if (record.data.type.indexOf("Warning") >= 0)
							doc.warningLine([line]);
						else
							doc.errorLine([line]);
					});
				}
        }
    },
	
	initSearch : function(){
		// Custom rendering Template for the View
	    var resultTpl = new Ext.XTemplate(
	        '<tpl for=".">',
	        '<div class="search-item">',
	            '<a class="member" ext:cls="{cls}" ext:member="{member}" href="{href}">',
				'<img src="resources/images/default/s.gif" class="item-icon icon-{type}"/>{member}',
				'</a> ',
				'<a class="cls" ext:cls="{cls}" href="{code}">{cls}</a>',
	            '<p>{doc}</p>',
	        '</div></tpl>'
	    );
		
		var p = new Ext.DataView({
            applyTo: 'search',
			tpl: resultTpl,
			loadingText:'Searching...',
            store: this.searchStore,
            itemSelector: 'div.search-item',
			emptyText: '<h3>Use the search field above to search the Ext API for classes, properties, config options, methods and events.</h3>'
        });
	},
	
	doSearch : function(e){
		var k = e.getKey();
		if(!e.isSpecialKey()){
			var text = e.target.value;
			if(!text){
				this.searchStore.baseParams.q = '';
				this.searchStore.removeAll();
			}else{
				this.searchStore.baseParams.q = text;
				this.searchStore.reload();
			}
		}
	}
});


Ext.onReady(function(){

	Ext.QuickTips.init();

	var api = new ApiPanel();
	var mainPanel = new MainPanel();

	api.on('click', function(node, e){
		if(node.isLeaf()){
			e.stopEvent();
			mainPanel.loadClass(node.attributes.href, node.id, null, 'doc');
		}
	});

	mainPanel.on('tabchange', function(tp, tab){
	  api.selectClass(tab.cclass); 
	});

	var demo = new DemoPanel();
	demo.on('click', function(node, e){
		if(node.isLeaf()){
			e.stopEvent();
			mainPanel.loadClass(node.attributes.href, node.id, null, 'demo');
		}
	});

	var note = new NotePanel();
	note.on('click', function(node, e){
			if(node.isLeaf()){
					e.stopEvent();
					mainPanel.loadClass(node.attributes.href, node.text, null, 'note');
			}
	});

	var valid = new ValidTreePanel();
	valid.on('click', function(node, e){
		if(node.isLeaf()){
			e.stopEvent();
			mainPanel.loadClass(node.attributes.href, node.id, null, 'valid', node.text);
		}
	});

	var accordion = new Ext.Panel({
		region:'west',
		margins:'0 0 5 5',
		split:true,
		width: 270,
		layout:'accordion',
		border:false,
		id: 'componect-tree-border',
		items: [api, demo, note, valid]
	});

	var viewport = new Ext.Viewport({
      layout:'border',
		items:[ {
         cls: 'docs-header',
         height: 36,
         region:'north',
         xtype:'box',
         el:'header',
			border: true,
			margins: '0 0 5 0'
		}, accordion, mainPanel ]
	});

	api.expandPath('/root/apidocs');

    // allow for link in
	var page = window.location.href.split('?')[1];
	if(page){
		var ps = Ext.urlDecode(page);
		var cls = ps['class'];
		mainPanel.loadClass('output/' + cls + '.html', cls, ps.member, 'doc');
	}
    
	viewport.doLayout();
	
	setTimeout(function(){
		Ext.get('loading').remove();
		Ext.get('loading-mask').fadeOut({remove:true});
	}, 20);
	
});


Ext.app.SearchField = Ext.extend(Ext.form.TwinTriggerField, {
    initComponent : function(){
        if(!this.store.baseParams){
			this.store.baseParams = {};
		}
		Ext.app.SearchField.superclass.initComponent.call(this);
		this.on('specialkey', function(f, e){
            if(e.getKey() == e.ENTER){
                this.onTrigger2Click();
            }
        }, this);
    },

    validationEvent:false,
    validateOnBlur:false,
    trigger1Class:'x-form-clear-trigger',
    trigger2Class:'x-form-search-trigger',
    hideTrigger1:true,
    width:180,
    hasSearch : false,
    paramName : 'query',

    onTrigger1Click : function(){
        if(this.hasSearch){
            this.store.baseParams[this.paramName] = '';
			this.store.removeAll();
			this.el.dom.value = '';
            this.triggers[0].hide();
            this.hasSearch = false;
			this.focus();
        }
    },

    onTrigger2Click : function(){
        var v = this.getRawValue();
        if(v.length < 1){
            this.onTrigger1Click();
            return;
        }
		if(v.length < 2){
			Ext.Msg.alert('Invalid Search', 'You must enter a minimum of 2 characters to search the API');
			return;
		}
		this.store.baseParams[this.paramName] = v;
        var o = {start: 0};
	this.store.baseParams.qt = Ext.getCmp('search-type').getValue();
        this.store.reload({params:o});
        this.hasSearch = true;
        this.triggers[0].show();
		this.focus();
    }
});


/**
 * Makes a ComboBox more closely mimic an HTML SELECT.  Supports clicking and dragging
 * through the list, with item selection occurring when the mouse button is released.
 * When used will automatically set {@link #editable} to false and call {@link Ext.Element#unselectable}
 * on inner elements.  Re-enabling editable after calling this will NOT work.
 *
 * @author Corey Gilmore
 * http://extjs.com/forum/showthread.php?t=6392
 *
 * @history 2007-07-08 jvs
 * Slight mods for Ext 2.0
 */
Ext.ux.SelectBox = function(config){
	this.searchResetDelay = 1000;
	config = config || {};
	config = Ext.apply(config || {}, {
		editable: false,
		forceSelection: true,
		rowHeight: false,
		lastSearchTerm: false,
        triggerAction: 'all',
        mode: 'local'
    });

	Ext.ux.SelectBox.superclass.constructor.apply(this, arguments);

	this.lastSelectedIndex = this.selectedIndex || 0;
};

Ext.extend(Ext.ux.SelectBox, Ext.form.ComboBox, {
    lazyInit: false,
	initEvents : function(){
		Ext.ux.SelectBox.superclass.initEvents.apply(this, arguments);
		// you need to use keypress to capture upper/lower case and shift+key, but it doesn't work in IE
		this.el.on('keydown', this.keySearch, this, true);
		this.cshTask = new Ext.util.DelayedTask(this.clearSearchHistory, this);
	},

	keySearch : function(e, target, options) {
		var raw = e.getKey();
		var key = String.fromCharCode(raw);
		var startIndex = 0;

		if( !this.store.getCount() ) {
			return;
		}

		switch(raw) {
			case Ext.EventObject.HOME:
				e.stopEvent();
				this.selectFirst();
				return;

			case Ext.EventObject.END:
				e.stopEvent();
				this.selectLast();
				return;

			case Ext.EventObject.PAGEDOWN:
				this.selectNextPage();
				e.stopEvent();
				return;

			case Ext.EventObject.PAGEUP:
				this.selectPrevPage();
				e.stopEvent();
				return;
		}

		// skip special keys other than the shift key
		if( (e.hasModifier() && !e.shiftKey) || e.isNavKeyPress() || e.isSpecialKey() ) {
			return;
		}
		if( this.lastSearchTerm == key ) {
			startIndex = this.lastSelectedIndex;
		}
		this.search(this.displayField, key, startIndex);
		this.cshTask.delay(this.searchResetDelay);
	},

	onRender : function(ct, position) {
		this.store.on('load', this.calcRowsPerPage, this);
		Ext.ux.SelectBox.superclass.onRender.apply(this, arguments);
		if( this.mode == 'local' ) {
			this.calcRowsPerPage();
		}
	},

	onSelect : function(record, index, skipCollapse){
		if(this.fireEvent('beforeselect', this, record, index) !== false){
			this.setValue(record.data[this.valueField || this.displayField]);
			if( !skipCollapse ) {
				this.collapse();
			}
			this.lastSelectedIndex = index + 1;
			this.fireEvent('select', this, record, index);
		}
	},

	render : function(ct) {
		Ext.ux.SelectBox.superclass.render.apply(this, arguments);
		if( Ext.isSafari ) {
			this.el.swallowEvent('mousedown', true);
		}
		this.el.unselectable();
		this.innerList.unselectable();
		this.trigger.unselectable();
		this.innerList.on('mouseup', function(e, target, options) {
			if( target.id && target.id == this.innerList.id ) {
				return;
			}
			this.onViewClick();
		}, this);

		this.innerList.on('mouseover', function(e, target, options) {
			if( target.id && target.id == this.innerList.id ) {
				return;
			}
			this.lastSelectedIndex = this.view.getSelectedIndexes()[0] + 1;
			this.cshTask.delay(this.searchResetDelay);
		}, this);

		this.trigger.un('click', this.onTriggerClick, this);
		this.trigger.on('mousedown', function(e, target, options) {
			e.preventDefault();
			this.onTriggerClick();
		}, this);

		this.on('collapse', function(e, target, options) {
			Ext.getDoc().un('mouseup', this.collapseIf, this);
		}, this, true);

		this.on('expand', function(e, target, options) {
			Ext.getDoc().on('mouseup', this.collapseIf, this);
		}, this, true);
	},

	clearSearchHistory : function() {
		this.lastSelectedIndex = 0;
		this.lastSearchTerm = false;
	},

	selectFirst : function() {
		this.focusAndSelect(this.store.data.first());
	},

	selectLast : function() {
		this.focusAndSelect(this.store.data.last());
	},

	selectPrevPage : function() {
		if( !this.rowHeight ) {
			return;
		}
		var index = Math.max(this.selectedIndex-this.rowsPerPage, 0);
		this.focusAndSelect(this.store.getAt(index));
	},

	selectNextPage : function() {
		if( !this.rowHeight ) {
			return;
		}
		var index = Math.min(this.selectedIndex+this.rowsPerPage, this.store.getCount() - 1);
		this.focusAndSelect(this.store.getAt(index));
	},

	search : function(field, value, startIndex) {
		field = field || this.displayField;
		this.lastSearchTerm = value;
		var index = this.store.find.apply(this.store, arguments);
		if( index !== -1 ) {
			this.focusAndSelect(index);
		}
	},

	focusAndSelect : function(record) {
		var index = typeof record === 'number' ? record : this.store.indexOf(record);
		this.select(index, this.isExpanded());
		this.onSelect(this.store.getAt(record), index, this.isExpanded());
	},

	calcRowsPerPage : function() {
		if( this.store.getCount() ) {
			this.rowHeight = Ext.fly(this.view.getNode(0)).getHeight();
			this.rowsPerPage = this.maxHeight / this.rowHeight;
		} else {
			this.rowHeight = false;
		}
	}

});

Ext.Ajax.on('requestcomplete', function(ajax, xhr, o){
    if(typeof urchinTracker == 'function' && o && o.url){
        urchinTracker(o.url);
    }
});
