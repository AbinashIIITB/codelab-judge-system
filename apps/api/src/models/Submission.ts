import mongoose, { Schema, Document } from 'mongoose';
import {
    Submission as ISubmission,
    TestCaseResult,
    Language,
    SubmissionStatus,
    Verdict
} from '@codelab/shared';

export interface SubmissionDocument extends Omit<ISubmission, 'id'>, Document { }

const TestCaseResultSchema = new Schema<TestCaseResult>({
    passed: { type: Boolean, required: true },
    input: String,
    expectedOutput: String,
    actualOutput: String,
    runtime: Number,
    memory: Number,
    error: String,
}, { _id: false });

const SubmissionSchema = new Schema<SubmissionDocument>({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    problemId: {
        type: Schema.Types.ObjectId,
        ref: 'Problem',
        required: true,
    },
    problemSlug: {
        type: String,
        required: true,
        index: true,
    },
    code: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        enum: ['cpp', 'python', 'java', 'javascript'],
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'queued', 'compiling', 'running', 'completed'],
        default: 'pending',
    },
    verdict: {
        type: String,
        enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded', 'Runtime Error', 'Compilation Error'],
    },
    runtime: {
        type: Number, // in milliseconds
    },
    memory: {
        type: Number, // in MB
    },
    testCasesPassed: {
        type: Number,
        default: 0,
    },
    totalTestCases: {
        type: Number,
        default: 0,
    },
    testCaseResults: [TestCaseResultSchema],
    error: {
        type: String,
    },
    completedAt: {
        type: Date,
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

// Indexes for efficient queries
SubmissionSchema.index({ userId: 1, problemSlug: 1 });
SubmissionSchema.index({ createdAt: -1 });
SubmissionSchema.index({ status: 1 });
SubmissionSchema.index({ verdict: 1, runtime: 1 });

export const Submission = mongoose.model<SubmissionDocument>('Submission', SubmissionSchema);
