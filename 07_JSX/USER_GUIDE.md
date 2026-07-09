# User Guide - ANN Publisher v1.0

Complete daily workflow guide for operating ANN Publisher and publishing newspaper editions.

## Table of Contents

1. [Daily Workflow](#daily-workflow)
2. [Step-by-Step Publishing](#step-by-step-publishing)
3. [Content Management](#content-management)
4. [Troubleshooting](#troubleshooting)
5. [Tips and Tricks](#tips-and-tricks)
6. [FAQ](#faq)

---

## Daily Workflow

### Overview

The daily publishing workflow consists of five main stages:

```
Stage 1: Article Collection (Python)
         ↓
Stage 2: Content Processing (Python)
         ↓
Stage 3: Layout Generation (Python)
         ↓
Stage 4: InDesign Publishing (JSX)
         ↓
Stage 5: Quality Review & Distribution
```

**Typical Duration:** 2-5 minutes per edition

**Daily Schedule Example:**
```
06:00 AM - Configure WordPress settings
06:05 AM - Run Python pipeline
06:15 AM - Review edition.json
06:20 AM - Open InDesign and run ANN_AutoFill.jsx
06:30 AM - Review PDF output
06:35 AM - Check execution logs
06:40 AM - Distribution ready
```

---

## Step-by-Step Publishing

### Stage 1: Prepare Environment

**Morning Setup (5 minutes)**

```bash
# 1. Open terminal/command prompt
cd /path/to/ANN-Epaper-System

# 2. Activate Python virtual environment
# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate

# 3. Verify environment
python --version
pip list
```

**Expected Output:**
```
(venv) $ python --version
Python 3.8.x
```

### Stage 2: Configure Content Settings

**Configure WordPress Feed (as needed)**

**File:** `06_Config/settings.py`

```python
# Adjust these daily if needed:
STORY_CATEGORIES = ["news", "breaking", "featured"]
POSTS_PER_CATEGORY = 10
MIN_STORY_LENGTH = 100
MAX_STORIES = 30
```

**For Special Editions:**
- Breaking news: Increase breaking category count
- Weekend edition: Adjust categories and story count
- Holiday special: Configure themed categories

### Stage 3: Run Python Pipeline

**Execute Main Processing**

```bash
# Standard daily run
python engine/main.py

# With verbose output
python engine/main.py --verbose

# Test mode (limited articles)
python engine/main.py --test --limit 5

# Custom configuration
python engine/main.py --config 06_Config/custom_settings.py
```

**Pipeline Steps:**
1. **Fetch from WordPress** (5-10 sec)
   - Connects to WordPress API
   - Retrieves articles by category
   - Filters by date and length

2. **Download Images** (10-30 sec)
   - Saves featured images
   - Stores in 02_Images/
   - Applies quality settings

3. **Rank Stories** (5-10 sec)
   - Uses AI ranking model
   - Scores by recency, importance, engagement
   - Orders for page placement

4. **Classify Content** (5-10 sec)
   - Categorizes automatically
   - Assigns story types
   - Detects key information

5. **Allocate Pages** (5 sec)
   - Distributes stories across pages
   - Optimizes layout
   - Respects space limits

6. **Generate Layout** (5 sec)
   - Creates JSON structure
   - Defines frame assignments
   - Prepares for InDesign

**Monitoring Progress:**
```
[WordPress] Fetching 30 articles...
[WordPress] Downloaded 28 images
[Ranking] Processing stories...
[Classification] Categorizing content...
[Layout] Allocating pages...
[Export] Generating edition.json
✓ Pipeline complete in 45 seconds
```

### Stage 4: Review Generated Content

**Inspect edition.json**

```bash
# View content summary
python scripts/inspect_edition.py

# Check specific page
python scripts/inspect_edition.py --page 1

# Validate JSON structure
python scripts/validate_edition.py
```

**Review Checklist:**
- [ ] All pages have content
- [ ] Images are properly allocated
- [ ] Story count is correct
- [ ] Top stories appear on first page
- [ ] No missing content

**Sample Check:**
```bash
cat 01_Data/edition.json | head -50
```

### Stage 5: InDesign Publishing

**Open Template**

```
File > Open
Location: 05_Templates/ANN_Template_v1.indt
```

**Verify Template Setup**
- [ ] All pages exist
- [ ] Named frames are present
- [ ] Styles are defined
- [ ] Document is blank/ready

**Run AutoFill Script**

```
File > Scripts > Other Scripts > ANN_AutoFill.jsx
```

**Monitor Execution:**
- Window > Info shows progress
- Console displays status messages
- Processing typically takes 8-15 seconds

**Script Output:**
```
[ANN_AutoFill] Starting main process
[ANN_AutoFill] Document: ANN_Template_v1
[ANN_AutoFill] Edition loaded successfully
[ANN_AutoFill] Processing page 1
[ANN_AutoFill] Processing page 2
[ANN_AutoFill] Processing page 3
[ANN_AutoFill] Processing page 4
[ANN_AutoFill] Pages processed: 4
[ANN_AutoFill] Headlines filled: 12
[ANN_AutoFill] Stories filled: 12
[ANN_AutoFill] Images placed: 12
[ANN_AutoFill] Document saved
[export_pdf] Exported to: 04_Output/ANN_Epaper_20240709_063045.pdf
[ANN_AutoFill] Process completed in 12.45 seconds
```

### Stage 6: Review Output

**Inspect Generated PDF**

```bash
# List generated files
ls -la 04_Output/

# Open in PDF viewer
open 04_Output/ANN_Epaper_*.pdf  # macOS
xdg-open 04_Output/ANN_Epaper_*.pdf  # Linux
start 04_Output/ANN_Epaper_*.pdf  # Windows
```

**PDF Review Checklist:**
- [ ] All pages are formatted correctly
- [ ] Headlines are readable
- [ ] Images are properly scaled
- [ ] Text is not cut off
- [ ] Layout looks professional
- [ ] Page numbers are visible

### Stage 7: Check Execution Logs

**Review Logs**

```bash
# View latest log
cat 08_Logs/ANN_Execution_*.log | tail -20

# Check for issues
grep -i "error\|warning\|missing" 08_Logs/ANN_Execution_*.log
```

**Log Contains:**
- Processing summary
- Missing frames count
- Missing images count
- Missing styles count
- Execution time
- Overall status

**Example Log:**
```
╔════════════════════════════════════════════════════════════╗
║        ANN Publisher v1.0 - Execution Log                 ║
╚════════════════════════════════════════════════════════════╝

Start Time:  July 9, 2024 6:30:45 AM
End Time:    July 9, 2024 6:30:57 AM
Duration:    12.23 seconds

═══════════════════════════════════════════════════════════
PROCESSING SUMMARY
═══════════════════════════════════════════════════════════
Pages Processed:  4
Headlines Filled: 12
Stories Filled:   12
Images Placed:    12
Total Issues:     0

✓ SUCCESS - All content processed successfully
```

### Stage 8: Distribution

**Prepare for Distribution:**

```bash
# Copy PDF to distribution folder
cp 04_Output/ANN_Epaper_*.pdf /path/to/distribution/

# Email to subscribers
# Upload to website
# Print to physical printer

# Archive edition
cp 04_Output/ANN_Epaper_*.pdf 04_Output/Archive/ANN_Epaper_20240709.pdf
```

---

## Content Management

### Adding New Stories

**WordPress Integration:**

Stories are automatically fetched from WordPress. To add stories:

1. **Publish in WordPress**
   - Add article with featured image
   - Assign to configured category
   - Set publication date

2. **Configure Fetch**
   - Edit `06_Config/settings.py`
   - Adjust `STORY_CATEGORIES`
   - Set `POSTS_PER_CATEGORY`

3. **Re-run Pipeline**
   - Execute `python engine/main.py`
   - New stories will be included

### Adjusting Story Priority

**Manual Ranking (if needed):**

```bash
# Edit edition.json to reorder stories
nano 01_Data/edition.json

# Change story order in pages array
# Move important stories to earlier positions
```

**Or Configure Ranking:**

```python
# File: 06_Config/ai_settings.py
RECENCY_WEIGHT = 0.3      # Weight for recent articles
IMPORTANCE_WEIGHT = 0.4   # Weight for important stories
ENGAGEMENT_WEIGHT = 0.3   # Weight for engagement metrics
```

### Managing Images

**Image Handling:**

```bash
# Downloaded images stored in:
ls -la 02_Images/

# Check image sizes:
du -sh 02_Images/*

# Manual image replacement:
# 1. Copy new image to 02_Images/
# 2. Update path in 01_Data/edition.json
# 3. Re-run ANN_AutoFill.jsx
```

**Image Settings:**

```python
# File: 06_Config/settings.py
DOWNLOAD_IMAGES = True
IMAGE_QUALITY = 85        # JPEG quality
MAX_IMAGE_SIZE = 5000000  # 5MB max
```

### Customizing Layout

**Adjust Page Allocation:**

```python
# File: 06_Config/layout.py
PAGES_PER_EDITION = 4
STORIES_PER_PAGE = 3
COLUMNS = 2

# Story allocation:
FEATURED_STORIES = 3       # Top stories on page 1
SECONDARY_STORIES = 4      # Important stories
TERTIARY_STORIES = 23      # Regular stories
```

**Modify InDesign Template:**

1. Open template in Adobe InDesign
2. Adjust frame sizes and positions
3. Add or remove frames (keep naming convention)
4. Update styles as needed
5. Save and verify with test run

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: Python Script Fails

**Symptom:** `ModuleNotFoundError` or script won't start

**Solution:**
```bash
# 1. Verify virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate  # Windows

# 2. Check Python version
python --version  # Should be 3.8+

# 3. Reinstall dependencies
pip install --force-reinstall -r engine/requirements.txt

# 4. Try again
python engine/main.py --verbose
```

#### Issue: WordPress Connection Failed

**Symptom:** `ConnectionError` or timeout

**Solution:**
```bash
# 1. Verify WordPress URL
# In browser: https://your-wordpress.com/wp-json/wp/v2/posts

# 2. Check credentials
# Settings > App Passwords > Create app password

# 3. Update configuration
nano 06_Config/settings.py
# Set WORDPRESS_URL and password

# 4. Test connection
python scripts/test_wordpress.py
```

#### Issue: No Images Downloaded

**Symptom:** 02_Images/ is empty, no images in PDF

**Solution:**
```bash
# 1. Check download setting
nano 06_Config/settings.py
# DOWNLOAD_IMAGES should be True

# 2. Verify featured images in WordPress
# Each post should have featured image

# 3. Check disk space
df -h  # Unix/Linux/macOS
dir C:\  # Windows

# 4. Run with verbose
python engine/main.py --verbose
# Should show "Downloading image..." messages
```

#### Issue: InDesign Script Won't Run

**Symptom:** Script doesn't appear in menu or crashes

**Solution:**
```bash
# 1. Verify files are in Scripts folder
# Windows: C:\Program Files\Adobe\Adobe InDesign\Scripts\Scripts Panel\
# macOS: /Applications/Adobe InDesign/Scripts/Scripts Panel/
# Linux: /opt/Adobe/InDesign/Scripts/Scripts Panel/

# 2. Check file permissions
chmod +x 07_JSX/*.jsx  # macOS/Linux

# 3. Restart Adobe InDesign completely

# 4. Try manual run
File > Scripts > Other Scripts > [Browse to 07_JSX/ANN_AutoFill.jsx]
```

#### Issue: Frames Not Found

**Symptom:** Log shows "Missing frames" errors

**Solution:**
```bash
# 1. Verify frame names in InDesign
# In InDesign: Window > Object & Layout > Layers
# Check all frames are named correctly

# 2. Compare with JSON
# Frame names must match exactly (case-sensitive)
grep "headline_frame\|body_frame\|image_frame" 01_Data/edition.json

# 3. Verify frames on correct pages
# edition.json page 1 should have headline_1, headline_2, etc.
# InDesign page 1 should have same frame names

# 4. Re-run script
# Or manually adjust frame names in either location
```

#### Issue: PDF Export Failed

**Symptom:** No PDF in 04_Output/ or error message

**Solution:**
```bash
# 1. Check disk space
ls -la 04_Output/
df -h

# 2. Verify write permissions
chmod 755 04_Output/  # macOS/Linux

# 3. Check InDesign not busy
# Close any export dialogs
# Wait for any processing to complete

# 4. Try manual export
# File > Export as PDF > 04_Output/test.pdf

# 5. Check export settings
# In ANN_AutoFill.jsx verify:
# - RESOLUTION_DPI = 300
# - COLOR_MODE = "CMYK"
```

#### Issue: Missing Styles Applied

**Symptom:** Log shows "Missing style" warnings, text is unstyled

**Solution:**
```bash
# 1. Verify styles exist in InDesign
# Window > Styles > Paragraph Styles / Object Styles

# 2. Check style names match JSON
grep "headline_style\|body_style\|image_style" 01_Data/edition.json

# 3. Create missing styles
# In InDesign, create style with exact name from JSON

# 4. Re-run script
# Styles will be applied on next run
```

---

## Tips and Tricks

### Optimizing Daily Performance

```bash
# 1. Pre-load WordPress articles
# Set POSTS_PER_CATEGORY to 50 in settings
# Run pipeline at night to generate JSON
# In morning, just run InDesign script

# 2. Use test mode for troubleshooting
python engine/main.py --test --limit 5
# Quick 30-second test with 5 articles

# 3. Keep templates organized
# Separate templates: 05_Templates/Daily/
#                    05_Templates/Weekend/
#                    05_Templates/Special/

# 4. Archive editions
mkdir -p 04_Output/Archive
cp 04_Output/ANN_Epaper_*.pdf 04_Output/Archive/
```

### Automating Daily Runs

#### Windows (Task Scheduler)

```batch
REM Create scheduled task
schtasks /create /tn ANN_Publisher /tr "python engine/main.py" /sc daily /st 06:00
```

#### macOS/Linux (cron)

```bash
# Edit crontab
crontab -e

# Add daily run at 6:00 AM
0 6 * * * cd /path/to/ANN-Epaper-System && source venv/bin/activate && python engine/main.py
```

### Monitoring Execution

```bash
# Real-time log viewing
tail -f 08_Logs/ANN_Execution_*.log

# Monitor both Python and JSX
watch -n 1 'ls -lt 08_Logs/ | head -5'

# Summary report
python scripts/generate_report.py
```

### Custom Configurations

```bash
# Create variation for weekends
cp 06_Config/settings.py 06_Config/settings_weekend.py

# Modify weekend settings
nano 06_Config/settings_weekend.py
STORY_CATEGORIES = ["weekend", "feature", "lifestyle"]
PAGES_PER_EDITION = 8

# Run with custom config
python engine/main.py --config 06_Config/settings_weekend.py
```

---

## FAQ

### Q: How long does the full process take?

**A:** Typical execution times:
- WordPress fetch: 5-10 seconds
- Image download: 10-30 seconds (depends on image count/size)
- AI processing: 20-30 seconds
- Layout generation: 5-10 seconds
- InDesign automation: 8-15 seconds
- **Total: 2-5 minutes**

### Q: Can I edit the PDF before distribution?

**A:** Yes! Adobe InDesign document is still open after script completes. You can:
- Manually adjust text
- Move frames
- Add graphics
- Edit images
- Then export again

### Q: What if a story is missing?

**A:** Check the logs:
```bash
grep "Missing\|Error" 08_Logs/ANN_Execution_*.log
```

Common causes:
- Story didn't meet minimum length requirement
- Featured image missing
- WordPress category not configured
- API connection timeout

### Q: Can I use different templates?

**A:** Yes! Create templates in `05_Templates/`:
```bash
05_Templates/Daily/
05_Templates/Weekend/
05_Templates/Special/
05_Templates/Breaking/
```

Run with different template:
```bash
# Copy template before running script
cp 05_Templates/Weekend/template.indt /tmp/working.indt
# In InDesign, open working template
# Run ANN_AutoFill.jsx
```

### Q: How do I update stories after publishing?

**A:** Two options:

**Option 1: Update WordPress**
```
1. Update article in WordPress
2. Run python engine/main.py again
3. Check updated 01_Data/edition.json
4. Re-run ANN_AutoFill.jsx
5. Export new PDF
```

**Option 2: Manual Edit in InDesign**
```
1. Edition already open in InDesign
2. Manually edit text
3. File > Export as PDF
```

### Q: Can I schedule automatic publishing?

**A:** Yes, use system schedulers:

**Windows:**
```batch
schtasks /create /tn DailyANN /tr "python engine/main.py" /sc daily /st 06:00
```

**macOS/Linux:**
```bash
0 6 * * * cd /path/to/ANN && source venv/bin/activate && python engine/main.py
```

### Q: How do I backup previous editions?

**A:** Create archive structure:
```bash
mkdir -p 04_Output/Archive/2024-07
cp 04_Output/ANN_Epaper_20240709_*.pdf 04_Output/Archive/2024-07/
```

### Q: What if InDesign crashes?

**A:** 
```bash
# Files are saved after each step
# Check for partial outputs
ls -la 04_Output/
ls -la 08_Logs/

# Restart and re-run
# Script will regenerate from edition.json
```

### Q: Can I run multiple editions simultaneously?

**A:** Not recommended. Issues:
- File conflicts in 01_Data/
- Image download conflicts
- PDF export conflicts

**Solution:** Use separate folders:
```bash
mkdir ANN_Edition_Morning
mkdir ANN_Edition_Evening
# Run each in separate terminal
```

---

## Performance Optimization

### For Faster Execution

```python
# File: 06_Config/settings.py
# Reduce content
MAX_STORIES = 20  # instead of 30
POSTS_PER_CATEGORY = 5  # instead of 10

# Disable unused features
DOWNLOAD_IMAGES = False  # if testing layout
CLASSIFICATION_ENABLED = False  # if not needed
```

### For Better Quality

```python
# File: 06_Config/settings.py
# Increase content
MAX_STORIES = 40
POSTS_PER_CATEGORY = 20

# File: 07_JSX/config.jsx
RESOLUTION_DPI = 300  # Keep high
COLOR_MODE = "CMYK"  # Print quality
COMPRESSION = 6  # Maximum
```

---

**For technical setup, see [INSTALL.md](INSTALL.md)**

**For complete structure, see [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)**

**For version information, see [RELEASE_NOTES_v1.0.md](RELEASE_NOTES_v1.0.md)**

---

**ANN Publisher v1.0 User Guide** ✅
