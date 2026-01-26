import mongoose, { Schema, Document } from 'mongoose';
import { User as IUser } from '@codelab/shared';

export interface UserDocument extends Omit<IUser, 'id'>, Document { }

const UserSchema = new Schema<UserDocument>({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: String,
    },
    solvedProblems: [{
        type: Schema.Types.ObjectId,
        ref: 'Problem',
    }],
    totalSubmissions: {
        type: Number,
        default: 0,
    },
    acceptedSubmissions: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (_, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ acceptedSubmissions: -1 });

export const User = mongoose.model<UserDocument>('User', UserSchema);
