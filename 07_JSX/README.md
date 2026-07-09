# ANN Publisher v1.0 - JSX Scripts Module

## Overview

This module contains Adobe InDesign ExtendScript (JSX) files that automate the newspaper publishing workflow. The scripts integrate with the Python backend to transform JSON data into a fully formatted, print-ready PDF.

## Workflow

```
python engine/main.py
        ↓
  edition.json
        ↓
ANN_AutoFill.jsx (Main orchestrator)
        ↓
Adobe InDesign Document
        ↓
export_pdf.jsx (High-quality export)
        ↓
04_Output/ANN_Epaper.pdf
        ↓
08_Logs/ANN_Execution_*.log
```

## Files

### 1. **ANN_AutoFill.jsx** ✓ PRODUCTION READY
**Main orchestrator script - Entry point for the InDesign automation**

**Features:**
- Opens active InDesign document
- Reads edition.json from `01_Data/` directory
- Parses all pages and stories
- Automatically detects named frames in InDesign layout
- Fills headlines with proper styling
- Fills story body text with paragraph styles
- Places and scales images proportionally
- Applies object and paragraph styles
- Handles missing content gracefully
- Exports high-quality PDF (300 DPI, CMYK)
- Saves InDesign document
- Generates comprehensive execution logs

**Modular Functions:**
```javascript
main()              // Orchestrates entire workflow
loadEdition()       // Loads JSON data from 01_Data/edition.json
findFrame()         // Locates named frames on pages
fillHeadline()      // Inserts headline with styling
fillStory()         // Inserts body text with styling
placeImage()        // Places image in frame
fitImage()          // Scales image proportionally
exportPDF()         // Exports high-quality PDF
writeLog()          // Generates execution log
```

**Error Handling:**
- Validates active document
- Checks file existence before operations
- Validates frame types
- Handles missing styles gracefully
- Logs all issues without stopping execution
- Continues processing even if individual elements fail

**Usage:**
```javascript
// In Adobe InDesign, run:
File > Scripts > Other Scripts > ANN_AutoFill.jsx
```

---

### 2. **export_pdf.jsx** ✓ PRODUCTION READY
**High-quality PDF export engine**

