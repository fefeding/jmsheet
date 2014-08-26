/******************
 *
 * 类似于excel的WEB在线版
 * creator		fefeding
 * date			2014-01-21
 *
 */



/**
 *
 * 在线表格中文包
 *
 */
var jmSheetLan = {
	menu: {
		'Toggle freeze columns to here': '从当前列开始固定',
		'Insert column after': '在当前列后插入',
		'Insert column before': '在当前列前插入',
		'Add column to end': '添加列到末尾',
		'Delete this column': '删除列',
		'Hide column': '隐藏列',
		'Toggle freeze rows to here': '从当前行开始固定',
		'Insert row after': '在当前行下面插入',
		'Insert row before': '在当前行上面插入',
		'Add row to end': '添加行到末尾',
		'Delete this row': '删除行',
		'Hide row': '隐藏行'
	}
};


/**
 *
 * 在线表格
 * 基于jQuery.sheet开源组件
 */
var jmSheet = (function() {

	//获取当前组件的根路径
	$.sheet.root = getSheetRoot();
	//增加图表的依赖
	$.sheet.dependencies['highcharts'] = {script:'plugins/highcharts/highcharts.js'};
	//$.sheet.dependencies['highcharts-more'] = {script:'plugins/highcharts/highcharts-more.js'};
	//预加载组件依赖
	$.sheet.preLoad($.sheet.root, {skip: null});

	/**
	 *
	 * 获取当前组件的根url
	 *
	 */
	function getSheetRoot() {
		var jstag = $("script[src*='/jmsheet.js']");
		if(jstag.length > 0) {
			var src = jstag.attr('src');
			return src.substring(0,src.indexOf('/jmsheet.js') + 1);
		}
	}

	/**
	 *
	 * 在线表格
	 * 依赖开源组件jQuery.sheet完善的在线表格功能
	 */
	function jmSheet(option) {
		Globalize.culture('zh-CN');
		this.container = option.container;	

		this.columnChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		
		var self = this;
		if(option.toolbar) {
			this.toolbar = new jmToolbar(this,this.container);
		}
		this.sheetContainer = $('<div class="jQuerySheet"></div>').appendTo(this.container);	
		
		if(option.html) {
			if(typeof option.html == 'function') this.sheetContainer.html(option.html());
			else this.sheetContainer.html(option.html);
		}
		
/*
        this.jqSheet.mousewheel(function() {
        	console.log(arguments);
        });*/

        //单元格选择事件回调集合
        this.selectCallbacks = {
        	handlers: [],
        	bind: function(handler) {
        		this.handlers.push(handler);
        	},
        	unbind: function(handler) {
        		for(var i=this.handlers.length - 1;i>=0;i--) {
        			if(handler == this.handlers[i]) this.handlers.splice(i,1);
        		}
        	},
        	raise: function() {
        		for(var i=0;i<this.handlers.length;i++) {
        			this.handlers[i].apply(self,arguments);
        		}
        	}
        };

        this.reset();
	}

	/**
	 *
	 * 重新绑定表格
	 */
	jmSheet.prototype.reset = function() {
		this.jqSheet = this.sheetContainer.sheet();
        this.sheet = this.jqSheet.getSheet(); 
        this.bindEvents();//初始化事件
	}

	/**
	 *
	 * 加载数据
	 */
	jmSheet.prototype.loadData = function(data) {
		
        if(data && data.length > 0) { 
        	var tbs = [];       	
        	for(var i=0;i<data.length;i++) {
        		var d = data[i];
        		
        		tbs.push('<table class="jSheet ui-widget-content" border="1px" cellpadding="0" cellspacing="0" ');
        		var title = d.title || ('sheet' + i);
        		tbs.push('title="');
        		tbs.push(title);
        		tbs.push('"><tbody>');
        		if(d.columns) {

        		}

        	}
        }        
	};

	/**
	 *
	 * 添加列
	 */
	jmSheet.prototype.addColumn = function(row,colCount,tableIndex,isBefore,skipFormulaReParse) {
		var oldi = this.sheet.i;
		this.sheet.i = typeof tableIndex == 'undefined' || tableIndex == null?oldi:tableIndex;
		this.sheet.controlFactory.addColumnMulti(row,colCount,isBefore,skipFormulaReParse);
		this.sheet.i = oldi;
	}

	/**
	 *
	 * 添加行
	 */
	jmSheet.prototype.addRow = function(row,rowCount,tableIndex,isBefore,skipFormulaReParse) {
		var oldi = this.sheet.i;
		this.sheet.i = typeof tableIndex == 'undefined' || tableIndex == null?oldi:tableIndex;
		this.sheet.controlFactory.addRowMulti(row,rowCount,isBefore,skipFormulaReParse);
		this.sheet.i = oldi;
	}	

	/**
	 *
	 * 修改单元格的值
	 */
	jmSheet.prototype.updateCellValue = function(value,row,col,tableIndex) {
		this.jqSheet.setCellValue(value,row,col,tableIndex);
	}

	/**
	 *
	 * 设置某个单元格的函数
	 */
	jmSheet.prototype.setCellFormula = function(formula,row,col,tableIndex) {
		this.jqSheet.setCellFormula.apply(this.jqSheet,arguments);
	}

	/**
	 *
	 * 修改单元格样式
	 */
	jmSheet.prototype.cellStyleToggle = function(setClass, removeClass,row,col,tableIndex) {
		var cell = this.sheet.getCell(row,col,tableIndex);
		this.sheet.cellStyleToggle(setClass,removeClass,[cell.td[0]]);
	}

	/**
	 *
	 * 修改单元格样式
	 */
	jmSheet.prototype.cellChangeStyle = function(styleName, styleValue,row,col,tableIndex) {
		var cell = this.sheet.getCell(row,col,tableIndex);
		this.sheet.cellChangeStyle(styleName,styleValue,[cell]);
	}

	/**
	 *
	 * 转为json格式
	 */
	jmSheet.prototype.toJSON = function() {
		var data = $.sheet.dts.fromTables.json(this.sheet,true);
		if(this.charts) {
			for(var i=0;i<this.charts.length;i++) {
				var chart = this.charts[i];
				var sheet = data[chart.tableIndex];
				if(sheet) {
					if(!sheet['charts']) sheet['charts']=[];
					sheet['charts'].push(chart.toJSON());
				}
			}
		}
		return data;
	};

	/**
	 *
	 * 转为json格式
	 */
	jmSheet.prototype.fromJSON = function(json) {		
		var tables = $.sheet.dts.toTables.json(json);
		this.sheet.openSheet(tables);

		//this.bindChartMoveEvent(this.sheetContainer.find('.jSChart'));
	};

	/**
	 *
	 * 清空表格信息
	 */
	jmSheet.prototype.clear = function() {
		//this.container.empty();
		//this.jqSheet = this.sheetContainer.sheet();
        //this.sheet = this.jqSheet.getSheet(); 
	}

	/**
	 *
	 * 设置表格标题，如果不指定表格则为当前表格
	 */
	jmSheet.prototype.title = function(title,index) {
		if(typeof index != 'undefined') {
			this.sheet.setActiveSheet(index);
		}
		this.sheet.setDirty(true);
        this.sheet.obj.table().attr({'title': title});
        this.sheet.obj.tab().html(title);	
	}

	/**
	 *
	 * 重置表格，指定html
	 */
	jmSheet.prototype.html = function(html) {
		this.sheet.kill();
		this.jqSheet = this.sheetContainer.html(html);
        this.reset();
	}

	/**
	 *
	 * 获取当前表格对象
	 */
	jmSheet.prototype.getActiveTable = function(json) {
		var tb = this.sheet.obj.enclosure();
		return tb;
	};

	/**
	 *
	 * 获取当前激活的表索引，，从0开始
	 */
	jmSheet.prototype.getActiveTableIndex = function() {
		var tb = this.getActiveTable();
		if(tb.length > 0) {
			var tbid = tb[0].table.id;
			var idindex = tbid.lastIndexOf('_');
			return Number(tbid.substring(idindex + 1));
		}
	}

	/**
	 *
	 * 生成图表
	 *
	 */
	jmSheet.prototype.createChart = function(type,opt) {
		var curtb = this.getActiveTable();
		opt=$.extend({table:curtb,chartType:type},opt);
		if(!this.charts) this.charts = [];
		var self = this;
		var chart = new jmSheetChart(this,opt);
		chart.setting(function(b){
			if(b)self.charts.push(this);
		});//弹出设置
		return chart;		
	}

	/**
	 *
	 * 直接展示图表
	 */
	jmSheet.prototype.renderChart = function(opt) {
		var tb = this.sheet.obj.enclosures()[opt.tableIndex] || this.getActiveTable();
		opt=$.extend({table:$(tb)},opt);
		var chart = new jmSheetChart(this,opt);
		if(!this.charts) this.charts = [];
		this.charts.push(chart);
		chart.render();
		return;
	}

	/**
	 *
	 * 绑定事件响应
	 */
	jmSheet.prototype.bind = function(name,handler) {
		return this.sheetContainer.bind(name,handler);
	}

	/**
	 *
	 * 绑定所有图表的事件
	 */
	jmSheet.prototype.bindEvents = function() {		
		var self = this;
		this.bind('sheetCalculation',function(o1,o2,cell) {
			if(cell.which == 'cell') {
				$(self.charts).each(function(i,chart){
					chart.cellChange(cell);
				});
			}
		});
		//绑定选择完成事件
		this.bind('cellSelectChanged',function(o1,o2,cell) {
			if(cell.which == 'cell') {
				if(self.selectCallbacks) {
					self.selectCallbacks.raise(cell,'cellSelectChanged');
				}
			}
		});
		//绑定框选事件
		this.bind('cellSelecting',function(o1,o2,cell) {
			if(cell.which == 'cell') {
				if(self.selectCallbacks) {
					self.selectCallbacks.raise(cell,'cellSelecting');
				}
			}
		});
	}

	/**
	 *
	 * 绑定图表事件
	 */
	jmSheet.prototype.bindChartMoveEvent = function(charts) {
		charts.each(function(i,chart) {
			chart.onmousedown = function(evt) {
				evt = evt || event;
				this.mousetop = evt.clientY || evt.y;
				this.mouseleft = evt.clientX || evt.x;
				this.oldposition = $(this).offset();
				this.moved = true;
				return false;
			};
			chart.onmousemove = function(evt) {
				if(this.moved) {
					evt = evt || event;
					var mx = evt.clientX || evt.x,my = evt.clientY || evt.y;
					var ox = mx - this.mouseleft,oy=my-this.mousetop;
					var pos = {top: this.oldposition.top + oy,
						left: this.oldposition.left + ox};
					$(this).css(pos);
					this.oldposition = pos;
				}						
			}
		});		
	}

	/**
	 *
	 * 根据索引获取表格表标识
	 */
	jmSheet.prototype.getColumnChar = function(index) {
		index--;
		if(this.columnChars.length > index) return this.columnChars[index];
		else {
			var cr = '';			
			var p = index % this.columnChars.length;
			index = Math.floor(index / this.columnChars.length);				
			cr = (this.getColumnChar(index)||'') + this.columnChars[p];	
			return cr;					
		}
	}

	/**
	 *
	 * 根据列标识获取索引
	 */
	jmSheet.prototype.getColumnIndex = function(colChar,step) {		
		if(!colChar) return 0;
		step = step || 0;
		if(colChar.length == 1) return this.columnChars.indexOf(colChar) + 1;
		else {
			var c = colChar.substr(0,1);
			colChar = colChar.substring(1);

			step ++;
			var index = this.getColumnIndex(c) * this.columnChars.length * step;			
			
			index += this.getColumnIndex(colChar,step);	
			return index;
		}
	}

	/**
	 *
	 * 重新指定表格大小
	 */
	jmSheet.prototype.resize = function(s) {
		if(s) {
			if(s.width) this.sheetContainer.width(s.width);
			if(s.height) {
				var h = s.height;// - this.sheet.obj.tabContainer().outerHeight();
				if(this.toolbar) {
					h -= this.toolbar.size().height;
				}
				this.sheetContainer.height(h);
			}
			this.sheet.sheetSyncSize();
		}
	}

	/**
	 *
	 * 表格的工具栏
	 */
	function jmToolbar(sheetInstance,container,callback) {
		var toolbarfile = 'toolbar.html';
		this.container = $('<div class="jmsheet-toolbar"></div>').appendTo(container);
		this.sheetInstance = sheetInstance;
		var self = this;

		/**
		 *
		 * 获取工具栏的大小
		 */
		this.size = function() {
			return {width: this.container.width(),height: this.container.height()};
		}

		/**
		 *
		 * 初始化工具栏事件
		 */
		this.init = function() {
			this.container.find('a,select').each(function() {
                    this.sheet = self.sheetInstance;
                });
                var cut = this.container.find('a[data-js=cut]');
                var copy = this.container.find('a[data-js=copy]');

                var clip = new ZeroClipboard(copy.add(cut), {
                        moviePath: $.sheet.root + "plugins/ZeroClipboard.swf"
                    });

                clip.on('mousedown', function(client) {
                    clip.setText(self.sheetInstance.sheet.tdsToTsv());
                    $(this).mousedown();
                });

                cut.mousedown(function() {
                    self.sheetInstance.sheet.tdsToTsv(null, true);
                });

                this.container.find('input[data-js=fillcolor]').colorPicker().change(function(){
                    self.sheetInstance.sheet.cellChangeStyle('background-color', $(this).val());
                }).find('+div').toggleClass('imgbaritem item-fillcolor',true);

                this.container.find('input[data-js=fontcolor]').colorPicker().change(function(){
                    self.sheetInstance.sheet.cellChangeStyle('color', $(this).val());
                }).find('+div').toggleClass('imgbaritem item-fontcolor',true);
		}

		$.get($.sheet.root + toolbarfile,function(html) {
			self.container.html(html);
			self.init();//初始化
			if(callback) callback();
		});
	}

	return jmSheet;
})();

