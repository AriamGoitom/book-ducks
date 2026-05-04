const identifier = document.querySelector("#identifier");
const password = document.querySelector("#password");
const loginBtn = document.querySelector("#loginBtn");
const registerUsername = document.querySelector("#registerUsername");
const registerEmail = document.querySelector("#registerEmail");
const registerPassword = document.querySelector("#registerPassword");
const registerBtn = document.querySelector("#registerBtn");
const logoutBtn = document.querySelector("#logoutBtn");
const userInfo = document.querySelector("#user-info");
const booksContainer = document.querySelector("#books-container");

const login = async () => {
    try {
        let response = await axios.post("http://localhost:1337/api/auth/local", {
            identifier: identifier.value,
            password: password.value
        });
        localStorage.setItem("token", response.data.jwt);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        checkLogin();
    }
    catch(error){
        alert("Wrong login");
    }
};

const register = async () => {
    try {
        let response = await axios.post("http://localhost:1337/api/auth/local/register", {
            username: registerUsername.value,
            email: registerEmail.value,
            password: registerPassword.value
        });
        localStorage.setItem("token", response.data.jwt);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        checkLogin();
    }
    catch(error) {
        alert("Wrong register");
    }
};

const logout = () => {
    localStorage.clear();
    location.reload();
};

const checkLogin = () => {
    let token = localStorage.getItem("token");
    let user = JSON.parse(localStorage.getItem("user"));

    if(token) {
        userInfo.innerHTML = `Logged in as: ${user.username}`;
        logoutBtn.style.display = "block";
    } else {
        userInfo.innerHTML = "Not logged in";
        logoutBtn.style.display = "none";
    }
    
    getBooks();
};

const getBooks = async () => {
    let response = await axios.get("http://localhost:1337/api/books?populate=*");

    booksContainer.innerHTML = "";

    response.data.data.forEach(book => {
        const imageUrl = book.image?.url
        ? "http://localhost:1337" + book.image.url
        : "";

        booksContainer.innerHTML += `
        <div class="book-card">
            <h3>${book.title}</h3>
            <p>Author: ${book.author}</p>
            <p>Pages: ${book.pages}</p>
            <p>Release: ${book.releaseDate}</p>

            <img src="${imageUrl}" width="100">

            <button onclick="saveBook(${book.id})">Save</button>
        </div>
        `;
    });
};

loginBtn.addEventListener("click", login);
registerBtn.addEventListener("click", register);
logoutBtn.addEventListener("click", logout);

checkLogin();

const saveBook = async (bookId) => {
    const token = localStorage.getItem("token");

    if(!token) {
        alert("Log in first");
        return;
    }

    await axios.put("http://localhost:1337/users/${user.id}", {
        readingList: [bookId]
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    alert("Book saved");
};