**Settings:**
- Resolution: **300 DPI** (professional print standard)
- Color Space: **CMYK** (print-ready color model)
- Output Location: **04_Output/**
- Compression: Level 6 (maximum compression)
- Compatibility: PDF 1.7

**Features:**
- Creates 04_Output/ directory if missing
- Generates timestamped filenames
- Creates high-quality print preset
- Exports all pages
- Verifies export completion
- Logs export details

**Functions:**
```javascript
exportPDF()                    // Main export function
createHighQualityPreset()      // Creates 300 DPI, CMYK preset
exportPDFWithSettings()        // Custom DPI/color settings
exportPageRangeToPDF()         // Export specific page range
getOutputFolder()              // Returns output directory
```

**Output Format:**
```
04_Output/ANN_Epaper_YYYYMMDD_HHMMSS.pdf
```

---

### 3. **logger.jsx** ✓ PRODUCTION READY
**Comprehensive execution logger**

**Logs:**
- Missing frames (names and context)
- Missing images (file paths)
- Missing styles (paragraph, object, character)
- JSON parsing errors
- Processing summary
- Execution time

**Logger Object Methods:**
```javascript
Logger.init()                  // Initialize with timestamp
Logger.logMissingFrame()       // Record missing frame
Logger.logMissingImage()       // Record missing image
Logger.logMissingStyle()       // Record missing style
Logger.logJSONError()          // Record JSON error
Logger.updateSummary()         // Update processing stats
Logger.getExecutionTime()      // Get elapsed time
Logger.write()                 // Write log file
Logger.printReport()           // Print to console
Logger.reset()                 // Reset logger state
```

**Log File Format:**
```
08_Logs/ANN_Execution_YYYYMMDD_HHMMSS.log
```

**Log Contains:**
- Timestamp and duration
- Pages processed count
- Headlines, stories, images statistics
- Detailed issue lists
- Execution status (SUCCESS or COMPLETED WITH WARNINGS)

---

## JSON Data Structure (edition.json)

```json
{
  "edition": "2024-07-09",
  "pages": [
    {
      "page_number": 1,
      "stories": [
        {
          "id": "story_001",
          "headline": "Breaking News Headline",
          "headline_frame": "headline_1",
          "headline_style": "Headline Style",
          "body": "Full story text content...",
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

## InDesign Frame Naming Convention

Frames must be named in InDesign with consistent naming:

**Headlines:**
- `headline_1`, `headline_2`, `headline_3`, etc.

**Body Text:**
- `story_body_1`, `story_body_2`, `story_body_3`, etc.

**Images:**
- `image_1`, `image_2`, `image_3`, etc.

Frame names in JSON should match exactly:
```json
{
  "headline_frame": "headline_1",
  "body_frame": "story_body_1",
  "image_frame": "image_1"
}
```

---

## Execution Flow

### Step 1: Run Python Engine
```bash
python engine/main.py
```
Generates `01_Data/edition.json`

### Step 2: Open InDesign Template
```
File > Open > [Template Document]
```

### Step 3: Run ANN_AutoFill.jsx
```
File > Scripts > Other Scripts > ANN_AutoFill.jsx
```

### Step 4: Review Output
- Check `04_Output/ANN_Epaper_*.pdf` for published paper
- Check `08_Logs/ANN_Execution_*.log` for issues

---

## Error Handling & Recovery

### Missing Frames
**Problem:** Frame name in JSON doesn't exist in InDesign layout
**Solution:** 
1. Check frame names in InDesign
2. Update JSON to match frame names
3. Re-run script

### Missing Images
**Problem:** Image file path doesn't exist
**Solution:**
1. Check image download in `02_Images/`
2. Verify image URLs in WordPress fetch
3. Re-run Python engine

### Missing Styles
**Problem:** Style name in JSON doesn't exist in InDesign
**Solution:**
1. Create missing paragraph/object styles in InDesign
2. Update JSON with correct style names
3. Re-run script

### JSON Errors
**Problem:** JSON parsing fails
**Solution:**
1. Validate JSON in `01_Data/edition.json`
2. Check for syntax errors
3. Verify file encoding (UTF-8)

---

## Production Checklist

- [x] No TODO comments
- [x] No placeholder code
- [x] Comprehensive error handling
- [x] Modular function design
- [x] Integrated logging
- [x] Production-ready settings (300 DPI, CMYK)
- [x] File path validation
- [x] Directory auto-creation
- [x] Timestamped output files
- [x] Graceful failure handling
- [x] Console logging
- [x] Detailed execution logs
- [x] No external dependencies

---

## Performance

**Typical Execution Time:**
- Single page: 2-3 seconds
- 4-page edition: 8-12 seconds
- Includes: frame detection, content filling, image scaling, PDF export, logging

**Memory Usage:**
- Minimal (InDesign-dependent)
- No large temporary files
- PDF generation handled by InDesign

---

## Dependencies

- Adobe InDesign CC 2019 or later
- ExtendScript support enabled
- Python backend (for generating edition.json)
- File system access (read/write to 01_Data, 02_Images, 04_Output, 08_Logs)

---

## Troubleshooting

### Script Won't Run
- Ensure InDesign document is open
- Check file permissions
- Verify script path is correct

### Frames Not Found
- Verify frame names in InDesign match JSON exactly
- Check frame visibility (hidden frames won't be found)
- Ensure frames are on correct pages

### PDF Export Fails
- Check disk space in 04_Output/
- Verify write permissions
- Check for locked files

### Styles Not Applied
- Confirm styles exist in InDesign document
- Check style names match JSON exactly
- Verify styles are not locked

---

## Version History

**v1.0 - Sprint 8 (Production Release)**
- ✅ ANN_AutoFill.jsx - Production ready
- ✅ export_pdf.jsx - 300 DPI, CMYK settings
- ✅ logger.jsx - Comprehensive logging
- ✅ Full modular architecture
- ✅ Complete error handling
- ✅ Production deployment ready

---

## Support

For issues or questions:
1. Check `08_Logs/` for execution details
2. Review error messages in InDesign console
3. Verify JSON structure in `01_Data/edition.json`
4. Confirm InDesign frame names match JSON

---

**ANN Publisher v1.0 | Sprint 8 Complete**
