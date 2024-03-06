const { getUserModel, saveUserModel, insertTbModel, insertTb2Model,insertHeadDetailLog,update_Miniproject,test_inser_and_upload_modal } = require('./user.models')
const { isExpired } = require('./user.services')

const getUser = async (req)=>{
    const res = await getUserModel(req);
    if(isExpired === true){
        return false;
    }
    return res;
}

const Project_mini_test = async (req)=>{
    const res = await test_inser_and_upload_modal(req);
    return res;
}

const Project_mini = async (req)=>{
    const res = await insertHeadDetailLog(req);
    //console.log(res)
    return res;
}

const Project_mini_update = async (req)=>{
    const res = await update_Miniproject(req);
    return res;
}

const saveUser = async (req)=>{
    const res = await saveUserModel(req);
    return res;
}

const insertTb = async (req)=>{
    const res = await insertTbModel(req);
    return res;
}

const insertTb2 = async (req)=>{
    const res = await insertTb2Model(req);
    return res;
}

module.exports = {
    getUser, saveUser, insertTb, insertTb2,Project_mini ,Project_mini_update,Project_mini_test
}