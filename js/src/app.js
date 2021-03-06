/**
 * Created with JetBrains WebStorm.
 * User: ty
 * Date: 14-7-17
 * Time: 下午4:12
 * To change this template use File | Settings | File Templates.
 */
var pinWall=angular.module("pinWall",["ngRoute","services","viewControllers","popControllers","filters","directives","animations"]);

pinWall.config(["$routeProvider","$locationProvider","$httpProvider","App",
    function($routeProvider,$locationProvider,$httpProvider,App){


        //默认使用的时候hash模式，如果要使用rest风格，需要设置下面这一句，注意$locationProvider需要注入
        $locationProvider.html5Mode(true);
        //$locationProvider.hashPrefix("!");
        $routeProvider.when("/",{templateUrl: 'views/photowall.html',controller:"photowall"}).
            when("/projects",{templateUrl: 'views/photowall.html',controller:"photowall"}).
            when("/projects/create",{templateUrl: 'views/projectUpdate.html',controller:"projectUpdate"}).
            when("/projects/:projectId/update",{templateUrl: 'views/projectUpdate.html',controller:"projectUpdate"}).
            when("/projects/:projectId",{templateUrl: 'views/projects.html',controller:"projects"}).
            when("/topics",{templateUrl: 'views/boxes.html',controller:"boxes"}).
            when("/topics/create",{templateUrl: 'views/boxUpdate.html',controller:"boxUpdate"}).
            when("/topics/:boxId/update",{templateUrl: 'views/boxUpdate.html',controller:"boxUpdate"}).
            when("/topics/:boxId",{templateUrl: 'views/boxDetail.html',controller:"boxDetail"}).
            when("/topics_about/:keyword",{templateUrl: 'views/boxes.html',controller:"boxSearch"}).
            when("/topic/:boxId/artifact",{templateUrl: 'views/projectUpdate.html',controller:"projectUpdate"}).
            when("/search",{templateUrl: 'views/photowall.html',controller:"photowall"}).
            when("/search/:content",{templateUrl: 'views/searchResult.html',controller:"searchResult"}).
            when("/admin/comments",{templateUrl: 'views/admin/commentsManage.html',controller:"commentsManage"}).
            when("/admin/projects",{templateUrl: 'views/admin/projectsManage.html',controller:"projectsManage"}).
            when("/admin/users",{templateUrl: 'views/admin/usersManage.html',controller:"usersManage"}).
            when("/users/:userId/topics",{templateUrl: 'views/boxes.html',controller:"boxes"}).
            when("/users/:userId",{templateUrl: 'views/userHome.html',controller:"userHome"}).
            when("/login",{templateUrl: 'views/photowall.html',controller:"photowall"}).
            when("/register",{templateUrl: 'views/photowall.html',controller:"photowall"}).
            when("/users/:userId/update",{templateUrl: 'views/projects.html',controller:"projects"}).
            when("/change_password",{templateUrl: 'views/photowall.html',controller:"photowall"}).
            when("/forget_password",{templateUrl: 'views/photowall.html',controller:"photowall"}).
            when("/message",{templateUrl:"views/photowall.html",controller:"photowall"});/*.
            otherwise({redirectTo: '/'});*/


        //ajax的一些默认配置，全局启用loading
        $httpProvider.defaults.transformRequest.push(function (data,headers) {
            var href=location.href;
            if(href.indexOf("register")==-1&&href.indexOf("forget_password")==-1){
                App.showLoading();
            }

            return data;
        });

        $httpProvider.defaults.transformResponse.push(function (data) {
            var href=location.href;
            if(href.indexOf("register")==-1&&href.indexOf("forget_password")==-1){
                App.hideLoading();
            }

            return data;
        });

        //对返回的数据进行拦截，直接全局处理出错信息
        $httpProvider.interceptors.push(function ($q) {
            return {
                request:function(config){
                    /*
                    只需要替换最后一个，在字符串中输入\\的时候，其实只有一个\，前一个\表示转义符，正则中也是一样，
                    如果是完全使用rest风格比如data/projects\\/:projectId这种则需要判断一下是不是在最后，
                    如果是在最后则替换成“/”，如果不是则替换成空。
                    这些处理的前提都是基于后台使用带"/"结尾的地址，而angular会自动去掉结尾的"/"，
                    高版本的有配置项可以设置不去掉结尾"/"，
                     $resourceProvider.defaults.stripTrailingSlashes = false;
                    */
                    config.url=config.url.replace(/\\$/,"/");

                    //console.log(config);

                    /*消除服务端缓存的影响，还可以考虑直接设置$httpProvider.defaults.common/get,
                    但是那样可能所有的get请求都不会缓存（包括load页面的，这是不友好的），具体参考api*/
                    if(config.method=='GET'&&config.url.indexOf("views")==-1&&
                        config.url.indexOf("ownPagination")==-1){
                        var separator = config.url.indexOf('?') === -1 ? '?' : '&';
                        config.url = config.url+separator+'noCache=' + new Date().getTime();
                    }

                    return config||$q.reject(config);
                },
                response: function (res) {
                    if(typeof res.data.success!="undefined"&&res.data.success==false){
                        App.ajaxReturnErrorHandler(res.data);
                        return $q.reject(res.data);
                    }else{
                        return res;
                    }
                },
                responseError: function (res) {
                    App.ajaxErrorHandler();
                    return $q.reject(res);
                }
            };
        });

    }]);

