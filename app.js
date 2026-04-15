// =======================
// SEARCH FUNCTIONALITY
// =======================
// 🔔 Unlock audio after first user click
document.addEventListener("click", function () {
    const sound = document.getElementById("bellSound");
    if(sound){
        sound.play().then(() => {
            sound.pause();
            sound.currentTime = 0;
        });
    }
}, { once: true });
const searchicon1 = document.querySelector('#searchicon1');
const search1 = document.querySelector('#searchinput1');
const searchicon2 = document.querySelector('#searchicon2');
const search2 = document.querySelector('#searchinput2');

searchicon1.addEventListener('click', () => {
    search1.style.display = 'flex';
    searchicon1.style.display = 'none';
});

searchicon2.addEventListener('click', () => {
    search2.style.display = 'flex';
    searchicon2.style.display = 'none';
});

function searchFood(inputId) {
    inputId = inputId || "searchInput";
    const input = document.getElementById(inputId).value.toLowerCase();
    const items = document.querySelectorAll(".food-items .item");
    items.forEach(item => {
        const name = item.querySelector("h3").innerText.toLowerCase();
        item.classList.toggle("hide", !name.includes(input));
    });
}

// =======================
// MOBILE MENU TOGGLE
// =======================
const bar = document.querySelector('.fa-bars');
const cross = document.querySelector('#hdcross');
const headerbar = document.querySelector('.headerbar');

bar.addEventListener('click', () => {
    setTimeout(() => cross.style.display = 'block', 200);
    headerbar.style.right = '0%';
});

cross.addEventListener('click', () => {
    cross.style.display = 'none';
    headerbar.style.right = '-100%';
});

// =======================
// PAGE NAVIGATION
// =======================
const homeSection = document.querySelector(".home");
const aboutSection = document.querySelector("#about");
const contactSection = document.querySelector("#contact");
const menuSection = document.querySelector("#menu");
const navItems = document.querySelectorAll(".nav a");

function hideAllSections() {
    [homeSection, aboutSection, contactSection, menuSection].forEach(sec => {
        if (sec) sec.style.display = 'none';
    });
}

navItems.forEach(item => {
    item.addEventListener('click', e => {
        e.preventDefault();
        const text = item.innerText.toLowerCase().trim();
        hideAllSections();
        headerbar.style.right = "-100%";
        cross.style.display = "none";

        if (text === "home") homeSection.style.display = "block";
        else if (text === "menu") menuSection.style.display = "block";
        else if (text === "about") aboutSection.style.display = "block";
        else if (text === "contact") contactSection.style.display = "block";

        // fix food cards layout on mobile
        const foodItems = document.querySelectorAll(".food-items");
        foodItems.forEach(section => {
            section.style.display = "flex";
            section.style.flexDirection = window.innerWidth <= 768 ? "column" : "row";
            section.style.alignItems = "center";
        });
    });
});

// default page
hideAllSections();
homeSection.style.display = "block";

// =======================
// LOGIN / SIGNUP POPUP
// =======================
const loginBox = document.querySelector(".login-container");
const userTab = document.getElementById("userTab");
const adminTab = document.getElementById("adminTab");
const signupLink = document.getElementById("signupLink");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const username = document.getElementById("username");
const password = document.getElementById("password");
const newUsername = document.getElementById("newUsername");
const newPassword = document.getElementById("newPassword");

let currentRole = "user";
userTab.onclick = () => { currentRole = "user"; userTab.classList.add("active"); adminTab.classList.remove("active"); };
adminTab.onclick = () => { currentRole = "admin"; adminTab.classList.add("active"); userTab.classList.remove("active"); };

signupLink.onclick = e => {
    e.preventDefault();
    loginForm.style.display = "none";
    signupForm.style.display = "block";
};

loginForm.onsubmit = async e => {
    e.preventDefault();
    const res = await fetch("/login", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ username: username.value, password: password.value })
    });
    const data = await res.json();
    if (data.status === "success") {
    alert("Login successful");

    // ✅ SAVE LOGIN USER
    localStorage.setItem("loggedUser", data.username);
    localStorage.setItem("role", data.role);

    loginBox.style.display = "none";

    if (data.role === "admin") {
        window.location.href = "/admin";
    }
    
    }else {          // ✅ ADD THIS LINE

        alert(data.msg);   // ✅ ADD THIS LINE

    }               
};

signupForm.onsubmit = async e => {
    e.preventDefault();
    const res = await fetch("/signup", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ username: newUsername.value, password: newPassword.value })
    });
    const data = await res.json();
    if (data.status === "success") {
        alert("Signup successful! Login now.");
        signupForm.style.display = "none";
        loginForm.style.display = "block";
    } else alert(data.msg);
};

