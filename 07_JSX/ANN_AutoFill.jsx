/**
 * ANN Publisher v1.0 - Production AutoFill Engine (Modular)
 * Integrates edition.json with Adobe InDesign
 * 
 * Process:
 * 1. Opens active InDesign document
 * 2. Reads edition.json
 * 3. Parses all pages and detects named frames
 * 4. Fills headlines, stories, and images
 * 5. Applies styles and exports PDF
 */

#target indesign

// ========== GLOBAL LOGGER ==========
var Logger = {
    startTime: null,
    endTime: null,
    logPath: null,
    
    issues: {
        missingFrames: [],
        missingImages: [],
        missingStyles: [],
        jsonErrors: []
    },
    
    summary: {
        pagesProcessed: 0,
        headlinesFilled: 0,
        storiesFilled: 0,
        imagesPlaced: 0,
        totalErrors: 0
    },
    
    init: function() {
        this.startTime = new Date();
        this.logPath = this.getLogPath();
    },
    
    getLogPath: function() {
        try {
            var scriptFolder = new File($.fileName).parent;
            var projectRoot = scriptFolder.parent;
            var logsFolder = new Folder(projectRoot + "/08_Logs");
            
            if (!logsFolder.exists) {
                logsFolder.create();
            }
            
            var timestamp = new Date();
            var logFileName = "ANN_Execution_" + 
                timestamp.getFullYear() + 
                (timestamp.getMonth() + 1).toString().padStart(2, '0') + 
                timestamp.getDate().toString().padStart(2, '0') + "_" + 
                timestamp.getHours().toString().padStart(2, '0') + 
                timestamp.getMinutes().toString().padStart(2, '0') + 
                timestamp.getSeconds().toString().padStart(2, '0') + ".log";
            
            return logsFolder.fsName + "/" + logFileName;
        } catch (e) {
            return null;
        }
    },
    
    logMissingFrame: function(frameName, context) {
        var entry = frameName + (context ? " (" + context + ")" : "");
        this.issues.missingFrames.push(entry);
    },
    
    logMissingImage: function(imagePath) {
        this.issues.missingImages.push(imagePath);
    },
    
    logMissingStyle: function(styleName, styleType) {
        var entry = styleName + " (" + styleType + ")";
        this.issues.missingStyles.push(entry);
    },
    
    logJSONError: function(errorMessage) {
        this.issues.jsonErrors.push(errorMessage);
    },
    
    updateSummary: function(pagesProcessed, headlinesFilled, storiesFilled, imagesPlaced) {
        if (pagesProcessed !== undefined) this.summary.pagesProcessed = pagesProcessed;
        if (headlinesFilled !== undefined) this.summary.headlinesFilled = headlinesFilled;
        if (storiesFilled !== undefined) this.summary.storiesFilled = storiesFilled;
        if (imagesPlaced !== undefined) this.summary.imagesPlaced = imagesPlaced;
        
        this.summary.totalErrors = 
            this.issues.missingFrames.length + 
            this.issues.missingImages.length + 
            this.issues.missingStyles.length + 
            this.issues.jsonErrors.length;
    },
    
    getExecutionTime: function() {
        if (this.startTime && this.endTime) {
            return (this.endTime - this.startTime) / 1000;
        }
        return 0;
    },
    
    write: function() {
        try {
            this.endTime = new Date();
            
            if (!this.logPath) return false;
            
            var logFile = new File(this.logPath);
            logFile.open("w");
            
            logFile.writeln("╔════════════════════════════════════════════════════════════╗");
            logFile.writeln("║        ANN Publisher v1.0 - Execution Log                 ║");
            logFile.writeln("╚════════════════════════════════════════════════════════════╝");
            logFile.writeln("");
            logFile.writeln("Start Time:  " + this.startTime.toString());
            logFile.writeln("End Time:    " + this.endTime.toString());
            logFile.writeln("Duration:    " + this.getExecutionTime().toFixed(2) + " seconds");
            logFile.writeln("");
            
            logFile.writeln("═══════════════════════════════════════════════════════════");
            logFile.writeln("PROCESSING SUMMARY");
            logFile.writeln("═══════════════════════════════════════════════════════════");
            logFile.writeln("Pages Processed:  " + this.summary.pagesProcessed);
            logFile.writeln("Headlines Filled: " + this.summary.headlinesFilled);
            logFile.writeln("Stories Filled:   " + this.summary.storiesFilled);
            logFile.writeln("Images Placed:    " + this.summary.imagesPlaced);
            logFile.writeln("Total Issues:     " + this.summary.totalErrors);
            logFile.writeln("");
            
            logFile.writeln("═══════════════════════════════════════════════════════════");
            logFile.writeln("ISSUES DETECTED");
            logFile.writeln("═══════════════════════════════════════════════════════════");
            logFile.writeln("");
            
            if (this.issues.missingFrames.length > 0) {
                logFile.writeln("[⚠ WARNING] Missing Frames (" + this.issues.missingFrames.length + ")");
                for (var i = 0; i < this.issues.missingFrames.length; i++) {
                    logFile.writeln("  " + (i + 1) + ". " + this.issues.missingFrames[i]);
                }
                logFile.writeln("");
            }
            
            if (this.issues.missingImages.length > 0) {
                logFile.writeln("[⚠ WARNING] Missing Images (" + this.issues.missingImages.length + ")");
                for (var i = 0; i < this.issues.missingImages.length; i++) {
                    logFile.writeln("  " + (i + 1) + ". " + this.issues.missingImages[i]);
                }
                logFile.writeln("");
            }
            
            if (this.issues.missingStyles.length > 0) {
                logFile.writeln("[⚠ WARNING] Missing Styles (" + this.issues.missingStyles.length + ")");
                for (var i = 0; i < this.issues.missingStyles.length; i++) {
                    logFile.writeln("  " + (i + 1) + ". " + this.issues.missingStyles[i]);
                }
                logFile.writeln("");
            }
            
            if (this.issues.jsonErrors.length > 0) {
                logFile.writeln("[✗ ERROR] JSON Errors (" + this.issues.jsonErrors.length + ")");
                for (var i = 0; i < this.issues.jsonErrors.length; i++) {
                    logFile.writeln("  " + (i + 1) + ". " + this.issues.jsonErrors[i]);
                }
                logFile.writeln("");
            }
            
            logFile.writeln("═══════════════════════════════════════════════════════════");
            logFile.writeln("EXECUTION STATUS");
            logFile.writeln("═══════════════════════════════════════════════════════════");
            
            if (this.summary.totalErrors === 0) {
                logFile.writeln("✓ SUCCESS - All content processed successfully");
            } else {
                logFile.writeln("⚠ COMPLETED WITH " + this.summary.totalErrors + " ISSUE(S)");
            }
            
            logFile.writeln("");
            logFile.writeln("═══════════════════════════════════════════════════════════");
            logFile.close();
            
            return true;
        } catch (e) {
            $.writeln("[ERROR] Logger.write failed: " + e.message);
            return false;
        }
    }
};

