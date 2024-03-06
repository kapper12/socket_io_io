const connection = require('../../config/connection')
const { QueryTypes } = require('sequelize');


const quote = (val) => typeof val === 'string' ? `'${val}'` : val; // check type

const updateQuery = (table, where_r, update) =>
    `UPDATE ${table} SET ${Object.entries(update)
        .map(([field, value]) => `${field}=${quote(value)}`)
        .join(', ')} WHERE ${Object.entries(where_r)
            .map(([field, value]) => `${field}=${quote(value)}`).join(' AND ')}`;

const insertQuery = (table, update) =>
    `INSERT INTO ${table} (${Object.keys(update).join(',')}) VALUES (${Object.entries(update)
        .map(([field, value]) => `${quote(value)}`)
        .join(',')} )`;


const checker = data_array => data_array.every(v => v === true); // fu check array  ถ้ามี false จะ return false ถ้ามีแต่ true จะ return true

const test_inser_and_upload_modal = async (req) => {
    //console.log(getRunning());
    // const actual = insertQuery('tb_member', req);
    //console.log(actual); return false
    /* return await connection.query(actual).then(function (data) {
         return true;
     }).catch((err) => {
         return err
     }); */
    const data_array = [false];
    for (i = 0; i < 10; i++) {
        data_array.push(true);
    }
    console.log(checker(data_array));

    //console.log(notCompleted)

}

//req.app.oi.emit การรับค่า ผ่านช่องสัญญาณ จากากรประกาศ app.io=io จากหน้า index;

const update_Miniproject = async (req) => {
    const { post_type, customer_name, tel_phone, total, code_order, id_update, info } = req
    let format_data = JSON.parse(JSON.stringify(info));
    let data = format_data;
    sql_in = `UPDATE tbl_order_test SET customer = '${customer_name}',tel=${tel_phone},order_decode='${JSON.stringify(data)}',salary=${total},code_order='${code_order}' WHERE id = ${id_update} `;
    //console.log(sql_in)
    return await connection.query(sql_in).then(() => {
        update_head_and_detail(id_update);
        return true;
    }).catch((err) => {
        return err
    });
}

const update_head_and_detail = async (id_update) => {
    await connection.query(`SELECT *,[dbo].get_unique_id() as running  from tbl_order_test where id = ${id_update}`).then(([data]) => {
        data.forEach(function (data) {
            let id = data.id;
            let customer = data.customer;
            let tel = data.tel;
            let code_order = data.code_order;
            let running = data.running;
            let salary = data.salary;
            let order_decode = data.order_decode;
            let myArray = JSON.parse(order_decode);
            sql_in_head = `UPDATE tbl_order_header SET customer='${customer}',tel=${tel},salary=${salary},code_order='${code_order}',running_code='${running}' where id_order_log = ${id_update} `;
            connection.query(`DELETE FROM tbl_order_detail WHERE id_order_log=${id_update}`).then(() => {
                return true;
            }).catch((err) => {
                return err
            });

            connection.query(sql_in_head).then(() => {
                myArray.forEach(function (order_decode) {
                    // console.log(order_decode.price_data);
                    sql_in_detail = `INSERT INTO tbl_order_detail (price_data,qty_data,order_name,running_code,id_order_log) VALUES ('${order_decode.price_data}',${order_decode.qty_data},'${order_decode.order_name}','${running}',${id})`;
                    //console.log(sql_in_detail);
                    return connection.query(sql_in_detail).then(() => {
                        return true;
                    })
                });
            }).catch((err) => {
                return err
            });
        });
    })
        .catch((err) => {
            return {
                success: false,
                message: err
            }
        })
}


let getRunning = () => {
    return connection.query('SELECT [dbo].get_unique_id() as running').then((data) => {
        return {
            result: Object.values(...data)[0].running
        }
    });
}


