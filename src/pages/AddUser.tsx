import React, { useState } from "react";
import InputField from "../components/InputField";
import Button from "../components/Button";
import Layout from "../components/Layout";

const initialState = {
  fullName: "",
  phone: "",
  dob: "",
  gender: "",
  fatherName: "",
  city: "",
  pin: "",
  state: "",
  address: "",
};

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const AddUser: React.FC = () => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<any>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors: any = {};
    if (!form.fullName) newErrors.fullName = "Full Name is required";
    if (!form.phone) newErrors.phone = "Phone Number is required";
    if (!form.dob) newErrors.dob = "Date of Birth is required";
    if (!form.gender) newErrors.gender = "Gender is required";
    if (!form.fatherName) newErrors.fatherName = "Father's Name is required";
    if (!form.city) newErrors.city = "City/District is required";
    if (!form.pin) newErrors.pin = "PIN Code is required";
    if (!form.state) newErrors.state = "State is required";
    if (!form.address) newErrors.address = "Address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      alert("Form submitted!");
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto bg-white rounded-xl p-8 shadow-md mt-8 w-full">
        <h2 className="font-bold text-2xl mb-4">Add User</h2>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-wrap gap-6">
            <div className="flex-1 min-w-[260px]">
              <InputField label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} required />
            </div>
            <div className="flex-1 min-w-[260px]">
              <InputField label="Phone Number" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} required />
            </div>
            <div className="flex-1 min-w-[260px]">
              <InputField label="Date Of Birth" name="dob" type="date" value={form.dob} onChange={handleChange} error={errors.dob} required />
            </div>
            <div className="flex-1 min-w-[260px]">
              <InputField label="Gender" name="gender" type="select" options={genderOptions} value={form.gender} onChange={handleChange} error={errors.gender} required />
            </div>
            <div className="flex-1 min-w-[260px]">
              <InputField label="Fathers Name" name="fatherName" value={form.fatherName} onChange={handleChange} error={errors.fatherName} required />
            </div>
            <div className="flex-1 min-w-[260px]">
              <InputField label="City/District" name="city" value={form.city} onChange={handleChange} error={errors.city} required />
            </div>
            <div className="flex-1 min-w-[260px]">
              <InputField label="PIN Code" name="pin" value={form.pin} onChange={handleChange} error={errors.pin} required />
            </div>
            <div className="flex-1 min-w-[260px]">
              <InputField label="State" name="state" value={form.state} onChange={handleChange} error={errors.state} required />
            </div>
            <div className="flex-1 min-w-[540px]">
              <InputField label="Address" name="address" type="textarea" value={form.address} onChange={handleChange} error={errors.address} required rows={3} />
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <Button variant="danger" type="button">Reject</Button>
            <Button variant="primary" type="submit">Save & Next</Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddUser; 