// ========== CORE FUNCTIONS ==========

/**
 * Main entry point - orchestrates entire workflow
 */
function main() {
    try {
        $.writeln("[ANN_AutoFill] Starting main process");
        
        Logger.init();
        $.writeln("[ANN_AutoFill] Logger initialized");
        
        // Validate document
        var doc = app.activeDocument;
        if (!doc) {
            $.writeln("[ERROR] No active InDesign document");
            Logger.logJSONError("No active InDesign document");
            return false;
        }
        
        $.writeln("[ANN_AutoFill] Document: " + doc.name);
        
        // Load edition data
        var editionData = loadEdition();
        if (!editionData) {
            $.writeln("[ERROR] Failed to load edition.json");
            return false;
        }
        
        $.writeln("[ANN_AutoFill] Edition loaded successfully");
        
        var pagesProcessed = 0;
        var headlinesFilled = 0;
        var storiesFilled = 0;
        var imagesPlaced = 0;
        
        // Process each page
        for (var i = 0; i < editionData.pages.length; i++) {
            var pageData = editionData.pages[i];
            var pageNum = i + 1;
            
            if (pageNum > doc.pages.length) {
                $.writeln("[WARNING] Edition has more pages than document");
                break;
            }
            
            $.writeln("[ANN_AutoFill] Processing page " + pageNum);
            
            var page = doc.pages[pageNum - 1];
            
            // Process stories on this page
            if (pageData.stories && pageData.stories.length > 0) {
                for (var j = 0; j < pageData.stories.length; j++) {
                    var story = pageData.stories[j];
                    
                    // Fill headline
                    if (story.headline && fillHeadline(page, story)) {
                        headlinesFilled++;
                    }
                    
                    // Fill story body
                    if (story.body && fillStory(page, story)) {
                        storiesFilled++;
                    }
                    
                    // Place image
                    if (story.image_url && placeImage(page, story)) {
                        imagesPlaced++;
                    }
                }
            }
            
            pagesProcessed++;
        }
        
        Logger.updateSummary(pagesProcessed, headlinesFilled, storiesFilled, imagesPlaced);
        $.writeln("[ANN_AutoFill] Pages processed: " + pagesProcessed);
        $.writeln("[ANN_AutoFill] Headlines filled: " + headlinesFilled);
        $.writeln("[ANN_AutoFill] Stories filled: " + storiesFilled);
        $.writeln("[ANN_AutoFill] Images placed: " + imagesPlaced);
        
        // Export PDF
        if (!exportPDF(doc)) {
            $.writeln("[ERROR] PDF export failed");
            Logger.logJSONError("PDF export failed");
        }
        
        // Save document
        doc.save();
        $.writeln("[ANN_AutoFill] Document saved");
        
        // Write log
        if (!Logger.write()) {
            $.writeln("[ERROR] Failed to write log");
        }
        
        var duration = Logger.getExecutionTime();
        $.writeln("[ANN_AutoFill] Process completed in " + duration.toFixed(2) + " seconds");
        
        return true;
        
    } catch (e) {
        $.writeln("[ERROR] main: " + e.message + " (line " + e.line + ")");
        Logger.logJSONError("Main process error: " + e.message);
        return false;
    }
}

