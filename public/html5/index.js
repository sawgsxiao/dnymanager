// dom on read
$(function() {

    var control={
        init:function(){
        	var me = this;
        	//slider滑动模式
			require(['swipe'],function(){
				var bullets = $("#position li");
				if(bullets.length <= 1){
					$("#position").css("display","none");
					$('.swipe').css({'visibility':'visible'});
					$('.image').css('left','0px');
				}else{
					$('#slider').Swipe({
					    // auto: 3000,
					    continuous: true,
					    callback: function(pos) {
					    	var i = bullets.length;
					    	while (i--) {
					    		bullets[i].className = ' ';
					    	}
					    	bullets[pos].className = 'on';
					    }
					}).data('Swipe');
				}
				me.bindEvent();
			});
        },
        bindEvent:function(){
        	var me = this;
			// 出发日期，查看全部功能
			me.$departureDateTxt = $("#departureDateTxt");
			me.$departureDateDown = $("#departureDateDown");
			var pH = me.$departureDateTxt.children("p").height();
			var maxH = parseInt(me.$departureDateTxt.css("max-height"),10);
			//console.log(pH,maxH);

			if(pH>maxH){
				me.$departureDateDown.show();
				me.$departureDateDown.on(qyerUtil.EVENT.CLICK,function(){
					if(me.$departureDateTxt.hasClass('up')){
						me.$departureDateTxt.addClass('down').removeClass('up').animate({"max-height":pH+"px"},50);
						me.$departureDateDown.addClass('departureDateUp').html("收起全部");
					}else{
						me.$departureDateTxt.addClass('up').removeClass('down').animate({"max-height":maxH+"px"},50);
						me.$departureDateDown.removeClass('departureDateUp').html("查看全部");
					}

				});
			}

            //增加咨询功能，@20150902
            var $consultList = $(".consultList"),
                $consultNoList = $(".consultNoList"),
                $consultMore = $(".consultMore");
            var showTip = function(aText,aType){
                requirejs(['slidTip'],function(tip){
                    tip.show({
                        text:aText,//提示语
                        type:aType,//提示类型具体见demo
                        delay:2  //提示时间
                    });
                });
            }
            var releaseSub = function(lid, str){
                // 点击发布按钮
                var _opt = {
                    __qFED__:{     //在非static.qyer.com域名下该项无效
                        id:"b1fdb4bc-e5cd-89ef-e190-987fd80959df",      //对应在API测试中的接口
                        dataIndex:0    //对应到测试数据的索引
                    },
                    data:{
                        content:str,
                        lid:lid
                    },
                    onSuccess:function(aJSON){
                        var data = aJSON.data,
                            list = [];
                        if(data){
                            list.push(data);
                            require(['project/m/lmMobile/consultlist/js/tmplModel', 'css!project/m/lmMobile/consultlist/css/index.css'], function(TMPL){
                                var html = TMPL.render('getList', {list:list});
                                $consultList.removeClass("hidden").prepend(html);//出入到列表前端
                                $consultNoList.addClass("hidden");
                                showTip("发布成功!","2");

                                var num = parseInt($consultMore.find(".num").text())||0;
                                $consultMore.removeClass("hidden").find(".num").text(num+1);
                            })
                        }
                    },
                    onError:function(aJSON){
                        var data = aJSON.data;
                        showTip(data.msg,"5");
                    }
                }
                _opt.posturl = 'http://m.qyer.com/z/index.php?action=addQuestion';
                _opt.type = 'post';
                window.qyerUtil.doAjax(_opt);
            };
            $(document).on(qyerUtil.EVENT.CLICK, '.js-add-consult', function(e){
                var $this = $(this),
                    lid = $this.attr("data-lid"),
                    maxLength = $this.attr("data-maxlength")||140,
                    minLength = $this.attr("data-minlength")||10;
                if (!window.qyerUtil.isLogin()) {
                    window.qyerUtil.doLogin();
                    return false;
                }
                require(['editer'],function(d){
                    d.show({
                        okText:"发布",
                        cancelText:"取消",
                        title:"发表咨询",
                        input1:false,
                        exClassName:'consult-editor',
                        textarea1Placeholder:"说说你的疑问",
                        maxLength:maxLength,
                        minLength:minLength,
                        limitOverInput:true,
                        onOK:function(){
                            var val =$(".qui-editer1 textarea").val();
                            if(val.length < minLength){
                                // 如果字数为零
                                showTip("至少输入10个字!","5");
                                return false;
                            }else if(val.length > maxLength){
                                // 字数不超过最大限制
                                showTip("已超出最大140字限制!","5");
                                return false;
                            }else{
                                releaseSub(lid, val);
                            }
                        }
                    });
                    setTimeout(function(){
                        $(".qui-editer1 textarea").get(0).select();
                    },500);
                });         // 
            })

			// 产品列表展开收起
			$(".productInfoTilC").on(qyerUtil.EVENT.CLICK,function(){
				var $box = $(this).siblings(),
					box_h = $box.children().height();
				// console.log(box_h);
				if($box.css("height")=="0px"){
					$box.animate({"height":box_h},300);
					$(this).addClass("productInfoTilC2");
				}else{
					$box.animate({"height":"0px"},300);
					$(this).removeClass("productInfoTilC2");
				}
			});

			// 点击收藏
			if($("#collectBtn").length){
				$("#collectBtn").click(function(){
					me.addCollect($(this));
				});
			}
			// 点击开售前提醒
			if($(".fixedBar").length){
            	$('#fixedBar .tellme').on("click",function(){
            		me.tellmeClick($(this));
            	});
			}
			// 点击立即预定
			if($(".fixedBar").length){
            	$('#fixedBar .booking:not(.soldout):not(.finished)').on("click",function(){
            		me.bookingClick($(this));
            	});
			}
            // 关闭微信中提醒弹层
            $('#js_closePopup').on('click',function(){
            	$("#js_popupBox").hide();
            });
            // 关闭立即预订出现的弹层
            $("#lm_popup_close").click(function(){
	            $(".lm_popupbg").hide();
	        });
        },
        addCollect:function(that){
        	// 判断是否正在请求服务器
        	if (that.hasClass("favoring")) return false;
        	// 判断是否登录
        	if (!qyerUtil.isLogin()) {
                qyerUtil.doLogin();
                return false;
            }
            // 添加正在请求服务器的标记
            that.addClass("favoring");

        	if(that.hasClass("qui-icon-heart2")){
        		//添加收藏
        		$.ajax({
                    url:'/api.php?action=lmfavor',
                    type:'post',
                    data: {deal_id : $("#lid").val()},
                    dataType:'json',
                    success:function(data){
                        if('ok' == data.result){
                        	that.addClass("qui-icon-heart-reverse").removeClass("qui-icon-heart2");
                        }
                        that.removeClass("favoring");
                    },
                    error:function(){
                        require(['slidTip'], function(slidTip) {
                            slidTip.show({
                                type:5,
                                text: '收藏失败'
                            });
                        });
                        that.removeClass("favoring");
                    }
                })
        	}else{
        		//取消收藏
                $.ajax({
                    url: "/api.php?action=lmfavor",
                    data: "deal_id="+$("#lid").val()+"&op=del",
                    dataType: "json",
                    success: function(data) {
                        if ('ok'==data.result){
                            that.addClass("qui-icon-heart2").removeClass("qui-icon-heart-reverse");
                        }
                        that.removeClass("favoring");
                    },
                    error: function() {
                        require(['slidTip'], function(slidTip) {
                            slidTip.show({
                                type:5,
                                text: '取消收藏失败'
                            });
                        });
                        that.removeClass("favoring");
                    }
                });
        	}
        },
        tellmeClick:function(that){
        	//点击*开售前提醒*
            if (!qyerUtil.isLogin()) {
                qyerUtil.doLogin();
                return false;
            }
            // done标记*判断是否已经设置提醒并阻止多次连续重复点击动作
            if(!that.hasClass('done')){
                that.addClass('done');
                $.ajax({
                    url: "/api.php?action=lm_subscribe_single",
                    type: "post",
                    data: {lid:$("#lid").val()},
                    dataType: "json",
                    async: false,
                    success: function(data) {
                        if (typeof(data.error_code) != 'undefined' && data.error_code == 0) {
                            that.html("已设置提醒");
                            require(['slidTip'], function(slidTip) {
                                slidTip.show({
                                    type:1,
                                    text: '提醒设置成功'
                                });
                            });
                        } else {
                            that.removeClass("done");
                            require(['slidTip'], function(slidTip) {
                                slidTip.show({
                                    type:1,
                                    text: '提醒设置失败'
                                });
                            });
                        }
                    }
                });
            }
        },
        bookingClick:function(that){
        	// 判断当产品是即将开始状态时不执行以下操作
            if (that.hasClass("notstart")) return false;
            // 判断在微信中打开本页面时弹出提示层
            if (this.is_weixin()){
                $("#js_popupBox").show();
                return false;
            }
            if (typeof(that.attr("data-login-visible")) != 'undefined') {
                if (!qyerUtil.isLogin() && that.attr("data-login-visible") == "1") {
                    qyerUtil.doLogin();
                    return;
                }
            }

            if (that.hasClass("booktype")) {
            	// class中有booktype时，去下订单
                setOrderform($("#lid").val());
            } else {
            	// class中无booktype时，弹出层
                $(".lm_popupbg").show();
                var top = ($(window).height() - $(".lm_popup").height()) / 2;
                if(top<0){top=0;}
                $(".lm_popupbg .lm_popup").css("top", top + "px");
                // popup();//此句执行代码没有找到
            }
        },
        is_weixin:function(){
	        var ua = navigator.userAgent.toLowerCase();
	        if(ua.match(/MicroMessenger/i)=="micromessenger") {
	            return true;
	        }else{
	            return false;
	        }
	    }

    };
    if($("#detailMainBar").length){
    	control.init();
	}

    var materials={
    	init:function(){
        	var me = this;

			this.bindEvent();
        },

        bindEvent:function(){
        	var me=this;
        	this.$maTabList = $('#maTabList');
        	// 导航中的tab切换
        	var $maContenBox = $('#maContenBar .maContenBox');

        	this.$maTabList.children("li").eq(0).addClass('current').siblings().removeClass('current');
        	$maContenBox.eq(0).show().siblings().hide();

        	this.$maTabList.children("li").on('click',function(){
        		var i = $(this).index();
        		$(this).addClass('current').siblings().removeClass('current');
        		$maContenBox.eq(i).show().siblings().hide();
        	});

        	// 导航滚动
            document.getElementById("maTabList").addEventListener("touchstart",function(event){_start(event);},false);
            document.getElementById("maTabList").addEventListener("touchmove",function(event){_move(event)},false);
            document.getElementById("maTabList").addEventListener("touchend",function(event){_end(event)},false);

	        var sx,ex,defLeft,navW=0,once=1,endLength=0;
	        var _start = function(event){
	        	// console.log(event);
	        	if(once){
		            for(var liNum=0;liNum<me.$maTabList.children("li").length;liNum++){
		                navW += me.$maTabList.children("li").eq(liNum).width();
		            }
		            once=0;
		            me.$maTabList.width(navW);
		            if(navW>$(window).width()){
		            	endLength=-(navW-$(window).width());
		            }
	        	}
	            var data = event.touches ? event.touches[0]: event;
	            sx = data.pageX;
	            defLeft = me.$maTabList.position().left;
	        }
	        var _move = function(event){
	            var data = event.touches ? event.touches[0]: event;
	            ex = data.pageX;
	            var moveX = ex-sx+defLeft;
	            if(moveX>0){moveX=0}
	            if(moveX<endLength){moveX=endLength}
	            me.$maTabList.css("left",moveX)
	        }
	        var _end = function(){
	        }

        }
    }
    if($("#maMain").length){
    	// 所需材料页
    	materials.init();
    }

    // 后台要输出到页面的
	// var passenger = [
 //        {
 //            id:"100",
 //            passengerType:"2",
 //            gender:"2",
 //            surnameCh:"张",
 //            surnameEn:"Zhang",
 //            givennameCh:"三",
 //            givennameEn:"San",
 //            identityType:"1",
 //            identityNumber:"E123456789",
 //            identityPlace:"北京",
 //            identityValidity:"2015-01-15",
 //            birthPlace:"北京",
 //            birthday:"2015-01-15"
 //        },
 //        {
 //            id:"200",
 //            passengerType:"1",
 //            gender:"1",
 //            surnameCh:"王",
 //            surnameEn:"Wang",
 //            givennameCh:"二二二二二二二二二二二二二二二二二二",
 //            givennameEn:"Er",
 //            identityType:"2",
 //            identityNumber:"110225986544122201",
 //            identityPlace:"北京",
 //            identityValidity:"2015-01-15",
 //            birthPlace:"北京",
 //            birthday:"2015-01-15"
 //        },
 //        {
 //            id:"300",
 //            passengerType:"1",
 //            gender:"1",
 //            surnameCh:"王",
 //            surnameEn:"Wang",
 //            givennameCh:"三",
 //            givennameEn:"san",
 //            identityType:"2",
 //            identityNumber:"110225986544122201",
 //            identityPlace:"北京",
 //            identityValidity:"2015-01-15",
 //            birthPlace:"北京",
 //            birthday:"2015-01-15"
 //        },
 //        {
 //            id:"400",
 //            passengerType:"1",
 //            gender:"1",
 //            surnameCh:"李",
 //            surnameEn:"Li",
 //            givennameCh:"四",
 //            givennameEn:"si",
 //            identityType:"2",
 //            identityNumber:"110225986544122201",
 //            identityPlace:"北京",
 //            identityValidity:"2015-01-15",
 //            birthPlace:"北京",
 //            birthday:"2015-01-15"
 //        }
 //    ];


	var orderUi = {
		passLen:0,// 纪录页面中旅客list人数
		pop:null,
		tpl:null,
		regConfig:null,
		data:{},
		_curr:null,
		proxy:$({}),
		ajaxUrl:{
			savePassUrl:'/z/?action=savetraveler'
		},
		popupWaitHtml:['<div class="lmPopWrapper">',
						'<div class="lmPopInner">',
							'<div class="closeWarp clearfix">X</div>',
							'<img width="194px" height="226px" src="http://static.qyer.com/m/project/lm/images/img_wait.png" />',
						'</div>',
					'</div>'].join(''),
		popupSoldoutHtml:['<div class="lmPopWrapper">',
						'<div class="lmPopInner">',
							'<div class="ico"></div>',
							'<p>产品已售罄，请选择其他产品</p>',
							'<a class="lv know" href="javascript:void(0)">我知道了</a>',
						'</div>',
					'</div>'].join(''),
		init:function(){
			var that = this;
			require(['popup_base','project/m/lmMobile/detail/js/validateConfig','project/m/lmMobile/detail/js/util','project/m/lmMobile/detail/js/order_coupons','project/m/lmMobile/detail/js/calendar'], function(popup,conf,util,coupons) {
				that.pop = popup;
				//that.tpl = tpl;
				that.util = util;
				that.regConfig = conf;
				that.bindEvent();
				that._lmCalendar = new lmCalendar();
				$("#amount").val(0);
				$("#roomNum").val(0);
				that._coupons = new coupons();

                // 城市玩乐-wifi类目-特殊限定
                that.customView();
			});
		},
		bindEvent:function(){
			var that = this;
			$('body,document')
				// 点击选择产品套餐
				.on(qyerUtil.EVENT.CLICK, '.itemType .combo', function(aEvt){that.evt_combo_click(aEvt)})
				// 点击成人加号
				.on(qyerUtil.EVENT.CLICK, '#amountNumBox .add', function(aEvt){that.evt_add_click(aEvt)})
				// 点击成人减号
				.on(qyerUtil.EVENT.CLICK, '#amountNumBox .subtract', function(aEvt){that.evt_subtract_click(aEvt)})
				// 点击房间加号
				.on(qyerUtil.EVENT.CLICK, '#roomNumBox .add', function(aEvt){that.evt_rAdd_click(aEvt)})
				// 点击房间减号
				.on(qyerUtil.EVENT.CLICK, '#roomNumBox .subtract', function(aEvt){that.evt_rSubtract_click(aEvt)})

				// 点击提交订单按钮
				.on(qyerUtil.EVENT.CLICK, '#submitOrder', function(aEvt){that.evt_submitOrder_click(aEvt)})


				// 点击页面中旅客列表中某条信息可弹出编辑旅客信息弹层
				.on(qyerUtil.EVENT.CLICK, '.passenger-box', function(aEvt){that.evt_edit_passenger(aEvt);})
				// 点击页面中旅客信息列表中某条的删除按钮
				.on(qyerUtil.EVENT.CLICK, '.js-show-del-btn', function(aEvt){that.evt_showdelBtn_click(aEvt);})
				// 点击常用旅客信息弹层中右上角的对勾
				.on(qyerUtil.EVENT.CLICK, '.js-pop-head-comm-confirm', function(aEvt){that.evt_pop_comm_confirm(aEvt);})
				// 点击添加新旅客弹层中右上角的对勾
				.on(qyerUtil.EVENT.CLICK, '.js-pop-head-pass-confirm', function(aEvt){that.evt_pop_pass_confirm(aEvt);})
				// 常用旅客信息弹层左上角的返回
				.on(qyerUtil.EVENT.CLICK, '.js-pop-head-back', function(aEvt){that.evt_pop_back(aEvt);})
				// 编辑常用旅客信息弹层和添加新旅客信息弹层左上角的返回
				.on(qyerUtil.EVENT.CLICK, '.js-pop-head-pass-back', function(aEvt){that.evt_pop_pass_back(aEvt);})

				// 点击常用旅客信息弹层中某条旅客信息右侧的编辑图标
				.on(qyerUtil.EVENT.CLICK, '.js-pop-edit', function(aEvt){that.evt_pop_edit_comm_pass(aEvt);})
				// 常用旅客信息弹层中的“点击添加新旅客”按钮
				.on(qyerUtil.EVENT.CLICK, '.js-pop-add-pass', function(aEvt){that.evt_pop_addPass("1");})
				// 点击编辑常用旅客信息弹层下方的保存按钮
				.on(qyerUtil.EVENT.CLICK, '.js-pop-save-pass-btn', function(aEvt){that.evt_pop_savePass(aEvt);})
				// 点击编辑旅客信息弹层(三个弹层都有)中证件类型旁边的icon
				.on(qyerUtil.EVENT.CLICK, '.pass-tip', function(aEvt){that.evt_pop_passTip(aEvt);})
				// 关闭证件类型的提示弹层
				.on(qyerUtil.EVENT.CLICK, '.close-tip', function(aEvt){that.evt_pop_close_passTip(aEvt);})
				// 给弹层中的input输入框绑定，点击时得到焦点
				.on(qyerUtil.EVENT.CLICK,'.input-text', function(aEvt){that.evt_pop_input(aEvt);})
				// 当弹层中的input输入框得到焦点时，去掉红色警告样式
				.on('focus','.input-text', function(aEvt){that.evt_pop_input_focus(aEvt);})
				// 当弹层中的证件类型下拉菜单select发生变化时，根据不同选项，设置证件号码、签发地、有效期的input不同状态
				.on('change','.input-select', function(aEvt){that.change_identityType(aEvt);});
			//默认选中一个可售卖的套餐
			$('.itemType .combo.selected').removeClass("selected").trigger(qyerUtil.EVENT.CLICK);

			// 点击页面中的“点击添加旅客按钮”
			$('.js-add-passenger').on(qyerUtil.EVENT.CLICK, function(aEvt){that.evt_addPassenger_click(aEvt);})
			// 没有找到这个元素
			$('#contactMessage').on({
				focus:function(){
					$('body').height($('body').height()+100)
					$('body,html').scrollTop(9999);
				},
				blur:function(){
					$('body').height($('body').height()-100)
				}
			});
			// 个人联系信息form中的input输入框dom
			$('.lmOrderForm .itemIpt input').on({
				focus:function(aEvt){
					orderUi.evt_itemIpt_focus(aEvt);
				},
				blur:function(aEvt){
					orderUi.evt_itemIpt_blur(aEvt);
				}
			});
			// 点击“选择日期”
			$('#itemDepart').on(qyerUtil.EVENT.CLICK,function(aEvt){
				var pid = $(".itemType .selected").attr("data-pid");
				if (!orderUi.data[pid]) return false;
				// $("#depart").blur();
				that._lmCalendar.show({
					_data:orderUi.data[pid],
					proxy:that.proxy,
					onOK:function(data) {
						// 产品数量
						// data的值是{buy_limit:"0",canorder:true,cid:"1744630",date:"2015-07-11",month:"2015-07",price:"2599.00",remain:"2",room_diff:"0.00",room_type: "1",stock:"2"}
						data.stock = data.remain;
						if(parseFloat(data.room_diff) <= 0.00){
							// 如果单房差room_diff为零,表示没有房间数,隐藏房间数dom
							$('#roomNumBar').hide();
						}else{
							// 如果单房差不为零,表示有房间数,显示房间数dom
							$('#roomNumBox .subtract,#roomNumBox .add').addClass('disable');
							$('#roomNum').val(1);
							$('#roomNumBar').show();
						}
						that.setCurr(data);

                        // 城市玩乐wifi类目 查询是否是套餐类别
                        that.checkIfCustomViewPackage && that.checkIfCustomViewPackage(data.date);
					}
				});
			});

			that.proxy.on('reset_coupons_val',function(){
				that._coupons && that._coupons.reset_coupons_val(true);
			})
		},
        // 处理日期相减
        dealDateMinus: function(d1, d2){
            return Math.round((new Date(d2) - new Date(d1)) / 3600 / 1000 / 24) + 1;
        },
        // 处理时间＋指定天数的问题
        dealTimeAdd: function(start, add){
            return new Date(new Date(start) - 0 + 24 * 3600 * 1000 * (add - 1)).format('yyyy-MM-dd');
        },
        // 根据品类不同，做个性化详情页展示
        checkIfCustomView: function(){
            var lid = myVar.id;
            var ptype = myVar.ptype;
            var psubtype = myVar.psubtype;
            var supid = myVar.supid;

            // 城市玩乐－穷游供应商组－wifi类目特殊限定
            if(ptype == 'cityfun' && supid == '320' && psubtype == 'wifi'){
                var activeText = $('.combo.selected').text();
                if(/^单日价格/.test(activeText)){
                    // 命名类别1
                    return 1;
                }else if(/^(\d{1,2})[日天]/.test(activeText)){
                    // 套餐价格类别2
                    return 2;
                }else if(/^押金/.test(activeText)){
                    return 4;
                }else{
                    return 3;
                }
            }

        },
        // 押金类商品单独隐藏时间和取还地点 hack
        hideTimeAndPlace: function(opt){
            $('#contactPlaceGet').parent().parent()[opt]();
            $('#contactPlaceBack').parent().parent()[opt]();
        },
        // 城市玩乐-wifi类目-特殊限定
        customView: function(){
            var self = this;
            // 启动日期选择
            var $travelDateStart = $('#travelDateStart');
            var $travelDateEnd = $('#travelDateEnd');
            var $travelTimeStart = $('#travelTimeStart');
            var $travelTimeEnd = $('#travelTimeEnd');
            // 初始化显隐
            // 隐藏选择
            $('.custom-view-wifi').hide();

            // 清空数据
            $travelDateStart.add($travelDateEnd).val('');

            self.hideTimeAndPlace('show');

            var ifCustomView = self.checkIfCustomView();
            var lid = myVar.id;
            if(ifCustomView == 1 || ifCustomView == 2){
                // 显示选择
                $('.custom-view-wifi').show();

                // 处理日期选择
                // 如果是套餐
                if(ifCustomView == 2){
                    $travelDateStart.add($travelDateEnd).attr('disabled',true);
                    $('#itemDepartBarBar').show();
                }
                // 如果是单日价格
                if(ifCustomView == 1){
                    // 处理成人数变化
                    $('#amountNumBox').find('span').addClass('disable');
                    $('#amountNumBox').find('#amount').attr('readonly', true);

                    $travelDateStart.add($travelDateEnd).removeAttr('disabled',false).val('');
                    $('#itemDepartBarBar').hide();
                }

                // 查看是否是套餐产品
                self.checkIfCustomViewPackage = function(sd){
                    var ed;
                    // 套餐类商品
                    if(self.checkIfCustomView() == 2){
                        var activeText = $('.combo.selected').text().trim();
                        var d = /^(\d{1,2})[日天]/.exec(activeText)[1];
                        if(sd && d){
                            ed = self.dealTimeAdd(sd, d);
                        }
                        $('#travelDateStart').val(sd);
                        $('#travelDateEnd').val(ed);
                        $travelDateStart.add($travelDateEnd).change();
                    }
                }

                var dateDeal = function(){
                    // 根据不同折扣id做不同处理
                    var last_get_time,last_back_time;
                    if(!!~[47669,47543,47509,47251].indexOf(lid)){
                        // 22点后取设备，12点前还设备
                        last_get_time = 22;
                        last_back_time = 12;
                        $('.travelDaysHelpBlock').text('当天晚22:00以后取设备，或中午12:00前还设备，不计算天数');
                    }else if(!!~[47897,47937,47931,47951,47956,48488,48504,47954].indexOf(lid)){
                        // 22点后取设备，3点前还设备
                        last_get_time = 22;
                        last_back_time = 3;
                        $('.travelDaysHelpBlock').text('当天晚22:00以后取设备，或早3:00前还设备，不计算天数');
                    }else if(!!~[47743,47827].indexOf(lid)){
                        // 22点后取设备，3点前还设备
                        last_get_time = last_back_time = undefined;
                    }

                    var s = $travelDateStart.val(),
                        e = $travelDateEnd.val(),
                        st = $travelTimeStart.val(),
                        et = $travelTimeEnd.val();
                    // 数据过滤处理
                    st = st ? /(\d{1,2}):00/.exec(st)[1] : undefined;
                    et = et ? /(\d{1,2}):00$/.exec(et)[1] : undefined;
                    if(s && e && st && et){
                        var d = self.dealDateMinus(s, e);

                        // 处理不记录一天的情况
                        if(last_get_time && st >= last_get_time)d--;
                        if(last_back_time && et <= last_back_time)d--;
                        if(d <= 0)d = 1;

                        // 赋值及回显
                        $('#amount').val(d);
                        $('#amount').change();
                        // 价格回显
                        self.getPrice(1);
                    }
                }

                // 绑定处理合并日期时间处理事件
                // 如果是单日价格
                if(ifCustomView == 1){
                    $('.custom-view-wifi').find('input,select').off('change').on('change', function(){
                        var _id = $(this).attr('id');
                        var flag;
                        if(/Start$/g.test(_id)){
                            flag = 'Start';
                        }else if(/End$/.test(_id)){
                            flag = 'End';
                        }

                        if(flag){
                            var d = $('#travelDate'+flag).val();
                            var t = $('#travelTime'+flag).val();
                            if(d && t){
                                $('#contactTravelTime'+flag).val(d+'&&'+t);
                            }
                        }

                        dateDeal();
                    });
                }else{
                    $('.custom-view-wifi').find('input,select').off('change');
                }

                // 旅行时间限制
                $travelDateStart.attr('min', self.dealTimeAdd(new Date(), ~~myVar.order_adv_days + 1));
                $travelDateEnd.attr('min', self.dealTimeAdd(new Date(), ~~myVar.order_adv_days + 3));
                $travelDateStart.on('change',function(){
                    $travelDateEnd.attr('min', self.dealTimeAdd($(this).val(),2));
                });
                $travelDateEnd.on('change',function(){
                    $travelDateStart.attr('max', self.dealTimeAdd($(this).val(),0));
                });
            }else if(ifCustomView == '3'){
                $('#itemDepartBarBar').hide();

                // 处理成人数变化
                $('#amountNumBox').find('span').removeClass('disable');
                $('#amountNumBox').find('#amount').attr('readonly', false);
            }else if(ifCustomView == '4'){
                self.hideTimeAndPlace('hide');
            }else{
                // 处理成人数变化
                $('#amountNumBox').find('span').removeClass('disable');
                $('#amountNumBox').find('#amount').attr('readonly', false);
            }
        },
		getStamp:function(){
			return (new Date()).valueOf()+'';
		},

		setCurr: function(c) {
			// debugger
			//无日期状态c={"date":"00","price":"200.00","stock":10,"days":"0","cid":"792943","type":"1","room_diff":"0.00","room_type":"0","buy_limit":"0","canorder":false}
			//有日期状态选择日期后c={buy_limit:"0",canorder:true,cid:"1744630",date:"2015-07-11",month:"2015-07",price:"2599.00",remain:"2",room_diff:"0.00",room_type: "1",stock:"2"}
			//有日期状态没选择日期时c=null
			var that = this;
			this._curr = c;
			if (this._curr === null) {
				// 有日期的状态，但是没有选具体日期时
				// 出发日期input置空
				$('#depart').val('');
				// 隐藏域lmcid置空
				$('#lmcid').val('');
				// 成人数量初始化
				$('#amount').val(1);
				$('#amountNumBox .subtract').addClass('disable');
				$('#amountNumBox .add').addClass('disable');
				// 算总价放隐藏域中
				this.getPrice(1);
				return false;
			}

			// 有日期状态并选择日期后，执行这里
			// 无日期状态的产品，也执行这里
			if (c.buy_limit > 0) {
				// 如果限购,用具体某种产品或某日的产品的cid给后台
				// console.log(c);
				this._curr.usernum = parseInt(c.already_buy);
				// 历史购买数为undefined或者为0时，都为零
				// this._curr.usernum = this._curr.usernum || 0;
				// 本次限购数=限购数-历史购买数
				var limitNum = parseInt(this._curr.buy_limit)-parseInt(this._curr.usernum);
				this._curr.limitNum = limitNum;//限购时用户可购买数，加入this._curr中
				// 初始化成人数
				this.initPerson(limitNum);
			}else{
				// console.log("不限购");
				// 不限购，初始化成人数
				this.initPerson(this._curr.stock);
			}
			// 隐藏域lmcid放选中商品的cid
			$("#lmcid").val(this._curr.cid);

			// 算总价放隐藏域中
			this.getPrice(1);
			return this;
		},
		initPerson:function(num) {
			// 选择具体的产品后，初始化成人数
			var $amount = $('#amount');
			var $amountSub = $('#amountNumBox .subtract');
			var $amountAdd = $('#amountNumBox .add');
			if(num>1){
				$amount.val(1);
				$amountSub.addClass('disable');
				$amountAdd.removeClass('disable');
			}else if(num==1){
				$amount.val(1);
				$amountSub.addClass('disable');
				$amountAdd.addClass('disable');
			}else if(num==0){
				$amount.val(0);
				$amountSub.addClass('disable');
				$amountAdd.addClass('disable');
				$('#roomNumBar').hide();
			}
		},
		getCurr: function() {
			return this._curr;
		},
		getPrice: function(rVal) {
			var price = 0;
			if (this._curr !== null) {
				// 算总价
				var amount = parseInt($("#amount").val());//成人数
				price = parseFloat(amount * this._curr.price);//总价=成人数*单价
				var type = parseInt(this._curr.room_type);//房间类型几人间
				var diff = parseFloat(this._curr.room_diff);//单房差

				if (this._curr.room_type && this._curr.room_diff) {
					rVal = parseInt(rVal);//房间数
					// 有房间类型和单方差价的时候求莫计算单方差价然后加入到总价钱中
					var roomOffset = ((rVal * type) - amount) * diff;
					this.setRoomOffset(roomOffset);
					price += roomOffset;
				}
				price = Math.round((price*100))/100;
			}
			// 隐藏域lmTotPrice放总价格
			$("#lmTotPrice").val(price);
			$("#lmTotPrice").triggerHandler("change");
		},
		setRoomOffset:function(roomOffset){//判断单方差是否为零是否显示提示
			if(roomOffset>0){
				$('#roomOffset').show().find('span').html("¥"+roomOffset);
				$('#roomOffsetBar2').show();
				$('#roomOffset2').html(roomOffset);
			}else{
				$('#roomOffset').hide();
				$('#roomOffsetBar2').hide();
			}
		},
		evt_pop_back:function(){
			this.pop.hide();
		},
		evt_pop_pass_back:function(aEvt){//编辑常用旅客信息弹层和添加新旅客信息弹层的返回按钮
			var $this,back,type;

			$this = $(aEvt.currentTarget);
			back = $this.attr('data-goback');
			// 取弹层标题
			type = $this.parents('.pop-info-wrap').attr('data-popname');

			this.pop.hide();

			if(back&&back=="1"){
				// 页面list中添加新旅客
				this.evt_addPassenger_click();
			}

			$this=back=null;
		},
		evt_pop_pass_confirm:function(aEvt){//添加新旅客的弹出层的确定按钮
			var unit,error,name,goback,$this,$li,option,data;

			$this = $(aEvt.currentTarget);
			unit = $('.passenger-list li');//弹层中放表单的dom
			error = this.util.passengerValidate(unit);//对表单中input输入框正则验证，有误时返回true

			if(error){//如果有误，出提示
				require(['slidTip'], function(aSlidTip) {
					aSlidTip.show({
						type:5,
						text:"信息填写有误，请核查！"
					});
				});
			}else{
				// 如果无误
				name = $this.parents('.pop-info-wrap').attr('data-popName');//取弹层标题
				data = this.util.getAjaxData(unit);
				data.id = unit.attr('data-id');

				switch(name){
					case '添加新旅客':
						option = {
							id:data.id,//用户id
							stamp:this.getStamp(),//时间戳
							index:this.passLen,//页面中旅客list长度
							data:data
						}
						this.util.addNewPagePassenger(option);
						this.passLen += 1;
						break;
					case '编辑旅客信息':
						//取表单dom中时间戳标记
						data.stamp = unit.attr('data-stamp');
						var $li,$pbox;

						// 用时间戳找到隐藏list和页面list中此条旅客信息dom
						$li = $('.hidden-pass-list li[data-stamp="'+data.stamp+'"]');
						$pbox = $('.passenger-box[data-stamp="'+data.stamp+'"]');

						$li.replaceWith(unit);// 将隐藏list中此条目替换成弹层中的表单dom
						this.util.updatePassName($pbox,data);//传入页面list中此条旅客信息dom和新的旅客数据，向页面list中更新或插入一条信息

						$li=$pbox=null;
						break;
				}
				this.pop.hide();
			}
			unit=error=name=goback=$this=$li=option=null;
		},
		evt_pop_comm_confirm:function(aEvt){//常用旅客信息弹层右上角的完成按钮
			var that,$this,num,len,$checkbox,$checkedPassenger;
			that = this;
			$this = $(aEvt.currentTarget);

			// checkbox的list
			$checkbox = $('.pop-passenger-list li .input-passenger');
			// 选中的checkbox的list
			$checkedPassenger = $('.pop-passenger-list li .input-passenger:checked');
			num = parseInt($('#amount').val());//成人的数量
			len = $('.passenger-name-list li').length;//页面中旅客列表的数量
			data = [];

			// 遍历checkbox列表
			$checkbox.each(function(i){
				var id = $(this).attr('data-id');
				var $li = $('.passenger-name-list .passenger-box[data-id="'+id+'"]');
				if($li.length > 0){
					// 页面中旅客列表中有
					if(!$(this).prop('checked')){
						// 不是选中状态减1
						len -= 1;
					}
				}else{
					// 页面中旅客列表中没有
					if($(this).prop('checked')){
						// 是选中状态加1
						len += 1;
					}
				}
			})

			if(len > num){
				require(['slidTip'], function(aSlidTip) {
					aSlidTip.show({
						type:5,
						text:"旅客人数超出！"
					});
				});
				return false;
			}

			// 如果checkbox的列表中有选中的条目
			if($checkedPassenger.length > 0){
				// 遍历checkbox列表
				$checkbox.each(function(i){
					var id = $(this).attr('data-id');
					var $li = $('.passenger-name-list .passenger-box[data-id="'+id+'"]');
					if($(this).prop('checked')){
						// 当前checkbox被选中时
						if($li.length <= 0){
							// 页面中旅客列表里没有此条目时，从后台给的旅客列表数据中找到这条数据
							data.push(that.util.getPassSingelData(passenger,id));
						}
					}else{
						// 当前checkbox没被选中时，从页面中旅客列表中删除此条数据
						that.util.delPagePassenger(id);
					}
				});

				for(var i=0,len=data.length;i<len;i++){
					var option = {
						id:data[i].id,//用户id
						stamp:this.getStamp(),//时间戳标记
						index:this.passLen,
						data:data[i]//此条数据
					}
					this.util.addNewPagePassenger(option);
					this.passLen += 1;
					option = null;
				}
				that.pop.hide();
			}else{
				require(['slidTip'], function(aSlidTip) {
					aSlidTip.show({
						type:5,
						text:"请选择旅客信息！"
					});
				});
			}
			that=$this=num=len=$checkedPassenger=null;
		},
		//保存旅客信息ajax
	    savePassengerAjax:function(aOption){
	        // !true, aOption.testData = {"error_code":0,"result":'ok',"data":{
	        //     id:'50'
	        // }};
	        aOption.posturl = this.ajaxUrl.savePassUrl;
	        qyerUtil.doAjax(aOption);
	    },
	    do_savePassengerAjax:function(aData,aCallback){//执行填写信息的ajax
	        var that = this;
	        this.savePassengerAjax({
	            data:aData,
	            onSuccess:function(aJSON){
	            	// 后台返回数据并且数据中有用户id
	                if(aJSON.data&&aJSON.data.id){
	                    aData.id = aJSON.data.id;

	                    passenger = that.util.updatePassengerModel(passenger,aData);// 得到更新后的[所有旅客的数据]
	                    require(['slidTip'], function(aSlidTip) {
							aSlidTip.show({
								type:1,
								text:"保存成功！"
							});
						});
	                    if($.isFunction(aCallback)) aCallback(aData);//是函数，执行回调函数
	                }else{
	                	// 后台没有返回数据或者数据中没有用户id
	                	require(['slidTip'], function(aSlidTip) {
							aSlidTip.show({
								type:5,
								text:"数据错误！"
							});
						});
	                }
	            },
	            onError:function(aJSON){
	                if(aJSON.__server_error__){
	                	require(['slidTip'], function(aSlidTip) {
							aSlidTip.show({
								type:5,
								text:'服务器错误，请稍后再试！'
							});
						});
	                    // that.showTip('服务器错误，请稍后再试！');
	                }else{
	                	require(['slidTip'], function(aSlidTip) {
							aSlidTip.show({
								type:5,
								text:aJSON.data.msg||'未知错误'
							});
						});
	                }
	            }
	        });
	    },
		evt_pop_savePass:function(aEvt){//点击编辑常用旅客信息弹层下方的保存按钮*保存为常用旅客信息
			var $this,unit,error,data,id,that;

			$this = $(aEvt.currentTarget);
			if($this.hasClass('disable')){
				return;
			}
			that = this;
			unit = $('.passenger-list li');//弹层中放表单的dom
			// 对表单中input输入框正则验证，有误时返回true
			error = this.util.passengerValidate(unit);
			$this.addClass('disable');//禁用保存按钮

			if(error){
				//如果有误，出提示
				require(['slidTip'], function(aSlidTip) {
					aSlidTip.show({
						type:5,
						text:"信息填写有误，请核查！"
					});
				});
				$this.removeClass('disable');//可用保存按钮
			}else{
				// 如果无误
				id = $this.attr('data-id')||'0';//取旅客id

				data = this.util.getAjaxData(unit);// 得到表中的信息组成的{名值对}
				data.id = id;//把旅客id放进{名值对}中
				this.do_savePassengerAjax(data,function(aData){
					// ajax后的回调函数
					var id,text,$pbox,$li;

					id = data.id;
					// 取弹层的标题
					text = $('.pop-info-wrap').attr('data-popname');
					// 用弹层中取的旅客id，找到页面中旅客list中的此条信息dom
					$pbox = $('.passenger-box[data-id="'+id+'"]');
					// 用ajax返回的{旅客数据}中的旅客id，找到隐藏list中的此条信息dom
					$li = $('.hidden-pass-list li[data-id="'+aData.id+'"]');

					if(text == '编辑常用旅客信息'){
						if($pbox.length>0){
							// 页面中旅客list有此条信息
							that.util.updatePassenger($li,data);//更新隐藏list中的此条数据
							that.util.updatePassName($pbox,data);//更新或添加页面list中的此条数据
						}
					}
					$this.removeClass('disable');//保存按钮可用
					id=text=$pbox=$li=null;
				});
			}
		},
		evt_pop_addPass:function(aBack){//常用旅客信息弹层中的添加新旅客按钮
			var index,that,num,len,option1,option2;

			that = this;
			// 取成人的数量
			num = parseInt($('#amount').val());
			// 取页面中旅客列表的数量
			len = $('.passenger-name-list li').length;

			if(len >= num){
				// 页面list数量大于成人数量，提示人数超出
				require(['slidTip'], function(aSlidTip) {
					aSlidTip.show({
						type:5,
						text:"旅客人数超出！"
					});
				});
				return;
			}
			// 隐藏list中最后一条数据的标记号(数字)加1
			index = parseInt($('.hidden-pass-list li:last').attr('data-index'))+1 || 0;
			option1 = {
				stamp:this.getStamp(),//用时间戳的字符串形式做标记
				index:index// 隐藏list中最后一条数据的标记号(数字)加1
			}
			option2 = {
				id:0,
				goback:aBack?aBack:"",//参数
				logoText:"添加新旅客"
			}
			// 组建并显示添加新旅客弹层
			this.util.showPopPassenger("添加新旅客",this.pop,option1,option2);
			index=that=num=len=option1=option2=null;
		},
		evt_addPassenger_click:function(aEvt){//页面上添加新旅客
			var num,len,id,option;

			num = parseInt($('#amount').val());
			len = $('.passenger-name-list li').length;
			if(len >= num){
				require(['slidTip'], function(aSlidTip) {
					aSlidTip.show({
						type:5,
						text:"旅客人数超出！"
					});
				});
				return;
			}

			if(passenger&&passenger.length > 0){
				// 后台放在页面中的旅客信息存在并且有值
				id = [];
				// 遍历隐藏list取旅客id放空数组id中
				$('.hidden-pass-list li').each(function(i){
					id.push($(this).attr('data-id'));
				});

				option = {
					id:id,
					data:passenger
				}
				// 构建并显示常用旅客信息弹层
				this.util.showCommonPassenger(this.pop,option);
			}else{
				// 没有后台放在页面中的旅客信息
				this.evt_pop_addPass();
			}
			num=len=id=option=null;
		},
		evt_pop_edit_comm_pass:function(aEvt){//编辑常用旅客信息
			var $this,stamp,id,option1,option2;

			$this = $(aEvt.currentTarget);
			id = $this.attr("data-id");
			$li = $('.hidden-pass-list li[data-id="'+id+'"]');

			if($li.length > 0){
				stamp = $li.attr('data-stamp');
				option1 = {
					stamp:stamp
				};
				option2 = {
					id:id,
					goback:"1",
					logoText:"编辑常用旅客信息"
				}

				this.util.showPopPassenger("编辑旅客信息",this.pop,option1,option2);
			}else{
				option1 = {
					id:id,
					index:0,
					data:this.util.getPassSingelData(passenger,id)
				}
				option2 = {
					id:id,
					goback:"1",
					logoText:"编辑常用旅客信息"
				}
				this.util.showPopPassenger("编辑常用旅客信息",this.pop,option1,option2);
			}
		},
		evt_edit_passenger:function(aEvt){//页面上的编辑旅客信息
			var $this,stamp;

			$this = $(aEvt.currentTarget);
			stamp = $this.attr('data-stamp');
			id = $this.attr('data-id')||0;

			if($(aEvt.target).hasClass('js-show-del-btn') || $(aEvt.target).hasClass('icon-del')){
				return false;
			}
			option1 = {
				stamp:stamp
			};
			option2 = {
				id:id,
				logoText:"编辑旅客信息"
			}

			this.util.showPopPassenger("编辑旅客信息",this.pop,option1,option2);
			$this=stamp=null;
		},
		evt_pop_passTip:function(){//点击编辑旅客信息弹层(三个弹层都有)中证件类型旁边的icon
			var html;
			html = this.util.getPassengerTip();
			$('body').append(html);
		},
		evt_pop_close_passTip:function(){//关闭证件类型说明弹层
			$('.pop-pass-tip').remove();
		},
		del_passenger:function(aId,aConf){//页面list和隐藏list是否删除此条信息
			var r;

			if(aConf){
				r = confirm('确定要删除此联系人吗？');
				if(r){
					// 隐藏弹层列表中的节点删除
					$('.hidden-pass-list li[data-stamp="'+aId+'"]').remove();
					// 页面上旅客列表中的节点删除
					$('.passenger-name-list li[data-stamp="'+aId+'"]').remove();
				}
			}else{
				$('.hidden-pass-list li[data-stamp="'+aId+'"]').remove();
				$('.passenger-name-list li[data-stamp="'+aId+'"]').remove();
			}
			r=null;
		},
		evt_showdelBtn_click:function(aEvt){//删除页面list中某条信息
			var $passenger,stamp;

			// 找到删除按钮的父辈li
			$passenger = $(aEvt.currentTarget).parents(".passenger-box");
			// 取属性中的时间戳
			stamp = $passenger.attr('data-stamp');
			//页面list和隐藏list是否删除此条信息
			this.del_passenger(stamp,true);
			$passenger=stamp=null;
		},
		evt_pop_input_focus:function(aEvt){//当弹层中的input输入框得到焦点时，去掉红色警告样式
	        var $this = $(aEvt.currentTarget);
	        $this.removeClass('warnning');
	    },
	    evt_pop_input:function(aEvt){//给弹层中的input输入框绑定，点击时让此input得到焦点
	    	var $this = $(aEvt.currentTarget);
	        $this.focus();
	    },
		evt_combo_click:function(aEvt){//套餐选择
			var $this = $(aEvt.currentTarget);
			this.proxy.triggerHandler('reset_coupons_val');
			if(!$this.hasClass('readonly') && !$this.hasClass('noStart') && !$this.hasClass('selected')){
				// 如果不是只读状态 && 不是未开始状态 && 不是已选中状态
				// 去除上一个选中项目的样式
				$this.parent().find('.selected').removeClass('selected');
				// 给刚刚选中的项目加样式
				$this.addClass('selected');
				// 取产品pid
				var pid = $this.attr("data-pid");
				// 纪录到隐藏域中
				$("#lmpid").val(pid);
				var that = this;

				// 将选择类目之后的操作封装起来 @junbo
				function action() {
					for(var i in that.data[pid]) {
						if (i == 'noDate') {
							// 无日期状态*日期隐藏
							$('#itemDepartBarBar').hide();
							// ajax返回的noDate字段是数组
							var c = that.data[pid]['noDate'][0];
							that.setCurr(c);
							// 旅客信息标题*隐藏
							$('.passenger-info-title').hide();
							// 旅客信息内容*隐藏
							$('.passenger-info-wrapper').hide();
							// 房间数量区域*隐藏
							$('#roomNumBar').hide();
						} else {
							// 有日期状态*日期区域显示
							$('#itemDepartBarBar').show();
							// 旅客信息标题*显示
							$('.passenger-info-title').show();
							// 旅客信息内容*显示
							$('.passenger-info-wrapper').show();
							// 房间数量区域*隐藏
							$('#roomNumBar').hide();
							that.setCurr(null);
						}
					}

					return false;

					if($this.attr('data-setoff') == '0'){
						$('#itemDepartBarBar').hide();
						$('.lmOrderForm .itemPrice .price em').text($this.attr('data-price'));
						$('.lmOrderBtns .price em').text('¥'+$this.attr('data-price')).attr('data-totle',$this.attr('data-price'));
						$('#amount').attr('max',$this.attr('data-remain')).val(1);
						$('#lmcid').val($this.attr('data-cid'));
						$('#lmTotPrice').val($this.attr('data-price'));
					}else{
						$('#itemDepartBarBar').show();
						$('.lmOrderForm .itemPrice .price em').text('0');
						$('.lmOrderBtns .price em').text('¥0').attr('data-totle','0');
						$('#depart').val('');
						$('#amount').attr('max','1').val(1);
						$('#lmcid').val('');
						$('#lmTotPrice').val('');
					}
				}

				// 根据产品pid，判断data{}中是否有此套餐的日期数据{pid:{数据}}
				if (!that.data[pid]) {
					qyerUtil.doAjax({
						posturl:"/z/?action=ajaxGetCategory",
						data:{pid:pid},
						// minResponseTime:3000,
		                __qFED__:{//在非static.qyer.com域名下该项无效
		                     id:"127537c-ccfc-c2b-458b-d3ee13cfeffd",//对应在API测试中的接口
		                     dataIndex:0,    //对应到测试数据的索引
		                     randomData:true    //随机数据，设定此项为 true 后，dataIndex 将不再起作用
		                },
		                onSuccess:function(aJSON){
		                	that.data[pid] = aJSON.data;
		                	action();

		                	for(var i in that.data[pid]) {
								if (i == 'noDate') {
									// 无日期状态*日期隐藏
									$('#itemDepartBarBar').hide();
									// ajax返回的noDate字段是数组
									var c = that.data[pid]['noDate'][0];
									that.setCurr(c);
									// 旅客信息标题*隐藏
									$('.passenger-info-title').hide();
									// 旅客信息内容*隐藏
									$('.passenger-info-wrapper').hide();
									// 房间数量区域*隐藏
									$('#roomNumBar').hide();
								} else {
									// 有日期状态*日期区域显示
									$('#itemDepartBarBar').show();
									// 旅客信息标题*显示
									$('.passenger-info-title').show();
									// 旅客信息内容*显示
									$('.passenger-info-wrapper').show();
									// 房间数量区域*隐藏
									$('#roomNumBar').hide();
									that.setCurr(null);
								}
							}
                            // 城市玩乐-wifi类目-特殊限定
                            that.customView();

							return false;

							if($this.attr('data-setoff') == '0'){
								$('#itemDepartBarBar').hide();
								$('.lmOrderForm .itemPrice .price em').text($this.attr('data-price'));
								$('.lmOrderBtns .price em').text('¥'+$this.attr('data-price')).attr('data-totle',$this.attr('data-price'));
								$('#amount').attr('max',$this.attr('data-remain')).val(1);
								$('#lmcid').val($this.attr('data-cid'));
								$('#lmTotPrice').val($this.attr('data-price'));
							}else{
								$('#itemDepartBarBar').show();
								$('.lmOrderForm .itemPrice .price em').text('0');
								$('.lmOrderBtns .price em').text('¥0').attr('data-totle','0');
								$('#depart').val('');
								$('#amount').attr('max','1').val(1);
								$('#lmcid').val('');
								$('#lmTotPrice').val('');
							}
		                },
		                onError:function(aJSON){
		                    if(aJSON.__server_error__){
		                    	require(['slidTip'], function(aSlidTip) {
									aSlidTip.show({
										type:5,
										text:"服务器错误，请稍后再试！"
									});
								});
		                        // that.showTip('服务器错误，请稍后再试！');
		                    }else{
		                        require(['slidTip'], function(aSlidTip) {
									aSlidTip.show({
										type:5,
										text:aJSON.data.msg||'未知错误'
									});
								});
		                    }
		                }
					});
				} else {
					action();

                    // 城市玩乐-wifi类目-特殊限定
                    that.customView();
				}
			}
		},
		change_identityType:function(aEvt){// 当弹层中的证件类型下拉菜单select发生变化时
			//根据不同选项，设置证件号码、签发地、有效期的input不同状态
	        var $this,num,$input;
	        $this = $(aEvt.currentTarget);
	        // 找到证件号码、证件签发地、证件有效期的dom
	        $input = $this.parents('li').find('.identityNumber,.identityPlace,.identityValidity');
	        // 取selected选中项的值
	        num = $this.find('option:selected').val();
	        // 在证件号码input中更新data-validatetype属性
	        $this.parents('.pass-table-cell').find('.identityNumber').attr('data-validatetype',('identityType'+num));

	    	if(num == "99"){
	    		// 如果选择其他或忘记证件号码，去掉必填标记，禁用input，变为只读状态
	    		$input.val('').removeClass('required').addClass('disable').prop('readonly',true);
	    	}else{
	    		$input.val('').addClass('required').removeClass('disable').prop('readonly',false);
	    	}
	    },
		evt_add_click:function(aEvt){//成人的数值增加按钮
            // 如果按钮已灰则返回
            if($(aEvt.target).hasClass('disable'))return;

			if (this._curr === null) {
				// 如没有选择具体日期，就会无数据，提示请选择日期
				var msg = $('.itemType .combo').filter(".selected").length > 0 ? "请选择产品出发日期" : "请选择产品";
				ordermsg(msg);
				return false;
			}
			var $amount = $('#amount');
			var $roomNum = $('#roomNum');
			if (this._curr.stock <= parseInt($amount.val())) {
				// 成人数大于等于库存
				if(parseInt($amount.val())>1){
					// 成人数>1,减号可点，加号不可点
					$('#amountNumBox .subtract').removeClass('disable');
					$('#amountNumBox .add').addClass('disable');
				}else if(parseInt($amount.val())==1){
					// 成人数=1,减号不可点，加号不可点
					$('#amountNumBox .subtract').addClass('disable');
					$('#amountNumBox .add').addClass('disable');
				}
				ordermsg("您选择的商品数量已不足");
				return false;
			}
			if (this._curr.buy_limit > 0 && this._curr.buy_limit - this._curr.usernum <= parseInt($amount.val())) {
				// 如果限购&&成人数>=用户可购买数
				if(parseInt($amount.val())>1){
					// 成人数>1，减号可点，加号不可点
					$('#amountNumBox .subtract').removeClass('disable');
					$('#amountNumBox .add').addClass('disable');
				}else if(parseInt($amount.val())==1){
					// 成人数=1，减号不可点，加号不可点
					$('#amountNumBox .subtract').addClass('disable');
					$('#amountNumBox .add').addClass('disable');
				}
				ordermsg("您选择的商品数量超出了购买限制，每个ID限购" + this._curr.buy_limit + "个")
				return false;
			}

			var val = parseInt($amount.val(),10);
			// 成人数加1
			$('#amount').val(val + 1);
			if(parseInt($amount.val())>1 && this._curr.stock <= parseInt($amount.val())){
				// 成人数>1&&成人数>=库存，减号可点，加号不可点
				$('#amountNumBox .subtract').removeClass('disable');
				$('#amountNumBox .add').addClass('disable');
			}else if(parseInt($amount.val())>1 && this._curr.stock > parseInt($amount.val())){
				// 成人数>1&&成人数<库存，减号可点，加号可点
				$('#amountNumBox .subtract').removeClass('disable');
				$('#amountNumBox .add').removeClass('disable');
			}
			// 房间数变化
			// 房间数的最小值,成人数/房型
			var minRoomNum = parseInt(this._curr.room_type)>0?Math.ceil(parseInt($amount.val())/parseInt(this._curr.room_type)):0,
				maxRoomNum = parseInt($amount.val()) || 0,
				rVal = parseInt($roomNum.val()) || 0;

			if($roomNum.val()<minRoomNum){
				// 房间数<最小值,房间数加1
				rVal = rVal+1;
				$roomNum.val(rVal);
				if(rVal==maxRoomNum){
					// 房间数=最大值，减号不可点，加号不可点
					$('#roomNumBox .subtract').addClass('disable');
					$('#roomNumBox .add').addClass('disable');
				}else if(rVal<maxRoomNum){
					// 房间数<最大值，减号不可点，加号可点
					$('#roomNumBox .subtract').addClass('disable');
					$('#roomNumBox .add').removeClass('disable');
				}
			}else if(rVal==minRoomNum){
				// 房间数=最小值&&房间数<最大值
				$('#roomNumBox .subtract').addClass('disable');
				$('#roomNumBox .add').removeClass('disable');
			}else{
				// 房间数>最小值&&房间数小于最大值
				$('#roomNumBox .subtract').removeClass('disable');
				$('#roomNumBox .add').removeClass('disable');
			}
			this.getPrice(rVal);
		},
		evt_subtract_click:function(aEvt){//成人的数值减少按钮
			if (this._curr === null) {
				// 如没有选择具体日期，就会无数据，提示请选择日期
				var msg = $('.itemType .combo').filter(".selected").length > 0 ? "请选择产品出发日期" : "请选择产品";
				ordermsg(msg);
				return false;
			}
			var $amount = $('#amount');
			var $roomNum = $('#roomNum');
			var val = parseInt($amount.val(),10);
			// 成人数已经<=1，不可再减少
			if (val <= 1) return false;

			$amount.val(val - 1);
			if(parseInt($amount.val())>1){
				// 成人数>1
				$('#amountNumBox .subtract').removeClass('disable');
				$('#amountNumBox .add').removeClass('disable');
			}else if(parseInt($amount.val())==1){
				// 成人数=1
				$('#amountNumBox .subtract').addClass('disable');
				$('#amountNumBox .add').removeClass('disable');
			}
			// 房间数变化
			// 房间数的最小值,成人数/房型
			var minRoomNum = parseInt(this._curr.room_type)>0?Math.ceil(parseInt($amount.val())/parseInt(this._curr.room_type)):0,
				maxRoomNum = parseInt($amount.val()) || 0,
				rVal = parseInt($roomNum.val()) || 0;
			if(rVal>maxRoomNum){
				// 房间数>最大值,房间数减1
				rVal = rVal-1;
				$roomNum.val(rVal);
				if(rVal==minRoomNum){
					// 房间数=最大值&&房间数=最小值，减号不可点，加号不可点
					$('#roomNumBox .subtract').addClass('disable');
					$('#roomNumBox .add').addClass('disable');
				}else if(rVal>minRoomNum){
					// 房间数=最大值&&房间数>最小值，减号可点，加号不可点
					$('#roomNumBox .subtract').removeClass('disable');
					$('#roomNumBox .add').addClass('disable');
				}
			}else if(rVal==maxRoomNum){
				if(rVal==minRoomNum){
					// 房间数=最大值&&房间数=最小值，减号不可点，加号不可点
					$('#roomNumBox .subtract').addClass('disable');
					$('#roomNumBox .add').addClass('disable');
				}else if(rVal>minRoomNum){
					// 房间数=最大值&&房间数>最小值
					$('#roomNumBox .subtract').removeClass('disable');
					$('#roomNumBox .add').addClass('disable');
				}
			}else{
				if(rVal>minRoomNum){
					// 房间数<最大值&&房间数>最小值
					$('#roomNumBox .subtract').removeClass('disable');
					$('#roomNumBox .add').removeClass('disable');
				}else if(rVal==minRoomNum){
					// 房间数<最大值&&房间数=最小值
					$('#roomNumBox .subtract').removeClass('disable');
					$('#roomNumBox .add').addClass('disable');
				}
			}
			this.getPrice(rVal);
			this.proxy.triggerHandler('reset_coupons_val');
		},
		evt_rAdd_click:function(aEvt){//房间的数值增加按钮
			if (this._curr === null) {
				// 如没有选择具体日期，就会无数据，提示请选择日期
				var msg = $('.itemType .combo').filter(".selected").length > 0 ? "请选择产品出发日期" : "请选择产品";
				ordermsg(msg);
				return false;
			}
			var $amount = $('#amount'),
				$roomNum = $('#roomNum'),
				minRoomNum = parseInt(this._curr.room_type)>0?Math.ceil(parseInt($amount.val())/parseInt(this._curr.room_type)):0,
				maxRoomNum = parseInt($amount.val()) || 0,
				rVal = parseInt($roomNum.val()) || 0;
			rVal++;
			if(rVal>maxRoomNum){
				// 房间数>最大值,提示
				ordermsg("房间数已到上限");
				return false;
			}else if(rVal==maxRoomNum){
				// 房间数=最大值
				$roomNum.val(rVal);
				$('#roomNumBox .add').addClass('disable');
				$('#roomNumBox .subtract').removeClass('disable');
			}else{
				// 房间数<最大值
				$roomNum.val(rVal);
				$('#roomNumBox .add').removeClass('disable');
				$('#roomNumBox .subtract').removeClass('disable');
			}
			// $('#roomNumBox .subtract').removeClass('disable');
			this.getPrice(rVal);
		},
		evt_rSubtract_click:function(aEvt){//房间的数值少按钮
			if (this._curr === null) {
				// 如没有选择具体日期，就会无数据，提示请选择日期
				var msg = $('.itemType .combo').filter(".selected").length > 0 ? "请选择产品出发日期" : "请选择产品";
				ordermsg(msg);
				return false;
			}
			var $amount = $('#amount');
			var $roomNum = $('#roomNum');
			var minRoomNum = Math.ceil(parseInt($amount.val())/this._curr.room_type);
			var maxRoomNum = parseInt($amount.val());
			var rVal = parseInt($roomNum.val());
			rVal--;
			if(rVal<minRoomNum){
				// 房间数<最小值,提示
				ordermsg("房间数已达最小值");
				return false;
			}else if(rVal==minRoomNum){
				// 房间数=最小值
				$roomNum.val(rVal);
				$('#roomNumBox .subtract').addClass('disable');
				$('#roomNumBox .add').removeClass('disable');
			}else{
				// 房间数>最小值
				$roomNum.val(rVal);
				$('#roomNumBox .subtract').removeClass('disable');
				$('#roomNumBox .add').removeClass('disable');
			}
			this.getPrice(rVal);
			this.proxy.triggerHandler('reset_coupons_val');
		},
		evt_submitOrder_click:function(aEvt){//提交订单按钮
            var originOperator = function(){
    			var errorText,inputerror,errorArr,$hiddenUl,_this;

    			_this = this;
    			$hiddenUl = $('.hidden-pass-list');//隐藏list的dom
    			errorText = '';
    			selectedP = $('.itemType .selected');//选中的套餐的dom

    			if(!$('#clause').prop('checked')){
    				// 如果没有勾选同意穷游条款
    				errorText += "请阅读并同意《穷游预订条款》、";
    			}
    			if(selectedP.length == 0 && errorText == ""){
    				// 如果没有选中任何套餐
    				errorText += "请选择产品类型、";
    			}

    			if($('#itemDepartBarBar:visible').length > 0 && $("#depart").val() == '') {
    				// 日期区域显示并且有值
    				errorText += "请选择产品出发日期、";
    			}

    			var $amount = $('#amount');
    			if($('.passenger-info-wrapper:visible').length > 0 && $hiddenUl.length > 0){
    				// 如果点击添加旅客的区域是可见的并且隐藏list的ul存在
    				if( $hiddenUl.find('li').length != parseInt($amount.val()) && parseInt($amount.val()) !=0 ){
    					// 如果隐藏list中的人数与成人数不一致&&成人数不为0
    					errorText += "旅客信息数量与预定数量不相等、";
    				}else if($hiddenUl.find('li').length <=0 && parseInt($amount.val()) !=0 ){
    					errorText += "请填写旅客信息、";
    				}
    			}

    			if (errorText == "" && _this._curr.stock < parseInt($amount.val())) {
    				// 如果无错误&&库存<成人数量
    				errorText += "您选择的商品数量已不足、";
    			}
    			if (errorText == "" && _this._curr.buy_limit > 0 && this._curr.buy_limit - this._curr.usernum < parseInt($amount.val())) {
    				// 如果无错误 && 限购数量>0 && 限购数量-此人以前买过此产品的数量<成人数量
    				errorText += "您选择的商品数量超出了购买限制，每个ID限购" + this._curr.buy_limit + "个、";
    			}

    			inputerror = this.validate();//验证页面中的表单信息
    			if(inputerror != '' && errorText == ""){
    				errorText += '请填写正确的'+inputerror;
    			}

    			if(errorText != ''){
    				// 如果有错误
    				require(['slidTip'], function(aSlidTip) {
    					aSlidTip.show({
    						type:5,
    						text: errorText.slice(0,-1)
    					});
    				});
    			}else{
    				// 如果没错误，ajax请求后台再做验证，通过后提交表单
    				var status = '';
    				$.ajax({
    					url : "/z/orderform.php?action=checkorderformstatus",
    					data : {cid : _this._curr.cid},
    					dataType : 'json',
    					async : false,
    					success : function(json) {
    						status = json.data.form_token;
    					}
    				});

    				switch (status) {
    					case 'noinfo':
    						ordermsg("没有该产品信息");
    						break;
    					case 'wait':
    						_this.popupWait();//排队等待
    						break;
    					case 'soldout':
    						_this.popupSoldout();//售罄
    						break;
    					default:
    						$("#form_token").val(status);
    						$('#orderForm').submit();//表单提交
    						break;
    				}
    			}
            };

            // 加入820限购查询
            var _pid = $('.combo.selected').attr('data-pid');
            if(!_pid)return false;
            var self = this;
            $.ajax({
                url: '/ajax.php?action=isSignCanBuy',
                dataType: 'json',
                data: {pid:_pid},
                type: 'post',
                success: function(rs){
                    var info = rs.data;
                    if(rs.error_code === 2){
                        // 打卡次数不足
                        requirejs(['toast'], function(toast) {
                            toast.show({
                                type:'no-pic',
                                toastTitle:'您已打卡<span class="text-sign">'+info.signs+'</span>次',
                                toastContent:'还需打卡<span class="text-lack">'+info.lack+'</span>次才能换购此产品',
                                buttons:[
                                    {
                                        text:'去打卡',
                                        onClick:function(){
                                            // 去打卡
                                            window.open('http://m.qyer.com/z/zt/20150820daka?campaign=detail&category=820_0505dk');
                                            toast.hide();
                                        }
                                    }
                                ],
                                cancelButton:false
                            });
                        });
                    }else if(rs.error_code === 3){
                        // 已经购买过
                        requirejs(['toast'], function(toast) {
                            toast.show({
                                type:'no-pic',
                                toastTitle:'您已换购过该产品',
                                toastContent:'每款产品每个穷游ID只限购<span class="text-limit-buy">1</span>份',
                                buttons:[
                                    {
                                        text:'回大促看看',
                                        onClick:function(){
                                            // 回大促看看
                                            window.open('http://m.qyer.com/z/zt/20150820?campaign=detail&category=820_0505dk');
                                            toast.hide();
                                        }
                                    }
                                ],
                                cancelButton:false
                            });
                        });
                    }else{
                        originOperator.apply(self);
                    }
                }
            });

			var errorText,inputerror,errorArr,$hiddenUl,_this;

			_this = this;
			$hiddenUl = $('.hidden-pass-list');//隐藏list的dom
			errorText = '';
			selectedP = $('.itemType .selected');//选中的套餐的dom

			if(!$('#clause').prop('checked')){
				// 如果没有勾选同意穷游条款
				errorText += "请阅读并同意《穷游预订条款》、";
			}
			if(selectedP.length == 0 && errorText == ""){
				// 如果没有选中任何套餐
				errorText += "请选择产品类型、";
			}

			if($('#itemDepartBarBar:visible').length > 0 && $("#depart").val() == '') {
				// 日期区域显示并且有值
				errorText += "请选择产品出发日期、";
			}

			var $amount = $('#amount');
			if($('.passenger-info-wrapper:visible').length > 0 && $hiddenUl.length > 0){
				// 如果点击添加旅客的区域是可见的并且隐藏list的ul存在
				if( $hiddenUl.find('li').length != parseInt($amount.val()) && parseInt($amount.val()) !=0 ){
					// 如果隐藏list中的人数与成人数不一致&&成人数不为0
					errorText += "旅客信息数量与预定数量不相等、";
				}else if($hiddenUl.find('li').length <=0 && parseInt($amount.val()) !=0 ){
					errorText += "请填写旅客信息、";
				}
			}

			if (errorText == "" && _this._curr.stock < parseInt($amount.val())) {
				// 如果无错误&&库存<成人数量
				errorText += "您选择的商品数量已不足、";
			}
			if (errorText == "" && _this._curr.buy_limit > 0 && this._curr.buy_limit - this._curr.usernum < parseInt($amount.val())) {
				// 如果无错误 && 限购数量>0 && 限购数量-此人以前买过此产品的数量<成人数量
				errorText += "您选择的商品数量超出了购买限制，每个ID限购" + this._curr.buy_limit + "个、";
			}

			inputerror = this.validate();//验证页面中的表单信息
			if(inputerror != '' && errorText == ""){
				errorText += '请填写正确的'+inputerror;
			}

			if(errorText != ''){
				// 如果有错误
				require(['slidTip'], function(aSlidTip) {
					aSlidTip.show({
						type:5,
						text: errorText.slice(0,-1)
					});
				});
			}else{
				// 如果没错误，ajax请求后台再做验证，通过后提交表单
				var status = '';
				$.ajax({
					url : "/z/orderform.php?action=checkorderformstatus",
					data : {cid : _this._curr.cid},
					dataType : 'json',
					async : false,
					success : function(json) {
						status = json.data.form_token;
					}
				});

				switch (status) {
					case 'noinfo':
						ordermsg("没有该产品信息");
						break;
					case 'wait':
						_this.popupWait();//排队等待
						break;
					case 'soldout':
						_this.popupSoldout();//售罄
						break;
					default:
						$("#form_token").val(status);
						$('#orderForm').submit();//表单提交
						break;
				}
			}
		},
		popupWait:function(aEvt){
			var that = this;
			this.pop.show({
				type:1,
				contentHTML : that.popupWaitHtml,
				onShow:function(){
					clearTimeout(__t);
					var __t = setTimeout(function() {
						$("#submitOrder").triggerHandler(qyerUtil.EVENT.CLICK);
					}, 5000);
					$('.lmPopWrapper .lmPopInner .closeWarp').on(qyerUtil.EVENT.CLICK,function(){
						clearTimeout(__t);
						aPop.hide();
					});
				}
			});
		},
		popupSoldout:function(aEvt){
			var that = this;
			this.pop.show({
				type:1,
				contentHTML : that.popupSoldoutHtml,
				onShow:function(){
					$('.lmPopWrapper .lmPopInner a.know').on(qyerUtil.EVENT.CLICK,function(){
						aPop.hide();
					});
				}
			});
		},
		evt_itemIpt_focus:function(aEvt){//个人联系信息表单中input元素获得焦点事件
			var $this = $(aEvt.currentTarget);
			$this.removeClass('warnning');
			$this.parent().removeClass('warnning');
			$this.attr('placeholder',$this.attr('data-placeholder'));
		},
		evt_itemIpt_blur:function(aEvt){//个人联系信息表单中input元素离开焦点事件
			var $this,error;
			$this = $(aEvt.currentTarget);
			error = this.validate($this);//验证表单信息
			if(error != ''){
				$this.attr('placeholder','请填写正确的'+error);
			}
		},
		evt_textarea_click:function(aEvt){
			$('body').height($('body').height()+70)
			$('body,html').scrollTop(9999);
		},
		validate:function(el){//验证函数
			var values,error;
			error = [];
			if(el){
				switch(el.attr('id')){
					case 'contactName':
						if(/.+/.test(el.val()) == false){
							error.push('真实姓名');
							el.addClass('warnning');
							el.parent().addClass('warnning');
						}else{
							el.removeClass('warnning');
							el.parent().removeClass('warnning');
						}
						break;

					case 'contactWechat':
						if(el.val() && !/^[a-zA-Z0-9_-]{6,}$/.test(el.val())){
							error.push('微信号');
							el.addClass('warnning');
							el.parent().addClass('warnning');
						}else{
							el.removeClass('warnning');
							el.parent().removeClass('warnning');
						}
						break;

					case 'contactPhone':
						if(/^1[3578]{1}[0-9]{9}$/.test(el.val()) == false){
							error.push('手机号码');
							el.addClass('warnning');
							el.parent().addClass('warnning');
						}else{
							el.removeClass('warnning');
							el.parent().removeClass('warnning');
						}
						break;

					case 'contactEmail':
						if(/^(\w|\-)+(\w|\.|\-){0,}@[a-z0-9A-Z]+(\.[a-z0-9A-Z]+){0,}\.[A-Za-z]+$/g.test(el.val()) == false){
							error.push('电子邮箱');
							el.addClass('warnning');
							el.parent().addClass('warnning');
						}else{
							el.removeClass('warnning');
							el.parent().removeClass('warnning');
						}
						break;
				}
			}else{
				values = {
					name:$('#contactName'),
					phone:$('#contactPhone'),
					email:$('#contactEmail'),
					wechat:$('#contactWechat'),
                    travelDateStart: $('#travelDateStart'),
                    travelDateEnd: $('#travelDateEnd'),
				}
				$.each(values,function(k,v){
					switch(k){
						case 'name':
							if(/.+/.test(v.val()) == false){
								error.push('真实姓名');
								v.addClass('warnning');
								v.parent().addClass('warnning');
							}else{
								v.removeClass('warnning');
								v.parent().removeClass('warnning');
							}
							break;

						case 'phone':
							if(/^1[3578]{1}[0-9]{9}$/.test(v.val()) == false){
								error.push('手机号码');
								v.addClass('warnning');
								v.parent().addClass('warnning');
							}else{
								v.removeClass('warnning');
								v.parent().removeClass('warnning');
							}
							break;

						case 'email':
							if(/^(\w|\-)+(\w|\.|\-){0,}@[a-z0-9A-Z]+(\.[a-z0-9A-Z]+){0,}\.[A-Za-z]+$/g.test(v.val()) == false){
								error.push('电子邮箱');
								v.addClass('warnning');
								v.parent().addClass('warnning');
							}else{
								v.removeClass('warnning');
								v.parent().removeClass('warnning');
							}
							break;
						case 'wechat':
							if(v.val() && !/^[a-zA-Z0-9_-]{6,}$/.test(v.val())){
								error.push('微信号');
								v.addClass('warnning');
								v.parent().addClass('warnning');
							}else{
								v.removeClass('warnning');
								v.parent().removeClass('warnning');
							}
							break;
                        case 'travelDateStart':
                            var st = v.val();
                            if(v && v.is(':visible') && !/^\d{4}.\d{2}.\d{2}$/g.test(st)){
                                error.push('取设备日期');
                                v.addClass('warnning');
                                v.parent().addClass('warnning');
                            }else{
                                v.removeClass('warnning');
                                v.parent().removeClass('warnning');
                            }
                            break;
                        case 'travelDateEnd':
                            var et = v.val();
                            if(v && v.is(':visible') && !/^\d{4}.\d{2}.\d{2}$/g.test(et)){
                                error.push('还设备日期');
                                v.addClass('warnning');
                                v.parent().addClass('warnning');
                            }else{
                                v.removeClass('warnning');
                                v.parent().removeClass('warnning');
                            }
                            break;
					}
				});
			}
			if(error.length > 0){
				return error.join(',');
			}else{
				return '';
			}
		}
	}
	if($("#orderMain").length){
		// 提交订单页
		orderUi.init();

		$("#lmTotPrice").change(function() {
			// 总价改变时
			if($(this).val()<=0){
				// 如果总价=0，显示单房差的dom隐藏
				$('#roomOffset').hide();
				$('#roomOffsetBar2').hide();
			}
			// 更新显示的总价
			$(".lmOrderBtns em").html("¥" + $(this).val());
		});

		function ordermsg(msg) {//弹出提示
			require(['popup_base','slidTip'], function(aPop,aSlidTip){
				aSlidTip.show({
					type:5,
					text: msg
				});
			});
		}

		// 秒杀弹层功能
		var lmCountdown = {
			endTimes:[],//结束时间
			nowTime:0,//当前时间
			init:function(){
				this.num = $seckillTime.length;
				for(var m=0;m<this.num;m++){
					this.endTimes[m] = parseInt($seckillTime.eq(m).attr("data-time"));
				}
				this.giveTime();

			},
			giveTime:function(){
				var that = this;
				if (window.ActiveXObject){
			        http_request=new ActiveXObject('Microsoft.XMLHTTP');
			    } else if (window.XMLHttpRequest) {
			        http_request=new XMLHttpRequest();
			    }
			    http_request.open('HEAD', '/ajax.php', false);//获取服务器时间，XHR不能跨域!!!
			    http_request.send(null);
			    var ServerDate = new Date(http_request.getResponseHeader('Date'));
			    if(typeof ServerDate != "undefined"){
			        this.nowTime = ServerDate.getTime();
			    }else{
			        var date = new Date();
			        this.nowTime = date.getTime();
			    }
			    this.nowTime = Math.floor(this.nowTime / 1000);//换算成秒
			    // console.log(this.nowTime);
			    this.downCount();
			},
			downCount:function(){
				var that = this;
				this.nowTime = this.nowTime+1;
				//遍历所有倒计时
				for(var i=0;i<this.num;i++){
					var el = $seckillTime.eq(i);
					var theDay=this.endTimes[i];
					theDay=theDay++;
					if(theDay<=this.nowTime){
						el.parent(".combo").removeClass("noStart");
						if(el.html()!=""){
							el.before("剩余"+el.attr("data-stock"));
							el.html("");
						}
					}
					else{
						var diff = theDay - this.nowTime;
						//console.log(diff);
						this.timeChange(diff,el);
					}
				}
				window.setTimeout(function(){that.downCount();},1000);
			},
			timeChange:function(diff,_this){
				var hour = diff / 3600;
				var minute = diff % 3600 / 60;
				var second = diff % 60;
				hour = Math.floor(hour);
				minute = Math.floor(minute);
				var em = _this.find("em");
				em.eq(0).text(hour);
				em.eq(1).text(minute);
				em.eq(2).text(second);
			}
		};
		var $seckillTime = $(".seckillTime");
		if($seckillTime.length>0){
			lmCountdown.init();
		}
	}

    /**
     * 格式化日期，输出字符串，yyyy-mm-dd
     * @method format
     * @param {String} e 格式
     */
    Date.prototype.format = function(e){
        var a = function (m, l) {
            var n = "",
                k = (m < 0),
                j = String(Math.abs(m));
            if (j.length < l) {
                n = (new Array(l - j.length + 1)).join("0")
            }
            return (k ? "-" : "") + n + j
        };
        if ("string" != typeof e) {
            return this.toString()
        }
        var b = function (k, j) {
            e = e.replace(k, j)
        };
        var f = this.getFullYear(),
            d = this.getMonth() + 1,
            i = this.getDate(),
            g = this.getHours(),
            c = this.getMinutes(),
            h = this.getSeconds();
        b(/yyyy/g, a(f, 4));
        b(/yy/g, a(parseInt(f.toString().slice(2), 10), 2));
        b(/MM/g, a(d, 2));
        b(/M/g, d);
        b(/dd/g, a(i, 2));
        b(/d/g, i);
        b(/HH/g, a(g, 2));
        b(/H/g, g);
        b(/hh/g, a(g % 12, 2));
        b(/h/g, g % 12);
        b(/mm/g, a(c, 2));
        b(/m/g, c);
        b(/ss/g, a(h, 2));
        b(/s/g, h);
        return e
    }
});