document.getElementById("user-lap").onclick = () => loginBox.style.display = loginBox.style.display === "block" ? "none" : "block";
document.getElementById("user-mb").onclick = () => loginBox.style.display = loginBox.style.display === "block" ? "none" : "block";
document.getElementById("logoutBtn").addEventListener("click", async e => {
    e.preventDefault();  // prevent default button behavior
    try {
        const res = await fetch("/logout", { method: "POST" });  // POST now
        const data = await res.json();  // parse JSON

        if (data.status === "success") {
            alert("Logout successful");  // show message
            window.location.href = "/";  // redirect
        } else {
            alert("Logout failed");
        }
    } catch (err) {
        console.error(err);
        alert("Logout failed");
    }
});

// =======================
// ORDER POPUP FUNCTIONALITY
// =======================
// ORDER POPUP FUNCTIONALITY
// =======================
// =======================
// ORDER POPUP FIX (FINAL)
// =======================
const orderPopup = document.getElementById("orderPopup");
const foodNameElem = document.getElementById("foodName");
const foodPriceElem = document.getElementById("foodPrice");
const quantityInput = document.getElementById("quantity");
const totalPriceElem = document.getElementById("totalPrice");

// OPEN ORDER
function openOrder(name, price) {
    const loggedUser = localStorage.getItem("loggedUser");
    if (!loggedUser) {
        alert("Please login first!");
        return;
    }

    foodNameElem.innerText = name;
    foodPriceElem.innerText = price;
    quantityInput.value = 1;
    totalPriceElem.innerText = price;

    orderPopup.style.display = "flex";
}

  // On page load, fill the name input with logged-in username
  document.addEventListener("DOMContentLoaded", () => {
    // Flask passes username via template variable
   
   const usernameInput = document.getElementById("usernameInput");
    if (usernameInput) usernameInput.value = loggedUser;

    orderPopup.style.display = "flex";
  });



// CLOSE ORDER
function closeOrder() {
    orderPopup.style.display = "none";
}

// AUTO UPDATE TOTAL
quantityInput.addEventListener("input", () => {
    const qty = Number(quantityInput.value) || 1;
    const price = Number(foodPriceElem.innerText);
    totalPriceElem.innerText = qty * price;
});

// PAYMENT METHOD
function toggleUPI() {
    const method = document.getElementById("paymentMethod").value;
    document.getElementById("upiPin").style.display =
        method === "upi" ? "block" : "none";
}

// PRE-ORDER BUTTON CLICK (DESKTOP + MOBILE)
document.addEventListener("click", function (e) {
    const btn = e.target.closest(".pre-order-btn");
    if (!btn) return;

    openOrder(btn.dataset.name, btn.dataset.price);
});
// =======================
// CONFIRM ORDER → BACKEND
// =======================
// CONFIRM ORDER → BACKEND (FIXED)
// =======================


document.addEventListener("click", async function(e) {
    const btn = e.target.closest("#confirmOrderBtn");
    if (!btn) return;

    const food = document.getElementById("foodName").innerText;
    const quantity = Number(document.getElementById("quantity").value);

    const payment_method = document.getElementById("paymentMethod").value;
const upi_pin = document.getElementById("upiPinInput")?.value || "";
// ===== CARD VALIDATION START =====
if (payment_method === "card") {
    const cardNumber = document.getElementById("cardNumber")?.value.trim();
    const expiryDate = document.getElementById("expiryDate")?.value.trim();
    const cvv = document.getElementById("cvv")?.value.trim();

    if (!cardNumber || !expiryDate || !cvv) {
        alert("❌ Please fill all card details!");
        return;
    }

    if (cardNumber.length !== 16 || isNaN(cardNumber)) {
        alert("❌ Card number must be 16 digits!");
        return;
    }

    if (cvv.length !== 3 || isNaN(cvv)) {
        alert("❌ CVV must be 3 digits!");
        return;
    }
}
// ===== CARD VALIDATION END =====


const res = await fetch("/place_order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        food_name: food,
        quantity: quantity,
        payment_method: payment_method,
        upi_pin: upi_pin
    })
});


    const data = await res.json();

   if (data.status === "Paid") {
    alert("✅ Payment Successful\nTransaction ID: " + data.transaction_id);
    document.getElementById("orderPopup").style.display = "none";
}
else if (data.status === "Pending") {
    alert("🕒 Order Placed Successfully!\nPayment: Cash\nStatus: Pending");
    document.getElementById("orderPopup").style.display = "none";
}
else if (data.status === "Failed") {
    alert("❌ Payment Failed! Try again.");
}
else {
    alert("❌ user is not logged!");
}


});
// Check every 5 seconds for logged-in user's ready orders
setInterval(async () => {
    try {
        const res = await fetch("/check_my_order_ready");
        const data = await res.json();

        if (data.status === "success" && data.ready_orders.length > 0) {
            data.ready_orders.forEach(async order => {
                // 🔔 ADD THESE LINES
        const sound = document.getElementById("bellSound");
        if(sound){
            sound.volume = 1;
            sound.currentTime = 0;
            sound.play().catch(()=>{});
        }
                alert(`✅ Your order "${order.food_name}" is ready!`);

                // mark as notified so it won't alert again
                await fetch("/mark_my_order_notified", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ order_id: order.id })
                });
            });
        }
    } catch (err) {
        console.error("Error checking my ready orders:", err);
    }
}, 5000);
function toggleMenu() {
    // hide all sections first
    hideAllSections();

    // show menu
    if (menuSection) menuSection.style.display = "block";

    // scroll smoothly
    menuSection.scrollIntoView({ behavior: "smooth" });

    // close mobile menu if open
    headerbar.style.right = "-100%";
    cross.style.display = "none";

    // fix food cards layout on mobile
    const foodItems = document.querySelectorAll(".food-items");
    foodItems.forEach(section => {
        section.style.display = "flex";
        section.style.flexDirection = window.innerWidth <= 768 ? "column" : "row";
        section.style.alignItems = "center";
    });
}
function toggleUPI() {
    const method = document.getElementById("paymentMethod").value;

    const upiField = document.getElementById("upiPin");
    const cardField = document.getElementById("cardDetails");

    if (!upiField || !cardField) return;

    upiField.style.display = "none";
    cardField.style.display = "none";

    if (method === "upi") {
        upiField.style.display = "block";
    }

    if (method === "card") {
        cardField.style.display = "block";
    }
}