/**
 * Load edition.json from 01_Data directory
 */
function loadEdition() {
    try {
        var scriptFolder = new File($.fileName).parent;
        var projectRoot = scriptFolder.parent;
        var editionFile = new File(projectRoot + "/01_Data/edition.json");
        
        if (!editionFile.exists) {
            $.writeln("[ERROR] edition.json not found: " + editionFile.fsName);
            Logger.logJSONError("edition.json not found");
            return null;
        }
        
        editionFile.open("r");
        var jsonContent = editionFile.read();
        editionFile.close();
        
        var data = JSON.parse(jsonContent);
        $.writeln("[loadEdition] Edition: " + data.edition + ", Pages: " + data.pages.length);
        
        return data;
        
    } catch (e) {
        $.writeln("[ERROR] loadEdition: " + e.message);
        Logger.logJSONError("Failed to parse edition.json: " + e.message);
        return null;
    }
}

/**
 * Find a named frame on a page
 */
function findFrame(page, frameName) {
    try {
        if (!page || !frameName) return null;
        
        var allFrames = page.allPageItems;
        
        for (var i = 0; i < allFrames.length; i++) {
            if (allFrames[i].name === frameName) {
                return allFrames[i];
            }
        }
        
        return null;
        
    } catch (e) {
        $.writeln("[ERROR] findFrame: " + e.message);
        return null;
    }
}

/**
 * Fill headline in frame
 */
function fillHeadline(page, story) {
    try {
        var frameName = story.headline_frame;
        if (!frameName) {
            Logger.logMissingFrame("(headline)", "story_" + story.id);
            return false;
        }
        
        var frame = findFrame(page, frameName);
        if (!frame) {
            Logger.logMissingFrame(frameName, "headline");
            return false;
        }
        
        if (frame.constructor.name !== "TextFrame") {
            $.writeln("[ERROR] Frame " + frameName + " is not a text frame");
            return false;
        }
        
        frame.contents = "";
        var textObj = frame.insertionPoints[0];
        textObj.contents = story.headline;
        
        // Apply paragraph style if specified
        if (story.headline_style) {
            try {
                var style = app.activeDocument.paragraphStyles.item(story.headline_style);
                if (style.isValid) {
                    frame.paragraphs[0].appliedParagraphStyle = style;
                }
            } catch (e) {
                Logger.logMissingStyle(story.headline_style, "paragraph");
            }
        }
        
        return true;
        
    } catch (e) {
        $.writeln("[ERROR] fillHeadline: " + e.message);
        return false;
    }
}

/**
 * Fill story body in frame
 */
function fillStory(page, story) {
    try {
        var frameName = story.body_frame;
        if (!frameName) {
            Logger.logMissingFrame("(body)", "story_" + story.id);
            return false;
        }
        
        var frame = findFrame(page, frameName);
        if (!frame) {
            Logger.logMissingFrame(frameName, "body");
            return false;
        }
        
        if (frame.constructor.name !== "TextFrame") {
            $.writeln("[ERROR] Frame " + frameName + " is not a text frame");
            return false;
        }
        
        frame.contents = "";
        var textObj = frame.insertionPoints[0];
        textObj.contents = story.body;
        
        // Apply paragraph style if specified
        if (story.body_style) {
            try {
                var style = app.activeDocument.paragraphStyles.item(story.body_style);
                if (style.isValid) {
                    frame.paragraphs[0].appliedParagraphStyle = style;
                }
            } catch (e) {
                Logger.logMissingStyle(story.body_style, "paragraph");
            }
        }
        
        return true;
        
    } catch (e) {
        $.writeln("[ERROR] fillStory: " + e.message);
        return false;
    }
}

