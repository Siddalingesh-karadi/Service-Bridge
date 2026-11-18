import mongoose from 'mongoose';

export const PRO_STATUSES = ['pending', 'under_review', 'approved', 'rejected', 'suspended'];

const pointSchema = new mongoose.Schema(
  { type: { type: String, enum: ['Point'], required: true }, coordinates: { type: [Number], required: true } },
  { _id: false }
);

const professionalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bio: { type: String, trim: true, maxlength: 500 },
    categories: [{ type: String, trim: true }], // becomes refs to ServiceCategories in Phase 3
    skills: [{ type: String, trim: true }],
    experienceYears: { type: Number, min: 0, max: 60, default: 0 },
    serviceAreas: [{ type: String, trim: true }],
    city: { type: String, trim: true },
    location: pointSchema, // GeoJSON [lng, lat]
    availability: { type: String, enum: ['available', 'busy', 'offline'], default: 'available' },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    status: { type: String, enum: PRO_STATUSES, default: 'pending', index: true },
    rejectionReason: { type: String, maxlength: 300 },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
  },
  { timestamps: true }
);

professionalSchema.index({ location: '2dsphere' });
professionalSchema.index({ status: 1, categories: 1 });

export const Professional = mongoose.model('Professional', professionalSchema);
