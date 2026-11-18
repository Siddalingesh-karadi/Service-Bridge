import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { Professional, PRO_STATUSES } from '../professionals/professional.model.js';
import { VerificationDocument } from '../professionals/document.model.js';
import { AuditLog } from './auditLog.model.js';
import { VideoVerification } from '../videoVerification/videoVerification.model.js';
import { notify } from '../notifications/notify.js';

const RULES = {
  approve: { to: 'approved', from: ['under_review', 'suspended'] },
  reject: { to: 'rejected', from: ['under_review'] },
  suspend: { to: 'suspended', from: ['approved', 'under_review'] },
};

export const listProfessionals = asyncHandler(async (req, res) => {
  const status = PRO_STATUSES.includes(req.query.status) ? req.query.status : 'under_review';
  const items = await Professional.find({ status }).populate('userId', 'name email phone').sort({ updatedAt: 1 }).limit(50);
  res.json({ success: true, data: { items } });
});

export const getProfessional = asyncHandler(async (req, res) => {
  const profile = await Professional.findById(req.params.id).populate('userId', 'name email phone');
  if (!profile) throw new ApiError(404, 'Professional not found');
  const documents = await VerificationDocument.find({ professionalId: profile._id });
  res.json({ success: true, data: { profile, documents } });
});

export const decide = asyncHandler(async (req, res) => {
  const { decision, reason } = req.body;
  const rule = RULES[decision];
  const p = await Professional.findById(req.params.id);
  if (!p) throw new ApiError(404, 'Professional not found');
  if (!rule.from.includes(p.status)) throw new ApiError(409, `Cannot ${decision} a professional who is ${p.status}`);
  if (decision === 'approve' && p.status === 'under_review' && !(await VideoVerification.exists({ professionalId: p._id, result: 'PASSED' }))) {
    throw new ApiError(409, 'Complete a passed live video verification before approving');
  }
  p.status = rule.to;
  p.rejectionReason = decision === 'approve' ? undefined : reason;
  p.reviewedBy = req.user._id;
  p.reviewedAt = new Date();
  await p.save();
  await AuditLog.create({ adminId: req.user._id, action: decision, targetType: 'Professional', targetId: p._id, reason });
  await notify(p.userId, { type: 'verification', title: `Your profile was ${rule.to}`, body: reason || 'You can now receive customer requests.', link: '/professional' });
  res.json({ success: true, data: { profile: p } });
});
