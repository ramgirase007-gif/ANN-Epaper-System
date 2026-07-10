/**
 * ANN Publisher v1.0 - Integration Test
 * 
 * Purpose:
 *   Runs all four Sprint 9 modules together in sequence.
 *   Loads edition.json, scans frames, builds mappings, fills stories.
 *   Provides progress alerts and comprehensive final report.
 * 
 * Compatibility:
 *   - Adobe InDesign 2026
 *   - ExtendScript (ES3)
 *   - No modern JavaScript features
 *   - No JSON.parse, Object.keys, Array.isArray, forEach
 * 
 * Module Execution Order:
 *   1. 01_json_loader.jsx - Load edition.json
 *   2. 02_frame_scanner.jsx - Scan pages and frames
 *   3. 03_frame_mapper.jsx - Build story-to-frame mappings
 *   4. 04_story_filler.jsx - Fill frames with story content
 * 
 * Output:
 *   - Progress alerts during execution
 *   - Final comprehensive report with statistics
 *   - Error handling at each step
 * 
 * Usage:
 *   Execute this script in Adobe InDesign 2026
 */

// ============================================================================
// Module Loading
// ============================================================================
// Load all required modules using ExtendScript
// ============================================================================
$.evalFile(File($.fileName).parent + "/01_json_loader.jsx");
$.evalFile(File($.fileName).parent + "/02_frame_scanner.jsx");
$.evalFile(File($.fileName).parent + "/03_frame_mapper.jsx");
$.evalFile(File($.fileName).parent + "/04_story_filler.jsx");

/**
 * Displays progress alert with formatted message
 * 
 * @param {string} message - Progress message to display
 * @return {void}
 */
function showProgress(message) {
    alert(message);
}

/**
 * Displays final report with comprehensive statistics
 * 
 * @param {Object} report - Report object containing all statistics
 * @return {void}
 */
function showFinalReport(report) {
    var reportText = "";
    
    reportText = reportText + "===== ANN PUBLISHER INTEGRATION TEST REPORT =====\n\n";
    
    reportText = reportText + "EDITION LOADING\n";
    reportText = reportText + "Stories Loaded: " + report.storiesLoaded + "\n\n";
    
    reportText = reportText + "FRAME SCANNING\n";
    reportText = reportText + "Frames Found: " + report.framesFound + "\n\n";
    
    reportText = reportText + "STORY MAPPING\n";
    reportText = reportText + "Stories Mapped: " + report.storiesMapped + "\n\n";
    
    reportText = reportText + "STORY FILLING\n";
    reportText = reportText + "Stories Filled: " + report.storiesFilled + " / " + report.totalStories + "\n";
    reportText = reportText + "Headlines Filled: " + report.headlinesFilled + "\n";
    reportText = reportText + "Bodies Filled: " + report.bodiesFilled + "\n";
    reportText = reportText + "Captions Filled: " + report.captionsFilled + "\n";
    reportText = reportText + "Credits Filled: " + report.creditsFilled + "\n\n";
    
    reportText = reportText + "WARNINGS AND ERRORS\n";
    reportText = reportText + "Missing Frames: " + report.missingFramesCount + "\n";
    reportText = reportText + "Overset Errors: " + report.oversetErrorsCount + "\n\n";
    
    reportText = reportText + "===== END REPORT =====";
    
    alert(reportText);
}

/**
 * Displays error report with detailed error information
 * 
 * @param {string} stepName - Name of step that failed
 * @param {string} errorMessage - Error message
 * @return {void}
 */
function showErrorReport(stepName, errorMessage) {
    alert(stepName + " FAILED\n\n" + errorMessage);
}

/**
 * Formats and displays list of error messages
 * 
 * @param {string} title - List title
 * @param {array} messages - Array of error messages
 * @return {string} - Formatted message list
 */
function formatMessageList(title, messages) {
    var text = title + "\n";
    
    if (messages.length === 0) {
        text = text + "(None)\n";
        return text;
    }
    
    for (var i = 0; i < messages.length; i++) {
        var message = messages[i];
        text = text + (i + 1) + ". " + message + "\n";
    }
    
    return text;
}

/**
 * Main integration test orchestrator
 * Executes all four modules in sequence
 * 
 * Process:
 *   STEP 1: Load edition.json
 *   STEP 2: Scan frames
 *   STEP 3: Build mappings
 *   STEP 4: Fill stories
 *   FINAL: Display comprehensive report
 * 
 * Error handling:
 *   - Validates each step's result
 *   - Displays error details on failure
 *   - Continues to next step when safe
 *   - Returns final statistics
 * 
 * @return {void}
 */