//在run中做一些扩展,扩展App模块，从而可以在config中使用
pinWall.run(["$rootScope","$templateCache","App","AjaxErrorHandler",function($rootScope,$templateCache,App,AjaxErrorHandler){
    $rootScope.rootFlags={
        showLoading:false,
        showBlackOut:false
    };
    angular.extend(App,AjaxErrorHandler);

    App.showBlackOut=function(){
        $rootScope.rootFlags.showBlackOut=true;
    };
    App.hideBlackOut=function(){
        $rootScope.rootFlags.showBlackOut=false;
    };
    App.showLoading=function(){
        App.showBlackOut();
        
        $rootScope.rootFlags.showLoading=true;
    };
    App.hideLoading=function(){
        App.hideBlackOut();
        
        $rootScope.rootFlags.showLoading=false;
    };


    //禁用view和include缓存
    /*$rootScope.$on('$viewContentLoaded', function() {
        $templateCache.removeAll();
    });*/

    /*$rootScope.$on('$locationChangeSuccess', function () {
        console.log("$locationChangeSuccess"+new Date().getTime());
    });*/
    /*$rootScope.$on('$routeChangeSuccess', function () {
        console.log("$routeChangeSuccess"+new Date().getTime());
    });*/
    /*$rootScope.$on('$routeChangeStart', function () {
        console.log("$routeChangeStart"+new Date().getTime());
    });*/

}]);

