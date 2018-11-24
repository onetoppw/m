/**
 * api接口配置
 **/
(function($, owner) {

	//var api_host = "http://127.0.0.1/api";
	//var api_host = "http://api.onetop.pw/api";
	var api_host = "http://43.249.206.212/api";

	/**
	 * 跳转到指定页面，data为传递参数
	 */
	owner.go = function(url, data) {
		data = data || {};
		var id = url.slice(0, -4);
		$.openWindow({
			url: url,
			id: id,
			extras: data
		});
	}

	/**
	 * 跳转到登陆页面
	 */
	owner.goLogin = function() {
		$.alert('请登录账号');
		owner.go('login.html');
	}

	/**
	 * 跳转到首页，tab为首页选项卡
	 */
	owner.goHome = function(tab) {
		tab = tab || "games";
		owner.setSession('activeTab', tab);
		owner.go('index.html');
	}

	/**
	 * 获取当前状态
	 **/
	owner.getState = function() {
		var stateText = localStorage.getItem('$state') || "{}";
		return JSON.parse(stateText);
	};

	/**
	 * 设置当前状态
	 **/
	owner.setState = function(state) {
		state = state || {};
		localStorage.setItem('$state', JSON.stringify(state));
		//var settings = owner.getSettings();
		//settings.gestures = '';
		//owner.setSettings(settings);
	};
	/**
	 * 设置本地存储
	 **/
	owner.setItem = function(key, val) {

		localStorage.setItem('$items_' + key, val);
	}

	/**
	 * 获得本地存储
	 **/
	owner.getItem = function(key) {
		return localStorage.getItem('$items_' + key) || "";
	}

	/**
	 * 设置本地缓存
	 **/
	owner.setSession = function(key, val) {

		sessionStorage.setItem('$sessions_' + key, val);
	}

	/**
	 * 获得本地缓存
	 **/
	owner.getSession = function(key) {
		return sessionStorage.getItem('$sessions_' + key) || "";
	}


	/**
	 * 获取应用本地配置
	 **/
	owner.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	}

	/**
	 * 设置应用本地配置
	 **/
	owner.getSettings = function() {
		var settingsText = localStorage.getItem('$settings') || "{}";
		return JSON.parse(settingsText);
	}

	owner.getQueryString = function(name) {
		var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
		var r = window.location.search.substr(1).match(reg);
		if (r != null) {
			return unescape(r[2]);
		}
		return null;
	}

	owner.post = function(url, data, auth, callback) {
		return owner.request('post', url, data, auth, callback);
	}
	owner.get = function(url, data, auth, callback) {
		var query = '';
		if(typeof data === "object") {
			$.each(data,function(key,val){
				query +='&' + encodeURIComponent(key) + '=' + encodeURIComponent(val);
			})
			data = query.substr(1);			
		}
		return owner.request('get', url, data, auth, callback);
	}

	owner.request = function(method, url, data, auth, callback) {
		callback = callback || $.noop;
		url = api_host + url;
		if (auth) {
			var state = owner.getState();
			if (!state.token)
				return owner.goLogin();
			url = url + "?token=" + state.token;
		}
		$.ajax(url, {
			data: data,
			dataType: 'json', //服务器返回json格式数据
			type: method, //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			headers: {
				'Content-Type': 'application/json'
			},
			success: function(res) {
				if (res.code == 401) {
					owner.setState(false);
					return owner.goLogin();
				}
				return callback(res);
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				//callback('');
				console.log(xhr);
				console.log(type);
				$.toast('请求发生错误');
				return owner.goHome();
			}
		});
	}

	/**
	 * 保存用户状态
	 */
	owner.createState = function(data, callback) {
		var state = owner.getState();
		state.account = data.username;
		state.token = data.data;
		owner.setState(state);
		return callback();
	};

	/**
	 * 新用户注册
	 **/
	owner.reg = function(regInfo, callback) {
		callback = callback || $.noop;
		regInfo = regInfo || {};
		regInfo.username = regInfo.username || '';
		regInfo.password = regInfo.password || '';
		if (regInfo.username.length < 5) {
			return callback('用户名最短需要 5 个字符');
		}
		if (regInfo.password.length < 6) {
			return callback('密码最短需要 6 个字符');
		}
		owner.post('/register', regInfo, false, function(data) {
			if (!data || !data.data) return callback('注册失败');
			if (data.code != 0) return callback(data.data);
			$.toast('注册成功');
			data.username = regInfo.username;
			return owner.createState(data, callback);
		});
	};


	/**
	 *  用户登陆
	 */
	owner.login = function(loginInfo, callback) {
		callback = callback || $.noop;
		loginInfo = loginInfo || {};
		loginInfo.username = loginInfo.username || '';
		loginInfo.password = loginInfo.password || '';
		loginInfo.promo_code = loginInfo.promo_code || '';
		if ('' == loginInfo.username) {
			return callback('请输入账号');
		}
		if ('' == loginInfo.password.length) {
			return callback('请输入密码');
		}

		owner.post('/login', loginInfo, false, function(data) {
			if (!data || !data.data) return callback('登录失败');
			if (data.code != 0) return callback(data.data);
			$.toast('登录成功');
			data.username = loginInfo.username;
			return owner.createState(data, callback);
		});
	};

	/**
	 * 用户登出
	 */
	owner.logout = function() {

		owner.post('/logout', {}, false, function(data) {
			owner.setState(false);
			$.toast('退出应用');
			owner.goHome();
		});
	};

	/**
	 * 获取游戏平台用户登陆信息
	 */
	owner.gameLoginInfo = function(gameType,url,callback) {

		owner.get('/platform/logininfo', {game_type:gameType,url:url}, true, function(data) {
			callback(data);
		});
	};



}(mui, window.app = {}));
