# 📁 Project Structure Guide

## Directory Organization

```
College-Main-Project/
│
├── 📄 index.html                          # Main entry point (Home page)
├── 📄 README.md                           # Project overview & features
├── 📄 PROJECT_STRUCTURE.md               # This file (folder guide)
│
├── 📁 pages/                              # All HTML pages (organized by feature)
│   ├── 📁 public/                         # Publicly accessible pages
│   │   ├── main.html                      # 🏠 Homepage
│   │   ├── services.html                  # 📋 Services catalog
│   │   ├── booking.html                   # 📅 Booking page
│   │   └── contact.html                   # 📞 Contact/Support page
│   │
│   ├── 📁 auth/                           # Authentication pages
│   │   ├── login.html                     # 🔐 User login
│   │   └── signup.html                    # 📝 User registration
│   │
│   └── 📁 dashboards/                     # User dashboards (role-based)
│       ├── user-dashboard.html            # 👤 User panel
│       ├── provider-dashboard.html        # 🔧 Service provider panel
│       └── admin-dashboard.html           # 👨‍💼 Admin panel
│
├── 📁 assets/                             # Static files (CSS, JS, images)
│   │
│   ├── 📁 css/
│   │   └── style.css                      # Main stylesheet
│   │
│   └── 📁 js/                             # JavaScript files (organized by purpose)
│       │
│       ├── 📁 utils/                      # Utility & data files
│       │   └── data.js                    # 📊 Service data, demo users, constants
│       │
│       └── 📁 pages/                      # Page-specific logic
│           ├── main.js                    # Homepage functionality
│           ├── services.js                # Services page functions
│           ├── booking.js                 # Booking logic
│           ├── login.js                   # Login validation & auth
│           ├── signup.js                  # Signup validation & registration
│           ├── user-dashboard.js          # User dashboard features
│           ├── provider-dashboard.js      # Provider dashboard features
│           ├── admin-dashboard.js         # Admin dashboard features
│           └── contact.js                 # Contact form handling
│
├── 📁 docs/                               # Documentation
│   ├── FEATURES.md                        # ✨ Feature list
│   ├── INSTALLATION.md                    # 🚀 Setup guide
│   ├── DATABASE.md                        # 💾 LocalStorage schema
│   ├── API_REFERENCE.md                   # 🔌 JavaScript functions
│   └── CODE_COMMENTS.md                   # 📝 Code explanation
│
└── 📁 .git/                               # Git repository
```

---

## 📝 File Naming Convention

- **HTML Files**: `page-name.html` (kebab-case)
  - Example: `user-dashboard.html`, `login.html`

- **CSS Files**: `style.css` (single stylesheet for consistency)

- **JavaScript Files**: `page-name.js` (matches HTML filename)
  - Data file: `data.js`

- **Documentation**: `FEATURE_NAME.md` (UPPERCASE)

---

## 🔍 Quick Navigation Guide

| Need to find... | Location |
|---|---|
| **Homepage** | `pages/public/main.html` |
| **Styles** | `assets/css/style.css` |
| **Service data** | `assets/js/utils/data.js` |
| **Login logic** | `assets/js/pages/login.js` |
| **User dashboard** | `pages/dashboards/user-dashboard.html` |
| **Features list** | `docs/FEATURES.md` |
| **Setup instructions** | `docs/INSTALLATION.md` |

---

## 🎯 How to Understand the Project

### For Teachers/Reviewers:
1. Start with `README.md` → Get project overview
2. Read `docs/FEATURES.md` → See what's implemented
3. Open `pages/public/main.html` → See homepage
4. Check `assets/js/utils/data.js` → Understand data structure
5. Review `assets/js/pages/*.js` → Understand logic

### For Students/Developers:
1. Check `PROJECT_STRUCTURE.md` (this file)
2. Open `docs/INSTALLATION.md` → Run the project
3. View `docs/CODE_COMMENTS.md` → Understand each function
4. Edit files in `pages/` and `assets/js/pages/` → Modify features

---

## 📦 Key Technologies
- **HTML5** - Page structure
- **CSS3** - Styling & responsive design
- **JavaScript (ES6+)** - Dynamic functionality
- **LocalStorage** - Client-side data persistence
- **Font Awesome** - Icons

---

## ✅ Current Status: 75-80% Complete

See `docs/COMPLETION_STATUS.md` for detailed breakdown
