// service.html js part

// get elements

// const container = document.getElementById("sub-services-container")
// const title = document.getElementById("page-title")
// const searchInput = document.getElementById("service-search")

// // get selected category from main page
// const selectedCategory = localStorage.getItem("category")

// // find selected service from shared data
// const selectedService = services.find(s => s.id === selectedCategory);

// // if category is selected -> show its sub-services

// if (selectedService) {
//   title.innerText = selectedService.name + " Services";

//   selectedService.subServices.forEach(sub => {
//     const card = `
//     <div class="service-card" onclick="selectSubService('${sub}')">
//     <i class="fa-solid ${selectedService.icon}"></i>
//     <h3>${sub}</h3>
//     <p>${selectedService.name} Service</p>
//     <a href="booking.html" class="btn">Book Now</a>
//     </div>`;
//     container.innerHTML += card;
//   });
// }

// // if no category selected -> show all services

// else {
//   title.innerText = "All services";

//    services.forEach(service => {
//     service.subServices.forEach(sub => {
//       const card = `
//         <div class="service-card" onclick="selectSubService('${sub}')">
//           <i class="fa-solid ${service.icon}"></i>
//           <h3>${service.name}</h3>
//           <p>${service.description || "Explore services"}</p>
//           <a href="booking.html" class="btn">Book Now</a>
//         </div>
//       `;
//       container.innerHTML += card;
//     });
//   });
// }

// // store selected sub-service

// function selectSubService(serviceName) {
//   localStorage.setItem("selectedService", serviceName);
// }

// const selectCategory = localStorage.getItem("category")
// localStorage.setItem("selectedCategory", selectCategory);

// function openCategory(id) {
//   localStorage.setItem("category",id);
//   window.location.reload();
// }

// if (!selectedCategory) {
//   title.innerText = "All service Categories";
// }

// // search functionality (live filter)

// if (searchInput) {
//   searchInput.addEventListener("keyup", function() {

//     let value = this.value.toLowerCase();
//     let cards = document.querySelectorAll(".service-card");

//     cards.forEach(card => {
//       let text = card.innerText.toLowerCase();

//       if (text.includes(value)) {
//         card.style.display = "";
//       } else {
//         card.style.display = "none";
//       }
//     });
//   });
// }

// const searchInput = document.getElementById("service-search");  //get search box
// const cards = document.querySelectorAll(".service-card");       //get all service cards
// const noResult = document.getElementById("no-result");          //get "no result" message

// if (searchInput && noResult) {
// searchInput.addEventListener("keyup", function () {            // run when user types, keyup → triggers after key is released
//   let value = this.value.toLowerCase();                        //gets input and convert it to lowercase
//   let found = false;                                           //track if match exists

//   cards.forEach((card) => {                                    //loops all cards
//     let text = card.innerText.toLowerCase();                   //gets card text

//     if (text.includes(value)) {                                //if matches search
//       card.style.display = "";                                 //show card + mark found
//       found = true;                                            
//     } else {
//       card.style.display = "none";                             // hide card
//     }
//   });
//   noResult.style.display = found ? "none" : "block";          // show message if nothing found
// });
// };


// ==========================
// ELEMENTS
// ==========================
const container = document.getElementById("services-container");
const title = document.getElementById("page-title");
const searchInput = document.getElementById("service-search");
const noResult = document.getElementById("no-result");

// ==========================
// GET CATEGORY
// ==========================
const selectedCategory = localStorage.getItem("category");

// ==========================
// RENDER FUNCTIONS
// ==========================

// 👉 Show Categories
function renderCategories() {
    title.innerText = "All Services";

    let html = "";

    servicesData.forEach(service => {
        html += `
        <div class="service-card" data-id="${service.id}">
            <i class="fa-solid ${service.icon}"></i>
            <h3>${service.name}</h3>
            <p>${service.description}</p>
        </div>
        `;
    });

    container.innerHTML = html;

    // Click → go to sub-services
    document.querySelectorAll(".service-card").forEach(card => {
        card.addEventListener("click", () => {
            const id = card.getAttribute("data-id");
            localStorage.setItem("category", id);
            window.location.reload();
        });
    });
}


// 👉 Show Sub-Services
function renderSubServices(service) {
    title.innerText = service.name + " Services";

    let html = "";

    service.subServices.forEach(sub => {
        html += `
        <div class="service-card" data-service='${JSON.stringify(sub)}'>
            <i class="fa-solid ${service.icon}"></i>
            <h3>${sub.name}</h3>
            <p>Starting from ₹${sub.price}</p>
            <button class="btn book-btn">Book Now</button>
        </div>
        `;
    });

    container.innerHTML = html;

    // Book button click
    document.querySelectorAll(".book-btn").forEach((btn, index) => {
        btn.addEventListener("click", () => {
            const selected = service.subServices[index];

            localStorage.setItem("selectedService", JSON.stringify(selected));
            window.location.href = "booking.html";
        });
    });
}


// ==========================
// MAIN LOGIC
// ==========================
if (selectedCategory) {
    const service = servicesData.find(s => s.id === selectedCategory);

    if (service) {
        renderSubServices(service);
    } else {
        renderCategories();
    }
} else {
    renderCategories();
}


// ==========================
// SEARCH FUNCTION
// ==========================
if (searchInput) {
    searchInput.addEventListener("keyup", function () {

        let value = this.value.toLowerCase();
        let cards = document.querySelectorAll(".service-card");
        let found = false;

        cards.forEach(card => {
            let text = card.innerText.toLowerCase();

            if (text.includes(value)) {
                card.style.display = "";
                found = true;
            } else {
                card.style.display = "none";
            }
        });

        if (noResult) {
            noResult.style.display = found ? "none" : "block";
        }
    });
}