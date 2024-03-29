'use strict';
/*jslint node: true */
var logger = require('tracer').colorConsole();
var HttpHelper = require('../common/http.hlpr');
var MenuHelper = require('./helpers/menu.hlpr');
var _ = require('lodash');

module.exports.new = function(req, res) {
	logger.log();
	var token = req.query.token || null;
	var new_menu = {};

	if(!token) {
		HttpHelper.error(res, null, "Not Authenticated");
	}

	new_menu = _.extend(new_menu, req.body);
	MenuHelper.create_menu(token, new_menu).then(function(data) {
		HttpHelper.success(res, data.data, data.message);
	}, function(err) {
		HttpHelper.error(res, err.err, err.message);
	})
}

module.exports.get = function(req, res) {
	logger.log();
	var token = req.query.token || null,
		menu_id = req.params.menu;

	if(!token) {
		HttpHelper.error(res, null, "Not Authenticated");
	}

	MenuHelper.get_menu(token, menu_id).then(function(data) {
		HttpHelper.success(res, data.data, data.message);
	}, function(err) {
		HttpHelper.error(res, err.err, err.message);
	})
}

module.exports.update = function(req, res) {
	logger.log();
	var token = req.query.token || null,
		menu_id = req.params.menu;

	if(!token) {
		HttpHelper.error(res, null, 'Not Authenticated');
	}
	var updated_menu = {};
	updated_menu = _.extend(updated_menu, req.body);

	MenuHelper.update_menu(token, updated_menu, menu_id)
		.then(function(data) {
			HttpHelper.success(res, data.data, data.message);
		}, function(err) {
			HttpHelper.error(res, err.err || true, err.message);
		})
}

module.exports.delete = function(req, res) {
    logger.log();
    var token = req.query.token || null,
    menu_id = req.params.menu;

    if(!token) {
        HttpHelper.error(res, null, "Not Authenticated");
    }

    MenuHelper.delete_menu(token, menu_id).then(function(data) {
        HttpHelper.success(res, data.data, data.message);
    }, function(err) {
        HttpHelper.error(res, err.err || true, err.message);
    });
}

module.exports.all = function(req, res) {
	logger.log();
	var token = req.query.token || null;

	if (!token) {
		HttpHelper.error(res, null, "Not Authenticated");
	}
	MenuHelper.get_all_menus(token).then(function(data) {
		HttpHelper.success(res, data.data, data.message);
	}, function(err) {
		HttpHelper.error(res, err.err || null, err.message);
	});

}

module.exports.clone = function(req, res) {
	logger.log();
	var token = req.query.token || null,
		menu_id = req.body.menu,
		outlet_id = req.body.outlet || null;

	if (!token) {
		HttpHelper.error(res, null, 'Not Authenticated');
	} else if (!menu_id) {
		HttpHelper.error(res, null, 'Menu info required');
	} else if (!outlet_id) {
		HttpHelper.error(res, null, 'Outlet info required');
	}
	MenuHelper.clone_menu(menu_id, outlet_id).then(function(data) {
		HttpHelper.success(res, data.data, data.message);
	}, function(err) {
		HttpHelper.error(res, err.err || null, err.message);
	})
}