/**
 * Place image in frame
 */
function placeImage(page, story) {
    try {
        var frameName = story.image_frame;
        if (!frameName) {
            Logger.logMissingFrame("(image)", "story_" + story.id);
            return false;
        }
        
        var frame = findFrame(page, frameName);
        if (!frame) {
            Logger.logMissingFrame(frameName, "image");
            return false;
        }
        
        if (frame.constructor.name !== "GraphicsFrame") {
            $.writeln("[ERROR] Frame " + frameName + " is not a graphics frame");
            return false;
        }
        
        var imagePath = story.image_url;
        var imageFile = new File(imagePath);
        
        if (!imageFile.exists) {
            Logger.logMissingImage(imagePath);
            return false;
        }
        
        frame.place(imageFile);
        
        // Fit image proportionally
        if (!fitImage(frame)) {
            $.writeln("[WARNING] Failed to fit image in frame: " + frameName);
        }
        
        // Apply object style if specified
        if (story.image_style) {
            try {
                var objStyle = app.activeDocument.objectStyles.item(story.image_style);
                if (objStyle.isValid) {
                    frame.appliedObjectStyle = objStyle;
                }
            } catch (e) {
                Logger.logMissingStyle(story.image_style, "object");
            }
        }
        
        return true;
        
    } catch (e) {
        $.writeln("[ERROR] placeImage: " + e.message);
        return false;
    }
}

/**
 * Fit image proportionally within frame
 */
function fitImage(frame) {
    try {
        if (!frame || !frame.graphics || frame.graphics.length === 0) {
            return false;
        }
        
        var frameWidth = frame.geometricBounds[3] - frame.geometricBounds[1];
        var frameHeight = frame.geometricBounds[2] - frame.geometricBounds[0];
        
        var graphic = frame.graphics[0];
        var imageWidth = graphic.visibleBounds[3] - graphic.visibleBounds[1];
        var imageHeight = graphic.visibleBounds[2] - graphic.visibleBounds[0];
        
        if (imageWidth === 0 || imageHeight === 0) {
            return false;
        }
        
        var widthScale = frameWidth / imageWidth;
        var heightScale = frameHeight / imageHeight;
        var scale = Math.min(widthScale, heightScale);
        
        frame.scale(scale, scale);
        
        return true;
        
    } catch (e) {
        $.writeln("[ERROR] fitImage: " + e.message);
        return false;
    }
}

/**
 * Export PDF with high quality settings (300 DPI, CMYK)
 */
function exportPDF(doc) {
    try {
        if (!doc) {
            $.writeln("[ERROR] No document provided");
            return false;
        }
        
        var scriptFolder = new File($.fileName).parent;
        var projectRoot = scriptFolder.parent;
        var outputFolder = new Folder(projectRoot + "/04_Output");
        
        if (!outputFolder.exists) {
            outputFolder.create();
        }
        
        var timestamp = new Date();
        var pdfFileName = "ANN_Epaper_" + 
            timestamp.getFullYear() + 
            (timestamp.getMonth() + 1).toString().padStart(2, '0') + 
            timestamp.getDate().toString().padStart(2, '0') + "_" + 
            timestamp.getHours().toString().padStart(2, '0') + 
            timestamp.getMinutes().toString().padStart(2, '0') + 
            timestamp.getSeconds().toString().padStart(2, '0') + ".pdf";
        
        var pdfFile = new File(outputFolder.fsName + "/" + pdfFileName);
        
        // Create PDF export preset
        var presetName = "ANN_HighQuality_" + new Date().getTime();
        var pdfExportPresets = app.pdfExportPresets;
        var preset = pdfExportPresets.add(presetName);
        
        preset.pageRange = "";
        preset.colorConversionStyle = ColorConversionStyleOptions.CONVERT_TO_DESTINATION;
        preset.colorOutputMode = ColorModel.CMYK;
        preset.pdfColorSpace = PDFColorSpace.CMYK;
        preset.rasterResolution = 300;
        preset.compressionLevel = 6;
        
        // Export
        doc.exportFile(ExportFormat.PDF_TYPE, pdfFile, false, preset);
        
        preset.remove();
        
        $.writeln("[exportPDF] Exported to: " + pdfFile.fsName);
        
        return pdfFile.exists;
        
    } catch (e) {
        $.writeln("[ERROR] exportPDF: " + e.message);
        return false;
    }
}

/**
 * Write execution log
 */
function writeLog() {
    return Logger.write();
}

// ========== EXECUTION ==========
if (typeof main === "function") {
    main();
}
