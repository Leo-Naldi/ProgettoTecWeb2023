const { default: mongoose } = require("mongoose");
const User = require("../models/User");
const makeToken = require("../utils/makeToken");
const Service = require("./Service");

class UserService {

    static async getUser({ handle }) {
        
        const user = await User.findOne({ handle: handle }).exec();

        //console.log(handle)

        if (user.messages instanceof Array) {
            user = await user.populate('messages').exec();
        }

        return Service.successResponse(user);
    }

    static async createUser(data) {
        let creation_error = null;
        const new_user = new User(data);  // this will shave off all properties

        try{
            await new_user.save();
        } catch (err) {
            creation_error = err;
        }

        if (creation_error) return Service.rejectResponse(creation_error);

        let res_body = {
            handle: new_user.handle,
            id: new_user.id,
            token: makeToken({  
                handle: new_user.handle, 
                accountType: new_user.accountType, 
                admin: false 
            })
        }

        return Service.successResponse(res_body);
    
    }

    static async deleteUser({ handle }) {
        const res = await User.deleteOne({ handle: handle });

        if (res.deletedCount === 0) 
            return Service.rejectResponse({ message: `Handle ${hadle} not found` }, 400)
        
        return Service.successResponse()
    }
}

module.exports = UserService;