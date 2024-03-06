const Router = require('express').Router()
const { getUser, saveUser } = require('./user.controllers')
const { 
    permission, 
    isInsertPermission, 
    isUpdatePermission, 
    isDeletePermission 
} = require('../../permission/permission')

Router.get("/", permission, async (req, res)=>{
    const data = await getUser(req)
    res.send(data).status(200)
})

Router.post("/login", async (req, res)=>{
	
})

Router.post("/saveuser", async (req, res)=>{
    // checked when insert
    if(isInsertPermission() === false){
        return res.json({
            success: false,
            message: 'Can not insert.'
        })
    }
    const data = await saveUser(req)
    res.send(data).status(200)
})

module.exports = Router;