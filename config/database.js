import mongoose from "mongoose";

const dbConfig = async ()=>{
  try {
await mongoose.connect(process.env.MONGO_URI, { dbName: 'axeiro-vm' });
console.log('MongoDB connected for VM service');
} catch (err) {
console.error('MongoDB connection error:', err.message);
process.exit(1);
}
}

export default dbConfig