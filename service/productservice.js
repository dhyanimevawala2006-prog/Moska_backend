const prodModel=require('../models/productmodel')

const add=async(data)=>{
    return await prodModel.create(data);
}

const get=async()=>{
    return await prodModel.find();
}

const getbyid=async(id)=>{
    return await prodModel.findById(id);
}

const remove=async(id)=>{
    return await prodModel.findByIdAndDelete(id);
}

const update=async(id,data)=>{
    return await prodModel.findByIdAndUpdate(id,data);
}

module.exports={add,get,getbyid,remove,update}