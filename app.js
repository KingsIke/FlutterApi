const express = require('express');
const bodyParser = require('body-parser');
const Joi = require('joi');
const fs = require('fs/promises');
const { v4: uuidv4 } = require('uuid'); // Using UUID v4 for generating unique IDs
const path =require('path')


const app = express();
app.use(bodyParser.json());

const dataPath = path.join(__dirname, './data.json');;

let bankAccounts = [];

async function loadAccounts() {
    try {
        const data = await fs.readFile(dataPath, 'utf8');
        bankAccounts = JSON.parse(data);
    } catch (error) {
        console.error('Error loading accounts:', error.message);
    }
}

async function saveAccounts() {
    try {
        const data = JSON.stringify(bankAccounts, null, 2);
        await fs.writeFile(dataPath, data);
    } catch (error) {
        console.error('Error saving accounts:', error.message);
    }
}

loadAccounts();

const accountSchema = Joi.object({
    userId: Joi.string(),
    accountHolderName: Joi.string().required(),
    dob: Joi.date().required(),
    accountType: Joi.string().valid('saving', 'checking').required(),
    initialBalance: Joi.number().min(0).required()
});

app.post('/create-account', (req, res) => {
    try {
        
    
    const { error } = accountSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { accountHolderName, dob, accountType, initialBalance } = req.body;
    const accountNumber = generateAccountNumber();
    const userId = uuidv4(); 
    const account = {
        userId,
        accountNumber,
        accountHolderName,
        dob,
        accountType,
        initialBalance
    };
    bankAccounts.push(account);
    saveAccounts();

    return res.status(201).json({ accountNumber,  accountHolderName,accountType,
        initialBalance });

} catch (error) {
    return res.status(500).json(error)
}

});

app.get('/account/:accountNumber', (req, res) => {
    try {
        
   
    const { accountNumber } = req.params;
    const account = bankAccounts.find(acc => acc.accountNumber === accountNumber);

    if (!account) {
        return res.status(404).json({ error: 'Account not in database' });
    }

    return res.json(account);
} catch (error) {
    return res.status(500).json(error)
        
}
});

app.get('/allAccounts', (req, res) => {
    try {
        return res.json(bankAccounts);
        
    } catch (error) {
    return res.status(500).json(error)
        
    }
});







function generateAccountNumber() {
    const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000);
    return accountNumber.toString();
}

const Port = 4900

app.listen(Port, () => {
    console.log('Server is On')
})