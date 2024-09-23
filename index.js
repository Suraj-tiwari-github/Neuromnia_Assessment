const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const cors=require('cors');
const app = express();


app.use(express.json());
app.use(helmet()); 

app.use(cors());


app.use(rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
}));


const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Neuromnia API',
      version: '1.0.0',
      description: 'API for the Neuromnia project managing VB-MAPP milestones'
    },
    servers: [
      {
        url: 'http://localhost:3001'
      }
    ],
  },
  apis: ['./routes/*.js'], // 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

let milestones = [];

const loadCsvData = () => {
  const csvFilePath = path.join(__dirname, 'vb_mapp_milestones.csv');
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      milestones.push(row);
    })
    .on('end', () => {
      console.log('CSV file successfully processed');
      console.log('Loaded milestones:', milestones);
    })
    .on('error', (error) => {
      console.error('Error reading CSV file:', error);
    });
};

loadCsvData();

app.get('/api/domains', (req,res)=>{
  const uniqueDomains=[...new Set(milestones.map(row=>row.Domain))];
  res.json(uniqueDomains);
})

app.post('/api/filter',(req,res)=>{
  const { domain, level } = req.body;
  
  const filteredData = csvData.filter(row => row.Domain === domain && row.Level === level);

  if (filteredData.length > 0) {
    res.json(filteredData);
  } else {
    res.status(404).json({ message: 'No milestones found for the selected domain and level.' });
  }
})


app.post('/api/chatbot', (req, res) => {
  console.log(req.body);
  const { action, code, domain, level } = req.body;


  if (action === 'Lookup Milestone') {
    const milestone = milestones.find(m => m['Skill Code'] === code);
    if (milestone) {
      return res.json({ success: true, data: milestone });
    } else {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }
  }


  else if (action === 'List Domain') {
    console.log("Filtering for domain:", domain, "and level:", level);


    const domainMilestones = milestones.filter(m => m.Domain === domain && m.Level === level);

    console.log("Filtered milestones:", domainMilestones);

    if (domainMilestones.length > 0) {
      return res.json({ success: true, data: domainMilestones });
    } else {
      return res.status(404).json({ success: false, message: 'No milestones found for this domain and level' });
    }
  }


  return res.status(400).json({ success: false, message: 'Invalid action' });
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