const insertHeadDetailLog = async (req) => {
    const data_pu = [];
    let running = getRunning();
    await running.then(function (result) {
        running = result.result; // "Some User token"
        data_pu.push({ running })
    })
    let running_f = Object.values(...data_pu)[0];
    //console.log(running_f); return false;
    let transaction = await connection.transaction();
    return Promise.all([
        insertLog(req, running_f, transaction),
        insertHead(req, running_f, transaction),
        insertDetail(req, running_f, transaction)
    ]).then((data) => {
        console.log(data)
        const notCompleted = data.some((item) => {
            return item === false
        })
        if (notCompleted) {
            throw 'notComplete';
        } else {
            transaction.commit()
            return {
                success: true,
                message: 'successfull'
            }
        }
    }).catch((error) => {
        transaction.rollback()
        return {
            success: false,
            message: error
        }
    });

}
const insertLog = async (req, running, transaction) => {
    const { post_type, customer_name, tel_phone, total, code_order, id_update, info } = req
    let sql_in = null;
    let format_data = JSON.parse(JSON.stringify(info));
    let data = format_data;

    sql_in = `INSERT INTO tbl_order_test (customer,tel,order_decode,salary,code_order,running_code) VALUES ('${customer_name}',${tel_phone},'${JSON.stringify(data)}',${total},'${code_order}','${running}')`;
    return await connection.query(sql_in, { transaction }).then(() => {
        return true;
    }).catch((err) => {
        return false;
    });
}
const insertHead = async (req, running, transaction) => {
    const { customer_name, tel_phone, total, code_order, id_update } = req
    sql_in_head = `INSERT INTO tbl_order_header (customer,tel,salary,code_order,running_code,id_order_log) VALUES ('${customer_name}',${tel_phone},${total},'${code_order}','${running}',1)`;
    return await connection.query(sql_in_head, { transaction }).then(() => {
        return true;
    }).catch((err) => {
        return false;
    });
}
const insertDetail = async (req, running, transaction) => {
    let myArray = JSON.parse(JSON.stringify(req.info));
    let array_check = [];
    const { code_order } = req;
    myArray.forEach(async (value) => {
        sql_in_detail = `INSERT INTO tbl_order_detail (price_data,qty_data,order_name,running_code,id_order_log,code_order) VALUES ('${value.price_data}',${value.qty_data},'${value.order_name}','${running}',1,'${code_order}')`;
        await connection.query(sql_in_detail, { transaction }).then(() => {
            array_check.push(true);
        }).catch((err) => {
            array_check.push(false);
        })
    });
    if (checker(array_check)) {
        return true;
    } else {
        return false;
    }
}




const getUserModel = async (req) => {
    let sql = null
    const { user_id } = req.query
    if (user_id > 0) {
        sql = `SELECT name, salary FROM tb_user WHERE user_id = ${user_id}`
    } else {
        sql = `SELECT name, salary FROM tb_user`
    }
    return await connection.query(sql)
        .then(([data]) => {
            console.log(data)
            return data
        })
        .catch((err) => {
            return {
                success: false,
                message: err
            }
        })
}

const saveUserModel = async (req) => {
    let transaction = await connection.transaction()
    return Promise.all([
        insertTbModel(req, transaction),
        insertTb2Model(req, transaction)
    ]).then((data) => {
        const notCompleted = data.some((item) => {
            return item === false
        })
        if (notCompleted) {
            throw 'some table is not complete'
        } else {
            transaction.commit()
            return {
                success: true,
                message: 'Insert all table is successfull'
            }
        }
    }).catch((err) => {
        transaction.rollback()
        return {
            success: false,
            message: err
        }
    })
}

const insertTbModel = async (req, transaction) => {
    const { name } = req.body
    return await connection.query(`
        INSERT INTO tb_a (name) VALUES ('${saveUserModel}')
        `, { transaction })
        .then(() => {
            return true;
        })
        .catch((err) => {
            return false
        })
}

const insertTb2Model = async (req, transaction) => {
    const { salary } = req.body
    return await connection.query(`
        INSERT INTO tb_b (salary) VALUES ('${salary}')
    ` , { transaction })
        .then(() => {
            return true;
        })
        .catch((err) => {
            return false
        })
}

module.exports = {
    getUserModel, saveUserModel, insertTbModel, insertTb2Model, insertHeadDetailLog, update_Miniproject, test_inser_and_upload_modal
}