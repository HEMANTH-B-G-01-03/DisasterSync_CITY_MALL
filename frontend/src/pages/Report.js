import React, { useEffect, useState } from "react";
import { Box, Typography, TextField, Button, Card, CardContent, Stack } from "@mui/material";
import { getProjectById, createReport } from "../api/api"; // no need updateProjectDescription anymore
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ProjectReport = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [reportDetails, setReportDetails] = useState(""); // for report details input

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await getProjectById(projectId);
        setProject(data);
      } catch (error) {
        console.error("Error fetching project:", error);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleSubmit = async () => {
    try {
      await createReport(projectId, reportDetails); // send reportDetails to backend
      alert("Project report submitted successfully!");
      navigate("/tldashboard");
    } catch (error) {
      console.error("Failed to submit:", error);
      alert(error.message || "Failed to submit project report");
    }
  };

  if (!project) return <Typography>Loading...</Typography>;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #E3F2FD, #BBDEFB)",
        padding: "40px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        <Card
          sx={{
            width: 700,
            background: "rgba(255,255,255,0.9)",
            borderRadius: "15px",
            boxShadow: "0px 10px 20px rgba(0,0,0,0.2)",
            padding: "20px",
          }}
        >
          <CardContent>
            <Typography variant="h4" fontWeight="bold" color="#1565C0" textAlign="center" mb={2}>
              Project Report
            </Typography>

            <Typography variant="h6" color="textSecondary" mb={1}>
              Project Name:
            </Typography>
            <Typography variant="body1" mb={2}>
              {project.projectName}
            </Typography>

            <Typography variant="h6" color="textSecondary" mb={1}>
              Team Leader:
            </Typography>
            <Typography variant="body1" mb={2}>
              {project.teamLeader?.name}
            </Typography>

            <Typography variant="h6" color="textSecondary" mb={1}>
              Project Description:
            </Typography>
            <Typography variant="body2" mb={3}>
              {project.description}
            </Typography>

            <Typography variant="h6" color="textSecondary" mb={1}>
              Employees Working on Project:
            </Typography>
            {project.assignedEmployees && project.assignedEmployees.length > 0 ? (
              <ul>
                {project.assignedEmployees.map((emp) => (
                  <li key={emp._id}>{emp.name}</li>
                ))}
              </ul>
            ) : (
              <Typography variant="body2" mb={2}>No employees assigned.</Typography>
            )}

            <Typography variant="h6" color="textSecondary" mt={3} mb={1}>
              Project Report Details:
            </Typography>
            <TextField
              multiline
              minRows={4}
              fullWidth
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              variant="outlined"
              placeholder="Enter detailed report about project progress..."
              sx={{ mb: 3 }}
            />

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button variant="contained" color="success" onClick={handleSubmit}>
                Submit Report
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default ProjectReport;
