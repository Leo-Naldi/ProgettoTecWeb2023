

$(function() {

    console.log('AAAAAAAAAAA')
    const mod_data = localStorage.getItem('modDashboardData');

    if (mod_data?.token) {

        const timestamp = new dayjs(mod_data.timestamp);
        const exp = timestamp.add(1, 'week');

        if ((new dayjs).isBefore(exp)) {
            
            window.location.href = config.dasboard_href; 
        }
    }

    $("form").on('submit', function(event) {
        event.preventDefault();
        
        const form_object = $(this).serializeArray()
            .reduce((acc, cur) => {
                acc[cur['name']] = cur['value']
            }, new Object())
        
        console.log("AYYY it works")
    })
});


// Get a reference to the form element
const form = document.getElementById("myForm");

// Event handler function for form submission
form.addEventListener("submit", function (event) {
});

function login(event) {
    event.preventDefault(); // Prevent the default form submission

    // Collect form values
    const formData = new FormData(form);
    const formObject = {};

    // Convert FormData to a plain JavaScript object
    formData.forEach((value, key) => {
        formObject[key] = value;
    });

    // Convert the object to JSON
    const jsonData = JSON.stringify(formObject);

    // Send JSON data as a POST request
    fetch("https://example.com/api/endpoint", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: jsonData
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Network response was not ok.");
            }
        })
        .then(data => {
            // Handle the response data as needed
            console.log("Response Data:", data);
        })
        .catch(error => {
            // Handle errors
            console.error("Error:", error);
        });
}