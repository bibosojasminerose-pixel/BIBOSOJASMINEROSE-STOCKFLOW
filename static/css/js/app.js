
"use strict";

/* =====================================================
   ROSÉ VANITY | STOCKFLOW
   COMPLETE FRONTEND APPLICATION
===================================================== */

const API = "/api";
const $ = id => document.getElementById(id);
const PAGE_SIZE = 10;

let products = [];
let categories = [];
let transactions = [];
let summary = {};

let currentPage = "dashboard";
let currentView = "table";
let pageNumber = 1;

let editingId = null;
let editingCollection = null;
let pendingDelete = null;

let movementChart = null;
let categoryChart = null;

let toastTimer = null;
let loading = false;
let saving = false;
let dataReady = false;
let loadError = "";
let connectionRequest = null;

const currency = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP"
});

const numberFormat = new Intl.NumberFormat("en-PH");

const PAGE_CONFIG = {
    dashboard: {
        title: "Dashboard"
    },

    products: {
        title: "Products",
        description: "Manage your complete beauty product inventory.",
        collection: "products",
        addLabel: "Add Product"
    },

    categories: {
        title: "Categories",
        description: "Organize your products into beauty collections.",
        collection: "categories",
        addLabel: "Add Category"
    },

    "stock-in": {
        title: "Stock In",
        description: "Record incoming products and replenish inventory.",
        collection: "stock_transactions",
        addLabel: "Record Stock In"
    },

    "stock-out": {
        title: "Stock Out",
        description: "Record outgoing products and monitor stock usage.",
        collection: "stock_transactions",
        addLabel: "Record Stock Out"
    },

    stock_transactions: {
        title: "Transactions",
        description: "Review your complete inventory movement history.",
        collection: "stock_transactions",
        addLabel: ""
    },

    reports: {
        title: "Reports"
    }
};


/* =====================================================
   GENERAL HELPERS
===================================================== */

function on(id, event, handler) {
    const element = $(id);

    if (element) {
        element.addEventListener(event, handler);
    } else {
        console.warn("Missing HTML element:", id);
    }
}


function setText(id, value) {
    const element = $(id);

    if (element) {
        element.textContent = value;
    }
}


function setHTML(id, value) {
    const element = $(id);

    if (element) {
        element.innerHTML = value;
    }
}


function refreshIcons() {
    try {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    } catch (error) {
        console.warn("Icon rendering error:", error);
    }
}


function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}


function formatMoney(value) {
    return currency.format(Number(value) || 0);
}


function formatNumber(value) {
    return numberFormat.format(Number(value) || 0);
}


function recordId(record) {
    return String(record?.id ?? "");
}


function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString("en-PH", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}


function categoryName(id) {
    return categories.find(
        item => recordId(item) === String(id)
    )?.name || "Uncategorized";
}


function productName(id) {
    return products.find(
        item => recordId(item) === String(id)
    )?.name || "Unknown Product";
}


/* =====================================================
   PRODUCT PHOTOGRAPHY
===================================================== */

function getCategoryPhoto(category) {

    const name = String(category).toLowerCase();

    if (/lip/.test(name)) {

        return "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=650&q=80";

    }

    if (/skin|serum|cleanser|moisturizer|sunscreen/.test(name)) {

        return "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=650&q=80";

    }

    return "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=650&q=80";

}


