const  mongoose = require("mongoose");
const inventoryModel = require("../models/inventoryModel")
const userModel = require("../models/userModel");

const createInventoryController = async (req, res) => {
    try {
        const { email} = req.body

        const user = await userModel.findOne({ email })
        if (!user) {
            throw new Error('User not found')
        }
        //if (inventoryType === "in" && user.role !== 'donar') {
          //  throw new Error('Not a donar account')
        //}
       // if (inventoryType === "out" && user.role !== 'hospital') {
         //   throw new Error("Not a hospital")
        //}
        if(req.body.inventoryType=='out'){
            const requestedBloodGroup= req.body.bloodGroup
            const requestedQuantityOfBlood=req.body.quantity
            const organisation = new mongoose.Types.ObjectId(req.body.userId)
            // calculate blood 
            const totalInOfRequestedBlood= await inventoryModel.aggregate([
                {$match:{
                    organisation,
                    inventoryType:'in',
                 bloodGroup:requestedBloodGroup
                }},{
                    $group:{
                        _id:'$bloodGroup',
                        total:{$sum:'$quantity'}
                    }
                }
            ])
           //console.log('Total In',totalInOfRequestedBlood)
           const totalIn = totalInOfRequestedBlood[0]?.total || 0;
        //calulate out 
        const totalOutOfRequestedBloodGroup= await inventoryModel.aggregate([
            {$match:{
                organisation,
                inventoryType:'out',
             bloodGroup:requestedBloodGroup
            }},{
                $group:{
                    _id:'$bloodGroup',
                    total:{$sum:'$quantity'}
                }
            }
        ])
        const totalOut = totalOutOfRequestedBloodGroup[0]?.total || 0;
        //in & out Calc
        const availableQuanityOfBloodGroup = totalIn - totalOut;
        //quantity valdiation
        if(availableQuanityOfBloodGroup < requestedQuantityOfBlood){
            return res.status(500).send({
                success:false,
                message:`Only ${availableQuanityOfBloodGroup}ML of ${requestedBloodGroup.toUpperCase()} is available`
            })
        }
        req.body.hospital = user?._id;
        }else{
            req.body.donar = user?._id
        }
//save data 
        const inventory = new inventoryModel(req.body)
        await inventory.save()
        return res.status(201).send({
            success: true,
            message: 'New Blood Record added'
        })
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({
            success: false,
            message: 'Error In create Inventory API',
            error
        })
    }
}

const getInventoryController = async (req, res) => {
    try {
        const inventory = await inventoryModel.find({
            organisation: req.body.userId,
        })
            .populate("donar")
            .populate("hospital")
            .sort({ createdAt: -1 });
        return res.status(200).send({
            success: true,
            message: "get all records sucessfully",
            inventory,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "error in get all inventory",
            error,

        });
    }
}
// get hospital inventory
const getInventoryHospitalController = async (req, res) => {
    try {
        const inventory = await inventoryModel
        .find(req.body.filters)
            .populate("donar")
            .populate("hospital")
            .populate("organisation")
            .sort({ createdAt: -1 });
        return res.status(200).send({
            success: true,
            message: "get all hospital consumer records sucessfully",
            inventory,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "error in get consumer  all inventory",
            error,

        });
    }
}
//get blood records of 3
const getRecentInventoryController = async (req,res)=>{
    try{
      const inventory = await inventoryModel
      .find({
        organisation:req.body.userId,
      })
      .limit(3)
      .sort({createdAt:-1});
      return res.status(200).send({
        success:true,
        message:"recent Inventory Data",
        inventory,
      })
    }catch(error){
        console.log(error)
        return res.status(500).send({
            success:false,
            message:"error in recent Inventory API",
            error
        })
    }
}



// get donar records
const getDonarsController = async(req,res)=>{
    try{
        const organisation = req.body.userId;
        const donorId=await inventoryModel.distinct("donar",{
            organisation,
        });
       // console.log(donorId)
       const donars = await userModel.find({_id:{$in:donorId}})
       return res.status(200).send({
        success:true,
        message: "Donar Record Fetched Successfully",
        donars,
       })
    }catch(error){
        console.log(error);
        return res.status(500).send({
            success:false,
            message:"Error in Donar records",
            error,
        })
    }
}
const getHospitalController = async(req,res)=>{
    try{
        const organisation = req.body.userId;
        const hospitalId = await inventoryModel.distinct('hospital',{
            organisation,
        })
        const hospitals=await userModel.find({
            _id:{$in:hospitalId},
        });
        return res.status(200).send({
            success:true,
            message:"Hospitals Data Fetched Successfully",
            hospitals
        })
    }catch(error){
        console.log(error);
        return res.status(500).send({
            success:false,
            message:"Error In get Hospital API",
            error,
        }) 
    }
}
// get Hospital Blood REcords

const getOrganisationController =async(req,res)=>{
    try{
        const donar = req.body.userId;
        const orgId= await inventoryModel.distinct("organisation",{donar})
        const organisations = await userModel.find({
_id:{$in:orgId},
        });
        return res.status(200).send({
            success:true,
            message:"Org Data Fetched Successfully",
            organisations,
        });
    }catch(error){
        console.log(error);
        return res.status(500).send({
            success:false,
            message:"Error In ORG API",
            error,
        })
    }
}
// get org for hospital
const getOrganisationForHospitalController =async(req,res)=>{
    try{
        const hospital = req.body.userId;
        const orgId= await inventoryModel.distinct("organisation",{hospital})
        const organisations = await userModel.find({
_id:{$in:orgId},
        });
        return res.status(200).send({
            success:true,
            message:" Hospital Org Data Fetched Successfully",
            organisations,
        });
    }catch(error){
        console.log(error);
        return res.status(500).send({
            success:false,
            message:"Error In Hospital ORG API",
            error,
        })
    }
}
module.exports = { createInventoryController,
     getInventoryController,
     getDonarsController,getHospitalController,
     getOrganisationController,getOrganisationForHospitalController,
     getInventoryHospitalController,getRecentInventoryController};