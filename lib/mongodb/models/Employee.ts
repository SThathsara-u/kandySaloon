import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const EmployeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true
  },
  contact: {
    type: String,
    required: [true, 'Contact number is required']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  jobRole: {
    type: String,
    required: [true, 'Job role is required']
  }
}, { timestamps: true });

// Hash password before saving
EmployeeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
EmployeeSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Use the existing model if it exists, otherwise create a new one
const Employee = mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);

export default Employee;