function fallbackImage() {

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg"
             width="500" height="300">

            <rect width="100%" height="100%"
                  fill="#481426"/>

            <circle cx="250" cy="135" r="65"
                    fill="none"
                    stroke="#dfbf96"/>

            <text x="250" y="150"
                  text-anchor="middle"
                  font-family="Georgia"
                  font-size="46"
                  fill="#dfbf96">RV</text>

            <text x="250" y="235"
                  text-anchor="middle"
                  font-family="Georgia"
                  font-size="22"
                  fill="#dfbf96">Rosé Vanity</text>

        </svg>
    `;

    return "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(svg);

}


document.addEventListener("error", event => {

    const image = event.target;

    if (
        image instanceof HTMLImageElement &&
        !image.dataset.fallback
    ) {

        image.dataset.fallback = "true";

        image.src = fallbackImage();

    }

}, true);


/* =====================================================
   TOAST NOTIFICATIONS
===================================================== */

function showToast(message, type = "success") {

    clearTimeout(toastTimer);

    setText(
        "toastTitle",
        type === "error"
            ? "Unable to Complete"
            : "Success"
    );

    setText("toastMessage", message);

    setHTML("toastIcon", `
        <i data-lucide="${
            type === "error"
                ? "circle-alert"
                : "check-circle"
        }"></i>
    `);

    const toast = $("toast");

    if (toast) {

        toast.className =
            `toast show ${type === "error" ? "error" : ""}`;

    }

    refreshIcons();

    toastTimer = setTimeout(() => {

        $("toast")?.classList.remove("show");

    }, 4500);

}


/* =====================================================
   FLASK API CONNECTION
===================================================== */

async function requestAPI(path, options = {}) {

    const controller = new AbortController();

    const timeout = setTimeout(() => {

        controller.abort();

    }, 30000);

    try {

        const response = await fetch(`${API}${path}`, {

            ...options,

            cache: "no-store",

            signal: controller.signal,

            headers: {

                "Accept": "application/json",

                "Content-Type": "application/json",

                ...(options.headers || {})

            }

        });

        const raw = await response.text();

        let result;

        try {

            result = JSON.parse(raw);

        } catch {

            throw new Error(
                `Invalid server response (${response.status}).`
            );

        }

        if (!response.ok || result.success === false) {

            throw new Error(
                result.message ||
                result.error ||
                `Request failed (${response.status}).`
            );

        }

        return result;

    } catch (error) {

        if (error.name === "AbortError") {

            throw new Error("The server request timed out.");

        }

        throw error;

    } finally {

        clearTimeout(timeout);

    }

}


/* =====================================================
   IMMEDIATE FIRESTORE CONNECTION CHECK
===================================================== */

function updateConnectionStatus(connected) {

    const dot = $("connectionDot");

    const text = $("connectionText");

    if (dot) {

        dot.className = connected
            ? "connection-dot online"
            : "connection-dot offline";

    }

    if (text) {

        text.textContent = connected
            ? "Firestore Connected"
            : "Connection Failed";

    }

}


function checkConnection() {

    // Prevent duplicate simultaneous health requests.

    if (connectionRequest) {

        return connectionRequest;

    }

    connectionRequest = (async () => {

        try {

            const result = await requestAPI("/health");

            if (result.success !== true) {

                throw new Error(
                    result.message || "Firestore unavailable."
                );

            }

            updateConnectionStatus(true);

            console.log(
                "Firestore connected:",
                result.message
            );

            return true;

        } catch (error) {

            updateConnectionStatus(false);

            console.error(
                "Firestore connection failed:",
                error
            );

            return false;

        } finally {

            connectionRequest = null;

        }

    })();

    return connectionRequest;

}


/* =====================================================
   LOAD ACTUAL FIRESTORE RECORDS
===================================================== */

async function loadData(notify = false) {

    if (loading) return false;

    loading = true;

    loadError = "";

    const refreshButton = $("refreshBtn");

    if (refreshButton) {

        refreshButton.disabled = true;

    }

    try {

        const results = await Promise.all([

            requestAPI("/products"),

            requestAPI("/categories"),

            requestAPI("/stock-transactions"),

            requestAPI("/summary")

        ]);

        products = Array.isArray(results[0].data)
            ? results[0].data
            : [];

        categories = Array.isArray(results[1].data)
            ? results[1].data
            : [];

        transactions = Array.isArray(results[2].data)
            ? results[2].data
            : [];

        summary = results[3].data || {};

        dataReady = true;

        populateFilters();

        renderCurrentPage();

        if (notify) {

            showToast("Inventory records refreshed.");

        }

        return true;

    } catch (error) {

        loadError = error.message;

        console.error("Inventory loading error:", error);

        renderCurrentPage();

        showToast(
            `Unable to load records. ${error.message}`,
            "error"
        );

        return false;

    } finally {

        loading = false;

        if (refreshButton) {

            refreshButton.disabled = false;

        }

    }

}


/* =====================================================
   DARK AND LIGHT MODE
   HEADER BUTTON ONLY
===================================================== */

function getSavedTheme() {

    try {

        return localStorage.getItem("stockflow-theme") === "dark"
            ? "dark"
            : "light";

    } catch {

        return "light";

    }

}


function setTheme(theme) {

    const mode = theme === "dark"
        ? "dark"
        : "light";

    document.documentElement.dataset.theme = mode;

    try {

        localStorage.setItem("stockflow-theme", mode);

    } catch (error) {

        console.warn("Theme storage unavailable:", error);

    }

    const themeButton = $("quickTheme");

    if (themeButton) {

        themeButton.innerHTML = `
            <i data-lucide="${
                mode === "dark" ? "sun" : "moon"
            }"></i>
        `;

        themeButton.title =
            mode === "dark"
                ? "Switch to Light Mode"
                : "Switch to Dark Mode";

        themeButton.setAttribute(
            "aria-label",
            themeButton.title
        );

    }

    refreshIcons();

    if (currentPage === "dashboard" && dataReady) {

        renderCharts();

    }

}


function toggleTheme() {

    const current =
        document.documentElement.dataset.theme;

    setTheme(
        current === "dark" ? "light" : "dark"
    );

}


/* =====================================================
   SIDEBAR MANAGEMENT
===================================================== */

function toggleSidebar() {

    if (window.innerWidth <= 800) {

        document.body.classList.toggle("mobile-open");

    } else {

        document.body.classList.toggle("sidebar-collapsed");

    }

}


function closeMobileSidebar() {

    document.body.classList.remove("mobile-open");

}


/* =====================================================
   PAGE NAVIGATION
===================================================== */

function navigate(page) {

    if (!PAGE_CONFIG[page]) return;

    currentPage = page;

    pageNumber = 1;

    if ($("searchInput")) {

        $("searchInput").value = "";

    }

    if ($("filterSelect")) {

        $("filterSelect").value = "";

    }

    document.querySelectorAll(".nav-link[data-page]")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === page
            );

        });

    document.querySelectorAll(".page")
        .forEach(section => {

            section.classList.remove("active");

        });

    setText("pageTitle", PAGE_CONFIG[page].title);

    if (page === "dashboard") {

        $("dashboardPage")?.classList.add("active");

    } else if (page === "reports") {

        $("reportsPage")?.classList.add("active");

    } else {

        $("recordsPage")?.classList.add("active");

        const config = PAGE_CONFIG[page];

        setText("recordTitle", config.title);

        setText("recordDescription", config.description);

        const addButton = $("addBtn");

        if (addButton) {

            addButton.hidden = !config.addLabel;

            addButton.innerHTML = `
                <i data-lucide="plus"></i>
                ${escapeHTML(config.addLabel)}
            `;

        }

        populateFilters();

    }

    closeMobileSidebar();

    renderCurrentPage();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    refreshIcons();

}


function renderCurrentPage() {

    if (currentPage === "dashboard") {

        renderDashboard();

    } else if (currentPage === "reports") {

        renderReports();

    } else {

        renderRecords();

    }

    refreshIcons();

}


/* =====================================================
   DASHBOARD STATISTICS
===================================================== */

function getStats() {

    return [

        {
            label: "Total Products",
            value: summary.products ?? products.length,
            icon: "shopping-bag"
        },

        {
            label: "Categories",
            value: summary.categories ?? categories.length,
            icon: "layers"
        },

        {
            label: "Inventory Value",
            value: summary.inventory_value ?? 0,
            icon: "wallet",
            money: true
        },

        {
            label: "Total Stock Units",
            value: summary.units ?? 0,
            icon: "boxes"
        },

        {
            label: "Low Stock Products",
            value: summary.low_stock ?? 0,
            icon: "triangle-alert"
        },

        {
            label: "Transactions",
            value: summary.transactions ?? transactions.length,
            icon: "arrow-left-right"
        }

    ];

}


function statsMarkup(items) {

    return items.map((item, index) => `

        <article class="stat-card"
                 style="animation-delay:${index * 45}ms">

            <div class="stat-top">

                <div class="stat-icon">

                    <i data-lucide="${item.icon}"></i>

                </div>

                <i data-lucide="sparkles"
                   style="width:15px;color:var(--primary)"></i>

            </div>

            <span class="stat-label">

                ${escapeHTML(item.label)}

            </span>

            <strong class="stat-value"
                    data-count="${Number(item.value) || 0}"
                    data-money="${item.money ? "true" : "false"}">

                ${item.money ? "₱0.00" : "0"}

            </strong>

        </article>

    `).join("");

}


function animateCounters(container) {

    if (!container) return;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    container.querySelectorAll("[data-count]")
        .forEach(element => {

            const target = Number(element.dataset.count);

            const isMoney =
                element.dataset.money === "true";

            const duration = reducedMotion ? 0 : 650;

            const start = performance.now();

            function animate(now) {

                if (!element.isConnected) return;

                const progress = duration === 0
                    ? 1
                    : Math.min((now - start) / duration, 1);

                const eased =
                    1 - Math.pow(1 - progress, 3);

                const value = target * eased;

                element.textContent = isMoney
                    ? formatMoney(value)
                    : formatNumber(Math.round(value));

                if (progress < 1) {

                    requestAnimationFrame(animate);

                }

            }

            requestAnimationFrame(animate);

        });

}


function renderDashboard() {

    if (!dataReady) {

        setHTML(
            "statsGrid",

            loadError
                ? emptyState(
                    "Inventory unavailable",
                    loadError,
                    "cloud-off"
                )
                : Array.from(
                    { length: 6 },
                    () => '<div class="stat-card skeleton"></div>'
                ).join("")
        );

        setHTML(
            "lowStockTable",

            emptyState(
                "Waiting for inventory",
                "Inventory records will appear after connecting to Firestore."
            )
        );

        return;

    }

    setHTML("statsGrid", statsMarkup(getStats()));

    animateCounters($("statsGrid"));

    renderCharts();

    renderLowStock();

}


/* =====================================================
   ANIMATED DASHBOARD CHARTS
===================================================== */

function renderCharts() {

    if (!window.Chart || !dataReady) return;

    if (!$("movementChart") || !$("categoryChart")) return;

    try {

        const styles =
            getComputedStyle(document.documentElement);

        const textColor =
            styles.getPropertyValue("--muted").trim();

        const borderColor =
            styles.getPropertyValue("--border").trim();

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        const animationDuration =
            reducedMotion ? 0 : 850;

        if (movementChart) {

            movementChart.destroy();

        }

        if (categoryChart) {

            categoryChart.destroy();

        }

        const stockIn = transactions

            .filter(item => item.type === "in")

            .reduce(
                (total, item) =>
                    total + Number(item.quantity || 0),
                0
            );

        const stockOut = transactions

            .filter(item => item.type === "out")

            .reduce(
                (total, item) =>
                    total + Number(item.quantity || 0),
                0
            );

        movementChart = new Chart($("movementChart"), {

            type: "bar",

            data: {

                labels: ["Stock In", "Stock Out"],

                datasets: [{

                    label: "Units",

                    data: [stockIn, stockOut],

                    backgroundColor: [
                        "#843b53",
                        "#c8a17e"
                    ],

                    borderRadius: 10,

                    maxBarThickness: 75

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                animation: {
                    duration: animationDuration
                },

                plugins: {

                    legend: {
                        display: false
                    }

                },

                scales: {

                    x: {

                        ticks: {
                            color: textColor
                        },

                        grid: {
                            display: false
                        }

                    },

                    y: {

                        beginAtZero: true,

                        ticks: {
                            color: textColor,
                            precision: 0
                        },

                        grid: {
                            color: borderColor
                        }

                    }

                }

            }

        });


        const counts = new Map();

        products.forEach(product => {

            const name =
                categoryName(product.category_id);

            counts.set(
                name,
                (counts.get(name) || 0) + 1
            );

        });

        const sorted = [...counts.entries()]

            .sort((a, b) => b[1] - a[1]);

        const top = sorted.slice(0, 7);

        if (sorted.length > 7) {

            top.push([

                "Other",

                sorted.slice(7).reduce(
                    (total, item) => total + item[1],
                    0
                )

            ]);

        }

        categoryChart = new Chart($("categoryChart"), {

            type: "doughnut",

            data: {

                labels: top.map(item => item[0]),

                datasets: [{

                    data: top.map(item => item[1]),

                    backgroundColor: [

                        "#481426",
                        "#843b53",
                        "#aa657d",
                        "#dfbf96",
                        "#b38b9b",
                        "#71495e",
                        "#d6a9b5",
                        "#92747e"

                    ],

                    borderWidth: 0,

                    hoverOffset: 6

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                cutout: "72%",

                animation: {
                    duration: animationDuration
                },

                plugins: {

                    legend: {

                        position: "bottom",

                        labels: {

                            color: textColor,

                            usePointStyle: true,

                            padding: 12,

                            font: {
                                size: 10
                            }

                        }

                    }

                }

            }

        });

    } catch (error) {

        console.warn("Chart rendering error:", error);

    }

}


/* =====================================================
   STOCK STATUS
===================================================== */

function stockStatus(product) {

    const quantity =
        Number(product.quantity || 0);

    const reorder =
        Number(product.reorder_level || 0);

    if (quantity === 0) {

        return `

            <span class="status empty">

                <i data-lucide="circle-x"></i>

                Out of Stock

            </span>

        `;

    }

    if (quantity <= reorder) {

        return `

            <span class="status low">

                <i data-lucide="triangle-alert"></i>

                Low Stock

            </span>

        `;

    }

    return `

        <span class="status good">

            <i data-lucide="package-check"></i>

            In Stock

        </span>

    `;

}


function stockLevel(product) {

    const quantity =
        Number(product.quantity || 0);

    const reorder =
        Number(product.reorder_level || 0);

    const target = Math.max(reorder * 2, 1);

    const percentage = Math.min(
        100,
        Math.max(0, quantity / target * 100)
    );

    return `

        <div class="stock-level"
             title="Stock relative to twice the reorder level">

            <div class="stock-level-label">

                <strong>
                    ${formatNumber(quantity)} units
                </strong>

            </div>

            <div class="progress-track"
                 role="progressbar"
                 aria-label="Stock relative to reorder target"
                 aria-valuemin="0"
                 aria-valuemax="100"
                 aria-valuenow="${Math.round(percentage)}">

                <div class="progress-fill"
                     style="width:${percentage}%"></div>

            </div>

        </div>

    `;

}


function renderLowStock() {

    const low = products

        .filter(product =>
            Number(product.quantity) <=
            Number(product.reorder_level || 0)
        )

        .sort(
            (a, b) =>
                Number(a.quantity) - Number(b.quantity)
        )

        .slice(0, 8);

    if (!low.length) {

        setHTML(
            "lowStockTable",

            emptyState(
                "No low stock products",
                "Your current inventory does not require replenishment.",
                "package-check"
            )
        );

        return;

    }

    setHTML("lowStockTable", `

        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>

                        <th>Product</th>

                        <th>Stock Level</th>

                        <th>Reorder Level</th>

                        <th>Status</th>

                    </tr>

                </thead>

                <tbody>

                    ${low.map(product => `

                        <tr>

                            <td>
                                ${escapeHTML(product.name)}
                            </td>

                            <td>
                                ${stockLevel(product)}
                            </td>

                            <td>
                                ${formatNumber(product.reorder_level)}
                            </td>

                            <td>
                                ${stockStatus(product)}
                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        </div>

    `);

}


