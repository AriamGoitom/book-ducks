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
const body = document.querySelector("body");
const profileLink = document.querySelector("#profile-link");
const authSection = document.querySelector("#auth-section");

// Theme
const setTheme = (theme) => {
    document.body.classList.remove("purple", "green", "blue");

    document.body.classList.add(theme);

    localStorage.setItem("theme", theme);
};

const login = async () => {
    try {
        let response = await axios.post("http://localhost:1337/api/auth/local", {
            identifier: identifier.value,
            password: password.value
        });
        
        const token = response.data.jwt;
        localStorage.setItem("token", token);

       // Get full user including isAdmin
       const me = await axios.get("http://localhost:1337/api/users/me?populate=*", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

       localStorage.setItem("user", JSON.stringify(me.data));

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

        const token = response.data.jwt;

        localStorage.setItem("token", token);

        const me = await axios.get("http://localhost:1337/api/users/me", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        localStorage.setItem("user", JSON.stringify(me.data));

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

const checkLogin = () => {
    let token = localStorage.getItem("token");
    let user = JSON.parse(localStorage.getItem("user"));

    const adminPanel = document.querySelector("#admin-panel");

    if(token && user) {
        userInfo.innerHTML = `Logged in as: ${user.username}`;
        logoutBtn.style.display = "block";
        profileLink.style.display = "inline-block";
        authSection.style.display = "none";

        // Admin check. Show only if admin
        if(user.isAdmin === true) {
            adminPanel.style.display = "block";
        } else {
            adminPanel.style.display = "none";
        }

    } else {
        userInfo.innerHTML = "Not logged in";
        logoutBtn.style.display = "none";
        adminPanel.style.display = "none";
        authSection.style.display = "flex";
    }

    getBooks();
    getTheme();
};

const getBooks = async () => {
    let response = await axios.get("http://localhost:1337/api/books?populate=*");

    booksContainer.innerHTML = "";

    response.data.data.forEach(book => {

        const ratings = book.ratings || [];

        let averageRating = 0;

        if(ratings.length > 0) {
            
            const total = ratings.reduce((sum, rating) => {
                return sum + rating.rating;
            }, 0);
            // Calculates the average
            averageRating = (total / ratings.length).toFixed(1);
        }

        const imageUrl = book.image?.length > 0
        ? "http://localhost:1337" + book.image[0].url
        : "";

        booksContainer.innerHTML += `
        <div class="book-card">
            <h3>${book.title}</h3>
            <p>Author: ${book.author}</p>
            <p>Pages: ${book.pages}</p>
            <p>Release: ${book.release_date}</p>
            <p>Average rating: ${averageRating}</p>

            <select onchange="rateBook(${book.id}, this.value)">
                <option value="">Rate</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
            </select>

            <img src="${imageUrl}" width="100">

            <button onclick="saveBook(${book.id})">Save</button>
        </div>
        `;
        console.log(book);
        console.log("BOOK:", book);
        console.log("RATINGS:", book.ratings);
    });
    
};

const getTheme = async () => {

    try {
        const response = await axios.get("http://localhost:1337/api/theme");

        const theme = response.data.data.themeName;

        document.body.classList.remove("purple", "green", "blue");

        document.body.classList.add(theme);

        localStorage.setItem("theme", theme);

    } catch(error) {
        console.log(error);
    }
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

        location.reload();

    } catch(error) {
        console.log(error);
        alert("Error saving book");
    }
};
// Rating books
const rateBook = async (bookId, value) => {
    const token = localStorage.getItem("token");

    if(!token) {
        alert("Log in first");
        return;
    }

    const user = JSON.parse(localStorage.getItem("user"));

    try {
        // Create rating
        await axios.post("http://localhost:1337/api/ratings",
            {
                data: {
                    rating: Number(value),
                    users_permissions_user: user.id,
                    book: bookId
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        alert("Rating saved");

        getBooks();
        
    } catch(error) {
       console.log(error.response.data);
    }
};

const createBook = async () => {
    const token = localStorage.getItem("token");

    const title = document.querySelector("#book-title").value;
    const author = document.querySelector("#book-author").value;
    const pages = document.querySelector("#book-pages").value;
    const release_date = document.querySelector("#book-date").value;

    const imageFile = document.querySelector("#book-image").files[0];

    try {

        // 1. Upload image
        let uploadedImageId = null;

        if(imageFile) {

            const formData = new FormData();
            formData.append("files", imageFile);

            const uploadResponse = await axios.post(
                "http://localhost:1337/api/upload",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );
            // Gets the id on the image that is upploaded
            uploadedImageId = uploadResponse.data[0].id;
        }

        // 2. Create book
        await axios.post(
            "http://localhost:1337/api/books",
            {
                data: {
                    title,
                    author,
                    pages,
                    release_date,
                    image: uploadedImageId
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        alert("Book created!");

        getBooks();

    } catch(error) {
        console.log(error.response?.data || error);
        alert("Error creating book");
    }
};

// Footer
const updateFooter = () => {
    const footer = document.querySelector("#footer");

    if (!footer) return;

    const year = new Date().getFullYear();

    footer.textContent = `© ${year} Ariam Goitom. All rights reserved.`;
};

updateFooter();
