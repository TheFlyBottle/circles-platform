import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true
  },
  password: { type: String, required: true },
  position: { type: String },
  department: { type: String },
  role: { type: String, enum: ['admin', 'super_admin'], default: 'admin' },
  forcePasswordChange: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