const reviewsFeed = document.getElementById('reviewsFeed');

function submitReview() {
  const name = document.getElementById('userName').value.trim();
  const text = document.getElementById('userReview').value.trim();
  const stars = parseInt(document.getElementById('userRating').value);

  if(!name || !text) {
    alert("Please enter your name and review!");
    return;
  }

  const card = document.createElement('div');
  card.className = 'review-card';
  card.innerHTML = `
    <div class="review-header">
      <span>${name}</span>
      <span class="rating">${'⭐️'.repeat(stars)}${'☆'.repeat(5-stars)}</span>
    </div>
    <p>${text}</p>
  `;

  reviewsFeed.prepend(card); // Add review at top
  setTimeout(() => card.classList.add('show'), 100);

  document.getElementById('userName').value = '';
  document.getElementById('userReview').value = '';
  document.getElementById('userRating').value = 5;
}

// Optional: live demo reviews
const fakeReviews = [
  {name:"Alice", text:"Loved it!", stars:5},
  {name:"Bob", text:"Great quality", stars:4},
];

setInterval(() => {
  const r = fakeReviews[Math.floor(Math.random() * fakeReviews.length)];
  const card = document.createElement('div');
  card.className='review-card';
  card.innerHTML = `<div class="review-header"><span>${r.name}</span><span class="rating">${'⭐️'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</span></div><p>${r.text}</p>`;
  reviewsFeed.prepend(card);
  setTimeout(()=>card.classList.add('show'), 100);
}, 10000);
let storedNotifications = [];

// Fetch notifications
function checkNotifications() {
    fetch("/check_my_order_ready")
        .then(res => res.json())
        .then(data => {

            if (data.status === "success") {

                storedNotifications = data.ready_orders;

                const badge = document.getElementById("notifCount");

                if (storedNotifications.length > 0) {
                    badge.style.display = "flex";
                    badge.innerText = storedNotifications.length;
                } else {
                    badge.style.display = "none";
                }
            }
        });
}

// Bell Click Event
document.querySelectorAll(".bellIcon").forEach(bell => {
    bell.addEventListener("click", function () {
        new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_4f0f3f3e3c.mp3?filename=notification-2-269292.mp3").play();
       
const sound = document.getElementById("bellSound");
if(sound){
    sound.volume = 1;      // 🔊 ADD HERE
    sound.currentTime = 0;
    sound.play().catch(function(err){
        console.log("Audio blocked:", err);
    });
}
    if (storedNotifications.length === 0) {
        alert("No new notifications");
        return;
    }

    storedNotifications.forEach(async order => {

        alert("🍽 Your order for " + order.food_name + " is Ready!");

        await fetch("/mark_my_order_notified", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_id: order.id })
        });
    });

    storedNotifications = [];
    document.getElementById("notifCount").style.display = "none";
});
});


// Auto check every 5 seconds
setInterval(checkNotifications, 5000);
window.onload = checkNotifications;

function showBill() {
    // Hide all main sections
    document.querySelectorAll('.home, .menu, .about, .contact').forEach(s => s.style.display = 'none');
    
    // Show the bill
    document.getElementById('mybill').style.display = 'block';
}

// Optional: Back button hides the bill and shows home
document.querySelector('.back-btn').addEventListener('click', function(e) {
    e.preventDefault();
    
    // Hide the bill section
    document.getElementById('mybill').style.display = 'none';
    
    // Use existing function to hide all main sections
    hideAllSections();
    
    // Show only home section
    document.querySelector('.home').style.display = 'block';
});
  
// Only run live order code on home page
