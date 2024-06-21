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
const supabaseUrl = 'https://dovwuvpuhsxhbijaoifk.supabase.co'//process.env.SUPABASE_URL;
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdnd1dnB1aHN4aGJpamFvaWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg4MDM0MzksImV4cCI6MjAzNDM3OTQzOX0.weWDQedGCGXKU51VebpO_OCxUNiusgH9xSEZgwjjZO0';
const supabase = createClient(supabaseUrl, supabaseKey);

// Define routes
// Retrieve a list of employees
app.get('/api/employees', async (req, res) => {
   
   const { data, error } = await supabase
        .from('employee')
        .select('*');
       
    if (error) {
        console.error('Error retrieving data from Supabase:', error);
        res.status(500).json({ error: 'Internal server error' });
    } else {
        res.json({ data });
    }
   
   
});
// Define routes
// Retrieve data
app.get('/api/employee/:id', async (req, res) => {
    const { id } = req.params;
    
    const { data, error } = await supabase
        .from('employee')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error retrieving data from Supabase:', error);
        res.status(500).json({ error: 'Internal server error' });
    } else {
        res.json({ data });
    }
});

// Create data
app.post('/api/employee', async (req, res) => {
    const { name, position, salary } = req.body;
    
    const { data, error } = await supabase
        .from('employee')
        .insert([{ name, position, salary }])
        .single();

    if (error) {
        console.error('Error inserting data into Supabase:', error);
        res.status(500).json({ error: 'Internal server error' });
    } else {
        res.status(201).json({ data });
    }
});

// Update data
app.put('/api/employee/:id', async (req, res) => {
    const { id } = req.params;
    const { name, position, salary } = req.body;
    
    const { data, error } = await supabase
        .from('employee')
        .update({ name, position, salary })
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error updating data in Supabase:', error);
        res.status(500).json({ error: 'Internal server error' });
    } else {
        res.json({ data });
    }
});

// Delete data
app.delete('/api/employee/:id', async (req, res) => {
    const { id } = req.params;
    
    const { data, error } = await supabase
        .from('employee')
        .delete()
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error deleting data from Supabase:', error);
        res.status(500).json({ error: 'Internal server error' });
    } else {
        res.json({ data });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});