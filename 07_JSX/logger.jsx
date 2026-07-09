/**
 * ANN Publisher v1.0 - Execution Logger
 * 
 * Logs:
 * - Missing Frames
 * - Missing Images
 * - Missing Styles
 * - JSON Errors
 * - Execution Time
 * - Processing Summary
 */

#target indesign

/**
 * Logger object for tracking execution
 */
var Logger = {
    
    startTime: null,
    endTime: null,
    logFile: null,
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
    
    /**
     * Initialize logger
     */
    init: function() {
        this.startTime = new Date();
        this.logPath = this.getLogPath();
        $.writeln("[Logger] Initialized at " + this.startTime.toString());
        $.writeln("[Logger] Log file: " + this.logPath);
    },
    
    /**
     * Get log file path
     */
    getLogPath: function() {
        try {
            var scriptFolder = new File($.fileName).parent;
            var projectRoot = scriptFolder.parent;
            var logsFolder = new Folder(projectRoot + "/08_Logs");
            
            if (!logsFolder.exists) {
                logsFolder.create();
                $.writeln("[Logger] Created logs folder: " + logsFolder.fsName);
            }
            
            var timestamp = new Date();
            var year = timestamp.getFullYear();
            var month = (timestamp.getMonth() + 1).toString().padStart(2, '0');
            var day = timestamp.getDate().toString().padStart(2, '0');
            var hours = timestamp.getHours().toString().padStart(2, '0');
            var minutes = timestamp.getMinutes().toString().padStart(2, '0');
            var seconds = timestamp.getSeconds().toString().padStart(2, '0');
            
            var logFileName = "ANN_Execution_" + year + month + day + "_" + hours + minutes + seconds + ".log";
            var logFilePath = logsFolder.fsName + "/" + logFileName;
            
            return logFilePath;
            
        } catch (e) {
            $.writeln("[ERROR] getLogPath failed: " + e.message);
            return null;
        }
    },
    
    /**
     * Log missing frame
     */
    logMissingFrame: function(frameName, context) {
        var entry = frameName;
        if (context) {
            entry += " (Context: " + context + ")";
        }
        this.issues.missingFrames.push(entry);
        $.writeln("[WARNING] Missing frame: " + entry);
    },
    
    /**
     * Log missing image
     */
    logMissingImage: function(imagePath, context) {
        var entry = imagePath;
        if (context) {
            entry += " (Story: " + context + ")";
        }
        this.issues.missingImages.push(entry);
        $.writeln("[WARNING] Missing image: " + entry);
    },
    
    /**
     * Log missing style
     */
    logMissingStyle: function(styleName, styleType, context) {
        var entry = styleName + " (" + styleType + ")";
        if (context) {
            entry += " [" + context + "]";
        }
        this.issues.missingStyles.push(entry);
        $.writeln("[WARNING] Missing style: " + entry);
    },
    
    /**
     * Log JSON error
     */
    logJSONError: function(errorMessage, errorCode) {
        var entry = errorMessage;
        if (errorCode) {
            entry += " (Code: " + errorCode + ")";
        }
        this.issues.jsonErrors.push(entry);
        $.writeln("[ERROR] JSON error: " + entry);
    },
    
    /**
     * Update processing summary
     */
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
    
    /**
     * Get execution time in seconds
     */
    getExecutionTime: function() {
        if (this.startTime && this.endTime) {
            return (this.endTime - this.startTime) / 1000;
        }
        return 0;
    },
    
    /**
     * Write log file
     */
    write: function() {
        try {
            this.endTime = new Date();
            
            if (!this.logPath) {
                $.writeln("[ERROR] Log path not set");
                return false;
            }
            
            var logFile = new File(this.logPath);
            
            logFile.open("w");
            
            // Header
            logFile.writeln("╔════════════════════════════════════════════════════════════╗");
            logFile.writeln("║        ANN Publisher v1.0 - Execution Log                 ║");
            logFile.writeln("║        Automatic Newspaper Publishing System              ║");
            logFile.writeln("╚════════════════════════════════════════════════════════════╝");
            logFile.writeln("");
            
            // Timestamp
            logFile.writeln("Execution Date: " + this.startTime.toString());
            logFile.writeln("Completion Date: " + this.endTime.toString());
            logFile.writeln("Execution Time: " + this.getExecutionTime().toFixed(2) + " seconds");
            logFile.writeln("");
            
            // Processing Summary
            logFile.writeln("═══════════════════════════════════════════════════════════");
            logFile.writeln("PROCESSING SUMMARY");
            logFile.writeln("═══════════════════════════════════════════════════════════");
            logFile.writeln("Pages Processed:      " + this.summary.pagesProcessed);
            logFile.writeln("Headlines Filled:     " + this.summary.headlinesFilled);
            logFile.writeln("Stories Filled:       " + this.summary.storiesFilled);
            logFile.writeln("Images Placed:        " + this.summary.imagesPlaced);
            logFile.writeln("Total Issues:         " + this.summary.totalErrors);
            logFile.writeln("");
            
            // Issues Section
            logFile.writeln("═══════════════════════════════════════════════════════════");
            logFile.writeln("ISSUES DETECTED");
            logFile.writeln("═══════════════════════════════════════════════════════════");
            logFile.writeln("");
            
            // Missing Frames
            if (this.issues.missingFrames.length > 0) {
                logFile.writeln("[⚠ WARNING] Missing Frames (" + this.issues.missingFrames.length + " issues)");
                logFile.writeln("─────────────────────────────────────────────────────────");
                for (var i = 0; i < this.issues.missingFrames.length; i++) {
                    logFile.writeln("  " + (i + 1) + ". " + this.issues.missingFrames[i]);
                }
                logFile.writeln("");
            }
            
            // Missing Images
            if (this.issues.missingImages.length > 0) {
                logFile.writeln("[⚠ WARNING] Missing Images (" + this.issues.missingImages.length + " issues)");
                logFile.writeln("─────────────────────────────────────────────────────────");
                for (var i = 0; i < this.issues.missingImages.length; i++) {
                    logFile.writeln("  " + (i + 1) + ". " + this.issues.missingImages[i]);
                }
                logFile.writeln("");
            }
            
            // Missing Styles
            if (this.issues.missingStyles.length > 0) {
                logFile.writeln("[⚠ WARNING] Missing Styles (" + this.issues.missingStyles.length + " issues)");
                logFile.writeln("─────────────────────────────────────────────────────────");
                for (var i = 0; i < this.issues.missingStyles.length; i++) {
                    logFile.writeln("  " + (i + 1) + ". " + this.issues.missingStyles[i]);
                }
                logFile.writeln("");
            }
            
            // JSON Errors
            if (this.issues.jsonErrors.length > 0) {
                logFile.writeln("[✗ ERROR] JSON Errors (" + this.issues.jsonErrors.length + " issues)");
                logFile.writeln("─────────────────────────────────────────────────────────");
                for (var i = 0; i < this.issues.jsonErrors.length; i++) {
                    logFile.writeln("  " + (i + 1) + ". " + this.issues.jsonErrors[i]);
                }
                logFile.writeln("");
            }
            
            // Status
            logFile.writeln("═══════════════════════════════════════════════════════════");
            logFile.writeln("EXECUTION STATUS");
            logFile.writeln("═══════════════════════════════════════════════════════════");
            
            if (this.summary.totalErrors === 0) {
                logFile.writeln("✓ SUCCESS - No issues detected");
                logFile.writeln("  All content processed and exported successfully");
            } else {
                logFile.writeln("⚠ COMPLETED WITH WARNINGS");
                logFile.writeln("  Total issues: " + this.summary.totalErrors);
                logFile.writeln("  Review details above for remediation");
            }
            
            logFile.writeln("");
            logFile.writeln("═══════════════════════════════════════════════════════════");
            logFile.writeln("End of Log");
            logFile.writeln("═══════════════════════════════════════════════════════════");
            
            logFile.close();
            
            $.writeln("[Logger] Log file written: " + this.logPath);
            $.writeln("[Logger] Total issues: " + this.summary.totalErrors);
            
            return true;
            
        } catch (e) {
            $.writeln("[ERROR] write failed: " + e.message);
            return false;
        }
    },
    
    /**
     * Get detailed report
     */
    getReport: function() {
        var report = {
            timestamp: this.startTime.toString(),
            executionTime: this.getExecutionTime(),
            summary: this.summary,
            issues: this.issues
        };
        return report;
    },
    
    /**
     * Print report to console
     */
    printReport: function() {
        $.writeln("");
        $.writeln("╔════════════════════════════════════════════════════════════╗");
        $.writeln("║                    EXECUTION REPORT                        ║");
        $.writeln("╚════════════════════════════════════════════════════════════╝");
        $.writeln("Start Time: " + this.startTime.toString());
        $.writeln("End Time:   " + this.endTime.toString());
        $.writeln("Duration:   " + this.getExecutionTime().toFixed(2) + " seconds");
        $.writeln("");
        $.writeln("Pages Processed:  " + this.summary.pagesProcessed);
        $.writeln("Headlines Filled: " + this.summary.headlinesFilled);
        $.writeln("Stories Filled:   " + this.summary.storiesFilled);
        $.writeln("Images Placed:    " + this.summary.imagesPlaced);
        $.writeln("");
        $.writeln("Missing Frames:   " + this.issues.missingFrames.length);
        $.writeln("Missing Images:   " + this.issues.missingImages.length);
        $.writeln("Missing Styles:   " + this.issues.missingStyles.length);
        $.writeln("JSON Errors:      " + this.issues.jsonErrors.length);
        $.writeln("Total Issues:     " + this.summary.totalErrors);
        $.writeln("");
        
        if (this.summary.totalErrors === 0) {
            $.writeln("✓ EXECUTION SUCCESSFUL");
        } else {
            $.writeln("⚠ EXECUTION COMPLETED WITH " + this.summary.totalErrors + " ISSUE(S)");
        }
        $.writeln("");
    },
    
    /**
     * Reset logger
     */
    reset: function() {
        this.startTime = null;
        this.endTime = null;
        this.logFile = null;
        this.logPath = null;
        this.issues = {
            missingFrames: [],
            missingImages: [],
            missingStyles: [],
            jsonErrors: []
        };
        this.summary = {
            pagesProcessed: 0,
            headlinesFilled: 0,
            storiesFilled: 0,
            imagesPlaced: 0,
            totalErrors: 0
        };
        $.writeln("[Logger] Reset to initial state");
    }
};

// Export Logger object for use in other scripts
// Usage: #include "logger.jsx"
// Then call: Logger.init(), Logger.logMissingFrame(), Logger.write()
