/**
 *
 **/
(function($, owner) {
	/**
	 * 用户登录
	 **/
	var api_host = "http://localhost/api";
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

	owner.logout = function() {

		owner.post('/logout', {}, false, function(data) {
			owner.setState(false);
			$.toast('退出应用');
			owner.goHome();
		});
	};

	owner.go = function(url, data) {
		data = data || {};
		var id = url.slice(0, -4);
		$.openWindow({
			url: url,
			id: id,
			extras: data
		});
	}

	owner.goLogin = function() {
		$.alert('请登录账号');
		owner.go('login.html');
	}
	owner.goHome = function(tab) {
		tab = tab || "games";
		owner.setSession('activeTab',tab);
		owner.go('index.html');
	}

	owner.post = function(url, data, auth, callback) {
		return owner.request('post', url, data, auth, callback);
	}
	owner.get = function(url, data, auth, callback) {
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
			success: function(data) {
				if (data.code == 401)
					return owner.goLogin();
				return callback(data);
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				//callback('');
				console.log(type);
				return owner.goHome();
			}
		});
	}

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
	 * 获取应用本地配置
	 **/
	owner.setItem = function(key, val) {

		localStorage.setItem('$items_' + key, val);
	}

	/**
	 * 设置应用本地配置
	 **/
	owner.getItem = function(key) {
		return localStorage.getItem('$items_' + key) || "";
	}

/**
	 * 获取应用本地配置
	 **/
	owner.setSession = function(key, val) {

		sessionStorage.setItem('$sessions_' + key, val);
	}

	/**
	 * 设置应用本地配置
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
	
	owner.getQueryString = function(name){
		var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
		var r = window.location.search.substr(1).match(reg);
		if (r != null) {
			return unescape(r[2]);
		}
		return null;
	}
	
}(mui, window.app = {}));