/* =====================================================
   COLLECTION SHORTCUTS
===================================================== */

function openCollection(type) {

    navigate("products");

    const patterns = {

        lip: /lip/i,

        makeup: /foundation|blush|powder|makeup|concealer|eyeshadow/i,

        skin: /skin|serum|cleanser|moisturizer|sunscreen/i

    };

    const match = categories.find(
        category => patterns[type]?.test(category.name)
    );

    if (match && $("filterSelect")) {

        $("filterSelect").value = recordId(match);

    } else {

        showToast(
            "No matching category is currently available.",
            "error"
        );

    }

    renderRecords();

}


/* =====================================================
   SEARCH AND FILTERS
===================================================== */

function populateFilters() {

    const select = $("filterSelect");

    if (!select) return;

    const previous = select.value;

    if (currentPage === "products") {

        select.hidden = false;

        select.innerHTML = `

            <option value="">All Categories</option>

            ${categories.map(category => `

                <option value="${escapeHTML(recordId(category))}">

                    ${escapeHTML(category.name)}

                </option>

            `).join("")}

        `;

    } else if (currentPage === "stock_transactions") {

        select.hidden = false;

        select.innerHTML = `

            <option value="">All Transactions</option>

            <option value="in">Stock In</option>

            <option value="out">Stock Out</option>

        `;

    } else {

        select.hidden = true;

        select.innerHTML =
            '<option value="">All Records</option>';

    }

    if ([...select.options].some(
        option => option.value === previous
    )) {

        select.value = previous;

    }

}


