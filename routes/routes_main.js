const express = require('express');
const Router = express.Router();
const { getUser, saveUser, Project_mini, Project_mini_update,Project_mini_test } = require('../modules/user/user.controllers');
const bodyParser = require('body-parser');
Router.use(bodyParser.urlencoded({ extended: true }));



Router.get('/', async (req, res) => {
	res.json({
		success: true,
		massage: 'ok'
	})
})


Router.post('/data_json', async (req, res) => {
	//res.json(req.body)
	data = await Project_mini_test(req.body);
	res.json({
		status: 200,
		massage: data
	})

})



Router.post('/insert_main', async (req, res) => {
	//console.log(req.body.post_type);return false;
	let data = null;
	if (req.body.post_type == "add") {
		 data = await Project_mini(req.body);
	} else {
		 data = await Project_mini_update(req.body);
	}
	//console.log(data.massage);
	if (data.success) {
		res.json({
			status: 200,
			massage: 'Success'
		})
	} else {
		res.json({
			status: 500,
			massage: data.massage
		})
	}
})


module.exports = Router