function runIntegrationTest() {
    // Initialize report object
    var report = {
        storiesLoaded: 0,
        framesFound: 0,
        storiesMapped: 0,
        totalStories: 0,
        storiesFilled: 0,
        headlinesFilled: 0,
        bodiesFilled: 0,
        captionsFilled: 0,
        creditsFilled: 0,
        missingFramesCount: 0,
        oversetErrorsCount: 0
    };
    
    var edition = null;
    var frameMap = null;
    var mappedStories = null;
    var fillStats = null;
    
    // ========================================================================
    // STEP 1: Load edition.json
    // ========================================================================
    showProgress("Loading edition.json...");
    
    try {
        edition = loadEdition();
        
        if (edition === null) {
            showErrorReport("STEP 1: LOAD EDITION", "loadEdition() returned null");
            return;
        }
        
        if (!edition || typeof edition !== "object") {
            showErrorReport("STEP 1: LOAD EDITION", "Edition is not a valid object");
            return;
        }
        
        // Count stories
        if (edition.hasOwnProperty("stories")) {
            var stories = edition.stories;
            if (stories && stories.length !== undefined) {
                report.storiesLoaded = stories.length;
            }
        }
    } catch (e) {
        showErrorReport("STEP 1: LOAD EDITION", "Exception: " + e.message);
        return;
    }
    
    // ========================================================================
    // STEP 2: Scan frames
    // ========================================================================
    showProgress("Scanning frames...");
    
    try {
        frameMap = scanFrames();
        
        if (!frameMap || frameMap.length === undefined) {
            showErrorReport("STEP 2: SCAN FRAMES", "scanFrames() returned invalid result");
            return;
        }
        
        report.framesFound = frameMap.length;
    } catch (e) {
        showErrorReport("STEP 2: SCAN FRAMES", "Exception: " + e.message);
        return;
    }
    
    // ========================================================================
    // STEP 3: Build frame mappings
    // ========================================================================
    showProgress("Building mappings...");
    
    try {
        mappedStories = buildFrameMap();
        
        if (!mappedStories || mappedStories.length === undefined) {
            showErrorReport("STEP 3: BUILD MAPPINGS", "buildFrameMap() returned invalid result");
            return;
        }
        
        report.storiesMapped = mappedStories.length;
        report.totalStories = mappedStories.length;
    } catch (e) {
        showErrorReport("STEP 3: BUILD MAPPINGS", "Exception: " + e.message);
        return;
    }
    
    // ========================================================================
    // STEP 4: Fill stories
    // ========================================================================
    showProgress("Filling stories...");
    
    try {
        fillStats = fillStories(mappedStories);
        
        if (!fillStats || typeof fillStats !== "object") {
            showErrorReport("STEP 4: FILL STORIES", "fillStories() returned invalid result");
            return;
        }
        
        // Extract statistics
        report.storiesFilled = fillStats.filledStories;
        report.headlinesFilled = fillStats.headlinesFilled;
        report.bodiesFilled = fillStats.bodiesFilled;
        report.captionsFilled = fillStats.captionsFilled;
        report.creditsFilled = fillStats.creditsFilled;
        
        // Count errors
        if (fillStats.missingFrames && fillStats.missingFrames.length !== undefined) {
            report.missingFramesCount = fillStats.missingFrames.length;
        }
        
        if (fillStats.oversetErrors && fillStats.oversetErrors.length !== undefined) {
            report.oversetErrorsCount = fillStats.oversetErrors.length;
        }
    } catch (e) {
        showErrorReport("STEP 4: FILL STORIES", "Exception: " + e.message);
        return;
    }
    
    // ========================================================================
    // Display final report
    // ========================================================================
    showProgress("Completed.");
    showFinalReport(report);
    
    // ========================================================================
    // Display detailed error logs if any
    // ========================================================================
    if (fillStats && fillStats.missingFrames && fillStats.missingFrames.length > 0) {
        var missingText = formatMessageList("MISSING FRAMES:", fillStats.missingFrames);
        alert(missingText);
    }
    
    if (fillStats && fillStats.oversetErrors && fillStats.oversetErrors.length > 0) {
        var oversetText = formatMessageList("OVERSET ERRORS:", fillStats.oversetErrors);
        alert(oversetText);
    }
}

// ============================================================================
// Script Entry Point
// ============================================================================
// Execute integration test immediately when script is run
// ============================================================================
runIntegrationTest();