function getFilteredRecords() {

    const search =
        ($("searchInput")?.value || "")
            .trim()
            .toLowerCase();

    const filter =
        $("filterSelect")?.value || "";

    let records = [];

    if (currentPage === "products") {

        records = products.filter(product =>

            !filter ||
            String(product.category_id) === filter

        );

    } else if (currentPage === "categories") {

        records = [...categories];

    } else {

        records = transactions.filter(transaction => {

            if (currentPage === "stock-in") {

                return transaction.type === "in";

            }

            if (currentPage === "stock-out") {

                return transaction.type === "out";

            }

            return !filter ||
                transaction.type === filter;

        });

    }

    if (search) {

        records = records.filter(record => {

            const searchable = [

                ...Object.values(record),

                record.category_id
                    ? categoryName(record.category_id)
                    : "",

                record.product_id
                    ? productName(record.product_id)
                    : ""

            ].join(" ").toLowerCase();

            return searchable.includes(search);

        });

    }

    return records;

}


/* =====================================================
   EMPTY STATES
===================================================== */

function emptyState(

    title = "No records found",

    message = "Records will appear here when available.",

    icon = "package-open"

) {

    return `

        <div class="empty-state">

            <i data-lucide="${icon}"></i>

            <h3>${escapeHTML(title)}</h3>

            <p>${escapeHTML(message)}</p>

        </div>

    `;

}


/* =====================================================
   CRUD ACTION BUTTONS
===================================================== */

function actionButtons(collection, id, readOnly = false) {

    const resource = escapeHTML(collection);

    const safeId = escapeHTML(id);

    return `

        <div class="actions">

            <button class="icon-btn action-btn"
                    data-action="view"
                    data-resource="${resource}"
                    data-id="${safeId}"
                    title="View Details"
                    aria-label="View details">

                <i data-lucide="eye"></i>

            </button>

            ${readOnly ? "" : `

                <button class="icon-btn action-btn"
                        data-action="edit"
                        data-resource="${resource}"
                        data-id="${safeId}"
                        title="Edit Record"
                        aria-label="Edit record">

                    <i data-lucide="pencil"></i>

                </button>

                <button class="icon-btn action-btn"
                        data-action="delete"
                        data-resource="${resource}"
                        data-id="${safeId}"
                        title="Delete Record"
                        aria-label="Delete record">

                    <i data-lucide="trash-2"></i>

                </button>

            `}

        </div>

    `;

}


/* =====================================================
   RECORD DISPLAY AND PAGINATION
===================================================== */

function renderRecords() {

    if (!dataReady) {

        setHTML(
            "recordsContainer",

            emptyState(

                loadError
                    ? "Unable to load records"
                    : "Loading records",

                loadError ||
                    "Connecting to the database.",

                loadError
                    ? "cloud-off"
                    : "loader-circle"

            )
        );

        setText("recordCount", "Records unavailable");

        if ($("prevBtn")) $("prevBtn").disabled = true;

        if ($("nextBtn")) $("nextBtn").disabled = true;

        refreshIcons();

        return;

    }

    const records = getFilteredRecords();

    const totalPages = Math.max(
        1,
        Math.ceil(records.length / PAGE_SIZE)
    );

    pageNumber = Math.min(
        Math.max(pageNumber, 1),
        totalPages
    );

    const start =
        (pageNumber - 1) * PAGE_SIZE;

    const visible =
        records.slice(start, start + PAGE_SIZE);

    setText(
        "recordCount",

        `${records.length} record${
            records.length === 1 ? "" : "s"
        } found`
    );

    setText(
        "pageInfo",
        `Page ${pageNumber} of ${totalPages}`
    );

    if ($("prevBtn")) {

        $("prevBtn").disabled = pageNumber <= 1;

    }

    if ($("nextBtn")) {

        $("nextBtn").disabled =
            pageNumber >= totalPages;

    }

    if (!visible.length) {

        setHTML(
            "recordsContainer",

            emptyState(
                "No records found",
                "Add a new record or change your search filters."
            )
        );

    } else if (currentView === "card") {

        setHTML(
            "recordsContainer",
            renderCards(visible)
        );

    } else {

        setHTML(
            "recordsContainer",
            renderTable(visible)
        );

    }

    refreshIcons();

}


/* =====================================================
   TABLE VIEW
===================================================== */

function renderTable(records) {

    let headers = [];

    let rows = "";

    if (currentPage === "products") {

        headers = [

            "Product",
            "Category",
            "Price",
            "Stock Level",
            "Status",
            "Actions"

        ];

        rows = records.map(product => `

            <tr>

                <td>

                    <div class="table-product">

                        <img loading="lazy"
                             src="${getCategoryPhoto(
                                 categoryName(product.category_id)
                             )}"
                             alt="Category illustration">

                        <div>

                            <strong>
                                ${escapeHTML(product.name)}
                            </strong>

                            <small>
                                ${escapeHTML(product.sku)}
                            </small>

                        </div>

                    </div>

                </td>

                <td>
                    ${escapeHTML(categoryName(product.category_id))}
                </td>

                <td>
                    ${formatMoney(product.price)}
                </td>

                <td>
                    ${stockLevel(product)}
                </td>

                <td>
                    ${stockStatus(product)}
                </td>

                <td>
                    ${actionButtons("products", recordId(product))}
                </td>

            </tr>

        `).join("");

    } else if (currentPage === "categories") {

        headers = [

            "Category",
            "Description",
            "Products",
            "Actions"

        ];

        rows = records.map(category => {

            const count = products.filter(product =>

                String(product.category_id) ===
                    recordId(category)

            ).length;

            return `

                <tr>

                    <td>

                        <strong>
                            ${escapeHTML(category.name)}
                        </strong>

                    </td>

                    <td>

                        ${escapeHTML(category.description || "—")}

                    </td>

                    <td>${count}</td>

                    <td>

                        ${actionButtons(
                            "categories",
                            recordId(category)
                        )}

                    </td>

                </tr>

            `;

        }).join("");

    } else {

        headers = [

            "Product",
            "Type",
            "Quantity",
            "Previous Stock",
            "New Stock",
            "Date",
            "Actions"

        ];

        rows = records.map(transaction => `

            <tr>

                <td>

                    ${escapeHTML(
                        transaction.product_name ||
                        productName(transaction.product_id)
                    )}

                </td>

                <td>

                    <span class="status movement">

                        <i data-lucide="${
                            transaction.type === "in"
                                ? "arrow-down-to-line"
                                : "arrow-up-from-line"
                        }"></i>

                        ${transaction.type === "in"
                            ? "Stock In"
                            : "Stock Out"}

                    </span>

                </td>

                <td>
                    ${formatNumber(transaction.quantity)}
                </td>

                <td>
                    ${formatNumber(transaction.previous_quantity)}
                </td>

                <td>
                    ${formatNumber(transaction.new_quantity)}
                </td>

                <td>
                    ${escapeHTML(formatDate(transaction.created_at))}
                </td>

                <td>

                    ${actionButtons(
                        "stock_transactions",
                        recordId(transaction),
                        true
                    )}

                </td>

            </tr>

        `).join("");

    }

    return `

        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>

                        ${headers.map(header =>

                            `<th>${escapeHTML(header)}</th>`

                        ).join("")}

                    </tr>

                </thead>

                <tbody>${rows}</tbody>

            </table>

        </div>

    `;

}


