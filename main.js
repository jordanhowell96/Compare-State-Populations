
const apiLink = "https://datausa.io/api/data?drilldowns=State&measures=Population";

const states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
                    'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia',
                    'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
                    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan','Minnesota',
                    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada','New Hampshire',
                    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
                    'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Puerto Rico', 'Rhode Island',
                    'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
                    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];

let rawData

initializePage(apiLink, states);
                    
// Initialize the page by calling getData to get the data from the API as well as addCheckboxes to iteratively add checkboxes for the states
function initializePage(apiLink, statesNames){

    getData(apiLink).then((jsonData) => {
        rawData = jsonData.data
        Object.freeze(rawData);   // Freeze global variable to prevent theoretical unwanted behavior  
    });

    addCheckboxes(statesNames);
}

// Gets the data from the API URL
async function getData(apiLink) {

    const response = await fetch(apiLink);
    const jsonResponse = await response.json();
    
    return jsonResponse;
}

// Iteratively adds checkboxes for the states
function addCheckboxes(statesNames) {

    const checkboxGrid = document.getElementById("checkbox-grid");

    for (let i = 0; i < statesNames.length; i++) {

        const stateName = statesNames[i];

        checkboxGrid.insertAdjacentHTML('beforeend',
            '<div class="grid-item">' + 
                '<input type="checkbox" id="' + stateName + '" onClick=updateChart()>' 
                + stateName + 
            '</div>');
    }
}

// Updates the google chart, uses drawChart function defined below
function updateChart() {

    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart)
}

// Creates the chart by setting the chart settings and calling createDataTable to get the data
function drawChart() {

    // Get the data table for the chart
    const dataTable = createDataTable();

    // Set chart options
    const options = {
        title: 'State Population by Year',
        curveType: 'function',
        legend: { position: 'right' },
        backgroundColor: '#121212',
        titleColor: '#f0f8ff',
        legend: {textStyle: {color: '#f0f8ff'}},
        fontName: 'Trebuchet MS', 
        hAxis: {textStyle:{color: '#525151'}},
        vAxis: {gridlines : {count : 6}, textStyle:{color: '#525151'}},
        lineWidth: 3,
        animation:{startup: true, duration: 600, easing: 'out'},
    };

    const chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

    chart.draw(dataTable, options);
}

// Creates the google data table to be used by the chart by using the data returned by the prepareData function
function createDataTable() {

    const preparedData = prepareData();
    const stateNames = preparedData.stateNames;
    const populationsByYear = preparedData.populationsByYear;
    
    const dataTable = new google.visualization.DataTable(); // object to be returned
    dataTable.addColumn('string', 'Year');

    stateNames.forEach(stateName => {
        dataTable.addColumn('number', stateName);
    });

    // Add the rows to the data table from the prepared data
    Object.keys(populationsByYear).forEach(year => {
        const newRow = populationsByYear[year];
        newRow.unshift(year);
        dataTable.addRow(newRow);
    }); 

    return dataTable;
}

// Gets the necessary data from the API result and organizes it in a new object
function prepareData() {

    const statesPopulationsObject = {stateNames: [], populationsByYear: {}}; // object to be returned

    rawData.slice().reverse().forEach(statePopulation => {

        const stateName = statePopulation.State;
        const year = statePopulation.Year;
        const population = statePopulation.Population;

        stateCheckBox = document.getElementById(stateName);

        // If the checkbox has been checked for that state then add it to the data
        if (stateCheckBox != null && stateCheckBox.checked){

            if (!statesPopulationsObject.stateNames.includes(stateName)){
                statesPopulationsObject.stateNames.push(stateName);
            }
            if (Object.keys(statesPopulationsObject.populationsByYear).includes(year)) {
                statesPopulationsObject.populationsByYear[year].push(population);
            }
            else {
                statesPopulationsObject.populationsByYear[year] = [population];
            }
        }
    }); 

    return statesPopulationsObject;
}



