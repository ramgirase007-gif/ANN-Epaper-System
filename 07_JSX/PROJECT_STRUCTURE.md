# Project Structure - ANN Publisher v1.0

Complete file organization and directory structure for ANN Publisher system.

---

## Root Directory Structure

```
ANN-Epaper-System/
│
├── 01_Data/                          # Input/Output Data Directory
│   ├── edition.json                  # Generated edition data (JSON format)
│   └── [backup]/                     # Previous edition backups
│
├── 02_Images/                        # Downloaded Article Images
│   ├── image_001.jpg                 # Article featured images
│   ├── image_002.jpg
│   └── [archived]/                   # Previous edition images
│
├── 03_Engine/                        # Python Backend Engine
│   ├── main.py                       # Main orchestrator script
│   ├── requirements.txt              # Python dependencies
│   ├── wordpress/                    # WordPress integration
│   │   ├── __init__.py
│   │   ├── api.py                   # WordPress REST API client
│   │   ├── fetcher.py               # Article fetching
│   │   └── downloader.py            # Image downloading
│   ├── ranking/                      # AI Ranking System
│   │   ├── __init__.py
│   │   ├── ranker.py                # Story ranking algorithm
│   │   └── models.py                # ML models
│   ├── layout/                       # Layout Generation
│   │   ├── __init__.py
│   │   ├── allocator.py             # Story allocation to pages
│   │   └── optimizer.py             # Layout optimization
│   └── json_exporter/               # JSON Export
│       ├── __init__.py
│       ├── exporter.py              # JSON generation
│       └── validator.py             # JSON validation
│
├── 04_Output/                        # Generated PDF Output
│   ├── ANN_Epaper_YYYYMMDD_HHMMSS.pdf  # Generated PDF files
│   ├── [Archive]/                    # Previous edition PDFs
│   │   ├── 2024-07/
│   │   ├── 2024-06/
│   │   └── [monthly folders]/
│   └── [test_output]/               # Test run outputs
│
├── 05_Templates/                     # Adobe InDesign Templates
│   ├── ANN_Template_v1.indt          # Main template (4+ pages)
│   ├── Daily/                        # Daily edition templates
│   │   └── daily_template.indt
│   ├── Weekend/                      # Weekend edition templates
│   │   └── weekend_template.indt
│   ├── Special/                      # Special edition templates
│   │   └── special_template.indt
│   └── Breaking/                     # Breaking news templates
│       └── breaking_template.indt
│
├── 06_Config/                        # Configuration Files
│   ├── settings.py                   # Main settings (WordPress, AI, Layout)
│   ├── settings.example.py           # Example configuration
│   ├── ai_settings.py                # AI model settings
│   ├── layout.py                     # Layout configuration
│   ├── style_presets.py              # InDesign style presets
│   └── [environment]/
│       ├── production.py             # Production settings
│       ├── staging.py                # Staging settings
│       └── development.py            # Development settings
│
├── 07_JSX/                           # Adobe InDesign ExtendScript Files
│   ├── ANN_AutoFill.jsx              # Main orchestrator (21 KB)
│   ├── export_pdf.jsx                # PDF export engine (8 KB)
│   ├── logger.jsx                    # Execution logger (15 KB)
│   ├── README.md                     # JSX documentation
│   └── [utilities]/
│       └── helpers.jsx               # Shared utilities (if needed)
│
├── 08_Logs/                          # Execution Logs
│   ├── ANN_Execution_YYYYMMDD_HHMMSS.log  # Daily execution logs
│   ├── [Archive]/                    # Previous logs
│   │   ├── 2024-07/
│   │   ├── 2024-06/
│   │   └── [monthly folders]/
│   └── error_log.txt                 # Error tracking
│
├── 09_Scripts/                       # Utility Scripts
│   ├── verify_installation.py        # Installation verification
│   ├── test_wordpress.py             # WordPress connection test
│   ├── inspect_edition.py            # Edition JSON inspection
│   ├── validate_edition.py           # JSON validation
│   ├── generate_report.py            # Report generation
│   └── [maintenance]/
│       ├── cleanup.py                # Log cleanup
│       └── archive.py                # Edition archiving
│
├── Documentation/                    # Comprehensive Documentation
│   ├── README.md                     # System overview
│   ├── INSTALL.md                    # Installation guide
│   ├── USER_GUIDE.md                 # Daily workflow guide
│   ├── PROJECT_STRUCTURE.md          # This file
│   ├── RELEASE_NOTES_v1.0.md         # Version 1.0 details
│   ├── ARCHITECTURE.md               # System architecture (future)
│   ├── API_REFERENCE.md              # API documentation (future)
│   └── [troubleshooting]/
│       ├── COMMON_ISSUES.md
│       ├── ERROR_CODES.md
│       └── FAQ.md
│
├── .github/                          # GitHub Configuration
│   ├── workflows/                    # CI/CD Workflows (future)
│   └── ISSUE_TEMPLATE.md
│
├── .gitignore                        # Git ignore file
├── LICENSE                           # License file
└── README.md                         # Root README (links to Documentation/)
```

---