pinWall.controller("super",["$scope","$location","$sce","Config","CFunctions","Storage","User","LocationChanger","toaster","App",
    function($scope,$location,$sce,Config,CFunctions,Storage,User,LocationChanger,toaster,App){

        //使用对象，子scope可以直接覆盖（对象地址）
        $scope.mainFlags={
            "currentMenu":Config.mainMenu.project,
            "showMainWrapper":true,
            "extMenuActive":false, //是否显示个人菜单
            "showProjectDetailFlag":false,  //是否显示作品详情
            "projectDetailTemplate":"",
            "showPlayMedialPanel":false,   //是否显示视频播放界面
            "showWebVideoPanel":false,   //控制显示网络视频输入界面S
            "mediaPlayTemplate":"",
            "playMediaPath":"",
            "playMediaType":"",
            "goHome":false
        };
        $scope.popFlags={
            "title":"",
            "popTemplateUrl":"" //弹窗需要加载的页面url
        };

        $scope.validMessage={
            "required":Config.validError.required,
            "email":Config.validError.email,
            "emailExist":Config.validError.emailExist,
            "maxLength":Config.validError.maxLength,
            "minLength":Config.validError.minLength,
            "pwdEqualError":Config.validError.pwdEqualError
        };
        $scope.isMobile=CFunctions.checkMobile();
        $scope.currentUser=Storage.currentUser;
        //$scope.currentUser.id=1;

        $scope.closePop=function(notGoBack){
            
            
            /*if(Storage.popViaURL){
                //直接从URL打开的pop，退出时一律返回到网站首页
                //window.location=document.getElementById("de_base_url").href;
                
            }*/
            $scope.popFlags.title="";
            $scope.popFlags.popTemplateUrl="";
            Storage.initEditUserObj();

            $scope.hideBlackOut();
            
            if(Storage.popViaURL){
                LocationChanger.skipReload().withReplace();
                delete Storage.popViaURL;
            }else if(!notGoBack){
                
                LocationChanger.skipReload();
                history.back();
            }
            
        };

        $scope.showBlackOut=function(){
            App.showBlackOut();
        };
        $scope.hideBlackOut=function(){
            App.hideBlackOut();
        };
        /**
         *点击登陆菜单
         */
        $scope.login=function(replaceUrl){

            replaceUrl=!!replaceUrl;

            //每次点击加一个随机数，让页面重新加载
            $scope.popFlags.popTemplateUrl=Config.templateUrls.signIn+"?noCache="+new Date().getTime();
            LocationChanger.skipReload().withReplace(Config.urls.signIn,replaceUrl);

            $scope.showBlackOut();
        };
        $scope.logout=function(){
            location.href="api/security/logout?noCache="+new Date().getTime();
        };
        $scope.toSearchPanel=function(){
            $scope.popFlags.popTemplateUrl=Config.templateUrls.search+"?noCache="+new Date().getTime();
            LocationChanger.skipReload().withReplace(Config.urls.search,false);
        };

        $scope.showProjectDetail=function(id,replaceUrl){
            replaceUrl=!!replaceUrl;
            $scope.mainFlags.showMainWrapper=false;
            $scope.mainFlags.showProjectDetailFlag=true;
            $scope.mainFlags.projectDetailTemplate=Config.templateUrls.projectDetail;
            LocationChanger.skipReload().withReplace(Config.urls.projectDetail.replace(":projectId",id),replaceUrl);
        };
        $scope.closeProjectDetailPanel=function(){
            $scope.mainFlags.showProjectDetailFlag=false;
            $scope.mainFlags.projectDetailTemplate="";
            $scope.mainFlags.showMainWrapper=true;
        };


        /**
         *显示更多菜单
         */
        $scope.toggleExtMenu=function(event){
            $scope.mainFlags.extMenuActive=!$scope.mainFlags.extMenuActive;
            event.stopPropagation();
        };


        /**
         *点击修改密码菜单
         */
        $scope.editPwd=function(){
            $scope.popFlags.popTemplateUrl=Config.templateUrls.editPwd+"?noCache="+new Date().getTime();
            LocationChanger.skipReload().withReplace(Config.urls.editPwd,false);
        };

        /**
         *点击修改资料菜单
         */
        $scope.editInfo=function(){
            $scope.popFlags.popTemplateUrl=Config.templateUrls.editInfo+"?noCache="+new Date().getTime();
            LocationChanger.skipReload().withReplace(Config.urls.editInfo.replace(":userId",$scope.currentUser.id),false);
        };

        //播放媒体文件界面
        $scope.closePlayMediaPanel=function(){
            $scope.mainFlags.showPlayMedialPanel=false;
            $scope.mainFlags.playMediaPath="";
            $scope.mainFlags.playMediaType="";
            $scope.hideBlackOut();
        };
        $scope.showPlayMediaPanel=function(){
            $scope.mainFlags.showPlayMedialPanel=true;
            $scope.showBlackOut();
        };

        //这个函数在projectDetail和projectUpdate中使用
        $scope.showAttachmentDetail=function(path,type){
            path=path?path:"";
            $scope.mainFlags.playMediaPath=$sce.trustAsResourceUrl(path);
            $scope.mainFlags.playMediaType=type;
            $scope.showPlayMediaPanel();

            if(path==""){
                toaster.pop("info",Config.messages.errorTitle,Config.messages.resourceIsInOperation);
            }
        };

        $scope.initPage=function(path,checkGoHome){
            if(path.indexOf(Config.urls.editPwd)!==-1){
                $scope.popFlags.popTemplateUrl=Config.templateUrls.editPwd;
            }else if(path.indexOf(Config.urls.signIn)!==-1){
                $scope.popFlags.popTemplateUrl=Config.templateUrls.signIn;
            }else if(path.indexOf(Config.urls.forgetPwd)!==-1){
                $scope.popFlags.popTemplateUrl=Config.templateUrls.forgetPwd;
            }else if(path.indexOf(Config.urls.signUp)!==-1){
                $scope.popFlags.popTemplateUrl=Config.templateUrls.signUp;
            }else if(path.indexOf(Config.urls.popMsg)!==-1){
                $scope.popFlags.popTemplateUrl=Config.templateUrls.popMsg;
            }else if(path.match(Config.urls.editInfoReg)!==null){
                $scope.popFlags.popTemplateUrl=Config.templateUrls.editInfo;
            }else if(path.match(Config.urls.projectDetailReg)!==null){
                $scope.mainFlags.projectDetailTemplate=Config.templateUrls.projectDetail;
                if(checkGoHome){
                    $scope.mainFlags.goHome=true;
                }
            }else if(path.indexOf(Config.urls.search)!==-1&&path.match(Config.urls.searchResultReg)==null){
                $scope.popFlags.popTemplateUrl=Config.templateUrls.search;
            }else{
                $scope.closePop(true);
                CFunctions.hideProjectDetail(function(){
                    $scope.closeProjectDetailPanel();
                    $scope.$apply();
                });
            }
        };

        $scope.activeAccount=function(){
            User.resource.setUserActive({email:Storage.currentUser.email},function(data){
                toaster.pop('success',Config.messages.successTitle,Config.messages.activeSuccess,null,null);
            });
        };

        $scope.initPage($location.path(),true);

        //初始化登陆用户
        User.resource.getCurrentUser(function(data){
            if(data.user){
                Storage.initCurrentUser({
                    id:data.user.id,
                    roles:data.user.roles,
                    name:data.user.fullname,
                    active:data.user.active,
                    email:data.user.email,
                    setting:{
                        profile_image:data.user.setting&&data.user.setting.profile_image?
                            data.user.setting.profile_image:Config.thumbs.defaultUserProfile,
                        description:data.user.setting&&data.user.setting.description?
                            data.user.setting.description:"",
                        comment_active:data.user.setting&&data.user.setting.comment_active?
                            data.user.setting.comment_active:true
                    }
                });
            }
        });

    }]);