/* =====================================================
   CARD VIEW
===================================================== */

function renderCards(records) {

    const cards = records.map(record => {

        if (currentPage === "products") {

            const category =
                categoryName(record.category_id);

            return `

                <article class="product-card">

                    <div class="product-photo">

                        <img loading="lazy"
                             src="${getCategoryPhoto(category)}"
                             alt="Category illustration">

                    </div>

                    <div class="product-body">

                        <span class="product-category">

                            ${escapeHTML(category)}

                        </span>

                        <h3>
                            ${escapeHTML(record.name)}
                        </h3>

                        <p class="product-description">

                            SKU: ${escapeHTML(record.sku)}

                        </p>

                        <strong class="product-price">

                            ${formatMoney(record.price)}

                        </strong>

                        ${stockStatus(record)}

                        ${stockLevel(record)}

                        <p class="product-description">

                            ${escapeHTML(
                                record.description ||
                                "No description available."
                            )}

                        </p>

                        ${actionButtons(
                            "products",
                            recordId(record)
                        )}

                    </div>

                </article>

            `;

        }

        if (currentPage === "categories") {

            const count = products.filter(product =>

                String(product.category_id) ===
                    recordId(record)

            ).length;

            return `

                <article class="product-card generic-card">

                    <div class="panel-icon">

                        <i data-lucide="layers"></i>

                    </div>

                    <h3>
                        ${escapeHTML(record.name)}
                    </h3>

                    <p class="product-description">

                        ${escapeHTML(
                            record.description ||
                            "No description."
                        )}

                    </p>

                    <p class="product-description">

                        ${count} products

                    </p>

                    ${actionButtons(
                        "categories",
                        recordId(record)
                    )}

                </article>

            `;

        }

        return `

            <article class="product-card generic-card">

                <div class="panel-icon">

                    <i data-lucide="${
                        record.type === "in"
                            ? "package-plus"
                            : "package-minus"
                    }"></i>

                </div>

                <span class="product-category">

                    ${record.type === "in"
                        ? "Stock In"
                        : "Stock Out"}

                </span>

                <h3>

                    ${escapeHTML(
                        record.product_name ||
                        productName(record.product_id)
                    )}

                </h3>

                <strong class="product-price">

                    ${formatNumber(record.quantity)} units

                </strong>

                <p class="product-description">

                    Previous:
                    ${formatNumber(record.previous_quantity)}

                    →

                    New:
                    ${formatNumber(record.new_quantity)}

                </p>

                <p class="product-description">

                    ${escapeHTML(formatDate(record.created_at))}

                </p>

                ${actionButtons(
                    "stock_transactions",
                    recordId(record),
                    true
                )}

            </article>

        `;

    });

    return `

        <div class="record-grid">

            ${cards.join("")}

        </div>

    `;

}


/* =====================================================
   MODAL FORM HELPERS
===================================================== */

function inputField(label, name, value = "", options = {}) {

    const {

        type = "text",

        required = true,

        min = "",

        step = "",

        maxlength = "",

        full = false

    } = options;

    return `

        <div class="field ${full ? "full" : ""}">

            <label for="field-${name}">

                ${escapeHTML(label)}

            </label>

            <input id="field-${name}"
                   name="${name}"
                   type="${type}"
                   value="${escapeHTML(value)}"
                   ${required ? "required" : ""}
                   ${min !== "" ? `min="${min}"` : ""}
                   ${step !== "" ? `step="${step}"` : ""}
                   ${maxlength !== ""
                       ? `maxlength="${maxlength}"`
                       : ""}>

        </div>

    `;

}


function textareaField(label, name, value = "") {

    return `

        <div class="field full">

            <label for="field-${name}">

                ${escapeHTML(label)}

            </label>

            <textarea id="field-${name}"
                      name="${name}"
                      maxlength="500">${escapeHTML(value)}</textarea>

        </div>

    `;

}


function selectField(label, name, options, selected = "") {

    return `

        <div class="field full">

            <label for="field-${name}">

                ${escapeHTML(label)}

            </label>

            <select id="field-${name}"
                    name="${name}"
                    required>

                <option value="">

                    Select ${escapeHTML(label)}

                </option>

                ${options.map(option => `

                    <option value="${escapeHTML(option.value)}"

                        ${String(option.value) === String(selected)
                            ? "selected"
                            : ""}>

                        ${escapeHTML(option.label)}

                    </option>

                `).join("")}

            </select>

        </div>

    `;

}


/* =====================================================
   CREATE AND EDIT RECORD FORMS
===================================================== */

