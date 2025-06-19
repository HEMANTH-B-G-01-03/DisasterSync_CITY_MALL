import React, { useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
  Box,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  AssignmentInd as AssignmentIndIcon,
  Work as WorkIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { addUser } from "../api/api";

const Register = () => {
  const [employee, setEmployee] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    specificRole: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setEmployee({ ...employee, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setServerError("");
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+]{6,}$/;

    let newErrors = {};
    if (!employee.name.trim()) newErrors.name = "Name is required.";
    if (!employee.email.trim()) newErrors.email = "Email is required.";
    else if (!emailRegex.test(employee.email)) newErrors.email = "Invalid email format.";
    if (!employee.password.trim()) newErrors.password = "Password is required.";
    else if (!passwordRegex.test(employee.password))
      newErrors.password = "Password must be 6+ chars and include a number.";
    if (!employee.confirmPassword.trim()) newErrors.confirmPassword = "Confirm your password.";
    else if (employee.password !== employee.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    if (!employee.role) newErrors.role = "Please select a role.";
    if (employee.role === "employee" && !employee.specificRole)
      newErrors.specificRole = "Please select a specific role.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData = {
        name: employee.name,
        email: employee.email,
        password: employee.password,
        role: employee.role,
      };

      if (employee.role === "employee") {
        userData.specificRole = employee.specificRole;
      }

      await addUser(userData);
      toast.success("Employee added successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setEmployee({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
        specificRole: "",
      });
      setErrors({});
      setServerError("");
      setTimeout(() => {
      navigate("/addashboard");
      }, 2000);
    } catch (error) {
      setServerError(error.response?.data?.message || "Failed. Try again.");
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={5} sx={{ borderRadius: 4, px: 4, py: 5 }}>
          <CardContent>
            <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
              Register
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary" gutterBottom>
              Add a new team member
            </Typography>

            {serverError && (
              <Typography color="error" align="center" sx={{ mb: 2 }}>
                {serverError}
              </Typography>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={employee.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  value={employee.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="password"
                  label="Password"
                  name="password"
                  value={employee.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="password"
                  label="Confirm Password"
                  name="confirmPassword"
                  value={employee.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.role}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={employee.role}
                    onChange={handleChange}
                    label="Role"
                    startAdornment={
                      <InputAdornment position="start">
                        <AssignmentIndIcon />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">Select Role</MenuItem>
                    <MenuItem value="teamleader">Team Leader</MenuItem>
                    <MenuItem value="employee">Employee</MenuItem>
                  </Select>
                  {errors.role && (
                    <Typography variant="caption" color="error">
                      {errors.role}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {employee.role === "employee" && (
                <Grid item xs={12}>
                  <FormControl fullWidth error={!!errors.specificRole}>
                    <InputLabel>Specific Role</InputLabel>
                    <Select
                      name="specificRole"
                      value={employee.specificRole}
                      onChange={handleChange}
                      label="Specific Role"
                      startAdornment={
                        <InputAdornment position="start">
                          <WorkIcon />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="">Select Specific Role</MenuItem>
                      <MenuItem value="Web Developer">Web Developer</MenuItem>
                      <MenuItem value="App Developer">App Developer</MenuItem>
                      <MenuItem value="Cloud Engineer">Cloud Engineer</MenuItem>
                      <MenuItem value="DevOps">DevOps</MenuItem>
                      <MenuItem value="Tester">Tester</MenuItem>
                    </Select>
                    {errors.specificRole && (
                      <Typography variant="caption" color="error">
                        {errors.specificRole}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{ py: 1.5, fontWeight: "bold", mt: 1 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Register"}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
      <ToastContainer />
    </Box>
  );
};

export default Register;
