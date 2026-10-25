const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
const DATA = path.join(__dirname, 'data.json');
app.use(express.json({limit:'20kb'}));
app.use(express.static(path.join(__dirname, 'public')));
function readData(){try{return JSON.parse(fs.readFileSync(DATA,'utf8'))}catch{return []}}
function saveData(items){fs.writeFileSync(DATA,JSON.stringify(items,null,2))}
app.get('/api/health',(req,res)=>res.json({status:'ok',application:'Security Incident Report Manager'}));
app.get('/api/incidents',(req,res)=>res.json(readData()));
app.post('/api/incidents',(req,res)=>{
 const {title,description,severity}=req.body||{};
 if(typeof title!=='string'||title.trim().length<3||title.length>100) return res.status(400).json({error:'Title must be 3–100 characters.'});
 if(typeof description!=='string'||description.trim().length<5||description.length>1000) return res.status(400).json({error:'Description must be 5–1000 characters.'});
 if(!['Low','Medium','High','Critical'].includes(severity)) return res.status(400).json({error:'Choose a valid severity.'});
 const items=readData(); const item={id:Date.now().toString(),title:title.trim(),description:description.trim(),severity,status:'Open',createdAt:new Date().toISOString()};
 items.unshift(item);saveData(items);res.status(201).json(item);
});
app.patch('/api/incidents/:id',(req,res)=>{
 const items=readData(), item=items.find(x=>x.id===req.params.id);
 if(!item)return res.status(404).json({error:'Incident not found.'});
 if(!['Open','Investigating','Resolved'].includes(req.body.status))return res.status(400).json({error:'Invalid status.'});
 item.status=req.body.status;saveData(items);res.json(item);
});
app.listen(PORT,()=>console.log('Security Incident Report Manager running at http://localhost:'+PORT));