jmSheet.untils = {
	/**
	* 转为日期格式
	*
	* @method parseDate
	* @param {string} s 时间字符串   
	* @return {date} 日期
	*/
	parseDate:function(s) {
	    if (typeof s == 'object') {
	        return s;
	    }

	    //如果是"HH:mm:ss"格式 或者'HH:mm'
	    if (new RegExp('^([0-9]{2,2}\:)').test(s)) {
	        var tempDate = new Date();
	        var dateString = 'yyyy-MM-dd';
	        dateString = dateString.replace('yyyy', tempDate.getFullYear().toString())
	            .replace('MM', (tempDate.getMonth() < 9 ? '0' : '') + (tempDate.getMonth() + 1).toString())
	            .replace('dd', (tempDate.getDate() < 10 ? '0' : '') + tempDate.getDate().toString());

	        s = dateString + " " + s;
	    }

	    var ar = (s + ",0,0,0").match(/\d+/g);
	    return ar[5] ? (new Date(ar[0], ar[1] - 1, ar[2], ar[3], ar[4], ar[5])) : (new Date(s));
	},
	/**
	* 格式化时间
	*/
	formatDate:function(date, format) {
	    date = date || new Date();
	    format = format || 'yyyy-MM-dd HH:mm:ss';
	    var result = format.replace('yyyy', date.getFullYear().toString())
	    .replace('MM', (date.getMonth()< 9?'0':'') + (date.getMonth() + 1).toString())
	    .replace('dd', (date.getDate()< 10?'0':'')+date.getDate().toString())
	    .replace('HH', (date.getHours() < 10 ? '0' : '') + date.getHours().toString())
	    .replace('mm', (date.getMinutes() < 10 ? '0' : '') + date.getMinutes().toString())
	    .replace('ss', (date.getSeconds() < 10 ? '0' : '') + date.getSeconds().toString());

	    return result;
	},
	/**
     * 获取元素的坐标偏移量
     * @method getOffset
     * @param {Object} target 元素对象     
     **/
    getOffset: function (target) {
        target = $(target)[0];
        var x = y = 0;
        do {
            x += target.offsetLeft;
            y += target.offsetTop;
        } while (target = target.offsetParent);
        return {
            'left': x,
            'top': y
        };
    },

    /**
     * 获取鼠标坐标
     * @method getMouseLocation
     * @param {Object} ev 事件对象
     * @param {Object} target 可选,事件发生对象    
     **/
    getMouseLocation: function (ev, target) {
        if (!target) target = $(document.body);
        return {
            x: ev.clientX - target.offset().left,
            y: ev.clientY - target.offset().top
        };
    },
    /**
	* 对象移动插件
	* @class $jm.objMove
	* @for $jm.win
	*   
	**/
	setMove: function (obj) {

		//拖放对象
		function moveHandler(obj) {
			var target = obj,
				flag = false,
				currentLocation,
				mouseLastLocation;

			/**
		     * 鼠标按下,开始拖放事件	    
		     **/
		    function mdhandler(evt) {	
		    	evt = evt || window.event;	
		    	if(evt.handle === false) return;	            
		        if (evt.button == 0 || evt.button == 1) {
		            //显示遮板
		            //_win.__showModelDiv(true);
		            
		            //标记
		            flag = true;


		            //var p1 = jmSheet.untils.getOffset(target);
		            //var p3 = target.position();
		            //var p2 = target.offset();
		            //拖拽对象位置初始化
		            currentLocation = {
		                x: target[0].offsetLeft, //.offset()
		                y: target[0].offsetTop
		            };

		            //鼠标最后位置初始化
		            mouseLastLocation = jmSheet.untils.getMouseLocation(evt);

		            //解决鼠标离开时事件丢失问题
		            //注册事件(鼠标移动)
		            $(document).unbind("mousemove", mmhandler);
		            $(document).bind("mousemove", mmhandler);
		            //$(document).bind("touchmove", _mmHandler);
		            //注册事件(鼠标松开)
		            $(document).unbind("mouseup", muhandler);
		            $(document).bind("mouseup", muhandler);

		            //取消事件的默认动作
		            /*if (evt.preventDefault)
		                evt.preventDefault();
		            else
		                evt.returnValue = false;*/
		            //evt.stopPropagation();
		            evt.handle = true;//标记为已响应
		            //return false;
		        }
		    };

		    /**
		     * 鼠标移动,开始拖放事件	    
		     **/
		    function mmhandler(evt) {
		        if (flag) {
		            evt = evt || window.event;
		            //当前鼠标的x,y座标
		            var mouseCurrentLocation = jmSheet.untils.getMouseLocation(evt);

		            //拖拽对象座标更新(变量)
		            currentLocation.x = currentLocation.x + (mouseCurrentLocation.x - mouseLastLocation.x);
		            currentLocation.y = currentLocation.y + (mouseCurrentLocation.y - mouseLastLocation.y);

		            //将鼠标最后位置赋值为当前位置
		            mouseLastLocation = mouseCurrentLocation;

		            //如果锁定左边界，则X坐标不可小于0
		            //if (currentLocation.x < 1) currentLocation.x = 1;
		            //锁定左边界
		            /*if (_win.params.bounds.right) {
		                //最大X坐标为容器宽度减去窗口宽度
		                var maxright;
		                if ($jm.element.type(_win.parent) == 'body' ||
		                $jm.element.type(_win.parent) == 'window' ||
		                $jm.element.type(_win.parent) == 'document') {
		                    var winsize = $jm.winSize(); //获取浏览器窗口大小，取最大值
		                    maxright = winsize.w - _win.width() - 10;
		                }
		                else {
		                    maxright = _win.parent.width() - _win.width() - 10;
		                }
		                if (currentLocation.x > maxright) currentLocation.x = maxright;
		            }*/
		            //如果锁定顶部边界，则不可越边容器顶部
		            /*if (_win.params.bounds.top && currentLocation.y < 1) currentLocation.y = 1;
		            //锁定底部边界
		            //不让窗口越过底部边界
		            if (_win.params.bounds.bottom) {
		                //最大y坐标为容器高度减去窗口高度
		                var maxbottom;
		                if ($jm.element.type(_win.parent) == 'body' ||
		                $jm.element.type(_win.parent) == 'window' || 
		                $jm.element.type(_win.parent) == 'document') {
		                    var winsize = $jm.winSize(); //获取浏览器窗口大小，取最大值
		                    maxbottom = winsize.h - _win.height() - 10;
		                }
		                else {
		                    maxbottom = _win.parent.height() - _win.height() - 10;
		                }
		                if (currentLocation.y > maxbottom) currentLocation.y = maxbottom;
		            }
*/
		            //拖拽对象座标更新(位置)//并保证不出界
		            //if (_objCurrentLocation.x > 1)
		            target.css("left", currentLocation.x + "px");
		            //if (_objCurrentLocation.y > 1)
		            target.css("top", currentLocation.y + "px");
		            evt.stopPropagation();
		            return false;
		        }
		    };

		    /**
		     * 鼠标松开
		     **/
		    function muhandler(evt) {
		        if (flag) {
		            evt = evt || window.event;
		            //注销鼠标事件
		            clearhandler();
		            //标记
		            flag = false;
		        }
		    };

		    /**
		     * 注销鼠标事件(mousemove mouseup)
		     **/
		    function clearhandler() {
		        if (target) {
		            $(document).unbind("mousemove", mmhandler);
		            //$(document).unbind("touchmove");
		            $(document).unbind("mouseup", muhandler);

		            //隐藏遮板
		            //target.__showModelDiv(false);
		        }
		    };
		    //外挂
		    this.clear = clearhandler;

	        //注册事件(鼠标按下)
	        target.unbind("mousedown", mdhandler);
	        target.bind("mousedown", mdhandler);		    
		}
		return new moveHandler(obj);
	},
	setResize: function(obj,callback) {
		/**
		 * 窗体大小修改类		
		 **/
		function resizeHandler(obj,callback) {
		    var target = obj; //对象   
		    var flag = 0; //拖拉状态0=否，1=右;2=下;3表示右下
		    var curSize; //当前大小
		    var lastLocation; //最后位置
		    var resizeareawidth = 6; //可响应拉的宽度
		    var self = this;
		    //鼠标按下
		    var mdHandler = function (evt) {
		        if (evt.handle !== false && target) {
		            evt = evt || window.event;
		            //拖拽对象位置初始化
		            curSize = {
		                w: target.width(),
		                h: target.height()
		            };

		            //鼠标最后位置初始化
		            lastLocation = jmSheet.untils.getMouseLocation(evt);
		            //标记
		            var tmpflag = 0;
		            if (target.offset().top + curSize.h < lastLocation.y + resizeareawidth) flag = 2; //表示向下拉
		            //var scrolw = target.winBody.get(0).offsetWidth - target.winBody.get(0).scrollWidth;
		            //if (target.win.offset().left + target.win.width() > _lastLocation.x && target.win.offset().left + target.win.width() - _resizeareawidth < _lastLocation.x) tmpflag = 1;
		            if (target.offset().left + curSize.w < lastLocation.x + resizeareawidth) tmpflag = 1; //向右拉

		            if (flag == 2 && tmpflag == 1) {
		                flag = 3; //表示为右下拉
		                $(this).css('cursor', 'se-resize');
		            }
		            else if (tmpflag == 1) {
		                flag = tmpflag;
		                $(this).css('cursor', 'e-resize');
		            }
		            else if (flag == 2) {
		                $(this).css('cursor', 's-resize');
		            }
		            else {
		                $(this).css('cursor', 'default');
		                return;
		            }

		            //显示遮板
		            //_win.__showModelDiv(true);

		            //注册事件(鼠标移动)
		            $(document).unbind("mousemove", mmHandler);
		            $(document).bind("mousemove", mmHandler);
		            //$(document).bind("touchmove", mmHandler);
		            //_win.parent.bind("mousemove", mmHandler);
		            //注册事件(鼠标松开)
		            $(document).unbind("mouseup", muHandler);
		            $(document).bind("mouseup", muHandler);
		            //_win.parent.bind("mouseup", muHandler);

		            //取消事件的默认动作
		            /*if (evt.preventDefault)
		                evt.preventDefault();
		            else
		                evt.returnValue = false;*/
		            evt.stopPropagation();
		            evt.handle = false;
		            if(callback) callback('resizeStart');
		            return false;
		        }
		    };

		    //鼠标移动
		    var mmHandler = function (evt) {
		        if (flag != 0) {
		            evt = evt || window.event;
		            //当前鼠标的x,y座标
		            var mouseCurrentLocation = jmSheet.untils.getMouseLocation(evt);
		            //拖拽对象座标更新(变量)
		            curSize.w = curSize.w + (mouseCurrentLocation.x - lastLocation.x);
		            curSize.h = curSize.h + (mouseCurrentLocation.y - lastLocation.y);

		            //将鼠标最后位置赋值为当前位置
		            lastLocation = mouseCurrentLocation;

		            curSize.w = curSize.w > 200?curSize.w:200;
		            curSize.h = curSize.h > 150?curSize.h:150;
		            //更新对象大小
		            if (flag == 1 || flag == 3) target.width(curSize.w);
		            if (flag == 2 || flag == 3) target.height(curSize.h);

		            //取消事件的默认动作
		            if (evt.preventDefault)
		                evt.preventDefault();
		            else
		                evt.returnValue = false;
		            evt.stopPropagation();
		            return false;
		        }
		    };

		    //鼠标松开
		    var muHandler = function (evt) {
		        if (flag != 0) {
		            evt = evt || window.event;
		            //注销鼠标事件(mousemove mouseup)
		            self.clear();
		            //标记
		            flag = 0;
		            //隐藏遮板
		            //_win.__showModelDiv(false);
		            evt.stopPropagation();
		            if(callback) callback('resizeEnd');
		            return false;
		        }
		    };

		    //注销鼠标事件(mousemove mouseup)
		    this.clear = function() {
		        if (target) {
		            target.css('cursor', 'default');
		            $(document).unbind("mousemove", mmHandler);
		            //$(document).unbind("touchmove");
		            $(document).unbind("mouseup", muHandler);
		        }
		    };

		    /**
		    * 注册大小改变对象(参数为$jm.win对象)
		    * @method Register   
		    * @for $jm.objResize
		    * @param {Object} win $jm.win对象
		    **/
		    this.init = function() {		        
		        //注册事件(鼠标按下)
		        target.unbind("mousedown", mdHandler);
		        target.bind("mousedown", mdHandler);
		        return this;
		    }
		};
		return new resizeHandler(obj,callback).init();
	},
	/**
	 *
	 * 弹出窗口层
	 */
    window:function(content,opt) {
    	if(content.attr('data-sheetwindow')) {
    		return this.windows[content.attr('data-sheetwindow')];
    	}
    	if(!this.windowindex) this.windowindex = 0;
    	if(!this.windows) this.windows={};
    	this.windowindex++;
    	var win = this.windows[this.windowindex] = {
    		option: opt,
    		parent: opt.parent || document.body,
    		container : $('<div class="jmSheet-window" tabindex="0"></div>'),
    		content: content,
    		show: function() {
    			this.container.appendTo(this.parent).show();
    			this.active();
    			return this;
    		},
    		hide: function() {
    			this.container.hide();
    			return this;
    		},
    		close: function() {
    			this.container.remove();
    			this.moveHandler.clear();
    			this.resizeHandler.clear();
    			return this;
    		},
    		resize: function(w,h) {
    			if(w) {
    				this.content.width(w);  
    			}
    			if(h) this.content.height(h);
    			//如果指定了大小改变回调，则调用大小改变
    			if(this.option.resize) {
    				this.option.resize();
    			}
    			return this;
    		},
    		active: function() {
    			$(this.container.parent()).find('div.jmSheet-window').css('z-index',50);
    			this.container.css('z-index',60);//当前选中的窗口移至顶层
    		}
    	}; 

    	//设置改变大小对象
    	win.resizeHandler = this.setResize(win.container,function(m) {
    		if(m=='resizeEnd') {
    			//大小改变后显示内容
    			win.content.show();    			
    			win.resize(win.container.width(),win.container.height());
    		}
    		else if(m=='resizeStart') {
    			//开始改变大小时隐藏内容
    			win.content.hide();
    		}
    	});
    	//设置移动对象
    	win.moveHandler = this.setMove(win.container);
    	
    	opt.position = opt.position || {left:0,top:0}; 
    	
    	win.container.bind('mousedown',function() {
    		win.active();
    	});
    	
    	win.container.css(opt.position);

    	//如果绑定了健盘按下事件
    	if(win.option.keydown) {
    		win.container.bind('keydown',win.option.keydown);
    	}
    	
    	win.resize(opt.width,opt.height);    		
    	content.attr('data-sheetwindow',this.windowindex).appendTo(win.container);    	
    	return win;
    }
};

