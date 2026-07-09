# Installation Guide - ANN Publisher v1.0

Complete step-by-step installation and configuration guide for ANN Publisher.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Prerequisites](#prerequisites)
3. [Python Backend Installation](#python-backend-installation)
4. [Adobe InDesign Setup](#adobe-indesign-setup)
5. [Configuration](#configuration)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Hardware
- **CPU:** Intel i5 or equivalent (4 cores)
- **RAM:** 4 GB minimum (8 GB recommended)
- **Disk:** 500 MB free space
- **Network:** Stable internet connection

### Recommended Hardware
- **CPU:** Intel i7 or equivalent (6+ cores)
- **RAM:** 8 GB or more
- **Disk:** 1 GB free space (for cache and logs)
- **Network:** High-speed broadband

### Operating Systems Supported
- Windows 10/11 (64-bit)
- macOS 10.14 or later
- Linux (Ubuntu 18.04+, Debian 10+)

---

## Prerequisites

### 1. Python Installation

#### Windows
```bash
# Download Python 3.8+ from python.org
# Run installer and check "Add Python to PATH"
python --version
```

#### macOS
```bash
# Using Homebrew
brew install python3
python3 --version
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install python3 python3-pip
python3 --version
```

### 2. Git Installation

#### Windows
Download from https://git-scm.com/download/win

#### macOS
```bash
brew install git
```

#### Linux
```bash
sudo apt install git
```

### 3. Adobe InDesign

- **Version:** CC 2019 or later
- **License:** Active subscription
- **ExtendScript:** Enabled (default)
- **Storage:** 1 GB available

### 4. WordPress Access

- **URL:** Active WordPress installation
- **API:** REST API enabled
- **Credentials:** Admin or Editor account
- **Categories:** Set up for story classification

---

## Python Backend Installation

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/radhikagirase007-wq/ANN-Epaper-System.git
cd ANN-Epaper-System

# Verify directory structure
ls -la
```

**Expected Output:**
```
01_Data/
02_Images/
03_Engine/
04_Output/
05_Templates/
06_Config/
07_JSX/
08_Logs/
README.md
INSTALL.md
```

### Step 2: Create Virtual Environment

#### Windows
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate
```

#### macOS/Linux
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate
```

**Verification:**
```bash
# Virtual environment is active when you see (venv) in terminal
(venv) $
```

### Step 3: Install Python Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r engine/requirements.txt
```

**Expected Packages:**
- requests (HTTP library)
- Pillow (Image processing)
- python-dotenv (Configuration)
- numpy (Data processing)
- scikit-learn (ML processing)

**Verification:**
```bash
pip list
```

### Step 4: Create Configuration Files

```bash
# Navigate to config directory
cd 06_Config

# Copy example configuration
cp settings.example.py settings.py

# Edit configuration
nano settings.py  # or use your preferred editor
```

**Required Settings:**
```python
# WordPress Configuration
WORDPRESS_URL = "https://your-wordpress-site.com"
WORDPRESS_USERNAME = "admin_username"
WORDPRESS_PASSWORD = "admin_password"

# Categories to fetch
STORY_CATEGORIES = ["news", "featured", "breaking"]

# AI Settings
MAX_STORIES = 30
MIN_STORY_LENGTH = 100

# Output Settings
CMYK_MODE = True
DPI = 300
```

### Step 5: Create Data Directories

```bash
# From project root
mkdir -p 01_Data
mkdir -p 02_Images
mkdir -p 04_Output
mkdir -p 08_Logs

# Verify
ls -la
```

---

## Adobe InDesign Setup

### Step 1: Enable ExtendScript Support

**InDesign Menu:**
```
Edit > Preferences > Type
```

**Settings:**
- ✅ Enable OpenType features
- ✅ Use Optical Margin Alignment

### Step 2: Create InDesign Template

**Required Elements:**
1. Create document pages (typically 4-8 pages)
2. Create named frames for content:

**Frame Naming Convention:**
```
Page 1:
  - headline_1 (TextFrame)
  - headline_2 (TextFrame)
  - headline_3 (TextFrame)
  - story_body_1 (TextFrame)
  - story_body_2 (TextFrame)
  - story_body_3 (TextFrame)
  - image_1 (GraphicsFrame)
  - image_2 (GraphicsFrame)
  - image_3 (GraphicsFrame)

Page 2-N: (repeat as needed)
  - headline_1, story_body_1, image_1
  - etc.
```

### Step 3: Create Paragraph Styles

**In InDesign:**
```
Window > Styles > Paragraph Styles

Create:
  ✓ Headline Style (24pt, Bold, Serif)
  ✓ Body Text Style (11pt, Regular, Serif)
  ✓ Caption Style (9pt, Italic)
  ✓ Byline Style (10pt, Regular)
```

### Step 4: Create Object Styles

**In InDesign:**
```
Window > Styles > Object Styles

Create:
  ✓ Image Style (Scale, Fill, Border)
  ✓ Frame Style (Stroke, Color)
```

### Step 5: Save Template

```
File > Save As
Name: ANN_Template_v1.indt
Location: 05_Templates/
```

### Step 6: Install JSX Scripts

```bash
# Copy JSX scripts to InDesign scripts folder

# Windows
cp 07_JSX/*.jsx "C:\Program Files\Adobe\Adobe InDesign [version]\Scripts\Scripts Panel\"

# macOS
cp 07_JSX/*.jsx "/Applications/Adobe InDesign [version]/Scripts/Scripts Panel/"

# Linux (if installed)
cp 07_JSX/*.jsx "/opt/Adobe/InDesign/Scripts/Scripts Panel/"
```

**Alternative: Use InDesign Script Menu**
```
File > Scripts > Other Scripts > [Browse to 07_JSX/ANN_AutoFill.jsx]
```

---

## Configuration

### 1. WordPress Configuration

**File:** `06_Config/settings.py`

```python
# WordPress API Settings
WORDPRESS_URL = "https://example.com"
WORDPRESS_API_VERSION = "wp/v2"
WORDPRESS_REST_ENDPOINT = f"{WORDPRESS_URL}/wp-json/{WORDPRESS_API_VERSION}"

# Authentication
WORDPRESS_USERNAME = "your_username"
WORDPRESS_PASSWORD = "your_app_password"

# Story Settings
STORY_CATEGORIES = ["news", "featured", "breaking"]
POSTS_PER_CATEGORY = 10
MIN_STORY_LENGTH = 100  # Minimum characters

# Image Settings
DOWNLOAD_IMAGES = True
IMAGE_QUALITY = 85  # JPEG quality 0-100
MAX_IMAGE_SIZE = 5000000  # 5MB in bytes
```

### 2. Layout Configuration

**File:** `06_Config/layout.py`

```python
# Page Configuration
PAGES_PER_EDITION = 4
STORIES_PER_PAGE = 3
COLUMNS = 2

# Story Allocation
FEATURED_STORIES = 3
SECONDARY_STORIES = 4
TERTIARY_STORIES = 23

# Space Allocation (%)
HEADLINE_SPACE = 15
BODY_SPACE = 60
IMAGE_SPACE = 25
```

### 3. AI Configuration

**File:** `06_Config/ai_settings.py`

```python
# Ranking Model
RANKING_MODEL = "tfidf"  # or "bert", "custom"

# Classification
CLASSIFICATION_ENABLED = True
CLASSIFICATION_MODEL = "naive_bayes"

# Scoring Weights
RECENCY_WEIGHT = 0.3
IMPORTANCE_WEIGHT = 0.4
ENGAGEMENT_WEIGHT = 0.3
```

### 4. InDesign Configuration

**File:** `07_JSX/config.jsx`

```javascript
// InDesign Export Settings
var EXPORT_CONFIG = {
    RESOLUTION_DPI: 300,
    COLOR_MODE: "CMYK",
    COMPRESSION: 6,
    OUTPUT_FOLDER: "04_Output",
    CREATE_LOG: true,
    LOG_FOLDER: "08_Logs"
};
```

---

## Verification

### 1. Python Backend Verification

```bash
# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

# Test Python installation
python --version
pip list

# Test imports
python -c "import requests, PIL, numpy, sklearn; print('All packages installed!')"
```

**Expected Output:**
```
Python 3.8.x
All packages installed!
```

### 2. WordPress Connection Verification

```bash
# Create test script
cat > test_wordpress.py << 'EOF'
import requests
from requests.auth import HTTPBasicAuth

WORDPRESS_URL = "https://your-wordpress.com"
USERNAME = "your_username"
PASSWORD = "your_app_password"

url = f"{WORDPRESS_URL}/wp-json/wp/v2/posts"
response = requests.get(url, auth=HTTPBasicAuth(USERNAME, PASSWORD))

if response.status_code == 200:
    print("✓ WordPress connection successful")
    print(f"  Found {len(response.json())} posts")
else:
    print("✗ Connection failed")
    print(f"  Status: {response.status_code}")
EOF

python test_wordpress.py
```

### 3. Adobe InDesign Verification

```
1. Open Adobe InDesign
2. File > Scripts > Script Panel
3. Verify 07_JSX folder appears
4. Expand and see ANN_AutoFill.jsx
5. Verify folder path shows correctly
```

### 4. Directory Structure Verification

```bash
# Run verification script
python scripts/verify_installation.py

# Or manually verify:
ls -la 01_Data/      # Should exist and be empty
ls -la 02_Images/    # Should exist and be empty
ls -la 04_Output/    # Should exist and be empty
ls -la 08_Logs/      # Should exist and be empty
ls -la 07_JSX/       # Should contain .jsx files
```

---

## First Run Test

### Step 1: Test Python Pipeline

```bash
# Run test with limited data
python engine/main.py --test --limit 5

# This will:
# 1. Fetch 5 stories from WordPress
# 2. Download images
# 3. Process and rank stories
# 4. Generate sample edition.json
```

### Step 2: Test InDesign Automation

```
1. Open Adobe InDesign
2. Open template: 05_Templates/ANN_Template_v1.indt
3. File > Scripts > Other Scripts > ANN_AutoFill.jsx
4. Monitor console for progress
5. Check 04_Output/ for generated PDF
6. Check 08_Logs/ for execution log
```

### Step 3: Verify Output

```bash
# Check generated files
ls -la 01_Data/edition.json       # Should exist
ls -la 04_Output/ANN_Epaper_*.pdf # Should exist
ls -la 08_Logs/ANN_Execution_*.log # Should exist

# View log file
cat 08_Logs/ANN_Execution_*.log
```

---

## Troubleshooting

### Python Issues

#### Issue: "Python not found"
```bash
# Windows: Add Python to PATH
# 1. System Properties > Environment Variables
# 2. Add C:\Users\[username]\AppData\Local\Programs\Python\Python38
# 3. Restart terminal

# macOS/Linux:
which python3
python3 --version
```

#### Issue: "pip: command not found"
```bash
# Windows
python -m pip install --upgrade pip

# macOS/Linux
python3 -m pip install --upgrade pip
```

#### Issue: Module import errors
```bash
# Reinstall requirements
pip install --force-reinstall -r engine/requirements.txt
```

### WordPress Issues

#### Issue: "Connection refused"
```bash
# Verify WordPress URL
curl https://your-wordpress.com/wp-json/wp/v2/posts

# Check credentials
# - Use REST API credentials, not WordPress password
# - Generate app password in WordPress admin panel
```

#### Issue: "401 Unauthorized"
```bash
# Verify authentication
# 1. Check WORDPRESS_USERNAME correct
# 2. Regenerate app password
# 3. Update 06_Config/settings.py
```

### Adobe InDesign Issues

#### Issue: "Script not found in menu"
```
1. Copy .jsx files to Scripts folder
2. Restart Adobe InDesign
3. Check File > Scripts > Script Panel

# Alternative: Run directly
File > Scripts > Other Scripts > [Browse to file]
```

#### Issue: "Frames not found"
```
1. Open InDesign template
2. Verify all frames are named correctly
3. Check frame names match edition.json exactly
4. Frame names are case-sensitive
```

#### Issue: "PDF export fails"
```
1. Check 04_Output/ has write permissions
2. Verify 1GB disk space available
3. Check InDesign not processing other file
4. Try exporting manually to verify settings
```

### Installation Issues

#### Issue: "Permission denied" on Linux/macOS
```bash
chmod +x engine/main.py
chmod +x scripts/*.py
```

#### Issue: "Virtual environment not activating"
```bash
# Recreate virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r engine/requirements.txt
```

---

## Post-Installation Checklist

- [ ] Python 3.8+ installed and working
- [ ] Virtual environment created and activated
- [ ] All dependencies installed (pip list shows all packages)
- [ ] Configuration files created in 06_Config/
- [ ] WordPress credentials verified
- [ ] All directories created (01_Data, 02_Images, 04_Output, 08_Logs)
- [ ] Adobe InDesign CC 2019+ installed
- [ ] JSX scripts copied to InDesign Scripts folder
- [ ] InDesign template created with named frames
- [ ] Paragraph and Object styles created
- [ ] Test run completed successfully
- [ ] Output PDF generated and verified
- [ ] Execution logs reviewed

---

## Next Steps

1. **Configure Daily Workflow**
   - Set up WordPress article sources
   - Configure story categories
   - Test content fetching

2. **Customize Templates**
   - Adjust frame sizes to fit content
   - Create custom paragraph styles
   - Set up branded design templates

3. **Tune AI Settings**
   - Adjust story ranking weights
   - Fine-tune classification
   - Test with different content sets

4. **Read Daily Workflow Guide**
   - See [USER_GUIDE.md](USER_GUIDE.md)
   - Learn daily publishing process
   - Understand troubleshooting steps

---

**Installation Complete!** ✅

You're now ready to use ANN Publisher v1.0. 

**Next:** Read [USER_GUIDE.md](USER_GUIDE.md) for daily workflow instructions.

---

**For additional help:**
- Check [README.md](README.md) for overview
- See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for file organization
- Review [RELEASE_NOTES_v1.0.md](RELEASE_NOTES_v1.0.md) for version details
