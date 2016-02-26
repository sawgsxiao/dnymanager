/**
 * @module QYER.core.m.basic.js
 */

requirejs.config({
	// baseUrl:所有模块的查找根路径
	// 线上
	baseUrl: '/assets/',
	// 本地
	// baseUrl:"../../../../../",
	// path映射那些不直接放置于baseUrl下的模块名
	paths:{
		
		"swipe":"html5/swipe",
	
	},
	models:[
		{
			name:"main"
		}
	],
	shim:{
		'infobox':{
			exports:"InfoBox"
		}
	},

	map: {
		'*': {
			'css': 'html5/css'
		}
	},

	waitSeconds: 120
});




! function() {
	/* 	初始化 qyerUtil */
	! function() {

		if (window.qyerUtil) {return; }

		/**
		 * 常用基础操作封装
		 * @class qyerUtil
		 */
		window.qyerUtil = {

			EVENT:{
				CLICK:'click'
			},

			_head: null,
			_getHead: function() {
				if (!this._head) {
					this._head = document.getElementsByTagName("head")[0];
				}
				return this._head;
			},

			/**
			 * 加载 css 文件
			 * @method loadCss
			 * @param {String} aFilePath 文件路径
			 * @param {Boolean} aAsync 是否异步加载
			 */

			loadCss: function(aFilePath, aAsync) {
				if (aAsync === false) {
					this.insertStyle($.ajax({
						url: aFilePath,
						async: false
					}).responseText);
				} else {
					$('<link rel="stylesheet" type="text/css" />').attr("href", aFilePath).appendTo(this._getHead());
				}
			},

			/**
			 * 动态创建  style 节点，插入到 dom 文档
			 * @method insertStyle
			 * @param {String} aStr css 代码字符串
			 */
			insertStyle: function(aStr) {
				var nod = document.createElement("style");
				nod.type = "text/css";
				if (nod.styleSheet) { /* ie下   */
					nod.styleSheet.cssText = aStr;
				} else {
					nod.innerHTML = aStr; /* 或者写成 nod.appendChild(document.createTextNode(str))   */
				}
				this._getHead().appendChild(nod);
				nod = null;
			},

			/**
			 * 截取 arguments
			 * @method sliceArguments
			 * @param {arguments} aArgument function 的 arguments 对象
			 * @param {Int} aIndex 要从第几位开始截取
			 * @return {Array} 返回截取后的数组
			 */
			sliceArguments: function(aArgument, aIndex) {
				var ps = [];
				for (var i = aIndex; i < aArgument.length; i++) {
					ps.push(aArgument[i]);
				};
				return ps;
			},


			/**
			 * 是否是移动设备
			 * @method isMobile
			 * @return {Boolean}
			 */
			 isMobile:function () {
			 	var uA = navigator.userAgent;
			 	return ( uA.match(/Android/i) || uA.indexOf('iPhone') != -1 || uA.indexOf('iPad') != -1  );
			 },


			/**
			 * 返回字符串长度
			 * @method getWordLen
			 * @return {Number}
			 */
			getWordLen:function (aValue,g) {
				function byteLength(b){ 
					if (typeof b == "undefined") { 
						return 0 ;
					} 
					var a = b.match(/[^\x00-\x80]/g); 
					return (b.length + (!a ? 0 : a.length));
				}
	            function doublebyte (str){
	                return str.replace(/[^\x00-\xff]/g,'*') ;
	    		}

                if(g) {
                	aValue = doublebyte(aValue) ;
                }
				return byteLength($.trim(aValue));
			},

			
			/**
			 * 截取字符串,中文按2个字符算
			 * @method subStr
			 * @param {String} aStr 要截取的字符串
			 * @param {Number} aLen 要截取的长度
			 * @return {String}
			 */
			subStr:function (aStr, aLen) {
                var char_length=0,son_str,sub_len;
                for (var i = 0; i < aStr.length; i++) {
                    son_str = aStr.charAt(i);
                    encodeURI(son_str).length > 2 ? char_length += 1 : char_length += 0.5;
                    if (char_length >= aLen) {
                        sub_len = char_length == aLen ? i + 1 : i;
                        return aStr.substr(0, sub_len);
                        break;
                    }
                }
                return aStr;
			},


			/**
			 * 在一个时间段内，保证此方法只调用一次
			 * @method runOneInPeriodOfTime
			 * @param {Funtion} aFun 要运行的方法
			 * @param {Int} aTimer 多长时间范围内只运行一次（单位 ms）
			 * @return {Function}
			 */
			 runOneInPeriodOfTime:function(aFun,aTimer){
			    var timer ;
			    return function(){
			        window.clearTimeout(timer);
			        timer = window.setTimeout(function(){
			            aFun();
			        },aTimer||300);
			    };
			 },



			 __bodyTouchmoveFun__:function(aEvt){
 				aEvt.preventDefault();
			 },

			/**
			 * 禁用 body 的触摸滚动事件，一般弹层出现会把 body 的滚动屏蔽掉
			 * @method disableBodyScroll
			 */
			 disableBodyScroll:function(){
				document.body.addEventListener('touchmove', this.__bodyTouchmoveFun__, false);
			 },

 			/**
			 * 启用 body 的触摸滚动事件，与 disableBodyScroll 对应
			 * @method enableBodyScroll
			 */
			 enableBodyScroll:function(){
				document.body.removeEventListener('touchmove', this.__bodyTouchmoveFun__);
			 },


			/**
			 *	render template - basic, only var replacements
			 */
			 renderTemplate : function (tmpl, data) {
			 	if (!data) return false;
			 	
			 	// replace {{= KEY}} with data.KEY
			 	return tmpl.replace(/{{(\/?)(\w+|.)(?:\((.*?)\))?(?: (.*?))?}}/g, function (match) {
			 		var key = match.slice(4,-2).replace(/(^\s*)|(\s*$)/g, "");
			 		return (key in data) ? data[key] : "";
			 	});
			 },



			/**
			 * 执行 ajax 操作
			 * @method doAjax
			 * @param {Object} aOption 配置项
	         * <ul>
	         *      <li><span>testData ： Object ， 测试数据，有测试数据的话，直接返回测试数据，不会调用真实的 ajax </span></li>
	         *      <li><span>onCallSuccessBefore ： function ， onSuccess 之前的回调</span></li>
	         *      <li><span>onCallSuccessAfter ： function ， onSuccess 之后的回调</span></li>
	         *      <li><span>onSuccess ： function ， 成功回调</span></li>
	         *      <li><span>onError ： function ， 失败回调（ ajax 本身失败， errorcode ！=0 都会走到这里）</span></li>
	         *      <li><span>posturl ： String ， 提交到的 url</span></li>
	         *      <li><span>data ： Object ， 要 post 的数据对象</span></li>
	         *      <li><span>minResponseTime: Number, 最小响应时间 </span></li>
	         *      <li><span>\_\_qFED\_\_: Object, 调用测试服务的配置 </span></li>
	         *  	<ul>
	         *  		<li>id : {String} 平台测试接口 id</li>
	         *  		<li>dataIndex : {Number} 获取第几条测试数据</li>
	         *  		<li>randomData : {Boolean} 获取随机一条数据，此字段为 true 时，dataIndex 配置无效</li>
	         *  	</ul>
	         * </ul>
			 */
			ajax:function(aOption) {
			/*
			 * @20140822 增加配置minResponseTime{number}，数据处理方法dataProcess
			 */
		 	   	var _startDate, _duringTime, dataProcess;

			    _startDate = aOption.minResponseTime ? new Date() : null;

			    function logSendData(){
			    	if(/static.qyer.com/.test(window.location.host)===true && window.console &&  window.console.log ){
			    		console.log(aOption.data);
					}
			    }

				dataProcess = function(aJSON) {
					/*
					 * @20140822为了兼容格式为{error:0,msg:'xxx'}的结果
					 */
					if (typeof aJSON.error_code == 'undefined') {
						try {
							aJSON.error_code = aJSON.error;
							aJSON.result = aJSON.result;
							if (aJSON.error_code != 0) {
								aJSON.data = aJSON.data || {};
								aJSON.data.msg = aJSON.msg;
							}
						} catch (err) {}
					}

					if (aJSON.error_code == 0) {
						if (typeof(aJSON.data) == 'undefined') {
							aJSON.data = aOption.__defaultData__;
						}
						aOption.onCallSuccessBefore && aOption.onCallSuccessBefore(aJSON);
						aOption.onSuccess && aOption.onSuccess(aJSON);
						aOption.onCallSuccessAfter && aOption.onCallSuccessAfter(aJSON);
					} else {
						aOption.onError && aOption.onError(aJSON);
					}
				};

				if (aOption.testData) {
					if (typeof(aOption.testData.data) == 'undefined') {
						aOption.testData.data = aOption.__defaultData__;
					}
					logSendData();
					setTimeout(function() {dataProcess(aOption.testData);}, (aOption.minResponseTime || 200));
					return;
				}

				/*
				@20150121增加对236 API测试数据的支持
				 */
				var _host = window.location.host, 
					_url = aOption.url||aOption.posturl,
					_data = aOption.data,
					_dataType = 'json';

				if(/static.qyer.com/.test(_host) === true){
					var id;
					_data = $.extend({}, _data, {__qFED__:aOption.__qFED__});
					if(aOption.__qFED__ && aOption.__qFED__.id){
						id = aOption.__qFED__.id;
						aOption.type = "GET";
						_url = 'http://fe.2b6.me:3000/service/api/' + id;
						_dataType = 'jsonp';
						api = null;
					}
				}

				logSendData();
			    var _ajax = $.ajax({
			        type: aOption.type || "POST",
			        url: _url,
			        dataType: _dataType,
			        data: _data,
			        cache:aOption.cache || false,
			        success:function (aJSON) {
						if (_startDate) {
							_duringTime = new Date() - _startDate;
							setTimeout(function() {
								dataProcess.call(null, aJSON);
								}, (_duringTime > aOption.minResponseTime ? 0 : aOption.minResponseTime - _duringTime));
						} else {
							dataProcess.call(null, aJSON);
						}
						_startDate = _duringTime = null;
			        },
			        error:function (aXhr,aInfo) {
			        	/*
			        	 * @20140822 添加__server_error__属性，标识为服务器返回错误
			        	 * @20141212 添加__server_status__属性，标识为服务器返回错误的text
			        	 */
			            aOption.onError && aOption.onError({
			            		"error_code":-1, 
			            		"__server_error__":true,
			            		"__server_status__":_ajax.statusText,
			            		"result": "error", 
			            		"data":{
			            			"msg": aInfo||{}
			            		}
			            	});
			        }
			    });
				return _ajax;
			},

			doAjax:function(aOption){
				this.ajax(aOption);
			},
			
			/**
			 * 强制执行 track 代码
			 * @method doTrackCode
			 * @param {String} aCode track代码
			 */
			doTrackCode:function(aCode){
				var id = '__dotarckcodebutton__';
				if( !document.getElementById(id) ){
					$('<button id="'+id+'" style="display:none;">dotarckcodebutton</button>').appendTo(document.body);
				}
				$('#'+id).attr('data-bn-ipg',aCode).trigger('click');
				id=null;
			},


			/**
			 * 统一处理一下 zepto 里面 ajax 的成功回调，增加自己的业务逻辑 
			 * @method ajaxFillter
			 */
			ajaxFillter:function(data, xhr, settings, deferred){
				if( window.location.href.indexOf('http://m.qyer.com/plan') == 0  ){return;}
				if( typeof(data) == 'object' ){
					if(data.extra && data.extra.code){
						switch(data.extra.code|0){
							case 1:
								// 触发敏感词
								window.qyerUtil.showAntiSpam(data.extra.msg);
							break;
						}
					}
				}

			},
			/**
			 * 弹出警告层（ 只要 ajax 返回结果中有 extra && extra.code != 0 ）
			 * @param {String} aText 要显示的文本
			 */
			showAntiSpam:function(aText){
				requirejs(['antiSpam'],  function (m) {m.show(aText); });
			},


			/**
			 * 获取 url 参数
			 * @method getUrlParam
			 * @param {String} aKey 
			 * @return {String}
			 */
			getUrlParam:function(aKey, aURL){
				var reg = new RegExp("(^|&)"+ aKey +"=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
				var url ;
				if(aURL){
					var i = aURL.indexOf('?');
					i!=-1 && ( url = aURL.substr( aURL.indexOf('?') + 1 ) ) ;
				}else{
					url = window.location.search.substr(1);
				}
				var r = url.match(reg);  //匹配目标参数
				if (r!=null) return unescape(r[2]); return null; //返回参数值
			},



			/**
			 * 判断是否登录
			 * @method isLogin
			 * @return {Boolean}
			 */
			isLogin:function(){
				return !!(window.QYER&&window.QYER.uid);
			},
			

			/**
			 * 登录
			 * @method doLogin
			 */
			doLogin:function(referrer){
				referrer = referrer || "";
				window.location.href = "http://m.qyer.com/login.php?from_url=" + referrer;
				
			}




		};
	}();



	/*  初始设定 */
	!function(){
		if(qyerUtil.isMobile()){qyerUtil.EVENT.CLICK = 'tap'; }
	}();


	// 原型扩展 
	!function () {
		function ex(aObj,aEx) {for(var key in aEx ){aObj[key] = aEx[key]; } }

		/**
		 * models Date原型扩展
		 * @class Date.prototype
		 */
		ex(Date.prototype,{
			/**
			 * 返回中文，星期几
			 * @method qGetWeekStr
			 * @return {String}
			 */
			qGetWeekStr:function () {
				return '星期' + ["日","一","二","三","四","五","六"][this.getDay()];
			},

			/**
			 * 设置几天之后的日期
			 * @method qAddDate
			 * @param {Number} aNum 
			 */
			qAddDate:function (aNum) {
				this.setDate( this.getDate() + aNum );
				return this;
			},

			/**
			 * 转换成字符串 类似 2014-1-1 ， 可以自定义分隔符
			 * @method qToString
			 * @param {String} aSplit 分隔符
			 */
			 qToString:function (aSplit) {
				var  str = [ this.getFullYear(), this.getMonth()+1, this.getDate() ];
				return str.join(aSplit||'-');
			}

		});


		/**
		 * models String原型扩展
		 * @class String.prototype
		 */
		ex(String.prototype,{
			/**
			 * 转换成 Date 对象
			 * @method qToDate
			 * @param {String} aSplit 分隔符
			 * @return {Date} 
			 */
			qToDate:function (aSplit) {
				var s = this.split(aSplit||'-');
				s = [s[0]|0, (s[1]|0)-1, s[2]|0];
				var d = new Date(s[0],s[1],s[2]);
				s.length=0;
				s=null; 
				return d;
			},


			/**
			 * 转换成 两位整数 不足补零
			 * @method qToIntFixed
			 * @param {Number} aLen 要转换成几位
			 * @return {String} 
			 */
			qToIntFixed:function () {
				var n = this|0;
				return n<10 ? '0'+n : n.toString();
			},

			/**
			 * 转换成 html 代码，替换回车等特殊字符
			 * @method qToHTML
			 * @return {String} 
			 */
			qToHTML:function () {
				return this
						   .replace(/</gi,"&lt;")
						   .replace(/>/gi,"&gt;")
						   .replace(/\n/gi,"<br />")
						   .replace(/\t/gi,"&nbsp;&nbsp;&nbsp;&nbsp;");
			}



		});



	}();
	

}();
