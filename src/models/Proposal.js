import mongoose from 'mongoose';

const ProposalSchema = new mongoose.Schema({
  previousOrganizer: { type: Boolean, required: true },
  fullName: { type: String, required: true },
  workplaceOrEducation: { type: String },
  country: { type: String },
  email: { type: String, required: true },
  telegramId: { type: String, required: true },
  phoneNumber: { type: String },
  educationLevel: { type: String },
  circleNameFa: { type: String, required: true },
  circleNameEn: { type: String, required: true },
  description: { type: String, required: true },
  expectedRegistrationDate: { type: String },
  expectedSessionStartDate: { type: String },
  expectedDuration: { type: String },
  agreedToTerms: { type: Boolean, required: true },
  status: { type: String, enum: ['pending', 'reviewed', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

export default mongoose.models.Proposal || mongoose.model('Proposal', ProposalSchema);
