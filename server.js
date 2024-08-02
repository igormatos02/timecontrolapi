import express from 'express';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Define routes

/*EMPLOYEE*/

// Create a new employee record
app.post('/api/employee', async (req, res) => {
    const { login, name } = req.body;
    
    const { data, error } = await supabase
      .from('employee')
      .insert([{ login, name }]);
  
    if (error) {
      console.error('Error creating employee:', error);
      res.status(500).json({ error: 'Failed to create employee record' });
    } else {
      res.status(201).json(data);
    }
  });
  
  // Get all employee records with optional filters for login and name
  app.get('/api/employee', async (req, res) => {
    const { login, name } = req.query;
    let query = supabase.from('employee').select('*');
  
    if (login) {
      query = query.ilike('login', `%${login}%`);
    }
  
    if (name) {
      query = query.ilike('name', `%${name}%`);
    }
  
    const { data, error } = await query;
  
    if (error) {
      console.error('Error fetching employee records:', error);
      res.status(500).json({ error: 'Failed to fetch employee records' });
    } else {
      res.status(200).json(data);
    }
  });
  
  // Get a specific employee record by ID
  app.get('/api/employee/:id', async (req, res) => {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('employee')
      .select('*')
      .eq('id', id)
      .single();
  
    if (error) {
      console.error('Error fetching employee record:', error);
      res.status(500).json({ error: 'Failed to fetch employee record' });
    } else {
      res.status(200).json(data);
    }
  });
  
  // Update an employee record
  app.put('/api/employee/:id', async (req, res) => {
    const { id } = req.params;
    const { login, name } = req.body;
  
    const { data, error } = await supabase
      .from('employee')
      .update({ login, name })
      .eq('id', id);
  
    if (error) {
      console.error('Error updating employee record:', error);
      res.status(500).json({ error: 'Failed to update employee record' });
    } else {
      res.status(200).json(data);
    }
  });
  
  // Delete an employee record
  app.delete('/api/employee/:id', async (req, res) => {
    const { id } = req.params;
  
    const { data, error } = await supabase
      .from('employee')
      .delete()
      .eq('id', id);
  
    if (error) {
      console.error('Error deleting employee record:', error);
      res.status(500).json({ error: 'Failed to delete employee record' });
    } else {
      res.status(200).json(data);
    }
  });
  

/*END EMPLOYEE*/

/*ATTENDANCE*/


// Get all attendance records with optional filters for date and employeeId
app.get('/api/attendance', async (req, res) => {
    const { date, employeeId } = req.query;
    let query = supabase.from('attendance').select('*');
  
    if (date) {
      query = query.eq('date', date);
    }
  
    if (employeeId) {
      query = query.eq('employeeId', employeeId);
    }
  
    const { data, error } = await query;
  
    if (error) {
      console.error('Error fetching attendance records:', error);
      res.status(500).json({ error: 'Failed to fetch attendance records' });
    } else {
      res.status(200).json(data);
    }
  });

