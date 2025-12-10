import mongoose from "mongoose";
import bcrypt from "bcrypt";

const staffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    phone: {
      type: Number,
      required: true,
      min: 10,
    },
    address: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["User", "Admin", "Staff"],
      default: "Staff",
    },
    uniqueId: {
      type: String,
      unique: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

function generateToken(address) {
  const city = address.toUpperCase().slice(0, 4).padEnd(4, "X");
  // console.log(city);
  const randomNumber = 10000000 + Math.floor(Math.random() * 90000000);
  // console.log(randomNumber)

  return `STF-${city}-${randomNumber}`;
}

staffSchema.pre("save", async function () {
  const staff = this;

  //check if pasword is modified or not
  if (staff.isModified("password")) {
    //hash password
    try {
      //generate salt
      const salt = await bcrypt.genSalt(10);

      //hash password with salt
      const hashPassword = await bcrypt.hash(staff.password, salt);
      staff.password = hashPassword;
    } catch (error) {
      console.log(error);
    }
  }
  //Unique token
  if (!staff.uniqueId) {
    let exists = true;
    let tempToken;

    while (exists) {
      tempToken = generateToken(staff.address);
      exists = await mongoose.models.staffs.findOne({ uniqueId: tempToken });
    }
    staff.uniqueId = tempToken;
  }
});

staffSchema.methods.comparePassword = async function (staffPassword) {
  try {
    const isMatch = bcrypt.compare(staffPassword, this.password);
    return isMatch;
  } catch (error) {
    console.log(error);
  }
};

const Staff = mongoose.model("staffs", staffSchema);

export { Staff };
