// grab the things we need
import * as Defs from './model';
import * as mongoose from 'mongoose';
import * as passportLocalMongoose from 'passport-local-mongoose';

export interface IUserModel extends mongoose.PassportLocalDocument {
    username: String;
    password: String;
    email: String;
    admin: Boolean;
    createdAt: Date;
    modifiedAt: Date;
}

export class UserModel {
    public static schema =
    <mongoose.PassportLocalSchema>new mongoose.Schema({
        // username and password added as passport plugin.
        admin: {
            type: Boolean,
            default: false
        },
        email: {
            type: String
        }
    }, {
            timestamps: true
        }).plugin(passportLocalMongoose);

    private static _model = <mongoose.PassportLocalModel<IUserModel>>
    mongoose.model<IUserModel>('User', UserModel.schema);
    public static repo = new Defs.RepositoryBase<IUserModel>(UserModel._model);
    public static register = UserModel._model.register;
    public static model = (args: any) => {
        return new UserModel._model(args);
    }
    public static authenticate = () => {
        return UserModel._model.authenticate;
    }

    public static serializeUser = () => {
        return UserModel._model.serializeUser;
    }

    public static deserializeUser = () => {
        return UserModel._model.deserializeUser;
    }
}
