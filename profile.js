const logoutBtn = document.querySelector("#logoutBtn");

// Theme for profile

const applyTheme = () => {
    const savedTheme = localStorage.getItem("theme") || "purple";

    document.body.classList.remove("purple", "green", "blue");

    document.body.classList.add(savedTheme);
};

applyTheme();

const logout = () => {
    localStorage.clear();
    location.reload();
};

let readingListData = [];
let ratedBooksData = [];

const getReadingList = async () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    // If not logged in
    if(!token || !user) {
        window.location.href = "index.html";
        return;
    }

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

const getRatedBooks = async () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    const response = await axios.get(`http://localhost:1337/api/ratings?filters[users_permissions_user][id][$eq]=${user.id}&populate[book][populate]=image`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    console.log(response.data);

    ratedBooksData = response.data.data;

    renderRatedBooks(ratedBooksData);
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

const renderRatedBooks = (list) => {
    const container = document.querySelector("#rated-books");

    container.innerHTML = "";

    list.forEach(item => {
        const book = item.book;
        console.log(book);
        console.log(item);
        const imageUrl = book.image?.length > 0
        ? "http://localhost:1337" + book.image[0].url
        : "";

        container.innerHTML += `
        <div class="book-card">
            <h3>${book.title}</h3>
            <p>${book.author}</p>
            <p>Your rating: ${item.rating}</p>
            <img src="${imageUrl}" width="80">
        </div>
        `;
    });
};

const removeBook = async (bookId) => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    // Remove from array
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

// Sort title in my reading list
const sortByTitle = () => {
    const sorted = [...readingListData].sort((a, b) =>
        a.title.localeCompare(b.title)
    );

    renderReadingList(sorted);
};

// Sort author in my reading list
const sortByAuthor = () => {
    const sorted = [...readingListData].sort((a, b) =>
        a.author.localeCompare(b.author)
    );

    renderReadingList(sorted);
};

// Sort rated books
// Sort title in my rated books
const sortRatedByTitle = () => {
    const sorted = [...ratedBooksData].sort((a, b) =>
        a.book.title.localeCompare(b.book.title)
    );

    renderRatedBooks(sorted);
};

// Sort author in my rated books
const sortRatedByAuthor = () => {
    const sorted = [...ratedBooksData].sort((a, b) =>
        a.book.author.localeCompare(b.book.author)
    );

    renderRatedBooks(sorted);
};
// Sort rating in my rated books
const sortRatedByRating = () => {
    const sorted = [...ratedBooksData].sort((a, b) =>
        b.rating - a.rating //sortering betyg högst → lägst
    );

    renderRatedBooks(sorted);
};

logoutBtn.addEventListener("click", logout);

// Calling
getReadingList();
getRatedBooks();

// Footer
const updateFooter = () => {
    const footer = document.querySelector("#footer");

    if (!footer) return;

    const year = new Date().getFullYear();

    footer.textContent = `© ${year} Ariam Goitom. All rights reserved.`;
};

updateFooter();