/**
 *
 * 在线表格图表
 */
function jmSheetChart(sheetInstance,option) {
	this.sheetInstance = sheetInstance;
	this.container = option.container || $('<div class="jmSheet-chart-parent" tabindex="0"></div>');

	this.option = option || {};

	this.table = this.option.table;
	this.tableIndex = typeof option.tableIndex == 'undefined'?this.sheetInstance.getActiveTableIndex():option.tableIndex;
	this.charttype = this.option.type || this.option.chartType || 'line';
	this.title = this.option.title || '';
	this.xTitle = this.option.xTitle || '';
	this.yTitle = this.option.yTitle || '';
	this.xformat = this.option.xFormat || '';
	this.sheetName = this.option.sheetName || '';;//SHEET' + (this.tableIndex + 1);
	
	//var celldep = this.sheetInstance.sheet.cellHandler.createDependency(this.tableIndex,this.sheetInstance.sheet.highlightedLast.start);

	this.option.cellStart = this.option.cellStart || (this.sheetInstance.getColumnChar(this.sheetInstance.sheet.highlightedLast.start.col) + 
								this.sheetInstance.sheet.highlightedLast.start.row);
	this.option.cellEnd = this.option.cellEnd || (this.sheetInstance.getColumnChar(this.sheetInstance.sheet.highlightedLast.end.col) + 
								this.sheetInstance.sheet.highlightedLast.end.row);

	this.parent = this.table.find('.jSScroll>div');	

	//配置图表信息
	this.setting = function(callback) {
		var dataarea = (this.sheetName?this.sheetName + '!':'') + this.option.cellStart + ':' + this.option.cellEnd;
		var settingcontent = '<div><span style="position:relative;top:-6px;">数据范围：</span><div class="input-container">\
			<input type="text" class="jsDataArea" value=""/>\
			<img src="'+$.sheet.root+'img/cellselect.png" class="jsCellSelect"/></div></div>\
			<div><span>标题：</span><input type="text" class="jsTitle" value=""/></div>';
		//如果不是饼图，则出现X轴和Y轴配置
		if(this.charttype !== 'pie') {
			settingcontent += '<div><span>X轴格式化：</span><input type="text" class="jsXFormat" value="yyyy-MM-dd"/></div>\
								<div><span>X轴名称：</span><input type="text" class="jsXTitle" value="yyyy-MM-dd"/></div>\
								<div><span>Y轴名称：</span><input type="text" class="jsYTitle" value="yyyy-MM-dd"/></div>';
		}
		var container = $('<div title="图表配置" class="jmsheet-chartconfig"></div>').html(settingcontent);
		
		container.find('input.jsDataArea').val(dataarea);
		container.find('input.jsTitle').val(this.title || '');
		container.find('input.jsXTitle').val(this.xTitle || '');
		container.find('input.jsYTitle').val(this.yTitle || '');

		var self = this;

		//阻 止所有输入框事件健盘事件向表格冒
		//不然会出现操作问题。总是回到表格单元格中。
		container.find('input').bind('keydown',function(e) {
			e = e || window.event;
			e.stopPropagation();
		});
		//绑定数据库选择事件
		container.find('.input-container>.jsCellSelect').bind('click',function(){
			//标识为正在选择中，以免显示图表框
			container.dialog('option','selecting','true');
			//开始选择单元格，则隐藏配置框 
			container.dialog('close');
			var sourcecontainer = $('<div title="数据源" class="jmsheet-chartconfig"><div class="input-container">\
			<input type="text" class="jsDataArea" value=""/>\
			<img src="'+$.sheet.root+'img/cellselect.png" class="jsCellSelect"/></div></div>').dialog({
				width: 280,
				height: 60,
				dialogClass:'dialog-datasource',
				close: function() {					
					//解绑选择事件
					self.sheetInstance.selectCallbacks.unbind(cellselectcallback);
					container.dialog('open');
					//标识成不是正在选择中
					container.dialog('option','selecting','false');
				}
			});
			sourcecontainer.find('.input-container .jsCellSelect').click(function() {
				//写回到源配置框中
				container.find('.jsDataArea').val(sourcecontainer.find('input.jsDataArea').val());
				sourcecontainer.dialog('close');
			})
			sourcecontainer.find('.jsDataArea').val(container.find('input.jsDataArea').val());
			//绑定单元格选择回调
			var cellselectcallback = function(cell) {
				var cellStart = self.sheetInstance.getColumnChar(self.sheetInstance.sheet.highlightedLast.start.col) + 
								self.sheetInstance.sheet.highlightedLast.start.row;
				var cellEnd = self.sheetInstance.getColumnChar(self.sheetInstance.sheet.highlightedLast.end.col) + 
								self.sheetInstance.sheet.highlightedLast.end.row;
				var curtbindex = self.sheetInstance.getActiveTableIndex();
				var sheetname = '';
				if(curtbindex != self.tableIndex) {
					sheetname = 'SHEET' + (curtbindex + 1) + '!';
				}
				sourcecontainer.find('.jsDataArea').val(sheetname + cellStart + ':' + cellEnd);
			};
			self.sheetInstance.selectCallbacks.bind(cellselectcallback);
		});
		
		//先隐藏图表
		if(this.window) this.window.hide();
		container.dialog({
			width: 400,
			height: 280,
			modal: false,
			dialogClass:'chart-dialog',
			closeText: 'hide',
			close: function() {
				//如果不是在选择，则显示图表框
				var isselecting = container.dialog('option','selecting');
				if(isselecting != 'true' && self.window) self.window.show();
			},			
			buttons: {
				"确定": function(){
					try {
						var _this = self;
						var cellv = container.find('input.jsDataArea').val();
						_this.xformat = container.find('input.jsXFormat').val();
						_this.title = container.find('input.jsTitle').val();
						_this.xTitle = container.find('input.jsXTitle').val();
						_this.yTitle = container.find('input.jsYTitle').val();
						if(!cellv) {
							alert('请填写数据范围');
							return;
						}
						var sheetnames = cellv.split('!');
						if(sheetnames.length > 1) _this.sheetName = sheetnames[0];
						
						var cellvs = sheetnames[sheetnames.length -1].split(':');
						if(cellvs.length < 2) {
							alert('数据范围格式不正确');
							return;
						}
						_this.option.cellStart = cellvs[0];
						_this.option.cellEnd = cellvs[1];
						_this.render();
						if(callback)callback.call(_this,true);
						$(this).dialog('close');
					}
					catch(ex) {
						alert(ex.message);
					}					
				},
				"取消":function(){
					if(callback)callback.call(self,false);
					$(this).dialog('close');
				}
			}
		});		
	}

	//转为数据josn对象
	this.toJSON = function() {
		return {
			tableIndex: this.tableIndex,
			title: this.title,
			type: this.charttype,
			xTitle: this.xTitle,
			yTitle: this.yTitle,
			xFormat: this.xformat,
			sheetName: this.sheetName,
			cellStart: this.option.cellStart,
			cellEnd: this.option.cellEnd,
			window: {
				position:this.window.container.position(),
				width: this.window.container.width(),
				height: this.window.container.height()
			}
		};
	}

	/**
	 *
	 * 计算图表生成参数和数据，生成图表
	 */
	this.render = function(data,opt) {
		/*this.container.dialog({width: 300,height:200,
			position:{x:0,y:0},
			dialogClass:'chart-dialog',
			appendTo:this.table.find('.jSScroll>div')});
	*/
		if(!this.option.window) this.option.window = {};
		if(this.option.window.position || this.option.position) {
			var pos = this.option.window.position || this.option.position;
		}
		else {
			var pos = {left: $(this.parent[0].parentElement).width() / 2 - 200, 
						top: $(this.parent[0].parentElement).height() / 2 - 110};	
			//偏 移当前表格已滚去的高宽	
			pos.left += this.parent[0].parentElement.scrollLeft;
	    	pos.top += this.parent[0].parentElement.scrollTop;
		}
		
    	var self = this;
		this.window = jmSheet.untils.window(this.container,{
				width: this.option.window.width || 600,
				height:this.option.window.height || 320,
				position:pos,
				parent:this.parent,
				resize: function() {
					self.redraw(true);
				},
				keydown: function(evt) {
					evt = evt || window.event;
					var code = evt.keyCode || evt['switch'];
					//如果按下delete健，则删除
					if(code == 46) {
						self.close();
					}
					return false;
				}
			}).show();
		this.container[0].chart = this;

		if(!this.menu) {
			var self = this;
			//生成右健菜单
			this.menu = new jmSheetMenu(this.window.container,{
					parent:this.parent,
					position: function(evt) {
						var position = jmSheet.untils.getMouseLocation(evt, self.window.container); //获取鼠标位置
			        	
			        	return {left: position.x + self.window.container[0].offsetLeft,top:position.y +
			        			 self.window.container[0].offsetTop};
					},
					items:[{
							text:'配置',
							click:function(){
								self.setting();
							}
						},
						{
							text:'删除',
							click: function(){
								self.close();
							}
						}
					]
				});
		}
		
		/*var self = this;
		this.container.dialog({'resize': function(){
				this.chart.redraw(true);
			},
			'close': function(){
				var charts = self.sheetInstance.charts;
				for(var i=0;i<charts.length;i++) {
					if(charts[i] == this.chart) {
						charts.splice(i,1);
						break;
					}
				}
			}
		});*/
		this.redraw();		
	};

	/**
	 *
	 * 单元格改变，触发事件
	 */
	this.cellChange = function(cell) {
		if(!cell || !cell.cell) return;//单元格改变才处理，，比如selected表示选择改而则不处理
		if(cell.cell.sheet == this.tableIndex || this.sheetName == ('SHEET' + (cell.cell.sheet + 1))) {
			this.redraw();
		}
	}

	/**
	 *
	 * 根据数据重新绘制图表
	 */
	this.redraw = function(isredraw) {
		//获取当前图表的数据列，并从左上角开始取数据
		var cellstart = this.option.cellStart;
		var cellend = this.option.cellEnd;
		if(cellstart > cellend) {cellstart = cellend;cellend=this.option.cellStart}
		data = this.sheetInstance.sheet.cellHandler.remoteCellRangeValue((this.sheetName||('SHEET' + (this.tableIndex + 1))),cellstart,cellend);
		data = data[0] || [];

		//解析列索引，比如A1对应的索引位{1,1}
		var startcolchar = cellstart.replace(/\d*$/g,'');
		var endcolchar = cellend.replace(/\d*$/g,'');
		var startcolindex = this.sheetInstance.getColumnIndex(startcolchar);
		var endcolindex = this.sheetInstance.getColumnIndex(endcolchar);
		var colstep = endcolindex - startcolindex + 1;

		var series = [];	
		this.charttype = this.charttype || this.option.chartType || 'line';

		var xaxis = {categories:[],labels:{rotation:0.1}};
		for(var i=0;i<colstep;i++) {
			if(i == 0 && colstep > 1) continue;
			var ser = {data:[],name:data[i],type:this.charttype};
			series.push(ser);
			if(this.charttype == 'pie') break;
		}
		
		for(var i=0;i<data.length;i++) {
			var row = Math.floor(i / colstep);
			if(row == 0) continue;//第一行为图例
			var col = i % colstep;
			if(colstep == 1) {
				series[0].data.push(data[i]);
				xaxis.categories.push(row);
			}
			else if(col == 0) {
				xaxis.categories.push(data[i]);				
			}
			else {
				var ser = series[col - 1];
				if(!ser) continue;
				var v = Number(data[i]);
				if(isNaN(v)) v = undefined;
				if(ser.type == 'pie') {
					ser.data.push([xaxis.categories[row - 1],v]);
				}
				else {
					ser.data.push(v);
				}				
			}
					
		}	

		//简单的认为50像表只出现一个X轴标签
		var n = Math.floor(this.container.width() / 50);	
	    xaxis.labels.step = Math.floor(data.length / n) || 1;

		this.container.empty();
		//var chartcontainer = $('<div style="width:100%;height:100%;"></div>').appendTo(this.container);

		this.renderChart(this.container,series,xaxis);	
		//this.container.find('div,svg,rect').attr('tabindex','0');		
	}

	this.close = function() {
		this.window.close();
		this.menu.remove();
		var charts = this.sheetInstance.charts;
		for(var i=0;i<charts.length;i++) {
			if(charts[i] == this) {
				charts.splice(i,1);
				break;
			}
		}
	}

	/**
	 *
	 * 返回图表的SVG信息
	 */
	this.getSVG = function() {
		var hi = this.container.find('svg').parent();
		return hi.html();
	}

	/**
	 * 展示图表
	 */
	this.renderChart = function(container,series,xAxis,ylabelformater,tooltip,click) {
		var xformat = this.xformat;
		xAxis = $.extend({
				type: 'datetime',
				title: {
					text: this.xTitle || ''
				},
				dateTimeLabelFormats:{ millisecond: xformat, second: xformat, minute: xformat, hour: xformat, day: xformat, week: xformat, month: xformat, year: xformat },
				labels: {
                    align: 'center',
                    formatter: function () {
                        //将一种看上去像时间，但是需要将其当作字符串对待的时间格式筛选出来(1989-11-13~1989-11-13)
                        var isDateReg = new RegExp('^[0-9]{4,4}\-[0-9]{2,2}\-[0-9]{2,2}[\~]{1,1}[0-9]{4,4}\-[0-9]{2,2}\-[0-9]{2,2}');
                        if (isDateReg.test(this.value.toString())) {
                            return this.value;
                        }
                        //判断是否是一个时间的正则表达式,写得有点长，但是应该是比较好读的
                        isDateReg = new RegExp('^[0-9]{4,4}\-[0-9]{2,2}\-[0-9]{2,2}|^[0-9]{2,2}\-[0-9]{2,2}%|^[0-9]{2,2}\-[0-9]{2,2}\-[0-9]{2,2}%|^([0-9]{2,2}\:[0-9]{2,2}){1,1}|^([0-9]{2,2}\:[0-9]{2,2}\:[0-9]{2,2}){1,1}');
                        if (isDateReg.test(this.value.toString())) {
                            var val = jmSheet.untils.parseDate(this.value);
                            if (val.toString() == "Invalid Date") { return this.value; }
                            return jmSheet.untils.formatDate(val, this.dateTimeLabelFormat);
                        } else { return this.value }
                    }
                }
            },xAxis);       ;
		
		var yAxis;
		if(typeof ylabelformater == 'object') {
			yAxis = ylabelformater;
		}
		else {
			if(typeof ylabelformater != 'function') {
				ylabelformater = null;
			}
			yAxis = {
	                title: {
	                    text: this.yTitle || ''
	                },
	                min: 0/*,
	                labels: {
		                formatter: ylabelformater || function() {
		                    return '';
		                }
		            }*/
	            };
		}
		container.highcharts({
	            chart: {
	                type: this.charttype,
	                animation: false
	            },
	            title: {
	                text: this.title || ''
	            },
	            subtitle: {
	                text: ''
	            },
	            legend: {
	            	layout: 'vertical',
	            	align: 'right',
	            	verticalAlign: 'top',
	            	borderWidth: 0
	            },
	            xAxis: xAxis,
	            yAxis: yAxis,
	            plotOptions: {
	            	//图形事件,包含所有类型、如果只想为特定类型绑定事件，该级项目的名称“series”可对应替换成类型名称
	                series: {
	                    cursor: "pointer",
	                    animation: false,
	                    events: {
	                        click: click || function(e) {
	                        	}
	                    }
	                },
		            area: {
		                marker: {
		                    enabled: false,
		                    symbol: 'circle',
		                    radius: 2,
		                    states: {
		                        hover: {
		                            enabled: false
		                        }
		                    }
		                }
		            },
		            column: {
	                    pointPadding: 0,
	                    borderWidth: 0
	                },
	                spline: {
	                    pointPadding: 0,
	                    borderWidth: 0,
	                    marker: {
	                    	radius: 0
	                    }
	                },
	                pie: {
	                	allowPointSelect: true,
	                	cursor: 'pointer',
	                	showInLegend: true,
	                	dataLabels: {
	                		enabled: false//不显示图上的标签
	                	}
	                }
	        },
	            tooltip: tooltip || {
	                formatter: function() {
	                        return this.key +'<br />'+ this.y;
	                }
	            },            
	            series: series
	        });
		container.find('tspan:contains(Highcharts.com)').remove();
	};
}

