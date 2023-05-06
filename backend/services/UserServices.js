const { default: mongoose } = require("mongoose");
const User = require("../models/User");
const makeToken = require("../utils/makeToken");
const Service = require("./Service");

class UserService {

    static async getUsers({ handle, admin, accountType, page = 1 } = {}){
        let filter = new Object();

        if (handle) filter.handle = handle;
        if (admin) filter.admin = admin;
        if (accountType) filter.accountType = accountType;

        const users = await User.find(filter, '-_id').exec();

        return Service.successResponse(users);
    }

    static async getUser({ handle }) {
        
        let user = await User.findOne({ handle: handle }).exec();

        if (!user) return Service.rejectResponse({ message: "User not found" });

        if (user.messages instanceof Array) {
            user = await user.populate('messages');
        }

        return Service.successResponse(user);
        
    }

    static async createUser(data) {  // TODO destructure
        let creation_error = null;
        const new_user = new User(data);  // this will shave off all properties

        new_user.admin = false;

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
            return Service.rejectResponse({ message: `Handle ${handle} not found` })
        
        return Service.successResponse()
    }

    static async writeUser({ handle, username,
        email, password, name, lastName, 
        phone, gender, blocked,
        accountType, charLeft,
    }) {
        const newVals = {
            email, password, name, lastName, 
            phone, gender, username,
            accountType,
        }
        let user = await User.findOne({ handle: handle });

        if (!user) return Service.rejectResponse({ 
            message: "User with given handle not found",
         });

        Object.keys(newVals).forEach(k => {
            if (newVals[k])
                user[k] = newVals[k]
        });

        if ((blocked === true) || (blocked === false)) user.blocked = blocked;

        // Maybe protects charLeft from getting extra fields but not sure

        if (charLeft) {
            if ((charLeft.day === 0) || (charLeft.day)) {
                user.charLeft.day = charLeft.day;
            }
            if ((charLeft.week === 0) || (charLeft.week)) {
                user.charLeft.week = charLeft.week;
            }
            if ((charLeft.month === 0) || (charLeft.month)) {
                user.charLeft.month = charLeft.month;
            }
        }

        let err = null;

        try {
            await user.save()
        } catch(e) {
            err = e;
        }

        if (err) return Service.rejectResponse(err);
        
        return Service.successResponse(user);
    }

    static async grantAdmin({ handle }) {
        
        let user = await User.findOne({ handle: handle });

        if (user) {
            
            // If this throws it should be caught by the controller since 
            // is a 5xx error
            user.admin = true;
            await user.save();  

            return Service.successResponse()

        } else {
            Service.rejectResponse({ message: "User not found" });
        }

    }

    static async revokeAdmin({ handle }) {
        let user = await User.findOne({ handle: handle });

        if (user) {

            // If this throws it should be caught by the controller since 
            // is a 5xx error
            user.admin = false;
            await user.save();

            return Service.successResponse();

        } else {
            Service.rejectResponse({ message: "User not found" });
        }
    }

    static async checkAvailability({ handle=null, email=null }) {
        
        let filter = { $or: [] };

        if (handle) filter.$or.shift({handle: handle});
        if (email) filter.$or.shift({ email: email });
        
        const results = await users.findOne(filter).exec();
        
        if (results) return Service.successResponse({ available: false })
        else return Service.successResponse({ available: true })
    }

    static async changeSmm({}){}

    static async changeManaged({}){}
}

module.exports = UserService;