function openForm(collection, record = null, movement = "in") {

    if (!dataReady) {

        showToast(
            "Connect to Firestore before modifying records.",
            "error"
        );

        return;

    }

    editingCollection = collection;

    editingId = record ? recordId(record) : null;

    $("recordForm").hidden = false;

    $("detailContent").hidden = true;

    let title = "";

    let fields = "";

    if (collection === "products") {

        if (!categories.length) {

            showToast(
                "Add a category before creating a product.",
                "error"
            );

            return;

        }

        title = record
            ? "Edit Product"
            : "Add Product";

        fields = `

            ${inputField(
                "Product Name",
                "name",
                record?.name || "",
                {
                    full: true,
                    maxlength: 150
                }
            )}

            ${inputField(
                "SKU",
                "sku",
                record?.sku || "",
                {
                    maxlength: 100
                }
            )}

            ${inputField(
                "Price (PHP)",
                "price",
                record?.price ?? "",
                {
                    type: "number",
                    min: 0,
                    step: "0.01"
                }
            )}

            ${selectField(
                "Category",
                "category_id",

                categories.map(category => ({

                    value: recordId(category),

                    label: category.name

                })),

                record?.category_id || ""
            )}

            ${inputField(
                "Quantity",
                "quantity",
                record?.quantity ?? 0,
                {
                    type: "number",
                    min: 0,
                    step: 1
                }
            )}

            ${inputField(
                "Reorder Level",
                "reorder_level",
                record?.reorder_level ?? 5,
                {
                    type: "number",
                    min: 0,
                    step: 1
                }
            )}

            ${textareaField(
                "Description",
                "description",
                record?.description || ""
            )}

        `;

    } else if (collection === "categories") {

        title = record
            ? "Edit Category"
            : "Add Category";

        fields = `

            ${inputField(
                "Category Name",
                "name",
                record?.name || "",
                {
                    full: true,
                    maxlength: 150
                }
            )}

            ${textareaField(
                "Description",
                "description",
                record?.description || ""
            )}

        `;

    } else if (collection === "stock_transactions") {

        const available = movement === "out"

            ? products.filter(product =>
                Number(product.quantity) > 0
            )

            : products;

        if (!available.length) {

            showToast(
                "No eligible products are available.",
                "error"
            );

            return;

        }

        title = movement === "in"
            ? "Record Stock In"
            : "Record Stock Out";

        fields = `

            <input type="hidden"
                   name="type"
                   value="${movement === "out" ? "out" : "in"}">

            ${selectField(
                "Product",
                "product_id",

                available.map(product => ({

                    value: recordId(product),

                    label: `${product.name} (${product.quantity} units)`

                }))
            )}

            ${inputField(
                "Quantity",
                "quantity",
                1,
                {
                    type: "number",
                    min: 1,
                    step: 1,
                    full: true
                }
            )}

            <div class="field full">

                <small id="availableStock">

                    Select a product to view its current stock.

                </small>

            </div>

            ${textareaField("Remarks", "remarks")}

        `;

    } else {

        return;

    }

    setText("modalTitle", title);

    setHTML(
        "formFields",
        `<div class="form-grid">${fields}</div>`
    );

    $("saveBtn").disabled = false;

    if (!$("recordModal").open) {

        $("recordModal").showModal();

    }

    const productSelect = $("field-product_id");

    if (productSelect) {

        productSelect.addEventListener("change", () => {

            const product = products.find(item =>

                recordId(item) === productSelect.value

            );

            const quantityInput = $("field-quantity");

            if (product) {

                setText(
                    "availableStock",
                    `Current stock: ${product.quantity} units`
                );

                if (movement === "out") {

                    quantityInput.max = product.quantity;

                } else {

                    quantityInput.removeAttribute("max");

                }

            } else {

                quantityInput.removeAttribute("max");

                setText(
                    "availableStock",
                    "Select a product to view its current stock."
                );

            }

        });

    }

    refreshIcons();

}


/* =====================================================
   FORM VALIDATION
===================================================== */

function validateForm(collection, data) {

    if (collection === "products") {

        data.name =
            String(data.name || "").trim();

        data.sku =
            String(data.sku || "").trim().toUpperCase();

        data.description =
            String(data.description || "").trim();

        if (!data.name || !data.sku || !data.category_id) {

            throw new Error(
                "Complete all required product fields."
            );

        }

        if (
            data.price === "" ||
            data.quantity === "" ||
            data.reorder_level === ""
        ) {

            throw new Error(
                "Complete all required numeric fields."
            );

        }

        data.price = Number(data.price);

        data.quantity = Number(data.quantity);

        data.reorder_level = Number(data.reorder_level);

        if (!Number.isFinite(data.price) || data.price < 0) {

            throw new Error(
                "Enter a valid product price."
            );

        }

        if (
            !Number.isInteger(data.quantity) ||
            data.quantity < 0
        ) {

            throw new Error(
                "Quantity must be a non-negative whole number."
            );

        }

        if (
            !Number.isInteger(data.reorder_level) ||
            data.reorder_level < 0
        ) {

            throw new Error(
                "Reorder level must be a non-negative whole number."
            );

        }

        if (!categories.some(category =>

            recordId(category) === data.category_id

        )) {

            throw new Error(
                "Select an existing category."
            );

        }

        const duplicate = products.some(product =>

            String(product.sku).toUpperCase() === data.sku &&

            recordId(product) !== editingId

        );

        if (duplicate) {

            throw new Error(
                "This SKU is already registered."
            );

        }

    } else if (collection === "categories") {

        data.name =
            String(data.name || "").trim();

        data.description =
            String(data.description || "").trim();

        if (!data.name) {

            throw new Error(
                "Category name is required."
            );

        }

    } else if (collection === "stock_transactions") {

        data.quantity = Number(data.quantity);

        data.remarks =
            String(data.remarks || "").trim();

        if (!["in", "out"].includes(data.type)) {

            throw new Error(
                "Invalid stock movement type."
            );

        }

        if (
            !Number.isInteger(data.quantity) ||
            data.quantity <= 0
        ) {

            throw new Error(
                "Quantity must be a positive whole number."
            );

        }

        const product = products.find(item =>

            recordId(item) === data.product_id

        );

        if (!product) {

            throw new Error(
                "Select an existing product."
            );

        }

        if (
            data.type === "out" &&
            data.quantity > Number(product.quantity)
        ) {

            throw new Error(
                "Insufficient stock for this transaction."
            );

        }

    }

    return data;

}


/* =====================================================
   SAVE RECORD TO FIRESTORE
===================================================== */

async function saveRecord(event) {

    event.preventDefault();

    if (saving) return;

    saving = true;

    $("saveBtn").disabled = true;

    setText("saveBtn", "Saving...");

    try {

        const data = Object.fromEntries(

            new FormData(event.target).entries()

        );

        const payload =
            validateForm(editingCollection, data);

        let endpoint;

        let method;

        if (editingCollection === "stock_transactions") {

            endpoint = "/stock-transactions";

            method = "POST";

        } else if (editingId) {

            endpoint =
                `/${editingCollection}/${encodeURIComponent(editingId)}`;

            method = "PUT";

        } else {

            endpoint = `/${editingCollection}`;

            method = "POST";

        }

        const result = await requestAPI(endpoint, {

            method,

            body: JSON.stringify(payload)

        });

        $("recordModal").close();

        const refreshed = await loadData();

        if (refreshed) {

            showToast(
                result.message ||
                "Record saved successfully."
            );

        } else {

            showToast(
                "Record saved, but the inventory could not be refreshed.",
                "error"
            );

        }

    } catch (error) {

        showToast(error.message, "error");

        showFormError(error.message);

    } finally {

        saving = false;

        $("saveBtn").disabled = false;

        setHTML("saveBtn", `

            <i data-lucide="save"></i>

            Save Record

        `);

        refreshIcons();

    }

}


function showFormError(message) {

    const fields = $("formFields");

    if (!fields) return;

    let errorBox = $("formError");

    if (!errorBox) {

        errorBox = document.createElement("p");

        errorBox.id = "formError";

        errorBox.setAttribute("role", "alert");

        errorBox.style.color = "#d65b78";

        errorBox.style.padding = "10px 0";

        fields.prepend(errorBox);

    }

    errorBox.textContent = message;

}


/* =====================================================
   VIEW SINGLE RECORD
===================================================== */

