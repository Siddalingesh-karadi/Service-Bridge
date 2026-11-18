import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { Professional } from './professional.model.js';
import { VerificationDocument } from './document.model.js';
import { ServiceCategory } from '../categories/category.model.js';

const EDITABLE = ['pending', 'rejected'];
const mine = (userId) => Professional.findOne({ userId });

export const getMe = asyncHandler(async (req, res) => {
  const profile = await mine(req.user._id);
  const documents = profile ? await VerificationDocument.find({ professionalId: profile._id }) : [];
  res.json({ success: true, data: { profile, documents } });
});

export const saveProfile = asyncHandler(async (req, res) => {
  const valid = await ServiceCategory.countDocuments({ slug: { $in: req.body.categories }, isActive: true });
  if (valid !== new Set(req.body.categories).size) throw new ApiError(400, 'One or more categories are invalid');
  const existing = await mine(req.user._id);
  if (existing && !EDITABLE.includes(existing.status)) throw new ApiError(409, 'Profile cannot be edited in its current status');
  const profile = await Professional.findOneAndUpdate(
    { userId: req.user._id },
    { ...req.body, userId: req.user._id },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  res.json({ success: true, data: { profile } });
});

export const addDocument = asyncHandler(async (req, res) => {
  const p = await mine(req.user._id);
  if (!p) throw new ApiError(400, 'Save your profile first');
  if (!EDITABLE.includes(p.status)) throw new ApiError(409, 'Documents cannot be changed in the current status');
  if ((await VerificationDocument.countDocuments({ professionalId: p._id })) >= 5) throw new ApiError(400, 'Maximum 5 documents');
  const { docType, documentRef } = req.body;
  const doc = await VerificationDocument.create({
    professionalId: p._id, docType, documentRef, consentGiven: true,
    retentionUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
  });
  res.status(201).json({ success: true, data: { document: doc } });
});

export const submit = asyncHandler(async (req, res) => {
  const p = await mine(req.user._id);
  if (!p) throw new ApiError(400, 'Save your profile first');
  if (!EDITABLE.includes(p.status)) throw new ApiError(409, 'Already submitted');
  if (!(await VerificationDocument.exists({ professionalId: p._id, docType: 'identity' }))) throw new ApiError(400, 'Add an identity document first');
  p.status = 'under_review';
  p.rejectionReason = undefined;
  await p.save();
  res.json({ success: true, data: { profile: p } });
});

export const setLocation = asyncHandler(async (req, res) => {
  const p = await Professional.findOneAndUpdate(
    { userId: req.user._id },
    { location: { type: 'Point', coordinates: [req.body.lng, req.body.lat] } },
    { new: true }
  );
  if (!p) throw new ApiError(400, 'Save your profile first');
  res.json({ success: true, data: { profile: p } });
});

export const setAvailability = asyncHandler(async (req, res) => {
  const p = await Professional.findOneAndUpdate({ userId: req.user._id }, { availability: req.body.availability }, { new: true });
  if (!p) throw new ApiError(400, 'Save your profile first');
  res.json({ success: true, data: { profile: p } });
});