## File Descriptions

### Core JSX Scripts (07_JSX/)

#### ANN_AutoFill.jsx (21 KB)
**Purpose:** Main orchestrator for InDesign automation

**Key Functions:**
- `main()` - Orchestrates entire workflow
- `loadEdition()` - Loads JSON from 01_Data/
- `findFrame()` - Locates named frames
- `fillHeadline()` - Inserts headlines with styles
- `fillStory()` - Inserts body text with styles
- `placeImage()` - Places images with scaling
- `fitImage()` - Scales images proportionally
- `exportPDF()` - Exports high-quality PDF
- `writeLog()` - Generates execution logs

**Global Logger:** Integrated logging object

**Entry Point:** `main()` executed on script load

---

#### export_pdf.jsx (8 KB)
**Purpose:** High-quality PDF export engine

**Settings:**
- Resolution: 300 DPI
- Color Space: CMYK
- Compression: Level 6
- Format: PDF 1.7

**Functions:**
- `exportPDF()` - Main export function
- `createHighQualityPreset()` - Creates export preset
- `getOutputFolder()` - Returns output directory

**Output:**
```
04_Output/ANN_Epaper_YYYYMMDD_HHMMSS.pdf
```

---

#### logger.jsx (15 KB)
**Purpose:** Comprehensive execution logging

**Logger Object Methods:**
- `init()` - Initialize logger
- `logMissingFrame()` - Track missing frames
- `logMissingImage()` - Track missing images
- `logMissingStyle()` - Track missing styles
- `logJSONError()` - Track JSON errors
- `updateSummary()` - Update statistics
- `write()` - Write log file
- `printReport()` - Print to console

**Output:**
```
08_Logs/ANN_Execution_YYYYMMDD_HHMMSS.log
```

---

### Configuration Files (06_Config/)

#### settings.py
**WordPress Configuration:**
```python
WORDPRESS_URL = "https://your-wordpress.com"
WORDPRESS_API_VERSION = "wp/v2"
WORDPRESS_USERNAME = "admin"
WORDPRESS_PASSWORD = "app_password"
```

**Story Configuration:**
```python
STORY_CATEGORIES = ["news", "featured", "breaking"]
POSTS_PER_CATEGORY = 10
MIN_STORY_LENGTH = 100
MAX_STORIES = 30
```

**Image Settings:**
```python
DOWNLOAD_IMAGES = True
IMAGE_QUALITY = 85
MAX_IMAGE_SIZE = 5000000  # 5MB
```

---

#### ai_settings.py
**Ranking Model:**
```python
RANKING_MODEL = "tfidf"  # or "bert", "custom"
```

**Scoring Weights:**
```python
RECENCY_WEIGHT = 0.3
IMPORTANCE_WEIGHT = 0.4
ENGAGEMENT_WEIGHT = 0.3
```

---

#### layout.py
**Page Configuration:**
```python
PAGES_PER_EDITION = 4
STORIES_PER_PAGE = 3
COLUMNS = 2
```

**Story Allocation:**
```python
FEATURED_STORIES = 3
SECONDARY_STORIES = 4
TERTIARY_STORIES = 23
```

---

### Python Backend (03_Engine/)

#### main.py
**Entry Point:** `python engine/main.py`

**Stages:**
1. WordPress fetch
2. Image download
3. Story ranking
4. Content classification
5. Page allocation
6. Layout generation
7. JSON export

---

#### requirements.txt
**Dependencies:**
```
requests>=2.28.0
Pillow>=9.0.0
python-dotenv>=0.19.0
numpy>=1.21.0
scikit-learn>=1.0.0
```

---

### Data Files (01_Data/)

#### edition.json
**Structure:**
```json
{
  "edition": "2024-07-09",
  "generated_at": "2024-07-09T06:30:00Z",
  "pages": [
    {
      "page_number": 1,
      "stories": [
        {
          "id": "story_001",
          "headline": "Breaking News",
          "headline_frame": "headline_1",
          "headline_style": "Headline Style",
          "body": "Full story text...",
          "body_frame": "story_body_1",
          "body_style": "Body Text Style",
          "image_url": "/path/to/image.jpg",
          "image_frame": "image_1",
          "image_style": "Image Style"
        }
      ]
    }
  ]
}
```

---

### Log Files (08_Logs/)

#### ANN_Execution_*.log
**Contents:**
- Timestamp and duration
- Processing summary
- Missing frames count
- Missing images count
- Missing styles count
- JSON errors
- Overall status

---

## Directory Permissions

### Required Permissions

```bash
# Python scripts need execute permission
chmod +x 03_Engine/*.py
chmod +x 09_Scripts/*.py

# JSX scripts need read permission
chmod +r 07_JSX/*.jsx

# Data directories need write permission
chmod 755 01_Data/
chmod 755 02_Images/
chmod 755 04_Output/
chmod 755 08_Logs/

# Config files need read permission
chmod 644 06_Config/*.py
```

---

## File Size Reference