async function viewRecord(collection, id) {

    try {

        const result = await requestAPI(

            `/${collection}/${encodeURIComponent(id)}`

        );

        const record = result.data;

        if (!record || typeof record !== "object") {

            throw new Error(
                "Record details are unavailable."
            );

        }

        setText("modalTitle", "Record Details");

        $("recordForm").hidden = true;

        $("detailContent").hidden = false;

        const labels = {

            id: "Record ID",

            name: "Name",

            sku: "SKU",

            category_id: "Category",

            price: "Price",

            quantity: "Quantity",

            reorder_level: "Reorder Level",

            description: "Description",

            product_id: "Product",

            product_name: "Product Name",

            type: "Movement Type",

            previous_quantity: "Previous Stock",

            new_quantity: "New Stock",

            remarks: "Remarks",

            created_at: "Created At",

            updated_at: "Updated At"

        };

        setHTML(

            "detailContent",

            Object.entries(record)

                .filter(([key]) =>

                    Object.prototype.hasOwnProperty.call(
                        labels,
                        key
                    )

                )

                .map(([key, value]) => {

                    let display = value;

                    if (key === "category_id") {

                        display = categoryName(value);

                    }

                    if (key === "product_id") {

                        display = productName(value);

                    }

                    if (key === "price") {

                        display = formatMoney(value);

                    }

                    if (key.endsWith("_at")) {

                        display = formatDate(value);

                    }

                    if (key === "type") {

                        display = value === "in"
                            ? "Stock In"
                            : "Stock Out";

                    }

                    return `

                        <div class="detail-row">

                            <span>
                                ${escapeHTML(labels[key])}
                            </span>

                            <strong>
                                ${escapeHTML(display ?? "—")}
                            </strong>

                        </div>

                    `;

                }).join("")

        );

        if (!$("recordModal").open) {

            $("recordModal").showModal();

        }

        refreshIcons();

    } catch (error) {

        showToast(error.message, "error");

    }

}


/* =====================================================
   EDIT SINGLE RECORD
===================================================== */

async function editRecord(collection, id) {

    try {

        const result = await requestAPI(

            `/${collection}/${encodeURIComponent(id)}`

        );

        if (!result.data) {

            throw new Error("Record not found.");

        }

        openForm(collection, {

            ...result.data,

            id

        });

    } catch (error) {

        showToast(error.message, "error");

    }

}


/* =====================================================
   DELETE RECORD CONFIRMATION
===================================================== */

function confirmDeleteRecord(collection, id) {

    if (collection === "stock_transactions") {

        showToast(
            "Stock transaction history cannot be deleted.",
            "error"
        );

        return;

    }

    const records = collection === "products"
        ? products
        : categories;

    const record = records.find(item =>

        recordId(item) === id

    );

    pendingDelete = {

        collection,

        id

    };

    setText(

        "confirmText",

        `Are you sure you want to delete "${
            record?.name || "this record"
        }"? This action cannot be undone.`

    );

    if (!$("confirmModal").open) {

        $("confirmModal").showModal();

    }

    refreshIcons();

}


async function deleteRecord() {

    if (!pendingDelete || saving) return;

    saving = true;

    $("confirmDelete").disabled = true;

    try {

        const { collection, id } = pendingDelete;

        const result = await requestAPI(

            `/${collection}/${encodeURIComponent(id)}`,

            {
                method: "DELETE"
            }

        );

        $("confirmModal").close();

        pendingDelete = null;

        const refreshed = await loadData();

        if (refreshed) {

            showToast(
                result.message ||
                "Record deleted successfully."
            );

        } else {

            showToast(
                "Record deleted, but the inventory could not be refreshed.",
                "error"
            );

        }

    } catch (error) {

        setText("confirmText", error.message);

        showToast(error.message, "error");

    } finally {

        saving = false;

        $("confirmDelete").disabled = false;

    }

}


function closeRecordModal() {

    if (!saving) {

        $("recordModal")?.close();

    }

}


/* =====================================================
   INVENTORY REPORTS
===================================================== */

function renderReports() {

    if (!dataReady) {

        setHTML("reportStats", "");

        setHTML(

            "reportTable",

            emptyState(

                "Reports unavailable",

                loadError ||
                    "Waiting for inventory records.",

                "chart-no-axes-combined"

            )

        );

        return;

    }

    setHTML(
        "reportStats",
        statsMarkup(getStats())
    );

    animateCounters($("reportStats"));

    if (!products.length) {

        setHTML(

            "reportTable",

            emptyState(

                "No inventory records",

                "Add products to generate inventory reports."

            )

        );

        return;

    }

    setHTML("reportTable", `

        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>

                        <th>Product</th>

                        <th>SKU</th>

                        <th>Category</th>

                        <th>Quantity</th>

                        <th>Unit Price</th>

                        <th>Inventory Value</th>

                        <th>Status</th>

                    </tr>

                </thead>

                <tbody>

                    ${products.map(product => `

                        <tr>

                            <td>

                                ${escapeHTML(product.name)}

                            </td>

                            <td>

                                ${escapeHTML(product.sku)}

                            </td>

                            <td>

                                ${escapeHTML(
                                    categoryName(product.category_id)
                                )}

                            </td>

                            <td>

                                ${formatNumber(product.quantity)}

                            </td>

                            <td>

                                ${formatMoney(product.price)}

                            </td>

                            <td>

                                ${formatMoney(
                                    Number(product.price || 0) *
                                    Number(product.quantity || 0)
                                )}

                            </td>

                            <td>

                                ${stockStatus(product)}

                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        </div>

    `);

}


/* =====================================================
   EXPORT INVENTORY CSV
===================================================== */

function csvValue(value) {

    let text = String(value ?? "");

    if (/^\s*[=+\-@]/.test(text)) {

        text = "'" + text;

    }

    return `"${text.replace(/"/g, '""')}"`;

}


