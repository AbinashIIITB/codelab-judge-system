import mongoose, { Schema, Document } from 'mongoose';
import { Problem as IProblem, TestCase, STARTER_CODE } from '@codelab/shared';

// starterCode is persisted as a Mongo Map, not a plain object
export interface ProblemDocument extends Omit<IProblem, 'id' | 'starterCode'>, Document {
    starterCode: Map<string, string>;
}

const TestCaseSchema = new Schema<TestCase>({
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
}, { _id: false });

const ProblemSchema = new Schema<ProblemDocument>({
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    constraints: [{
        type: String,
    }],
    sampleTestCases: [TestCaseSchema],
    hiddenTestCases: [TestCaseSchema],
    timeLimit: {
        type: Number,
        default: 2000, // 2 seconds
    },
    memoryLimit: {
        type: Number,
        default: 256, // 256 MB
    },
    tags: [{
        type: String,
        lowercase: true,
        trim: true,
    }],
    starterCode: {
        type: Map,
        of: String,
        default: () => new Map(Object.entries(STARTER_CODE)),
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (_, ret: Record<string, unknown>) => {
            ret.id = String(ret._id);
            delete ret._id;
            delete ret.__v;
            // Don't expose hidden test cases in regular queries
            delete ret.hiddenTestCases;
            return ret;
        },
    },
});

// Indexes ({ slug: 1 } is already created by `unique: true` on the field)
ProblemSchema.index({ difficulty: 1 });
ProblemSchema.index({ tags: 1 });

// Virtual for acceptance rate (would need submission data)
ProblemSchema.virtual('acceptanceRate').get(function () {
    return 0; // Calculated dynamically when needed
});

export const Problem = mongoose.model<ProblemDocument>('Problem', ProblemSchema);
