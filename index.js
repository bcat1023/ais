const express = require('express')
const {google} = require('googleapis');
const keys = require('./keys.json')

//initialize express
const app = express()
app.use(express.urlencoded({ extended: true }));

//set up template engine to render html files
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// signup route
app.get('/signup', (request, response) =>{
    response.render('index')
})

app.post('/signup',  async (request, response) =>{
    const {email, password, age, plan} = request.body;
    const seclock = "No";
    const auth = new google.auth.GoogleAuth({
        keyFile: "keys.json", //the key file
        //url to spreadsheets API
        scopes: "https://www.googleapis.com/auth/spreadsheets", 
    });

    //Auth client Object
    const authClientObject = await auth.getClient();
    
    //Google sheets instance
    const googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });

    // spreadsheet id
    const spreadsheetId = "1ZSHAkf9DwLm0d74TmHRLNN3hxHcCAnpCpJcx_VMwa7g";

    // Get metadata about spreadsheet
    const sheetInfo = await googleSheetsInstance.spreadsheets.get({
        auth,
        spreadsheetId,
    });

    //Read from the spreadsheet
    const readData = await googleSheetsInstance.spreadsheets.values.get({
        auth, //auth object
        spreadsheetId, // spreadsheet id
        range: "Account_Information!A:A", //range of cells to read from.
    })

    //write data into the google sheets
    await googleSheetsInstance.spreadsheets.values.append({
        auth, //auth object
        spreadsheetId, //spreadsheet id
        range: "Account_Information!A:E", //sheet name and range of cells
        valueInputOption: "USER_ENTERED", // The information will be passed according to what the usere passes in as date, number or text
        resource: {
            values: [[email, password, age, plan, seclock]]
        },
    });
    
    response.send(`Sign up recived, added to data base <a href=/signin>Sign In</a>`)
});


const PORT = 3000;

//start server
const server = app.listen(PORT, () =>{
    console.log(`Server started on port localhost:${PORT}`);
});