function exportReport() {

    if (!dataReady || !products.length) {

        showToast(
            "No inventory records available for export.",
            "error"
        );

        return;

    }

    const rows = [

        [

            "Product",

            "SKU",

            "Category",

            "Quantity",

            "Unit Price",

            "Inventory Value",

            "Reorder Level",

            "Status"

        ],

        ...products.map(product => {

            const quantity =
                Number(product.quantity || 0);

            const price =
                Number(product.price || 0);

            const reorder =
                Number(product.reorder_level || 0);

            const status = quantity === 0

                ? "Out of Stock"

                : quantity <= reorder

                    ? "Low Stock"

                    : "In Stock";

            return [

                product.name,

                product.sku,

                categoryName(product.category_id),

                quantity,

                price.toFixed(2),

                (quantity * price).toFixed(2),

                reorder,

                status

            ];

        })

    ];

    const csv = "\uFEFF" + rows.map(row =>

        row.map(csvValue).join(",")

    ).join("\r\n");

    const blob = new Blob([csv], {

        type: "text/csv;charset=utf-8;"

    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    const date =
        new Date().toISOString().slice(0, 10);

    link.href = url;

    link.download =
        `StockFlow_Inventory_${date}.csv`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(() => {

        URL.revokeObjectURL(url);

    }, 1000);

    showToast(
        "Inventory report exported successfully."
    );

}


/* =====================================================
   BUTTON RIPPLE ANIMATION
===================================================== */

function createRipple(event) {

    const button =
        event.target.closest(".btn, .icon-btn");

    if (!button || button.disabled) return;

    const rect =
        button.getBoundingClientRect();

    const ripple =
        document.createElement("span");

    ripple.className = "ripple";

    ripple.style.left =
        `${event.clientX - rect.left}px`;

    ripple.style.top =
        `${event.clientY - rect.top}px`;

    button.appendChild(ripple);

    ripple.addEventListener("animationend", () => {

        ripple.remove();

    }, { once: true });

    setTimeout(() => ripple.remove(), 1000);

}


/* =====================================================
   REGISTER ALL EVENT LISTENERS
===================================================== */

function initializeEvents() {

    // Theme button in upper-right header only.

    on("quickTheme", "click", toggleTheme);


    // Sidebar controls.

    on("menuBtn", "click", toggleSidebar);

    on("mobileOverlay", "click", closeMobileSidebar);

    window.addEventListener("resize", () => {

        if (window.innerWidth > 800) {

            closeMobileSidebar();

        }

    });


    // Navigation.

    document.querySelectorAll("[data-page]")
        .forEach(button => {

            button.addEventListener("click", () => {

                navigate(button.dataset.page);

            });

        });


    document.querySelectorAll("[data-go]")
        .forEach(button => {

            button.addEventListener("click", () => {

                navigate(button.dataset.go);

            });

        });


    document.querySelectorAll("[data-collection]")
        .forEach(button => {

            button.addEventListener("click", () => {

                openCollection(
                    button.dataset.collection
                );

            });

        });


    // Search and filter.

    on("searchInput", "input", () => {

        pageNumber = 1;

        renderRecords();

    });


    on("filterSelect", "change", () => {

        pageNumber = 1;

        renderRecords();

    });


    // Pagination.

    on("prevBtn", "click", () => {

        pageNumber--;

        renderRecords();

    });


    on("nextBtn", "click", () => {

        pageNumber++;

        renderRecords();

    });


    // Table and card view.

    on("tableViewBtn", "click", () => {

        currentView = "table";

        $("tableViewBtn")?.classList.add("active");

        $("cardViewBtn")?.classList.remove("active");

        renderRecords();

    });


    on("cardViewBtn", "click", () => {

        currentView = "card";

        $("cardViewBtn")?.classList.add("active");

        $("tableViewBtn")?.classList.remove("active");

        renderRecords();

    });


    // Dashboard add product.

    on("dashboardAdd", "click", () => {

        openForm("products");

    });


    // Add record.

    on("addBtn", "click", () => {

        if (currentPage === "products") {

            openForm("products");

        } else if (currentPage === "categories") {

            openForm("categories");

        } else if (currentPage === "stock-in") {

            openForm(
                "stock_transactions",
                null,
                "in"
            );

        } else if (currentPage === "stock-out") {

            openForm(
                "stock_transactions",
                null,
                "out"
            );

        }

    });


    // Save form.

    on("recordForm", "submit", saveRecord);


    // Delete confirmation.

    on("confirmDelete", "click", deleteRecord);

    on("cancelDelete", "click", () => {

        if (saving) return;

        pendingDelete = null;

        $("confirmModal")?.close();

    });


    // Modal close buttons.

    on("closeModal", "click", closeRecordModal);

    on("cancelModal", "click", closeRecordModal);


    // Toast close button.

    on("closeToast", "click", () => {

        $("toast")?.classList.remove("show");

    });


    // CSV export.

    on("exportBtn", "click", exportReport);


    // Refresh inventory and connection independently.

    on("refreshBtn", "click", () => {

        checkConnection();

        loadData(true);

    });


    // CRUD action delegation.

    document.addEventListener("click", event => {

        const button =
            event.target.closest("[data-action]");

        if (!button) return;

        const {

            action,

            resource,

            id

        } = button.dataset;

        if (action === "view") {

            viewRecord(resource, id);

        } else if (action === "edit") {

            editRecord(resource, id);

        } else if (action === "delete") {

            confirmDeleteRecord(resource, id);

        }

    });


    // Dialog background and escape controls.

    document.querySelectorAll("dialog")
        .forEach(dialog => {

            dialog.addEventListener("cancel", event => {

                if (saving) {

                    event.preventDefault();

                }

            });

            dialog.addEventListener("click", event => {

                if (saving || event.target !== dialog) {

                    return;

                }

                const rect =
                    dialog.getBoundingClientRect();

                const outside =

                    event.clientX < rect.left ||

                    event.clientX > rect.right ||

                    event.clientY < rect.top ||

                    event.clientY > rect.bottom;

                if (outside) {

                    dialog.close();

                }

            });

        });


    // Button ripple effect.

    document.addEventListener("click", createRipple);

}


/* =====================================================
   CURRENT DATE DISPLAY
===================================================== */

function displayCurrentDate() {

    setText(

        "currentDate",

        new Date().toLocaleDateString("en-PH", {

            weekday: "short",

            month: "long",

            day: "numeric",

            year: "numeric"

        })

    );

}


/* =====================================================
   AUTOMATIC FIRESTORE RECONNECTION
===================================================== */

function initializeConnectionMonitoring() {

    window.addEventListener("online", () => {

        checkConnection();

        loadData();

    });

    window.addEventListener("offline", () => {

        updateConnectionStatus(false);

    });

}


/* =====================================================
   FAST APPLICATION INITIALIZATION
===================================================== */

let initialized = false;

function initialize() {

    if (initialized) return;

    initialized = true;

    console.log("StockFlow application starting...");


    // PRIORITY 1:
    // Check Firestore immediately.
    // Do not wait for products, categories or charts.

    checkConnection();


    // PRIORITY 2:
    // Load actual Firestore inventory independently.

    loadData().catch(error => {

        console.error(
            "Inventory initialization error:",
            error
        );

    });


    // PRIORITY 3:
    // Initialize website interface.

    try {

        initializeEvents();

        displayCurrentDate();

        setTheme(getSavedTheme());

        initializeConnectionMonitoring();

        refreshIcons();

        console.log(
            "StockFlow interface initialized successfully."
        );

    } catch (error) {

        console.error(
            "Interface initialization error:",
            error
        );

    }

}


/* =====================================================
   START APPLICATION AUTOMATICALLY
===================================================== */

if (document.readyState === "loading") {

    document.addEventListener(

        "DOMContentLoaded",

        initialize,

        {
            once: true
        }

    );

} else {

    initialize();

}


/* =====================================================
   END OF STOCKFLOW FRONTEND APPLICATION
===================================================== */