```
07_JSX/ANN_AutoFill.jsx         21 KB
07_JSX/export_pdf.jsx            8 KB
07_JSX/logger.jsx               15 KB
03_Engine/main.py               25 KB
06_Config/settings.py           12 KB
01_Data/edition.json            50-200 KB
02_Images/                      100-500 MB (varies by image count)
04_Output/ANN_Epaper_*.pdf      2-5 MB per edition
08_Logs/ANN_Execution_*.log     10-50 KB per run
```

---

## Frame Naming Convention

### InDesign Frame Names (Required)

**Headlines:**
```
Page 1: headline_1, headline_2, headline_3, ...
Page 2: headline_1, headline_2, headline_3, ...
Page N: headline_1, headline_2, headline_3, ...
```

**Body Text:**
```
Page 1: story_body_1, story_body_2, story_body_3, ...
Page 2: story_body_1, story_body_2, story_body_3, ...
Page N: story_body_1, story_body_2, story_body_3, ...
```

**Images:**
```
Page 1: image_1, image_2, image_3, ...
Page 2: image_1, image_2, image_3, ...
Page N: image_1, image_2, image_3, ...
```

**Naming Rules:**
- Frame names are case-sensitive
- Must exactly match names in edition.json
- Sequential numbering starting at 1
- Consistent naming across all pages

---

## Workflow Folder Structure

### Daily Workflow

```
Morning (6:00 AM):
├── 1. Run Python pipeline
│   ├── Python fetches WordPress articles
│   ├── Downloads images to 02_Images/
│   ├── Ranks and classifies stories
│   ├── Allocates to pages
│   └── Exports edition.json to 01_Data/
│
├── 2. Review generated content
│   └── Inspect 01_Data/edition.json
│
├── 3. Open InDesign template
│   └── 05_Templates/ANN_Template_v1.indt
│
├── 4. Run InDesign script
│   ├── ANN_AutoFill.jsx processes edition.json
│   ├── Fills all frames with content
│   ├── Applies styles
│   └── Exports PDF
│
├── 5. Review outputs
│   ├── Check 04_Output/ANN_Epaper_*.pdf
│   └── Review 08_Logs/ANN_Execution_*.log
│
└── 6. Distribution
    ├── Email, upload, or print PDF
    └── Archive to 04_Output/Archive/
```

---

## Backup & Archive Strategy

### Daily Backups

```
04_Output/Archive/
├── 2024-07/
│   ├── ANN_Epaper_20240709_060000.pdf
│   ├── ANN_Epaper_20240708_060000.pdf
│   └── ...
├── 2024-06/
│   └── ...
└── [monthly folders]/

08_Logs/Archive/
├── 2024-07/
│   ├── ANN_Execution_20240709_063000.log
│   ├── ANN_Execution_20240708_063000.log
│   └── ...
├── 2024-06/
│   └── ...
└── [monthly folders]/
```

### Configuration Backups

```
06_Config/
├── settings.py (current)
├── settings.py.bak (previous)
└── [versions]/
    ├── settings_20240709.py
    ├── settings_20240708.py
    └── ...
```

---

## Environment-Specific Configurations

### Development Environment

```
06_Config/development.py
- WordPress staging URL
- Test article categories
- Reduced MAX_STORIES
- Logging: DEBUG level
```

### Staging Environment

```
06_Config/staging.py
- WordPress staging URL
- Test article categories
- Full content processing
- Logging: INFO level
```

### Production Environment

```
06_Config/production.py
- Live WordPress URL
- All article categories
- Full content processing
- Logging: WARNING level
```

---

## File Ownership & Maintenance

### Created By Sprint 8

**JSX Scripts:**
- ✅ 07_JSX/ANN_AutoFill.jsx
- ✅ 07_JSX/export_pdf.jsx
- ✅ 07_JSX/logger.jsx
- ✅ 07_JSX/README.md

**Documentation:**
- ✅ README.md
- ✅ INSTALL.md
- ✅ USER_GUIDE.md
- ✅ PROJECT_STRUCTURE.md
- ✅ RELEASE_NOTES_v1.0.md

### Pre-Existing Python Backend

**Not Modified (Sprint 8):**
- 03_Engine/main.py
- 03_Engine/requirements.txt
- 03_Engine/wordpress/*
- 03_Engine/ranking/*
- 03_Engine/layout/*
- 03_Engine/json_exporter/*

---

## Git Repository Structure

```
.git/
├── objects/          # Git objects
├── refs/            # References (branches, tags)
├── HEAD             # Current branch
├── config           # Repository configuration
└── logs/            # Reference logs

Branches:
├── main (current)   # Production branch
├── develop          # Development branch (future)
└── feature/*        # Feature branches (future)

Tags:
└── v1.0.0          # Version 1.0.0 tag
```

---

## Related Documentation

- See [README.md](README.md) for system overview
- See [INSTALL.md](INSTALL.md) for installation
- See [USER_GUIDE.md](USER_GUIDE.md) for daily workflow
- See [RELEASE_NOTES_v1.0.md](RELEASE_NOTES_v1.0.md) for version details
- See [07_JSX/README.md](07_JSX/README.md) for JSX scripts

---

**ANN Publisher v1.0 - Project Structure** ✅