/**
 * 
 * 右健菜单 
 * 
 **/
function jmSheetMenu(target,option) {
    this.target = target;
    this.option = option;
    /**
     * 当前菜单对象 DIV    
     **/
    this.menu = $('<div class="jmSheet-menu"></div>');
    /**
     * 当前菜单主体 UL    
     **/
    this.body = $('<ul></ul>');
    this.body.appendTo(this.menu);

    /**
     * 当前菜单ID    
     **/
    this.id;
    /**
     * 所有菜单项
     **/
    this.items = option.items || {};

    /**
     * 菜单项个数
     **/
    this.itemCount = function () {
        var i = 0; for (var k in this.items) { i++; } return i;
    };

    /**
     * 当前菜单索引
     **/
    this.index = 0;

    /**
     * 当前菜单项索引
     **/
    this.itemIndex = 0;

    /**
     * 单击事件句柄   
     **/
    var eventHander = null;
    var frameHandler = null;

    /**
     * 菜单句柄
     **/
    this.IContextMenuHander = null;

    /**
     * document 菜单弹出父容器
     **/
    var backGround = target || $(document);

    /**
     * 事件取消
     **/
    var cancelfun = function () { return false; };

    /**
     * 获取或设置当前菜单的层级
     **/
    this.zIndex = function (index) {
        if (!index) {
            this.menu.css('z-index', index);
        }
        else return this.menu.css('z-index');
    }

    /**
     * 弹出当前菜单
     **/
    this.show = function (mu, e) {        
        eventHander = function (evt) {
            if (mu)
                mu.hide();
        };
        $(document).unbind('mouseup', eventHander);
        $(document).bind('mouseup', eventHander);

        var pos;
        if(this.option.position && typeof this.option.position == 'function') {
        	pos = this.option.position.call(this,e);
        }
        else {
        	var position = jmSheet.untils.getMouseLocation(e, mu.target); //获取鼠标位置
	        var targetoffset = jmSheet.untils.getOffset(mu.target);

	        /*//如果菜单超出容器则从左弹出
	        var muwidth = mu.menu.width();
	        if (position.x >= muwidth && e.offsetX > $(window.document).width() - muwidth) {
	            position.x = position.x - muwidth;
	        }*/
	        //position.x += targetoffset.left;
	        //position.y += targetoffset.top;
	        pos = {
	        	left : position.x + targetoffset.left,
	        	top : position.y + targetoffset.top
	        }
	        //mu.menu.css('left', position.x);
	        //mu.menu.css('top', position.y);
	        //targetoffset.left += position.x;	        
        }
        mu.menu.css(pos);
        mu.menu.show(200);
    };

    this.remove = function() {
    	$(document).unbind('mouseup', eventHander);
    	//this.target.unbind('mouseup', menudown);
    	this.menu.remove();
    }

    /**
    * 隐藏当前菜单,并取消事件绑定
    * @method hide
    * @for menu    
    * @private
    **/
    this.hide = function () {
        backGround.unbind('mouseup', eventHander);
        this.menu.hide(200);
    };


    /**
    * 添加菜单项
    * @method addItem
    * @for menu
    * @param {Object} item 菜单项,例如:{text:'菜单一',tag:'测试',click:function(){alert('点击了菜单一')}}
    **/
    this.addItem = function (item) {
        //当前菜单项唯一标识
        this.itemIndex++;
        var itemmark = 'jm_menuitem_' + this.index + '_' + this.itemIndex;
        var mitem = $('<li data-menuitem="' + itemmark + '" data-menuid="' + this.id + '">' + item.text + '</li>');
        mitem[0].menu = this;
        if (item.disabled) mitem.attr('disabled', 'disabled'); //禁用
        if (item.tag) mitem.attr('data-tag', item.tag);

        //缓存菜单项
        this.items[itemmark] = item;

        //绑定单击事件
        mitem.bind('mousedown', function (evt) {
            evt.stopPropagation();
            var curmenuid = $(this).attr('data-menuid');
            var curmenu = this.menu;

            var curitemmark = $(this).attr('data-menuitem');
            var curitem = curmenu.items[curitemmark]; //获取菜单项
            if (curitem.disabled == true) return;
            if (curitem && curitem.click)
            { curitem.click(); }

            if (curmenu) curmenu.hide(); //关闭菜单
            return false;
        });

        //菜单加入到页面中
        mitem.appendTo(this.body);
    }

    /**
    * 初始化菜单,生成菜单项,绑定菜单事件和菜单弹出对象
    * @method init
    * @for menu
    **/
    this.init = function () {
        this.index = 1;
        //去除默认菜单事件
        backGround.bind('contextmenu',cancelfun);

        var button = option.button;
        //如果按健设置不正确则默认为右健
        if (!button || Number(button) < 0) button = 2;
        var self = this;
        var menudown = function (obj) {
            if (obj.button == button || (button == 0 && obj.button == 1)) //按健不配匹不理会
            {
                //首先禁用系统右健菜单
                $(document).bind('contextmenu', cancelfun);
                var target = $(obj.srcElement || obj.target);
                var menuid = target.attr('data-menuid');
                
                    self.show(self, obj); //弹出菜单
                    obj.stopPropagation();
                
            }
        };
        this.target.unbind('mouseup', menudown);
        this.target.bind('mouseup', menudown);

        //生成其ID
        this.id = 'jm_menu_id_' + this.index;
        this.target.attr('data-menuid', this.id); //把菜单ID写到需要弹出的母板上

        //添加菜单项
        if (option.items) {
            for (var i in option.items) {
                this.addItem(option.items[i]);
            }
        }

        this.menu.appendTo(this.option.parent || this.target);
        //this._menu.appendTo('body');
    };

    this.init();
    return this;
};

