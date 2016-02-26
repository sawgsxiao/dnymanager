/**
 * 开发版本的文件导入
 */
(function (){

    // 加载文件
    (function(){
        var paths,baseURL,sources=[],v=window.QYER.FED.config.version|0;

        paths  = [
            "html5/zeptoAndRequireAndTemplate.js",
            "html5/qyerUtil.js",
        ];
        baseURL = '/assets/';
        for (var i=0,pi;pi = paths[i++];) {
            sources.push('<script type="text/javascript" src="'+ baseURL + pi +'"></script>');
        }

       //页面主逻辑入口
        if( location.href.indexOf('qdebug')!=-1  || !window.QYER.FED.config.version ){
                sources.push('<link rel="stylesheet" href="/assets/html5/index.css" />');
                sources.push('<script type="text/javascript" src="/assets/html5/index.js" async="async" ></script>');
            }else{
                sources.push('<link rel="stylesheet" href="/assets/html5/h5.css" />');
                sources.push('<script type="text/javascript" src="/assets/html5/h5.js" async="async" ></script>');
            }


        document.write(sources.join(''));
        
        sources.length=0
        paths=baseURL=sources=null;
    })();

})();
