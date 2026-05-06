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
        console.log(error.response?.data);
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
        console.log(error.response.data);
        alert("Wrong register");
    }
};

const logout = () => {
    localStorage.clear();
    location.reload();
};

const profileSection = document.querySelector("#profile-section");

const checkLogin = () => {
    let token = localStorage.getItem("token");
    let user = JSON.parse(localStorage.getItem("user"));

    if(token) {
        userInfo.innerHTML = `Logged in as: ${user.username}`;
        logoutBtn.style.display = "block";
        profileSection.style.display = "block"; // show profile side when logged in

        getReadingList();
    } else {
        userInfo.innerHTML = "Not logged in";
        logoutBtn.style.display = "none";
        profileSection.style.display = "none";
    }
    
    getBooks();
};

const getBooks = async () => {
    let response = await axios.get("http://localhost:1337/api/books?populate=*");

    booksContainer.innerHTML = "";

    response.data.data.forEach(book => {
        const imageUrl = book.image?.length > 0
        ? "http://localhost:1337" + book.image[0].url
        : "";

        booksContainer.innerHTML += `
        <div class="book-card">
            <h3>${book.title}</h3>
            <p>Author: ${book.author}</p>
            <p>Pages: ${book.pages}</p>
            <p>Release: ${book.release_date}</p>

            <img src="${imageUrl}" width="100">

            <button onclick="saveBook(${book.id})">Save</button>
        </div>
        `;
        console.log(book);
    });
    
};

let readingListData = [];

const getReadingList = async () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    const response = await axios.get(`http://localhost:1337/api/users/${user.id}?populate=readingList.image`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    readingListData = response.data.readingList || [];

    renderReadingList(readingListData);
};
// Render the list 
const renderReadingList = (list) => {
    const container = document.querySelector("#reading-list");

    container.innerHTML = "";

    list.forEach(book => {
        const imageUrl = book.image?.length > 0
            ? "http://localhost:1337" + book.image[0].url
            : "";

        container.innerHTML += `
        <div class="book-card">
            <h3>${book.title}</h3>
            <p>${book.author}</p>
            <img src="${imageUrl}" width="80">
            <button onclick="removeBook(${book.id})">Remove</button>
        </div>
        `;
    });
};

const removeBook = async (bookId) => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    //remove from array
    const updatedList = readingListData
        .filter(book => book.id !== bookId)
        .map(book => book.id);
    
    await axios.put(`http://localhost:1337/api/users/${user.id}`,
        {
            readingList: updatedList
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    getReadingList();
};

// Sort title
const sortByTitle = () => {
    const sorted = [...readingListData].sort((a, b) =>
        a.title.localeCompare(b.title)
    );

    renderReadingList(sorted);
};

// Sort author
const sortByAuthor = () => {
    const sorted = [...readingListData].sort((a, b) =>
        a.author.localeCompare(b.author)
    );

    renderReadingList(sorted);

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

    const user = JSON.parse(localStorage.getItem("user"));

    try {
        // 1. Get current user (with readingList)
        const userResponse = await axios.get(
            `http://localhost:1337/api/users/${user.id}?populate=readingList`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const currentList = userResponse.data.readingList || [];

        // 2. Get only the ID
        const bookIds = currentList.map(book => book.id);

        // 3. Add a new book (if it doesn't already exist)
        if(!bookIds.includes(bookId)) {
            bookIds.push(bookId);
        }

        // 4. Update user
        await axios.put(`http://localhost:1337/api/users/${user.id}`, {
            readingList: bookIds
        }, 
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
        );

        alert("Book saved");

        getReadingList();

    } catch(error) {
        console.log(error);
        alert("Error saving book");
    }
};