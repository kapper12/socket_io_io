const express = require('express');
const app = express();
const routes_main = require('./routes/routes_main');
const connection = require('./config/connection');
//console.log(connection);
const cors = require('cors')
const { Server } = require('socket.io');
const { Sequelize } = require('sequelize');
const schedule = require('node-schedule');
const si = require('systeminformation');

Db_Query = async () => { // async funtion Db_Query(){}
	await connection.query("select * from tbl_order_test", { type: Sequelize.QueryTypes.SELECT }).then(function (data) {
		io.emit('xxiix', data);
	})
}

Db_Query_Delete = async (...id_id_pos) => {
	//console.log(Object.values(...id_id_pos)[0]); return false;
	await connection.query('DELETE FROM tbl_order_test WHERE id = ?',
		{
			replacements: [Object.values(...id_id_pos)[0]],
			type: Sequelize.QueryTypes.SELECT
		}
	).then(function (data) {
		connection.query('DELETE FROM tbl_order_header WHERE id_order_log = ?',{replacements: [Object.values(...id_id_pos)[0]],type: Sequelize.QueryTypes.SELECT});
		connection.query('DELETE FROM tbl_order_detail WHERE id_order_log = ?',{replacements: [Object.values(...id_id_pos)[0]],type: Sequelize.QueryTypes.SELECT});
		Db_Query();
	});

}

schedule.scheduleJob("*/10 * * * * *", function () {
	//Db_Query();
	connection.sync().then(function () {
		io.emit('status_database', {status:200,message:'Connect Succesfull'}); 
		Db_Query();
	}, function (err) {
		io.emit('status_database', {status:500,message:err}); return false;
	});
	/*si.mem().then(data => {
		io.emit('taks_memory', {
			total: (data.total / 1073741824),
			free: (data.free / 1073741824),
			used: (data.used / 1073741824)
		});
	}).catch(error => console.error(error)); */
	si.versions().then(data => {
		//console.log(data) 
		io.emit('version_programe', data);
	}).catch(error => console.error(error));

	var sysInfo = { cpu: 0, mem: 0, temp: 0 };

	si.currentLoad(function (data) {
		sysInfo.cpu = data.currentLoad;

		si.mem(function (data) {
			sysInfo.mem = (data.active / data.total) * 100;

			si.cpuTemperature(function (data) {
				sysInfo.temp = data.main;

				io.emit('taks_performance', {
					cpu: sysInfo.cpu,
					mem: sysInfo.mem,
					temp: sysInfo.temp
				});
				/*console.log(sysInfo.cpu + ' %');
				console.log(sysInfo.mem + ' %');
				console.log(sysInfo.temp + ' °C'); */
			});
		});
	});
	//console.log(sysInfo);
});

app.use(cors())
app.use(express.json())

app.use('/routes', routes_main)

app.get('/', (req, res) => {
	res.json({
		success: true
	})
})
app.get('/data', async (req, res) => {
	await Db_Query();
})

const http = app.listen(9000, () => {
	console.log('Server is running on 9000')
})
const io = new Server(http, {
	cors: {
		origin: ["http://192.168.5.3"],
		//origin :"*",
		methods: ["GET", "POST"],
		allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'token'],
		credentials: true
	},
	allowEIO3: true
})
app.io = io; //การสร้าง io app ไปใช้ใน controller
var data_user = [];

io.on('connection', (socket) => {
	var ipv4 = socket.request.socket.remoteAddress;
	data_user.push({ json_obj: socket.id, json_obj_ip: ipv4 })
	io.emit('check_connect', {
		json_id: data_user
	});
	socket.on('disconnect', () => {
		console.log(socket.id + ' is disconnected');
		const newArr = data_user.filter(object => { return object.json_obj !== socket.id; });
		data_user = newArr;
		io.emit('check_connect', {
			json_id: data_user
		});
	})

	socket.on('delete_id', (id_id) => {
		//console.log(id_id.id_id);Db_Query_Delete(id_id.id_id)
		Db_Query_Delete(id_id);
	})

})