app.post('/api/attendance', async (req, res) => {
    const { date, projectId, employeeId, observation } = req.body;
    
    const { data, error } = await supabase
      .from('attendance')
      .insert([{ date, projectId, employeeId, observation }]);
  
    if (error) {
      console.error('Error creating attendance:', error);
      res.status(500).json({ error: 'Failed to create attendance record' });
    } else {
      res.status(201).json(data);
    }
  });



  app.get('/api/report/:teamId/:employeeId/:year/:month', async (req, res) => {
    // Extract parameters from req.params
    const { teamId, employeeId, year, month } = req.params;
  
    // Validate and sanitize inputs
    if (!teamId || isNaN(teamId)) {
      return res.status(400).json({ error: 'Invalid teamId' });
    }
    if (!employeeId || isNaN(employeeId)) {
      return res.status(400).json({ error: 'Invalid employeeId' });
    }
    if (!year || isNaN(year)) {
      return res.status(400).json({ error: 'Invalid year' });
    }
    if (!month || isNaN(month)) {
      return res.status(400).json({ error: 'Invalid month' });
    }
  
    try {
      const { data, error } = await supabase
      .from('project')
      .select(`
        io,
        name:project,
        team:team!inner(name),
        employee:employee!inner(name),
        report!left(year, month, total)
      `)
      .leftJoin('report', 'report.projectId', 'project.id')
      .leftJoin('employee_team', 'employee_team.teamId', 'project.teamId')
      .leftJoin('team', 'team.id', 'project.teamId')
      .leftJoin('employee', 'employee_team.employeeId', 'employee.id')
      .eq('report.teamId', teamId)
      .eq('report.employeeId', employeeId)
      .eq('report.year', year)
      .eq('report.month', month)
      .eq('project.teamId', teamId);
  
      if (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      res.json(data);
    } catch (error) {
      console.error('Unexpected error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

app.get('/api/attendance', async (req, res) => {
    const { data, error } = await supabase
      .from('attendance')
      .select('*');
  
    if (error) {
      console.error('Error fetching attendance records:', error);
      res.status(500).json({ error: 'Failed to fetch attendance records' });
    } else {
      res.status(200).json(data);
    }
  });
  
  // Get a specific attendance record by ID
  app.get('/api/attendance/:id', async (req, res) => {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('id', id)
      .single();
  
    if (error) {
      console.error('Error fetching attendance record:', error);
      res.status(500).json({ error: 'Failed to fetch attendance record' });
    } else {
      res.status(200).json(data);
    }
  });
  
  // Update an attendance record
  app.put('/api/attendance/:id', async (req, res) => {
    const { id } = req.params;
    const { date, projectId, employeeId, observation } = req.body;
  
    const { data, error } = await supabase
      .from('attendance')
      .update({ date, projectId, employeeId, observation })
      .eq('id', id);
  
    if (error) {
      console.error('Error updating attendance record:', error);
      res.status(500).json({ error: 'Failed to update attendance record' });
    } else {
      res.status(200).json(data);
    }
  });
  
  // Delete an attendance record
  app.delete('/api/attendance/:id', async (req, res) => {
    const { id } = req.params;
  
    const { data, error } = await supabase
      .from('attendance')
      .delete()
      .eq('id', id);
  
    if (error) {
      console.error('Error deleting attendance record:', error);
      res.status(500).json({ error: 'Failed to delete attendance record' });
    } else {
      res.status(200).json(data);
    }
  });
/* END ATTENDANCE*/

/* PROJECT*/
// Create a new project record
app.post('/api/project', async (req, res) => {
    const { io, name, teamId } = req.body;
    
    const { data, error } = await supabase
      .from('project')
      .insert([{ io, name, teamId }]);
  
    if (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: 'Failed to create project record' });
    } else {
      res.status(201).json(data);
    }
  });
  
  // Get all project records with optional filters for io and name
  app.get('/api/project', async (req, res) => {
    const { io, name } = req.query;
    let query = supabase.from('project').select('*');
  
    if (io) {
      query = query.ilike('io', `%${io}%`);
    }
  
    if (name) {
      query = query.ilike('name', `%${name}%`);
    }
  
    const { data, error } = await query;
  
    if (error) {
      console.error('Error fetching project records:', error);
      res.status(500).json({ error: 'Failed to fetch project records' });
    } else {
      res.status(200).json(data);
    }
  });
  
  // Get a specific project record by ID
  app.get('/api/project/:id', async (req, res) => {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('project')
      .select('*')
      .eq('id', id)
      .single();
  
    if (error) {
      console.error('Error fetching project record:', error);
      res.status(500).json({ error: 'Failed to fetch project record' });
    } else {
      res.status(200).json(data);
    }
  });
  
  // Update a project record
  app.put('/api/project/:id', async (req, res) => {
    const { id } = req.params;
    const { io, name, teamId } = req.body;
  
    const { data, error } = await supabase
      .from('project')
      .update({ io, name, teamId })
      .eq('id', id);
  
    if (error) {
      console.error('Error updating project record:', error);
      res.status(500).json({ error: 'Failed to update project record' });
    } else {
      res.status(200).json(data);
    }
  });
  
  // Delete a project record
  app.delete('/api/project/:id', async (req, res) => {
    const { id } = req.params;
  
    const { data, error } = await supabase
      .from('project')
      .delete()
      .eq('id', id);
  
    if (error) {
      console.error('Error deleting project record:', error);
      res.status(500).json({ error: 'Failed to delete project record' });
    } else {
      res.status(200).json(data);
    }
  });
/* END PROJECT*/

/* TEAM*/

// Create a new team record
app.post('/api/team', async (req, res) => {
    const { name } = req.body;
    
    const { data, error } = await supabase
      .from('team')
      .insert([{ name }]);
  
    if (error) {
      console.error('Error creating team:', error);
      res.status(500).json({ error: 'Failed to create team record' });
    } else {
      res.status(201).json(data);
    }
  });
  
  // Get all team records with optional filters for name
  app.get('/api/team', async (req, res) => {
    const { name } = req.query;
    let query = supabase.from('team').select('*');
  
    if (name) {
      query = query.ilike('name', `%${name}%`);
    }
  
    const { data, error } = await query;
  
    if (error) {
      console.error('Error fetching team records:', error);
      res.status(500).json({ error: 'Failed to fetch team records' });
    } else {
      res.status(200).json(data);
    }
  });
  
  // Get a specific team record by ID
  app.get('/api/team/:id', async (req, res) => {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('team')
      .select('*')
      .eq('id', id)
      .single();
  
    if (error) {
      console.error('Error fetching team record:', error);
      res.status(500).json({ error: 'Failed to fetch team record' });
    } else {
      res.status(200).json(data);
    }
  });
  
  // Update a team record
  app.put('/api/team/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
  
    const { data, error } = await supabase
      .from('team')
      .update({ name })
      .eq('id', id);
  
    if (error) {
      console.error('Error updating team record:', error);
      res.status(500).json({ error: 'Failed to update team record' });
    } else {
      res.status(200).json(data);
    }
  });
  
  // Delete a team record
  app.delete('/api/team/:id', async (req, res) => {
    const { id } = req.params;
  
    const { data, error } = await supabase
      .from('team')
      .delete()
      .eq('id', id);
  
    if (error) {
      console.error('Error deleting team record:', error);
      res.status(500).json({ error: 'Failed to delete team record' });
    } else {
      res.status(200).json(data);
    }
  });

/* END TEAM*/

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});